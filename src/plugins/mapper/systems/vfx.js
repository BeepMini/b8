mapper.systems.vfx = async function( dt ) {

	const list = b8.ECS.query( 'Vfx', 'Sprite' );

	for ( const id of list ) {

		const sprite = b8.ECS.getComponent( id, 'Sprite' );
		if ( b8.Vfx.shouldLoop( sprite.id, sprite.startTime ) ) continue;

		b8.ECS.removeEntity( id );

	}

}
