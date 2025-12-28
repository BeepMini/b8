mapper.systems.flammable = async function( dt ) {

	const flammables = b8.ECS.query( 'Flammable' );

	flammables.forEach(
		( entityId ) => {

			const flammable = b8.ECS.getComponent( entityId, 'Flammable' );

			// Check if the flammable entity should catch fire.
			if ( flammable.temperature >= 100 ) {
				const location = b8.ECS.getComponent( entityId, 'Loc' );
				b8.ECS.removeEntity( entityId ); // The entity catches fire

				mapper.types.fire.spawn(
					location.col,
					location.row
				);

				return;
			}

			// Cool down flammable entities that are not on fire.
			flammable.temperature = Math.max( 0, ( flammable.temperature || 0 ) - 10 * dt );

		}
	);
};
