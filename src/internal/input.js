( function( beep8 ) {

	/**
	 * Input class handles keyboard input and provides methods to check key states.
	 */
	beep8.Input = class {

		constructor() {

			// Keys currently held down (set of strings).
			this.keysHeld_ = new Set();
			// Keys that were just pressed in the current frame.
			this.keysJustPressed_ = new Set();

			// Bind event listeners to handle keydown and keyup events.
			window.addEventListener( "keydown", e => this.onKeyDown( e ) );
			window.addEventListener( "keyup", e => this.onKeyUp( e ) );

		}


		/**
		 * Checks if a key is currently held down.
		 *
		 * @param {string} keyName - The name of the key to check.
		 * @returns {boolean} Whether the key is currently held down.
		 */
		keyHeld( keyName ) {

			return this.keysHeld_.has( keyName.toUpperCase() );

		}


		/**
		 * Checks if a key was just pressed in the current frame.
		 *
		 * @param {string} keyName - The name of the key to check.
		 * @returns {boolean} Whether the key was just pressed.
		 */
		keyJustPressed( keyName ) {

			return this.keysJustPressed_.has( keyName.toUpperCase() );

		}


		/**
		 * Clears the list of keys that were just pressed.
		 * Should be called at the end of each frame.
		 *
		 * @returns {void}
		 */
		onEndFrame() {

			this.keysJustPressed_.clear();

		}


		/**
		 * Handles keydown events, adding the key to the just pressed and held sets.
		 * Resolves any pending asynchronous key events.
		 *
		 * @param {KeyboardEvent} e - The event object.
		 * @returns {void}
		 */
		onKeyDown( e ) {

			this.keysJustPressed_.add( e.key.toUpperCase() );
			this.keysHeld_.add( e.key.toUpperCase() );

			if ( beep8.Core.hasPendingAsync( "beep8.Async.key" ) ) {
				beep8.Core.resolveAsync( "beep8.Async.key", e.key );
			}

		}


		/**
		 * Handles keyup events, removing the key from the held set.
		 *
		 * @param {KeyboardEvent} e - The event object.
		 * @returns {void}
		 */
		onKeyUp( e ) {

			this.keysHeld_.delete( e.key.toUpperCase() );

		}


		/**
		 * Reads a key asynchronously. Returns a promise that resolves to the key that was pressed.
		 *
		 * @returns {Promise<string>} A promise that resolves to the key that was pressed.
		 */
		readKeyAsync() {

			return new Promise(
				( resolve, reject ) => {
					beep8.Core.startAsync( "beep8.Async.key", resolve, reject );
				}
			);

		}


		/**
		 * Reads a line of text asynchronously.
		 * Handles user input to build a string until the Enter key is pressed.
		 *
		 * @param {string} initString - The initial string to display.
		 * @param {number} maxLen - The maximum length of the string to read.
		 * @param {number} [maxWidth=-1] - The maximum width of the line.
		 * @returns {Promise<string>} A promise that resolves to the string that was read.
		 */
		async readLine( initString, maxLen, maxWidth = -1 ) {

			const startCol = beep8.Core.drawState.cursorCol;
			const startRow = beep8.Core.drawState.cursorRow;

			let curCol = startCol;
			let curRow = startRow;
			let curStrings = [ initString ];
			let curPos = 0;

			const cursorWasVisible = beep8.Core.drawState.cursorVisible;
			beep8.Core.cursorRenderer.setCursorVisible( true );

			// Loop until the user presses Enter.
			while ( true ) {

				beep8.Core.setCursorLocation( curCol, curRow );
				beep8.Core.textRenderer.print( curStrings[ curPos ] || "" );
				const key = await this.readKeyAsync();

				if ( key === "Backspace" ) {

					// Handle backspace: remove the last character.
					if ( curStrings[ curPos ].length === 0 ) {
						if ( curPos === 0 ) {
							continue;
						}
						curPos--;
						curRow--;
					}

					curStrings[ curPos ] = curStrings[ curPos ].length > 0 ? curStrings[ curPos ].substring( 0, curStrings[ curPos ].length - 1 ) : curStrings[ curPos ];
					beep8.Core.setCursorLocation( curCol + curStrings[ curPos ].length, curRow );
					beep8.Core.textRenderer.print( " " );

				} else if ( key === "Enter" ) {

					// Handle enter: submit the text.
					beep8.Core.setCursorLocation( 1, curRow + 1 );
					beep8.Core.cursorRenderer.setCursorVisible( cursorWasVisible );
					return curStrings.join( "" );

				} else if ( key.length === 1 ) {

					// Handle regular character input.
					if ( curStrings.join( "" ).length < maxLen || maxLen === -1 ) {
						curStrings[ curPos ] += key;

						if ( maxWidth !== -1 && curStrings[ curPos ].length >= maxWidth ) {
							beep8.Core.textRenderer.print( curStrings[ curPos ].charAt( curStrings[ curPos ].length - 1 ) );
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

} )( beep8 || ( beep8 = {} ) );
