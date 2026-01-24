mapper.ai.updateTimer = 0;

mapper.systems.ai = function( dt ) {

	mapper.ai.updateTimer += dt;
	if ( mapper.ai.updateTimer < mapper.CONFIG.aiUpdateDelay ) return;
	mapper.ai.updateTimer = 0;

	const ids = b8.ECS.query( 'AI', 'Loc' );

	// Loop through all AI entities.
	for ( const id of ids ) {

		const mode = mapper.ai.think( id );
		const ai = b8.ECS.getComponent( id, 'AI' );

		// If the AI mode has changed, update it.
		if ( mode !== ai.mode ) {
			ai.mode = mode;
			b8.ECS.setComponent( id, 'AI', ai );
		}

		// Act based on current mode.
		const directions = [ 'U', 'D', 'L', 'R' ];
		const Loc = b8.ECS.getComponent( id, 'Loc' );

		/**
		 * WANDER
		 * Pick a random direction and distance to move.
		 */
		if ( mapper.ai.MODE.WANDER === mode ) {

			const direction = b8.Random.pick( directions );
			const distance = b8.Random.int( 2, 8 );
			const pauseDuration = b8.Random.int( 8, 24 );

			// Path pattern, move in chosen direction for distance, then pause for pauseDuration.
			const pathCode = `${direction}${distance}P${pauseDuration}`;

			const steps = b8.Path.parseCode(
				pathCode,
				Loc.col,
				Loc.row,
				direction
			);

			mapper.types.enemy.setPath( id, steps, b8.Path.AnimationMode.ONCE );

		}


		/**
		 * PATROL
		 * Follow predefined path (set in editor).
		 */
		if ( mapper.ai.MODE.PATROL === mode ) {

			const pf = b8.ECS.getComponent( id, 'PathFollower' );

			// Already following a path so return.
			if ( pf?.steps && pf.steps.length > 0 ) continue;

			const ai = b8.ECS.getComponent( id, 'AI' );

			// Follow default default path.
			if ( ai.path && ai.path.length > 0 ) {

				const Loc = b8.ECS.getComponent( id, 'Loc' );

				// If not on path set path to nearest point.
				const nearestPathIndex = mapper.ai.nearestPathIndex( Loc, ai.path );
				const nearestPathTile = ai.path[ nearestPathIndex ];

				// If the player is not on the path, move to the nearest path tile first.
				if (
					nearestPathTile.col === Loc.col &&
					nearestPathTile.row === Loc.row
				) {
					// Already on path, start from nearest index.
					mapper.types.enemy.setPath( id, ai.path, null, nearestPathIndex );
				} else {
					// Not on path, move to nearest path tile first.
					const path = mapper.ai.doAstar( Loc, nearestPathTile );
					if ( path ) mapper.types.enemy.setPath( id, path, b8.Path.AnimationMode.ONCE );
				}
			}

		}


		/**
		 * CHASE
		 * Move towards target (usually player).
		 */
		if ( mapper.ai.MODE.CHASE === mode ) {

			const tileGoal = b8.ECS.getComponent( mapper.player, 'Loc' );

			if ( tileGoal ) {
				const path = mapper.ai.doAstar( Loc, tileGoal );

				if ( path ) {
					mapper.repeatLastValue( path, 12 );
					mapper.types.enemy.setPath( id, path, b8.Path.AnimationMode.ONCE );
				}
			}

		}


		/**
		 * ATTACK
		 * Perform attack action on target.
		 */
		if ( mapper.ai.MODE.ATTACK === mode ) {

			console.log( `Think ATTACK mode (${id})` );

		}


		/**
		 * FLEE
		 * Move away from target.
		 */
		if ( mapper.ai.MODE.FLEE === mode ) {

			const tile = mapper.ai.randomNearbyTile( Loc, 4 );

			if ( tile ) {
				const path = mapper.ai.doAstar( Loc, tile );
				if ( path ) mapper.types.enemy.setPath( id, path, b8.Path.AnimationMode.ONCE );
			}

		}

		if ( mapper.ai.MODE.LOOT === mode ) {

			console.log( `Think LOOT mode (${id})` );

		}

		if ( mapper.ai.MODE.IDLE === mode ) {

			console.log( `Think IDLE mode (${id})` );

		}


	}

};