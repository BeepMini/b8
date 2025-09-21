( function( beep8 ) {

	/**
	 * A collection of functions for working with tilemaps.
	 * The tilemaps are created with the beep8 Tilemap Editor.
	 *
	 * The tilemap format is a multi-dimensional array of arrays.
	 * The tile array is in the format:
	 * [0] = tile character code.
	 * [1] = foreground color code.
	 * [2] = background color code.
	 * [3] = collision flag.
	 * [4] = additional data.
	 */
	beep8.Tilemap = {};

	beep8.Tilemap.MAP_CHAR = 0;
	beep8.Tilemap.MAP_FG = 1;
	beep8.Tilemap.MAP_BG = 2;
	beep8.Tilemap.MAP_COLLISION = 3;
	beep8.Tilemap.MAP_DATA = 4;


	// Define a mapping from bitmask value to your desired tile name or index.
	const wallTiles = {
		'solid': {
			0: 1,  // wall_isolated.
			1: 1,  // wall_end_bottom.
			2: 1,  // wall_end_left.
			3: 36,  // wall_corner_bottomLeft.
			4: 1,  // wall_end_top.
			5: 1,  // wall_vertical.
			6: 18,  // wall_corner_topLeft.
			7: 1,  // wall_t_right.
			8: 1,  // wall_end_right.
			9: 37,  // wall_corner_bottomRight.
			10: 1, // wall_horizontal.
			11: 1, // wall_t_bottom.
			12: 19, // wall_corner_topRight.
			13: 1, // wall_t_left.
			14: 1, // wall_t_top.
			15: 1  // wall_cross.
		},
		'rounded': {
			0: 1,  // wall_isolated.
			1: 42,  // wall_end_bottom.
			2: 23,  // wall_end_left.
			3: 36,  // wall_corner_bottomLeft.
			4: 41,  // wall_end_top.
			5: 1,  // wall_vertical.
			6: 18,  // wall_corner_topLeft.
			7: 1,  // wall_t_right.
			8: 24,  // wall_end_right.
			9: 37,  // wall_corner_bottomRight.
			10: 1, // wall_horizontal.
			11: 1, // wall_t_bottom.
			12: 19, // wall_corner_topRight.
			13: 1, // wall_t_left.
			14: 1, // wall_t_top.
			15: 1  // wall_cross.
		},
		'half': {
			0: 128,  // wall_isolated.
			1: 75,  // wall_end_bottom.
			2: 58,  // wall_end_left.
			3: 93,  // wall_corner_bottomLeft.
			4: 75,  // wall_end_top.
			5: 75,  // wall_vertical.
			6: 57,  // wall_corner_topLeft.
			7: 129,  // wall_t_right.
			8: 58,  // wall_end_right.
			9: 95,  // wall_corner_bottomRight.
			10: 58, // wall_horizontal.
			11: 111, // wall_t_bottom.
			12: 59, // wall_corner_topRight.
			13: 130, // wall_t_left.
			14: 112, // wall_t_top.
			15: 113  // wall_cross.
		},
		'half_rounded': {
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
		},
		'pipe': {
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
		},
		'thin': {
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
		},
	};


	/**
	 * Convert a tilemap array to a string.
	 *
	 * This string can be loaded with beep8.Tilemap.load.
	 *
	 * @param {Array} tilemap - The tilemap array to save.
	 * @returns {string} The encoded string
	 */
	beep8.Tilemap.save = function( tilemap ) {

		beep8.Utilities.checkArray( "tilemap", tilemap );

		return beep8.Utilities.encodeData( tilemap );

	}


	/**
	 * Load a tilemap array from a string.
	 *
	 * @param {string} data The encoded string
	 * @returns {Array} The tilemap array
	 */
	beep8.Tilemap.load = function( data ) {

		beep8.Utilities.checkString( "data", data );

		return beep8.Utilities.decodeData( data );

	}


	/**
	 * Draw a tilemap array to the screen.
	 *
	 * @param {Array} tilemap The tilemap array to draw.
	 * @param {number} [tileX=0] The x-coordinate of the tile to start drawing from.
	 * @param {number} [tileY=0] The y-coordinate of the tile to start drawing from.
	 * @param {number} [width=null] The width of the tilemap to draw.
	 * @param {number} [height=null] The height of the tilemap to draw.
	 * @returns {void}
	 */
	beep8.Tilemap.draw = function( tilemap, tileXOffset = 0, tileYOffset = 0, width = null, height = null ) {

		beep8.Utilities.checkArray( "tilemap", tilemap );

		if ( !width ) {
			width = tilemap[ 0 ].length;
		}

		if ( !height ) {
			height = tilemap.length;
		}

		beep8.Utilities.checkInt( "width", width );
		beep8.Utilities.checkInt( "height", height );

		const startRow = beep8.Core.drawState.cursorRow;
		const startCol = beep8.Core.drawState.cursorCol;

		for ( let y = tileYOffset; y < tileYOffset + height; y++ ) {

			// Position the cursor at the start of the row.
			const lx = 0 + startCol;
			const ly = y - tileYOffset + startRow;
			beep8.locate( lx, ly );

			for ( let x = tileXOffset; x < tileXOffset + width; x++ ) {

				if ( !tilemap[ y ] || tilemap[ y ][ x ] == null ) continue;

				const tile = tilemap[ y ][ x ];
				if ( tile && tile.length >= 3 ) {

					beep8.color(
						tile[ beep8.Tilemap.MAP_FG ],
						tile[ beep8.Tilemap.MAP_BG ]
					);

					beep8.printChar( tile[ beep8.Tilemap.MAP_CHAR ] );

				}
			}
		}

	};


	/**
	 * Create an empty tilemap array of the specified size.
	 *
	 * @param {number} width The width of the tilemap.
	 * @param {number} height The height of the tilemap.
	 * @returns {Array} The empty tilemap array.
	 */
	beep8.Tilemap.createEmptyTilemap = function( width, height ) {

		let layout = [];

		for ( let y = 0; y < height; y++ ) {
			layout[ y ] = [];
			for ( let x = 0; x < width; x++ ) {

				layout[ y ][ x ] = beep8.Tilemap.getDefaultTile();

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
	beep8.Tilemap.shift = function( tilemap, dx, dy ) {

		beep8.Utilities.checkArray( "tilemap", tilemap );
		beep8.Utilities.checkNumber( "dx", dx );
		beep8.Utilities.checkNumber( "dy", dy );

		const width = tilemap[ 0 ].length;
		const height = tilemap.length;

		const newTilemap = beep8.Tilemap.createEmptyTilemap( width, height );

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
	beep8.Tilemap.resize = function( tilemap, width, height ) {

		beep8.Utilities.checkArray( "tilemap", tilemap );
		beep8.Utilities.checkNumber( "width", width );
		beep8.Utilities.checkNumber( "height", height );

		const newTilemap = beep8.Tilemap.createEmptyTilemap( width, height );

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
	beep8.Tilemap.getDefaultTile = function() {

		return [
			0, // Tile
			15, // Fg
			0, // Bg
			0, // Collision
			{} // Data
		];

	};


	/**
	 * Get a text map and convert it to an array of arrays.
	 *
	 * An example text map might look like:
	 * #######
	 * #  1  #
	 * # ### #
	 * # 2 2 #
	 * #######
	 *
	 * The tilemap array will include the tile character code, foreground color,
	 * background color, collision flag, and additional data.
	 *
	 * @param {string} mapText The text map to convert.
	 * @returns {Array} The converted tilemap array.
	 */
	beep8.Tilemap.convertFromText = function( mapText ) {

		beep8.Utilities.checkString( "text", mapText );

		// Don't trim the text as we want to preserve the whitespace.
		// These may be empty tiles.
		const lines = mapText.split( '\n' );

		// Remove any lines that are just whitespace.
		const filteredLines = lines.filter( line => line.trim() !== '' );
		if ( filteredLines.length === 0 ) beep8.Utilities.fatal( "No valid lines found in the map text." );

		const map = filteredLines.map( row => row.split( '' ) );

		return map;

	}


	/**
	 * Check the validity of the encoded tilemap data.
	 *
	 * The checks are simple, but reduces liklihood of invalid data being used.
	 *
	 * @param {string} mapText The encoded tilemap data.
	 * @returns {boolean} True if the tilemap is valid, false otherwise.
	 */
	beep8.Tilemap.validateTilemap = function( mapText ) {

		beep8.Utilities.checkString( "text", mapText );

		const map = beep8.Tilemap.load( mapText );

		// Check map is an array of arrays.
		if ( !Array.isArray( map ) || !Array.isArray( map[ 0 ] ) ) {
			return false;
		}

		// Check 0, 0 is a valid tile (is an array and length is greater than 3).
		if ( !Array.isArray( map[ 0 ][ 0 ] ) || map[ 0 ][ 0 ].length <= 3 ) {
			return false;
		}

		return true;

	}


	/**
	 * Create a tilemap from an array of arrays.
	 * The tilePattern is an object that maps tile characters to tile properties.
	 *
	 * @param {Array} grid The grid array to create the tilemap from.
	 * @param {Object} tilePattern The tile pattern object.
	 * @returns {Array} The created tilemap array.
	 */
	beep8.Tilemap.createFromArray = function( grid, tilePattern, defaultTilePattern = null ) {

		beep8.Utilities.checkArray( "grid", grid );
		beep8.Utilities.checkObject( "tilePattern", tilePattern );

		if ( defaultTilePattern !== null ) {
			beep8.Utilities.checkObject( "defaultTilePattern", defaultTilePattern );
		}

		if ( null === defaultTilePattern ) {
			defaultTilePattern = beep8.Tilemap.getDefaultTile();
		}

		const tilemap = [];

		for ( let y = 0; y < grid.length; y++ ) {
			tilemap[ y ] = [];
			for ( let x = 0; x < grid[ y ].length; x++ ) {

				// Set default properties.
				tilemap[ y ][ x ] = [ ...defaultTilePattern ];

				// If tile pattern not defined assume tile is empty and continue.
				if ( !tilePattern[ grid[ y ][ x ] ] ) {
					// beep8.Utilities.log( "Tile pattern not found for: " + grid[ y ][ x ] );
					continue;
				}

				const tile = tilePattern[ grid[ y ][ x ] ];

				// Tile character code.
				let tileId = tile.t;

				// If tileId is a string and begins with "wall_" then compute bitmask.
				if ( typeof tileId === "string" && tileId.startsWith( "wall_" ) ) {
					tileId = beep8.Tilemap.wallTile( x, y, grid, tileId );
				}

				// If is an array of ids then do a weighted pick from those.
				if ( Array.isArray( tileId ) ) {
					tileId = beep8.Random.pickWeighted( tileId );
				}

				// Foreground colour.
				let fg = tile.fg || 15;
				if ( Array.isArray( fg ) ) {
					fg = beep8.Random.pickWeighted( fg );
				}

				// Background colour.
				let bg = tile.bg || 0;
				if ( Array.isArray( bg ) ) {
					bg = beep8.Random.pickWeighted( bg );
				}

				tilemap[ y ][ x ] = [
					tileId,
					fg,
					bg,
					tile.coll || 0,
					tile.data || {},
				];

			}
		}

		return tilemap;

	};


	/**
	 * Select a wall tile from a predefined list based on the surrounding tiles.
	 * The grid is the 2D array of tile ids.
	 * The x and y are the coordinates of the tile to check.
	 *
	 * @param {number} x The x coordinate of the tile.
	 * @param {number} y The y coordinate of the tile.
	 * @param {Array} grid The 2D array of tile ids.
	 * @param {string} name The name of the wall tile to select. Picked from the default lists of wall patterns.
	 * @returns {number} The selected wall tile id.
	 */
	beep8.Tilemap.wallTile = function( col, row, grid, name = null ) {

		beep8.Utilities.checkNumber( "col", col );
		beep8.Utilities.checkNumber( "row", row );
		beep8.Utilities.checkArray( "grid", grid );
		beep8.Utilities.checkString( "name", name );

		if ( null === name ) {
			beep8.Utilities.fatal( "Wall tile name not given: " + name );
		}

		// Remove wall_ prefix from name.
		const tileType = name.substring( 5 );

		if ( !wallTiles[ tileType ] ) {
			beep8.Utilities.fatal( "Wall tile type not found: " + tileType );
		}

		const mask = computeBitmask( grid, col, row );
		return wallTiles[ tileType ][ mask ];

	};


	// A helper function to compute a 4-bit bitmask for a wall tile.
	// Bit values: 1 = North, 2 = East, 4 = South, 8 = West.
	function computeBitmask( grid, col, row ) {

		let bitmask = 0;
		const tileId = grid[ row ][ col ];

		// Check North
		if ( row > 0 && grid[ row - 1 ][ col ] === tileId ) bitmask += 1;
		// Check East
		if ( col < grid[ row ].length - 1 && grid[ row ][ col + 1 ] === tileId ) bitmask += 2;
		// Check South
		if ( row < grid.length - 1 && grid[ row + 1 ][ col ] === tileId ) bitmask += 4;
		// Check West
		if ( col > 0 && grid[ row ][ col - 1 ] === tileId ) bitmask += 8;

		return bitmask;

	}


} )( beep8 || ( beep8 = {} ) );
