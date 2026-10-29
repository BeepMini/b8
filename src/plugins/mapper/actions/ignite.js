/**
 * Light unlit bombs ahead of the player using the configured fuse duration.
 *
 * @param {number} playerId Entity ID of the acting player.
 * @returns {boolean} Whether an interaction was performed.
 */
mapper.actions.ignite = function( playerId ) {

	const ids = mapper.entitiesAhead( playerId );
	let didIgnite = false;

	for ( const targetId of ids ) {

		// Don't ignite self.
		if ( targetId === playerId ) continue;

		// Ignite the bomb.
		const bomb = b8.ECS.getComponent( targetId, 'Bomb' );
		if ( !bomb ) continue;
		if ( bomb.fuseTime !== false ) continue;

		// Start the fuse.
		bomb.fuseTime = mapper.CONFIG.bombFuseSeconds;
		didIgnite = true;

	};

	return didIgnite;

};
