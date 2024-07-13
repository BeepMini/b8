( function( beep8 ) {


	let textRenderer = null;

	/**
	 * Initialize the text renderer
	 *
	 * @returns {void}
	 */
	function initTextRenderer() {

		textRenderer = new beep8.TextRenderer();

	}


	/**
	 * Get the text renderer
	 *
	 * @returns {beep8.TextRenderer} The text renderer.
	 */
	function getTextRenderer() {

		return textRenderer;

	}


	/**
	 * Set a new text renderer
	 *
	 * @param {beep8.TextRenderer} renderer - The new text renderer.
	 * @returns {void}
	 */
	function setTextRenderer( renderer ) {

		textRenderer = renderer;

	}


	/**
	 * ASYNC API FUNCTIONS
	 * These functions must be called with 'await'.
	 * For example:
	 *
	 * const k = await beep8a.key();
	 * console.log("The user pressed " + k);
	 */


	/**
	 * Waits until the user presses a key and returns it.
	 *
	 * @returns {Promise<string>} The name of the key that was pressed.
	 */
	async function key() {

		beep8.Core.preflight( "beep8a.key" );

		return await beep8.Core.inputSys.readKeyAsync();
	}


	/**
	 * Waits until the user inputs a line of text, then returns it.
	 *
	 * @param {string} [initString=""] - The initial string presented for the user to edit.
	 * @param {number} [maxLen=-1] - The maximum length of the string the user can type. -1 means no limit.
	 * @param {number} [maxWidth=-1] - The maximum width of the input line in characters. -1 means no wrapping.
	 * @returns {Promise<string>} The input text.
	 */
	async function readLine( initString = "", maxLen = -1, maxWidth = -1 ) {

		beep8.Core.preflight( "readLine" );
		beep8.Utilities.checkString( "initString", initString );
		beep8.Utilities.checkNumber( "maxLen", maxLen );

		return await beep8.Core.inputSys.readLine( initString, maxLen, maxWidth );

	}


	/**
	 * Shows a menu of choices and waits for the user to pick an option.
	 *
	 * @param {string[]} choices - An array of choices.
	 * @param {Object} [options={}] - Additional options for the menu.
	 * @returns {Promise<number>} The index of the selected item or -1 if canceled.
	 */
	async function menu( choices, options = {} ) {

		beep8.Core.preflight( "menu" );
		beep8.Utilities.checkArray( "choices", choices );
		beep8.Utilities.checkObject( "options", options );

		return await menuMod.menu( choices, options );

	}


	/**
	 * Displays a dialog with the given prompt and choices.
	 *
	 * @param {string} prompt - The text to show.
	 * @param {string[]} [choices=["OK"]] - The choices to present to the user.
	 * @returns {Promise<number>} The index of the selected item.
	 */
	async function dialog( prompt, choices = [ "OK" ] ) {

		beep8.Core.preflight( "dialog" );
		beep8.Utilities.checkString( "prompt", prompt );
		beep8.Utilities.checkArray( "choices", choices );

		return menu( choices, { prompt, center: true } );

	}


	/**
	 * Waits for a given number of seconds.
	 *
	 * @param {number} seconds - The duration to wait.
	 * @returns {Promise<void>} Resolves after the specified time.
	 */
	async function wait( seconds ) {

		beep8.Core.preflight( "wait" );
		beep8.Utilities.checkNumber( "seconds", seconds );
		beep8.render();
		await new Promise( resolve => setTimeout( resolve, Math.round( seconds * 1000 ) ) );

	}


	/**
	 * Shows text slowly, character by character, as in a typewriter.
	 *
	 * @param {string} text - The text to print.
	 * @param {number} [delay=0.05] - The delay between characters in seconds.
	 * @returns {Promise<void>} Resolves after the text is printed.
	 */
	async function typewriter( text, delay = 0.05 ) {

		beep8.Core.preflight( "typewriter" );
		beep8.Utilities.checkString( "text", text );
		beep8.Utilities.checkNumber( "delay", delay );

		const startCol = beep8.col();
		const startRow = beep8.row();

		for ( let i = 0; i <= text.length; i++ ) {

			// If this is the start of an escape sequence, skip to the end of it.
			if (
				beep8.CONFIG.PRINT_ESCAPE_START &&
				text.substring( i, i + beep8.CONFIG.PRINT_ESCAPE_START.length ) === beep8.CONFIG.PRINT_ESCAPE_START
			) {
				const endPos = text.indexOf( beep8.CONFIG.PRINT_ESCAPE_END, i + beep8.CONFIG.PRINT_ESCAPE_START.length );
				if ( endPos >= 0 ) i = endPos + beep8.CONFIG.PRINT_ESCAPE_END.length;
			}

			const c = text.charCodeAt( i );
			beep8.locate( startCol, startRow );
			beep8.print( text.substring( 0, i ) );

			if ( c !== 32 ) await wait( delay );

		}

	}


	/**
	 * Loads an image from the given URL.
	 *
	 * @param {string} url - The URL of the image.
	 * @returns {Promise<HTMLImageElement>} The loaded image.
	 */
	async function loadImage( url ) {

		beep8.Core.preflight( "loadImage" );

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
	async function loadSound( url ) {

		beep8.Core.preflight( "loadSound" );

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
	async function loadFont( fontImageFile ) {

		beep8.Core.preflight( "loadFont" );
		beep8.Utilities.checkString( "fontImageFile", fontImageFile );
		const fontName = "FONT@" + fontImageFile;
		await beep8.Core.textRenderer.loadFontAsync( fontName, fontImageFile );

		return fontName;

	}


	beep8.async = {
		initTextRenderer,
		getTextRenderer,
		setTextRenderer,
		key,
		readLine,
		menu,
		dialog,
		wait,
		typewriter,
		loadImage,
		loadSound,
		loadFont,
	};

} )( beep8 || ( beep8 = {} ) );
