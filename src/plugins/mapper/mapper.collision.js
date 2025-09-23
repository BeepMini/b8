mapper.collision = {

	isSolidAt: ( col, row ) => {
		return beep8.ECS.entitiesAt( col, row ).some( id => beep8.ECS.hasComponent( id, 'Solid' ) );
	},

	isFree: ( col, row ) => {
		return mapper.collision.isWalkable( col, row ) && !mapper.collision.isSolidAt( col, row );
	},

	// Returns true if (col,row) is inside the maze and not a wall or closed door.
	isWalkable: function( col, row ) {

		// Check bounds.
		if (
			col < 0 ||
			row < 0 ||
			col >= mapper.currentMap.map.mapHeight ||
			row >= mapper.currentMap.map.mapWidth
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