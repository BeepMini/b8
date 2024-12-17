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

		// Set the global seed value.
		randomSeed = seed;

		// Generate a few seeds to get past the initial values which can be
		// similar for closely related numbers.
		// The numbers diverge after a few iterations.
		for ( let i = 0; i < 10; i++ ) {
			beep8.Random.num();
		}

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

		if ( max <= min ) {
			return min;
		}

		return Math.floor( beep8.Random.range( min, max ) );

	}


	/**
	 * Returns a randomly picked element of the given array.
	 *
	 * @param {Array} array - The array to pick from.
	 * @returns {any} A randomly picked element of the array, or null if the array is empty.
	 */
	beep8.Random.pick = function( array ) {

		beep8.Utilities.checkArray( "array", array );

		return array.length > 0 ? array[ beep8.Random.int( 0, array.length - 1 ) ] : null;

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


	beep8.Random.setSeed();

} )( beep8 || ( beep8 = {} ) );

