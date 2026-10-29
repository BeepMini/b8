/**
 * Show the first readable message ahead and delay repeated interaction.
 *
 * @param {number} playerId Entity ID of the acting player.
 * @returns {boolean} Whether an interaction was performed.
 */
mapper.actions.read = function( playerId ) {

	const entities = mapper.entitiesAhead( playerId );

	for ( const id of entities ) {

		const obj = b8.ECS.getComponent( id, 'Message' );
		const sprite = b8.ECS.getComponent( id, 'Sprite' );

		if ( !obj || !sprite ) continue;

		b8.color(
			sprite.fg ?? 15,
			sprite.bg ?? 5
		);

		const message = mapper.helpers.processChatText( obj.message || '' );
		b8.Async.dialogTypewriter( message, [ "OK" ], 20 );

		mapper.delayKeyPress( id );

		return true;

	}

	return false;

};
