mapper.systems.vfx = async function( dt ) {

	const list = b8.ECS.query( 'Vfx', 'Sprite' );

	for ( const id of list ) {

		const sprite = b8.ECS.getComponent( id, 'Sprite' );

		const animation = b8.Vfx.get( sprite.id );

		if ( animation ) {
			if ( b8.Animation.shouldLoop( animation, sprite.startTime ) ) continue;
		}

		b8.ECS.removeEntity( id );

	}

}
