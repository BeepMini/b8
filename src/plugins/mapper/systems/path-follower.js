mapper.systems.pathFollower = async function( dt ) {

	// console.log( 'pathFollower system dt', dt );

	const ids = b8.ECS.query( 'Loc', 'PathFollower' );

	for ( const id of ids ) {

		const pf = b8.ECS.getComponent( id, 'PathFollower' );

		if ( !pf ) continue;
		if ( !pf.steps.length ) continue;

		pf.timer -= dt;

		if ( pf.timer > 0 ) continue;
		pf.timer = mapper.CONFIG.moveDelay * 2;

		const step = pf.steps[ pf.index ];

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
}


function _advancePathIndex( pf ) {

	const last = pf.steps.length - 1;

	if ( pf.mode === 'once' ) {

		if ( pf.index < last ) {
			pf.index++;
		}
		// else stop at final step

	} else if ( pf.mode === 'loop' ) {

		pf.index = ( pf.index + 1 ) % pf.steps.length;

	} else if ( pf.mode === 'pingpong' ) {

		if ( pf.index === 0 ) {
			pf.dirStep = 1;
		} else if ( pf.index === last ) {
			pf.dirStep = -1;
		}

		pf.index += pf.dirStep;

	} else {
		// unknown mode – default to loop
		pf.index = ( pf.index + 1 ) % pf.steps.length;
	}
}
