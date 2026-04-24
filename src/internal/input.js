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
	 * Maps physical keys to their BeepMini aliases.
	 *
	 * @type {Object<string, string[]>}
	 */
	const KEY_ALIASES_ = {
		W: [ "W", "ArrowUp" ],
		A: [ "A", "ArrowLeft" ],
		S: [ "S", "ArrowDown" ],
		D: [ "D", "ArrowRight" ],
		ENTER: [ "Enter", "Escape" ],
		Z: [ "Z", "ButtonA" ],
		N: [ "N", "ButtonA" ],
		X: [ "X", "ButtonB" ],
		M: [ "M", "ButtonB" ],
		' ': [ " ", "Space" ],
	};


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
	let contexts_ = [ createDefaultContext_() ];


	/**
	 * ─────────────────────────────────────────────────────────────
	 * Pointer Input (Mouse / Touch / Pen)
	 * ─────────────────────────────────────────────────────────────
	 *
	 * BeepMini uses Pointer Events to unify mouse, touch, and pen
	 * input into a single system.
	 *
	 * Pointer state is tracked per-frame and exposed through a
	 * simple polling API, similar to keyboard input.
	 *
	 * ─────────────────────────────────────────────────────────────
	 * Core Concepts
	 * ─────────────────────────────────────────────────────────────
	 *
	 * • pointer_.x / pointer_.y
	 *   - Position of the pointer in canvas pixel space.
	 *
	 * • pointer_.isDown
	 *   - Whether the pointer is currently held down.
	 *
	 * • pointer_.justPressed
	 *   - True only on the frame the pointer was pressed.
	 *
	 * • pointer_.justReleased
	 *   - True only on the frame the pointer was released.
	 *
	 * These flags are automatically reset at the end of each frame.
	 *
	 * ─────────────────────────────────────────────────────────────
	 * Why this exists
	 * ─────────────────────────────────────────────────────────────
	 *
	 * Immediate-mode UI (buttons, regions, etc.) requires knowing
	 * when a pointer interaction starts and ends within a single
	 * frame window.
	 *
	 * This system provides a minimal, consistent API that works for:
	 *   - Mouse clicks
	 *   - Touch taps
	 *   - Stylus input
	 *
	 * Without requiring separate code paths.
	 *
	 * ─────────────────────────────────────────────────────────────
	 */


	/**
	 * Internal pointer state.
	 * This is updated via pointer events and reset per frame.
	 *
	 * @type {{x: number, y: number, justPressed: boolean, justReleased: boolean}}
	 */
	let pointer_ = createPointerState_();


	/**
	 * Gets the pointer X position in canvas pixels.
	 *
	 * @returns {number}
	 */
	b8.Input.pointerX = function() {
		return pointer_.x;
	}


	/**
	 * Gets the pointer Y position in canvas pixels.
	 *
	 * @returns {number}
	 */
	b8.Input.pointerY = function() {
		return pointer_.y;
	}


	/**
	 * Checks if the pointer was pressed this frame.
	 *
	 * @returns {boolean}
	 */
	b8.Input.pointerJustPressed = function() {
		return pointer_.justPressed;
	}


	/**
	 * Checks if the pointer was released this frame.
	 *
	 * @returns {boolean}
	 */
	b8.Input.pointerJustReleased = function() {
		return pointer_.justReleased;
	}


	/**
	 * Gets the pointer position in tile coordinates.
	 *
	 * @returns {{col: number, row: number}}
	 */
	b8.Input.pointerTile = function() {

		return {
			col: Math.floor( pointer_.x / b8.CONFIG.CHR_WIDTH ),
			row: Math.floor( pointer_.y / b8.CONFIG.CHR_HEIGHT ),
		};

	}


	/**
	 * Pushes a new input context onto the stack.
	 *
	 * @param {string} name - The name of the context.
	 * @param {Object} [opts={}] - Options for the context.
	 * @param {boolean} [opts.capture=false] - If true, gameplay polling is blocked.
	 * @param {boolean} [opts.passthrough=false] - If true, allows gameplay justPressed events even when capturing.
	 */
	b8.Input.pushContext = function( name, opts = {} ) {

		contexts_.push(
			{
				name,
				capture: !!opts.capture, // if true, gameplay polling should be blocked
				passthrough: opts.passthrough ?? false, // if true, still allow gameplay justPressed
				queue: [],
			}
		);

	}


	/**
	 * Pops the most recent input context from the stack.
	 *
	 * Ensures that at least one context (the default "game" context) remains on the stack.
	 */
	b8.Input.popContext = function() {

		if ( contexts_.length > 1 ) contexts_.pop();

	}


	/**
	 * Executes a function within a temporary input context.
	 *
	 * Pushes a new context, runs the provided function, and then pops the context.
	 *
	 * @param {string} name - The name of the temporary context.
	 * @param {Object} opts - Options for the context.
	 * @param {Function} fn - The function to execute within the context.
	 * @returns {Promise<any>} The result of the executed function.
	 */
	b8.Input.withContext = async function( name, opts, fn ) {

		b8.Input.pushContext( name, opts );
		try {
			return await fn();
		} finally {
			b8.Input.popContext();
		}

	}


	/**
	 * Resets the input state, clearing all held and just pressed keys.
	 * This is useful when restarting a game or resetting input state.
	 *
	 * @returns {void}
	 */
	b8.Input.reset = function() {


		keysHeldRaw_ = new Set();
		gameJustPressed_ = new Set();
		contexts_ = [ createDefaultContext_() ];
		pointer_ = createPointerState_();

		unbindEvents_();
		b8.Input.onEndFrame();

	}


	/**
	 * Initializes the input system.
	 *
	 * @returns {void}
	 */
	b8.Input.init = function() {

		b8.Input.reset();
		bindEvents_();

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

		pointer_.justPressed = false;
		pointer_.justReleased = false;

	}


	/**
	 * Handles keydown events, adding the key to the just pressed and held sets.
	 * Resolves any pending asynchronous key events.
	 *
	 * @param {KeyboardEvent} e The event object.
	 * @returns {void}
	 */
	b8.Input.onKeyDown = function( e ) {

		const keys = b8.Input.getKeys( e.key );
		const ctx = active_();

		preventDefaultKeyBehaviour_( e );
		addKeysToSet_( keysHeldRaw_, keys );

		if ( !ctx.capture || ctx.passthrough ) {
			addKeysToSet_( gameJustPressed_, keys );
		}

		if ( ctx.capture ) {
			ctx.queue.push( keys );

			if ( b8.Core.hasPendingAsync( "b8.Async.key" ) ) {
				b8.Core.resolveAsync( "b8.Async.key", ctx.queue.shift() );
			}

			return;
		}

		if ( b8.Core.hasPendingAsync( "b8.Async.key" ) ) {
			b8.Core.resolveAsync( "b8.Async.key", keys );
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

		removeKeysFromSet_( keysHeldRaw_, b8.Input.getKeys( e.key ) );

	}


	/**
	 * Reads a key asynchronously. Returns a promise that resolves to the key that was pressed.
	 *
	 * Async key reads always pull from the active context. This prevents async input from racing gameplay polling.
	 *
	 * Resolves with the full logical key list for the next key event.
	 *
	 * @returns {Promise<string[]>} A promise that resolves to the pressed key aliases.
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
	 * For example, pressing "W" also maps to "ArrowUp".
	 *
	 * @param {string} key The key to get aliases for.
	 * @returns {string[]} An array of key names.
	 */
	b8.Input.getKeys = function( key ) {

		return KEY_ALIASES_[ key.toUpperCase() ] || [ key ];

	}


	/**
	 * Handles pointer down events.
	 *
	 * Marks the pointer as pressed and updates position.
	 *
	 * @param {PointerEvent} e
	 */
	b8.Input.onPointerDown = function( e ) {

		const pos = b8.Core.clientToCanvas( e.clientX, e.clientY );

		pointer_.x = pos.x;
		pointer_.y = pos.y;
		pointer_.pressX = pos.x;
		pointer_.pressY = pos.y;
		pointer_.isDown = true;
		pointer_.justPressed = true;

		b8.Core.realCanvas.setPointerCapture( e.pointerId );

		if ( b8.Core.hasPendingAsync( "b8.Async.pointer" ) ) {
			b8.Core.resolveAsync( "b8.Async.pointer", pos );
		}

	}


	/**
	 * Handles pointer up events.
	 *
	 * Marks the pointer as released.
	 *
	 * @param {PointerEvent} e
	 */
	b8.Input.onPointerUp = function( e ) {

		const pos = b8.Core.clientToCanvas( e.clientX, e.clientY );

		pointer_.x = pos.x;
		pointer_.y = pos.y;
		pointer_.isDown = false;
		pointer_.justReleased = true;

		pointer_.tapX = pos.x;
		pointer_.tapY = pos.y;

	}


	/**
	 * Handles pointer move events, updating the pointer position.
	 *
	 * This is used for hover states and dragging, but does not trigger any immediate-mode UI interactions on its own.
	 *
	 * @param {PointerEvent} e
	 * @return {void}
	 */
	b8.Input.onPointerMove = function( e ) {

		const pos = b8.Core.clientToCanvas( e.clientX, e.clientY );
		pointer_.x = pos.x;
		pointer_.y = pos.y;

	}


	/**
	 * Resets the game input state. This is useful when restarting a level or resetting the game.
	 *
	 * This clears all held keys, just pressed keys, and pointer state.
	 *
	 * @returns {void}
	 */
	b8.Input.onPointerCancel = function() {

		pointer_.isDown = false;
		pointer_.justPressed = false;
		pointer_.justReleased = false;

	}


	/**
	 * Checks if the pointer is currently held down.
	 *
	 * @returns {boolean} True if the pointer is held down, false otherwise.
	 */
	b8.Input.pointerHeld = function() {

		return !!pointer_.isDown;

	}


	/**
	 * Checks if there is a pending tap (pointer down and up) that has not yet
	 * been consumed.
	 *
	 * This is used for immediate-mode UI interactions, where a tap should
	 * trigger a button or region only once.
	 *
	 * @returns {boolean} True if there is a pending tap, false otherwise.
	 */
	b8.Input.hasTap = function() {

		return pointer_.tapX !== null && pointer_.tapY !== null;

	}


	/**
	 * Gets the tile coordinates of the pending tap, if any. Returns null if
	 * there is no pending tap.
	 *
	 * This is used for immediate-mode UI interactions, where a tap should
	 * trigger a button or region only once.
	 *
	 * @returns {{col: number, row: number} | null} The tile coordinates of the tap, or null if there is no tap.
	 */
	b8.Input.tapTile = function() {
		if ( pointer_.tapX === null || pointer_.tapY === null ) return null;

		return {
			col: Math.floor( pointer_.tapX / b8.CONFIG.CHR_WIDTH ),
			row: Math.floor( pointer_.tapY / b8.CONFIG.CHR_HEIGHT ),
		};
	}


	/**
	 * Consumes the pending tap, if any, so that it does not trigger multiple UI interactions.
	 *
	 * This should be called after handling a tap to ensure that the same tap does not trigger multiple buttons or regions.
	 *
	 * @returns {void}
	 */
	b8.Input.consumeTap = function() {

		pointer_.tapX = null;
		pointer_.tapY = null;

	}


	/**
	 * Reads a line of text asynchronously.
	 * Handles user input to build a string until the Enter key is pressed.
	 *
	 * readLine runs inside a capture context so that gameplay input is fully suspended while typing.
	 *
	 * @param {string} [prompt='Enter text:'] Prompt text to display.
	 * @param {string} [initString=''] Initial input value.
	 * @param {number} [maxLen=100] Maximum allowed length.
	 * @param {number} [maxWidth=-1] Maximum width before wrapping.
	 * @returns {Promise<string>} A promise that resolves to the entered text.
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


	/**
	 * Creates the default gameplay input context.
	 *
	 * @returns {{name: string, capture: boolean, passthrough: boolean, queue: Array}}
	 */
	function createDefaultContext_() {

		return {
			name: "game",
			capture: false,
			passthrough: true,
			queue: [],
		};

	}


	/**
	 * Creates the default pointer state.
	 *
	 * @returns {{
	 * 	x: number,
	 * 	y: number,
	 * 	isDown: boolean,
	 * 	justPressed: boolean,
	 * 	justReleased: boolean,
	 * 	pressX: number,
	 * 	pressY: number,
	 * 	tapX: ?number,
	 * 	tapY: ?number
	 * }}
	 */
	function createPointerState_() {

		return {
			x: 0,
			y: 0,
			isDown: false,
			justPressed: false,
			justReleased: false,
			pressX: 0,
			pressY: 0,
			tapX: null,
			tapY: null,
		};

	}


	/**
	 * Binds keyboard and pointer event listeners.
	 *
	 * @returns {void}
	 */
	function bindEvents_() {

		window.addEventListener( "keydown", b8.Input.onKeyDown );
		window.addEventListener( "keyup", b8.Input.onKeyUp );

		const canvas = b8.Core.realCanvas;
		canvas?.addEventListener( "pointerdown", b8.Input.onPointerDown );
		canvas?.addEventListener( "pointerup", b8.Input.onPointerUp );
		canvas?.addEventListener( "pointermove", b8.Input.onPointerMove );
		canvas?.addEventListener( "pointercancel", b8.Input.onPointerCancel );

	}


	/**
	 * Unbinds keyboard and pointer event listeners.
	 *
	 * @returns {void}
	 */
	function unbindEvents_() {

		window.removeEventListener( "keydown", b8.Input.onKeyDown );
		window.removeEventListener( "keyup", b8.Input.onKeyUp );

		const canvas = b8.Core.realCanvas;
		canvas?.removeEventListener( "pointerdown", b8.Input.onPointerDown );
		canvas?.removeEventListener( "pointerup", b8.Input.onPointerUp );
		canvas?.removeEventListener( "pointermove", b8.Input.onPointerMove );
		canvas?.removeEventListener( "pointercancel", b8.Input.onPointerCancel );

	}


	/**
	 * Adds a list of keys to a Set, normalising them to upper case.
	 *
	 * @param {Set<string>} set The target set.
	 * @param {string[]} keys The keys to add.
	 * @returns {void}
	 */
	function addKeysToSet_( set, keys ) {

		for ( const key of keys ) {
			set.add( key.toUpperCase() );
		}

	}


	/**
	 * Removes a list of keys from a Set, normalising them to upper case.
	 *
	 * @param {Set<string>} set The target set.
	 * @param {string[]} keys The keys to remove.
	 * @returns {void}
	 */
	function removeKeysFromSet_( set, keys ) {

		for ( const key of keys ) {
			set.delete( key.toUpperCase() );
		}

	}


	/**
	 * Prevents browser defaults for keys that should stay under game control.
	 *
	 * @param {KeyboardEvent} e The keyboard event.
	 * @returns {void}
	 */
	function preventDefaultKeyBehaviour_( e ) {

		if ( [ "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " " ].includes( e.key ) ) {
			e.preventDefault();
		}

	}


} )( b8 );
