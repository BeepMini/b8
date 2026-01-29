const mapper = {

	// All loaded maps.
	maps: [],

	// Currently active map.
	currentMapId: null,

	// Map of entity types to their handlers.
	types: {},
	systems: {},
	actions: {},
	settings: {},
	bg: {},
	lastPosition: null,

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

		mapper.mapData = mapData;

		mapper.reset();

		b8.Scene.add( 'menu', mapper.sceneMenu );
		b8.Scene.add( 'game', mapper.sceneGame );
		b8.Scene.add( 'gameover', mapper.sceneGameOver );
		b8.Scene.set( 'menu' );
		// b8.Scene.set( 'gameover' );

	},


	/**
	 * Reset the game state to the initial map data.
	 *
	 * @returns {void}
	 */
	reset: function() {

		mapper.load( mapper.mapData );

	},


	/**
	 * Continue the game from the last doorway.
	 *
	 * @returns {void}
	 */
	continue: function() {

		b8.ECS.setComponent(
			mapper.player,
			'Health',
			{
				value: 6,
				max: 12
			}
		);

		// Set map and force reload of map to reset properties.
		mapper.setCurrentMap( mapper.lastPosition.map, true );

		b8.ECS.setLoc(
			mapper.player,
			mapper.lastPosition.col,
			mapper.lastPosition.row
		);

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

		const screenPosition = mapper.camera.getScreenPosition( actor.col, actor.row );

		const actorX = actor.col - screenPosition.col;
		const actorY = actor.row - screenPosition.row;

		// Draw the actor at its position with the specified offset.
		b8.locate( actorX + offsetX, actorY + offsetY );
		b8.color( actor.fg, actor.bg );
		b8.drawActor( actor.id, actor.animation );

	},


	/**
	 * Set a delay for key presses to prevent rapid actions.
	 *
	 * @returns {void}
	 */
	delayKeyPress: function( id ) {

		console.log( `Key press delay for entity ${id}` );
		b8.ECS.setComponent( id, 'ActionCooldown', { time: mapper.CONFIG.keyPressDelay } );

	},


	/**
	 * Set the player's walking animation based on movement direction.
	 *
	 * @param {number} playerId - The entity ID of the player.
	 * @param {number} dx - The change in x (column) direction.
	 * @param {number} dy - The change in y (row) direction.
	 * @returns {void}
	 */
	setPlayerWalkAnimation: function( playerId, dx, dy ) {

		const anim = b8.ECS.getComponent( playerId, 'CharacterAnimation' );

		if ( dy > 0 ) anim.name = 'move-down';
		if ( dy < 0 ) anim.name = 'move-up';
		if ( dx > 0 ) anim.name = 'move-right';
		if ( dx < 0 ) anim.name = 'move-left';

		anim.duration = 0.3;

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
			const nudgeCol = spr.nudgeCol || 0;
			const nudgeRow = spr.nudgeRow || 0;

			b8.locate( pos.col + offsetX, pos.row + offsetY );
			b8.color( spr.fg ?? 15, spr.bg ?? 0 );

			switch ( spr.type ) {

				case 'actor':

					b8.drawActor( parseInt( spr.tile ), anim.name, nudgeCol, nudgeRow );

					break;

				case 'vfx':

					b8.Vfx.draw( spr.id, spr.startTime, nudgeCol, nudgeRow );

					break;

				case 'vfx-outline':

					b8.Vfx.drawOutline( spr.id, spr.startTime, nudgeCol, nudgeRow );

					break;

				default:

					b8.printChar( parseInt( spr.tile ) );

					break;

			}

		}

	},


	/**
	 * Draw the visible portion of the current map to the screen.
	 *
	 * @returns {void}
	 */
	drawScreen: function() {

		if ( !mapper.isValidMapId( mapper.currentMapId ) ) {
			b8.Utilities.fatal( "No current map set." );
			return;
		}

		let loc = b8.ECS.getComponent( mapper.player, 'Loc' );
		if ( !loc ) loc = { col: 0, row: 0 };
		const screenPosition = mapper.camera.getScreenPosition( loc.col, loc.row );
		const currentMap = mapper.getCurrentMap();

		b8.Tilemap.draw(
			currentMap.mapData,
			screenPosition.col,
			screenPosition.row,
			screenPosition.w,
			screenPosition.h
		);

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
	 * @param {string} propertyName - The name of the property to retrieve.
	 * @returns {string} The action verb associated with the entity, or an empty string if none exists.
	 */
	getPropForEntity: ( id, propertyName = null ) => {

		const a = b8.ECS.getComponent( id, 'Action' );

		if ( !a ) return '';
		if ( !propertyName ) return '';
		if ( !( propertyName in a ) ) return '';

		return a[ propertyName ] ?? '';

	},


	/**
	 * Retrieve the currently active map.
	 *
	 * @returns {Object} The current map object.
	 */
	getCurrentMap: () => {

		return mapper.maps[ mapper.currentMapId ];

	},


	/**
	 * Get the pixel width of the current map.
	 *
	 * @returns {number} The width of the current map in tiles.
	 */
	getMapWidth: () => {

		const currentMap = mapper.getCurrentMap();
		return currentMap.mapWidth;

	},


	/**
	 * Get the pixel height of the current map.
	 *
	 * @returns {number} The height of the current map in tiles.
	 */
	getMapHeight: () => {

		const currentMap = mapper.getCurrentMap();
		return currentMap.mapHeight;

	},


	/**
	 * Get the action verb for the entity directly in front of the player.
	 *
	 * @param {number} playerId - The player entity ID.
	 * @param {string|null} propertyName - The name of the property to retrieve.
	 * @returns {string} The action verb of the entity ahead, or an empty string if none exists.
	 */
	promptAhead: ( playerId, propertyName = null ) => {

		if ( !propertyName ) return '';

		const ids = mapper.entitiesAhead( playerId );

		for ( const id of ids ) {
			const verb = mapper.getPropForEntity( id, propertyName );
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

		if ( !loc || !dir ) return { x: 0, y: 0 };

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
	 * Get all entities located next to the player (up, down, left, right).
	 *
	 * @param {number} playerId - The player entity ID.
	 * @returns {Array} An array of entity IDs located next to the player.
	 */
	entitiesNextTo: ( playerId ) => {

		const loc = b8.ECS.getComponent( playerId, 'Loc' );
		if ( !loc ) return [];

		const adjacentEntities = new Set();

		const directions = [
			{ dx: -1, dy: 0 }, // left
			{ dx: 1, dy: 0 },  // right
			{ dx: 0, dy: -1 }, // up
			{ dx: 0, dy: 1 }   // down
		];

		for ( const dir of directions ) {
			const x = loc.col + dir.dx;
			const y = loc.row + dir.dy;
			const entities = b8.ECS.entitiesAt( x, y );
			if ( entities ) {
				entities.forEach( id => adjacentEntities.add( id ) );
			}
		}

		return Array.from( adjacentEntities );

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
	 * @param {string} propertyName - The name of the property to check for an action.
	 * @returns {boolean} True if an action was performed, false otherwise.
	 */
	doAction: ( playerId, propertyName ) => {

		if ( !propertyName ) return false;

		const ac = b8.ECS.getComponent( playerId, 'ActionCooldown' );
		if ( !ac ) {
			mapper.delayKeyPress( playerId );
		} else {
			if ( ac.time > 0 ) return false;
		}

		const action = mapper.promptAhead( playerId, propertyName );

		if ( action && mapper.actions[ action ] ) {
			mapper.actions[ action ]( playerId );
		}

		mapper.delayKeyPress( playerId );

		return true;

	},


	/**
	 * Perform an attack action by the player.
	 *
	 * @param {number} playerId - The player entity ID.
	 * @param {string} propertyName - The name of the property to check for an attack action.
	 * @returns {void}
	 */
	doAttack: ( playerId, propertyName ) => {

		if ( !mapper.doAction( playerId, propertyName ) ) return;

		const ahead = mapper.ahead( playerId );

		// Do swipe VFX.
		mapper.types.vfx.spawn(
			ahead.x, ahead.y,
			{ id: 'swipe', fg: 15, bg: 0, type: 'vfx-outline' }
		);

	},


	/**
	 * Update the move delay to control player movement speed.
	 *
	 * @param {number} amount - The amount of delay to set (in seconds).
	 * @returns {void}
	 */
	updateMoveDelay: function( amount = mapper.CONFIG.moveDelay ) {

		// We use Math.max to ensure we don't reduce an existing longer delay.
		mapper.sceneGame.moveDelay = Math.max( amount, mapper.sceneGame.moveDelay );

	},


	/**
	 * Check if the provided map ID is valid.
	 *
	 * @param {number} mapId - The map ID to validate.
	 * @returns {boolean} True if the map ID is valid, false otherwise.
	 */
	isValidMapId: ( mapId ) => {

		return typeof mapId === 'number' && mapId >= 0;

	},


	/**
	 * Check if there is an entity of a specific type at the given coordinates.
	 *
	 * @param {number} col - The column coordinate to check.
	 * @param {number} row - The row coordinate to check.
	 * @param {string} type - The type of the entity to look for.
	 * @returns {boolean} True if an entity of the specified type exists at the coordinates, false otherwise.
	 */
	hasEntityAt: function( col, row, type ) {

		const entities = b8.ECS.entitiesAt( col, row );

		for ( const id of entities ) {
			const typeComp = b8.ECS.getComponent( id, 'Type' );
			if ( typeComp?.name === type ) return true;
		}

		return false;

	},


	/**
	 * Remove an object of a specific type at the given coordinates from the current map.
	 *
	 * @param {number} col - The column coordinate of the object to remove.
	 * @param {number} row - The row coordinate of the object to remove.
	 * @param {string} type - The type of the object to remove.
	 * @returns {void}
	 */
	removeObjectAt: function( col, row, type ) {

		const currentMap = mapper.getCurrentMap();

		// Filter out the object matching the specified coordinates and type.
		currentMap.objects = currentMap.objects.filter(
			( obj ) => !( obj.x === col && obj.y === row && obj.type.startsWith( type ) )
		);

	},


	/**
	 * Change properties of an object at the given coordinates in the current map.
	 *
	 * @param {number} col - The column coordinate of the object to change.
	 * @param {number} row - The row coordinate of the object to change.
	 * @param {string} type - The current type of the object to change.
	 * @param {Object} properties - An object containing the properties to update.
	 * @returns {void}
	 */
	changeObjectPropertiesAt: function( col, row, type, properties = {} ) {

		const currentMap = mapper.getCurrentMap();

		// Find the object matching the specified coordinates and type.
		for ( const obj of currentMap.objects ) {
			if ( obj.x === col && obj.y === row && obj.type.startsWith( type ) ) {
				Object.assign( obj, properties );
				return;
			}
		}

	},


	/**
	 * Change the type of an object at the given coordinates in the current map.
	 *
	 * @param {number} col - The column coordinate of the object to change.
	 * @param {number} row - The row coordinate of the object to change.
	 * @param {string} type - The current type of the object to change.
	 * @param {string} newType - The new type to set for the object.
	 * @returns {void}
	 */
	changeObjectTypeAt: function( col, row, type, newType ) {

		const currentMap = mapper.getCurrentMap();

		// Find the object matching the specified coordinates and type.
		for ( const obj of currentMap.objects ) {
			if ( obj.x === col && obj.y === row && obj.type.startsWith( type ) ) {
				obj.type = newType;
				return;
			}
		}

	},


	/**
	 * Give rewards to the player.
	 *
	 * @param {number} playerId - The entity ID of the player.
	 * @param {Array} rewards - An array of reward objects to give to the player.
	 * @returns {void}
	 */
	giveRewards: function( playerId, rewards = [] ) {

		if ( !rewards || rewards.length === 0 ) return;

		rewards.forEach(
			( reward ) => {

				if ( !reward.type ) return;
				if ( !reward.props ) reward.props = {};

				const fn = mapper.types[ reward.type ]?.pickupHandler;
				if ( fn ) fn( playerId, reward );

			}
		);

	},


	/**
	 * Invoke a handler function for a given entity based on its type.
	 *
	 * @param {number} entityId - The entity ID to invoke the handler for.
	 * @param {string} handlerName - The name of the handler function to invoke.
	 * @returns {boolean} The result of the handler function, or false if not found.
	 */
	doHandler: function( entityId, handlerName ) {

		// Retrieve the Type component for the given entity ID
		const type = b8.ECS.getComponent( entityId, 'Type' );
		const handler = type && mapper.types[ type.name ];

		if ( handler?.[ handlerName ] ) return handler[ handlerName ]( entityId );

		return false;

	},


	/**
	 * Repeat the last step of a path a specified number of times.
	 *
	 * @param {Array} path - The path array to modify.
	 * @param {number} count - The number of times to repeat the last step.
	 * @returns {void}
	 */
	repeatLastValue: function( path, count ) {

		const last = path.at( -1 );
		path.push( ...Array( count ).fill( last ) );

	},

};

