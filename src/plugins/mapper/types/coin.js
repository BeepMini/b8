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

		return b8.ECS.create(
			{
				Type: { name: 'coin' },
				Loc: { col, row },
				Sprite: {
					tile: parseInt( mapper.settings.coin ) || 266,
					fg: props.fg || 14,
					bg: props.bg || 0
				},
			}
		);

	},


	/**
	 * Handle character collision with coin.
	 *
	 * @param {number} id - The entity ID of the coin.
	 * @returns {boolean} False to allow stepping onto the coin tile.
	 */
	onCharacterCollision: function( id ) {

		// Remove coin object from level data.
		const currentMap = mapper.getCurrentMap();
		currentMap.objects = currentMap.objects.filter( obj => obj.id !== id );

		// Remove entity, add to inventory, play sound.
		b8.ECS.removeEntity( id );
		b8.Inventory.add( 'coin' );
		b8.Sfx.play( 'game/coin/002' );

		return false;

	},

};
