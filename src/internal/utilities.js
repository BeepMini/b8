( function( beep8 ) {


	beep8.Utilities = {};


	/**
	 * Shows a fatal error and throws an exception.
	 *
	 * @param {string} error - The error to show.
	 * @throws {Error} The error message.
	 * @returns {void}
	 */
	beep8.Utilities.fatal = function( error ) {

		beep8.Utilities.error( "Fatal error: " + error );

		try {
			beep8.Core.handleCrash( error );
		} catch ( e ) {
			beep8.Utilities.error( "Error in beep8.Core.handleCrash: " + e + " while handling error " + error );
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
	beep8.Utilities.assert = function( cond, msg ) {

		if ( !cond ) {
			beep8.Utilities.fatal( msg || "Assertion Failed" );
		}

		return cond;

	}


	/**
	 * Same as beep8.Utilities.assert() but only asserts if beep8.CONFIG.DEBUG is true.
	 *
	 * @param {boolean} cond - The condition that you fervently hope will be true.
	 * @param {string} msg - The error message to show if the condition is false.
	 * @returns {boolean} The 'cond' parameter.
	 */
	beep8.Utilities.assertDebug = function( cond, msg ) {

		if ( !cond ) {

			if ( beep8.CONFIG.DEBUG ) {
				warn( "DEBUG ASSERT failed: " + msg );
			} else {
				beep8.Utilities.fatal( msg );
			}

		}

		return cond;

	}


	/**
	 * Asserts that two values are equal.
	 *
	 * @param {any} expected - What you expect the value to be.
	 * @param {any} actual - What the value actually is.
	 * @param {string} what - A description of what the value is.
	 * @returns {any} The 'actual' parameter.
	 */
	beep8.Utilities.assertEquals = function( expected, actual, what ) {

		if ( expected !== actual ) {
			beep8.Utilities.fatal( `${what}: expected ${expected} but got ${actual}` );
		}

		return actual;

	}


	/**
	 * Checks the type of a variable and throws an exception if it's incorrect.
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @param {string} varType - The expected type of the variable.
	 * @returns {any} The 'varValue' parameter.
	 */
	beep8.Utilities.checkType = function( varName, varValue, varType ) {

		beep8.Utilities.assert( varName, "checkType: varName must be provided." );
		beep8.Utilities.assert( varType, "checkType: varType must be provided." );
		beep8.Utilities.assert(
			typeof ( varValue ) === varType,
			`${varName} should be of type ${varType} but was ${typeof ( varValue )}: ${varValue}`
		);

		return varValue;

	}


	/**
	 * Checks that a variable is a number.
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @param {number} [optMin=undefined] - The minimum acceptable value for the variable.
	 * @param {number} [optMax=undefined] - The maximum acceptable value for the variable.
	 * @returns {number} The 'varValue' parameter.
	 */
	beep8.Utilities.checkNumber = function( varName, varValue, optMin = undefined, optMax = undefined ) {

		beep8.Utilities.checkType( varName, varValue, "number" );

		if ( isNaN( varValue ) ) {
			beep8.Utilities.fatal( `${varName} should be a number but is NaN` );
		}

		if ( !isFinite( varValue ) ) {
			beep8.Utilities.fatal( `${varName} should be a number but is infinite: ${varValue}` );
		}

		if ( optMin !== undefined ) {
			beep8.Utilities.assert( varValue >= optMin, `${varName} should be >= ${optMin} but is ${varValue}` );
		}

		if ( optMax !== undefined ) {
			beep8.Utilities.assert( varValue <= optMax, `${varName} should be <= ${optMax} but is ${varValue}` );
		}

		return varValue;

	}


	/**
	 * Checks that a variable is an integer.
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @returns {number} The 'varValue' parameter.
	 */
	beep8.Utilities.checkInt = function( varName, varValue, optMin, optMax ) {

		beep8.Utilities.checkNumber( varName, varValue, optMin, optMax );

		if ( varValue !== Math.round( varValue ) ) {
			beep8.Utilities.fatal( `${varName} should be an integer but is ${varValue}` );
		}

		return varValue;

	}


	/**
	 * Checks that a variable is a string.
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @returns {string} The 'varValue' parameter.
	 */
	beep8.Utilities.checkString = function( varName, varValue ) {

		return beep8.Utilities.checkType( varName, varValue, "string" );

	}


	/**
	 * Checks that a variable is a boolean.
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @returns {boolean} The 'varValue' parameter.
	 */
	beep8.Utilities.checkBoolean = function( varName, varValue ) {

		return beep8.Utilities.checkType( varName, varValue, "boolean" );

	}


	/**
	 * Checks that a variable is a function.
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @returns {Function} The 'varValue' parameter.
	 */
	beep8.Utilities.checkFunction = function( varName, varValue ) {

		return beep8.Utilities.checkType( varName, varValue, "function" );

	}


	/**
	 * Checks that a variable is an object.
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @returns {Object} The 'varValue' parameter.
	 */
	beep8.Utilities.checkObject = function( varName, varValue ) {

		if ( varValue === null ) {
			beep8.Utilities.fatal( `${varName} should be an object, but was null` );
		}

		return beep8.Utilities.checkType( varName, varValue, "object" );

	}


	/**
	 * Checks that a variable is an instance of a given class.
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @param {Function} expectedClass - The expected class.
	 * @returns {any} The 'varValue' parameter.
	 */
	beep8.Utilities.checkInstanceOf = function( varName, varValue, expectedClass ) {

		beep8.Utilities.assert(
			varValue instanceof expectedClass,
			`${varName} should be an instance of ${expectedClass.name} but was not, it's: ${varValue}`
		);

		return varValue;

	}


	/**
	 * Checks that a variable is set (not undefined or null).
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @returns {any} The 'varValue' parameter.
	 */
	beep8.Utilities.checkIsSet = function( varName, varValue ) {

		beep8.Utilities.assert(
			varValue !== undefined && varValue !== null,
			`${varName} should be set but was: ${varValue}`
		);

		return varValue;

	}


	/**
	 * Checks that a variable is an array.
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @returns {Array} The 'varValue' parameter.
	 */
	beep8.Utilities.checkArray = function( varName, varValue ) {

		beep8.Utilities.assert( Array.isArray( varValue ), `${varName} should be an array, but was: ${varValue}` );

		return varValue;

	}

	/**
	 * Prints a log to the console if beep8.CONFIG.DEBUG is true.
	 *
	 * @param {string} msg - The message to print.
	 * @returns {void}
	 */
	beep8.Utilities.log = function( msg ) {

		if ( beep8.CONFIG.DEBUG ) {
			console.log( msg );
		}

	}


	/**
	 * Prints a warning to the console.
	 *
	 * @param {string} msg - The message to print.
	 * @returns {void}
	 */
	beep8.Utilities.warn = function( msg ) {

		console.warn( msg );

	}


	/**
	 * Prints an error to the console.
	 *
	 * @param {string} msg - The message to print.
	 * @returns {void}
	 */
	beep8.Utilities.error = function( msg ) {

		console.error( msg );

	}


	/**
	 * Loads an image asynchronously.
	 *
	 * @param {string} src - The source URL of the image.
	 * @returns {Promise<HTMLImageElement>} A promise that resolves to the loaded image.
	 */
	beep8.Utilities.loadImageAsync = async function( src ) {

		return new Promise(
			( resolver ) => {
				const img = new Image();
				img.src = src;
				img.onload = () => resolver( img );
			}
		);

	}


	/**
	 * Makes a color transparent in an image.
	 *
	 * This function is asynchronous because it uses an HTMLImageElement.
	 *
	 * Uses a range because I found that occassionally the RGB values of a saved
	 * png are not exactly as they were set in the image. Possibly due to
	 * compression.
	 *
	 * @param {HTMLImageElement} img - The image to process.
	 * @param {array} color - The color to make transparent. By default this is pure magenta [255,0,255].
	 * @param {number} range - The range of RGB values to consider as the target color.
	 * @returns The processed image.
	 */
	beep8.Utilities.makeColorTransparent = async function( img, color = [ 255, 0, 255 ], range = 5 ) {

		// Create a canvas the same size as the image and draw the image on it.
		const canvas = document.createElement( "canvas" );
		const ctx = canvas.getContext( "2d" );

		canvas.width = img.width;
		canvas.height = img.height;

		ctx.drawImage( img, 0, 0 );

		// Get the image data.
		const imageData = ctx.getImageData( 0, 0, canvas.width, canvas.height );
		const data = imageData.data;

		// Loop through the image data and set the alpha channel to 0 for the specified color.
		for ( let i = 0; i < data.length; i += 4 ) {

			const r = data[ i ];
			const g = data[ i + 1 ];
			const b = data[ i + 2 ];

			// Check if the pixel's RGB values are within the range of the target color
			if (
				Math.abs( r - color[ 0 ] ) <= range &&
				Math.abs( g - color[ 1 ] ) <= range &&
				Math.abs( b - color[ 2 ] ) <= range
			) {
				data[ i + 3 ] = 0; // Set alpha to 0 (fully transparent)
			}

		}

		// Put the modified image data back on the canvas.
		ctx.putImageData( imageData, 0, 0 );

		return canvas;

	}


	/**
	 * Loads a file asynchronously.
	 *
	 * @param {string} url - The URL of the file.
	 * @returns {Promise<string>} A promise that resolves to the file content.
	 */
	beep8.Utilities.loadFileAsync = function( url ) {

		return new Promise(
			( resolve, reject ) => {

				const xhr = new XMLHttpRequest();

				xhr.addEventListener(
					"load",
					() => {
						if ( xhr.status < 200 || xhr.status > 299 ) {
							reject( "HTTP request finished with status " + xhr.status );
						} else {
							resolve( xhr.responseText );
						}
					}
				);

				xhr.addEventListener( "error", e => reject( e ) );
				xhr.open( "GET", url );
				xhr.send();

			}

		);

	}


	/**
	 * Clamps a number, ensuring it's between a minimum and a maximum.
	 *
	 * @param {number} x - The number to clamp.
	 * @param {number} lo - The minimum value.
	 * @param {number} hi - The maximum value.
	 * @returns {number} The clamped number.
	 */
	beep8.Utilities.clamp = function( x, lo, hi ) {

		return Math.min( Math.max( x, lo ), hi );

	}


	/**
	 * Calculates a 2D distance between points (x0, y0) and (x1, y1).
	 *
	 * @param {number} x0 - The x-coordinate of the first point.
	 * @param {number} y0 - The y-coordinate of the first point.
	 * @param {number} x1 - The x-coordinate of the second point.
	 * @param {number} y1 - The y-coordinate of the second point.
	 * @returns {number} The distance between the two points.
	 */
	beep8.Utilities.dist2d = function( x0, y0, x1, y1 ) {

		beep8.Utilities.checkNumber( "x0", x0 );
		beep8.Utilities.checkNumber( "y0", y0 );
		beep8.Utilities.checkNumber( "x1", x1 );
		beep8.Utilities.checkNumber( "y1", y1 );

		const dx = x0 - x1;
		const dy = y0 - y1;

		return Math.sqrt( dx * dx + dy * dy );

	}


	/**
	 * Calculates the intersection between two integer number intervals.
	 *
	 * Given 2 ranges it will see if these ranges overlap and if they do it will
	 * optionally return the intersection range.
	 *
	 * For example if the first interval is [1, 5] and the second interval is [3, 7]
	 * the intersection is [3, 5].
	 *
	 * @param {number} as - The start of the first interval.
	 * @param {number} ae - The end of the first interval.
	 * @param {number} bs - The start of the second interval.
	 * @param {number} be - The end of the second interval.
	 * @param {Object} [result=null] - If provided, used to return the intersection.
	 * @returns {boolean} True if there is an intersection, false otherwise.
	 */
	beep8.Utilities.intersectIntervals = function( as, ae, bs, be, result = null ) {

		beep8.Utilities.checkNumber( "as", as );
		beep8.Utilities.checkNumber( "ae", ae );
		beep8.Utilities.checkNumber( "bs", bs );
		beep8.Utilities.checkNumber( "be", be );

		if ( result ) {
			beep8.Utilities.checkObject( "result", result );
		}

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
	 *
	 * @param {Object} r1 - The first rectangle.
	 * @param {Object} r2 - The second rectangle.
	 * @param {number} [dx1=0] - The delta X to add to the first rectangle.
	 * @param {number} [dy1=0] - The delta Y to add to the first rectangle.
	 * @param {number} [dx2=0] - The delta X to add to the second rectangle.
	 * @param {number} [dy2=0] - The delta Y to add to the second rectangle.
	 * @param {Object} [result=null] - If provided, used to return the intersection.
	 * @returns {boolean} True if there is a non-empty intersection, false otherwise.
	 */
	beep8.Utilities.intersectRects = function( r1, r2, dx1 = 0, dy1 = 0, dx2 = 0, dy2 = 0, result = null ) {

		beep8.Utilities.checkObject( "r1", r1 );
		beep8.Utilities.checkObject( "r2", r2 );
		beep8.Utilities.checkNumber( "r1.x", r1.x );
		beep8.Utilities.checkNumber( "r1.y", r1.y );
		beep8.Utilities.checkNumber( "r1.w", r1.w );
		beep8.Utilities.checkNumber( "r1.h", r1.h );
		beep8.Utilities.checkNumber( "r2.x", r2.x );
		beep8.Utilities.checkNumber( "r2.y", r2.y );
		beep8.Utilities.checkNumber( "r2.w", r2.w );
		beep8.Utilities.checkNumber( "r2.h", r2.h );
		beep8.Utilities.checkNumber( "dx1", dx1 );
		beep8.Utilities.checkNumber( "dx2", dx2 );
		beep8.Utilities.checkNumber( "dy1", dy1 );
		beep8.Utilities.checkNumber( "dy2", dy2 );

		if ( result ) {
			checkObject( "result", result );
		}

		const xint = intersectRects_xint;
		const yint = intersectRects_yint;

		if (
			!beep8.Utilities.intersectIntervals(
				r1.x + dx1,
				r1.x + dx1 + r1.w - 1,
				r2.x + dx2,
				r2.x + dx2 + r2.w - 1, xint
			)
		) {
			return false;
		}

		if (
			!beep8.Utilities.intersectIntervals(
				r1.y + dy1,
				r1.y + dy1 + r1.h - 1,
				r2.y + dy2,
				r2.y + dy2 + r2.h - 1, yint
			)
		) {
			return false;
		}

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


	/**
	 * Converts a string to a pretty URL-friendly format.
	 *
	 * @param {string} str - The string to convert.
	 * @returns {string} The pretty string.
	 */
	beep8.Utilities.makeUrlPretty = function( uglyStr ) {

		beep8.Utilities.checkString( "uglyStr", uglyStr );

		let str = uglyStr;

		// Convert to lowercase
		str = str.toLowerCase();

		// Replace spaces and slashes with hyphens
		str = str.replace( /[\s/]+/g, '-' );

		// Remove all non-url-safe characters except hyphens
		str = str.replace( /[^a-z0-9\-]+/g, '' );

		// Remove multiple consecutive hyphens
		str = str.replace( /-+/g, '-' );

		// Trim hyphens from start and end
		str = str.replace( /^-+|-+$/g, '' );

		return str;

	}


	/**
	 * Performs a deep merge of objects and returns new object. Does not modify
	 * objects (immutable) and merges arrays via concatenation.
	 *
	 * @param {...object} objects - Objects to merge
	 * @returns {object} New object with merged key/values
	 */
	beep8.Utilities.deepMerge = function( ...objects ) {

		const isObject = obj => obj && typeof obj === 'object';

		return objects.reduce(

			( prev, obj ) => {

				Object.keys( obj ).forEach(
					( key ) => {

						const pVal = prev[ key ];
						const oVal = obj[ key ];

						if ( Array.isArray( pVal ) && Array.isArray( oVal ) ) {
							prev[ key ] = pVal.concat( ...oVal );
						}
						else if ( isObject( pVal ) && isObject( oVal ) ) {
							prev[ key ] = beep8.Utilities.deepMerge( pVal, oVal );
						}
						else {
							prev[ key ] = oVal;
						}
					}
				);

				return prev;
			},
			{}
		);

	}


	/**
	 * Pads a number with leading zeros to the specified length.
	 *
	 * Does not support negative numbers.
	 *
	 * @param {number} number - The number to pad.
	 * @param {number} length - The desired length of the output string.
	 * @returns {string} - The padded number as a string.
	 */
	beep8.Utilities.padWithZeros = function( number, length ) {

		beep8.Utilities.checkNumber( "number", number );
		beep8.Utilities.checkInt( "length", length );

		if ( number < 0 ) {
			beep8.Utilities.fatal( "padWithZeros does not support negative numbers" );
		}

		return number.toString().padStart( length, '0' );

	}


	/**
	 * Generate a new custom event.
	 *
	 * @param {string} eventName - The name of the event.
	 * @param {Object} [detail={}] - The event detail.
	 * @param {EventTarget} [target=document] - The target of the event.
	 * @returns {void}
	 */
	beep8.Utilities.event = function( eventName, detail = {}, target = document ) {

		beep8.Utilities.checkString( "eventName", eventName );
		beep8.Utilities.checkObject( "detail", detail );
		beep8.Utilities.checkObject( "target", target );

		// Prefix event name with beep8.
		eventName = `beep8.${eventName}`;

		// Create a custom event.
		const event = new CustomEvent( eventName, { detail } );

		// Dispatch the event.
		target.dispatchEvent( event );

	};


	/**
	 * Utility function to repeat an array a specified number of times.
	 *
	 * @param {Array} array - The array to repeat.
	 * @param {number} times - The number of times to repeat the array.
	 * @returns {Array} The repeated array.
	 */
	beep8.Utilities.repeatArray = function( array, times ) {

		beep8.Utilities.checkArray( "array", array );
		beep8.Utilities.checkInt( "times", times, 0 );

		return Array( times ).fill().flatMap( () => array );

	};


	/**
	 * Downloads a file.
	 *
	 * @param {string} filename - The name of the file.
	 * @param {string} src - The source URL of the file.
	 * @returns {void}
	 */
	beep8.Utilities.downloadFile = function( filename = '', src = '' ) {

		beep8.Utilities.checkString( "filename", filename );
		beep8.Utilities.checkString( "src", src );

		// Create a link element to use to download the image.
		const element = document.createElement( 'a' );
		element.setAttribute( 'href', src );
		element.setAttribute( 'download', filename );

		// Append the element to the body.
		document.body.appendChild( element );

		// Click the link to download.
		element.click();

		// Tidy up.
		document.body.removeChild( element );

	};


} )( beep8 || ( beep8 = {} ) );
