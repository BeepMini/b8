mapper.systems.actionCooldown = function( dt ) {

	const ids = b8.ECS.query( 'ActionCooldown' );

	for ( const id of ids ) {

		const ac = b8.ECS.getComponent( id, 'ActionCooldown' );

		ac.time -= dt;
		if ( ac.time < 0 ) ac.time = 0;

	}

};