mapper.systems.flammable = function() {

	const flammables = b8.ECS.query( 'Flammable' );

	for ( const entityId of flammables ) {

		const flammable = b8.ECS.getComponent( entityId, 'Flammable' );

		// The entity may already have been removed by another system earlier in
		// the frame, so skip it if the component no longer exists.
		if ( !flammable ) continue;

		// Check if the flammable entity should catch fire.
		if ( flammable.temperature >= mapper.CONFIG.flammableIgniteThreshold ) {
			mapper.handleFlammableIgnition( entityId );
			continue;
		}

		// Do not cool an entity on the same turn it was heated by nearby fire.
		if ( flammable.heatedThisTurn ) {
			flammable.heatedThisTurn = false;
			continue;
		}

		// Cool down flammable entities that are not on fire.
		flammable.temperature = Math.max( 0, ( flammable.temperature || 0 ) - mapper.CONFIG.flammableCoolingPerTurn );
	}
};
