mapper.systems.pathFollower = async function( dt ) {

	const bombs = b8.ECS.query( 'Bomb' );

	for ( const id of bombs ) {

		const bomb = b8.ECS.getComponent( id, 'Bomb' );

		bomb.timer -= dt;

		if ( bomb.timer <= 0 ) {

			await mapper.types.bomb.explode( id );
			b8.ECS.removeEntity( id );

		}

	};

};