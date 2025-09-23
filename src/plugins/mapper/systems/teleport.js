mapper.systems.teleportSystem = async function( dt ) {

	const list = beep8.ECS.query( 'Teleport' );

	for ( const [ id, teleport ] of list ) {
		const doorways = beep8.ECS.query( 'Portal' );
		const targetDoorway = doorways.find(
			( [ targetId ] ) => {
				const targetPortal = beep8.ECS.getComponent( targetId, 'Portal' );
				return targetPortal?.name === teleport.target;
			}
		);

		if ( targetDoorway ) {
			const targetLoc = beep8.ECS.getComponent( targetDoorway[ 0 ], 'Loc' );
			if ( targetLoc ) {
				await beep8.Async.wait( 0.1 );
				beep8.ECS.setLoc( id, targetLoc.col, targetLoc.row );
			}
		}

		// Remove teleport after executing
		beep8.ECS.removeComponent( id, 'Teleport' );
	}

}
