( function( b8 ) {

	b8.Animation = {};


	/**
	 * Get the current frame of an animation.
	 * This is used internally to automatically determine what frame to draw.
	 * This uses delta time to determine the current frame.
	 *
	 * @param {string} animation The animation to get the frame for.
	 * @param {number|null} startTime The start time of the animation. If null, uses the core start time.
	 * @returns {number} The frame to draw for the animation.
	 */
	b8.Animation.frame = function( anim, startTime = null ) {

		// Does the animation exist.
		if ( anim === undefined ) {
			b8.Utilities.fatal( "Animation not found" );
		}

		// If the animation has a start time, use that.
		if ( startTime === null ) {
			startTime = b8.Core.startTime;
		}

		let frame = 0;

		if ( !anim.frames || anim.frames.length === 0 ) {
			b8.Utilities.fatal( "Animation has no frames" );
		}

		// If there's only one frame, return it.
		if ( anim.frames.length === 1 ) {
			frame = anim.frames[ 0 ];
		}

		// If there's more than one frame, calculate the frame to display.
		if ( anim.frames.length > 1 ) {

			const elapsedTime = b8.Core.getNow() - startTime;
			const frameCount = anim.frames.length;
			const FPS = anim.fps || 1;
			const frameDuration = 1000 / FPS;

			// Dividing totalTime by 1000 to convert ms to seconds.
			// Dividing by frameDuration to get the current frame.
			// Modulo frameCount to loop the animation.
			const frameIndex = Math.floor( elapsedTime / frameDuration ) % frameCount;

			frame = anim.frames[ frameIndex ];

		}

		return frame;

	};


	/**
	 * Checks if the animation has finished looping.
	 *
	 * @param {Object} anim - The animation object.
	 * @param {number} startTime - The start time of the animation.
	 * @returns {boolean} - Returns true if the animation should continue, false if it has finished looping.
	 */
	b8.Animation.shouldLoop = function( anim, startTime ) {

		// If the animation has not started or is set to loop, continue the animation.
		if ( startTime === null || anim.loop === true ) {
			return true;
		}

		// Calculate the total length of the animation in milliseconds.
		const FPS = anim.fps || 1;
		const animationLength = anim.frames.length * ( 1000 / FPS );

		// Check if the current time exceeds the animation length.
		if ( b8.Core.getNow() - startTime >= animationLength ) return false;

		return true;

	};

} )( b8 );
