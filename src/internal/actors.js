( function( b8 ) {

	b8.Actors = {};

	/**
	 * Selects a loaded font as the actor sheet. Each row is one actor and
	 * each column is an animation frame. Use "actors" to restore the default.
	 *
	 * @param {string} fontName - The ID returned by b8.Async.loadFont.
	 * @returns {void}
	 */
	b8.Actors.setFont = function( fontName ) {

		b8.TextRenderer.curActors_ = b8.TextRenderer.getFontByName( fontName );

	};


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
	 * Adds an animation or replaces an existing animation's frames.
	 * Omitted options keep existing settings; new animations default to 4 fps
	 * and looping. Negative frame numbers mirror the corresponding frame.
	 *
	 * @param {string} name - The animation name used by Actors.draw and Actors.spr.
	 * @param {number[]} frames - A non-empty sequence of integer frame indices.
	 * @param {object} [options={}] - Optional playback settings.
	 * @param {number} [options.fps] - A positive number of frames per second.
	 * @param {boolean} [options.loop] - Whether playback repeats.
	 * @returns {void}
	 */
	b8.Actors.setAnimation = function( name, frames, options = {} ) {

		b8.Utilities.checkString( "name", name );
		b8.Utilities.checkArray( "frames", frames );
		b8.Utilities.assert( frames.length > 0, "Actor animation must contain at least one frame." );
		b8.Utilities.checkObject( "options", options );

		// Validate every slot, including holes, before changing the animation.
		for ( let i = 0; i < frames.length; i++ ) {
			b8.Utilities.checkInt( `frames[${i}]`, frames[ i ] );
		}

		const existing = Object.prototype.hasOwnProperty.call( b8.Actors.animations, name )
			? b8.Actors.animations[ name ] : null;
		const fps = options.fps !== undefined ? options.fps : ( existing ? existing.fps || 1 : 4 );
		// Existing animations without a loop flag are treated as non-looping.
		const loop = options.loop !== undefined ? options.loop : ( existing ? existing.loop ?? false : true );
		b8.Utilities.checkNumber( "fps", fps );
		b8.Utilities.assert( fps > 0, "Actor animation fps must be greater than zero." );
		b8.Utilities.checkBoolean( "loop", loop );

		// Copy the frames so later changes to the caller's array cannot alter playback.
		// Defining an own property also allows names such as "__proto__" safely.
		Object.defineProperty( b8.Actors.animations, name, {
			value: { frames: frames.slice(), fps, loop },
			writable: true, enumerable: true, configurable: true
		} );

	};


	/**
	 * Draw an actor at the specified x, y position.
	 *
	 * @param {number} ch - The character to draw.
	 * @param {number} frame - The already calculated animation frame, including its flip sign.
	 * @param {number} x - The x coordinate to draw the actor at.
	 * @param {number} y - The y coordinate to draw the actor at.
	 * @param {number} direction - The direction to draw the actor in. 0 = right, 1 = left.
	 * @returns {void}
	 */
	const drawActor = function( ch, frame, x, y, direction ) {

		const font = b8.TextRenderer.curActors_;
		// Reuse the caller's frame so explicit animation start times are respected.
		const chrIndex = ( ch * font.getColCount() ) + Math.abs( frame );

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
			ch, frame,
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

		drawActor( ch, frame, x, y, direction || 0 );

		// The animation is still playing.
		return true;

	};

} )( b8 );
