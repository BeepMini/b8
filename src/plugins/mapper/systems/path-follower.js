/**
 * Path Follower System
 *
 * Moves entities along predefined paths based on their PathFollower component.
 */
mapper.systems.pathFollower = async function( dt ) {

	const ids = b8.ECS.query( "Loc", "PathFollower" );

	for ( const id of ids ) {

		const pf = b8.ECS.getComponent( id, "PathFollower" );
		const Loc = b8.ECS.getComponent( id, "Loc" );

		// Skip if no steps defined.
		if ( !pf || !pf.steps.length ) continue;

		// Update timer.
		pf.timer -= dt;
		if ( pf.timer > 0 ) continue;
		pf.timer = mapper.CONFIG.moveDelay * 2;

		// Check if step is a pause (stay in place).
		const step = pf.steps[ pf.index ];
		const isPauseStep = ( Loc.col === step.col && Loc.row === step.row );

		// Determine if movement can occur.
		let canMove = isPauseStep;

		// Face command - always allowed.
		if ( step.dir && step.dir[ 0 ] === 'F' ) canMove = true;

		// Check if step is not blocked by collision.
		if ( !isPauseStep && mapper.collision.isFree( step.col, step.row ) ) canMove = true;

		// If movement is blocked, skip to next character.
		if ( !canMove ) continue;

		const directionVector = {
			dx: step.col - Loc.col,
			dy: step.row - Loc.row
		};

		// Move to next step
		b8.ECS.setComponent( id, "Direction", directionVector );
		b8.ECS.setLoc( id, step.col, step.row );

		if ( !step.dir ) step.dir = mapper.pathFollower.getFaceDirection( directionVector );

		// Advance to next step index based on mode
		mapper.pathFollower.advancePathIndex( pf );

		// Update animation based on direction
		const anim = b8.ECS.getComponent( id, "CharacterAnimation" );
		anim.duration = 0.5;

		if ( mapper.pathFollower.animationMap[ step.dir ] ) {
			let dir = step.dir;
			// Invert the direction for reverse movement.
			if ( pf.dirStep === -1 ) dir = mapper.pathFollower.animationInverse[ step.dir ] || step.dir;
			anim.name = mapper.pathFollower.animationMap[ dir ];
		}

		if ( pf.mode === b8.Path.AnimationMode.ONCE && pf.index >= pf.steps.length - 1 ) {
			b8.ECS.removeComponent( id, "PathFollower" );
		}

	}
};
