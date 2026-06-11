mapper.systems.fire = function() {

	const fires = b8.ECS.query( 'Fire', 'Loc' );

	for ( const fireId of fires ) {

		const fire = b8.ECS.getComponent( fireId, 'Fire' );
		const loc = b8.ECS.getComponent( fireId, 'Loc' );

		// Another system may have already removed the fire entity this frame.
		if ( !fire || !loc ) continue;

		// Reduce the fire's duration.
		if ( fire.lifeTurns !== Infinity ) {

			fire.lifeTurns--;

			if ( fire.lifeTurns <= 0 ) {
				b8.ECS.removeEntity( fireId );
				mapper.types.vfx.spawn(
					loc.col, loc.row,
					{ id: 'shrink', fg: 9 }
				);
				continue;
			}

		}

		if ( fire.turnsUntilSpread > 0 ) {
			fire.turnsUntilSpread--;
			continue;
		}
		fire.turnsUntilSpread = Math.max( 0, ( fire.spreadTickRateTurns || mapper.CONFIG.fireSpreadTurns ) - 1 );

		// Entities standing directly on the fire can catch alight and trigger
		// any immediate burn reactions.
		const entitiesAtLocation = b8.ECS.entitiesAt( loc.col, loc.row ) || [];
		for ( const entityId of entitiesAtLocation ) {
			if ( entityId === fireId ) continue;

			mapper.applyFireToEntity(
				entityId,
				{
					sourceId: fireId,
					igniteLiving: true,
					burnDuration: 3.0,
				}
			);
		}

		// Nearby entities are heated by the fire and may also react to it via
		// their burn handlers, for example bombs starting their fuse.
		const nearbyEntities = mapper.entitiesNextTo( fireId );
		for ( const entityId of nearbyEntities ) {
			if ( entityId === fireId ) continue;

			mapper.applyFireToEntity(
				entityId,
				{
					sourceId: fireId,
					heatAmount: mapper.CONFIG.fireHeatPerTurn,
				}
			);
		}
	}

};
