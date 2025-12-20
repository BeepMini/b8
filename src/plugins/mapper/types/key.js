mapper.types.key = {

	/**
	 * Spawn a key entity at the specified location.
	 *
	 * @param {number} col - The column to spawn the key at.
	 * @param {number} row - The row to spawn the key at.
	 * @param {Object} props - Additional properties for the key (e.g., fg, bg colors).
	 * @returns {number} The entity ID of the spawned key.
	 */
	spawn: function( col, row, props ) {

		const color = props.fg || 14;

		return mapper.types.pickup.spawn(
			col,
			row,
			{
				type: 'key',
				props: { name: `key-${color}` },
				Sprite: {
					tile: 255,
					fg: props.fg || 14,
					bg: props.bg || 0
				},
			}
		);

	},


	/**
	 * Handle the player picking up the key.
	 *
	 * @param {number} playerId - The entity ID of the player.
	 * @param {Object} pickup - The Pickup component of the key.
	 * @returns {void}
	 */
	pickupHandler: function( playerId, pickup ) {

		b8.Inventory.add( pickup.props.name );
		b8.Sfx.play( 'tone/bloop/006' );

	},

};
