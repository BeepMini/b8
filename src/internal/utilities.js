( function( beep8 ) {

	/**
	 * Shows a fatal error and throws an exception.
	 *
	 * @param {string} error - The error to show.
	 */
	function fatal( error ) {

		console.error( "Fatal error: " + error );
		try {
			main.handleCrash( error );
		} catch ( e ) {
			console.error( "Error in main.handleCrash: " + e + " while handling error " + error );
		}
		throw new Error( "Error: " + error );

	}


	/**
	 * Asserts that the given condition is true, else shows a fatal error.
	 *
	 * @param {boolean} cond - The condition that you fervently hope will be true.
	 * @param {string} msg - The error message to show if the condition is false.
	 * @returns {boolean} The 'cond' parameter.
	 */
	function assert( cond, msg ) {

		if ( !cond ) {
			fatal( msg || "Assertion Failed" );
		}

		return cond;

	}


	/**
	 * Same as assert() but only asserts if CONFIG.DEBUG is true.
	 * @param {boolean} cond - The condition that you fervently hope will be true.
	 * @param {string} msg - The error message to show if the condition is false.
	 * @returns {boolean} The 'cond' parameter.
	 */
	function assertDebug( cond, msg ) {
		if ( !cond ) {
			if ( CONFIG.DEBUG ) {
				warn( "DEBUG ASSERT failed: " + msg );
			} else {
				fatal( msg );
			}
		}
		return cond;
	}

	/**
	 * Asserts that two values are equal.
	 * @param {any} expected - What you expect the value to be.
	 * @param {any} actual - What the value actually is.
	 * @param {string} what - A description of what the value is.
	 * @returns {any} The 'actual' parameter.
	 */
	function assertEquals( expected, actual, what ) {
		if ( expected !== actual ) {
			fatal( `${what}: expected ${expected} but got ${actual}` );
		}
		return actual;
	}

	/**
	 * Checks the type of a variable and throws an exception if it's incorrect.
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @param {string} varType - The expected type of the variable.
	 * @returns {any} The 'varValue' parameter.
	 */
	function checkType( varName, varValue, varType ) {
		assert( varName, "checkType: varName must be provided." );
		assert( varType, "checkType: varType must be provided." );
		assert( typeof ( varValue ) === varType,
			`${varName} should be of type ${varType} but was ${typeof ( varValue )}: ${varValue}` );
		return varValue;
	}

	/**
	 * Checks that a variable is a number.
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @param {number} [optMin] - The minimum acceptable value for the variable.
	 * @param {number} [optMax] - The maximum acceptable value for the variable.
	 * @returns {number} The 'varValue' parameter.
	 */
	function checkNumber( varName, varValue, optMin, optMax ) {
		checkType( varName, varValue, "number" );
		if ( isNaN( varValue ) ) {
			fatal( `${varName} should be a number but is NaN` );
		}
		if ( !isFinite( varValue ) ) {
			fatal( `${varName} should be a number but is infinite: ${varValue}` );
		}
		if ( optMin !== undefined ) {
			assert( varValue >= optMin, `${varName} should be >= ${optMin} but is ${varValue}` );
		}
		if ( optMax !== undefined ) {
			assert( varValue <= optMax, `${varName} should be <= ${optMax} but is ${varValue}` );
		}
		return varValue;
	}

	/**
	 * Checks that a variable is a string.
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @returns {string} The 'varValue' parameter.
	 */
	function checkString( varName, varValue ) {
		return checkType( varName, varValue, "string" );
	}

	/**
	 * Checks that a variable is a boolean.
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @returns {boolean} The 'varValue' parameter.
	 */
	function checkBoolean( varName, varValue ) {
		return checkType( varName, varValue, "boolean" );
	}

	/**
	 * Checks that a variable is a function.
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @returns {Function} The 'varValue' parameter.
	 */
	function checkFunction( varName, varValue ) {
		return checkType( varName, varValue, "function" );
	}

	/**
	 * Checks that a variable is an object.
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @returns {Object} The 'varValue' parameter.
	 */
	function checkObject( varName, varValue ) {
		if ( varValue === null ) {
			fatal( `${varName} should be an object, but was null` );
		}
		return checkType( varName, varValue, "object" );
	}

	/**
	 * Checks that a variable is an instance of a given class.
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @param {Function} expectedClass - The expected class.
	 * @returns {any} The 'varValue' parameter.
	 */
	function checkInstanceOf( varName, varValue, expectedClass ) {
		assert( varValue instanceof expectedClass,
			`${varName} should be an instance of ${expectedClass.name} but was not, it's: ${varValue}` );
		return varValue;
	}

	/**
	 * Checks that a variable is an array.
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @returns {Array} The 'varValue' parameter.
	 */
	function checkArray( varName, varValue ) {
		assert( Array.isArray( varValue ), `${varName} should be an array, but was: ${varValue}` );
		return varValue;
	}

	/**
	 * Prints a log to the console if CONFIG.DEBUG is true.
	 * @param {string} msg - The message to print.
	 */
	const log = CONFIG.DEBUG ? console.log : ( () => { } );

	/**
	 * Prints a warning to the console.
	 * @param {string} msg - The message to print.
	 */
	const warn = console.warn;

	/**
	 * Prints an error to the console.
	 * @param {string} msg - The message to print.
	 */
	const error = console.error;

	/**
	 * Loads an image asynchronously.
	 * @param {string} src - The source URL of the image.
	 * @returns {Promise<HTMLImageElement>} A promise that resolves to the loaded image.
	 */
	async function loadImageAsync( src ) {
		return new Promise( resolver => {
			const img = new Image();
			img.onload = () => resolver( img );
			img.src = src;
		} );
	}

	/**
	 * Loads a file asynchronously.
	 * @param {string} url - The URL of the file.
	 * @returns {Promise<string>} A promise that resolves to the file content.
	 */
	function loadFileAsync( url ) {
		return new Promise( ( resolve, reject ) => {
			const xhr = new XMLHttpRequest();
			xhr.addEventListener( "load", () => {
				if ( xhr.status < 200 || xhr.status > 299 ) {
					reject( "HTTP request finished with status " + xhr.status );
				} else {
					resolve( xhr.responseText );
				}
			} );
			xhr.addEventListener( "error", e => reject( e ) );
			xhr.open( "GET", url );
			xhr.send();
		} );
	}

	/**
	 * Clamps a number, ensuring it's between a minimum and a maximum.
	 * @param {number} x - The number to clamp.
	 * @param {number} lo - The minimum value.
	 * @param {number} hi - The maximum value.
	 * @returns {number} The clamped number.
	 */
	function clamp( x, lo, hi ) {
		return Math.min( Math.max( x, lo ), hi );
	}

	/**
	 * Returns a random integer in the given closed interval.
	 * @param {number} lowInclusive - The minimum value (inclusive).
	 * @param {number} highInclusive - The maximum value (inclusive).
	 * @returns {number} A random integer between lowInclusive and highInclusive.
	 */
	function randomInt( lowInclusive, highInclusive ) {
		checkNumber( "lowInclusive", lowInclusive );
		checkNumber( "highInclusive", highInclusive );
		lowInclusive = Math.round( lowInclusive );
		highInclusive = Math.round( highInclusive );
		if ( highInclusive <= lowInclusive ) return lowInclusive;
		return clamp(
			Math.floor(
				Math.random() * ( highInclusive - lowInclusive + 1 ) ) + lowInclusive,
			lowInclusive, highInclusive );
	}

	/**
	 * Returns a randomly picked element of the given array.
	 * @param {Array} array - The array to pick from.
	 * @returns {any} A randomly picked element of the array, or null if the array is empty.
	 */
	function randomPick( array ) {
		checkArray( "array", array );
		return array.length > 0 ? array[ randomInt( 0, array.length - 1 ) ] : null;
	}

	/**
	 * Shuffles an array, randomly reordering the elements.
	 * Does not modify the original array. Returns the shuffled array.
	 * @param {Array} array - The array to shuffle.
	 * @returns {Array} The shuffled array.
	 */
	function shuffleArray( array ) {
		checkArray( "array", array );
		array = array.slice();
		for ( let i = 0; i < array.length; i++ ) {
			const j = randomInt( 0, array.length - 1 );
			const tmp = array[ i ];
			array[ i ] = array[ j ];
			array[ j ] = tmp;
		}
		return array;
	}

	/**
	 * Calculates a 2D distance between points (x0, y0) and (x1, y1).
	 * @param {number} x0 - The x-coordinate of the first point.
	 * @param {number} y0 - The y-coordinate of the first point.
	 * @param {number} x1 - The x-coordinate of the second point.
	 * @param {number} y1 - The y-coordinate of the second point.
	 * @returns {number} The distance between the two points.
	 */
	function dist2d( x0, y0, x1, y1 ) {
		checkNumber( "x0", x0 );
		checkNumber( "y0", y0 );
		checkNumber( "x1", x1 );
		checkNumber( "y1", y1 );
		const dx = x0 - x1;
		const dy = y0 - y1;
		return Math.sqrt( dx * dx + dy * dy );
	}

	/**
	 * Calculates the intersection between two integer number intervals.
	 * @param {number} as - The start of the first interval.
	 * @param {number} ae - The end of the first interval.
	 * @param {number} bs - The start of the second interval.
	 * @param {number} be - The end of the second interval.
	 * @param {Object} [result=null] - If provided, used to return the intersection.
	 * @returns {boolean} True if there is an intersection, false otherwise.
	 */
	function intersectIntervals( as, ae, bs, be, result = null ) {
		checkNumber( "as", as );
		checkNumber( "ae", ae );
		checkNumber( "bs", bs );
		checkNumber( "be", be );
		if ( result ) checkObject( "result", result );
		const start = Math.max( as, bs );
		const end = Math.min( ae, be );
		if ( end >= start ) {
			if ( result ) {
				result.start = start;
				result.end = end;
			}
			return true;
		}
		return false;
	}

	/**
	 * Calculates the intersection of two rectangles.
	 * @param {Object} r1 - The first rectangle.
	 * @param {Object} r2 - The second rectangle.
	 * @param {number} [dx1=0] - The delta X to add to the first rectangle.
	 * @param {number} [dy1=0] - The delta Y to add to the first rectangle.
	 * @param {number} [dx2=0] - The delta X to add to the second rectangle.
	 * @param {number} [dy2=0] - The delta Y to add to the second rectangle.
	 * @param {Object} [result=null] - If provided, used to return the intersection.
	 * @returns {boolean} True if there is a non-empty intersection, false otherwise.
	 */
	function intersectRects( r1, r2, dx1 = 0, dy1 = 0, dx2 = 0, dy2 = 0, result = null ) {
		checkObject( "r1", r1 );
		checkObject( "r2", r2 );
		checkNumber( "r1.x", r1.x );
		checkNumber( "r1.y", r1.y );
		checkNumber( "r1.w", r1.w );
		checkNumber( "r1.h", r1.h );
		checkNumber( "r2.x", r2.x );
		checkNumber( "r2.y", r2.y );
		checkNumber( "r2.w", r2.w );
		checkNumber( "r2.h", r2.h );
		checkNumber( "dx1", dx1 );
		checkNumber( "dx2", dx2 );
		checkNumber( "dy1", dy1 );
		checkNumber( "dy2", dy2 );
		if ( result ) checkObject( "result", result );

		const xint = intersectRects_xint;
		const yint = intersectRects_yint;
		if ( !intersectIntervals(
			r1.x + dx1,
			r1.x + dx1 + r1.w - 1,
			r2.x + dx2,
			r2.x + dx2 + r2.w - 1, xint ) ) return false;
		if ( !intersectIntervals(
			r1.y + dy1,
			r1.y + dy1 + r1.h - 1,
			r2.y + dy2,
			r2.y + dy2 + r2.h - 1, yint ) ) return false;
		if ( result ) {
			result.x = xint.start;
			result.w = xint.end - xint.start + 1;
			result.y = yint.start;
			result.h = yint.end - yint.start + 1;
		}
		return true;
	}
	const intersectRects_xint = {};
	const intersectRects_yint = {};

	beep8.utilities = {
		fatal,
		assert,
		assertDebug,
		assertEquals,
		checkType,
		checkNumber,
		checkString,
		checkBoolean,
		checkFunction,
		checkObject,
		checkInstanceOf,
		checkArray,
		log,
		warn,
		error,
		loadImageAsync,
		loadFileAsync,
		clamp,
		randomInt,
		randomPick,
		shuffleArray,
		dist2d,
		intersectIntervals,
		intersectRects
	};

} )( beep8 || ( beep8 = {} ) );
