/**
 * A* Pathfinding Algorithm for grid-based games.
 * This implementation finds the shortest path between a start and goal position on a grid.
 *
 * @param {Object} start - The starting position with properties `x` and `y`.
 * @param {Object} goal - The goal position with properties `x` and `y`.
 * @param {Function} isWalkable - A function that takes `x` and `y` coordinates and returns `true` if the cell is walkable.
 * @param {number} gridWidth - The width of the grid.
 * @param {number} gridHeight - The height of the grid.
 * @returns {Array<Object>|null} - The shortest path as an array of positions `{x, y}`, or `null` if no path is found.
 */
function aStarPathfind( start, goal, isWalkable, gridWidth, gridHeight ) {

	/**
	 * Generates a unique key for a grid cell.
	 *
	 * @param {number} x - The x-coordinate of the cell.
	 * @param {number} y - The y-coordinate of the cell.
	 * @returns {string} - A unique string key for the cell.
	 */
	function nodeKey( x, y ) {
		return `${x},${y}`;
	}

	/**
	 * Calculates the Manhattan distance heuristic between two points.
	 *
	 * The Manhattan distance is the sum of the absolute differences of the x and y coordinates.
	 * It represents the shortest path between two points if movement is restricted to horizontal
	 * and vertical directions (like a grid-based game).
	 *
	 * A heuristic is a function used in pathfinding algorithms to estimate the cost of reaching
	 * the goal from a given point. It helps prioritize which paths to explore first, improving
	 * efficiency by guiding the algorithm toward the goal.
	 *
	 * In this implementation, the Manhattan distance is used as the heuristic because it is
	 * computationally inexpensive and works well for grid-based movement where diagonal movement
	 * is not allowed.
	 *
	 * @param {number} x - The x-coordinate of the current cell.
	 * @param {number} y - The y-coordinate of the current cell.
	 * @returns {number} - The Manhattan distance to the goal.
	 */
	function heuristic( x, y ) {

		return Math.abs( x - goal.x ) + Math.abs( y - goal.y );

	}

	// Priority queue for nodes to explore
	const openList = [];

	// Set of explored nodes
	const closedList = new Set();

	// Map of all nodes by their unique keys
	const nodes = {};

	// Initialize the start node
	const startNode = {
		x: start.x,
		y: start.y,
		g: 0, // Cost from start to this node
		h: heuristic( start.x, start.y ), // Heuristic cost to goal
		f: heuristic( start.x, start.y ), // Total cost (g + h)
		parent: null, // Parent node for path reconstruction
	};
	openList.push( startNode );
	nodes[ nodeKey( start.x, start.y ) ] = startNode;

	while ( openList.length > 0 ) {
		// Sort openList by `f` value and get the node with the lowest `f`
		openList.sort( ( a, b ) => a.f - b.f );
		const current = openList.shift();
		const currentKey = nodeKey( current.x, current.y );
		closedList.add( currentKey );

		// Check if the goal has been reached
		if ( current.x === goal.x && current.y === goal.y ) {
			const path = [];
			let node = current;
			while ( node ) {
				path.push( { x: node.x, y: node.y } );
				node = node.parent;
			}
			return path.reverse(); // Return the reconstructed path
		}

		// Explore neighbors (up, down, left, right)
		const neighbors = [
			{ x: current.x - 1, y: current.y },
			{ x: current.x + 1, y: current.y },
			{ x: current.x, y: current.y - 1 },
			{ x: current.x, y: current.y + 1 },
		];

		for ( let neighbor of neighbors ) {
			// Skip out-of-bound cells
			if (
				neighbor.x < 0 ||
				neighbor.x >= gridWidth ||
				neighbor.y < 0 ||
				neighbor.y >= gridHeight
			)
				continue;

			// Skip unwalkable cells
			if ( !isWalkable( neighbor.x, neighbor.y ) ) continue;

			const neighborKey = nodeKey( neighbor.x, neighbor.y );
			if ( closedList.has( neighborKey ) ) continue;

			const tentativeG = current.g + 1; // Cost to move to the neighbor
			let neighborNode = nodes[ neighborKey ];

			if ( !neighborNode ) {
				// Create a new node if it doesn't exist
				neighborNode = {
					x: neighbor.x,
					y: neighbor.y,
					g: tentativeG,
					h: heuristic( neighbor.x, neighbor.y ),
					f: tentativeG + heuristic( neighbor.x, neighbor.y ),
					parent: current,
				};
				nodes[ neighborKey ] = neighborNode;
				openList.push( neighborNode );
			} else if ( tentativeG < neighborNode.g ) {
				// Update the node if a better path is found
				neighborNode.g = tentativeG;
				neighborNode.f = tentativeG + neighborNode.h;
				neighborNode.parent = current;
			}
		}
	}

	return null; // No path found

}

