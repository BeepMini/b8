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

					const health = b8.ECS.getComponent( entityId, 'Health' );
					if ( health ) health.value -= fire.damagePerSecond * dt;

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
						console.log( 'Heated entity', entityId, 'to', flammable ? flammable.temperature : 'N/A' );
					}

				}
			);
		}
	);

};