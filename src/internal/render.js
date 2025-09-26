( function( beep8 ) {

	// Define the Renderer object inside beep8.
	beep8.Renderer = {};

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

		if ( !beep8.Core.realCtx ) {
			setTimeout( initCrt, 10 );
			return;
		}

		// A gradient for the vignette effect.
		vignetteGradient = beep8.Core.realCtx.createRadialGradient(
			beep8.Core.realCanvas.width / 2,
			beep8.Core.realCanvas.height / 2,
			Math.max( beep8.Core.realCanvas.width, beep8.Core.realCanvas.height ) * 0.4,

			beep8.Core.realCanvas.width / 2,
			beep8.Core.realCanvas.height / 2,
			Math.max( beep8.Core.realCanvas.width, beep8.Core.realCanvas.height ) * 0.9
		);
		vignetteGradient.addColorStop( 0, 'rgba(255,255,255,0)' );
		vignetteGradient.addColorStop( 0.7, 'rgba(0,0,0,0.5)' );
		vignetteGradient.addColorStop( 1, 'rgba(0,0,0,1)' );

		// tiny 2px device-pixel scanline pattern
		const pat = new OffscreenCanvas( 1, 2 );
		const patCtx = pat.getContext( '2d' );
		patCtx.fillStyle = 'rgba(0,0,0,0.15)';
		patCtx.fillRect( 0, 1, 1, 1 );
		patCtx.fillStyle = 'rgba(255,255,255,0.0)';
		patCtx.fillRect( 0, 0, 1, 1 );
		scanPattern = beep8.Core.realCtx.createPattern( pat, 'repeat' );

	}

	document.addEventListener( 'beep8.initComplete', initCrt );


	/**
	 * Renders the screen.
	 *
	 * @returns {void}
	 */
	beep8.Renderer.render = function() {

		if ( beep8.Core.crashed ) return;

		beep8.Core.realCtx.imageSmoothingEnabled = false;

		// Canvas Drawing location.
		let x = 0;
		let y = 0;

		// Do screenshake.
		if ( screenshakeDuration > 0 ) {

			let amount = screenshakeDuration * beep8.CONFIG.CHR_WIDTH;

			x = Math.round( ( Math.random() * amount ) - ( amount / 2 ) );
			y = Math.round( ( Math.random() * amount ) - ( amount / 2 ) );

			x = beep8.Utilities.clamp( x, -6, 6 );
			y = beep8.Utilities.clamp( y, -6, 6 );

			screenshakeDuration -= beep8.Core.deltaTime;

		}

		// Reset real ctx composite mode.
		beep8.Core.realCtx.globalCompositeOperation = 'source-over';

		// Clear the real canvas.
		beep8.Core.realCtx.clearRect(
			0, 0,
			beep8.Core.realCanvas.width,
			beep8.Core.realCanvas.height
		);

		// Draw the offscreen canvas to the real canvas, scaling it up.
		beep8.Core.realCtx.drawImage(
			beep8.Core.offCanvas,
			x, y,
			beep8.Core.realCanvas.width,
			beep8.Core.realCanvas.height
		);

		dirty = false;

		beep8.CursorRenderer.draw( beep8.Core.realCtx );

		applyScanlines();
		applyVignette();

	}


	/**
	 * Applies a vignette effect to the screen.
	 *
	 * @returns {void}
	 */
	const applyVignette = () => {

		if ( !vignetteGradient ) return;

		if ( !beep8.CONFIG.CRT_ENABLE ) return;

		beep8.Core.realCtx.save();
		beep8.Core.realCtx.globalCompositeOperation = 'multiply';
		beep8.Core.realCtx.fillStyle = vignetteGradient;
		beep8.Core.realCtx.fillRect( 0, 0, beep8.Core.realCanvas.width, beep8.Core.realCanvas.height );
		beep8.Core.realCtx.restore();

	};


	/**
	 * Applies a scanline effect to the screen.
	 *
	 * @returns {void}
	 */
	const applyScanlines = () => {

		if ( !scanPattern ) return;

		if ( !beep8.CONFIG.CRT_ENABLE ) return;

		beep8.Core.realCtx.save();
		beep8.Core.realCtx.globalCompositeOperation = 'soft-light';
		beep8.Core.realCtx.fillStyle = scanPattern;
		beep8.Core.realCtx.fillRect( 0, 0, beep8.Core.realCanvas.width, beep8.Core.realCanvas.height );
		beep8.Core.realCtx.restore();

	};


	/**
	 * Triggers the screenshake effect.
	 *
	 * @param {number} durationSeconds - The duration of the screenshake effect in seconds.
	 * @returns {boolean} Returns true if the screenshake effect was successfully triggered.
	 */
	beep8.Renderer.shakeScreen = function( durationSeconds = 0.25 ) {

		beep8.Utilities.checkNumber( "duration", durationSeconds );

		if ( durationSeconds <= 0 ) {
			beep8.Utilities.warn( `Screenshake duration must be positive. Currently: ${durationSeconds}` );
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
	beep8.Renderer.markDirty = function() {

		if ( dirty ) {
			return;
		}

		dirty = true;
		setTimeout( beep8.Renderer.render, 1 );

	}


} )( beep8 );
