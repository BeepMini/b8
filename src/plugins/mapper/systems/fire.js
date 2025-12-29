mapper.systems.fire = async function( dt ) {

	const fires = b8.ECS.query( 'Fire', 'Loc' );

	fires.forEach(
		( fireId ) => {

			const fire = b8.ECS.getComponent( fireId, 'Fire' );
			const loc = b8.ECS.getComponent( fireId, 'Loc' );

			// Reduce the fire's duration
			if ( fire.duration !== Infinity ) {

				fire.duration -= dt;

				if ( fire.duration <= 0 ) {
					b8.ECS.removeEntity( fireId ); // Extinguish the fire
					mapper.types.vfx.spawn(
						loc.col, loc.row,
						{ id: 'shrink', fg: 9 }
					);
					return;
				}

			}

			// Apply damage to entities at the fire's location
			const entitiesAtLocation = b8.ECS.entitiesAt( loc.col, loc.row );
			entitiesAtLocation.forEach(
				( entityId ) => {

					if ( entityId === fireId ) return; // Skip the fire itself

					if ( b8.ECS.hasComponent( entityId, 'Health' ) ) {

						// Only spawn a FireSmall if the entity doesn't already have one
						if ( !b8.ECS.hasComponent( entityId, 'OnFire' ) ) {

							mapper.types.fireSmall.spawn(
								loc.col, loc.row,
								{
									parent: entityId,
									duration: 3.0
								}
							);

							b8.ECS.addComponent( entityId, 'OnFire' );

						}

					}

					if ( b8.ECS.hasComponent( entityId, 'Bomb' ) ) {
						const bomb = b8.ECS.getComponent( entityId, 'Bomb' );
						bomb.fuseTime = 2;
					}

				}
			);

			// Heat up nearby flammable entities
			const nearbyEntities = mapper.entitiesNextTo( fireId );
			nearbyEntities.forEach(
				( entityId ) => {

					if ( entityId === fireId ) return; // Skip the fire itself

					const flammable = b8.ECS.getComponent( entityId, 'Flammable' );
					if ( flammable ) {
						flammable.temperature = ( flammable.temperature || 0 ) + 70 * dt;
					}

				}
			);
		}
	);

};