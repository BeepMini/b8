( function( b8 ) {

	b8.AStar = {};

	/**
	 * Generates a unique key for a grid cell.
	 *
	 * This function creates a string key for a grid cell based on its x and y coordinates.
	 * The key is used to uniquely identify cells in the grid, which is essential for tracking
	 * visited nodes and managing the open and closed lists in the A* algorithm.
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

		return b8.Math.distManhattan( { col: x, row: y }, { col: goal.x, row: goal.y } );

	}


	/**
	 * A* Pathfinding Algorithm for grid-based games.
	 *
	 * The A* algorithm is a popular pathfinding and graph traversal algorithm. It is widely used
	 * in games and other applications to find the shortest path between two points. The algorithm
	 * combines the benefits of Dijkstra's algorithm and a heuristic approach to efficiently find
	 * the optimal path.
	 *
	 * Key Concepts:
	 * - Open List: A priority queue of nodes to be explored, sorted by their total cost (f).
	 * - Closed List: A set of nodes that have already been explored.
	 * - Heuristic (h): An estimate of the cost to reach the goal from a given node.
	 * - Cost (g): The actual cost to reach a node from the start.
	 * - Total Cost (f): The sum of g and h (f = g + h).
	 *
	 * This implementation assumes a grid-based game where movement is restricted to horizontal
	 * and vertical directions. The algorithm explores neighboring cells and calculates their
	 * costs to determine the optimal path.
	 *
	 * @param {Object} start - The starting position with properties `x` and `y`.
	 * @param {Object} goal - The goal position with properties `x` and `y`.
	 * @param {Function} isWalkable - A function that takes `x` and `y` coordinates and returns `true` if the cell is walkable.
	 * @param {number} gridWidth - The width of the grid.
	 * @param {number} gridHeight - The height of the grid.
	 * @returns {Array<Object>|null} - The shortest path as an array of positions `{x, y}`, or `null` if no path is found.
	 */
	b8.AStar.Pathfind = ( start, goal, isWalkable, gridWidth, gridHeight ) => {

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
			const current = openList.shift(); // Remove the node with the lowest cost
			const currentKey = nodeKey( current.x, current.y );
			closedList.add( currentKey ); // Mark the current node as explored

			// Check if the goal has been reached
			if ( current.x === goal.x && current.y === goal.y ) {
				const path = [];
				let node = current;
				while ( node ) {
					path.push( { x: node.x, y: node.y } ); // Trace back the path using parent nodes
					node = node.parent;
				}
				return path.reverse(); // Return the reconstructed path in the correct order
			}

			// Explore neighbors (up, down, left, right)
			const neighbors = [
				{ x: current.x - 1, y: current.y }, // Left
				{ x: current.x + 1, y: current.y }, // Right
				{ x: current.x, y: current.y - 1 }, // Up
				{ x: current.x, y: current.y + 1 }, // Down
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
				if ( closedList.has( neighborKey ) ) continue; // Skip already explored nodes

				const tentativeG = current.g + 1; // Cost to move to the neighbor
				let neighborNode = nodes[ neighborKey ];

				if ( !neighborNode ) {

					// Create a new node if it doesn't exist
					neighborNode = {
						x: neighbor.x,
						y: neighbor.y,
						g: tentativeG, // Set the cost from start to this node
						h: heuristic( neighbor.x, neighbor.y ), // Estimate cost to goal
						f: tentativeG + heuristic( neighbor.x, neighbor.y ), // Total cost
						parent: current, // Set the parent node for path reconstruction
					};

					nodes[ neighborKey ] = neighborNode; // Store the node in the nodes map
					openList.push( neighborNode ); // Add the node to the open list

				} else if ( tentativeG < neighborNode.g ) {

					// Update the node if a better path is found
					neighborNode.g = tentativeG; // Update the cost from start
					neighborNode.f = tentativeG + neighborNode.h; // Update the total cost
					neighborNode.parent = current; // Update the parent node

				}
			}
		}

		return null; // No path found

	}

} )( b8 );