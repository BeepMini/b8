( function( beep8 ) {

	beep8.Passcodes = {};

	// The length of the level passcodes.
	beep8.Passcodes.codeLength = 4;


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
		for ( let j = 0; j < 5; j++ ) { // Adjust to control string length
			hash = ( hash << 5 ) - hash + secretKey.charCodeAt( j % secretKey.length );
			result += Math.abs( hash ).toString( 36 ); // Append base-36 to the result
		}

		return result;

	}


	/**
	 * Function to generate a passcode for a given id.
	 * This is intended for level passcodes.
	 *
	 * @param {string} id - The id to generate a code for.
	 * @returns {string} The generated code.
	 */
	beep8.Passcode.getCode = function( id ) {

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
	beep8.Passcode.checkCode = function( id, code ) {

		beep8.Utilities.checkIsSet( "id", id );
		beep8.Utilities.checkString( "code", code );

		const generatedCode = beep8.Passcode.getCode( id );
		return generatedCode === code;

	}

} )( beep8 || ( beep8 = {} ) );
