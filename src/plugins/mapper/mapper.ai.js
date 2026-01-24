mapper.ai = {


	/**
	 * Is location b next to (adjacent to) location a?
	 *
	 * @param {Object} a - The first location with col and row properties.
	 * @param {Object} b - The second location with col and row properties.
	 * @returns {boolean} True if the locations are adjacent, false otherwise.
	 */
	isAdjacent: ( a, b ) => {

		return b8.Math.distManhattan( a, b ) === 1;

	},


	/**
	 * Get the direction from one location to another.
	 * Returns a direction object with dx and dy.
	 *
	 * @param {Object} from - The starting location with col and row properties.
	 * @param {Object} to - The target location with col and row properties.
	 * @returns {Object} An object with dx and dy properties representing the direction.
	 */
	dirTo: ( from, to ) => {

		if ( to.col > from.col ) return { dx: 1, dy: 0 };
		if ( to.col < from.col ) return { dx: -1, dy: 0 };
		if ( to.row > from.row ) return { dx: 0, dy: 1 };
		if ( to.row < from.row ) return { dx: 0, dy: -1 };

		return { dx: 0, dy: 0 };

	},


	/**
	 * Is the 'to' location in front of the 'from' location based on direction?
	 *
	 * @param {Object} direction - The direction object with dx and dy.
	 * @param {Object} from - The starting location with col and row properties.
	 * @param {Object} to - The target location with col and row properties.
	 * @returns {boolean} True if 'to' is in front of 'from', false otherwise.
	 */
	isFacing: ( direction, from, to ) => {

		const d = mapper.ai.dirTo( from, to );

		return direction.dx === d.dx && direction.dy === d.dy;

	},


	/**
	 * Is the 'to' location behind the 'from' location based on direction?
	 *
	 * @param {Object} direction - The direction object with dx and dy.
	 * @param {Object} from - The starting location with col and row properties.
	 * @param {Object} to - The target location with col and row properties.
	 * @returns {boolean} True if 'to' is behind 'from', false otherwise.
	 */
	isBehind: ( direction, from, to ) => {

		const d = mapper.ai.dirTo( from, to );

		return direction.dx === -d.dx && direction.dy === -d.dy;

	},


	/**
	 * Determine if there is a line of sight between two locations within a given range,
	 * considering solid obstacles.
	 *
	 * Uses Bresenham's algorithm to step to next tile.
	 *
	 * Bresenham's line algorithm is used here to determine which tiles
	 * the line passes through, allowing us to check for obstacles.
	 *
	 * The algorithm works by calculating the error term to decide
	 * when to step in the y-direction while iterating over x (or vice versa).
	 *
	 * The error term refers to the difference between the ideal line and the actual
	 * rasterized line. By adjusting the error term, we can determine when to
	 * increment the y-coordinate as we move along the x-axis (or vice versa),
	 * ensuring that we stay as close to the ideal line as possible.
	 *
	 * @see https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
	 *
	 * @param { Object } from - The starting location with col and row properties.
	 * @param { Object } to - The target location with col and row properties.
	 * @param { number } range - The maximum range for line of sight.
	 * @param { Function } solidsFn - A function that takes( col, row ) and returns true if the tile is solid.
	 * @returns { boolean } True if there is line of sight, false otherwise.
	 */
	hasLineOfSight: ( fromId, toId, range = 5, solidsFn = mapper.collision.isFree ) => {

		const from = b8.ECS.getComponent( fromId, 'Loc' );
		const to = b8.ECS.getComponent( toId, 'Loc' );

		const dist = b8.Math.dist2d( from.col, from.row, to.col, to.row );
		if ( dist > range ) return false; // Ensure the target is within range
		if ( dist <= 1 ) return true; // Adjacent tiles always have line of sight

		return true; // TEMP OVERRIDE FOR TESTING

		let x0 = from.col;
		let y0 = from.row;
		let x1 = to.col;
		let y1 = to.row;

		let dx = Math.abs( x1 - x0 );
		let dy = Math.abs( y1 - y0 );

		let sx = x0 < x1 ? 1 : -1;
		let sy = y0 < y1 ? 1 : -1;

		let err = dx - dy;

		let whileCount = 0;

		while ( true ) {

			whileCount++;

			const tileSize = b8.CONFIG.CHR_WIDTH;
			b8.drawRect( x0 * tileSize, y0 * tileSize, tileSize, tileSize, 2 );

			// Skip starting tile.
			if ( !( x0 === from.col && y0 === from.row ) ) {
				if ( solidsFn( x0, y0 ) ) {
					return false; // Obstacle blocks the line of sight
				}
			}

			// Reached destination.
			if ( x0 === x1 && y0 === y1 ) return true;

			const e2 = err * 2;

			if ( e2 > -dy ) {
				err -= dy;
				x0 += sx;
			}

			if ( e2 < dx ) {
				err += dx;
				y0 += sy;
			}

		}

	},


	/**
	 * Can the attacker attack the target based on adjacency and facing direction?
	 *
	 * @param {Object} attacker - The attacker entity with Loc and Direction components.
	 * @param {Object} target - The target entity with Loc component.
	 * @returns {boolean} True if the attacker can attack the target, false otherwise.
	 */
	canAttack: ( attacker, target ) => {

		const attackerLoc = b8.ECS.getComponent( attacker, 'Loc' );
		const targetLoc = b8.ECS.getComponent( target, 'Loc' );

		if ( !attackerLoc || !targetLoc ) return false;

		if ( !mapper.ai.isAdjacent( attackerLoc, targetLoc ) ) return false;

		return mapper.ai.isFacing(
			b8.ECS.getComponent( attacker, 'Direction' ),
			attackerLoc,
			targetLoc
		);

	},


	/**
	 * Perform A* pathfinding from start to goal and set the PathIntent component.
	 *
	 * @param {number} id - The entity ID of the character to move.
	 * @param {Object} start - The starting location with col and row properties.
	 * @param {Object} goal - The target location with col and row properties.
	 * @returns {void}
	 */
	doAstar: ( start, goal ) => {

		const path = b8.AStar.Pathfind(
			start,
			goal,
			mapper.collision.isFree,
			mapper.getMapWidth(),
			mapper.getMapHeight()
		);

		return path;

	},


	/**
	 * Find the nearest loot item to the enemy within a specified range.
	 *
	 * @param {Object} enemyLoc - The location of the enemy with col and row properties.
	 * @param {Array} items - An array of item entities with Loc components.
	 * @param {number} maxRange - The maximum range to consider for loot.
	 * @returns {Object|null} The nearest loot item entity or null if none found.
	 */
	findNearestLoot: ( enemyLoc, items, maxRange ) => {

		let best = null;
		let bestDist = Infinity;

		items.forEach(

			( item ) => {

				const d = b8.Math.distManhattan( enemyLoc, item.Loc );

				if ( d <= maxRange && d < bestDist ) {
					best = item;
					bestDist = d;
				}

			}
		);

		return best;

	},


	/**
	 * Find a random nearby tile within a given radius that satisfies the walkable condition.
	 *
	 * @param {Object} from - The starting location with col and row properties.
	 * @param {number} radius - The radius within which to search for a tile.
	 * @returns {Object|null} A location object with col and row properties or null if none found.
	 */
	randomNearbyTile: ( from, radius ) => {

		const tries = 10;

		// Try and find a safe tile first.
		for ( let i = 0; i < tries; i++ ) {

			const col = from.col + b8.Random.int( -radius, radius );
			const row = from.row + b8.Random.int( -radius, radius );

			if (
				mapper.collision.isWalkable( col, row ) &&
				mapper.collision.isSafe( col, row )
			) {
				return { col, row };
			}

		}

		// Can't find a safe tile, try for any walkable tile.
		for ( let i = 0; i < tries; i++ ) {

			const col = from.col + b8.Random.int( -radius, radius );
			const row = from.row + b8.Random.int( -radius, radius );

			if ( mapper.collision.isWalkable( col, row ) ) return { col, row };

		}

		return false;

	},


	/**
	 * Find the index of the nearest tile in a path to a given location.
	 *
	 * @param {Object} loc The location with col and row properties.
	 * @param {Array} tiles An array of tile locations with col and row properties.
	 * @returns {number} The index of the nearest tile in the path.
	 */
	nearestPathIndex: ( loc, tiles ) => {

		let best = 0;
		let bestDist = Infinity;

		for ( let i = 0; i < tiles.length; i++ ) {
			const d = b8.Math.distManhattan( loc, { col: tiles[ i ].col, row: tiles[ i ].row } );
			if ( d < bestDist ) {
				bestDist = d;
				best = i;
			}
		}

		return best;

	},


	/**
	 * Check if a location is on a given path of tiles.
	 *
	 * @param {Object} loc The location with col and row properties.
	 * @param {Array} tiles An array of tile locations with col and row properties.
	 * @param {number} maxDist The maximum distance to consider as "on the path".
	 * @returns {Object} An object with onPath (boolean) and index (number) properties.
	 */
	isOnPath: ( loc, tiles, maxDist = 0 ) => {

		for ( let i = 0; i < tiles.length; i++ ) {
			if ( b8.Math.distManhattan( loc, { col: tiles[ i ].x, row: tiles[ i ].y } ) <= maxDist ) {
				return { near: true, index: i, onPath: true };
			}
		}

		return { onPath: false, index: -1 };

	},


	/**
	 * Choose the AI mode for an enemy based on its state and context.
	 *
	 * @param {Object} enemy The enemy entity with AI and other components.
	 * @param {Object} context The context object containing information about the environment.
	 * @returns {string} The chosen AI mode (e.g., 'flee', 'attack', 'chase', 'loot', 'patrol', 'wander').
	 */
	_chooseMode: ( e, context ) => {

		if ( e.OnFire ) {
			return mapper.ai.MODE.FLEE;
		}

		if ( context.canAttack ) {
			return mapper.ai.MODE.ATTACK;
		}

		if ( context.canSeePlayer ) {
			return mapper.ai.MODE.CHASE;
		}

		const now = b8.Core.getNow();

		if ( context.lastSeenPlayer && now - context.lastSeenPlayer.time < 2000 ) {
			return mapper.ai.MODE.CHASE_LAST_SEEN;
		}

		if ( e?.AI?.flags?.canLoot && context.nearestLoot ) {
			return mapper.ai.MODE.LOOT;
		}

		const pf = e.PathFollower;

		if ( pf?.steps?.length ) {

			const onPath = mapper.ai.isOnPath( e.Loc, pf.steps ).onPath;

			if ( !onPath ) return mapper.ai.MODE.RETURN;

			return mapper.ai.MODE.NONE;

		}

		return mapper.ai.MODE.WANDER;

	},


	MODE: {
		NONE: 'none',
		RETURN: 'return',
		CHASE: 'chase',
		ATTACK: 'attack',
		FLEE: 'flee',
		LOOT: 'loot',
		WANDER: 'wander',
		PATROL: 'patrol',
		CHASE_LAST_SEEN: 'chase_last_seen',
	},

	think: ( id ) => {

		const ai = b8.ECS.getComponent( id, 'AI' );

		// Flee if on fire.
		if ( b8.ECS.hasComponent( id, 'OnFire' ) ) {
			return mapper.ai.MODE.FLEE;
		}

		if ( mapper.ai.canAttack( id, mapper.player ) ) {
			return mapper.ai.MODE.ATTACK;
		}

		// Chase player if visible.
		const canSeePlayer = mapper.ai.hasLineOfSight( id, mapper.player );
		if ( canSeePlayer ) {
			return mapper.ai.MODE.CHASE;
		}

		// Follow path.
		if ( ai.path && ai.path.length > 0 ) {
			return mapper.ai.MODE.PATROL;
		}

		// Wander by default.
		return mapper.ai.MODE.WANDER;

	},


	toXY: ( loc ) => ( { x: loc.col, y: loc.row } ),

	toLoc: ( xy ) => ( { col: xy.x, row: xy.y } ),


};
