( function( beep8 ) {

	beep8.Actors = {};


	beep8.Actors.animations = {
		'idle': {
			frames: [ 0 ],
			fps: 1,
			loop: true
		},
		'move-right': {
			frames: [ 1, 2 ],
			fps: 4,
			loop: true
		},
		'move-left': {
			frames: [ 1, 2 ],
			fps: 4,
			loop: true,
			direction: 1
		},
		'jump-right': {
			frames: [ 3 ],
			fps: 1,
			loop: false
		},
		'jump-left': {
			frames: [ 3 ],
			fps: 1,
			loop: false,
			direction: 1
		},
		'explode': {
			frames: [ 0, 1, 2, 3 ],
			fps: 16,
			loop: false
		}
	};


	/**
	 * Draw an actor at the current cursor position.
	 *
	 * @param {number} ch The character to draw.
	 * @param {number} frame The frame to draw.
	 * @param {number} direction The direction to draw the actor in. 0 = right, 1 = left.
	 * @returns {void}
	 */
	beep8.Actors.draw = function( ch, animation ) {

		beep8.Utilities.checkInt( "ch", ch );
		beep8.Utilities.checkString( "animation", animation );

		const frame = beep8.Actors.animationFrame( animation );

		const font = beep8.Core.textRenderer.curActors_;

		const chrIndex = ( ch * font.getColCount() ) + frame;

		beep8.Core.textRenderer.put_(
			chrIndex,
			beep8.Core.drawState.cursorCol,
			beep8.Core.drawState.cursorRow,
			beep8.Core.drawState.fgColor,
			beep8.Core.drawState.bgColor,
			font,
			beep8.Actors.animations[ animation ].direction || 0
		);

	};


	/**
	 * Draw an actor at a specific position.
	 * This ignores the text grid/ cursor position and draws at specific x, y coordinates.
	 * This is useful for drawing actors in the game world and real-time apps.
	 *
	 * @param {number} ch The character to draw.
	 * @param {string} animation The animation to draw.
	 * @param {number} x The x coordinate to draw the actor at.
	 * @param {number} y The y coordinate to draw the actor at.
	 * @returns {boolean} True if the animation is still playing, false if it has finished.
	 */
	beep8.Actors.spr = function( ch, animation, x, y, startTime = null ) {

		beep8.Utilities.checkInt( "ch", ch );
		beep8.Utilities.checkString( "animation", animation );
		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		if ( startTime !== null ) beep8.Utilities.checkNumber( "startTime", startTime );

		const frame = animationFrame( animation, startTime );

		const font = beep8.Core.textRenderer.curActors_;

		const chrIndex = ( ch * font.getColCount() ) + frame;

		const anim = beep8.Actors.animations[ animation ];

		// Example usage:
		if ( !shouldLoopAnimation( anim, startTime ) ) {
			return false;
		}

		// Draw the actor.
		beep8.Core.textRenderer.spr(
			chrIndex,
			x,
			y,
			font,
			anim.direction || 0
		);

		// The animation is still playing.
		return true;

	}



	/**
	 * Get the current frame of an animation.
	 * This is used internally to automatically determine what frame to draw.
	 * This uses delta time to determine the current frame.
	 *
	 * @param {string} animation The animation to get the frame for.
	 * @returns {number} The frame to draw for the animation.
	 */
	const animationFrame = function( animation, startTime = null ) {

		// Does the animation exist.
		if ( beep8.Actors.animations[ animation ] === undefined ) {
			beep8.Utilities.fatal( "Invalid animation: " + animation );
		}

		// If the animation has a start time, use that.
		if ( startTime === null ) {
			startTime = beep8.Core.startTime;
		}

		// Get the current animation properties.
		const anim = beep8.Actors.animations[ animation ];
		let frame = 0;

		// If there's only one frame, return it.
		if ( anim.frames.length === 1 ) {
			frame = anim.frames[ 0 ];
		}

		// If there's more than one frame, calculate the frame to display.
		if ( anim.frames.length > 1 ) {

			const totalTime = beep8.Core.getNow() - startTime;
			const frameCount = anim.frames.length;
			const frameDuration = 1 / anim.fps;

			// Dividing totalTime by 1000 to convert ms to seconds.
			// Dividing by frameDuration to get the current frame.
			// Modulo frameCount to loop the animation.
			const frameIndex = Math.floor( ( totalTime / 1000 ) / frameDuration % frameCount );

			frame = anim.frames[ frameIndex ];

		}

		return frame;

	}


	/**
	 * Checks if the animation has finished looping.
	 *
	 * @param {Object} anim - The animation object.
	 * @param {number} startTime - The start time of the animation.
	 * @returns {boolean} - Returns true if the animation should continue, false if it has finished looping.
	 */
	const shouldLoopAnimation = function( anim, startTime ) {

		// If the animation has not started or is set to loop, continue the animation.
		if ( startTime === null || anim.loop === true ) {
			return true;
		}

		// Calculate the total length of the animation in milliseconds.
		const animationLength = anim.frames.length * ( 1000 / anim.fps );

		// Check if the current time exceeds the animation length.
		if ( beep8.Core.getNow() - startTime >= animationLength ) {
			return false;
		}

		return true;

	}

} )( beep8 || ( beep8 = {} ) );
