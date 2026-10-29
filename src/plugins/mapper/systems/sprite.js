/**
 * Ease sprite nudge offsets back toward their resting tile position.
 *
 * @param {number} dt Frame delta in seconds; accepted for the ECS system interface but not used here.
 * @returns {void} Updates entity components in place.
 */
mapper.systems.sprite = function( dt ) {

	const ids = b8.ECS.query( 'Sprite' );

	for ( const id of ids ) {

		const spr = b8.ECS.getComponent( id, 'Sprite' );

		if ( spr.nudgeCol ) { spr.nudgeCol = spr.nudgeCol * 0.75; }
		if ( spr.nudgeRow ) { spr.nudgeRow = spr.nudgeRow * 0.75; }

	}

};
