mapper.actions.ignite = function( playerId ) {

	const ids = mapper.entitiesAhead( playerId );
	let didIgnite = false;

	for ( const targetId of ids ) {

		// Don't ignite self.
		if ( targetId === playerId ) continue;

		// Ignite the bomb.
		const bomb = b8.ECS.getComponent( targetId, 'Bomb' );
		if ( !bomb ) continue;
		if ( bomb.fuseTurns !== false ) continue;

		// Start the fuse.
		bomb.fuseTurns = mapper.CONFIG.bombFuseTurns;
		didIgnite = true;

	};

	return didIgnite;

};
