mapper.systems.flammable = async function( dt ) {

	const flammables = b8.ECS.query( 'Flammable' );

	for ( const entityId of flammables ) {

		const flammable = b8.ECS.getComponent( entityId, 'Flammable' );

		// The entity may already have been removed by another system earlier in
		// the frame, so skip it if the component no longer exists.
		if ( !flammable ) continue;

		// Check if the flammable entity should catch fire.
		if ( flammable.temperature >= 100 ) {
			mapper.handleFlammableIgnition( entityId );
			continue;
		}

		// Cool down flammable entities that are not on fire.
		flammable.temperature = Math.max( 0, ( flammable.temperature || 0 ) - 10 * dt );
	}
};
