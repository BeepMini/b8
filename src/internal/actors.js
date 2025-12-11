( function( b8 ) {

	b8.Actors = {};


	/**
	 * The default animations for the actors.
	 * This can be extended or replaced by your own animations.
	 *
	 * @type {Object}
	 */
	b8.Actors.animations = {
		'idle': {
			frames: [ 0 ],
			fps: 1,
		},
		'idle-down': {
			frames: [ 0 ],
			fps: 1,
		},
		'idle-right': {
			frames: [ 1 ],
			fps: 1,
		},
		'idle-left': {
			frames: [ -1 ],
			fps: 1,
		},
		'idle-up': {
			frames: [ 4 ],
			fps: 1,
		},
		'move-right': {
			frames: [ 1, 2 ],
			fps: 4,
			loop: true
		},
		'move-left': {
			frames: [ -1, -2 ],
			fps: 4,
			loop: true
		},
		'move-up': {
			frames: [ 5, -5 ],
			fps: 4,
			loop: true
		},
		'move-down': {
			frames: [ 3, -3 ],
			fps: 4,
			loop: true,
		},
		'jump-right': {
			frames: [ 5 ],
			fps: 1,
			loop: false
		},
		'jump-left': {
			frames: [ -5 ],
			fps: 1,
			loop: false
		},
		'spin-left': {
			frames: [ 0, 1, 4, -1 ],
			fps: 4,
			loop: true
		},
		'spin-right': {
			frames: [ 0, -1, 4, 1 ],
			fps: 4,
			loop: true
		}

	};


	/**
	 * Draw an actor at the specified x, y position.
	 *
	 * @param {number} ch - The character to draw.
	 * @param {string} animation - The animation to draw.
	 * @param {number} x - The x coordinate to draw the actor at.
	 * @param {number} y - The y coordinate to draw the actor at.
	 * @param {number} direction - The direction to draw the actor in. 0 = right, 1 = left.
	 * @returns {void}
	 */
	const drawActor = function( ch, animation, x, y, direction ) {

		const font = b8.TextRenderer.curActors_;
		const chrIndex = ( ch * font.getColCount() ) + Math.abs( b8.Animation.frame( animation ) );

		b8.TextRenderer.spr(
			chrIndex,
			x, y,
			font,
			direction || 0
		);

	}


	/**
	 * Draw an actor at the current cursor position.
	 *
	 * @param {number} ch - The character to draw.
	 * @param {string} animation - The animation to draw.
	 * @param {number} [offsetCol=0] - The x offset to apply to the drawing position.
	 * @param {number} [offsetRow=0] - The y offset to apply to the drawing position.
	 * @returns {void}
	 */
	b8.Actors.draw = function( ch, animation, offsetCol = 0, offsetRow = 0 ) {

		b8.Utilities.checkInt( "ch", ch );
		b8.Utilities.checkString( "animation", animation );
		if ( b8.Actors.animations[ animation ] === undefined ) {
			b8.Utilities.fatal( "Invalid actor animation: " + animation );
		}
		b8.Utilities.checkNumber( "offsetCol", offsetCol );
		b8.Utilities.checkNumber( "offsetRow", offsetRow );

		const anim = b8.Actors.animations[ animation ];
		const frame = b8.Animation.frame( anim );
		const direction = frame >= 0 ? 0 : 1;

		drawActor(
			ch, anim,
			( b8.Core.drawState.cursorCol + offsetCol ) * b8.CONFIG.CHR_WIDTH,
			( b8.Core.drawState.cursorRow + offsetRow ) * b8.CONFIG.CHR_HEIGHT,
			direction || 0
		);

	};


	/**
	 * Draw an actor at the specified x, y position.
	 * This ignores the cursor position and draws at specific x, y coordinates.
	 * This is useful for drawing actors in the game world and real-time apps.
	 *
	 * By default the animations will start playing based upon the current game
	 * time. This means they may loop from anywhere in the animation sequence.
	 * If you specify the startTime then the animation will start from the
	 * beginning. This is particularly useful for non-looping animations.
	 *
	 * The startTime should be stored and not changed each time the animation is
	 * drawn.
	 *
	 * The function will return false if the animation has finished playing.
	 *
	 * @param {number} ch The character to draw.
	 * @param {string} animation The animation to draw.
	 * @param {number} x The x coordinate to draw the actor at.
	 * @param {number} y The y coordinate to draw the actor at.
	 * @param {number} [startTime=null] The time the animation started.
	 * @returns {boolean} True if the animation is still playing, false if it has finished.
	 */
	b8.Actors.spr = function( ch, animation, x, y, startTime = null ) {

		b8.Utilities.checkInt( "ch", ch );
		b8.Utilities.checkString( "animation", animation );
		if ( b8.Actors.animations[ animation ] === undefined ) {
			b8.Utilities.fatal( "Invalid actor animation: " + animation );
		}
		b8.Utilities.checkNumber( "x", x );
		b8.Utilities.checkNumber( "y", y );
		if ( startTime !== null ) b8.Utilities.checkNumber( "startTime", startTime );

		const anim = b8.Actors.animations[ animation ];
		const frame = b8.Animation.frame( anim, startTime );
		const direction = frame >= 0 ? 0 : 1;

		if ( !b8.Animation.shouldLoop( anim, startTime ) ) return false;

		drawActor( ch, anim, x, y, direction || 0 );

		// The animation is still playing.
		return true;

	};

} )( b8 );
