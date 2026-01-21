mapper.collision = {

	/**
	 * Check if there is a solid object at (col,row).
	 *
	 * @param {number} col
	 * @param {number} row
	 * @returns {boolean}
	 */
	isSolid: ( col, row ) => {

		return b8.ECS.entitiesAt( col, row ).some( id => b8.ECS.hasComponent( id, 'Solid' ) );

	},


	/**
	 * Check if (col,row) is safe (no hazards like fire).
	 *
	 * @param {number} col
	 * @param {number} row
	 * @returns {boolean}
	 */
	isSafe: ( col, row ) => {

		return !b8.ECS.entitiesAt( col, row ).some( id => b8.ECS.hasComponent( id, 'Fire' ) );

	},


	/**
	 * Check if (col,row) is free (walkable and no solid object).
	 *
	 * @param {number} col
	 * @param {number} row
	 * @returns {boolean}
	 */
	isFree: ( col, row ) => {

		return mapper.collision.isWalkable( col, row ) && !mapper.collision.isSolid( col, row );

	},


	/**
	 * Check if (col,row) is walkable (not a wall or closed door).
	 *
	 * @param {number} col
	 * @param {number} row
	 * @returns {boolean}
	 */
	isWalkable: function( col, row ) {

		const currentMap = mapper.getCurrentMap();

		// Check bounds.
		if (
			col < 0 ||
			row < 0 ||
			col >= currentMap.mapWidth ||
			row >= currentMap.mapHeight
		) {
			return false;
		}

		// Check current tile collision properties.
		let mapCell = currentMap.mapData[ row ][ col ];
		if ( true === mapCell[ 3 ] ) return false;

		return true;

	},

};