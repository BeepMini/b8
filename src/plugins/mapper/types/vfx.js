mapper.types.vfx = {

	spawn: function( col, row, props ) {

		if ( !props.id ) return {};

		return b8.ECS.create(
			{
				Type: { name: 'vfx' },
				Loc: { col, row },
				Vfx: {},
				Sprite: {
					type: 'vfx',
					id: props.id,
					startTime: b8.Core.getNow(),
					fg: props.fg || 15,
					bg: props.bg || 0,
					depth: 50,
				},
			}
		);

	},

};
