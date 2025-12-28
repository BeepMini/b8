mapper.types.doorStairs = {

	spawn: function( col, row, props = {} ) {

		const icon = props.icon || 197;

		const stairsProps = {
			Type: { name: 'doorStairs' },
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

		return b8.ECS.create( stairsProps );

	},


	onCharacterCollision: function( id, newCol, newRow, dx, dy ) {

		// Check if the player is trying to step onto a portal.
		mapper.systems.tryPortal( newCol, newRow );
		return false;

	},

};
