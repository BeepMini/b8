mapper.systems.characterAnimation = function( dt ) {

	const anims = b8.ECS.query( 'CharacterAnimation' );
	if ( !anims ) return;

	// Loop through anims.
	for ( const id of anims ) {

		const anim = b8.ECS.getComponent( id, 'CharacterAnimation' );
		if ( !anim ) continue;

		if ( anim.duration > 0 ) {

			anim.duration -= dt;
			if ( anim.duration <= 0 ) {

				let defaultAnimation = anim.default || '';
				const direction = b8.ECS.getComponent( id, 'Direction' );

				if ( direction ) {
					const directionNames = {
						'0,1': '',
						'0,-1': '-up',
						'1,0': '-right',
						'-1,0': '-left'
					};
					const directionName = directionNames[ `${direction.dx},${direction.dy}` ] || '';
					defaultAnimation = defaultAnimation + directionName;
				}

				anim.name = defaultAnimation;
			}
		}

	}

}