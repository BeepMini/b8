( function( b8 ) {

	/**
	 * Input class handles keyboard input and provides methods to check key states.
	 */
	b8.Input = {};


	/**
	 * ─────────────────────────────────────────────────────────────
	 * Input Modes & Contexts
	 * ─────────────────────────────────────────────────────────────
	 *
	 * BeepMini supports two styles of input:
	 *
	 * 1) Polled input (gameplay)
	 *    - keyHeld()
	 *    - keyJustPressed()
	 *
	 * 2) Captured input (modal / async)
	 *    - readKeyAsync()
	 *    - readLine()
	 *
	 * These two styles MUST NOT interfere with each other.
	 *
	 * To guarantee this, input is routed through a stack of
	 * "input contexts".
	 *
	 * ─────────────────────────────────────────────────────────────
	 * Core Concepts
	 * ─────────────────────────────────────────────────────────────
	 *
	 * • Raw input state is always tracked.
	 *   - heldRaw_ reflects the physical keyboard state.
	 *   - It is never paused, cleared, or restored.
	 *
	 * • Gameplay input is contextual.
	 *   - gameJustPressed_ is only populated when the active
	 *     context allows gameplay input.
	 *
	 * • Modal input captures key events.
	 *   - When a context has { capture: true }, key events are
	 *     routed to async readers instead of gameplay polling.
	 *
	 * • Contexts are stacked.
	 *   - Opening a menu, prompt, or dialog pushes a context.
	 *   - Closing it pops the context.
	 *   - Nested modals are fully supported.
	 *
	 * ─────────────────────────────────────────────────────────────
	 * Context Behaviour
	 * ─────────────────────────────────────────────────────────────
	 *
	 * capture: true
	 *   - Gameplay keyJustPressed() returns false.
	 *   - Key events are queued for readKeyAsync().
	 *
	 * capture: false
	 *   - Gameplay polling behaves normally.
	 *
	 * passthrough: true
	 *   - Gameplay keyJustPressed() still fires even when capturing.
	 *   - Useful for overlays or non-blocking UI.
	 *
	 * ─────────────────────────────────────────────────────────────
	 * Why this exists
	 * ─────────────────────────────────────────────────────────────
	 *
	 * Mixing polled input with async input is error-prone if both
	 * listen to the same key events.
	 *
	 * Input contexts ensure:
	 *   - Async input never steals gameplay input accidentally.
	 *   - Gameplay never triggers while awaiting text or prompts.
	 *   - Key order does not depend on frame timing or code order.
	 *
	 * This design avoids:
	 *   - Saving/restoring key state
	 *   - Frame-order bugs
	 *   - Re-entrancy issues with async input
	 *
	 * ─────────────────────────────────────────────────────────────
	 */


	/**
	 * List of keys currently held down.
	 * This is a raw list of keys without any context applied.
	 * This is not gated by input contexts.
	 *
	 * @type {Set<string>}
	 */
	let keysHeldRaw_ = new Set();


	/**
	 * List of keys that were just pressed in the current frame.
	 * These are real time game key presses, not asynchronous reads.
	 *
	 * @type {Set<string>}
	 */
	let gameJustPressed_ = new Set();


	/**
	 * Retrieves the currently active input context.
	 * The active context is the last one added to the `contexts_` stack.
	 *
	 * @returns {Object} The currently active input context.
	 */
	const active_ = () => contexts_[ contexts_.length - 1 ];


	/**
	 * List of input contexts.
	 * Each context defines its name, whether it captures input, allows passthrough,
	 * and maintains a queue of input events.
	 *
	 * @type {Array<{name: string, capture: boolean, passthrough: boolean, queue: Array}>}
	 */
	let contexts_ = [
		{ name: "game", capture: false, passthrough: true, queue: [] }
	];


	b8.Input.pushContext = function( name, opts = {} ) {
		contexts_.push( {
			name,
			capture: !!opts.capture, // if true, gameplay polling should be blocked
			passthrough: opts.passthrough ?? false, // if true, still allow gameplay justPressed
			queue: [],
		} );
	};

	b8.Input.popContext = function() {
		if ( contexts_.length > 1 ) contexts_.pop();
	};

	b8.Input.withContext = async function( name, opts, fn ) {
		b8.Input.pushContext( name, opts );
		try {
			return await fn();
		} finally {
			b8.Input.popContext();
		}
	};


	/**
	 * Resets the input state, clearing all held and just pressed keys.
	 * This is useful when restarting a game or resetting input state.
	 *
	 * @returns {void}
	 */
	b8.Input.reset = function() {

		keysHeldRaw_ = new Set();
		gameJustPressed_ = new Set();

		// Remove existing event listeners.
		window.removeEventListener( "keydown", b8.Input.onKeyDown );
		window.removeEventListener( "keyup", b8.Input.onKeyUp );
		window.removeEventListener( "pointerdown", b8.Input.onPointerDown );

	}


	/**
	 * Initializes the input system.
	 *
	 * @returns {void}
	 */
	b8.Input.init = function() {

		b8.Input.reset();

		// Bind event listeners to handle keydown and keyup events.
		window.addEventListener( "keydown", b8.Input.onKeyDown );
		window.addEventListener( "keyup", b8.Input.onKeyUp );
		window.addEventListener( "pointerdown", b8.Input.onPointerDown );

	}


	/**
	 * Checks if a key is currently held down.
	 *
	 * @param {string} keyName The name of the key to check.
	 * @returns {boolean} Whether the key is currently held down.
	 */
	b8.Input.keyHeld = function( keyName ) {

		return keysHeldRaw_.has( keyName.toUpperCase() );

	}


	/**
	 * Checks if a key was just pressed in the current frame.
	 *
	 * @param {string} keyName The name of the key to check.
	 * @returns {boolean} Whether the key was just pressed.
	 */
	b8.Input.keyJustPressed = function( keyName ) {

		const ctx = active_();
		const key = keyName.toUpperCase();

		if ( ctx.capture && !ctx.passthrough ) return false;

		return gameJustPressed_.has( key );

	}


	/**
	 * Clears the list of keys that were just pressed.
	 * Should be called at the end of each frame.
	 *
	 * @returns {void}
	 */
	b8.Input.onEndFrame = function() {

		gameJustPressed_.clear();

	}


	/**
	 * Handles keydown events, adding the key to the just pressed and held sets.
	 * Resolves any pending asynchronous key events.
	 *
	 * @param {KeyboardEvent} e The event object.
	 * @returns {void}
	 */
	b8.Input.onKeyDown = function( e ) {

		const key = e.key;
		const keys = b8.Input.getKeys( key );

		if ( [ "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " " ].includes( key ) ) {
			e.preventDefault();
		}

		// Update raw held always
		for ( const k of keys ) {
			keysHeldRaw_.add( k.toUpperCase() );
		}

		const ctx = active_();

		// If not capturing, or capture allows passthrough, also update gameplay pressed
		if ( !ctx.capture || ctx.passthrough ) {
			for ( const k of keys ) {
				gameJustPressed_.add( k.toUpperCase() );
			}
		}

		// If context is capturing, feed async reads first-class
		if ( ctx.capture ) {

			ctx.queue.push( keys );

			// If something is awaiting, resolve it
			if ( b8.Core.hasPendingAsync( "b8.Async.key" ) ) {
				// Prefer draining from queue, not current event, so ordering is consistent
				const next = ctx.queue.shift();
				b8.Core.resolveAsync( "b8.Async.key", next );
			}

			return;

		}

		// Resolve pending async in non-capture mode too (optional)
		if ( b8.Core.hasPendingAsync( "b8.Async.key" ) ) {
			b8.Core.resolveAsync( "b8.Async.key", keys );
		}

	}


	/**
	 * Handles pointerdown events, resolving any pending asynchronous pointer events.
	 *
	 * @param {PointerEvent} e The event object.
	 * @returns {void}
	 */
	b8.Input.onPointerDown = function( e ) {

		if ( b8.Core.hasPendingAsync( "b8.Async.pointer" ) ) {
			b8.Core.resolveAsync( "b8.Async.pointer", { x: e.clientX, y: e.clientY } );
		}

	}


	/**
	 * Handles keyup events, removing the key from the held set.
	 *
	 * @param {KeyboardEvent} e The event object.
	 * @returns {void}
	 */
	b8.Input.onKeyUp = function( e ) {

		if ( !e.key ) return;

		const keys = b8.Input.getKeys( e.key );
		for ( const k of keys ) {
			keysHeldRaw_.delete( k.toUpperCase() );
		}

	}


	/**
	 * Reads a key asynchronously. Returns a promise that resolves to the key that was pressed.
	 *
	 * Async key reads always pull from the active context. This prevents async input from racing gameplay polling.
	 *
	 * @returns {Promise<string>} A promise that resolves to the key that was pressed.
	 */
	b8.Input.readKeyAsync = function() {

		const ctx = active_();

		// If we are in a capture context and already have queued events, return immediately
		if ( ctx.capture && ctx.queue.length > 0 ) {
			return Promise.resolve( ctx.queue.shift() );
		}

		return new Promise(
			( resolve, reject ) => {
				b8.Core.startAsync( "b8.Async.key", resolve, reject );
			}
		);

	}


	/**
	 * Reads a pointer asynchronously. Returns a promise that resolves to the
	 * pointer position.
	 *
	 * @returns {Promise<{x: number, y: number}>} A promise that resolves to the pointer position.
	 */
	b8.Input.readPointerAsync = function() {

		return new Promise(
			( resolve, reject ) => {
				b8.Core.startAsync( "b8.Async.pointer", resolve, reject );
			}
		);

	}


	/**
	 * Gets an array of keys that correspond to a given key.
	 * This is used to handle key aliases (e.g. "W" and "ArrowUp").
	 *
	 * @param {string} key The key to get aliases for.
	 * @returns {string[]} An array of key names.
	 */
	b8.Input.getKeys = function( key ) {

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
	 * readLine runs inside a capture context so that gameplay input is fully suspended while typing.
	 *
	 * @param {string} initString The initial string to display.
	 * @param {string} [prompt=''] An optional prompt to display before the input.
	 * @param {number} [maxLen=100] The maximum length of the string to read.
	 * @param {number} [maxWidth=-1] The maximum width of the line.
	 * @returns {Promise<string>} A promise that resolves to the string that was read.
	 */
	b8.Input.readLine = async function( prompt = 'Enter text:', initString = '', maxLen = 100, maxWidth = -1 ) {

		return b8.Input.withContext( "text", { capture: true }, async () => {
			// If a prompt is specified, print it first.
			if ( prompt && prompt.length > 0 ) {
				b8.print( prompt + "\n> " );
			}

			// On mobile we use a prompt dialog since they don't have a keyboard for typing things in.
			if ( b8.Core.isMobile() ) {
				return await handleMobileInput( prompt, initString, maxLen, maxWidth );
			}

			// On desktop we handle the input ourselves.
			return await handleDesktopInput( initString, maxLen, maxWidth );
		} );
	};


	/**
	 * Handles text input on mobile devices using a prompt dialog.
	 *
	 * @param {string} prompt The prompt to display.
	 * @param {string} initString The initial string to display.
	 * @param {number} maxLen The maximum length of the string to read.
	 * @param {number} maxWidth The maximum width of the line.
	 * @returns {Promise<string>} A promise that resolves to the input string.
	 */
	async function handleMobileInput( prompt, initString, maxLen, maxWidth ) {

		const textInput = await readPrompt( prompt, initString, maxLen, maxWidth );
		b8.print( textInput + "\n" );
		await b8.Async.wait( 0.2 );
		return textInput;

	}


	/**
	 * Handles text input on desktop devices by capturing key presses.
	 *
	 * @param {string} initString The initial string to display.
	 * @param {number} maxLen The maximum length of the string to read.
	 * @param {number} maxWidth The maximum width of the line.
	 * @returns {Promise<string>} A promise that resolves to the input string.
	 */
	async function handleDesktopInput( initString, maxLen, maxWidth ) {

		const startCol = b8.Core.drawState.cursorCol;
		const startRow = b8.Core.drawState.cursorRow;

		let curCol = startCol;
		let curRow = startRow;
		let curStrings = [ initString ];
		let curPos = 0;

		const cursorWasVisible = b8.Core.drawState.cursorVisible;
		b8.CursorRenderer.setCursorVisible( true );

		// Loop until the user presses Enter.
		while ( true ) {

			b8.Core.setCursorLocation( curCol, curRow );
			b8.TextRenderer.print( curStrings[ curPos ] || "" );
			const keys = await b8.Input.readKeyAsync();

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
					b8.Core.setCursorLocation( curCol + b8.TextRenderer.measure( curStrings[ curPos ] ).cols, curRow );
					b8.TextRenderer.print( " " );

					b8.Sfx.play( b8.CONFIG.SFX.TYPING );

				} else if ( key === "Enter" ) {

					// Handle enter: submit the text.
					b8.CursorRenderer.setCursorVisible( cursorWasVisible );

					b8.Sfx.play( b8.CONFIG.SFX.TYPING );

					return curStrings.join( "" );

				} else if ( key.length === 1 ) {

					// Handle regular character input.
					if ( curStrings.join( "" ).length < maxLen || maxLen === -1 ) {
						curStrings[ curPos ] += key;

						// Word wrap.
						// Check if maxWidth is set and the current string has reached/exceeded it
						if ( maxWidth !== -1 && curStrings[ curPos ].length >= maxWidth ) {
							// Print the last character of the current string (to visually fill the slot)
							b8.TextRenderer.print( curStrings[ curPos ].charAt( curStrings[ curPos ].length - 1 ) );
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

					b8.Sfx.play( b8.CONFIG.SFX.TYPING );

				}

			}
		}
	}


	/**
	 * Helper function to show a prompt dialog on mobile devices.
	 * This is used because mobile devices don't have a physical keyboard.
	 *
	 * @param {string} [promptString='Enter text:'] The prompt to display.
	 * @param {string} [initString=''] The initial string to display.
	 * @param {number} [maxLen=100] The maximum length of the string to read.
	 * @param {number} [maxWidth=-1] The maximum width of the line.
	 * @returns {Promise<string>} A promise that resolves to the string that was read.
	 */
	const readPrompt = async function( promptString = 'Enter text:', initString = '', maxLen = 100, maxWidth = -1 ) {

		// If the prompted string is valid.
		let valid = false;
		// The value to return.
		let textInput = "";
		// The characters that are allowed.
		const allowedChars = b8.CONFIG.CHRS;

		do {

			// A little pause to ensure the screen updates before the prompt appears.
			await b8.Async.wait( 0.333 );

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

} )( b8 );
