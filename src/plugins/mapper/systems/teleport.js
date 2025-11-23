mapper.systems.teleportSystem = async function( dt ) {

	const list = b8.ECS.query( 'Teleport' );

	for ( const [ id, teleport ] of list ) {

		const doorways = b8.ECS.query( 'Portal' );

		const targetDoorway = doorways.find(
			( [ targetId ] ) => {
				const targetPortal = b8.ECS.getComponent( targetId, 'Portal' );
				return targetPortal?.name === teleport.target;
			}
		);

		if ( targetDoorway ) {
			const targetLoc = b8.ECS.getComponent( targetDoorway[ 0 ], 'Loc' );
			if ( targetLoc ) {
				await b8.Async.wait( 0.1 );
				b8.ECS.setLoc( id, targetLoc.col, targetLoc.row );
			}
		}

		// Remove teleport after executing
		b8.ECS.removeComponent( id, 'Teleport' );

	}

}
