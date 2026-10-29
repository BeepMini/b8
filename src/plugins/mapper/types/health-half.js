mapper.types.healthHalf = {

	/**
	 * Spawn a pickup that restores one health point.
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
				props: { amount: 1 },
				Sprite: {
					tile: 416,
					fg: 8,
					bg: 0
				},
			}
		);

	},


	// pickupHandler()
	// Handled by mapper.types.health.pickupHandler

};
