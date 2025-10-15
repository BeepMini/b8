( function( b8 ) {

	// Define the Renderer object inside b8.
	b8.Renderer = {};

	// Has the screen updated.
	let dirty = false;

	// Effects.
	let screenshakeDuration = 0;

	// Variables for screen effects.
	let vignetteGradient = null;
	let scanPattern = null;


	/**
	 * Initialization function that precomputes bloom and scanline ranges.
	 *
	 * @returns {void}
	 */
	const initCrt = () => {

		if ( !b8.Core.realCtx ) {

			setTimeout( initCrt, 10 );
			return;

		}

		if ( !vignetteGradient ) {

			// A gradient for the vignette effect.
			vignetteGradient = b8.Core.realCtx.createRadialGradient(
				b8.Core.realCanvas.width / 2,
				b8.Core.realCanvas.height / 2,
				Math.max( b8.Core.realCanvas.width, b8.Core.realCanvas.height ) * 0.4,

				b8.Core.realCanvas.width / 2,
				b8.Core.realCanvas.height / 2,
				Math.max( b8.Core.realCanvas.width, b8.Core.realCanvas.height ) * 0.9
			);
			vignetteGradient.addColorStop( 0, 'rgba(255,255,255,0)' );
			vignetteGradient.addColorStop( 0.7, 'rgba(0,0,0,0.5)' );
			vignetteGradient.addColorStop( 1, 'rgba(0,0,0,1)' );

		}

		if ( !scanPattern ) {

			// tiny 2px device-pixel scanline pattern
			const pat = new OffscreenCanvas( 1, 2 );
			const patCtx = pat.getContext( '2d' );
			patCtx.fillStyle = 'rgba(0,0,0,0.15)';
			patCtx.fillRect( 0, 1, 1, 1 );
			patCtx.fillStyle = 'rgba(255,255,255,0.0)';
			patCtx.fillRect( 0, 0, 1, 1 );
			scanPattern = b8.Core.realCtx.createPattern( pat, 'repeat' );

		}

	}

	document.addEventListener( 'b8.initComplete', initCrt );


	/**
	 * Renders the screen.
	 *
	 * @returns {void}
	 */
	b8.Renderer.render = function() {

		if ( b8.Core.crashed ) return;

		b8.Core.realCtx.imageSmoothingEnabled = false;

		// Canvas Drawing location.
		let x = 0;
		let y = 0;

		// Do screenshake.
		if ( screenshakeDuration > 0 ) {

			let amount = screenshakeDuration * b8.CONFIG.CHR_WIDTH;

			x = Math.round( ( Math.random() * amount ) - ( amount / 2 ) );
			y = Math.round( ( Math.random() * amount ) - ( amount / 2 ) );

			x = b8.Utilities.clamp( x, -6, 6 );
			y = b8.Utilities.clamp( y, -6, 6 );

			screenshakeDuration -= b8.Core.deltaTime;

		}

		// Reset real ctx composite mode.
		b8.Core.realCtx.globalCompositeOperation = 'source-over';

		// Clear the real canvas.
		b8.Core.realCtx.clearRect(
			0, 0,
			b8.Core.realCanvas.width,
			b8.Core.realCanvas.height
		);

		// Draw the offscreen canvas to the real canvas, scaling it up.
		b8.Core.realCtx.drawImage(
			b8.Core.offCanvas,
			x, y,
			b8.Core.realCanvas.width,
			b8.Core.realCanvas.height
		);

		dirty = false;

		b8.CursorRenderer.draw( b8.Core.realCtx );

		applyScanlines();
		applyVignette();

	}


	/**
	 * Resets the renderer state, stopping any ongoing effects.
	 *
	 * @returns {void}
	 */
	b8.Renderer.reset = function() {

		dirty = false;
		screenshakeDuration = 0;

	}


	/**
	 * Applies a vignette effect to the screen.
	 *
	 * @returns {void}
	 */
	const applyVignette = () => {

		if ( !vignetteGradient ) return;

		if ( !b8.CONFIG.CRT_ENABLE ) return;

		b8.Core.realCtx.save();
		b8.Core.realCtx.globalCompositeOperation = 'multiply';
		b8.Core.realCtx.fillStyle = vignetteGradient;
		b8.Core.realCtx.fillRect( 0, 0, b8.Core.realCanvas.width, b8.Core.realCanvas.height );
		b8.Core.realCtx.restore();

	};


	/**
	 * Applies a scanline effect to the screen.
	 *
	 * @returns {void}
	 */
	const applyScanlines = () => {

		if ( !scanPattern ) return;

		if ( !b8.CONFIG.CRT_ENABLE ) return;

		b8.Core.realCtx.save();
		b8.Core.realCtx.globalCompositeOperation = 'soft-light';
		b8.Core.realCtx.fillStyle = scanPattern;
		b8.Core.realCtx.fillRect( 0, 0, b8.Core.realCanvas.width, b8.Core.realCanvas.height );
		b8.Core.realCtx.restore();

	};


	/**
	 * Triggers the screenshake effect.
	 *
	 * @param {number} durationSeconds - The duration of the screenshake effect in seconds.
	 * @returns {boolean} Returns true if the screenshake effect was successfully triggered.
	 */
	b8.Renderer.shakeScreen = function( durationSeconds = 0.25 ) {

		b8.Utilities.checkNumber( "duration", durationSeconds );

		if ( durationSeconds <= 0 ) {
			b8.Utilities.warn( `Screenshake duration must be positive. Currently: ${durationSeconds}` );
			return false;
		}

		screenshakeDuration = durationSeconds;

		return true;

	}


	/**
	 * Marks the screen as dirty, so it will be re-rendered on the next frame.
	 *
	 * @returns {void}
	 */
	b8.Renderer.markDirty = function() {

		if ( dirty ) {
			return;
		}

		dirty = true;
		setTimeout( b8.Renderer.render, 1 );

	}


} )( b8 );
