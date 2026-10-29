/**
 * @file Convert symbol maps, apply decoration rules, resolve autotiles, and draw tile data.
 */
( function( b8 ) {

	/**
	 * A collection of functions for working with tilemaps.
	 * The tilemaps are created with the b8 Tilemap Editor.
	 *
	 * The tilemap format is a multi-dimensional array of arrays.
	 * The tile array is in the format:
	 * [0] = tile character code.
	 * [1] = foreground color code.
	 * [2] = background color code.
	 * [3] = collision flag.
	 * [4] = additional data.
	 * [5] = autotile connectivity mask (north=1, east=2, south=4, west=8),
	 *       or null for ordinary tiles. Zero means an isolated autotile.
	 * [6] = autotile definition and colour overrides, or null for ordinary tiles.
	 * setTile updates connectivity and artwork for the edited cell and neighbours.
	 */
	b8.Tilemap = {};

	b8.Tilemap.MAP_CHAR = 0;
	b8.Tilemap.MAP_FG = 1;
	b8.Tilemap.MAP_BG = 2;
	b8.Tilemap.MAP_COLLISION = 3;
	b8.Tilemap.MAP_DATA = 4;
	// Connected neighbours, independent of the game's collision rules.
	b8.Tilemap.MAP_AUTOTILE_MASK = 5;
	// Retain autotile identity after its character has been resolved to artwork.
	b8.Tilemap.MAP_AUTOTILE = 6;

	/**
	 * Direction bits for autotile connectivity and exposed-edge checks.
	 * Combine directions with | to check several sides at once.
	 * @type {Readonly<{N: number, E: number, S: number, W: number}>}
	 */
	b8.Tilemap.AUTOTILE_DIRECTION = Object.freeze( { N: 1, E: 2, S: 4, W: 8 } );


	/**
	 * Checks whether an autotile connects to neighbours in all requested directions.
	 * Ordinary tiles, including older tiles without a mask, return false.
	 *
	 * @param {Array} tile - A tile array from the tilemap.
	 * @param {number} direction - One or more AUTOTILE_DIRECTION bits (1–15).
	 * @returns {boolean} Whether every requested side has a connected neighbour.
	 */
	b8.Tilemap.hasAutotileConnection = function( tile, direction ) {

		b8.Utilities.checkArray( "tile", tile );
		b8.Utilities.checkInt( "direction", direction, 1, 15 );

		const mask = tile[ b8.Tilemap.MAP_AUTOTILE_MASK ];
		// Do not let JavaScript treat a missing mask as an isolated autotile.
		return mask !== null && mask !== undefined && ( mask & direction ) === direction;

	};


	/**
	 * Checks whether an autotile has exposed edges in all requested directions.
	 * An exposed edge has no connected neighbour; this does not imply collision.
	 * Ordinary tiles, including older tiles without a mask, return false.
	 *
	 * @param {Array} tile - A tile array from the tilemap.
	 * @param {number} direction - One or more AUTOTILE_DIRECTION bits (1–15).
	 * @returns {boolean} Whether every requested side is exposed.
	 */
	b8.Tilemap.hasAutotileEdge = function( tile, direction ) {

		b8.Utilities.checkArray( "tile", tile );
		b8.Utilities.checkInt( "direction", direction, 1, 15 );

		const mask = tile[ b8.Tilemap.MAP_AUTOTILE_MASK ];
		// A zero mask is an autotile with four exposed edges, unlike null or undefined.
		return mask !== null && mask !== undefined && ( mask & direction ) === 0;

	};

	const WATER_TILES = [ 1, 188, 206 ];


	/**
	 * Read an autotile identity, accepting wall: as a compatibility alias.
	 * Canonical identities let mixed prefixes and previously saved maps connect.
	 * Other special types, such as vfx:, remain outside autotile handling.
	 *
	 * @param {*} value A tile ID or a stored autotile identity.
	 * @returns {string|null} The canonical auto:name identity, or null.
	 */
	function autotileType_( value ) {
		if ( typeof value !== 'string' ) return null;
		if ( value.startsWith( 'auto:' ) ) return value;
		if ( value.startsWith( 'wall:' ) ) return 'auto:' + value.substring( 5 );
		return null;
	}


	// Define a mapping from bitmask value to your desired tile name or index.
	const autotileSets = {
		'solid': {
			tiles: {
				0: 1,  // wall_isolated.
				1: 1,  // wall_end_bottom.
				2: 1,  // wall_end_right.
				3: 36,  // wall_corner_bottomLeft.
				4: 1,  // wall_end_top.
				5: 1,  // wall_vertical.
				6: 18,  // wall_corner_topLeft.
				7: 1,  // wall_t_right.
				8: 1,  // wall_end_left.
				9: 37,  // wall_corner_bottomRight.
				10: 1, // wall_horizontal.
				11: 1, // wall_t_bottom.
				12: 19, // wall_corner_topRight.
				13: 1, // wall_t_left.
				14: 1, // wall_t_top.
				15: 1  // wall_cross.
			}
		},
		'rounded': {
			tiles: {
				0: 1,  // wall_isolated.
				1: 42,  // wall_end_bottom.
				2: 23,  // wall_end_right.
				3: 36,  // wall_corner_bottomLeft.
				4: 41,  // wall_end_top.
				5: 1,  // wall_vertical.
				6: 18,  // wall_corner_topLeft.
				7: 1,  // wall_t_right.
				8: 24,  // wall_end_left.
				9: 37,  // wall_corner_bottomRight.
				10: 1, // wall_horizontal.
				11: 1, // wall_t_bottom.
				12: 19, // wall_corner_topRight.
				13: 1, // wall_t_left.
				14: 1, // wall_t_top.
				15: 1  // wall_cross.
			}
		},
		'half': {
			tiles: {
				0: 128,  // wall_isolated.
				1: 75,  // wall_end_bottom.
				2: 58,  // wall_end_right.
				3: 93,  // wall_corner_bottomLeft.
				4: 75,  // wall_end_top.
				5: 75,  // wall_vertical.
				6: 57,  // wall_corner_topLeft.
				7: 129,  // wall_t_right.
				8: 58,  // wall_end_left.
				9: 95,  // wall_corner_bottomRight.
				10: 58, // wall_horizontal.
				11: 111, // wall_t_bottom.
				12: 59, // wall_corner_topRight.
				13: 130, // wall_t_left.
				14: 112, // wall_t_top.
				15: 113  // wall_cross.
			}
		},
		'half_rounded': {
			tiles: {
				0: 128,  // wall_isolated.
				1: 148,  // wall_end_bottom.
				2: 166,  // wall_end_left.
				3: 93,  // wall_corner_bottomLeft.
				4: 149,  // wall_end_top.
				5: 75,  // wall_vertical.
				6: 57,  // wall_corner_topLeft.
				7: 129,  // wall_t_right.
				8: 167,  // wall_end_right.
				9: 95,  // wall_corner_bottomRight.
				10: 58, // wall_horizontal.
				11: 111, // wall_t_bottom.
				12: 59, // wall_corner_topRight.
				13: 130, // wall_t_left.
				14: 112, // wall_t_top.
				15: 113  // wall_cross.
			}
		},
		'pipe': {
			tiles: {
				0: 128,  // wall_isolated.
				1: 148,  // wall_end_bottom.
				2: 166,  // wall_end_left.
				3: 93,  // wall_corner_bottomLeft.
				4: 149,  // wall_end_top.
				5: [ 75, 77 ],  // wall_vertical.
				6: 57,  // wall_corner_topLeft.
				7: 129,  // wall_t_right.
				8: 167,  // wall_end_right.
				9: 95,  // wall_corner_bottomRight.
				10: [ 58, 94 ], // wall_horizontal.
				11: 111, // wall_t_bottom.
				12: 59, // wall_corner_topRight.
				13: 130, // wall_t_left.
				14: 112, // wall_t_top.
				15: [ 113, 131, 76 ]  // wall_cross.
			}
		},
		'thin': {
			tiles: {
				0: 110,  // wall_isolated.
				1: 173,  // wall_end_bottom.
				2: 172,  // wall_end_left.
				3: 164,  // wall_corner_bottomLeft.
				4: 154,  // wall_end_top.
				5: 72,  // wall_vertical.
				6: 146,  // wall_corner_topLeft.
				7: 126,  // wall_t_right.
				8: 155,  // wall_end_right.
				9: 165,  // wall_corner_bottomRight.
				10: 55, // wall_horizontal.
				11: 108, // wall_t_bottom.
				12: 147, // wall_corner_topRight.
				13: 127, // wall_t_left.
				14: 109, // wall_t_top.
				15: 73  // wall_cross.
			}
		},
		'barrier': {
			tiles: {
				0: 511,  // wall_isolated.
				1: 493,  // wall_end_bottom.
				2: 508,  // wall_end_left.
				3: 490,  // wall_corner_bottomLeft.
				4: 457,  // wall_end_top.
				5: 475,  // wall_vertical.
				6: 454,  // wall_corner_topLeft.
				7: 472,  // wall_t_right.
				8: 510,  // wall_end_right.
				9: 492,  // wall_corner_bottomRight.
				10: 509, // wall_horizontal.
				11: 491, // wall_t_bottom.
				12: 456, // wall_corner_topRight.
				13: 474, // wall_t_left.
				14: 455, // wall_t_top.
				15: 473  // wall_cross.
			}
		},
		'water': {
			edgeMode: "connect",
			tiles: {
				0: 519,  // wall_isolated.
				1: 532,  // wall_end_bottom.
				2: 535,  // wall_end_left.
				3: [ 36, 178 ],  // wall_corner_bottomLeft.
				4: 514,  // wall_end_top.
				5: WATER_TILES,  // wall_vertical.
				6: [ 18, 160 ],  // wall_corner_topLeft.
				7: WATER_TILES,  // wall_t_right.
				8: 536,  // wall_end_right.
				9: [ 37, 179 ],  // wall_corner_bottomRight.
				10: WATER_TILES, // wall_horizontal.
				11: WATER_TILES, // wall_t_bottom.
				12: [ 19, 161 ], // wall_corner_topRight.
				13: WATER_TILES, // wall_t_left.
				14: WATER_TILES, // wall_t_top.
				15: WATER_TILES  // wall_cross.
			}
		}
	};


	/**
	 * Convert a tilemap array to a string.
	 *
	 * This string can be loaded with b8.Tilemap.load.
	 *
	 * @param {Array} tilemap - The tilemap array to save.
	 * @returns {string} The encoded string
	 */
	b8.Tilemap.save = function( tilemap ) {

		b8.Utilities.checkArray( "tilemap", tilemap );

		return b8.Utilities.encodeData( tilemap );

	};


	/**
	 * Load a tilemap array from a string.
	 *
	 * @param {string} data The encoded string
	 * @returns {Array} The tilemap array
	 */
	b8.Tilemap.load = function( data ) {

		b8.Utilities.checkString( "data", data );

		return b8.Utilities.decodeData( data );

	};


	/**
	 * Visit every drawable tile in an area of a tilemap.
	 *
	 * Tilemaps can be placed on either the character grid or the pixel grid, but
	 * their source selection and tile colour rules are identical. Keeping those
	 * rules here prevents the public renderers from drifting apart.
	 *
	 * @param {Array} tilemap The tilemap array to draw.
	 * @param {number} tileStartCol Tile column to start drawing from.
	 * @param {number} tileStartRow Tile row to start drawing from.
	 * @param {number|null} width The width of the tilemap area to draw, in tiles.
	 * @param {number|null} height The height of the tilemap area to draw, in tiles.
	 * @param {Function} drawSprite Draws a normal tile at its position relative to the selected area.
	 * @param {Function} drawVfx Draws a visual-effect tile at its position relative to the selected area.
	 * @param {Function|null} [startDrawRow=null] Runs before each tilemap row is drawn.
	 * @returns {void}
	 */
	const drawTilemap_ = function( tilemap, tileStartCol, tileStartRow, width, height, drawSprite, drawVfx, startDrawRow = null ) {

		b8.Utilities.checkArray( "tilemap", tilemap );
		b8.Utilities.checkInt( "tileStartCol", tileStartCol );
		b8.Utilities.checkInt( "tileStartRow", tileStartRow );

		if ( !width ) {
			width = tilemap[ 0 ].length;
		}

		if ( !height ) {
			height = tilemap.length;
		}

		b8.Utilities.checkInt( "width", width );
		b8.Utilities.checkInt( "height", height );

		for ( let tileRow = tileStartRow; tileRow < tileStartRow + height; tileRow++ ) {
			if ( startDrawRow ) startDrawRow( tileRow - tileStartRow );

			for ( let tileCol = tileStartCol; tileCol < tileStartCol + width; tileCol++ ) {

				if ( !tilemap[ tileRow ] || tilemap[ tileRow ][ tileCol ] == null ) continue;

				const tile = tilemap[ tileRow ][ tileCol ];

				// Saved maps may contain numeric placeholders for empty cells. Only
				// complete tile arrays have character and colour data to render.
				if ( !Array.isArray( tile ) || tile.length < 3 ) continue;

				b8.color(
					tile[ b8.Tilemap.MAP_FG ],
					tile[ b8.Tilemap.MAP_BG ]
				);

				const tileChar = tile[ b8.Tilemap.MAP_CHAR ];
				const col = tileCol - tileStartCol;
				const row = tileRow - tileStartRow;

				if ( typeof tileChar === 'string' && tileChar.startsWith( 'vfx:' ) ) {
					drawVfx( tileChar.substring( 4 ), col, row );
					continue;
				}

				drawSprite( tileChar, col, row );

			}
		}

	};


	/**
	 * Draw a tilemap array to the screen.
	 *
	 * @param {Array} tilemap The tilemap array to draw.
	 * @param {number} [tileStartCol=0] Tile column to start drawing from.
	 * @param {number} [tileStartRow=0] Tile row to start drawing from.
	 * @param {number} [width=null] The width of the tilemap to draw.
	 * @param {number} [height=null] The height of the tilemap to draw.
	 * @returns {void}
	 */
	b8.Tilemap.draw = function( tilemap, tileStartCol = 0, tileStartRow = 0, width = null, height = null ) {

		const startRow = b8.Core.drawState.cursorRow;
		const startCol = b8.Core.drawState.cursorCol;

		drawTilemap_( tilemap, tileStartCol, tileStartRow, width, height, function( tileChar, col, row ) {
			// Position each tile explicitly so skipped cells retain their space.
			b8.locate( startCol + col, startRow + row );
			b8.printChar( tileChar );
		}, function( animationName, col, row ) {

			// Effects use the same source-grid positions as ordinary tiles.
			b8.locate( startCol + col, startRow + row );
			b8.Vfx.draw( animationName, b8.Core.startTime );

		}, function( row ) {

			// Position the cursor at the start of each tilemap row.
			b8.locate( startCol, startRow + row );

		} );

	};


	/**
	 * Draw a tilemap at an arbitrary pixel position.
	 *
	 * This uses the same tilemap data as b8.Tilemap.draw, so maps returned by
	 * b8.Tilemap.load and b8.Tilemap.createFromArray need no conversion. The
	 * x and y coordinates position the top-left corner of the selected map area;
	 * each following tile is placed one tile-width or tile-height farther along.
	 * Unlike b8.Tilemap.draw, this function does not move the text cursor.
	 *
	 * @param {Array} tilemap The tilemap array to draw.
	 * @param {number} x The pixel x-coordinate at which to draw the map.
	 * @param {number} y The pixel y-coordinate at which to draw the map.
	 * @param {number} [tileStartCol=0] Tile column to start drawing from.
	 * @param {number} [tileStartRow=0] Tile row to start drawing from.
	 * @param {number} [width=null] The width of the tilemap area to draw, in tiles.
	 * @param {number} [height=null] The height of the tilemap area to draw, in tiles.
	 * @returns {void}
	 */
	b8.Tilemap.drawAt = function( tilemap, x, y, tileStartCol = 0, tileStartRow = 0, width = null, height = null ) {

		b8.Utilities.checkNumber( "x", x );
		b8.Utilities.checkNumber( "y", y );
		drawTilemap_( tilemap, tileStartCol, tileStartRow, width, height, function( tileChar, col, row ) {

			const tileX = x + col * b8.CONFIG.CHR_WIDTH;
			const tileY = y + row * b8.CONFIG.CHR_HEIGHT;

			b8.spr( tileChar, tileX, tileY );

		}, function( animationName, col, row ) {

			const tileX = x + col * b8.CONFIG.CHR_WIDTH;
			const tileY = y + row * b8.CONFIG.CHR_HEIGHT;
			const cursorCol = b8.Core.drawState.cursorCol;
			const cursorRow = b8.Core.drawState.cursorRow;

			// Vfx.spr shares its renderer with cursor-based drawing, so keep this
			// pixel renderer from changing the caller's cursor position.
			b8.Vfx.spr( animationName, b8.Core.startTime, tileX, tileY );
			b8.Core.drawState.cursorCol = cursorCol;
			b8.Core.drawState.cursorRow = cursorRow;

		} );

	};


	/**
	 * Draw one resolved tile at a pixel position using its stored colours.
	 * Accepts a tile array from a loaded or generated map, not a raw tile ID.
	 * Animated vfx tiles are supported, and the text cursor is left unchanged.
	 * As with drawAt, the tile's colours become the current drawing colours.
	 *
	 * @param {Array} tile The resolved tile array, including character, fg and bg.
	 * @param {number} x The pixel x-coordinate of the tile's top-left corner.
	 * @param {number} y The pixel y-coordinate of the tile's top-left corner.
	 * @returns {void}
	 */
	b8.Tilemap.drawTile = function( tile, x, y ) {

		b8.Utilities.checkArray( "tile", tile );
		b8.Utilities.assert( tile.length >= 3, "drawTile requires a resolved tile with character, foreground and background." );

		// Treat this as a one-cell map so colours, sprites and effects always use
		// the same rendering rules as drawAt, including future improvements.
		b8.Tilemap.drawAt( [ [ tile ] ], x, y, 0, 0, 1, 1 );

	};


	/**
	 * Create an empty tilemap array of the specified size.
	 *
	 * @param {number} width The width of the tilemap.
	 * @param {number} height The height of the tilemap.
	 * @returns {Array} The empty tilemap array.
	 */
	b8.Tilemap.createEmptyTilemap = function( width, height ) {

		let layout = [];

		for ( let y = 0; y < height; y++ ) {
			layout[ y ] = [];
			for ( let x = 0; x < width; x++ ) {

				layout[ y ][ x ] = b8.Tilemap.getDefaultTile();

			}
		}

		return layout;

	};


	/**
	 * Shift and wrap a tilemap array by the specified amount.
	 *
	 * @param {Array} tilemap The tilemap array to shift.
	 * @param {number} dx The amount to shift the tilemap in the x direction.
	 * @param {number} dy The amount to shift the tilemap in the y direction.
	 * @returns {void}
	 */
	b8.Tilemap.shift = function( tilemap, dx, dy ) {

		b8.Utilities.checkArray( "tilemap", tilemap );
		b8.Utilities.checkNumber( "dx", dx );
		b8.Utilities.checkNumber( "dy", dy );

		const width = tilemap[ 0 ].length;
		const height = tilemap.length;

		const newTilemap = b8.Tilemap.createEmptyTilemap( width, height );

		for ( let y = 0; y < height; y++ ) {
			for ( let x = 0; x < width; x++ ) {

				const newX = ( x + dx + width ) % width;
				const newY = ( y + dy + height ) % height;
				newTilemap[ newY ][ newX ] = [ ...tilemap[ y ][ x ] ];

			}
		}

		return newTilemap;

	};


	/**
	 * Resize a tilemap array to the specified width and height.
	 *
	 * @param {Array} tilemap The tilemap array to resize.
	 * @param {number} width The new width of the tilemap.
	 * @param {number} height The new height of the tilemap.
	 * @returns {Array} The resized tilemap array.
	 */
	b8.Tilemap.resize = function( tilemap, width, height ) {

		b8.Utilities.checkArray( "tilemap", tilemap );
		b8.Utilities.checkInt( "width", width );
		b8.Utilities.checkInt( "height", height );

		const newTilemap = b8.Tilemap.createEmptyTilemap( width, height );

		for ( let y = 0; y < height; y++ ) {
			for ( let x = 0; x < width; x++ ) {
				if ( tilemap[ y ] && tilemap[ y ][ x ] ) {

					newTilemap[ y ][ x ] = [ ...tilemap[ y ][ x ] ];

				}
			}
		}

		return newTilemap;

	};


	/**
	 * Get the default tile for a tilemap.
	 *
	 * @returns {Array} The default tile.
	 */
	b8.Tilemap.getDefaultTile = function() {

		return [
			0, // Tile
			15, // Fg
			0, // Bg
			false, // Collision
			{}, // Data
			null, // Autotile mask: ordinary tiles have no autotile connectivity data.
			null // Autotile definition, retained for subsequent edits and serialization.
		];

	};


	/**
	 * Set a tile in the tilemap array at the specified coordinates.
	 * This function modifies the tilemap array in place.
	 * Autotile definitions such as { t: 'auto:pipe' } also refresh adjacent tiles.
	 * The wall: prefix remains an interchangeable alias for auto:.
	 * Only changed masks select new artwork; distant tiles are never scanned.
	 *
	 * @param {Array} tilemap The tilemap array to modify.
	 * @param {number} col The x coordinate of the tile to set.
	 * @param {number} row The y coordinate of the tile to set.
	 * @param {Array|Object} [tile=null] The tile data to set at the specified coordinates.
	 * @returns {void}
	 */
	b8.Tilemap.setTile = function( tilemap, col, row, tile = null ) {

		b8.Utilities.checkArray( "tilemap", tilemap );
		b8.Utilities.checkInt( "col", col );
		b8.Utilities.checkInt( "row", row );

		if ( !tile ) {
			b8.Utilities.fatal( "Tile data is required." );
		}

		if ( !tilemap[ row ] ) {
			b8.Utilities.fatal( `Row ${row} does not exist in the tilemap.` );
		}

		if ( typeof tilemap[ row ][ col ] === "undefined" ) {
			b8.Utilities.fatal( `Column ${col} does not exist in row ${row} of the tilemap.` );
		}

		const oldType = autotileType_( tilemap[ row ][ col ]?.[ b8.Tilemap.MAP_AUTOTILE ]?.type );
		const newTile = b8.Tilemap.normaliseTile( tile );
		const newType = autotileType_( newTile[ b8.Tilemap.MAP_AUTOTILE ]?.type );
		// Reject unknown autotile definitions before changing the caller's map.
		if ( newType && !autotileSets[ newType.substring( 5 ) ] ) {
			b8.Utilities.fatal( 'Autotile tile type not found: ' + newType.substring( 5 ) );
		}
		tilemap[ row ][ col ] = newTile;
		if ( !oldType && !newType ) return;
		refreshAutotile_( tilemap, col, row, true );

		// Four-way masks depend on identity, not artwork, so changes cannot
		// propagate beyond these neighbours. This bounds the work to five cells.
		const visited = new Set( [ newTile ] );
		for ( const [ dx, dy ] of [ [ 0, -1 ], [ 1, 0 ], [ 0, 1 ], [ -1, 0 ] ] ) {
			const y = ( row + dy + tilemap.length ) % tilemap.length;
			const width = tilemap[ y ]?.length;
			if ( !width ) continue;
			const x = ( col + dx + width ) % width;
			const neighbour = tilemap[ y ][ x ];
			const autotile = neighbour?.[ b8.Tilemap.MAP_AUTOTILE ];
			if ( !autotile || visited.has( neighbour ) ) continue;
			// Opposite-edge cells are candidates only when their autotile wraps.
			if ( ( x !== col + dx || y !== row + dy ) && autotileSets[ autotile.type.substring( 5 ) ].edgeMode !== 'wrap' ) continue;
			const neighbourType = autotileType_( autotile.type );
			if ( neighbourType !== oldType && neighbourType !== newType ) continue;
			visited.add( neighbour );
			refreshAutotile_( tilemap, x, y );
		}

	};


	/**
	 * Convert a tile definition to a tile array.
	 *
	 * The tile definition can be an array or an object with properties.
	 * This function ensures that the tile array is in the correct format and all properties are set.
	 * Object definitions may include autotileMask; old five-slot arrays default to null.
	 * Autotile names retain their definition in MAP_AUTOTILE for resolution by setTile.
	 *
	 * @param {Array|Object} tile The tile definition to convert. t.t = tile id, t.fg = foreground color, t.bg = background color, t.coll = collision flag, t.data = additional 	data.
	 * @returns {Array} The converted tile array.
	 */
	b8.Tilemap.normaliseTile = function( tile ) {

		const newTile = b8.Tilemap.getDefaultTile();

		if ( Array.isArray( tile ) ) {
			for ( let i = 0; i < newTile.length; i++ ) {
				if ( typeof tile[ i ] !== "undefined" ) {
					newTile[ i ] = tile[ i ];
				}
			}
			// Raw arrays may use an autotile name too; resolved arrays already carry metadata.
			if ( autotileType_( newTile[ 0 ] ) ) {
				newTile[ b8.Tilemap.MAP_AUTOTILE ] = { type: autotileType_( newTile[ 0 ] ), fg: newTile[ 1 ], bg: newTile[ 2 ] };
			}

			return newTile;
		}

		if ( tile && typeof tile === "object" ) {
			if ( typeof tile.t !== "undefined" ) newTile[ 0 ] = tile.t;
			if ( typeof tile.fg !== "undefined" ) newTile[ 1 ] = tile.fg;
			if ( typeof tile.bg !== "undefined" ) newTile[ 2 ] = tile.bg;
			if ( typeof tile.coll !== "undefined" ) newTile[ 3 ] = !!tile.coll;
			if ( typeof tile.data !== "undefined" ) newTile[ 4 ] = tile.data;
			if ( typeof tile.autotileMask !== "undefined" ) newTile[ b8.Tilemap.MAP_AUTOTILE_MASK ] = tile.autotileMask;
			if ( autotileType_( tile.t ) ) {
				newTile[ b8.Tilemap.MAP_AUTOTILE ] = { type: autotileType_( tile.t ), fg: tile.fg ?? 15, bg: tile.bg ?? 0, colours: tile.colours ?? tile.colors ?? null };
			}

			return newTile;
		}

		return newTile;

	};


	/**
	 * Recalculate one autotile, stopping before random picks if its mask is unchanged.
	 * Collision and game data are deliberately left intact.
	 *
	 * @param {Array} tilemap The resolved map.
	 * @param {number} col Cell column.
	 * @param {number} row Cell row.
	 * @param {boolean} [force=false] Resolve newly assigned definitions even if the mask matches.
	 * @returns {void}
	 */
	function refreshAutotile_( tilemap, col, row, force = false ) {
		const tile = tilemap[ row ][ col ];
		const autotile = tile?.[ b8.Tilemap.MAP_AUTOTILE ];
		if ( !autotile ) return;
		const selected = pickAutotile( col, row, tilemap, autotile.type, cell => autotileType_( cell?.[ b8.Tilemap.MAP_AUTOTILE ]?.type ) );
		if ( !force && tile[ b8.Tilemap.MAP_AUTOTILE_MASK ] === selected.mask ) return;
		const variant = autotile.colours?.[ selected.mask ];
		const values = [ selected.tileId,
			resolveAutotileColour_( 'fg', autotile.fg, selected.colours, variant, autotile.cell ),
			resolveAutotileColour_( 'bg', autotile.bg, selected.colours, variant, autotile.cell ) ];
		for ( let i = 0; i < values.length; i++ ) {
			tile[ i ] = Array.isArray( values[ i ] ) ? b8.Random.pickWeighted( values[ i ] ) : values[ i ];
		}
		tile[ b8.Tilemap.MAP_AUTOTILE_MASK ] = selected.mask;
	}


	/**
	 * Get a text map and convert it to an array of arrays.
	 *
	 * An example text map might look like:
	 *    #######
	 *    #  1  #
	 *    # ### #
	 *    # 2 2 #
	 *    #######
	 *
	 * Returns unresolved symbols. Optionally pass this grid through applyRules
	 * before createFromArray resolves artwork, colours, collision, and data.
	 *
	 * @param {string} mapText The text map to convert.
	 * @returns {Array} The converted tilemap array.
	 */
	b8.Tilemap.convertFromText = function( mapText ) {

		b8.Utilities.checkString( "text", mapText );

		// Don't trim the text as we want to preserve the whitespace.
		// These may be empty tiles.
		const lines = mapText.split( '\n' );

		// Remove any lines that are just whitespace.
		const filteredLines = lines.filter( line => line !== '' );
		if ( filteredLines.length === 0 ) b8.Utilities.fatal( "No valid lines found in the map text." );

		const map = filteredLines.map( row => row.split( '' ) );

		return map;

	};


	/**
	 * Apply ordered decoration rules to an unresolved symbol grid once.
	 * Each rule matches a snapshot, then commits its changes before the next rule.
	 * Null matches any existing cell in match, and leaves a cell alone in replace.
	 * Spaces are literal symbols in both grids. Patterns never wrap map edges.
	 * The source grid is not changed; the returned grid can use createFromArray.
	 *
	 * @param {string[][]} grid Unresolved map symbols, such as convertFromText's output.
	 * @param {Array<{match: Array, replace: Array}>} rules Ordered rectangular patterns.
	 * @returns {string[][]} A decorated copy of the symbol grid.
	 * @throws {Error} Invalid patterns or conflicting writes within a single rule.
	 */
	b8.Tilemap.applyRules = function( grid, rules ) {
		b8.Utilities.checkArray( 'grid', grid );
		b8.Utilities.checkArray( 'rules', rules );
		for ( const row of grid ) b8.Utilities.checkArray( 'grid row', row );
		for ( const rule of rules ) validateTileRule_( rule );
		const result = grid.map( row => row.slice() );

		for ( const rule of rules ) {
			const height = rule.match.length;
			const width = rule.match[ 0 ].length;
			const changes = new Map();
			for ( let row = 0; row <= result.length - height; row++ ) {
				for ( let col = 0; col <= result[ row ].length - width; col++ ) {
					if ( !matchesTileRule_( result, col, row, rule.match ) ) continue;
					for ( let y = 0; y < height; y++ ) {
						for ( let x = 0; x < width; x++ ) {
							const symbol = rule.replace[ y ][ x ];
							if ( symbol === null ) continue;
							const key = `${row + y},${col + x}`;
							const previous = changes.get( key );
							// Identical overlapping writes are harmless; different writes
							// indicate an ambiguous rule rather than a priority decision.
							if ( previous && previous.symbol !== symbol ) {
								b8.Utilities.fatal( `Conflicting tile rule replacements at ${key}.` );
							}
							changes.set( key, { row: row + y, col: col + x, symbol } );
						}
					}
				}
			}
			// Defer every write so this rule cannot trigger itself during its scan.
			for ( const change of changes.values() ) {
				result[ change.row ][ change.col ] = change.symbol;
			}
		}
		return result;
	};


	/**
	 * Require equally sized, nonempty rectangles with explicit strings or null.
	 * This catches missing cells rather than interpreting undefined as a wildcard.
	 *
	 * @param {Object} rule A match/replace definition.
	 * @returns {void}
	 */
	function validateTileRule_( rule ) {
		b8.Utilities.checkObject( 'rule', rule );
		const match = rule.match;
		const replace = rule.replace;
		b8.Utilities.checkArray( 'rule.match', match );
		b8.Utilities.checkArray( 'rule.replace', replace );
		const width = match[ 0 ]?.length;
		b8.Utilities.assert( match.length > 0 && width > 0 && replace.length === match.length,
			'Tile rules require nonempty match and replace grids of the same size.' );
		for ( const pattern of [ match, replace ] ) {
			for ( const row of pattern ) {
				b8.Utilities.checkArray( 'rule row', row );
				b8.Utilities.assert( row.length === width, 'Tile rule rows must have the same width.' );
				for ( const symbol of row ) {
					b8.Utilities.assert( symbol === null || typeof symbol === 'string',
						'Tile rule cells must be strings or null.' );
				}
			}
		}
	}


	/**
	 * Match a whole rectangle against existing cells, including on ragged maps.
	 * Wildcards never match outside the map.
	 *
	 * @param {Array} grid The current unresolved symbol grid.
	 * @param {number} col Pattern's left column.
	 * @param {number} row Pattern's top row.
	 * @param {Array} pattern The rule's match rectangle.
	 * @returns {boolean} Whether the entire pattern matches here.
	 */
	function matchesTileRule_( grid, col, row, pattern ) {
		for ( let y = 0; y < pattern.length; y++ ) {
			if ( col + pattern[ y ].length > grid[ row + y ].length ) return false;
			for ( let x = 0; x < pattern[ y ].length; x++ ) {
				const symbol = pattern[ y ][ x ];
				if ( symbol !== null && symbol !== grid[ row + y ][ col + x ] ) return false;
			}
		}
		return true;
	}


	/**
	 * Check the validity of the encoded tilemap data.
	 *
	 * The checks are simple, but reduces likelihood of invalid data being used.
	 *
	 * @param {string} mapText The encoded tilemap data.
	 * @returns {boolean} True if the tilemap is valid, false otherwise.
	 */
	b8.Tilemap.validateTilemap = function( mapText ) {

		b8.Utilities.checkString( "text", mapText );

		const map = b8.Tilemap.load( mapText );

		// Check map is an array of arrays.
		if ( !Array.isArray( map ) || !Array.isArray( map[ 0 ] ) ) {
			return false;
		}

		// Check 0, 0 is a valid tile (is an array and length is greater than 3).
		if ( !Array.isArray( map[ 0 ][ 0 ] ) || map[ 0 ][ 0 ].length <= 3 ) {
			return false;
		}

		return true;

	};


	/**
	 * Create a tilemap from an array of arrays.
	 * The tilePattern is an object that maps tile characters to tile properties.
	 * Cells using the same autotile type connect, even if their source characters differ.
	 *
	 * @param {Array} grid The grid array to create the tilemap from.
	 * @param {Object} tilePattern The tile pattern object.
	 * @param {Object} [defaultTilePattern=null] The default tile pattern to use for empty tiles.
	 * @param {Array|null} [colourOverrides=null] Sparse rows of per-cell {fg, bg} overrides.
	 * Tile patterns may supply colours (or colors), keyed by autotile mask. Each
	 * entry accepts numeric or random-array fg/bg values. Null resets that
	 * entry or channel to the tile pattern's normal colours. Missing channels
	 * inherit the autotile set's colours. Per-cell overrides take final precedence.
	 * @returns {Array} The created tilemap array.
	 */
	b8.Tilemap.createFromArray = function( grid, tilePattern, defaultTilePattern = null, colourOverrides = null ) {

		b8.Utilities.checkArray( "grid", grid );
		b8.Utilities.checkObject( "tilePattern", tilePattern );
		if ( colourOverrides !== null ) b8.Utilities.checkArray( "colourOverrides", colourOverrides );

		if ( defaultTilePattern !== null ) {
			b8.Utilities.checkObject( "defaultTilePattern", defaultTilePattern );
		}

		if ( null === defaultTilePattern ) {
			defaultTilePattern = b8.Tilemap.getDefaultTile();
		}

		const tilemap = [];

		b8.Random.setSeed( grid[ 0 ].join( '' ) );

		for ( let y = 0; y < grid.length; y++ ) {
			tilemap[ y ] = [];
			for ( let x = 0; x < grid[ y ].length; x++ ) {

				// Set default properties.
				tilemap[ y ][ x ] = [ ...defaultTilePattern ];

				// If tile pattern not defined assume tile is empty and continue.
				if ( !tilePattern[ grid[ y ][ x ] ] ) continue;

				const tile = tilePattern[ grid[ y ][ x ] ];

				// Tile character code.
				let tileId = tile.t;
				let autotileMask = null;
				let autotileColours = null;

				// Both prefixes describe the same neighbour-based artwork selection.
				if ( autotileType_( tileId ) ) {
					// Keep the same mask used to choose the artwork, including edgeMode.
					const autotile = pickAutotile( x, y, grid, tileId, cell => autotileType_( tilePattern[ cell ]?.t ) );
					tileId = autotile.tileId;
					autotileMask = autotile.mask;
					autotileColours = autotile.colours;
				}

				// If is an array of ids then do a weighted pick from those.
				if ( Array.isArray( tileId ) ) {
					tileId = b8.Random.pickWeighted( tileId );
				}

				// Foreground colour.
				const baseFg = tile.fg ?? 15;
				const baseBg = tile.bg ?? 0;
				const colours = tile.colours ?? tile.colors;
				const variant = autotileMask === null ? undefined : colours?.[ autotileMask ];
				const cell = colourOverrides?.[ y ]?.[ x ];
				let fg = resolveAutotileColour_( 'fg', baseFg, autotileColours, variant, cell );
				if ( Array.isArray( fg ) ) {
					fg = b8.Random.pickWeighted( fg );
				}

				// Background colour.
				let bg = resolveAutotileColour_( 'bg', baseBg, autotileColours, variant, cell );
				if ( Array.isArray( bg ) ) {
					bg = b8.Random.pickWeighted( bg );
				}

				tilemap[ y ][ x ] = [
					tileId,
					fg,
					bg,
					tile.coll || false,
					tile.data || {},
					autotileMask,
					autotileMask === null ? null : {
						type: autotileType_( tile.t ), fg: baseFg, bg: baseBg,
						// Missing overrides inherit; explicit null resets to base colours.
						colours: colours ?? null, cell: cell === undefined ? {} : cell
					},
				];

			}
		}

		return tilemap;

	};


	/**
	 * Resolve one colour channel without treating zero or transparent -1 as absent.
	 * Undefined inherits the previous layer; null explicitly restores the base.
	 * Random arrays are returned intact for the existing weighted picker.
	 *
	 * @param {string} channel The fg or bg channel.
	 * @param {number|Array} base The map tile's normal colour.
	 * @param {Object|null} autotile The autotile-set variant's colours.
	 * @param {Object|null|undefined} variant The map pattern's variant override.
	 * @param {Object|null|undefined} cell The individual cell's final override.
	 * @returns {number|Array} The selected colour or random choices.
	 */
	function resolveAutotileColour_( channel, base, autotile, variant, cell ) {
		let value = autotile?.[ channel ] ?? base;
		for ( const override of [ variant, cell ] ) {
			if ( override === null ) value = base;
			else if ( override?.[ channel ] !== undefined ) value = override[ channel ] ?? base;
		}
		return value;
	}


	/**
	 * Add an autotile set for terrain, walls, roads, or other connected artwork.
	 *
	 * The tile set should contain a `tiles` object with up to 16 tile ids,
	 * corresponding to the 16 possible bitmask values.
	 *
	 * Optional properties:
	 * - edgeMode: controls how map boundaries are handled.
	 *
	 * Supported edge modes:
	 * - "open": outside the map does not match anything.
	 * - "connect": outside the map always counts as a matching tile.
	 * - "wrap": outside the map wraps around to the opposite edge.
	 *
	 * @param {string} name The unprefixed set name, e.g. 'brick' for 'auto:brick'.
	 * @param {Object} tileSet The autotile set definition. Also available via wall:brick.
	 * @param {Object} tileSet.tiles The tile ids for each bitmask value.
	 * @param {Object} [tileSet.colours] Optional foreground/background entries keyed by mask; colors is an alias.
	 * Each channel can be a number or a weighted random array. Missing/null
	 * colours fall back to the map tile's normal foreground/background.
	 * @param {string} [tileSet.edgeMode="open"] How map edges are handled: "open", "connect", or "wrap".
	 * @returns {void}
	 */
	b8.Tilemap.addAutotileSet = function( name, tileSet ) {

		b8.Utilities.checkString( "name", name );
		b8.Utilities.checkObject( "tileSet", tileSet );

		if ( autotileSets[ name ] ) {
			b8.Utilities.fatal( `Autotile tile set with name ${name} already exists.` );
		}

		autotileSets[ name ] = normaliseAutotileSet( tileSet );

	};


	/**
	 * Get an autotile set by its unprefixed name.
	 *
	 * @param {string} name The name of the autotile set to get.
	 * @returns {Object} The autotile set definition.
	 */
	b8.Tilemap.getAutotileSet = function( name ) {

		b8.Utilities.checkString( "name", name );

		if ( !autotileSets[ name ] ) {
			b8.Utilities.fatal( `Autotile tile set with name ${name} does not exist.` );
		}

		return { ...autotileSets[ name ] };

	};


	/**
	 * Select an autotile from a predefined list based on the surrounding tiles.
	 * The grid is the 2D array of tile ids.
	 * The x and y are the coordinates of the tile to check.
	 *
	 * @param {number} col The column coordinate of the tile.
	 * @param {number} row The row coordinate of the tile.
	 * @param {Array} grid The 2D array of tile ids.
	 * @param {string} [name=null] The name of the autotile to select. Picked from the default lists of autotile patterns.
	 * @param {Function} [getType] Read autotile identity from a source character or resolved cell.
	 * @returns {{tileId: number|Array, mask: number, colours: Object|undefined}} Artwork, connectivity and optional colours.
	 */
	function pickAutotile( col, row, grid, name = null, getType = value => value ) {

		const tileType = name.substring( 5 );

		if ( !autotileSets[ tileType ] ) {
			b8.Utilities.fatal( "Autotile tile type not found: " + tileType );
		}

		const autotileSet = autotileSets[ tileType ];

		const mask = computeBitmask(
			grid,
			col,
			row,
			autotileSet.edgeMode || "open",
			getType
		);

		return { tileId: autotileSet.tiles[ mask ], mask, colours: ( autotileSet.colours ?? autotileSet.colors )?.[ mask ] };

	};


	/**
	 * Normalise an autotile set to ensure it has 16 entries, one for each bitmask value.
	 * If any entries are missing, they will be filled in with the corresponding entry from the default "solid" tile set.
	 *
	 * @param {Object} tileSet The autotile set to normalise.
	 * @returns {Object} The normalised autotile set.
	 */
	function normaliseAutotileSet( tileSet ) {

		if ( !tileSet.tiles ) {
			b8.Utilities.fatal( "Autotile tile set must include a tiles object. eg { tiles: { 0: 1, 1: 2, ... } }" );
		}

		const defaultTileSet = autotileSets[ 'solid' ];
		const normalisedTileSet = {
			edgeMode: tileSet.edgeMode || "open",
			// Keep one canonical spelling internally; accept both at the API boundary.
			colours: tileSet.colours ?? tileSet.colors,
			tiles: {}
		};

		for ( let i = 0; i < 16; i++ ) {
			if ( typeof tileSet.tiles[ i ] === "undefined" ) {
				normalisedTileSet.tiles[ i ] = defaultTileSet.tiles[ i ];
			} else {
				normalisedTileSet.tiles[ i ] = tileSet.tiles[ i ];
			}
		}

		return normalisedTileSet;

	}


	/**
	 * Compute a 4-bit bitmask for an autotile based on its surrounding tiles.
	 *
	 * The bitmask checks the four adjacent tiles: north, east, south, and west.
	 * If an adjacent tile matches the current autotile type, the corresponding
	 * bit is added to the mask.
	 *
	 * Edge modes control how tiles outside the map bounds are treated:
	 * - "open": outside the map does not match anything.
	 * - "connect": outside the map always counts as a matching tile.
	 * - "wrap": outside the map wraps around to the opposite edge.
	 *
	 * Bit values: 1 = North, 2 = East, 4 = South, 8 = West.
	 *
	 * @param {Array} grid The 2D array of tile ids.
	 * @param {number} col The x coordinate of the tile.
	 * @param {number} row The y coordinate of the tile.
	 * @param {string} [edgeMode="open"] How map edges are handled: "open", "connect", or "wrap".
	 * @param {Function} [getType] Read the identity used for connectivity.
	 * @returns {number} The computed bitmask value from 0 to 15.
	 */
	function computeBitmask( grid, col, row, edgeMode = "open", getType = value => value ) {

		let bitmask = 0;
		const tileId = getType( grid[ row ][ col ] );

		if ( matchesTile( grid, col, row - 1, tileId, edgeMode, getType ) ) bitmask += 1;
		if ( matchesTile( grid, col + 1, row, tileId, edgeMode, getType ) ) bitmask += 2;
		if ( matchesTile( grid, col, row + 1, tileId, edgeMode, getType ) ) bitmask += 4;
		if ( matchesTile( grid, col - 1, row, tileId, edgeMode, getType ) ) bitmask += 8;

		return bitmask;

	}


	/**
	 * Check whether a tile matches the given tile id.
	 *
	 * If the coordinates are outside the map, the result depends on edgeMode:
	 * - "open": return false.
	 * - "connect": return true.
	 * - "wrap": wrap the coordinates around the map before checking.
	 *
	 * @param {Array} grid The 2D array of tile ids.
	 * @param {number} col The x coordinate to check.
	 * @param {number} row The y coordinate to check.
	 * @param {string|number} tileId The tile id to match against.
	 * @param {string} edgeMode How map edges are handled: "open", "connect", or "wrap".
	 * @param {Function} [getType] Read the identity used for connectivity.
	 * @returns {boolean} True if the tile matches.
	 */
	function matchesTile( grid, col, row, tileId, edgeMode, getType = value => value ) {

		// Wrap coordinates around the map.
		if ( edgeMode === "wrap" ) {

			row = ( row + grid.length ) % grid.length;
			col = ( col + grid[ row ].length ) % grid[ row ].length;

		}

		// Outside map bounds.
		if (
			row < 0 ||
			row >= grid.length ||
			col < 0 ||
			col >= grid[ row ].length
		) {

			if ( edgeMode === "connect" ) {
				return true;
			}

			return false;

		}

		return getType( grid[ row ][ col ] ) === tileId;

	}

} )( b8 );
