/**
 * Mapper system: Pickups
 *
 * Handles player picking up items in the game world.
 */
mapper.systems.pickup = function() {

	const playerId = mapper.player;
	const pLoc = b8.ECS.getComponent( playerId, 'Loc' );

	// Get all pickup entities.
	const pickupIds = b8.ECS.query( 'Pickup', 'Loc' );

	// Process each pickup and check their location.
	pickupIds.forEach(
		( id ) => {

			// Check if at same location as player.
			const loc = b8.ECS.getComponent( id, 'Loc' );
			if ( loc.col !== pLoc.col || loc.row !== pLoc.row ) return;

			// Handle the pickup.
			const pickup = b8.ECS.getComponent( id, 'Pickup' );

			const fn = mapper.types[ pickup.kind ]?.pickupHandler;
			if ( fn ) fn( playerId, pickup );

			// Consume (remove from world).
			if ( pickup.consume ) {

				// Remove entity.
				b8.ECS.removeEntity( id );

				// Remove map object.
				mapper.removeObjectAt( loc.col, loc.row, pickup.kind );

			}

		}
	);

};
