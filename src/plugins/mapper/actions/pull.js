mapper.actions.pull = function( playerId ) {

	const loc = b8.ECS.getComponent( playerId, 'Loc' );
	const dir = b8.ECS.getComponent( playerId, 'Direction' ); // {dx,dy}

	mapper.systems.tryPulling( loc.col, loc.row, dir.dx, dir.dy, playerId );

};