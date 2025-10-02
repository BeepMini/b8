mapper.types.crate = {

	spawn: function( col, row, props ) {

		return b8.ECS.create(
			{
				Type: { name: 'crate' },
				Loc: { col, row },
				Sprite: {
					tile: 352,
					fg: props.fg || 15,
					bg: props.bg || 0,
					depth: 10
				},
				Solid: {},
				Pushable: {},
				Action: { verb: 'pull' },
			}
		);

	},

};
