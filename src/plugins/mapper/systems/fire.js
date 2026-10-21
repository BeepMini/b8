/**
 * Update fire lifetime and continuously heat nearby entities.
 *
 * @param {number} dt - Seconds elapsed since the previous frame.
 * @returns {void}
 */
mapper.systems.fire = function( dt ) {

	const fires = b8.ECS.query( 'Fire', 'Loc' );

	for ( const fireId of fires ) {

		const fire = b8.ECS.getComponent( fireId, 'Fire' );
		const loc = b8.ECS.getComponent( fireId, 'Loc' );

		// Another system may have already removed the fire entity this frame.
		if ( !fire || !loc ) continue;

		// Switches can extinguish a named fire without deleting it. Keeping the
		// entity lets another switch, or a released pressure plate, relight it.
		if ( fire.active === false ) continue;

		// Reduce the fire's duration.
		if ( fire.duration !== Infinity ) {

			fire.duration -= dt;

			if ( fire.duration <= 0 ) {
				b8.ECS.removeEntity( fireId );
				mapper.types.vfx.spawn(
					loc.col, loc.row,
					{ id: 'shrink', fg: 9 }
				);
				continue;
			}

		}

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
					heatAmount: mapper.CONFIG.fireHeatPerSecond * dt,
				}
			);
		}
	}

};
