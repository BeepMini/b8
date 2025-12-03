mapper.systems.pathFollower = async function( dt ) {

	// console.log( 'pathFollower system dt', dt );

	const ids = b8.ECS.query( 'Loc', 'PathFollower' );

	for ( const id of ids ) {

		const loc = b8.ECS.getComponent( id, 'Loc' );
		const pf = b8.ECS.getComponent( id, 'PathFollower' );

		if ( !pf || !loc ) continue;

		// No code? Nothing to do.
		if ( !pf.steps.length ) continue;

		pf.timer -= dt;

		if ( pf.timer > 0 ) continue;

		// Reset timer
		pf.timer = mapper.CONFIG.moveDelay * 2;

		const step = pf.steps[ pf.index ];

		loc.row = step.x;
		loc.col = step.y;

		// if ( facing && step.dir ) {
		// 	facing.dir = step.dir;
		// }

		_advancePathIndex( pf );

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
