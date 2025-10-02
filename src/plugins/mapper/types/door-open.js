mapper.types.doorOpen = {

	spawn: function( col, row, props ) {

		const doorProps = {
			Type: { name: 'door' },
			Loc: { col, row },
			Sprite: {
				tile: 216,
				fg: props.fg || 14,
				bg: props.bg || 0
			},
			Portal: {
				name: props.name || null,
				target: props.leadsTo || ''
			},
		};

		return b8.ECS.create( doorProps );

	},


	onCharacterCollision: function( id, newCol, newRow, dx, dy ) {

		// Check if the player is trying to step onto a portal.
		mapper.systems.tryPortal( newCol, newRow );
		return false;

	},

};
