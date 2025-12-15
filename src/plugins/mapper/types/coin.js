mapper.types.coin = {

	/**
	 * Spawn a coin entity.
	 *
	 * @param {number} col - The column to spawn the coin at.
	 * @param {number} row - The row to spawn the coin at.
	 * @param {Object} props - Additional properties for the coin.
	 * @returns {number} The entity ID of the spawned coin.
	 */
	spawn: function( col, row, props ) {

		return mapper.types.pickup.spawn(
			col,
			row,
			{
				type: 'coin',
				Sprite: {
					tile: parseInt( mapper.settings.coin ) || 266,
					fg: mapper.settings.coinColor || 14,
					bg: props.bg || 0
				},
			}
		);

	},

};
