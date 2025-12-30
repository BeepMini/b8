( function( b8 ) {

	b8.Vfx = {};


	// List of animations and properties.
	b8.Vfx.animations = {
		'fire': {
			frames: [ 0, 1, 2, 3 ],
			loop: true,
		},
		'explosion': {
			frames: [ 6, 7, 8, 9, 10 ],
			fps: 8,
		},
		'portal': {
			frames: [ 12, 13 ],
			loop: true,
		},
		'cursor': {
			frames: [ 14, 15, 16, 15 ],
			loop: true,
			fps: 6,
		},
		'swipe': {
			frames: [ 18, 19, 20, 20, 20, 21, 22 ],
			fps: 18,
		},
		'skull': {
			frames: [ 24, 24, 24, 25, 26, 27, 28, 28, 29 ],
			fps: 12,
		},
		'fire-small': {
			frames: [ 30, 31, 32, 33 ],
			loop: true,
		},
		'fire-stand': {
			frames: [ 36, 37, 38, 39 ],
			loop: true,
		},
		'shrink': {
			frames: [ 34, 35, 40, 41 ],
			fps: 18,
		}
	};


	// Pixel directions for outline drawing.
	// Each entry is an [x, y] offset.
	const outlineDirections = [
		[ -1, -1 ],
		[ 1, 1 ],
		[ 1, -1 ],
		[ -1, 1 ],
		[ -1, 0 ],
		[ 1, 0 ],
		[ 0, -1 ],
		[ 0, 1 ]
	];


	// Loop through Vfx animations and set default fps and loop values.
	for ( const key in b8.Vfx.animations ) {
		const anim = b8.Vfx.animations[ key ];
		if ( anim.fps === undefined ) anim.fps = 4;
		if ( anim.loop === undefined ) anim.loop = false;
	}


	/**
	 * Draw Vfx at a specific position.
	 *
	 * @param {Object} animation The animation to draw.
	 * @param {number} x The x position to draw the Vfx.
	 * @param {number} y The y position to draw the Vfx.
	 * @param {number} startTime The start time of the animation.
	 * @returns {void}
	 */
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

		b8.Core.drawState.cursorCol++;

	};


	/**
	 * Draw Vfx at a specific position with an outline.
	 * The outline uses the specified background color for the border.
	 * The Vfx will have a transparent background with the border in the background colour.
	 *
	 * @param {Object} animation The animation to draw.
	 * @param {number} x The x position to draw the Vfx.
	 * @param {number} y The y position to draw the Vfx.
	 * @param {number} startTime The start time of the animation.
	 * @returns {void}
	 */
	const drawVfxOutline = function( animation, x, y, startTime ) {

		const font = b8.TextRenderer.curVfx_;
		const frame = Math.abs( b8.Animation.frame( animation, startTime ) );
		const direction = frame >= 0 ? 0 : 1;

		const currentFg = b8.Core.drawState.fgColor;
		const currentBg = b8.Core.drawState.bgColor;

		// Set outline color to background color.
		b8.Core.setColor( currentBg, -1 );

		for ( const dir of outlineDirections ) {
			b8.TextRenderer.spr(
				frame,
				x + dir[ 0 ], y + dir[ 1 ],
				font,
				direction || 0
			);
		}

		// Reset color to foreground color and draw main Vfx.
		b8.Core.setColor( currentFg, -1 );

		b8.TextRenderer.spr(
			frame,
			x, y,
			font,
			direction || 0
		);

		b8.Core.setColor( currentFg, currentBg );

		b8.Core.drawState.cursorCol++;

	};


	/**
	 * Draw Vfx at the current cursor position.
	 *
	 * @param {string} animation The animation to draw.
	 * @param {number} startTime The start time of the animation. If null, uses the core start time. If startTime is in the future, the animation will delayed until startTime.
	 * @param {number} [offsetCol=0] The x offset to apply to the drawing position.
	 * @param {number} [offsetRow=0] The y offset to apply to the drawing position.
	 * @return {boolean} Returns true if the animation is still playing, false if it has finished.
	 */
	b8.Vfx.draw = function( animation, startTime, offsetCol = 0, offsetRow = 0 ) {

		if ( startTime !== null ) b8.Utilities.checkNumber( "startTime", startTime );
		b8.Utilities.checkNumber( "offsetCol", offsetCol );
		b8.Utilities.checkNumber( "offsetRow", offsetRow );

		return b8.Vfx.spr(
			animation,
			startTime,
			( b8.Core.drawState.cursorCol + offsetCol ) * b8.CONFIG.CHR_WIDTH,
			( b8.Core.drawState.cursorRow + offsetRow ) * b8.CONFIG.CHR_HEIGHT,
		);

	};


	/**
	 * Draw Vfx outline at the current cursor position.
	 * The outline uses the current background color for the border.
	 * The Vfx will have a transparent background with the border in the background colour.
	 *
	 * @param {string} animation The animation to draw.
	 * @param {number} startTime The start time of the animation. If null, uses the core start time. If startTime is in the future, the animation will delayed until startTime.
	 * @param {number} [offsetCol=0] The x offset to apply to the drawing position.
	 * @param {number} [offsetRow=0] The y offset to apply to the drawing position.
	 * @return {boolean} Returns true if the animation is still playing, false if it has finished.
	 */
	b8.Vfx.drawOutline = function( animation, startTime, offsetCol = 0, offsetRow = 0 ) {

		if ( startTime !== null ) b8.Utilities.checkNumber( "startTime", startTime );
		b8.Utilities.checkNumber( "offsetCol", offsetCol );
		b8.Utilities.checkNumber( "offsetRow", offsetRow );

		return b8.Vfx.sprOutline(
			animation,
			startTime,
			( b8.Core.drawState.cursorCol + offsetCol ) * b8.CONFIG.CHR_WIDTH,
			( b8.Core.drawState.cursorRow + offsetRow ) * b8.CONFIG.CHR_HEIGHT,
		);

	};


	/**
	 * Draw Vfx at a specific x, y position.
	 *
	 * @param {string} animation The animation to draw.
	 * @param {number|null} startTime The start time of the animation. If null, uses the core start time. If startTime is in the future, the animation will delayed until startTime.
	 * @param {number} x The x position to draw the Vfx.
	 * @param {number} y The y position to draw the Vfx.
	 * @returns {boolean} Returns true if the animation is still playing, false if it has finished.
	 */
	b8.Vfx.spr = function( animation, startTime, x, y ) {

		if ( startTime !== null ) b8.Utilities.checkNumber( "startTime", startTime );
		b8.Utilities.checkNumber( "x", x );
		b8.Utilities.checkNumber( "y", y );

		if ( startTime > b8.Core.getNow() ) return true;

		const anim = b8.Vfx.get( animation );

		if ( !b8.Animation.shouldLoop( anim, startTime ) ) return false;

		drawVfx(
			anim,
			x, y,
			startTime
		);

		return true;

	};


	/**
	 * Draw Vfx at a specific x, y position with an outline.
	 * The outline uses the current background color for the border.
	 * The Vfx will have a transparent background with the border in the background colour.
	 *
	 * @param {string} animation The animation to draw.
	 * @param {number|null} startTime The start time of the animation. If null, uses the core start time. If startTime is in the future, the animation will delayed until startTime.
	 * @param {number} x The x position to draw the Vfx.
	 * @param {number} y The y position to draw the Vfx.
	 * @returns {boolean} Returns true if the animation is still playing, false if it has finished.
	 */
	b8.Vfx.sprOutline = function( animation, startTime, x, y ) {

		if ( startTime !== null ) b8.Utilities.checkNumber( "startTime", startTime );
		b8.Utilities.checkNumber( "x", x );
		b8.Utilities.checkNumber( "y", y );

		if ( startTime > b8.Core.getNow() ) return true;

		const anim = b8.Vfx.get( animation );

		if ( !b8.Animation.shouldLoop( anim, startTime ) ) return false;

		drawVfxOutline(
			anim,
			x, y,
			startTime
		);

		return true;

	};


	/**
	 * Get Vfx animation by id.
	 *
	 * @param {string} animation The animation id.
	 * @returns {Object|undefined} The Vfx animation object, or undefined if not found.
	 */
	b8.Vfx.get = function( animation ) {

		b8.Utilities.checkString( "animation", animation );
		if ( b8.Vfx.animations[ animation ] === undefined ) {
			b8.Utilities.fatal( "Invalid Vfx animation: " + animation );
		}

		return b8.Vfx.animations[ animation ];

	};


	/**
	 * Checks if the Vfx animation has finished looping.
	 *
	 * @param {string|Object} animation The animation to check.
	 * @param {number} startTime The start time of the animation.
	 * @returns {boolean} Returns true if the animation should continue, false if it has finished looping.
	 */
	b8.Vfx.shouldLoop = function( anim, startTime ) {

		if ( typeof anim === 'string' ) {
			anim = b8.Vfx.get( anim );
		}

		b8.Utilities.checkObject( "anim", anim );
		b8.Utilities.checkNumber( "startTime", startTime );

		return b8.Animation.shouldLoop( anim, startTime );

	};

} )( b8 );
