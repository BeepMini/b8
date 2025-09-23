const mapper = {

	maps: [],

	currentMap: null,

	types: {},
	systems: {},
	actions: {},
	settings: {},
	bg: {},

	player: null,



	play: function( mapData ) {

		beep8.Utilities.checkObject( 'mapData', mapData );

		mapper.load( mapData );

		beep8.Scene.add( 'menu', mapper.sceneMenu );
		beep8.Scene.add( 'game', mapper.sceneGame );
		beep8.Scene.set( 'menu' );

	},



	load: function( mapData, mapName = 'world', setCurrentMap = true ) {

		beep8.Utilities.checkObject( 'mapData', mapData );

		// Combine map data into single string.
		const mapDataString = mapData.map.join( '\n' );
		beep8.Utilities.checkString( 'mapDataString', mapDataString );

		mapper.settings = { ...mapData.settings };
		beep8.Utilities.checkObject( 'mapper.settings', mapper.settings );

		console.log( 'settings', mapper.settings );

		// Setup player.
		mapper.player = beep8.ECS.create(
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
		const maze = beep8.Tilemap.convertFromText( mapDataString );
		const map = beep8.Tilemap.createFromArray( maze, mapData.tiles );

		console.log( 'map', map );
		console.log( 'maze', maze );

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
			// console.log( obj.type, handler );
			if ( handler?.spawn ) {
				shouldAdd = handler.spawn( obj.x, obj.y, obj.props );
			}

		}

		// Add systems.
		beep8.ECS.addSystem( 'characterAnimation', mapper.systems.characterAnimation );

		// Play music.
		if ( mapper.settings.bgm ) {
			beep8.Music.play( world.settings.bgm );
		}

		// Validate map data.
		if (
			mapper.settings.splash &&
			mapper.settings.splash.length > 10 &&
			beep8.Tilemap.validateTilemap( mapper.settings.splash )
		) {

			mapper.bg.splash = beep8.Tilemap.load( mapper.settings.splash );

		}

	},



	update: function( dt ) {

		beep8.ECS.run( dt );

	},


	drawActor: function( actor ) {

		if ( !mapper.currentMap ) {
			beep8.Utilities.error( "No current map set." );
			return;
		}

		const screenPosition = mapper.camera.getScreenPosition( actor.col, actor.row );

		const actorX = actor.col - screenPosition.col;
		const actorY = actor.row - screenPosition.row;

		// Draw the actor at its position with the specified offset.
		beep8.locate( actorX + offsetX, actorY + offsetY );
		beep8.color( actor.fg, actor.bg );
		beep8.drawActor( actor.id, actor.animation );

	},


	render: function( offsetX = 0, offsetY = 0 ) {

		// Handy caches so look-ups are O(1) inside the loop
		const list = [];

		for ( const id of beep8.ECS.query( 'Sprite', 'Loc' ) ) {
			const spr = beep8.ECS.getComponent( id, 'Sprite' );
			const loc = beep8.ECS.getComponent( id, 'Loc' );
			const anim = beep8.ECS.getComponent( id, 'CharacterAnimation' );
			list.push( { spr, loc, anim } );
		}

		// nothing to draw
		if ( list.length === 0 ) return;

		// Depth-sort (default depth = 0)
		list.sort( ( a, b ) => ( a.spr.depth ?? 0 ) - ( b.spr.depth ?? 0 ) );

		// Draw
		for ( const { spr, loc, anim } of list ) {

			const pos = mapper.camera.getTilePosition( loc.col, loc.row );

			beep8.locate( pos.col + offsetX, pos.row + offsetY );
			beep8.color( spr.fg ?? 15, spr.bg ?? 0 );

			if ( 'actor' === spr.type ) {
				beep8.drawActor( parseInt( spr.tile ), anim.name );
			} else {
				beep8.printChar( parseInt( spr.tile ) );
			}

		}

	},


	drawScreen: function() {

		if ( !mapper.currentMap ) {
			beep8.Utilities.error( "No current map set." );
			return;
		}

		const loc = beep8.ECS.getComponent( mapper.player, 'Loc' );
		const screenPosition = mapper.camera.getScreenPosition( loc.col, loc.row );
		const currentMap = mapper.currentMap;

		beep8.Tilemap.draw(
			currentMap.map,
			screenPosition.col,
			screenPosition.row,
			screenPosition.w,
			screenPosition.h
		);

	},


	setCurrentMap: function( mapName ) {

		let currentMap = mapper.maps.find( map => map.name === mapName );
		if ( !currentMap ) {
			console.error( `Map "${mapName}" not found.` );
			return;
		}

		mapper.currentMap = currentMap;

	},


	setTile: function( x, y, tile ) {

		if ( !mapper.currentMap ) {
			beep8.Utilities.error( "No current map set." );
			return;
		}

		if (
			x < 0 ||
			y < 0 ||
			y >= mapper.currentMap.map.mapHeight ||
			x >= mapper.currentMap.map.mapWidth
		) {
			beep8.Utilities.error( "Mapper.setTile, coordinates out of bounds." );
			return;
		}

		mapper.currentMap.map[ y ][ x ] = tile;

	},


	getVerbForEntity: ( id ) => {

		const a = beep8.ECS.getComponent( id, 'Action' );
		return a?.verb ?? '';

	},

	promptAhead: ( playerId ) => {

		const ids = mapper.entitiesAhead( playerId );
		for ( const id of ids ) {
			const verb = mapper.getVerbForEntity( id );
			if ( verb ) return verb;
		}
		return '';

	},


	// Tile in front of the player
	ahead: ( playerId ) => {

		const loc = beep8.ECS.getComponent( playerId, 'Loc' );
		const dir = beep8.ECS.getComponent( playerId, 'Direction' ); // {dx,dy}
		const x = loc.col + ( dir.dx || 0 );
		const y = loc.row + ( dir.dy || 0 );
		return { x, y };

	},


	// Entities on that tile
	entitiesAhead: ( playerId ) => {

		const { x, y } = mapper.ahead( playerId );
		return beep8.ECS.entitiesAt( x, y ) ?? [];

	},


	doCollision: function( x, y, newCol, newRow, dx, dy ) {

		// ECS collision.
		if ( mapper.systems.tryPushing( x, y, dx, dy ) ) return true;

		// every entity occupying the target tile
		for ( const id of beep8.ECS.entitiesAt( newCol, newRow ) ) {

			const typeComp = beep8.ECS.getComponent( id, 'Type' );
			const handler = typeComp ? mapper.types[ typeComp.name ] : null;

			if ( handler?.onCharacterCollision ) {
				const blocked = handler.onCharacterCollision( id, newCol, newRow, dx, dy );
				if ( blocked ) return true;
			}

			const isSolid = beep8.ECS.hasComponent( id, 'Solid' );
			if ( isSolid ) return true;

		}

		return false;

	},


	doAction: ( playerId ) => {

		const action = mapper.promptAhead( playerId );

		console.log( 'do action ', action );

		if ( action && mapper.actions[ action ] ) {
			mapper.actions[ action ]( playerId );
		}

	},


};

