mapper.types.doorStairs = {

	/**
	 * Spawn a stairway portal using the supplied icon and destination.
	 *
	 * @param {number} col Tile column.
	 * @param {number} row Tile row.
	 * @param {Object} [props={}] Type-specific settings read from the map object.
	 * @returns {number} The new entity ID.
	 */
	spawn: function( col, row, props = {} ) {

		const icon = props.icon || 197;

		const stairsProps = {
			Type: { name: 'doorStairs' },
			Loc: { col, row },
			Sprite: {
				tile: icon,
				fg: props.fg || 14,
				bg: props.bg || 0
			},
			Portal: {
				name: props.name || null,
				target: props.leadsTo || ''
			},
		};

		return b8.ECS.create( stairsProps );

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
