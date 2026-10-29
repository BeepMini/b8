mapper.types.health = {

	/**
	 * Spawn a pickup that restores two health points.
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
				props: { amount: 2 },
				Sprite: {
					tile: 415,
					fg: 8,
					bg: 0
				},
			}
		);

	},


	/**
	 * Handle the player picking up the health pickup.
	 *
	 * @param {number} playerId - The entity ID of the player.
	 * @param {Object} pickup - The Pickup component of the health item.
	 * @returns {void}
	 */
	pickupHandler: function( playerId, pickup ) {

		const health = b8.ECS.getComponent( playerId, 'Health' );
		health.value = Math.min( health.max, health.value + ( pickup.props.amount || 1 ) );

	},


};
