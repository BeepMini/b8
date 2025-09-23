mapper.types.signpost = {

	spawn: function( col, row, props ) {

		return beep8.ECS.create(
			{
				Type: { name: 'signpost' },
				Loc: { col, row },
				Sprite: {
					tile: props.icon || 252,
					fg: props.fg || 15,
					bg: props.bg || 0
				},
				Solid: {},
				Message: { message: props.message || "" },
				Action: { verb: 'read' },
			}
		);

	},

};
