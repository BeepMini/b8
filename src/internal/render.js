( function( beep8 ) {

	// Define the Renderer object inside beep8.
	beep8.Renderer = {};

	// Has the screen updated.
	let dirty = false;

	// Constants and variables used for phosphor and scanline effects.
	const phosphor_bloom = []; // Array to store bloom effect values.
	const scale_add = 1; // Additive scaling for bloom.
	const scale_times = 0.4; // Multiplicative scaling for bloom.
	let canvasImageData = null; // Stores image data for the canvas.

	/**
	 * Initialization function that precomputes bloom and scanline ranges.
	 *
	 * @returns {void}
	 */
	const initCrt = () => {

		/**
		 * Precompute phosphor bloom values to simulate the effect of phosphor
		 * persistence on older CRT screens.
		 * CRT displays have a characteristic glow, often caused by the
		 * persistence of phosphor pixels.
		 * Here, we calculate bloom values for each possible brightness level
		 * (0-255) to simulate this effect:
		 *  - The formula applies gamma correction with a value of 2.2 to mimic
		 * non-linear brightness response.
		 *  - A scaling factor of 0.5 reduces the brightness, and adding 1
		 * ensures a minimum glow intensity.
		 * These precomputed values are used later when blending pixels,
		 * creating a glow effect similar to retro CRT displays.
		 */
		for ( let i = 0; i < 256; i++ ) {
			phosphor_bloom[ i ] = ( scale_times * ( i / 255 ) ** ( 1 / 2.2 ) ) + scale_add;
		}

	};


	/**
	 * Renders the screen.
	 *
	 * @returns {void}
	 */
	beep8.Renderer.render = function() {

		if ( beep8.Core.crashed ) {
			return;
		}

		beep8.Core.realCtx.imageSmoothingEnabled = false;

		beep8.Core.realCtx.clearRect(
			0, 0,
			beep8.Core.realCanvas.width, beep8.Core.realCanvas.height
		);

		beep8.Core.realCtx.drawImage(
			beep8.Core.canvas,
			0, 0,
			beep8.Core.realCanvas.width, beep8.Core.realCanvas.height
		);

		dirty = false;

		beep8.CursorRenderer.draw(
			beep8.Core.realCtx,
			beep8.Core.realCanvas.width,
			beep8.Core.realCanvas.height
		);

		beep8.Renderer.applyCrtFilter();

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
		setTimeout( beep8.Core.render, 1 );

	}


	/**
	 * Main function to apply CRT filter to the screen.
	 *
	 * @returns {void}
	 */
	beep8.Renderer.applyCrtFilter = function() {

		// If the CRT effect is disabled, return.
		if (
			beep8.CONFIG.CRT_ENABLE <= 0
			|| !beep8.CONFIG.CRT_VIGNETTE
		) {
			return;
		}

		// Get the pixel data from the canvas.
		canvasImageData = beep8.Core.realCtx.getImageData(
			0, 0,
			beep8.CONFIG.SCREEN_WIDTH, beep8.CONFIG.SCREEN_HEIGHT
		);

		// Cache the data array for faster access.
		const imageData = canvasImageData.data;

		drawVignette( imageData );
		drawScanlines( imageData );

		// Write the modified image data back to the canvas.
		beep8.Core.realCtx.putImageData( canvasImageData, 0, 0 );

	};


	/**
	 * Function to draw a vignette effect on the screen.
	 *
	 * @param {Uint8ClampedArray} imageData - The image data array.
	 * @returns {void}
	 */
	const drawVignette = ( imageData ) => {

		// Vignette constants.
		// ---
		if ( !beep8.CONFIG.CRT_VIGNETTE ) {
			return imageData;
		}

		// Get the screen width and height.
		const width = beep8.CONFIG.SCREEN_WIDTH;
		const height = beep8.CONFIG.SCREEN_HEIGHT;

		// The center of the vignette effect is a circle with a radius of 0.5 of the screen.
		const centerRadius = 0.8;
		// The maximum darkness of the vignette effect.
		const maxDarkness = 0.25;
		// Calculate the center of the screen and the maximum distance from the center.
		const centerX = width / 2, centerY = height / 2;
		// Calculate the inner radius of the vignette effect and the scaling factor.
		const maxDistance = Math.sqrt( centerX ** 2 + centerY ** 2 );
		// The inner radius is a fraction of the center radius.
		const innerRadius = centerRadius * maxDistance;
		// Calculate the scaling factor based on the maximum darkness and distance.
		const scaleFactor = maxDarkness / ( maxDistance * ( 1 - centerRadius ) );

		// Apply vignette effect pixel by pixel
		for ( let i = 0; i < imageData.length; i += 4 ) {
			const x = ( i / 4 ) % width;
			const y = Math.floor( ( i / 4 ) / width );
			const distance = Math.sqrt( ( x - centerX ) ** 2 + ( y - centerY ) ** 2 );

			// Calculate the vignette factor based on the distance from the center.
			const vignetteFactor = distance < innerRadius
				? 1
				: Math.max( 0, 1 - ( distance - innerRadius ) * scaleFactor );

			// Apply the vignette factor to the RGB channels
			imageData[ i ] *= vignetteFactor;     // Red
			imageData[ i + 1 ] *= vignetteFactor; // Green
			imageData[ i + 2 ] *= vignetteFactor; // Blue
		}

	};


	/**
	 * Function to draw scanlines and color distortion on the screen.
	 *
	 * @param {Uint8ClampedArray} imageData - The image data array.
	 * @returns {void}
	 */
	const drawScanlines = ( imageData ) => {

		// Get the screen width and height.
		const width = beep8.CONFIG.SCREEN_WIDTH;
		const height = beep8.CONFIG.SCREEN_HEIGHT;

		// Loop through every other line.
		for ( let y = 0; y < height; y += 2 ) {

			// Loop through each pixel on the current row.
			for ( let x = 0; x < width; x++ ) {

				// Get the position of the current pixel in the image data array.
				const currentPixelPos = getPixelPosition( x, y );
				// Get the current pixel's RGB data.
				const current_pixel_data = getPixelData( imageData, currentPixelPos );
				// Get the previous pixel data to the left (or use the current pixel if on the first column).
				const previous_pixel_data = ( x > 0 ) ? getPixelData( imageData, getPixelPosition( x - 1, y ) ) : current_pixel_data;
				const next_pixel_data = x < width - 1 ? getPixelData( imageData, getPixelPosition( x + 1, y ) ) : current_pixel_data;

				// Set the new pixel values back into the image data array.
				setPixel(
					imageData,
					currentPixelPos,
					blendPixels( current_pixel_data, previous_pixel_data, next_pixel_data )
				);

			}
		}

	};



	/**
	 * Helper function to blend a pixel's current value with the previous pixel's value.
	 * This function implements the phosphor effect.
	 *
	 * @param {number} currentValue - The current pixel value.
	 * @param {number} previousValue - The previous pixel value.
	 * @returns {object} The blended pixel value as an rgb object.
	 */
	const blendPixels = ( currentPixel, previousPixel, nextPixel ) => {

		// Bleed factor for neighboring pixel blending.
		const phosphor_bleed = beep8.CONFIG.CRT_ENABLE;
		// Remaining factor for current pixel blending.
		const phosphor_blend = ( 1 - phosphor_bleed );

		return {
			r: ( currentPixel[ 0 ] * phosphor_blend ) + ( ( previousPixel[ 0 ] + nextPixel[ 0 ] ) / 2 * phosphor_bleed * phosphor_bloom[ previousPixel[ 0 ] ] ),
			g: ( currentPixel[ 1 ] * phosphor_blend ) + ( ( previousPixel[ 1 ] + nextPixel[ 1 ] ) / 2 * phosphor_bleed * phosphor_bloom[ previousPixel[ 1 ] ] ),
			b: ( currentPixel[ 2 ] * phosphor_blend ) + ( ( previousPixel[ 2 ] + nextPixel[ 2 ] ) / 2 * phosphor_bleed * phosphor_bloom[ previousPixel[ 2 ] ] ),
		}

	};


	/**
	 * Helper function to get RGB data for a pixel at position (x, y) in the image data array.
	 *
	 * @param {Uint8ClampedArray} imageData - The image data array.
	 * @param {number} pixelPos - The position of the pixel in the image data array.
	 * @returns {number[]} An array of red, green, and blue values for the pixel.
	 */
	const getPixelData = ( imageData, pixelPos ) => {

		return [
			imageData[ pixelPos + 1 ], // Red
			imageData[ pixelPos + 2 ], // Green
			imageData[ pixelPos + 3 ]  // Blue
		];

	};


	/**
	 * Helper function to set RGB data for a pixel at position (x, y) in the image data array.
	 * This function modifies the image data array in place.
	 *
	 * @param {Uint8ClampedArray} imageData - The image data array.
	 * @param {number} pixelPos - The position of the pixel in the image data array.
	 * @param {object} color - An object containing red, green, and blue values for the pixel
	 * @returns {void}
	 */
	const setPixel = ( imageData, pixelPos, color ) => {

		imageData[ pixelPos + 1 ] = color.r;
		imageData[ pixelPos + 2 ] = color.g;
		imageData[ pixelPos + 3 ] = color.b;

	};


	/**
	 * Helper function to get the pixel position (index) in the image data array for coordinates (x, y).
	 *
	 * @param {number} x - The x-coordinate of the pixel.
	 * @param {number} y - The y-coordinate of the pixel.
	 * @returns {number} The index of the pixel in the image data array.
	 */
	const getPixelPosition = ( x, y ) => {

		// Each pixel is represented by 4 bytes (RGBA), so calculate the index for the pixel at (x, y).
		return ( y * beep8.CONFIG.SCREEN_WIDTH * 4 ) + ( x * 4 );

	};


	// Call init to precompute phosphor bloom.
	initCrt();


} )( beep8 || ( beep8 = {} ) );
