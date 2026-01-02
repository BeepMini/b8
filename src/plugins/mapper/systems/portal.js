/**
 * Portal system
 *
 */

/**
 * Check for portal at given location.
 * If found, handle teleportation.
 *
 * @param {number} col - The column to check.
 * @param {number} row - The row to check.
 * @returns {Promise<boolean>} True if portal handled, false otherwise.
 */
mapper.systems.tryPortal = async function( col, row ) {

	const id = b8.ECS.entitiesAt( col, row );

	if ( !id ) return false;

	for ( const entityId of id ) {
		const portal = b8.ECS.getComponent( entityId, 'Portal' );
		return mapper.systems.handlePortal( portal );
	}

	return false;

}


/**
 * Handle portal teleportation.
 *
 * @param {Object} portal - The portal component.
 * @returns {Promise<boolean>} True if portal handled, false otherwise.
 */
mapper.systems.handlePortal = async function( portal ) {

	if ( !portal ) return false;
	if ( '' === portal.target ) return false;

	// Find portal with the matching name.

	const doorways = mapper.helpers.getObjectsByType( 'door' );
	const targetDoorway = doorways.find(
		( door ) => {
			return door.props.name === portal.target;
		}
	);

	// Teleport player to target doorway.
	if ( targetDoorway ) {
		await b8.Async.wait( 0.1 );
		mapper.setCurrentMap( targetDoorway.mapId );
		mapper.lastPosition = { col: targetDoorway.x, row: targetDoorway.y, map: targetDoorway.mapId };
		b8.ECS.setLoc( mapper.player, targetDoorway.x, targetDoorway.y );
	}

	return false; // Allow stepping onto the portal

};

