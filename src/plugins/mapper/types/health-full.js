mapper.types.healthFull = {

	spawn: function( col, row, props ) {

		return mapper.types.pickup.spawn(
			col,
			row,
			{
				type: 'health',
				// Set this health pickup to a large amount,
				// It will fully heal the player.
				// The value will be capped at max health in the handler.
				atts: { amount: 1000 },
				Sprite: {
					tile: 414,
					fg: 10,
					bg: 0
				},
			}
		);

	},

};
