
/**
 * Update burning-character effects using real time.
 *
 * @param {number} dt - Seconds elapsed since the previous frame.
 * @returns {void}
 */
mapper.systems.fireSmall = function( dt ) {

	const smallFires = b8.ECS.query( 'FireSmall' );

	for ( const entityId of smallFires ) {

		const smallFire = b8.ECS.getComponent( entityId, 'FireSmall' );
		const loc = b8.ECS.getComponent( entityId, 'Loc' );

		// Another system may have already removed the fire effect, so skip it if
		// the components are no longer available.
		if ( !smallFire || !loc ) continue;

		const parentLoc = b8.ECS.getComponent( smallFire.parent, 'Loc' );
		const parentHealth = b8.ECS.getComponent( smallFire.parent, 'Health' );

		// If the parent is already gone, remove the attached fire effect too.
		if ( !parentLoc && !parentHealth ) {
			b8.ECS.removeEntity( entityId );
			continue;
		}

		// Keep the small fire at the parent's location.
		if ( parentLoc ) {
			loc.col = parentLoc.col;
			loc.row = parentLoc.row;
		}

		// Damage the burning parent while it is still alive.
		if ( parentHealth ) {
			parentHealth.value -= mapper.CONFIG.fireSmallDamagePerSecond * dt;

			// If parent dies, extinguish the small fire.
			if ( parentHealth.value < 0 ) smallFire.duration = 0;
		}

		// Reduce the fire's duration.
		smallFire.duration -= dt;
		if ( smallFire.duration > 0 ) continue;

		b8.ECS.removeEntity( entityId );

		// Only try to clear OnFire if the parent entity still exists.
		if ( parentLoc || parentHealth ) {
			b8.ECS.removeComponent( smallFire.parent, 'OnFire' );
		}

		if ( parentHealth ) {
			parentHealth.value = Math.floor( parentHealth.value );
		}
	}

};
