mapper.systems.tryPortal = async function( col, row ) {

	const id = beep8.ECS.entitiesAt( col, row );
	console.log( 'Checking for portal at', col, row, id );
	if ( !id ) return false;

	for ( const entityId of id ) {
		const portal = beep8.ECS.getComponent( entityId, 'Portal' );
		return mapper.systems.handlePortal( portal );
	}

}

mapper.systems.handlePortal = async function( portal ) {

	if ( !portal ) return false;
	if ( portal.target === '' ) return false;

	// Find portal with the matching name.
	const doorways = beep8.ECS.query( 'Portal' );
	const targetDoorway = doorways.find(
		( id ) => {
			const targetPortal = beep8.ECS.getComponent( id, 'Portal' );
			return targetPortal.name === portal.target;
		}
	);

	if ( targetDoorway ) {
		const targetLoc = beep8.ECS.getComponent( targetDoorway, 'Loc' );
		if ( targetLoc ) {
			await beep8.Async.wait( 0.1 );
			beep8.ECS.setLoc( mapper.player, targetLoc.col, targetLoc.row );
		}
	}

	return false; // Allow stepping onto the portal

};

