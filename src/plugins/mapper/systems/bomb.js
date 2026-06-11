mapper.systems.bomb = async function() {

	const bombs = b8.ECS.query( 'Bomb' );

	const color = mapper.types.bomb.color;
	const flickerColor = mapper.types.bomb.flickerColor;

	for ( const id of bombs ) {

		const bomb = b8.ECS.getComponent( id, 'Bomb' );

		// Skip if fuse not ignited.
		if ( bomb.fuseTurns === false ) continue;

		// Decrease fuse time.
		bomb.fuseTurns--;

		// Make bomb flicker as fuse gets shorter.
		const sprite = b8.ECS.getComponent( id, 'Sprite' );
		if ( bomb.fuseTurns > 5 ) {
			sprite.fg = color;
		} else if ( bomb.fuseTurns > 2 ) {
			sprite.fg = ( bomb.fuseTurns % 2 === 0 ) ? color : flickerColor;
		} else if ( bomb.fuseTurns > 0 ) {
			sprite.fg = flickerColor;
		}

		// Explode bomb when fuse reaches zero.
		if ( bomb.fuseTurns <= 0 ) {

			const bombLoc = b8.ECS.getComponent( id, 'Loc' );

			// Spawn explosion VFX
			mapper.types.vfx.spawn( bombLoc.col, bombLoc.row, { id: 'explosion', fg: 9 } );

			// Explode bomb
			await mapper.types.bomb.explode( id );

			// Remove bomb entity
			b8.ECS.removeEntity( id );

			// Screen shake.
			b8.Renderer.shakeScreen();

			// Explode sound effect.
			b8.Sfx.play( 'weapon/explode/013' );

		}

	}

};
