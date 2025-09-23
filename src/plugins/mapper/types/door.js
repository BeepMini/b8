mapper.types.door = {

	TILE_DOOR_OPEN: 216,
	TILE_DOOR_DEFAULT: 219,

	spawn: function( col, row, props ) {

		const icon = props.icon || mapper.types.door.TILE_DOOR_DEFAULT;

		const doorProps = {
			Type: { name: 'door' },
			Loc: { col, row },
			Sprite: {
				tile: icon,
				fg: props.fg || 14,
				bg: props.bg || 0
			},
			Portal: {
				name: props.name || null,
				target: props.leadsTo || ''
			},
		};

		if ( icon !== mapper.types.door.TILE_DOOR_OPEN ) {
			doorProps.Solid = {};
		}

		return beep8.ECS.create( doorProps );

	},


	onCharacterCollision: function( id, newCol, newRow, dx, dy ) {

		// If the door is open, allow passing through.
		if ( !beep8.ECS.hasComponent( id, 'Solid' ) ) {

			// Check if the player is trying to step onto a portal.
			mapper.systems.tryPortal( newCol, newRow );
			return false;

		}

		const sprite = beep8.ECS.getComponent( id, 'Sprite' );
		const keyName = `key-${sprite.fg ?? "default"}`;

		if ( beep8.Inventory.has( keyName ) ) {
			beep8.ECS.removeComponent( id, 'Solid' );
			sprite.tile = mapper.types.door.TILE_DOOR_OPEN;
			beep8.Sfx.play( 'ui/click/004' );
			return true;
		}

		return true;

	},

};
