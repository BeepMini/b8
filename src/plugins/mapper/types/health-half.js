mapper.types.healthHalf = {

	spawn: function( col, row, props ) {

		return mapper.types.pickup.spawn(
			col,
			row,
			{
				type: 'health',
				atts: { amount: 1 },
				Sprite: {
					tile: 416,
					fg: 8,
					bg: 0
				},
			}
		);

	},

};
