mapper.actions.ignite = function( playerId ) {

	const ids = mapper.entitiesAhead( playerId );

	for ( const targetId of ids ) {

		// Don't ignite self.
		if ( targetId === playerId ) continue;

		// Ignite the bomb.
		const bomb = b8.ECS.getComponent( targetId, 'Bomb' );
		if ( !bomb ) continue;

		// Start the fuse.
		bomb.fuseTime = 5;

	};

};