mapper.systems.pathFollower = async function( dt ) {

	const ids = b8.ECS.query( 'Loc', 'PathFollower' );

	for ( const id of ids ) {

		const pf = b8.ECS.getComponent( id, 'PathFollower' );

		// Skip if no steps defined.
		if ( !pf ) continue;
		if ( !pf.steps.length ) continue;

		// Update timer.
		pf.timer -= dt;

		if ( pf.timer > 0 ) continue;
		pf.timer = mapper.CONFIG.moveDelay * 2;

		const step = pf.steps[ pf.index ];

		// Check if step is possible (not blocked by collision)
		if (
			mapper.collision.isWalkable( step.x, step.y ) &&
			!mapper.collision.isSolidAt( step.x, step.y )
		) {
			b8.ECS.setLoc( id, step.x, step.y );
			_advancePathIndex( pf );
		}

		// if ( facing && step.dir ) {
		// 	facing.dir = step.dir;
		// }

	}

	function _advancePathIndex( pf ) {

		const last = pf.steps.length - 1;

		switch ( pf.mode ) {

			// Advance index until the last step, then stop.
			case 'once':

				if ( pf.index < last ) pf.index++;
				break;

			// Advance index and loop back to start after last step.
			case 'loop':

				pf.index = ( pf.index + 1 ) % pf.steps.length;
				break;

			// Advance index back and forth between first and last step.
			case 'pingpong':
			default:

				if ( pf.index === 0 ) {
					pf.dirStep = 1;
				} else if ( pf.index === last ) {
					pf.dirStep = -1;
				}

				pf.index += pf.dirStep;
				break;

		}

	}

};


