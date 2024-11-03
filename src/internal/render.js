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
		if ( beep8.CONFIG.CRT_ENABLE <= 0 ) {
			console.log( 'CRT effect is disabled.', beep8.CONFIG.CRT_ENABLE );
			return;
		}

		// Get the pixel data from the canvas.
		canvasImageData = beep8.Core.realCtx.getImageData(
			0, 0,
			beep8.CONFIG.SCREEN_WIDTH, beep8.CONFIG.SCREEN_HEIGHT
		);

		// Cache the data array for faster access.
		const imageData = canvasImageData.data;

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

				// let red, green, blue;

				// // Apply blending for the red, green, and blue channels.
				// red = blendPixel( current_pixel_data[ 0 ], previous_pixel_data[ 0 ], next_pixel_data[ 0 ] );
				// green = blendPixel( current_pixel_data[ 1 ], current_pixel_data[ 1 ] );
				// blue = blendPixel( current_pixel_data[ 2 ], previous_pixel_data[ 2 ] );

				// Set the new pixel values back into the image data array.
				setPixel(
					imageData,
					currentPixelPos,
					blendPixels( current_pixel_data, previous_pixel_data, next_pixel_data )
				);

			}
		}

		// Write the modified image data back to the canvas.
		beep8.Core.realCtx.putImageData( canvasImageData, 0, 0 );

	};


	/**
	 * Helper function to blend a pixel's current value with the previous pixel's value.
	 * This function implements the phosphor effect.
	 *
	 * @param {number} currentValue - The current pixel value.
	 * @param {number} previousValue - The previous pixel value.
	 * @returns {number} The blended pixel value.
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
