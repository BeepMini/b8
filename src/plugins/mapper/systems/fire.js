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


			// Apply damage or custom burn behavior to entities at the fire's location
			const entitiesAtLocation = b8.ECS.entitiesAt( loc.col, loc.row );
			entitiesAtLocation.forEach(
				( entityId ) => {

					// Skip the fire itself
					if ( entityId === fireId ) return;

					// Set entities on fire if they have a health component.
					// This suggests they are living things that can burn (enemy/ player/ npc).
					// We spawn a small fire effect on them to indicate this.
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

					mapper.doHandler( entityId, 'burnHandler' );

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

					mapper.doHandler( entityId, 'burnHandler' );

				}
			);
		}
	);

};