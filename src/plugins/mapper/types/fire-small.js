mapper.types.fireSmall = {

	damagePerSecond: 0.75,

	spawn: function( col, row, props = {} ) {

		if ( !props.parent ) return;

		return b8.ECS.create(
			{
				Type: { name: 'fire-small' },
				Loc: { col, row },
				Sprite: {
					type: 'vfx',
					id: 'fire-small',
					offsetY: -4,
					startTime: b8.Core.getNow(),
					fg: 9,
					bg: -1,
					depth: 100,
				},
				FireSmall: {
					duration: props.duration || 3,
					parent: props.parent,
				},
			}
		);

	}
};