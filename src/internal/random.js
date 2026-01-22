( function( b8 ) {

	b8.Random = {};

	/**
	 * The seed for the random number generator.
	 *
	 * @type {number}
	 */
	let randomSeed = null;


	/**
	 * Sets the seed for the random number generator.
	 * If the seed is null, the random number generator will reset to use the current time.
	 *
	 * @param {number|string} seed - The seed to use for the random number generator.
	 * @returns {void}
	 */
	b8.Random.setSeed = function( seed = null ) {

		// If no seed provided, use current time.
		if ( seed === null ) seed = Date.now();

		// Convert seed string to number.
		if ( typeof seed === "string" ) {
			seed = seed.split( "" ).reduce( ( a, b ) => a + b.charCodeAt( 0 ), 0 );
		}

		// Extra mixing step using xorshift.
		seed ^= seed << 13;
		seed ^= seed >> 17;
		seed ^= seed << 5;
		seed >>>= 0; // Ensure an unsigned 32-bit integer

		// Set the global seed value.
		randomSeed = seed;

		// Burn a few random numbers to mix up initial values.
		for ( let i = 0; i < 10; i++ ) {
			b8.Random.num();
		}

	}


	/**
	 * Returns the seed for the random number generator.
	 *
	 * @returns {number} The seed for the random number generator.
	 */
	b8.Random.getSeed = function() {

		return randomSeed;

	}


	/**
	 * Returns a random number between 0 and 1.
	 *
	 * @returns {number} A random number between 0 and 1.
	 */
	b8.Random.num = function() {

		const a = 1664525;
		const c = 1013904223;
		const m = 4294967296;

		randomSeed = ( randomSeed * a + c ) % m;

		return randomSeed / m;

	}


	/**
	 * Returns a random number (float) in the given closed interval.
	 *
	 * @param {number} min - The minimum value (inclusive).
	 * @param {number} max - The maximum value (inclusive).
	 * @returns {number} A random number between min and max.
	 */
	b8.Random.range = function( min, max ) {

		b8.Utilities.checkNumber( "min", min );
		b8.Utilities.checkNumber( "max", max );

		// If max and min are the wrong way around, reverse them.
		if ( max <= min ) {
			const tmp = max;
			max = min;
			min = tmp;
		}

		return min + b8.Random.num() * ( max - min );

	}


	/**
	 * Returns a random integer in the given closed interval.
	 *
	 * @param {number} min - The minimum value (inclusive).
	 * @param {number} max - The maximum value (inclusive).
	 * @returns {number} A random integer between min and max.
	 */
	b8.Random.int = function( min, max ) {

		b8.Utilities.checkInt( "min", min );
		b8.Utilities.checkInt( "max", max );

		const randomValue = b8.Random.range( min, max );
		return Math.round( randomValue );

	}


	/**
	 * Returns a randomly picked element of the given array.
	 *
	 * @param {Array} array - The array to pick from.
	 * @returns {any} A randomly picked element of the array, or null if the array is empty.
	 */
	b8.Random.pick = function( array ) {

		b8.Utilities.checkArray( "array", array );

		// Pick a random number from 0 to array.length.
		const index = b8.Random.int( 0, array.length - 1 );

		return array[ index ];

	}


	const weightedArrayCache = new Map();


	/**
	 * Returns a randomly picked element of the given array, with a weighted probability.
	 *
	 * @param {Array} array - The array to pick from, with each element repeated a number of times.
	 * @param {number} decayFactor - The decay factor for the weighted array.
	 * @returns {any} A randomly picked element of the array, or null if the array is empty.
	 */
	b8.Random.pickWeighted = function( array, decayFactor = 0.2 ) {

		b8.Utilities.checkArray( "array", array );

		// Create a unique cache key based on the array and decayFactor
		const cacheKey = JSON.stringify( array ) + `|${decayFactor}`;

		// Check if the weighted array is already cached
		let weightedArray = weightedArrayCache.get( cacheKey );

		if ( !weightedArray ) {
			weightedArray = b8.Random.weightedArray( array, decayFactor );
			weightedArrayCache.set( cacheKey, weightedArray );
		}

		return b8.Random.pick( weightedArray );

	};


	/**
	 * Shuffles an array, randomly reordering the elements.
	 * Does not modify the original array. Returns the shuffled array.
	 *
	 * @param {Array} array - The array to shuffle.
	 * @returns {Array} The shuffled array.
	 */
	b8.Random.shuffleArray = function( array ) {

		b8.Utilities.checkArray( "array", array );

		array = array.slice();

		for ( let i = 0; i < array.length; i++ ) {
			const j = b8.Random.int( 0, array.length - 1 );
			const tmp = array[ i ];
			array[ i ] = array[ j ];
			array[ j ] = tmp;
		}

		return array;

	}


	/**
	 * Returns a random boolean value based upon the probability percentage provided.
	 *
	 * @param {number} probability - A percentage value between 0 and 100 representing the chance of returning true.
	 * @returns {boolean} True with the specified probability, false otherwise.
	 */
	b8.Random.chance = function( probability ) {

		b8.Utilities.checkNumber( "probability", probability );

		return b8.Random.num() <= ( probability / 100 );

	}


	/**
	 * Returns a weighted array of elements.
	 * The array uses a decay factor to determine the number of times each element should be repeated.
	 *
	 * @param {Array} array - The array to weight.
	 * @param {number} decayFactor - The decay factor for the weighted array.
	 * @returns {Array} The weighted array.
	 */
	b8.Random.weightedArray = function( array, decayFactor = 0.2 ) {

		b8.Utilities.checkArray( "array", array );

		const weightedArray = [];

		for ( let i = 0; i < array.length; i++ ) {
			const count = Math.pow( decayFactor, i ) * 10;
			for ( let j = 0; j < count; j++ ) {
				weightedArray.push( array[ i ] );
			}
		}

		return weightedArray;

	}


	/**
	 * Returns a consistent pseudo-random number between 0 and 1 for the given 2D coordinates and seed.
	 * Uses a simple hash function to generate the number.
	 *
	 * @param {number} x - The x coordinate.
	 * @param {number} y - The y coordinate.
	 * @param {number} seed - The seed value.
	 * @returns {number} A pseudo-random number between 0 and 1.
	 */
	b8.Random.coord2D = function( x, y, seed ) {

		let h = 2166136261 ^ seed;
		h = Math.imul( h ^ x, 16777619 );
		h = Math.imul( h ^ y, 16777619 );
		h ^= h >>> 13; h = Math.imul( h, 0x85ebca6b );
		h ^= h >>> 16;
		return ( h >>> 0 ) / 4294967296;

	}


	/**
	 * Returns a smooth noise value between 0 and 1 for the given 2D coordinates and seed.
	 * Uses bilinear interpolation between the corner values.
	 *
	 * @param {number} x - The x coordinate.
	 * @param {number} y - The y coordinate.
	 * @param {number} seed - The seed value.
	 * @param {number} freq - The frequency of the noise.
	 * @returns {number} A smooth noise value between 0 and 1.
	 */
	b8.Random.smooth2D = function( x, y, seed = 0, freq = 1 ) {

		// scale space to control feature size
		x *= freq;
		y *= freq;

		const ix = Math.floor( x );
		const iy = Math.floor( y );
		const fx = x - ix;
		const fy = y - iy;

		// corner values from your coord-based RNG
		const v00 = b8.Random.coord2D( ix, iy, seed );
		const v10 = b8.Random.coord2D( ix + 1, iy, seed );
		const v01 = b8.Random.coord2D( ix, iy + 1, seed );
		const v11 = b8.Random.coord2D( ix + 1, iy + 1, seed );

		// fade curves for smooth interpolation
		const u = b8.Math.fade( fx );
		const v = b8.Math.fade( fy );

		// bilinear interpolation
		const i1 = b8.Math.lerp( v00, v10, u );
		const i2 = b8.Math.lerp( v01, v11, u );
		return b8.Math.lerp( i1, i2, v );

	}


	/**
	 * Resets the random number generator to its initial state.
	 * This clears the seed and any cached weighted arrays.
	 *
	 * @returns {void}
	 */
	b8.Random.reset = function() {

		randomSeed = null;
		weightedArrayCache.clear();

		b8.Random.setSeed();

	}



} )( b8 );

