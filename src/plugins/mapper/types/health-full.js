mapper.types.healthFull = {

	/**
	 * Spawn a pickup that restores health up to the player maximum.
	 *
	 * @param {number} col Tile column.
	 * @param {number} row Tile row.
	 * @param {Object} [props={}] Unused; accepted for the shared spawn interface.
	 * @returns {number} The new entity ID.
	 */
	spawn: function( col, row, props = {} ) {

		return mapper.types.pickup.spawn(
			col,
			row,
			{
				type: 'health',
				// Set this health pickup to a large amount,
				// It will fully heal the player.
				// The value will be capped at max health in the handler.
				props: { amount: 1000 },
				Sprite: {
					tile: 414,
					fg: 10,
					bg: 0
				},
			}
		);

	},


	// pickupHandler()
	// Handled by mapper.types.health.pickupHandler

};
