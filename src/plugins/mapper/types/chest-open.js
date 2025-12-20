mapper.types.chestOpen = {

	spawn: function( col, row, props ) {

		return b8.ECS.create(
			{
				Type: { name: 'chest' },
				Loc: { col, row },
				Sprite: {
					tile: 271,
					fg: props.fg || 15,
					bg: props.bg || 0,
					depth: 10
				},
				Solid: {},
				Message: { message: props.message || "" },
				Action: {
					verb: 'read'
				},
			}
		);

	},

};