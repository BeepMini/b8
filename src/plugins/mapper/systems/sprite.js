mapper.systems.sprite = function( dt ) {

	const ids = b8.ECS.query( 'Sprite' );

	for ( const id of ids ) {

		const spr = b8.ECS.getComponent( id, 'Sprite' );

		if ( spr.nudgeCol ) { spr.nudgeCol = spr.nudgeCol * 0.75; }
		if ( spr.nudgeRow ) { spr.nudgeRow = spr.nudgeRow * 0.75; }

	}

};