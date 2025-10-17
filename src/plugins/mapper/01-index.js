const mapper = {

	// All loaded maps.
	maps: [],

	// Currently active map.
	currentMap: null,

	// Map of entity types to their handlers.
	types: {},
	systems: {},
	actions: {},
	settings: {},
	bg: {},

	// The player entity ID.
	player: null,


	/**
	 * Initialize and start the game with the provided map data.
	 *
	 * @param {Object} mapData - The map data object containing map layout, tiles, objects, and settings.
	 * @returns {void}
	 */
	play: function( mapData ) {

		b8.Utilities.checkObject( 'mapData', mapData );

		mapper.load( mapData );

		b8.Scene.add( 'menu', mapper.sceneMenu );
		b8.Scene.add( 'game', mapper.sceneGame );
		b8.Scene.set( 'menu' );

	},


	/**
	 * Load a map into the game.
	 *
	 * @param {Object} mapData - The map data object containing map layout, tiles, objects, and settings.
	 * @param {string} mapName - The name to assign to the loaded map.
	 * @param {boolean} setCurrentMap - Whether to set this map as the current active map.
	 * @returns {void}
	 */
	load: function( mapData, mapName = 'world', setCurrentMap = true ) {

		b8.Utilities.checkObject( 'mapData', mapData );

		// Reset state.
		b8.ECS.reset();
		mapper.maps = [];
		mapper.currentMap = null;

		// Combine map data into single string.
		const mapDataString = mapData.map.join( '\n' );
		b8.Utilities.checkString( 'mapDataString', mapDataString );

		mapper.settings = { ...mapData.settings };
		b8.Utilities.checkObject( 'mapper.settings', mapper.settings );

		// Set game name.
		// Some settings use this, for things like local storage keys.
		if ( mapper.settings.gameName ) {
			console.log( `Starting game: ${mapper.settings.gameName}` );
			b8.CONFIG.NAME = mapper.settings.gameName;
		}

		// Setup player.
		mapper.player = b8.ECS.create(
			{
				Type: { name: 'player' },
				Loc: { row: 0, col: 0 },
				Direction: { dx: 0, dy: 0 },
				Sprite: {
					type: 'actor',
					tile: parseInt( mapper.settings.character ) || 6,
					fg: parseInt( mapper.settings.characterColor ) || 10,
					bg: 0,
					depth: 100,
				},
				CharacterAnimation: {
					name: 'idle',
					default: 'idle',
					duration: 0,
				}
			}
		);

		// Convert maze strings to 2D array of characters.
		const maze = b8.Tilemap.convertFromText( mapDataString );
		const map = b8.Tilemap.createFromArray( maze, mapData.tiles );

		mapper.maps.push(
			{
				"name": mapName,
				"screenWidth": mapData.screenWidth,
				"screenHeight": mapData.screenHeight,
				"screenCountX": mapData.screenCountX,
				"screenCountY": mapData.screenCountY,
				"mapWidth": map[ 0 ].length,
				"mapHeight": map.length,
				"map": map,
			}
		);

		if ( setCurrentMap ) {
			mapper.setCurrentMap( mapName );
		}

		// Add objects.
		for ( const obj of mapData.objects ) {

			const handler = mapper.types[ obj.type ];
			if ( handler?.spawn ) {
				shouldAdd = handler.spawn( obj.x, obj.y, obj.props );
			}

		}

		// Check for player start position object.
		const start = mapData.objects.find( obj => obj.type === 'start' );
		if ( !start ) {
			b8.Utilities.fatal( "Map data must include a 'start' object." );
		}

		// Count coin objects.
		const coinCount = mapData.objects.filter( obj => obj.type === 'coin' ).length;
		b8.data.totalCoins = coinCount;

		// Add systems.
		b8.ECS.addSystem( 'characterAnimation', mapper.systems.characterAnimation );

		// Play music.
		if ( mapper.settings.bgm ) {
			b8.Music.play( world.settings.bgm );
		}

		// Validate map data.
		if (
			mapper.settings.splash &&
			mapper.settings.splash.length > 10 &&
			b8.Tilemap.validateTilemap( mapper.settings.splash )
		) {

			mapper.bg.splash = b8.Tilemap.load( mapper.settings.splash );

		}

	},


	/**
	 * Update the game state.
	 *
	 * @param {number} dt - The delta time since the last update call.
	 * @returns {void}
	 */
	update: function( dt ) {

		b8.ECS.run( dt );

	},


	/**
	 * Draw an actor at its location with optional offsets.
	 *
	 * @param {Object} actor - The actor entity with properties: id, col, row, fg, bg, animation.
	 * @returns {void}
	 */
	drawActor: function( actor ) {

		if ( !mapper.currentMap ) {
			b8.Utilities.error( "No current map set." );
			return;
		}

		const screenPosition = mapper.camera.getScreenPosition( actor.col, actor.row );

		const actorX = actor.col - screenPosition.col;
		const actorY = actor.row - screenPosition.row;

		// Draw the actor at its position with the specified offset.
		b8.locate( actorX + offsetX, actorY + offsetY );
		b8.color( actor.fg, actor.bg );
		b8.drawActor( actor.id, actor.animation );

	},


	/**
	 * Render all entities on the screen with optional offsets.
	 *
	 * @param {number} offsetX - Horizontal offset for rendering.
	 * @param {number} offsetY - Vertical offset for rendering.
	 * @returns {void}
	 */
	render: function( offsetX = 0, offsetY = 0 ) {

		// Handy caches so look-ups are O(1) inside the loop
		const list = [];

		for ( const id of b8.ECS.query( 'Sprite', 'Loc' ) ) {
			const spr = b8.ECS.getComponent( id, 'Sprite' );
			const loc = b8.ECS.getComponent( id, 'Loc' );
			const anim = b8.ECS.getComponent( id, 'CharacterAnimation' );
			list.push( { spr, loc, anim } );
		}

		// nothing to draw
		if ( list.length === 0 ) return;

		// Depth-sort (default depth = 0)
		list.sort( ( a, b ) => ( a.spr.depth ?? 0 ) - ( b.spr.depth ?? 0 ) );

		// Draw
		for ( const { spr, loc, anim } of list ) {

			const pos = mapper.camera.getTilePosition( loc.col, loc.row );

			b8.locate( pos.col + offsetX, pos.row + offsetY );
			b8.color( spr.fg ?? 15, spr.bg ?? 0 );

			if ( 'actor' === spr.type ) {
				b8.drawActor( parseInt( spr.tile ), anim.name );
			} else {
				b8.printChar( parseInt( spr.tile ) );
			}

		}

	},


	/**
	 * Draw the visible portion of the current map to the screen.
	 *
	 * @returns {void}
	 */
	drawScreen: function() {

		if ( !mapper.currentMap ) {
			b8.Utilities.error( "No current map set." );
			return;
		}

		let loc = b8.ECS.getComponent( mapper.player, 'Loc' );
		if ( !loc ) loc = { col: 0, row: 0 };
		const screenPosition = mapper.camera.getScreenPosition( loc.col, loc.row );
		const currentMap = mapper.currentMap;

		b8.Tilemap.draw(
			currentMap.map,
			screenPosition.col,
			screenPosition.row,
			screenPosition.w,
			screenPosition.h
		);

	},


	/**
	 * Set the current active map by name.
	 *
	 * @param {string} mapName - The name of the map to set as current.
	 * @returns {void}
	 */
	setCurrentMap: function( mapName ) {

		let currentMap = mapper.maps.find( map => map.name === mapName );
		if ( !currentMap ) {
			console.error( `Map "${mapName}" not found.` );
			return;
		}

		mapper.currentMap = currentMap;

	},


	/**
	 * Set a tile at the specified coordinates in the current map.
	 *
	 * @param {number} x - The x-coordinate (column) of the tile to set.
	 * @param {number} y - The y-coordinate (row) of the tile to set.
	 * @param {string} tile - The tile character to set at the specified coordinates.
	 * @returns {void}
	 */
	setTile: function( x, y, tile ) {

		if ( !mapper.currentMap ) {
			b8.Utilities.error( "No current map set." );
			return;
		}

		if (
			x < 0 ||
			y < 0 ||
			y >= mapper.currentMap.map.mapHeight ||
			x >= mapper.currentMap.map.mapWidth
		) {
			b8.Utilities.error( "Mapper.setTile, coordinates out of bounds." );
			return;
		}

		mapper.currentMap.map[ y ][ x ] = tile;

	},


	/**
	 * Get the action verb for a given entity ID.
	 *
	 * @param {number} id - The entity ID to get the verb for.
	 * @returns {string} The action verb associated with the entity, or an empty string if none exists.
	 */
	getVerbForEntity: ( id ) => {

		const a = b8.ECS.getComponent( id, 'Action' );
		return a?.verb ?? '';

	},


	/**
	 * Get the action verb for the entity directly in front of the player.
	 *
	 * @param {number} playerId - The player entity ID.
	 * @returns {string} The action verb of the entity ahead, or an empty string if none exists.
	 */
	promptAhead: ( playerId ) => {

		const ids = mapper.entitiesAhead( playerId );
		for ( const id of ids ) {
			const verb = mapper.getVerbForEntity( id );
			if ( verb ) return verb;
		}
		return '';

	},


	/**
	 * Get the tile coordinates directly in front of the player.
	 *
	 * @param {number} playerId - The player entity ID.
	 * @returns {Object} An object with x and y properties representing the tile coordinates ahead of the player.
	 */
	ahead: ( playerId ) => {

		const loc = b8.ECS.getComponent( playerId, 'Loc' );
		const dir = b8.ECS.getComponent( playerId, 'Direction' ); // {dx,dy}
		const x = loc.col + ( dir.dx || 0 );
		const y = loc.row + ( dir.dy || 0 );
		return { x, y };

	},


	/**
	 * Get all entities located directly in front of the player.
	 *
	 * @param {number} playerId - The player entity ID.
	 * @returns {Array} An array of entity IDs located ahead of the player.
	 */
	entitiesAhead: ( playerId ) => {

		const { x, y } = mapper.ahead( playerId );
		return b8.ECS.entitiesAt( x, y ) ?? [];

	},


	/**
	 * Handle collision when the player attempts to move to a new tile.
	 *
	 * @param {number} x - The current x-coordinate (column) of the player.
	 * @param {number} y - The current y-coordinate (row) of the player.
	 * @param {number} newCol - The target x-coordinate (column) the player is moving to.
	 * @param {number} newRow - The target y-coordinate (row) the player is moving to.
	 * @param {number} dx - The change in x (column) direction.
	 * @param {number} dy - The change in y (row) direction.
	 * @return {boolean} True if the movement is blocked by a collision, false otherwise.
	 */
	doCollision: function( x, y, newCol, newRow, dx, dy ) {

		// ECS collision.
		if ( mapper.systems.tryPushing( x, y, dx, dy ) ) return true;

		// every entity occupying the target tile
		for ( const id of b8.ECS.entitiesAt( newCol, newRow ) ) {

			const typeComp = b8.ECS.getComponent( id, 'Type' );
			const handler = typeComp ? mapper.types[ typeComp.name ] : null;

			if ( handler?.onCharacterCollision ) {
				const blocked = handler.onCharacterCollision( id, newCol, newRow, dx, dy );
				if ( blocked ) return true;
			}

			const isSolid = b8.ECS.hasComponent( id, 'Solid' );
			if ( isSolid ) return true;

		}

		return false;

	},


	/**
	 * Perform the action associated with the entity directly in front of the player.
	 *
	 * @param {number} playerId - The player entity ID.
	 * @returns {void}
	 */
	doAction: ( playerId ) => {

		const action = mapper.promptAhead( playerId );

		console.log( 'do action ', action );

		if ( action && mapper.actions[ action ] ) {
			mapper.actions[ action ]( playerId );
		}

	},


};

