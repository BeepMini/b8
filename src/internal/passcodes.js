( function( beep8 ) {

	beep8.Passcodes = {};


	/**
	 * The length of the level passcodes.
	 *
	 * @type {number}
	 */
	beep8.Passcodes.codeLength = 4;


	/**
	 * Function to generate a passcode for a given id.
	 * This is intended for level passcodes.
	 *
	 * @param {string} id - The id to generate a code for.
	 * @returns {string} The generated code.
	 */
	beep8.Passcodes.getCode = function( id ) {

		beep8.Utilities.checkIsSet( "id", id );

		// Combine the id and secret key for uniqueness.
		const combined = id + beep8.CONFIG.PASSKEY;

		// Generate hash of the combined string.
		let hash = hashString( combined );

		// Remove non-alphabetic characters and convert to uppercase.
		hash = hash.replace( /[^a-zA-Z]/g, '' );
		hash = hash.toUpperCase(); // Convert to uppercase

		// Return the first 'codeLength' characters.
		return hash.substring( 0, beep8.Passcodes.codeLength );

	}


	/**
	 * Function to check if a given code is valid for a given id.
	 *
	 * @param {string} id - The id to check the code for.
	 * @param {string} code - The code to check.
	 * @returns {boolean} True if the code is valid, false otherwise.
	 */
	beep8.Passcodes.checkCode = function( id, code ) {

		beep8.Utilities.checkIsSet( "id", id );
		beep8.Utilities.checkString( "code", code );

		const generatedCode = beep8.Passcodes.getCode( id );
		return generatedCode === code;

	}


	/**
	 * Function to work out the id from the code.
	 *
	 * @param {string} code - The code to get the id for.
	 * @returns {int} The id for the code.
	 */
	beep8.Passcodes.getId = function( code ) {

		beep8.Utilities.checkString( "code", code );

		// Loop through all levels to find a match.
		code = code.toUpperCase();
		for ( c = 1; c < 999; c++ ) {
			if ( beep8.Passcodes.checkCode( c, code ) ) {
				return c;
			}
		}

		// Return null if no match is found.
		return null;

	}


	/**
	 * Display a dialog to accept a passcode. This is automatically centered on
	 * the screen.
	 *
	 * The level id of the specified passcode is returned as an integer.
	 *
	 * This can be coloured with the standard beep8.color function.
	 *
	 * @returns {number|null} The level id of the passcode.
	 */
	beep8.Passcodes.input = async function() {

		const message = 'Enter code:';
		const width = message.length + 2 + 2;
		const height = 6;

		let xPosition = Math.round( ( beep8.CONFIG.SCREEN_COLS - width ) / 2 );
		let yPosition = Math.round( ( beep8.CONFIG.SCREEN_ROWS - height ) / 2 );

		beep8.Core.setCursorLocation( xPosition, yPosition );
		beep8.TextRenderer.printBox( width, height );

		beep8.Core.setCursorLocation( xPosition + 2, yPosition + 2 );
		beep8.TextRenderer.print( message + "\n>" );

		const passcode = await beep8.Async.readLine( "", beep8.Passcodes.codeLength );
		const value = beep8.Passcodes.getId( passcode );

		return value;

	}


	/**
	 * Function to hash a string.
	 *
	 * @param {string} input - The string to hash.
	 * @returns {string} The hashed string.
	 */
	function hashString( input ) {

		input = btoa( input );
		let hash = 0;
		let result = '';

		// Loop to hash the input string.
		for ( let i = 0; i < input.length; i++ ) {
			hash = ( hash << 5 ) - hash + input.charCodeAt( i );
			hash = hash & hash; // Convert to 32bit integer
		}

		// Loop to extend the length of the result by rehashing.
		// Adjust to control string length.
		for ( let j = 0; j < 5; j++ ) {
			hash = ( hash << 5 ) - hash + beep8.CONFIG.PASSKEY.charCodeAt( j % beep8.CONFIG.PASSKEY.length );
			// Append base-36 to the result.
			result += Math.abs( hash ).toString( 36 );
		}

		return result;

	}


} )( beep8 || ( beep8 = {} ) );
