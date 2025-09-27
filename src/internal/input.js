( function( beep8 ) {

	/**
	 * Input class handles keyboard input and provides methods to check key states.
	 */
	beep8.Input = {};

	/**
	 * List of keys currently held down.
	 *
	 * @type {Set<string>}
	 */
	let keysHeld_ = null;

	/**
	 * List of keys that were just pressed in the current frame.
	 *
	 * @type {Set<string>}
	 */
	let keysJustPressed_ = null;


	/**
	 * Initializes the input system.
	 *
	 * @returns {void}
	 */
	beep8.Input.init = function() {

		// Keys currently held down (set of strings).
		keysHeld_ = new Set();
		// Keys that were just pressed in the current frame.
		keysJustPressed_ = new Set();

		// Bind event listeners to handle keydown and keyup events.
		window.addEventListener( "keydown", e => beep8.Input.onKeyDown( e ) );
		window.addEventListener( "keyup", e => beep8.Input.onKeyUp( e ) );
		window.addEventListener( "pointerdown", e => beep8.Input.onPointerDown( e ) );

	}


	/**
	 * Checks if a key is currently held down.
	 *
	 * @param {string} keyName - The name of the key to check.
	 * @returns {boolean} Whether the key is currently held down.
	 */
	beep8.Input.keyHeld = function( keyName ) {

		return keysHeld_.has( keyName.toUpperCase() );

	}


	/**
	 * Checks if a key was just pressed in the current frame.
	 *
	 * @param {string} keyName - The name of the key to check.
	 * @returns {boolean} Whether the key was just pressed.
	 */
	beep8.Input.keyJustPressed = function( keyName ) {

		return keysJustPressed_.has( keyName.toUpperCase() );

	}


	/**
	 * Clears the list of keys that were just pressed.
	 * Should be called at the end of each frame.
	 *
	 * @returns {void}
	 */
	beep8.Input.onEndFrame = function() {

		keysJustPressed_.clear();

	}


	/**
	 * Handles keydown events, adding the key to the just pressed and held sets.
	 * Resolves any pending asynchronous key events.
	 *
	 * @param {KeyboardEvent} e - The event object.
	 * @returns {void}
	 */
	beep8.Input.onKeyDown = function( e ) {

		const key = e.key;
		const keys = beep8.Input.getKeys( key );

		// Stop page from scrolling when the arrows/ space are pressed.
		if ( [ "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " " ].includes( key ) ) {
			e.preventDefault();
		}

		// Add to currently held keys.
		for ( const k of keys ) {
			keysJustPressed_.add( k.toUpperCase() );
			keysHeld_.add( k.toUpperCase() );
		}

		// Return any pending key events.
		if ( beep8.Core.hasPendingAsync( "beep8.Async.key" ) ) {
			beep8.Core.resolveAsync( "beep8.Async.key", keys );
		}

	}


	/**
	 * Handles pointerdown events, resolving any pending asynchronous pointer events.
	 *
	 * @param {PointerEvent} e - The event object.
	 * @returns {void}
	 */
	beep8.Input.onPointerDown = function( e ) {

		if ( beep8.Core.hasPendingAsync( "beep8.Async.pointer" ) ) {
			beep8.Core.resolveAsync( "beep8.Async.pointer", { x: e.clientX, y: e.clientY } );
		}

	}


	/**
	 * Handles keyup events, removing the key from the held set.
	 *
	 * @param {KeyboardEvent} e - The event object.
	 * @returns {void}
	 */
	beep8.Input.onKeyUp = function( e ) {

		if ( !e.key ) return;

		const key = e.key.toUpperCase();
		const keys = beep8.Input.getKeys( key );

		for ( const k of keys ) {
			keysHeld_.delete( k.toUpperCase() );
		}

	}


	/**
	 * Reads a key asynchronously. Returns a promise that resolves to the key that was pressed.
	 *
	 * @returns {Promise<string>} A promise that resolves to the key that was pressed.
	 */
	beep8.Input.readKeyAsync = function() {

		return new Promise(
			( resolve, reject ) => {
				beep8.Core.startAsync( "beep8.Async.key", resolve, reject );
			}
		);

	}


	/**
	 * Reads a pointer asynchronously. Returns a promise that resolves to the
	 * pointer position.
	 *
	 * @returns {Promise<{x: number, y: number}>} A promise that resolves to the pointer position.
	 */
	beep8.Input.readPointerAsync = function() {

		return new Promise(
			( resolve, reject ) => {
				beep8.Core.startAsync( "beep8.Async.pointer", resolve, reject );
			}
		);

	}


	/**
	 * Gets an array of keys that correspond to a given key.
	 * This is used to handle key aliases (e.g. "W" and "ArrowUp").
	 *
	 * @param {string} key - The key to get aliases for.
	 * @returns {string[]} An array of key names.
	 */
	beep8.Input.getKeys = function( key ) {

		let keys = [ key ];

		switch ( key.toUpperCase() ) {
			case "W":
				keys.push( "ArrowUp" );
				break;

			case "A":
				keys.push( "ArrowLeft" );
				break;

			case "S":
				keys.push( "ArrowDown" );
				break;

			case "D":
				keys.push( "ArrowRight" );
				break;

			case "Enter":
				keys.push( "Escape" );
				break;

			case "Z":
			case "N":
				keys.push( "ButtonA" );
				break;

			case "X":
			case "M":
				keys.push( "ButtonB" );
				break;
		}

		return keys;

	}


	/**
	 * Reads a line of text asynchronously.
	 * Handles user input to build a string until the Enter key is pressed.
	 *
	 * @param {string} initString - The initial string to display.
	 * @param {string} [prompt=''] - An optional prompt to display before the input.
	 * @param {number} [maxLen=100] - The maximum length of the string to read.
	 * @param {number} [maxWidth=-1] - The maximum width of the line.
	 * @returns {Promise<string>} A promise that resolves to the string that was read.
	 */
	beep8.Input.readLine = async function( prompt = 'Enter text:', initString = '', maxLen = 100, maxWidth = -1 ) {

		// If a prompt is specified, print it first.
		if ( prompt && prompt.length > 0 ) {
			beep8.print( prompt + "\n> " );
		}

		// On mobile we use a prompt dialog since they don't have a keyboard for typing things in.
		if ( beep8.Core.isMobile() ) {
			const textInput = await readPrompt( prompt, initString, maxLen, maxWidth );
			beep8.print( textInput + "\n" );
			await beep8.Async.wait( 0.2 );
			return textInput;
		}

		// On desktop we handle the input ourselves.
		const startCol = beep8.Core.drawState.cursorCol;
		const startRow = beep8.Core.drawState.cursorRow;

		let curCol = startCol;
		let curRow = startRow;
		let curStrings = [ initString ];
		let curPos = 0;

		const cursorWasVisible = beep8.Core.drawState.cursorVisible;
		beep8.CursorRenderer.setCursorVisible( true );

		// Loop until the user presses Enter.
		while ( true ) {

			beep8.Core.setCursorLocation( curCol, curRow );
			beep8.TextRenderer.print( curStrings[ curPos ] || "" );
			const keys = await beep8.Input.readKeyAsync();

			for ( const key of keys ) {

				if ( key === "Backspace" ) {

					// Handle backspace: remove the last character.
					if ( curStrings[ curPos ].length === 0 ) {
						if ( curPos === 0 ) {
							continue;
						}
						curPos--;
						curRow--;
					}

					// If the current string has at least one character it removes the last character.
					// If the string is empty it leaves it unchanged.
					curStrings[ curPos ] = curStrings[ curPos ].length > 0 ? curStrings[ curPos ].substring( 0, curStrings[ curPos ].length - 1 ) : curStrings[ curPos ];
					// Position the flashing cursor and then print a space to remove the last character.
					beep8.Core.setCursorLocation( curCol + beep8.TextRenderer.measure( curStrings[ curPos ] ).cols, curRow );
					beep8.TextRenderer.print( " " );

					beep8.Sfx.play( beep8.CONFIG.SFX.TYPING );

				} else if ( key === "Enter" ) {

					// Handle enter: submit the text.
					beep8.CursorRenderer.setCursorVisible( cursorWasVisible );

					beep8.Sfx.play( beep8.CONFIG.SFX.TYPING );

					return curStrings.join( "" );

				} else if ( key.length === 1 ) {

					// Handle regular character input.
					if ( curStrings.join( "" ).length < maxLen || maxLen === -1 ) {
						curStrings[ curPos ] += key;

						// Word wrap.
						// Check if maxWidth is set and the current string has reached/exceeded it
						if ( maxWidth !== -1 && curStrings[ curPos ].length >= maxWidth ) {
							// Print the last character of the current string (to visually fill the slot)
							beep8.TextRenderer.print( curStrings[ curPos ].charAt( curStrings[ curPos ].length - 1 ) );
							// Reset the column to the starting column for the next line
							curCol = startCol;
							// Move to the next string position (start a new line)
							curPos++;
							// Initialize the new line as an empty string
							curStrings[ curPos ] = "";
							// Move the row down for the new line
							curRow++;
						}
					}

					beep8.Sfx.play( beep8.CONFIG.SFX.TYPING );

				}

			}
		}
	}


	/**
	 * Helper function to show a prompt dialog on mobile devices.
	 * This is used because mobile devices don't have a physical keyboard.
	 *
	 * @param {string} [promptString='Enter text:'] - The prompt to display.
	 * @param {string} [initString=''] - The initial string to display.
	 * @param {number} [maxLen=100] - The maximum length of the string to read.
	 * @param {number} [maxWidth=-1] - The maximum width of the line.
	 * @returns {Promise<string>} A promise that resolves to the string that was read.
	 */
	const readPrompt = async function( promptString = 'Enter text:', initString = '', maxLen = 100, maxWidth = -1 ) {

		// If the prompted string is valid.
		let valid = false;
		// The value to return.
		let textInput = "";
		// The characters that are allowed.
		const allowedChars = beep8.CONFIG.CHRS;

		do {

			// A little pause to ensure the screen updates before the prompt appears.
			await beep8.Async.wait( 0.333 );

			// Show the prompt and get the input.
			textInput = prompt( promptString, initString );

			// Trim whitespace from start and end.
			textInput = textInput.trim();

			// Remove disallowed characters.
			textInput = textInput.split( '' ).filter( char => allowedChars.includes( char ) ).join( '' );

			// Enforce max length.
			if ( maxLen !== -1 ) {
				textInput = textInput.substring( 0, maxLen );
			}

			valid = textInput.length > 0;

		} while ( valid === false );

		return textInput;

	}

} )( beep8 );
