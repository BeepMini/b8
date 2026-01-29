mapper.systems.health = async function( dt ) {

	const entities = b8.ECS.query( 'Health' );

	entities.forEach(
		async ( entityId ) => {

			const health = b8.ECS.getComponent( entityId, 'Health' );

			// Reduce cooldown timer.
			// If still in cooldown, skip further processing.
			health.cooldownTimer = Math.max( 0, health.cooldownTimer - dt );

			if ( health.value <= 0 ) {

				// Spawn defeat VFX.
				const loc = b8.ECS.getComponent( entityId, 'Loc' );
				if ( loc ) {
					mapper.types.vfx.spawn(
						loc.col, loc.row,
						{ id: 'skull', fg: 2, bg: 0, offsetTime: 200 }
					);
				}

				// Small pause on defeat.
				// mapper.updateMoveDelay( 0.6 );

				// Kill the entity unless it's the player.
				if ( entityId !== mapper.player ) {
					b8.ECS.removeEntity( entityId );
				} else {
					await b8.Async.wait( 1 );
					b8.Scene.set( 'gameover' );
				}

			}

		}
	);

};
