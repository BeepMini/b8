( function( b8 ) {

	b8.Vfx = {};


	b8.Vfx.animations = {
		'explosion': {
			frames: [ 5, 6, 7, 8, 9 ],
			fps: 8,
		},
		'fire': {
			frames: [ 0, 1, 2, 3 ],
			loop: true,
		},
		'portal': {
			frames: [ 10, 11 ],
			loop: true,
		},
		'swipe': {
			frames: [ 15, 16, 17, 17, 17, 18, 19 ],
			fps: 12,
		},
		'skull': {
			frames: [ 20, 20, 21, 22, 23, 24, 24, 24 ],
			fps: 12,
		}
	};


	// Loop through Vfx animations and set default fps and loop values.
	for ( const key in b8.Vfx.animations ) {
		const anim = b8.Vfx.animations[ key ];
		if ( anim.fps === undefined ) {
			anim.fps = 4;
		}
		if ( anim.loop === undefined ) {
			anim.loop = false;
		}
	}


	const drawVfx = function( animation, x, y, startTime ) {

		const font = b8.TextRenderer.curVfx_;
		const frame = Math.abs( b8.Animation.frame( animation, startTime ) );
		const direction = frame >= 0 ? 0 : 1;

		b8.TextRenderer.spr(
			frame,
			x, y,
			font,
			direction || 0
		);

	};



	/**
	 * Draw Vfx at the current cursor position.
	 *
	 * @param {string} animation - The animation to draw.
	 * @param {number} startTime - The start time of the animation.
	 * @param {number} [offsetCol=0] - The x offset to apply to the drawing position.
	 * @param {number} [offsetRow=0] - The y offset to apply to the drawing position.
	 * @returns {void}
	 */
	b8.Vfx.draw = function( animation, startTime, offsetCol = 0, offsetRow = 0 ) {

		b8.Utilities.checkString( "animation", animation );
		if ( b8.Vfx.animations[ animation ] === undefined ) {
			b8.Utilities.fatal( "Invalid Vfx animation: " + animation );
		}
		if ( startTime !== null ) b8.Utilities.checkNumber( "startTime", startTime );
		b8.Utilities.checkNumber( "offsetCol", offsetCol );
		b8.Utilities.checkNumber( "offsetRow", offsetRow );

		const anim = b8.Vfx.animations[ animation ];

		if ( !b8.Animation.shouldLoop( anim, startTime ) ) return false;

		drawVfx(
			anim,
			( b8.Core.drawState.cursorCol + offsetCol ) * b8.CONFIG.CHR_WIDTH,
			( b8.Core.drawState.cursorRow + offsetRow ) * b8.CONFIG.CHR_HEIGHT,
			startTime
		);

		// The animation is still playing.
		return true;

	};



} )( b8 );
