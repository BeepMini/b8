mapper.systems.bomb = async function( dt ) {

	const bombs = b8.ECS.query( 'Bomb' );

	const color = mapper.types.bomb.color;
	const flickerColor = mapper.types.bomb.flickerColor;

	for ( const id of bombs ) {

		const bomb = b8.ECS.getComponent( id, 'Bomb' );

		// Skip if fuse not ignited.
		if ( bomb.fuseTime === false ) continue;

		// Decrease fuse time.
		bomb.fuseTime -= dt;

		// Make bomb flicker as fuse gets shorter.
		const sprite = b8.ECS.getComponent( id, 'Sprite' );
		if ( bomb.fuseTime > 5 ) {
			sprite.fg = color;
		} else if ( bomb.fuseTime > 2.5 ) {
			sprite.fg = ( Math.floor( bomb.fuseTime * 2 ) % 2 === 0 ) ? color : flickerColor;
		} else if ( bomb.fuseTime > 1 ) {
			sprite.fg = ( Math.floor( bomb.fuseTime * 4 ) % 2 === 0 ) ? color : flickerColor;
		} else if ( bomb.fuseTime > 0 ) {
			sprite.fg = ( Math.floor( bomb.fuseTime * 10 ) % 2 === 0 ) ? color : flickerColor;
		}

		// Explode bomb when fuse reaches zero.
		if ( bomb.fuseTime <= 0 ) {

			const bombLoc = b8.ECS.getComponent( id, 'Loc' );

			// Spawn explosion VFX
			mapper.types.vfx.spawn( bombLoc.col, bombLoc.row, { id: 'explosion', fg: 9 } );

			// Explode bomb
			await mapper.types.bomb.explode( id );

			// Remove bomb entity
			b8.ECS.removeEntity( id );

		}

	};

};