mapper.types.door = {

	TILE_DOOR_OPEN: 216,
	TILE_DOOR_DEFAULT: 219,

	FLAMMABLE_DOOR_TILES: [ 221 ],

	spawn: function( col, row, props = {} ) {

		const icon = parseInt( props.icon ) || mapper.types.door.TILE_DOOR_DEFAULT;

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

		if ( mapper.types.door.FLAMMABLE_DOOR_TILES.includes( icon ) ) {
			doorProps.Flammable = {
				temperature: 0,
			};
		}

		return b8.ECS.create( doorProps );

	},


	onCharacterCollision: function( id, newCol, newRow, dx, dy ) {

		// If the door is open, allow passing through.
		if ( !b8.ECS.hasComponent( id, 'Solid' ) ) {

			// Check if the player is trying to step onto a portal.
			mapper.systems.tryPortal( newCol, newRow );
			return false;

		}

		const sprite = b8.ECS.getComponent( id, 'Sprite' );
		const keyName = `key-${sprite.fg ?? "default"}`;

		if ( b8.Inventory.has( keyName ) ) {
			mapper.types.door.openDoor( id, sprite );
			return true;
		}

		return true;

	},


	/**
	 * Open the door by changing its sprite and removing solid component.
	 *
	 * @param {number} id - The entity ID of the door.
	 * @param {Object} sprite - The Sprite component of the door.
	 * @returns {void}
	 */
	openDoor: function( id, sprite ) {

		sprite.tile = mapper.types.door.TILE_DOOR_OPEN;

		// Remove solid component.
		b8.ECS.removeComponent( id, 'Solid' );

		// Remove flammable component to prevent re-burning.
		b8.ECS.removeComponent( id, 'Flammable' );

		b8.Sfx.play( 'ui/click/004' );

		const loc = b8.ECS.getComponent( id, 'Loc' );

		mapper.changeObjectTypeAt(
			loc.col,
			loc.row,
			'door',
			'doorOpen'
		);

	},


	/**
	 * Handle burning of door entities.
	 *
	 * @param {number} id - The entity ID of the door.
	 * @returns {boolean} False to prevent removal of the door entity.
	 */
	burnHandler: function( id ) {

		// Change sprite to open door.
		const sprite = b8.ECS.getComponent( id, 'Sprite' );

		// Ignore open doors.
		if ( sprite.tile === mapper.types.door.TILE_DOOR_OPEN ) return;

		mapper.types.door.openDoor( id, sprite );

		// Spawn fire at door location.
		const loc = b8.ECS.getComponent( id, 'Loc' );

		mapper.types.fire.spawn(
			loc.col,
			loc.row
		);

		// Do not remove the door entity.
		return false;

	},

};
