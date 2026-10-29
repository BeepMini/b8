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
 * @returns {boolean} True if portal handled, false otherwise.
 */
mapper.systems.tryPortal = function( col, row ) {

	const id = b8.ECS.entitiesAt( col, row );

	if ( !id ) return false;

	for ( const entityId of id ) {
		const portal = b8.ECS.getComponent( entityId, 'Portal' );
		return mapper.systems.handlePortal( portal );
	}

	return false;

};


/**
 * Handle portal teleportation.
 *
 * @param {Object} portal - The portal component.
 * @returns {boolean} True if portal handled, false otherwise.
 */
mapper.systems.handlePortal = function( portal ) {

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
		mapper.setCurrentMap( targetDoorway.mapId );
		mapper.lastPosition = { col: targetDoorway.x, row: targetDoorway.y, map: targetDoorway.mapId };
		b8.ECS.setLoc( mapper.player, targetDoorway.x, targetDoorway.y );
		return true;
	}

	return false; // Allow stepping onto the portal

};
