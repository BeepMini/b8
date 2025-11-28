( function( b8 ) {

	b8.Path = {};

	const movementMap = {
		U: { dx: 0, dy: -1 },
		D: { dx: 0, dy: 1 },
		L: { dx: -1, dy: 0 },
		R: { dx: 1, dy: 0 },
	};


	/**
	 * Parse a path code string into an array of steps.
	 *
	 * Commands:
	 * U - move up
	 * D - move down
	 * L - move left
	 * R - move right
	 * P - pause (stay in place)
	 * F + direction - face direction without moving (U/D/L/R)
	 *
	 * Each command can be followed by a number to indicate how many steps to take.
	 * If no number is provided, it defaults to 1.
	 *
	 * Examples:
	 * "UUDDLRLR" - up 2, down 2, left 1, right 1, left 1, right 1
	 * "U2R3DL4P2" - up 2, right 3, down 1, left 4, pause 2
	 * "FUR2FD2P3" - face up, right 2, face down 2, pause 3
	 * "R5P" - right 5, pause 1
	 *
	 * @param {string} code - The path code string.
	 * @param {number} startRow - The starting row position.
	 * @param {number} startCol - The starting column position.
	 * @param {string} initialDir - The initial facing direction ('U', 'D', 'L', 'R').
	 * @returns {Array} Array of steps with x, y, and dir properties.
	 */
	b8.Path.parseCode = ( code, startRow = 0, startCol = 0, initialDir = 'D' ) => {

		b8.Utilities.checkString( 'code', code );
		b8.Utilities.checkNumber( 'startRow', startRow );
		b8.Utilities.checkNumber( 'startCol', startCol );
		b8.Utilities.checkString( 'initialDir', initialDir );
		if ( !'UDLR'.includes( initialDir ) ) {
			b8.Utilities.fatal( 'Path.parseCode: initialDir must be one of U, D, L, R' );
		}

		let x = startRow;
		let y = startCol;
		let currentDir = initialDir;
		const steps = [];

		const cleaned = code.replace( /\s+/g, '' ).toUpperCase();
		let i = 0;

		console.log( 'Parsing path code:', cleaned );

		while ( i < cleaned.length ) {

			const cmd = cleaned[ i ];

			console.log( `At index ${i}, command: ${cmd}` );

			// simple movement command
			if ( 'UDLR'.includes( cmd ) ) {

				i++;

				const { count, index } = _parseNumber( cleaned, i );
				i = index;
				console.log( `Command: ${cmd}, Count: ${count}` );

				for ( let n = 0; n < count; n++ ) {
					x += movementMap[ cmd ].dx;
					y += movementMap[ cmd ].dy;
					_pushStep( steps, x, y, cmd );
				}

				continue;

			}

			// pause command
			if ( cmd === 'P' ) {

				i++;
				const { count, index } = _parseNumber( cleaned, i );
				i = index;

				_pushStep( steps, x, y, currentDir, count );

				continue;

			}

			// facing command: F + U/D/L/R + optional number
			if ( cmd === 'F' ) {

				i++;
				const faceDir = cleaned[ i ];
				if ( !'UDLR'.includes( faceDir ) ) {
					throw new Error( 'F must be followed by U/D/L/R, got: ' + faceDir );
				}
				i++;

				const { count, index } = _parseNumber( cleaned, i );
				i = index;

				_pushStep( steps, x, y, faceDir, count );

				continue;

			}

			throw new Error( 'Invalid command: ' + cmd );

		}

		return steps;

	}


	/**
	 * Validates the syntax of a path string.
	 *
	 * @param {string} path - The path string to validate.
	 * @returns {boolean} - True if the path syntax is valid, false otherwise.
	 */
	b8.Path.validPathSyntax = ( path ) => {

		// Define valid characters and starting letters as constants for easy modification
		const VALID_CHARACTERS = 'UDLRFP'; // Valid movement and command letters

		if ( typeof path !== 'string' ) {
			return false;
		}

		// Reject empty or whitespace-only strings
		if ( path.trim().length === 0 ) {
			return false;
		}

		// Check if the path contains only valid characters
		if ( !new RegExp( `^[\\d\\s${VALID_CHARACTERS}]+$` ).test( path ) ) {
			return false;
		}

		// Check if the path contains at least one letter from the valid character set
		if ( !new RegExp( `[${VALID_CHARACTERS}]` ).test( path ) ) {
			return false;
		}

		// Check if the path starts with one of the valid starting letters
		if ( !new RegExp( `^[${VALID_CHARACTERS}]` ).test( path ) ) {
			return false;
		}

		return true;

	}


	/**
	 * Parse a number from the cleaned string starting at index i.
	 * If no number is found, defaults to 1.
	 *
	 * @param {string} cleaned - The cleaned path code string.
	 * @param {number} i - The current index in the string.
	 * @returns {number} The parsed number or 1 if no number is found.
	 */
	function _parseNumber( cleaned, i ) {

		let numStr = '';
		while ( i < cleaned.length && /[0-9]/.test( cleaned[ i ] ) ) {
			numStr += cleaned[ i++ ];
		}

		return { count: numStr ? parseInt( numStr, 10 ) : 1, index: i };


	}


	/**
	 * Push steps into the steps array.
	 *
	 * @param {Array} steps - The array to store steps.
	 * @param {number} x - The x-coordinate of the step.
	 * @param {number} y - The y-coordinate of the step.
	 * @param {string|null} dir - The direction of the step.
	 * @param {number} count - The number of steps to push.
	 */
	function _pushStep( steps, x, y, dir = null, count = 1 ) {

		for ( let n = 0; n < count; n++ ) {
			steps.push(
				{
					x,
					y,
					dir: dir,
				}
			);
		}

	}

} )( b8 );