mapper.types.fireSmall = {

	spawn: function( col, row, props = {} ) {

		if ( !props.parent ) return;

		return b8.ECS.create(
			{
				Type: { name: 'fire-small' },
				Loc: { col, row },
				Sprite: {
					type: 'vfx-outline',
					id: 'fire-small',
					offsetY: -4,
					startTime: b8.Core.getNow(),
					fg: mapper.types.fire.color,
					bg: 0,
					depth: 100,
				},
				FireSmall: {
					durationTurns: props.durationTurns || props.duration || mapper.CONFIG.fireSmallDurationTurns,
					parent: props.parent,
				},
			}
		);

	}
};
