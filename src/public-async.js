( function( beep8 ) {

	/**
	 * ASYNC API FUNCTIONS
	 * These functions must be called with 'await'.
	 * For example:
	 *
	 * const k = await beep8.Async.key();
	 * console.log("The user pressed " + k);
	 */

	beep8.Async = {};


	/**
	 * Waits until the user presses a key and returns it.
	 *
	 * @returns {Promise<string>} The name of the key that was pressed.
	 */
	beep8.Async.key = async function() {

		beep8.Core.preflight( "beep8.Async.key" );

		return await beep8.Input.readKeyAsync();

	}


	/**
	 * Waits until the user clicks/ taps the pointer and returns its position.
	 *
	 * @returns {Promise<{x: number, y: number}>} The pointer position.
	 */
	beep8.Async.pointer = async function() {

		beep8.Core.preflight( "beep8.Async.pointer" );

		return await beep8.Input.readPointerAsync();

	}


	/**
	 * Waits until the user inputs a line of text, then returns it.
	 *
	 * @param {string} [initString=""] - The initial string presented for the user to edit.
	 * @param {number} [maxLen=-1] - The maximum length of the string the user can type. -1 means no limit.
	 * @param {number} [maxWidth=-1] - The maximum width of the input line in characters. -1 means no wrapping.
	 * @returns {Promise<string>} The input text.
	 */
	beep8.Async.readLine = async function( initString = "", maxLen = -1, maxWidth = -1 ) {

		beep8.Core.preflight( "beep8.Async.readLine" );

		beep8.Utilities.checkString( "initString", initString );
		beep8.Utilities.checkNumber( "maxLen", maxLen );

		return await beep8.Input.readLine( initString, maxLen, maxWidth );

	}


	/**
	 * Shows a menu of choices and waits for the user to pick an option.
	 *
	 * @param {string[]} choices - An array of choices.
	 * @param {Object} [options={}] - Additional options for the menu.
	 * @returns {Promise<number>} The index of the selected item or -1 if canceled.
	 */
	beep8.Async.menu = async function( choices, options = {} ) {

		beep8.Core.preflight( "beep8.Async.menu" );

		beep8.Utilities.checkArray( "choices", choices );
		beep8.Utilities.checkObject( "options", options );

		return await beep8.Menu.display( choices, options );

	}


	/**
	 * Displays a dialog with the given prompt and choices.
	 *
	 * This allows shows a user the prompt and waits for them to select a choice.
	 * You can use this for information (with an 'ok' response) or for multiple
	 * choice answers.
	 *
	 * @param {string} prompt - The text to show.
	 * @param {string[]} [choices=["OK"]] - The choices to present to the user.
	 * @returns {Promise<number>} The index of the selected item.
	 */
	beep8.Async.dialog = async function( prompt, choices = [ "OK" ] ) {

		beep8.Core.preflight( "beep8.Async.dialog" );

		beep8.Utilities.checkString( "prompt", prompt );
		beep8.Utilities.checkArray( "choices", choices );

		return beep8.Async.menu( choices, { prompt, center: true } );

	}


	beep8.Async.dialogTypewriter = async function( prompt, choices = [ "OK" ], wrapWidth = -1, delay = 0.05 ) {

		beep8.Core.preflight( "beep8.Async.dialogTypewriter" );

		beep8.Utilities.checkString( "prompt", prompt );
		beep8.Utilities.checkArray( "choices", choices );
		beep8.Utilities.checkNumber( "delay", delay );

		if ( wrapWidth > 0 ) {
			prompt = beep8.TextRenderer.wrapText( prompt, wrapWidth );
		}

		return await beep8.Async.menu( choices, { prompt, typewriter: true } );

	}


	/**
	 * Shows text slowly, character by character, as in a typewriter.
	 *
	 * @param {string} text - The text to print.
	 * @param {number} [delay=0.05] - The delay between characters in seconds.
	 * @returns {Promise<void>} Resolves after the text is printed.
	 */
	beep8.Async.typewriter = async function( text, wrapWidth = -1, delay = 0.05, fontId = null, ) {

		beep8.Core.preflight( "beep8.Async.typewriter" );

		beep8.Utilities.checkString( "text", text );
		beep8.Utilities.checkNumber( "wrapWidth", wrapWidth );
		beep8.Utilities.checkNumber( "delay", delay );

		let font = fontId;
		if ( null !== font ) {
			beep8.Utilities.checkString( "fontId", fontId );
			font = beep8.TextRenderer.getFontByName( fontId );
		}

		await beep8.TextRenderer.printTypewriter( text, wrapWidth, delay, font );

	}


	/**
	 * Loads an image from the given URL.
	 *
	 * @param {string} url - The URL of the image.
	 * @returns {Promise<HTMLImageElement>} The loaded image.
	 */
	beep8.Async.loadImage = async function( url ) {

		beep8.Core.preflight( "beep8.Async.loadImage" );

		return new Promise(
			( resolve ) => {
				const img = new Image();
				img.onload = () => resolve( img );
				img.src = url;
			}
		);

	}


	/**
	 * Loads a sound file from the given URL.
	 *
	 * @param {string} url - The URL of the sound file.
	 * @returns {Promise<HTMLAudioElement>} The loaded sound.
	 */
	beep8.Async.loadSound = async function( url ) {

		beep8.Core.preflight( "beep8.Async.loadSound" );

		return new Promise(
			( resolve ) => {

				const audio = new Audio();
				audio.oncanplaythrough = () => resolve( audio );
				audio.src = url;
				audio.load();

			}
		);

	}


	/**
	 * Loads a font for later use in drawing text.
	 *
	 * @param {string} fontImageFile - The URL of the font image file.
	 * @returns {Promise<string>} The font ID.
	 */
	beep8.Async.loadFont = async function( fontImageFile, tileSizeMultiplier = 1 ) {

		beep8.Core.preflight( "beep8.Async.loadFont" );

		beep8.Utilities.checkString( "fontImageFile", fontImageFile );

		const fontName = "FONT@" + beep8.Utilities.makeUrlPretty( fontImageFile );
		await beep8.TextRenderer.loadFontAsync( fontName, fontImageFile, tileSizeMultiplier );

		return fontName;

	}


	/**
	 * Waits for a given number of seconds and then continues execution.
	 *
	 * @param {number} seconds - The duration to wait.
	 * @returns {Promise<void>} Resolves after the specified time.
	 */
	beep8.Async.wait = async function( seconds ) {

		beep8.Core.preflight( "beep8.Async.wait" );

		beep8.Utilities.checkNumber( "seconds", seconds );
		beep8.Renderer.render();

		return await new Promise( resolve => setTimeout( resolve, Math.round( seconds * 1000 ) ) );

	}


	/**
	 * Waits for the user to press a key to continue.
	 *
	 * @returns {Promise<void>} Resolves when the user presses a key.
	 */
	beep8.Async.waitForContinue = async function() {

		while ( true ) {
			const key = await beep8.Async.key();
			if ( key.includes( "Enter" ) || key.includes( "ButtonA" ) ) break;
		}

	}


} )( beep8 || ( beep8 = {} ) );
