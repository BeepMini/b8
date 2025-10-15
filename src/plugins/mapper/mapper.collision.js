mapper.collision = {

	/**
	 * Check if there is a solid object at (col,row).
	 *
	 * @param {number} col
	 */
	isSolidAt: ( col, row ) => {

		return b8.ECS.entitiesAt( col, row ).some( id => b8.ECS.hasComponent( id, 'Solid' ) );

	},


	/**
	 * Check if (col,row) is free (walkable and no solid object).
	 *
	 * @param {number} col
	 * @param {number} row
	 * @returns {boolean}
	 */
	isFree: ( col, row ) => {

		return mapper.collision.isWalkable( col, row ) && !mapper.collision.isSolidAt( col, row );

	},


	/**
	 * Check if (col,row) is walkable (not a wall or closed door).
	 *
	 * @param {number} col
	 * @param {number} row
	 * @returns {boolean}
	 */
	isWalkable: function( col, row ) {

		// Check bounds.
		if (
			col < 0 ||
			row < 0 ||
			col >= mapper.currentMap.mapWidth ||
			row >= mapper.currentMap.mapHeight
		) {
			return false;
		}

		let mapCell = mapper.currentMap.map[ row ][ col ];

		if ( true === mapCell[ 3 ] ) {
			return false;
		}

		// Check for spikes.
		// if ( cell === '^' ) {
		// 	let spike = Tile.spikes.list.find( s => s.x === x && s.y === y );
		// 	if ( spike && spike.up ) {
		// 		return false;
		// 	}
		// }

		return true;

	},

};