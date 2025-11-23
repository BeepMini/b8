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

		return b8.ECS.create(
			{
				Type: { name: 'key' },
				Loc: { col, row },
				Sprite: {
					tile: 255,
					fg: props.fg || 14,
					bg: props.bg || 0
				},
			}
		);

	},


	/**
	 * Handle character collision with key.
	 *
	 * @param {number} id - The entity ID of the key.
	 * @param {number} newCol - The column the character is moving to.
	 * @param {number} newRow - The row the character is moving to.
	 * @param {number} dx - The change in column direction.
	 * @param {number} dy - The change in row direction.
	 * @returns {boolean} False to allow movement onto the key tile.
	 */
	onCharacterCollision: function( id, newCol, newRow, dx, dy ) {

		const keyName = `key-${b8.ECS.getComponent( id, 'Sprite' ).fg ?? "default"}`;
		b8.Inventory.add( keyName );

		// Remove key object from level data.
		const currentMap = mapper.getCurrentMap();
		currentMap.objects = currentMap.objects.filter( obj => obj.id !== id );

		// Remove entity, play sound.
		b8.ECS.removeEntity( id );
		b8.Sfx.play( 'tone/bloop/006' );

		return false;

	},

};
