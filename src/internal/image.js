( function( b8 ) {


	b8.Image = b8.Image || {};


	/**
	 * Quantise an ImageData in-place to a palette (no dithering).
	 * Returns the same ImageData for chaining.
	 *
	 * @param {ImageData} imageData - The ImageData to quantise.
	 * @param {object} lookupTable - The color lookup table.
	 * @returns {ImageData} The quantised ImageData.
	 */
	b8.Image.quantiseImageData = function( imageData, lookupTable ) {

		const data = imageData.data;

		for ( let i = 0; i < data.length; i += 4 ) {
			const r = data[ i ];
			const g = data[ i + 1 ];
			const b = data[ i + 2 ];
			const { r: pr, g: pg, b: pb } = b8.Image.findClosestColorUsingLookup( r, g, b, lookupTable );
			data[ i ] = pr;
			data[ i + 1 ] = pg;
			data[ i + 2 ] = pb;
			// alpha unchanged
		}

		return imageData;

	}


	/**
	 * Loads an image asynchronously.
	 *
	 * @param {string} src - The source URL of the image.
	 * @returns {Promise<HTMLImageElement>} A promise that resolves to the loaded image.
	 */
	b8.Image.loadImageAsync = async function( src ) {

		return new Promise(
			( resolver ) => {
				const img = new Image();
				img.crossOrigin = "anonymous";
				img.src = src;
				img.onload = () => resolver( img );
			}
		);

	}



	/**
	 * Finds the closest color in the palette to the given RGB values.
	 *
	 * @param {number} r - The red component (0-255).
	 * @param {number} g - The green component (0-255).
	 * @param {number} b - The blue component (0-255).
	 * @param {string[]} palette - The color palette (array of hex strings).
	 * @returns {string} The closest color in hex format.
	 */
	b8.Image.findClosestColorUsingLookup = function( r, g, b, lookupTable, bucketSize = 4 ) {

		// Round RGB values to the nearest bucket
		const roundedR = Math.floor( r / bucketSize ) * bucketSize;
		const roundedG = Math.floor( g / bucketSize ) * bucketSize;
		const roundedB = Math.floor( b / bucketSize ) * bucketSize;

		const key = `${roundedR},${roundedG},${roundedB}`;
		return lookupTable[ key ];

	}


	// Cache the color lookup table to avoid recomputing it.
	// Only generated when an image is loaded externally.
	// Font images are not loaded this way.
	const colorLookupTable = {};


	/**
	 * Generates a color lookup table for the given palette.
	 *
	 * @param {string[]} palette - The color palette (array of hex strings).
	 * @param {number} [bucketSize=4] - The size of the color buckets.
	 * @returns {object} The color lookup table.
	 */
	b8.Image.generateColorLookupTable = function( palette, bucketSize = 4 ) {

		if ( Object.keys( colorLookupTable ).length !== 0 ) {
			return colorLookupTable;
		}

		// Convert hex palette to rgb palette.
		const rgbPalette = palette.map( color => b8.Utilities.hexToRgb( color ) );

		for ( let r = 0; r < 256; r += bucketSize ) {
			for ( let g = 0; g < 256; g += bucketSize ) {
				for ( let b = 0; b < 256; b += bucketSize ) {
					const key = `${r},${g},${b}`;
					colorLookupTable[ key ] = findClosestColor( r, g, b, rgbPalette );
				}
			}
		}

		return colorLookupTable;

	}


	/**
	 * Finds the closest color in the palette to the given RGB values.
	 *
	 * This function calculates the Euclidean distance between the given RGB color
	 * and each color in the palette. The color with the smallest distance is
	 * considered the closest match.
	 *
	 * @param {number} r - The red component of the input color (0-255).
	 * @param {number} g - The green component of the input color (0-255).
	 * @param {number} b - The blue component of the input color (0-255).
	 * @param {object[]} palette - The color palette, an array of objects with {r, g, b} properties.
	 * @returns {object} The closest color in the palette, as an object {r, g, b}.
	 */
	function findClosestColor( r, g, b, palette ) {

		// Initialize variables to track the closest color and its distance
		let closestColor = null; // Will hold the closest color found
		let closestDistance = Infinity; // Start with the largest possible distance

		// Iterate over each color in the palette
		for ( const color of palette ) {

			// Calculate the squared Euclidean distance between the input color and the current palette color
			const distance = (
				Math.pow( color.r - r, 2 ) + // Difference in red channel, squared
				Math.pow( color.g - g, 2 ) + // Difference in green channel, squared
				Math.pow( color.b - b, 2 )   // Difference in blue channel, squared
			);

			// If this distance is smaller than the closest distance found so far, update the closest color
			if ( distance < closestDistance ) {
				closestDistance = distance; // Update the closest distance
				closestColor = color;       // Update the closest color
			}

		}

		// Return the closest color found in the palette
		return closestColor;

	}


	/**
	 * Bayer matrices (normalised to [-0.5, +0.5])
	 *
	 * @private
	 */
	const _bayer = {

		2: [
			-0.375, 0.125,
			0.375, -0.125
		],
		4: [
			-0.46875, 0.03125, -0.34375, 0.15625,
			0.28125, -0.21875, 0.40625, -0.09375,
			-0.28125, 0.21875, -0.40625, 0.09375,
			0.46875, -0.03125, 0.34375, -0.15625
		],
		8: ( () => {
			// Build 8x8 from 4x4 recursively to keep it compact
			const base = [
				[ 0, 48, 12, 60, 3, 51, 15, 63 ],
				[ 32, 16, 44, 28, 35, 19, 47, 31 ],
				[ 8, 56, 4, 52, 11, 59, 7, 55 ],
				[ 40, 24, 36, 20, 43, 27, 39, 23 ],
				[ 2, 50, 14, 62, 1, 49, 13, 61 ],
				[ 34, 18, 46, 30, 33, 17, 45, 29 ],
				[ 10, 58, 6, 54, 9, 57, 5, 53 ],
				[ 42, 26, 38, 22, 41, 25, 37, 21 ]
			];
			// Normalise to [-0.5, +0.5]
			const nrm = [];
			for ( let y = 0; y < 8; y++ ) {
				for ( let x = 0; x < 8; x++ ) {
					const v = base[ y ][ x ] / 64; // [0,1)
					nrm.push( v - 0.5 );
				}
			}
			return nrm;
		} )()

	};


	/**
	 * Ordered dithering (Bayer). Biases colour before quantising.
	 * - imageData: ImageData (modified in-place)
	 * - mapFn: (r,g,b) -> {r,g,b}
	 * - opts:
	 *   - size: 2 | 4 | 8  (matrix size)
	 *   - strength: 0..1   (scales the bias)
	 *   - amplitude: number (max per-channel bias in 0..255)
	 *
	 * @param {ImageData} imageData - The ImageData to dither.
	 * @param {function} mapFn - The function to map RGB values to the nearest palette color.
	 * @param {object} [opts={}] - The options for dithering.
	 * @param {number} [opts.size=4] - The size of the Bayer matrix (2, 4, or 8).
	 * @param {number} [opts.strength=0.5] - The strength of the dithering effect (0 to 1).
	 * @param {number} [opts.amplitude=24] - The maximum bias in RGB units (0 to 255).
	 * @returns {ImageData} The dithered ImageData.
	 */
	b8.Image.ditherOrdered = function( imageData, mapFn, opts = {} ) {

		const size = opts.size || 4; // 2, 4, or 8
		const strength = opts.strength ?? 0.5; // calmer by default
		const amplitude = opts.amplitude ?? 24; // max bias in RGB units

		const mat = _bayer[ size ];
		if ( !mat ) throw new Error( 'Unsupported Bayer size. Use 2, 4, or 8.' );

		const data = imageData.data;
		const w = imageData.width;
		const h = imageData.height;

		const clamp = ( v ) => v < 0 ? 0 : v > 255 ? 255 : v;
		const idx = ( x, y ) => 4 * ( y * w + x );
		const scale = amplitude * strength; // final scale in RGB units

		for ( let y = 0; y < h; y++ ) {
			for ( let x = 0; x < w; x++ ) {

				const i = idx( x, y );
				const t = mat[ ( y % size ) * size + ( x % size ) ]; // [-0.5..0.5]

				// Bias RGB before quantising
				const r = clamp( data[ i ] + t * scale );
				const g = clamp( data[ i + 1 ] + t * scale );
				const b = clamp( data[ i + 2 ] + t * scale );

				const q = mapFn( r, g, b ); // nearest palette (or your custom)

				data[ i ] = q.r;
				data[ i + 1 ] = q.g;
				data[ i + 2 ] = q.b;

			}
		}

		return imageData;

	}


}( b8 ) );