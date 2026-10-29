/**
 * Load a map into the game.
 *
 * @param {Object} mapData - The map data object containing map layout, tiles, objects, and settings.
 * @returns {void}
 */
mapper.load = function( mapData ) {

	// It's a new game so reset everything.
	b8.ECS.reset();
	mapper.maps = [];
	mapper.settings = {};
	mapper.bg = {};
	mapper.currentMapId = null;
	mapper.isGameOverPending = false;

	b8.Utilities.checkObject( 'mapData', mapData );

	// Capture the original engine name once so the loader can safely restore it
	// when a map does not provide its own storage-friendly game name.
	if ( mapper.defaultGameName === null ) {
		mapper.defaultGameName = b8.CONFIG.NAME;
	}

	if ( mapData.version === 1 ) mapData = mapper.upgradeMapDataV1toV2( mapData );

	mapper.settings = { ...mapData.settings };
	b8.Utilities.checkObject( 'mapper.settings', mapper.settings );

	// Loop through levels and set them up.
	mapData.levels.forEach(
		( level, index ) => {

			const mapDataString = level.mapData.join( '\n' );
			b8.Utilities.checkString( `mapDataString for level ${index}`, mapDataString );

			const mapArray = b8.Tilemap.convertFromText( mapDataString );
			const map = b8.Tilemap.createFromArray( mapArray, mapData.tiles );

			// Add mapId to each object
			const objects = ( level.objects || [] ).map(
				obj => ( { ...obj, mapId: index } )
			);

			mapper.maps.push(
				{
					"screenWidth": mapData.screenWidth,
					"screenHeight": mapData.screenHeight,
					"screenCountX": level.screenCountX,
					"screenCountY": level.screenCountY,
					"objects": objects,
					"mapWidth": map[ 0 ].length,
					"mapHeight": map.length,
					"mapData": map,
				}
			);

		}
	);

	// Set game name.
	// Some settings use this, for things like local storage keys. Reset back to
	// the original engine name when the map does not define one so state does
	// not leak between different games loaded in the same session.
	b8.CONFIG.NAME = mapper.settings.gameName || mapper.defaultGameName;

	// Setup player.
	mapper.player = mapper.types.player.spawn();

	mapper.lastPosition = {
		col: 0,
		row: 0,
		map: 0
	};

	// This sets the map and then loads the objects.
	mapper.setCurrentMap( 0 );

	// Count all coin objects.
	// Loop through all levels and count coins
	let coinCount = 0;
	for ( const level of mapper.maps ) {
		coinCount += level.objects.filter( obj => obj.type === 'coin' ).length;
	}
	b8.data.totalCoins = coinCount;

	// Add systems.

	// AI runs first so it can select an intent before path following moves it.
	b8.ECS.addSystem( 'ai', mapper.systems.ai );

	// These systems all receive frame delta time and keep the world alive even
	// while the player is standing still.
	b8.ECS.addSystem( 'action-cooldown', mapper.systems.actionCooldown );
	b8.ECS.addSystem( 'characterAnimation', mapper.systems.characterAnimation );
	b8.ECS.addSystem( 'pathFollower', mapper.systems.pathFollower );
	b8.ECS.addSystem( 'pressurePlate', mapper.systems.pressurePlate );
	b8.ECS.addSystem( 'sprite', mapper.systems.sprite );
	b8.ECS.addSystem( 'pickup', mapper.systems.pickup );
	b8.ECS.addSystem( 'vfx', mapper.systems.vfx );
	b8.ECS.addSystem( 'health', mapper.systems.health );
	b8.ECS.addSystem( 'bomb', mapper.systems.bomb );
	b8.ECS.addSystem( 'fire', mapper.systems.fire );
	b8.ECS.addSystem( 'fireSmall', mapper.systems.fireSmall );
	b8.ECS.addSystem( 'flammable', mapper.systems.flammable );

	// Play music.
	if ( mapper.settings.bgm ) b8.Music.play( mapper.settings.bgm );

	// Validate map data.
	if (
		mapper.settings.splash &&
		mapper.settings.splash.length > 10 &&
		b8.Tilemap.validateTilemap( mapper.settings.splash )
	) {

		mapper.bg.splash = b8.Tilemap.load( mapper.settings.splash );

	}

};


/**
 * Upgrade map data from version 1 to version 2.
 *
 * @param {Object} mapData - The map data object in version 1 format.
 * @returns {Object} The upgraded map data object in version 2 format.
 */
mapper.upgradeMapDataV1toV2 = function( mapData ) {

	const level = {
		mapData: [ ...mapData.map ],
		objects: [ ...mapData.objects ],
		screenCountX: mapData.screenCountX,
		screenCountY: mapData.screenCountY,
	};

	// Create a levels object.
	mapData.levels = [ level ];

	// Update version.
	mapData.version = 2;

	// Unset old properties.
	delete mapData.map;
	delete mapData.objects;
	delete mapData.screenCountX;
	delete mapData.screenCountY;

	return mapData;

};


/**
 * Set the active map by its numeric index, rebuilding its entities when needed.
 *
 * @param {number} mapId - Index in mapper.maps.
 * @param {boolean} [forceLoad=false] - Reload even when this map is already active.
 * @returns {void}
 */
mapper.setCurrentMap = function( mapId, forceLoad = false ) {

	b8.Utilities.checkInt( 'mapId', mapId );

	if ( mapId < 0 || mapId >= mapper.maps.length ) {
		b8.Utilities.fatal( `Map ID "${mapId}" is out of bounds.` );
		return;
	}

	// Check if already on this map.
	if ( mapId === mapper.currentMapId && !forceLoad ) return;

	// Set current map id.
	mapper.currentMapId = mapId;

	let currentMap = mapper.maps[ mapId ];

	// Add objects.
	if ( !currentMap.objects ) currentMap.objects = [];

	// Delete all ecs entities except the player.
	const allEntities = b8.ECS.getAllEntities();
	for ( const entityId of allEntities ) {

		const typeComp = b8.ECS.getComponent( entityId, 'Type' );
		if ( typeComp?.name === 'player' ) continue;
		b8.ECS.removeEntity( entityId );

	}

	// Spawn all objects for the current map.
	for ( const obj of currentMap.objects ) {

		const handler = mapper.types[ obj.type ];
		if ( handler?.spawn ) handler.spawn( obj.x, obj.y, obj.props );

	}

	// Delete any start objects from the current map.
	// It's no longer needed.
	mapper.maps[ mapper.currentMapId ].objects = mapper.maps[ mapper.currentMapId ].objects.filter(
		obj => obj.type !== 'start'
	);

};
