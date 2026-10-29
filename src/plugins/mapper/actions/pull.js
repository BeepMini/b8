/**
 * Try pulling an object using the player location and facing direction.
 *
 * @param {number} playerId Entity ID of the acting player.
 * @returns {boolean} Whether an interaction was performed.
 */
mapper.actions.pull = function( playerId ) {

	const loc = b8.ECS.getComponent( playerId, 'Loc' );
	const dir = b8.ECS.getComponent( playerId, 'Direction' ); // {dx,dy}

	return mapper.systems.tryPulling( loc.col, loc.row, dir.dx, dir.dy, playerId );

};
