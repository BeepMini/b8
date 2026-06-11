mapper.systems.health = async function( dt ) {

	const entities = b8.ECS.query( 'Health' );

	for ( const entityId of entities ) {

		const health = b8.ECS.getComponent( entityId, 'Health' );

		// The entity may already have been removed by another system earlier in
		// the frame, so skip it if the component no longer exists.
		if ( !health ) continue;

		// Reduce cooldown timer.
		health.cooldownTimer = Math.max( 0, health.cooldownTimer - dt );

		if ( health.value > 0 ) continue;

		// Spawn defeat VFX.
		const loc = b8.ECS.getComponent( entityId, 'Loc' );
		if ( loc ) {
			mapper.types.vfx.spawn(
				loc.col, loc.row,
				{ id: 'skull', fg: 2, bg: 0, offsetTime: 200 }
			);
		}

		// Kill defeated enemies immediately, but only queue the player's game
		// over flow once so repeated frames do not stack multiple waits/scenes.
		if ( entityId !== mapper.player ) {
			b8.ECS.removeEntity( entityId );
			continue;
		}

		if ( mapper.isGameOverPending ) continue;

		mapper.isGameOverPending = true;

		await b8.Async.wait( 1 );
		b8.Scene.set( 'gameover' );
	}

};
