mapper.types.health = {

	spawn: function( col, row, props ) {

		return mapper.types.pickup.spawn(
			col,
			row,
			{
				type: 'health',
				atts: { amount: 2 },
				Sprite: {
					tile: 415,
					fg: 8,
					bg: 0
				},
			}
		);

	},

};
