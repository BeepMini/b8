mapper.systems.health = async function( dt ) {

	const entities = b8.ECS.query( 'Health' );

	entities.forEach(
		( entityId ) => {

			const health = b8.ECS.getComponent( entityId, 'Health' );

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
				mapper.updateMoveDelay( 0.6 );

				// Remove the entity.
				b8.ECS.removeEntity( entityId );

				// Game Over!
				if ( entityId === mapper.player.id ) {
					// mapper.handlePlayerDeath();
					return;
				}

			}

		}
	);

};
