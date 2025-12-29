
mapper.systems.fireSmall = async function( dt ) {

	const damagePerSecond = mapper.types.fireSmall.damagePerSecond;

	const smallFires = b8.ECS.query( 'FireSmall' );

	smallFires.forEach(
		( entityId ) => {

			const smallFire = b8.ECS.getComponent( entityId, 'FireSmall' );
			const loc = b8.ECS.getComponent( entityId, 'Loc' );
			const parentLoc = b8.ECS.getComponent( smallFire.parent, 'Loc' );

			// Keep the small fire at the parent's location
			if ( parentLoc ) {
				loc.col = parentLoc.col;
				loc.row = parentLoc.row;
			}

			// Get entities at the fire's location
			const health = b8.ECS.getComponent( smallFire.parent, 'Health' );
			if ( health ) {
				health.value -= damagePerSecond * dt;
				// If parent dies, extinguish the small fire.
				if ( health.value < 0 ) smallFire.duration = 0;
			}

			// Reduce the fire's duration
			smallFire.duration -= dt;
			if ( smallFire.duration <= 0 ) {
				b8.ECS.removeEntity( entityId );
				b8.ECS.removeComponent( smallFire.parent, 'OnFire' );
				if ( health ) health.value = Math.floor( health.value );
			}

		}
	);

};

