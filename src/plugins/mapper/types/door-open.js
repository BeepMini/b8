mapper.types.doorOpen = {

	/**
	 * Spawn an open portal door with destination and sprite settings.
	 *
	 * @param {number} col Tile column.
	 * @param {number} row Tile row.
	 * @param {Object} [props={}] Type-specific settings read from the map object.
	 * @returns {number} The new entity ID.
	 */
	spawn: function( col, row, props = {} ) {

		const doorProps = {
			Type: { name: 'door' },
			Loc: { col, row },
			Sprite: {
				tile: 216,
				fg: props.fg || 14,
				bg: props.bg || 0
			},
			Portal: {
				name: props.name || null,
				target: props.leadsTo || ''
			},
		};

		return b8.ECS.create( doorProps );

	},


	/**
	 * Request a portal transition when a character enters this cell.
	 *
	 * @param {number} id Door entity ID.
	 * @param {number} newCol Destination tile column.
	 * @param {number} newRow Destination tile row.
	 * @param {number} dx Horizontal movement direction.
	 * @param {number} dy Vertical movement direction.
	 * @returns {boolean} Whether this move is blocked.
	 */
	onCharacterCollision: function( id, newCol, newRow, dx, dy ) {

		// Check if the player is trying to step onto a portal.
		mapper.systems.tryPortal( newCol, newRow );
		return false;

	},

};
