/**
 * Path Follower System
 *
 * Moves entities along predefined paths based on their PathFollower component.
 */
mapper.systems.pathFollower = async function( dt ) {

	const animationMap = {
		'U': 'move-up',
		'D': 'move-down',
		'L': 'move-left',
		'R': 'move-right',
		'FU': 'idle-up',
		'FD': 'idle-down',
		'FL': 'idle-left',
		'FR': 'idle-right',
	};

	const animationInverse = {
		'U': 'D',
		'D': 'U',
		'L': 'R',
		'R': 'L',
		'FU': 'FD',
		'FD': 'FU',
		'FL': 'FR',
		'FR': 'FL',
	};

	const ids = b8.ECS.query( 'Loc', 'PathFollower' );

	for ( const id of ids ) {

		const pf = b8.ECS.getComponent( id, 'PathFollower' );
		const Loc = b8.ECS.getComponent( id, 'Loc' );

		// Skip if no steps defined.
		if ( !pf ) continue;
		if ( !pf.steps.length ) continue;

		// Update timer.
		pf.timer -= dt;

		if ( pf.timer > 0 ) continue;
		pf.timer = mapper.CONFIG.moveDelay * 2;

		let step = pf.steps[ pf.index ];

		// Check if step is a pause (stay in place).
		const isPauseStep = ( Loc.col === step.col && Loc.row === step.row );

		// Determine if movement can occur.
		let canMove = isPauseStep;

		// Face command - always allowed.
		if ( step.dir && step.dir[ 0 ] === 'F' ) canMove = true;

		// Check if step is not blocked by collision.
		if ( !isPauseStep && mapper.collision.isFree( step.col, step.row ) ) canMove = true;

		// If movement is blocked, skip to next character.
		if ( !canMove ) continue;

		// Move to next step
		b8.ECS.setLoc( id, step.col, step.row );

		// Advance to next step index based on mode
		_advancePathIndex( pf );

		// Update animation based on direction
		const anim = b8.ECS.getComponent( id, 'CharacterAnimation' );
		anim.duration = 0.5;
		if ( animationMap[ step.dir ] ) {
			let direction = step.dir;
			// Invert the direction for reverse movement.
			if ( pf.dirStep === -1 ) { direction = animationInverse[ step.dir ] || step.dir; }
			anim.name = animationMap[ direction ];
		}

		// Stop at last step for ONCE mode.
		if ( pf.mode === b8.Path.AnimationMode.ONCE && pf.index >= pf.steps.length - 1 ) {
			b8.ECS.removeComponent( id, 'PathFollower' );
		}

	}


	/**
	 * Advance the path index based on the PathFollower mode.
	 *
	 * @param {object} pf - The PathFollower component.
	 * @returns {void}
	 */
	function _advancePathIndex( pf ) {

		const last = pf.steps.length - 1;

		switch ( pf.mode ) {

			// Advance index until the last step, then stop.
			case b8.Path.AnimationMode.ONCE:

				if ( pf.index < last ) pf.index++;
				break;

			// Advance index and loop back to start after last step.
			case b8.Path.AnimationMode.LOOP:

				pf.index = ( pf.index + 1 ) % pf.steps.length;
				break;

			// Advance index back and forth between first and last step.
			case b8.Path.AnimationMode.PINGPONG:
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


