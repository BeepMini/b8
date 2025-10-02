mapper.systems.tryPushing = ( col, row, dx, dy ) => {

	const hitX = col + dx;
	const hitY = row + dy;

	for ( const id of b8.ECS.entitiesAt( hitX, hitY ) ) {

		// If not a solid object, or pushable, skip.
		if ( !b8.ECS.hasComponent( id, 'Solid' ) ) continue;
		if ( !b8.ECS.hasComponent( id, 'Pushable' ) ) continue;

		const loc = b8.ECS.getComponent( id, 'Loc' );
		const newCol = loc.col + dx;
		const newRow = loc.row + dy;

		const blocked =
			!mapper.collision.isWalkable( newCol, newRow ) ||
			b8.ECS.entitiesAt( newCol, newRow ).some( e => b8.ECS.hasComponent( e, 'Solid' ) );

		if ( !blocked ) {
			// move the pushable thing.
			b8.ECS.setLoc( id, newCol, newRow );

			b8.Sfx.play( 'fx/action/drag' );

			return false;
		}

		return true;

	}

	return false;

};



mapper.systems.tryPulling = ( col, row, dx, dy, playerId ) => {

	const hitCol = col + dx;
	const hitRow = row + dy;

	for ( const id of b8.ECS.entitiesAt( hitCol, hitRow ) ) {

		if ( !b8.ECS.hasComponent( id, 'Solid' ) ) continue;
		if ( !b8.ECS.hasComponent( id, 'Pushable' ) ) continue; // now covers pull

		const backCol = col - dx;
		const backRow = row - dy;
		if ( !mapper.collision.isWalkable( backCol, backRow ) ||
			b8.ECS.entitiesAt( backCol, backRow ).some( e => b8.ECS.hasComponent( e, 'Solid' ) ) ) {
			return false;
		}

		// Move target into player's tile, move player back
		b8.ECS.setLoc( id, col, row );
		b8.ECS.setLoc( playerId, backCol, backRow );

		b8.Sfx.play( 'fx/action/drag' );

		return true;

	}

	return false;

};
