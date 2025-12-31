mapper.types.fire = {

	damagePerSecond: 3,

	color: 10,

	spawn: function( col, row, props = {} ) {

		// Prevent multiple fires stacking on the same tile.
		if ( mapper.hasEntityAt( col, row, 'fire' ) ) return null;

		let duration = parseInt( props.duration );
		if ( duration === 0 ) {
			duration = Infinity;
		} else {
			duration = isNaN( duration ) ? 5 : duration;
			duration += b8.Random.range( 0, 2 );
		}

		return b8.ECS.create(
			{
				Type: { name: 'fire' },
				Loc: { col, row },
				Sprite: {
					type: 'vfx',
					id: 'fire',
					startTime: b8.Core.getNow() + b8.Random.int( 0, 400 ),
					fg: mapper.types.fire.color,
					bg: 0,
				},
				Fire: {
					duration,
				},
			}
		);

	}
};