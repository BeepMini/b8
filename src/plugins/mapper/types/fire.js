mapper.types.fire = {

	damagePerSecond: 3,

	spawn: function( col, row, props = {} ) {

		let duration = parseInt( props.duration ) || 5;
		duration += b8.Random.range( 0, 2 );

		return b8.ECS.create(
			{
				Type: { name: 'fire' },
				Loc: { col, row },
				Sprite: {
					type: 'vfx',
					id: 'fire',
					startTime: b8.Core.getNow() + b8.Random.int( 0, 400 ),
					fg: 10,
					bg: 0,
				},
				Fire: {
					duration,
				},
			}
		);

	}
};