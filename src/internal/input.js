import * as main from "./main.js";

export class InputSys {

	constructor() {

		// Keys currently held down (array of strings).
		this.keysHeld_ = new Set();
		// Keys that were just pressed on this frame.
		this.keysJustPressed_ = new Set();

		window.addEventListener( "keydown", e => this.onKeyDown( e ) );
		window.addEventListener( "keyup", e => this.onKeyUp( e ) );

	}


	/**
	 * Returns whether a key is currently held down.
	 *
	 * @param {string} keyName - The name of the key to check
	 * @returns {boolean} Whether the key is currently held down
	 */
	keyHeld( keyName ) {

		return this.keysHeld_.has( keyName.toUpperCase() );

	}


	/**
	 * Returns whether a key was just pressed on this frame.
	 *
	 * @param {string} keyName - The name of the key to check
	 * @returns {boolean} Whether the key was just pressed
	 */
	keyJustPressed( keyName ) {
		return this.keysJustPressed_.has( keyName.toUpperCase() );
	}

	/**
	 * Called at the end of each frame to clear the list of keys that were just pressed.
	 * @returns {void}
	 */
	onEndFrame() {

		this.keysJustPressed_.clear();

	}


	/**
	 * Handles a keydown event.
	 *
	 * @param {KeyboardEvent} e - The event object
	 * @returns {void}
	 */
	onKeyDown( e ) {

		this.keysJustPressed_.add( e.key.toUpperCase() );
		this.keysHeld_.add( e.key.toUpperCase() );

		if ( main.hasPendingAsync( "beep8a.key" ) ) {
			main.resolveAsync( "beep8a.key", e.key );
		}

	}


	/**
	 * Handles a keyup event.
	 *
	 * @param {KeyboardEvent} e - The event object
	 * @returns {void}
	 */
	onKeyUp( e ) {

		this.keysHeld_.delete( e.key.toUpperCase() );

	}


	/**
	 * Reads a key asynchronously.
	 *
	 * @returns {Promise<string>} A promise that resolves to the key that was pressed
	 */
	readKeyAsync() {

		return new Promise(
			( resolve, reject ) => {
				main.startAsync( "beep8a.key", resolve, reject );
			}
		);

	}


	/**
	 * Reads a line of text asynchronously.
	 *
	 * @param {string} initString - The initial string to display
	 * @param {number} maxLen - The maximum length of the string to read
	 * @param {number} [maxWidth=-1] - The maximum width of the line
	 * @returns {Promise<string>} A promise that resolves to the string that was read
	 */
	async readLine( initString, maxLen, maxWidth = -1 ) {

		const startCol = main.drawState.cursorCol;
		const startRow = main.drawState.cursorRow;

		let curCol = startCol;
		let curRow = startRow;
		let curStrings = [ initString ];
		let curPos = 0;

		const cursorWasVisible = main.drawState.cursorVisible;

		main.cursorRenderer.setCursorVisible( true );

		// Loop until the user presses Enter.
		while ( true ) {

			main.setCursorLocation( curCol, curRow );
			main.textRenderer.print( curStrings[ curPos ] || "" );
			const key = await this.readKeyAsync();

			if ( key === "Backspace" ) {
				// Move cursor back one character.
				if ( curStrings[ curPos ].length === 0 ) {
					if ( curPos === 0 ) {
						continue;
					}
					curPos--;
					curRow--;
				}
				curStrings[ curPos ] = curStrings[ curPos ].length > 0 ? curStrings[ curPos ].substring( 0, curStrings[ curPos ].length - 1 ) : curStrings[ curPos ];
				// Erase the character.
				main.setCursorLocation( curCol + curStrings[ curPos ].length, curRow );
				main.textRenderer.print( " " );

			} else if ( key === "Enter" ) {

				// Submit line of text.

				// Move cursor to start of next line.
				main.setCursorLocation( 1, curRow + 1 );
				// Restore previous cursor state.
				main.cursorRenderer.setCursorVisible( cursorWasVisible );
				return curStrings.join( "" );

			} else if ( key.length === 1 ) {

				// Add character to string.

				if ( curStrings.join( "" ).length < maxLen || maxLen === -1 ) {

					curStrings[ curPos ] += key;

					if ( maxWidth !== -1 && curStrings[ curPos ].length >= maxWidth ) {
						main.textRenderer.print( curStrings[ curPos ].charAt( curStrings[ curPos ].length - 1 ) );
						curCol = startCol;
						curPos++;
						curStrings[ curPos ] = "";
						curRow++;
					}

				}

			}

		}

	}

}
