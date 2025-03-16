( function( beep8 ) {

	beep8.Random = {};

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
	beep8.Random.setSeed = function( seed = null ) {

		if ( seed === null ) {
			seed = Date.now();
		}

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
			beep8.Random.num();
		}

	}


	/**
	 * Returns the seed for the random number generator.
	 *
	 * @returns {number} The seed for the random number generator.
	 */
	beep8.Random.getSeed = function() {

		return randomSeed;

	}


	/**
	 * Returns a random number between 0 and 1.
	 *
	 * @returns {number} A random number between 0 and 1.
	 */
	beep8.Random.num = function() {

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
	beep8.Random.range = function( min, max ) {

		beep8.Utilities.checkNumber( "min", min );
		beep8.Utilities.checkNumber( "max", max );

		return min + beep8.Random.num() * ( max - min );

	}


	/**
	 * Returns a random integer in the given closed interval.
	 *
	 * @param {number} min - The minimum value (inclusive).
	 * @param {number} max - The maximum value (inclusive).
	 * @returns {number} A random integer between min and max.
	 */
	beep8.Random.int = function( min, max ) {

		beep8.Utilities.checkInt( "min", min );
		beep8.Utilities.checkInt( "max", max );

		// Reverse max and min.
		if ( max <= min ) {
			const tmp = max;
			max = min;
			min = tmp;
		}

		const randomValue = beep8.Random.range( min, max );
		return Math.round( randomValue );

	}


	/**
	 * Returns a randomly picked element of the given array.
	 *
	 * @param {Array} array - The array to pick from.
	 * @returns {any} A randomly picked element of the array, or null if the array is empty.
	 */
	beep8.Random.pick = function( array ) {

		beep8.Utilities.checkArray( "array", array );

		// Pick a random number from 0 to array.length.
		const index = beep8.Random.int( 0, array.length - 1 );

		return array[ index ];

	}


	/**
	 * Returns a randomly picked element of the given array, with a weighted probability.
	 *
	 * @param {Array} array - The array to pick from, with each element repeated a number of times.
	 * @param {number} decayFactor - The decay factor for the weighted array.
	 * @returns {any} A randomly picked element of the array, or null if the array is empty.
	 */
	beep8.Random.pickWeighted = function( array, decayFactor = 0.2 ) {

		beep8.Utilities.checkArray( "array", array );

		const weightedArray = beep8.Random.weightedArray( array, decayFactor );

		return beep8.Random.pick( weightedArray );

	}


	/**
	 * Shuffles an array, randomly reordering the elements.
	 * Does not modify the original array. Returns the shuffled array.
	 *
	 * @param {Array} array - The array to shuffle.
	 * @returns {Array} The shuffled array.
	 */
	beep8.Random.shuffleArray = function( array ) {

		beep8.Utilities.checkArray( "array", array );

		array = array.slice();

		for ( let i = 0; i < array.length; i++ ) {
			const j = beep8.Random.int( 0, array.length - 1 );
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
	beep8.Random.chance = function( probability ) {

		beep8.Utilities.checkNumber( "probability", probability );

		return beep8.Random.num() < ( probability / 100 );

	}


	/**
	 * Returns a weighted array of elements.
	 * The array uses a decay factor to determine the number of times each element should be repeated.
	 *
	 * @param {Array} array - The array to weight.
	 * @param {number} decayFactor - The decay factor for the weighted array.
	 * @returns {Array} The weighted array.
	 */
	beep8.Random.weightedArray = function( array, decayFactor = 0.2 ) {

		beep8.Utilities.checkArray( "array", array );

		const weightedArray = [];

		for ( let i = 0; i < array.length; i++ ) {
			const count = Math.pow( decayFactor, i ) * 10;
			for ( let j = 0; j < count; j++ ) {
				weightedArray.push( array[ i ] );
			}
		}

		return weightedArray;

	}


	beep8.Random.setSeed();

} )( beep8 || ( beep8 = {} ) );

