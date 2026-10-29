mapper.types.start = {

	/**
	 * Record the starting doorway and move the existing player to this cell.
	 *
	 * @param {number} col Tile column.
	 * @param {number} row Tile row.
	 * @param {Object} [props={}] Unused; accepted for the shared spawn interface.
	 * @returns {void} Moves the existing player; does not create an entity.
	 */
	spawn: function( col, row, props = {} ) {

		mapper.lastPosition = {
			col,
			row,
			map: mapper.currentMapId
		};

		b8.ECS.setLoc( mapper.player, col, row );

	},

};
