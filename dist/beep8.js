/*!
 * beep8.js - A Retro Game Library
 *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 * ░       ░░        ░        ░       ░░░      ░░░░░        ░░      ░░
 * ▒  ▒▒▒▒  ▒  ▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒  ▒▒▒▒  ▒   ▒▒   ▒▒▒▒▒▒▒▒▒▒  ▒  ▒▒▒▒▒▒▒
 * ▓       ▓▓      ▓▓▓      ▓▓▓       ▓▓▓      ▓▓▓▓▓▓▓▓▓▓▓  ▓▓      ▓▓
 * █  ████  █  ███████  ███████  ███████   ██   ████  ████  ███████  █
 * █       ██        █        █  ████████      ██  ██      ███      ██
 * ███████████████████████████████████████████████████████████████████
 *
 * beep8.js is a retro game library designed to bring
 * the charm and simplicity of classic games to modern
 * web development. A fork of qx82, beep8.js retains
 * the original's elegance while enhancing its features
 * for today's developers.
 *
 * MIT License
 *
 * Copyright (c) 2024 BinaryMoon
 *
 * Permission is hereby granted, free of charge, to any
 * person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the
 * Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall
 * be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const beep8 = {};



( function( beep8 ) {

	beep8.CONFIG = {
		// Enable debug?
		DEBUG: true,
		// Canvas settings
		CANVAS_SETTINGS: {
			// The ID to assign to the beep8 canvas.
			CANVAS_ID: "beep8-canvas",
			// If set, these CSS classes will be added to the beep8 canvas.
			// This is an array of strings, each of which is a class name (without the "."),
			// for example: [ "foo", "bar", "qux" ]
			CANVAS_CLASSES: [],
			// If this is true, then we will automatically position the canvas using absolute positioning
			// to ensure it's centered on the viewport and it's the right size.
			// If this is false, then you are responsible for positioning the canvas to your liking.
			AUTO_POSITION: true,
			// If this is true, we will resize the canvas automatically to match the screen. If false,
			// you're responsible for sizing the canvas to your liking.
			// NOTE: If you are using 2D mode (THREE_SETTINGS is null) and have AUTO_SIZE set to false,
			// you probably want to specify a fixed scale in SCREEN_SCALE rather than "auto", so you
			// have control over how large the canvas will be.
			AUTO_SIZE: true,
			// If this is not null, then this is the element under which to create the rendering canvas.
			// This can be the ID of an HTML element, or an HTMLElement reference.
			CONTAINER: null,
		},
		// Background color to fill the space not used by the screen.
		// For best results this should be the same as the page's background.
		BG_COLOR: "#000",
		// Characters file
		CHR_FILE: "assets/chr.png",
		// Character size. The characters file's width must be
		// 16 * CHR_WIDTH and the height must be 16 * CHR_HEIGHT.
		CHR_WIDTH: 8,
		CHR_HEIGHT: 8,
		// Screen width and height in characters.
		SCREEN_ROWS: 24,
		SCREEN_COLS: 32,
		// Pixel scale (magnification). Can be "auto" or an int >= 1.
		// If this is "auto", we'll automatically compute this to be the maximum possible size
		// for the current screen size.
		// NOTE: This setting is only used for 2D style (if THREE_SETTINGS is null).
		SCREEN_SCALE: "auto",
		// Maximum fraction of the screen to occupy with the canvas.
		// NOTE: This setting is only used for 2D style (if THREE_SETTINGS is null).
		MAX_SCREEN_FRACTION: 0.95,
		// If set, this is the opacity of the "scan lines" effect.
		// If 0 or not set, don't show scan lines.
		SCAN_LINES_OPACITY: 0.1,
		// Color palette. This can be as many colors as you want, but each color requires us to
		// store a scaled copy of the characters image in memory, so more colors = more memory.
		// You can redefine the colors at runtime with beep8.redefineColors.
		COLORS: [
			"#000", "#00A", "#A00", "#A0A", "#0A0", "#0AA", "#AA0", "#DDD",
			"#666", "#00F", "#F00", "#F0F", "#0F0", "#0FF", "#FF0", "#FFF"
		],
		// If this is not null, then we will display a virtual joystick if the user
		// is on a mobile device.
		TOUCH_VJOY: true,
		// Cursor config:
		CURSOR: {
			// Cursor width, as a fraction of the character width (0 to 1)
			WIDTH_F: 0.8,
			// Cursor height, as a fraction of the character height (0 to 1)
			HEIGHT_F: 0.8,
			// Blink interval in millis.
			BLINK_INTERVAL: 400,
			// Cursor offset (as fraction of, respectively, char width and height). Tweak these if
			// you want to adjust the positioning of the cursor.
			OFFSET_V: 0.1,
			OFFSET_H: 0,
		},
		// If set, then special escape sequences can be used when printing (to set colors, etc).
		// These are the sequences that starts and end an escape sequence. See the documentation for
		// beep8.print() for more info on escape sequences.
		// If you don't want this, comment out these line, or set them to null.
		PRINT_ESCAPE_START: "{{",
		PRINT_ESCAPE_END: "}}",
	};

} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	/**
	 * Initializes the API. This must be called before other functions and must finish executing before other API functions are called.
	 * Once the supplied callback is called, you can start using beep8 functions.
	 *
	 * @param {Function} callback - The callback to call when initialization is done.
	 * @returns {void}
	 */
	beep8.init = function( callback ) {

		return beep8.Core.init( callback );

	}


	/**
	 * Sets the frame handler, that is, the function that will be called on every frame to render the screen.
	 *
	 * @param {Function} handler - The frame handler function.
	 * @param {number} [fps=30] - The target frames per second. Recommended: 30.
	 * @returns {void}
	 */
	beep8.frame = function( handler, fps = 30 ) {

		beep8.Core.preflight( "beep8.frame" );

		if ( handler !== null ) {
			beep8.Utilities.checkFunction( "handler", handler );
		}

		beep8.Utilities.checkNumber( "fps", fps );

		return beep8.Core.setFrameHandler( handler, fps );

	}


	/**
	 * Forces the screen to render right now. Useful for immediate redraw in animations.
	 *
	 * @returns {void}
	 */
	beep8.render = function() {

		beep8.Core.preflight( "beep8.render" );

		return beep8.Core.render();

	}


	/**
	 * Sets the foreground and/or background color.
	 *
	 * @param {number} fg - The foreground color.
	 * @param {number} [bg] - The background color (optional).
	 * @returns {void}
	 */
	beep8.color = function( fg, bg ) {

		beep8.Core.preflight( "beep8.color" );
		beep8.Utilities.checkNumber( "fg", fg );

		if ( bg !== undefined ) {
			beep8.Utilities.checkNumber( "bg", bg );
		}

		beep8.Core.setColor( fg, bg );

	}


	/**
	 * Gets the current foreground color.
	 *
	 * @returns {number} The current foreground color.
	 */
	beep8.getFgColor = function() {

		beep8.Core.preflight( "getFgColor" );

		return beep8.Core.drawState.fgColor;

	}


	/**
	 * Gets the current background color. -1 means transparent.
	 *
	 * @returns {number} The current background color.
	 */
	beep8.getBgColor = function() {

		beep8.Core.preflight( "getBgColor" );

		return beep8.Core.drawState.bgColor;

	}


	/**
	 * Clears the screen using the current background color.
	 *
	 * @returns {void}
	 */
	beep8.cls = function() {

		beep8.Core.preflight( "beep8.cls" );
		beep8.Core.cls();

	}


	/**
	 * Places the cursor at the given screen column and row.
	 *
	 * @param {number} col - The column where the cursor is to be placed.
	 * @param {number} [row] - The row where the cursor is to be placed (optional).
	 * @returns {void}
	 */
	beep8.locate = function( col, row ) {

		beep8.Core.preflight( "beep8.locate" );
		beep8.Utilities.checkNumber( "col", col );

		if ( row !== undefined ) {
			beep8.Utilities.checkNumber( "row", row );
		}

		beep8.Core.setCursorLocation( col, row );

	}

	/**
	 * Returns the cursor's current column.
	 *
	 * @returns {number} The cursor's current column.
	 */
	beep8.col = function() {

		beep8.Core.preflight( "col" );

		return beep8.Core.drawState.cursorCol;

	}


	/**
	 * Returns the cursor's current row.
	 *
	 * @returns {number} The cursor's current row.
	 */
	beep8.row = function() {

		beep8.Core.preflight( "row" );

		return beep8.Core.drawState.cursorRow;

	}


	/**
	 * Shows or hides the cursor.
	 *
	 * @param {boolean} visible - If true, show the cursor. If false, hide the cursor.
	 * @returns {void}
	 */
	beep8.cursor = function( visible ) {

		beep8.Core.preflight( "cursor" );
		beep8.Utilities.checkBoolean( "visible", visible );
		beep8.Core.cursorRenderer.setCursorVisible( visible );

	}

	/**
	 * Prints text at the cursor position, using the current foreground and background colors.
	 *
	 * @param {string} text - The text to print.
	 * @returns {void}
	 */
	beep8.print = function( text ) {

		beep8.Core.preflight( "beep8.text" );
		beep8.Utilities.checkString( "text", text );
		beep8.Core.textRenderer.print( text );

	}


	/**
	 * Prints text centered horizontally in a field of the given width.
	 *
	 * @param {string} text - The text to print.
	 * @param {number} width - The width of the field, in characters.
	 * @returns {void}
	 */
	beep8.printCentered = function( text, width ) {

		beep8.Core.preflight( "beep8.printCentered" );
		beep8.Utilities.checkString( "text", text );
		beep8.Utilities.checkNumber( "width", width );
		beep8.Core.textRenderer.printCentered( text, width );

	}


	/**
	 * Draws text at an arbitrary pixel position on the screen, not following the "row and column" system.
	 *
	 * @param {number} x - The X coordinate of the top-left of the text.
	 * @param {number} y - The Y coordinate of the top-left of the text.
	 * @param {string} text - The text to print.
	 * @param {string} [fontId=null] - The font ID to use.
	 * @returns {void}
	 */
	beep8.drawText = function( x, y, text, fontId = null ) {

		beep8.Core.preflight( "beep8.drawText" );
		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		beep8.Utilities.checkString( "text", text );

		if ( fontId ) {
			beep8.Utilities.checkString( "fontId", fontId );
		}

		beep8.Core.textRenderer.drawText( x, y, text, fontId );

	}


	/**
	 * Measures the size of the given text without printing it.
	 *
	 * @param {string} text - The text to measure.
	 * @returns {Object} An object with {cols, rows} indicating the dimensions.
	 */
	beep8.measure = function( text ) {

		beep8.Core.preflight( "measure" );
		beep8.Utilities.checkString( "text", text );

		return beep8.Core.textRenderer.measure( text );

	}


	/**
	 * Prints a character at the current cursor position, advancing the cursor position.
	 *
	 * @param {number|string} charCode - The character to print, as an integer (ASCII code) or a one-character string.
	 * @param {number} [numTimes=1] - How many times to print the character.
	 * @returns {void}
	 */
	beep8.printChar = function( charCode, numTimes = 1 ) {

		beep8.Core.preflight( "beep8.printChar" );
		charCode = convChar( charCode );
		beep8.Utilities.checkNumber( "charCode", charCode );
		beep8.Utilities.checkNumber( "numTimes", numTimes );
		beep8.Core.textRenderer.printChar( charCode, numTimes );

	}

	/**
	 * Prints a rectangle of the given size with the given character, starting at the current cursor position.
	 * @param {number} widthCols - Width of the rectangle in screen columns.
	 * @param {number} heightRows - Height of the rectangle in screen rows.
	 * @param {number|string} [charCode=32] - The character to print, as an integer (ASCII code) or a one-character string.
	 * @returns {void}
	 */
	beep8.printRect = function( widthCols, heightRows, charCode = 32 ) {

		beep8.Core.preflight( "beep8.printRect" );
		charCode = convChar( charCode );
		beep8.Utilities.checkNumber( "widthCols", widthCols );
		beep8.Utilities.checkNumber( "heightRows", heightRows );
		beep8.Utilities.checkNumber( "charCode", charCode );
		beep8.Core.textRenderer.printRect( widthCols, heightRows, charCode );

	}


	/**
	 * Prints a box of the given size starting at the cursor position, using border-drawing characters.
	 *
	 * @param {number} widthCols - Width of the box in screen columns, including the border.
	 * @param {number} heightRows - Height of the box in screen rows, including the border.
	 * @param {boolean} [fill=true] - If true, fill the interior with spaces.
	 * @param {number} [borderChar=0x80] - The first border-drawing character to use.
	 * @returns {void}
	 */
	beep8.printBox = function( widthCols, heightRows, fill = true, borderChar = 0x80 ) {

		beep8.Core.preflight( "beep8.printBox" );
		borderChar = convChar( borderChar );
		beep8.Utilities.checkNumber( "widthCols", widthCols );
		beep8.Utilities.checkNumber( "heightRows", heightRows );
		beep8.Utilities.checkBoolean( "fill", fill );
		beep8.Utilities.checkNumber( "borderChar", borderChar );
		beep8.Core.textRenderer.printBox( widthCols, heightRows, fill, borderChar );

	}


	/**
	 * Draws an image (previously loaded with beep8a.loadImage).
	 *
	 * @param {number} x - The X coordinate of the top-left of the image.
	 * @param {number} y - The Y coordinate of the top-left of the image.
	 * @param {HTMLImageElement} image - The image to draw.
	 * @returns {void}
	 */
	beep8.drawImage = function( x, y, image ) {

		beep8.Utilities.checkInstanceOf( "image", image, HTMLImageElement );
		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		beep8.Core.drawImage( image, x, y );

	}


	/**
	 * Draws a rectangular part of an image (previously loaded with beep8a.loadImage).
	 *
	 * @param {number} x - The X coordinate of the top-left of the image.
	 * @param {number} y - The Y coordinate of the top-left of the image.
	 * @param {HTMLImageElement} image - The image to draw.
	 * @param {number} srcX - The X coordinate of the top-left of the rectangle to be drawn.
	 * @param {number} srcY - The Y coordinate of the top-left of the rectangle to be drawn.
	 * @param {number} width - The width in pixels of the rectangle to be drawn.
	 * @param {number} height - The height in pixels of the rectangle to be drawn.
	 * @returns {void}
	 */
	beep8.drawImageRect = function( x, y, image, srcX, srcY, width, height ) {

		beep8.Utilities.checkInstanceOf( "image", image, HTMLImageElement );
		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		beep8.Utilities.checkNumber( "srcX", srcX );
		beep8.Utilities.checkNumber( "srcY", srcY );
		beep8.Utilities.checkNumber( "width", width );
		beep8.Utilities.checkNumber( "height", height );
		beep8.Core.drawImage( image, x, y, srcX, srcY, width, height );

	}


	/**
	 * Draws a rectangle (border only) using the current foreground color.
	 *
	 * @param {number} x - The X coordinate of the top-left corner.
	 * @param {number} y - The Y coordinate of the top-left corner.
	 * @param {number} width - The width of the rectangle in pixels.
	 * @param {number} height - The height of the rectangle in pixels.
	 * @returns {void}
	 */
	beep8.drawRect = function( x, y, width, height ) {

		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		beep8.Utilities.checkNumber( "width", width );
		beep8.Utilities.checkNumber( "height", height );
		beep8.Core.drawRect( x, y, width, height );

	}


	/**
	 * Draws a filled rectangle using the current foreground color.
	 *
	 * @param {number} x - The X coordinate of the top-left corner.
	 * @param {number} y - The Y coordinate of the top-left corner.
	 * @param {number} width - The width of the rectangle in pixels.
	 * @param {number} height - The height of the rectangle in pixels.
	 * @returns {void}
	 */
	beep8.fillRect = function( x, y, width, height ) {

		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		beep8.Utilities.checkNumber( "width", width );
		beep8.Utilities.checkNumber( "height", height );
		beep8.Core.fillRect( x, y, width, height );

	}


	/**
	 * Plays a sound (previously loaded with beep8a.playSound).
	 *
	 * @param {HTMLAudioElement} sfx - The sound to play.
	 * @param {number} [volume=1] - The volume to play the sound at.
	 * @param {boolean} [loop=false] - If true, play the sound in a loop.
	 * @returns {void}
	 */
	beep8.playSound = function( sfx, volume = 1, loop = false ) {

		beep8.Utilities.checkInstanceOf( "sfx", sfx, HTMLAudioElement );
		sfx.currentTime = 0;
		sfx.volume = volume;
		sfx.loop = loop;
		sfx.play();

	}


	/**
	 * Draws a sprite on the screen.
	 *
	 * @param {number|string} ch - The character code of the sprite.
	 * @param {number} x - The X position at which to draw.
	 * @param {number} y - The Y position at which to draw.
	 * @returns {void}
	 */
	beep8.spr = function( ch, x, y ) {

		ch = convChar( ch );
		beep8.Utilities.checkNumber( "ch", ch );
		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		beep8.Core.textRenderer.spr( ch, x, y );

	}


	/**
	 * Checks if the given key is currently pressed or not.
	 *
	 * @param {string} keyName - The name of the key.
	 * @returns {boolean} True if the key is pressed, otherwise false.
	 */
	beep8.key = function( keyName ) {

		beep8.Core.preflight( "beep8.key" );
		beep8.Utilities.checkString( "keyName", keyName );

		return beep8.Core.inputSys.keyHeld( keyName );

	}


	/**
	 * Checks if the given key was JUST pressed on this frame.
	 *
	 * @param {string} keyName - The name of the key.
	 * @returns {boolean} True if the key was just pressed, otherwise false.
	 */
	beep8.keyp = function( keyName ) {

		beep8.Core.preflight( "beep8.keyp" );
		beep8.Utilities.checkString( "keyName", keyName );

		return beep8.Core.inputSys.keyJustPressed( keyName );

	}


	/**
	 * Redefines the colors, assigning new RGB values to each color.
	 *
	 * @param {Array<number>} colors - An array of RGB values.
	 * @returns {void}
	 */
	beep8.redefineColors = function( colors ) {

		beep8.Core.preflight( "beep8.redefineColors" );
		beep8.Utilities.checkArray( "colors", colors );
		beep8.Core.defineColors( colors );

	}


	/**
	 * Sets the current font for text-based operations.
	 *
	 * @param {string} [fontId="default"] - The font ID to set. Pass null or omit to reset to default font.
	 * @returns {void}
	 */
	beep8.setFont = function( fontId ) {

		beep8.Core.preflight( "beep8.setFont" );
		fontId = fontId || "default";
		beep8.Utilities.checkString( "fontId", fontId );
		beep8.Core.textRenderer.setFont( fontId );

	}


	/**
	 * Converts a character code to its integer representation if needed.
	 *
	 * @param {number|string} charCode - The character code to convert.
	 * @returns {number} The integer representation of the character code.
	 */
	beep8.convChar = function( charCode ) {

		if ( typeof ( charCode ) === "string" && charCode.length > 0 ) {
			return charCode.charCodeAt( 0 );
		}

		return charCode;

	}


	/**
	 * Stops a sound (previously loaded with beep8a.playSound).
	 *
	 * @param {HTMLAudioElement} sfx - The sound to stop playing.
	 * @returns {void}
	 */
	beep8.stopSound = function( sfx ) {

		beep8.Utilities.checkInstanceOf( "sfx", sfx, HTMLAudioElement );
		sfx.currentTime = 0;
		sfx.pause();

	}


	/**
	 * Returns the raw canvas 2D context for drawing.
	 *
	 * @returns {CanvasRenderingContext2D} The raw HTML 2D canvas context.
	 */
	beep8.getContext = function() {

		return beep8.Core.getContext();

	}


	/**
	 * Saves the contents of the screen into an ImageData object and returns it.
	 *
	 * @returns {ImageData} An ImageData object with the screen's contents.
	 */
	beep8.saveScreen = function() {

		return beep8.Core.saveScreen();

	}


	/**
	 * Restores the contents of the screen using an ImageData object.
	 *
	 * @param {ImageData} screenData - The ImageData object with the screen's contents.
	 * @returns {void}
	 */
	beep8.restoreScreen = function( screenData ) {

		return beep8.Core.restoreScreen( screenData );

	}

} )( beep8 || ( beep8 = {} ) );

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

( function( beep8 ) {

	beep8.Core = {};

	let _textRenderer = null;
	let _inputSys = null;
	let _cursorRenderer = null;
	let _realCanvas = null;
	let _realCtx = null;
	let _canvas = null;
	let _ctx = null;
	let _deltaTime = 0;

	Object.defineProperty(
		beep8.Core,
		'textRenderer',
		{
			get() { return _textRenderer; },
			set( value ) { _textRenderer = value; }
		}
	);

	Object.defineProperty(
		beep8.Core,
		'inputSys',
		{
			get() { return _inputSys; },
			set( value ) { _inputSys = value; }
		}
	);

	Object.defineProperty(
		beep8.Core,
		'cursorRenderer',
		{
			get() { return _cursorRenderer; },
			set( value ) { _cursorRenderer = value; }
		}
	);

	Object.defineProperty(
		beep8.Core,
		'realCanvas',
		{
			get() { return _realCanvas; },
			set( value ) { _realCanvas = value; }
		}
	);

	Object.defineProperty(
		beep8.Core,
		'realCtx',
		{
			get() { return _realCtx; },
			set( value ) { _realCtx = value; }
		}
	);

	Object.defineProperty(
		beep8.Core,
		'canvas',
		{
			get() { return _canvas; },
			set( value ) { _canvas = value; }
		}
	);

	Object.defineProperty(
		beep8.Core,
		'ctx',
		{
			get() { return _ctx; },
			set( value ) { _ctx = value; }
		}
	);

	Object.defineProperty(
		beep8.Core,
		'deltaTime',
		{
			get() { return _deltaTime; },
			set( value ) { _deltaTime = value; }
		}
	);

	let lastFrameTime = null;
	let crashed = false;

	beep8.Core.drawState = {
		fgColor: 7,
		bgColor: 0,  // -1 means transparent

		cursorCol: 0,
		cursorRow: 0,

		cursorVisible: false, // Don't change this directly, use cursorRenderer.setCursorVisible()
	};

	let initDone = false;
	let frameHandler = null;
	let frameHandlerTargetInterval = null;
	let animFrameRequested = false;
	let timeToNextFrame = 0;

	let scanLinesEl = null;

	let pendingAsync = null;
	let dirty = false;


	/**
	 * Initializes the engine.
	 *
	 * @param {Function} callback - The function to call when the engine is initialized.
	 * @return {void}
	 */
	beep8.Core.init = function( callback ) {

		beep8.Utilities.checkFunction( "callback", callback );
		asyncInit( callback );

	}


	async function asyncInit( callback ) {

		beep8.Utilities.log( "Sys init." );

		beep8.CONFIG.SCREEN_WIDTH = beep8.CONFIG.SCREEN_COLS * beep8.CONFIG.CHR_WIDTH;
		beep8.CONFIG.SCREEN_HEIGHT = beep8.CONFIG.SCREEN_ROWS * beep8.CONFIG.CHR_HEIGHT;

		_realCanvas = document.createElement( "canvas" );
		if ( beep8.CONFIG.CANVAS_SETTINGS && beep8.CONFIG.CANVAS_SETTINGS.CANVAS_ID ) {
			_realCanvas.setAttribute( "id", beep8.CONFIG.CANVAS_SETTINGS.CANVAS_ID );
		}

		if ( beep8.CONFIG.CANVAS_SETTINGS && beep8.CONFIG.CANVAS_SETTINGS.CANVAS_CLASSES ) {
			for ( const className of beep8.CONFIG.CANVAS_SETTINGS.CANVAS_CLASSES ) {
				_realCanvas.classList.add( className );
			}
		}

		_realCanvas.addEventListener( "touchstart", e => e.preventDefault() );

		let container = document.body;

		if ( beep8.CONFIG.CANVAS_SETTINGS && beep8.CONFIG.CANVAS_SETTINGS.CONTAINER ) {
			const containerSpec = beep8.CONFIG.CANVAS_SETTINGS.CONTAINER;
			if ( typeof ( containerSpec ) === "string" ) {
				container = document.getElementById( containerSpec );
				if ( !container ) {
					console.error( "beep8: Could not find container element with ID: " + containerSpec );
					container = document.body;
				}
			} else if ( containerSpec instanceof HTMLElement ) {
				container = containerSpec;
			} else {
				console.error( "beep8: beep8.CONFIG.CANVAS_SETTINGS.CONTAINER must be either an ID of an HTMLElement." );
				container = document.body;
			}
		}

		container.appendChild( _realCanvas );

		_canvas = document.createElement( "canvas" );
		_canvas.width = beep8.CONFIG.SCREEN_WIDTH;
		_canvas.height = beep8.CONFIG.SCREEN_HEIGHT;
		_canvas.style.width = beep8.CONFIG.SCREEN_WIDTH + "px";
		_canvas.style.height = beep8.CONFIG.SCREEN_HEIGHT + "px";
		_ctx = _canvas.getContext( "2d" );
		_ctx.imageSmoothingEnabled = false;

		_textRenderer = new beep8.TextRenderer();
		_inputSys = new beep8.Input();
		_cursorRenderer = new beep8.CursorRenderer();

		await _textRenderer.initAsync();

		updateLayout( false );
		window.addEventListener( "resize", () => updateLayout( true ) );

		if ( isMobile() ) {
			beep8.Joystick.setup();
		}

		initDone = true;

		await new Promise( resolve => setTimeout( resolve, 1 ) );
		await callback();

		render();

	}


	beep8.Core.getContext = function() {

		return _ctx;

	}


	beep8.Core.preflight = function( apiMethod ) {

		if ( crashed ) {
			throw new Error( `Can't call API method ${apiMethod}() because the engine has crashed.` );
		}

		if ( !initDone ) {
			beep8.Utilities.fatal(
				`Can't call API method ${apiMethod}(): API not initialized. ` +
				`Call initAsync() wait until it finishes before calling API methods.`
			);
		}

		if ( pendingAsync ) {
			beep8.Utilities.fatal(
				`Can't call API method ${apiMethod}() because there is a pending async ` +
				`call to ${pendingAsync.name}() that hasn't finished running yet. Are you missing ` +
				`an 'await' keyword to wait for the async method? Use 'await ${pendingAsync.name}()',` +
				`not just '${pendingAsync.name}()'`
			);
		}

	}


	beep8.Core.startAsync = function( asyncMethodName, resolve, reject ) {

		if ( pendingAsync ) {

			throw new Error(
				"Internal bug: startAsync called while pendingAsync is not null. " +
				"Missing preflight() call?"
			);

		}

		pendingAsync = {
			name: asyncMethodName,
			resolve,
			reject,
		}

		this.render();

	}


	beep8.Core.hasPendingAsync = function( asyncMethodName ) {

		return pendingAsync && pendingAsync.name === asyncMethodName;

	}


	beep8.Core.endAsyncImpl = function( asyncMethodName, isError, result ) {

		if ( !pendingAsync ) {
			throw new Error( `Internal bug: endAsync(${asyncMethodName}) called with no pendingAsync` );
		}

		if ( pendingAsync.name !== asyncMethodName ) {
			throw new Error( `Internal bug: endAsync(${asyncMethodName}) called but pendingAsync.name ` +
				`is ${pendingAsync.name}` );
		}

		const fun = isError ? pendingAsync.reject : pendingAsync.resolve;
		pendingAsync = null;
		fun( result );

	}


	beep8.Core.resolveAsync = function( asyncMethodName, result ) {

		endAsyncImpl( asyncMethodName, false, result );

	}


	beep8.Core.failAsync = function( asyncMethodName, error ) {

		endAsyncImpl( asyncMethodName, true, error );

	}


	beep8.Core.setFrameHandler = function( callback, targetFps ) {

		frameHandler = callback;
		frameHandlerTargetInterval = 1.0 / ( targetFps || 30 );
		timeToNextFrame = 0;

		if ( !animFrameRequested ) {
			window.requestAnimationFrame( doFrame );
		}

	}


	beep8.Core.render = function() {

		if ( crashed ) return;
		_realCtx.imageSmoothingEnabled = false;
		_realCtx.clearRect( 0, 0, _realCanvas.width, _realCanvas.height );
		_realCtx.drawImage(
			_canvas,
			0, 0,
			_realCanvas.width, _realCanvas.height
		);
		dirty = false;

		_cursorRenderer.drawCursor( _realCtx, _realCanvas.width, _realCanvas.height );

	}


	beep8.Core.markDirty = function() {

		if ( dirty ) return;
		dirty = true;
		setTimeout( render, 1 );

	}

	beep8.Core.cls = function() {

		_ctx.fillStyle = getColorHex( beep8.Core.drawState.bgColor );
		_ctx.fillRect( 0, 0, _canvas.width, _canvas.height );
		this.setCursorLocation( 0, 0 );
		markDirty();

	}


	beep8.Core.defineColors = function( colors ) {

		beep8.Utilities.checkArray( "colors", colors );
		beep8.CONFIG.COLORS = colors.slice();
		_textRenderer.regenColors();

	}


	beep8.Core.setColor = function( fg, bg ) {

		beep8.Utilities.checkNumber( "fg", fg );
		drawState.fgColor = Math.round( fg );

		if ( bg !== undefined ) {
			beep8.Utilities.checkNumber( "bg", bg );
			drawState.bgColor = Math.round( bg );
		}

	}


	beep8.Core.setCursorLocation = function( col, row ) {

		beep8.Utilities.checkNumber( "col", col );

		if ( row !== undefined ) beep8.Utilities.checkNumber( "row", row );

		drawState.cursorCol = Math.round( col );

		if ( row !== undefined ) drawState.cursorRow = Math.round( row );

	}


	beep8.Core.getColorHex = function( c ) {

		if ( typeof ( c ) !== "number" ) return "#f0f";

		if ( c < 0 ) return "#000";

		c = beep8.Utilities.clamp( Math.round( c ), 0, beep8.CONFIG.COLORS.length - 1 );

		return beep8.CONFIG.COLORS[ c ];

	}


	beep8.Core.getNow = function() {

		if ( window.performace.now ) {
			return window.performance.now();
		}

		return new Date().getTime();

	}


	beep8.Core.drawImage = function( img, x, y, srcX, srcY, width, height ) {

		beep8.Utilities.checkInstanceOf( "img", img, HTMLImageElement );
		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );

		if ( srcX !== undefined ) beep8.Utilities.checkNumber( "srcX", srcX );
		if ( srcY !== undefined ) beep8.Utilities.checkNumber( "srcY", srcY );
		if ( width !== undefined ) beep8.Utilities.checkNumber( "width", width );
		if ( height !== undefined ) beep8.Utilities.checkNumber( "height", height );
		if (
			srcX !== undefined && srcY !== undefined &&
			width !== undefined && height !== undefined
		) {
			_ctx.drawImage( img, srcX, srcY, width, height, x, y, width, height );
		} else {
			_ctx.drawImage( img, x, y );
		}

	}


	beep8.Core.drawRect = function( x, y, width, height ) {

		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		beep8.Utilities.checkNumber( "width", width );
		beep8.Utilities.checkNumber( "height", height );

		let oldStrokeStyle = _ctx.strokeStyle;
		_ctx.strokeStyle = getColorHex( drawState.fgColor );
		_ctx.strokeRect(
			Math.round( x ) + 0.5, Math.round( y ) + 0.5,
			Math.round( width ) - 1, Math.round( height ) - 1
		);

		_ctx.strokeStyle = oldStrokeStyle;

	}


	beep8.Core.fillRect = function( x, y, width, height ) {

		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		beep8.Utilities.checkNumber( "width", width );
		beep8.Utilities.checkNumber( "height", height );

		_ctx.fillStyle = getColorHex( drawState.fgColor );
		_ctx.fillRect(
			Math.round( x ) + 0.5, Math.round( y ) + 0.5,
			Math.round( width ) - 1, Math.round( height ) - 1
		);
	}


	beep8.Core.saveScreen = function() {

		return _ctx.getImageData( 0, 0, _canvas.width, _canvas.height );

	}

	beep8.Core.restoreScreen = function( screenData ) {

		beep8.Utilities.checkInstanceOf( "screenData", screenData, ImageData );
		_ctx.putImageData( screenData, 0, 0 );

	}


	async function doFrame() {

		animFrameRequested = false;

		const now = getNow();
		_deltaTime = lastFrameTime !== null ? 0.001 * ( now - lastFrameTime ) : ( 1 / 60.0 );
		_deltaTime = Math.min( _deltaTime, 0.05 );
		lastFrameTime = now;

		timeToNextFrame += _deltaTime;

		let numFramesDone = 0;

		while ( frameHandler && numFramesDone < 4 && timeToNextFrame > frameHandlerTargetInterval ) {
			await frameHandler();
			_inputSys.onEndFrame();
			timeToNextFrame -= frameHandlerTargetInterval;
			++numFramesDone;
		}

		render();

		if ( frameHandler ) {
			animFrameRequested = true;
			window.requestAnimationFrame( doFrame );
		}

	}


	beep8.Core.updateLayout = function( renderNow ) {

		updateLayout2d();

		if ( renderNow ) render();

	}


	beep8.Core.updateLayout2d = function() {

		const autoSize = !beep8.CONFIG.CANVAS_SETTINGS || beep8.CONFIG.CANVAS_SETTINGS.AUTO_SIZE;
		const autoPos = !beep8.CONFIG.CANVAS_SETTINGS || beep8.CONFIG.CANVAS_SETTINGS.AUTO_POSITION;

		let useAutoScale = typeof ( beep8.CONFIG.SCREEN_SCALE ) !== 'number';
		let scale;

		if ( useAutoScale ) {

			const frac = beep8.CONFIG.MAX_SCREEN_FRACTION || 0.8;
			const availableSize = autoSize ?
				{ width: frac * window.innerWidth, height: frac * window.innerHeight } :
				_realCanvas.getBoundingClientRect();
			scale = Math.floor( Math.min(
				availableSize.width / beep8.CONFIG.SCREEN_WIDTH,
				availableSize.height / beep8.CONFIG.SCREEN_HEIGHT ) );
			scale = Math.min( Math.max( scale, 1 ), 5 );
			beep8.Utilities.log( `Auto-scale: available size ${availableSize.width} x ${availableSize.height}, scale ${scale}, dpr ${window.devicePixelRatio}` );

		} else {

			scale = beep8.CONFIG.SCREEN_SCALE;

		}

		beep8.CONFIG.SCREEN_EL_WIDTH = beep8.CONFIG.SCREEN_WIDTH * scale;
		beep8.CONFIG.SCREEN_EL_HEIGHT = beep8.CONFIG.SCREEN_HEIGHT * scale;
		beep8.CONFIG.SCREEN_REAL_WIDTH = beep8.CONFIG.SCREEN_WIDTH * scale;
		beep8.CONFIG.SCREEN_REAL_HEIGHT = beep8.CONFIG.SCREEN_HEIGHT * scale;

		if ( autoSize ) {

			_realCanvas.style.width = beep8.CONFIG.SCREEN_EL_WIDTH + "px";
			_realCanvas.style.height = beep8.CONFIG.SCREEN_EL_HEIGHT + "px";
			_realCanvas.width = beep8.CONFIG.SCREEN_REAL_WIDTH;
			_realCanvas.height = beep8.CONFIG.SCREEN_REAL_HEIGHT;

		} else {

			const actualSize = _realCanvas.getBoundingClientRect();
			_realCanvas.width = actualSize.width;
			_realCanvas.height = actualSize.height;

		}

		_realCtx = _realCanvas.getContext( "2d" );
		_realCtx.imageSmoothingEnabled = false;

		if ( autoPos ) {

			_realCanvas.style.position = "absolute";
			_realCanvas.style.left = Math.round( ( window.innerWidth - _realCanvas.width ) / 2 ) + "px";
			_realCanvas.style.top = Math.round( ( window.innerHeight - _realCanvas.height ) / 2 ) + "px";

		}

		const scanLinesOp = beep8.CONFIG.SCAN_LINES_OPACITY || 0;

		if ( scanLinesOp > 0 ) {

			if ( autoPos && autoSize ) {

				if ( !scanLinesEl ) {
					scanLinesEl = document.createElement( "div" );
					document.body.appendChild( scanLinesEl );
				}

				scanLinesEl.style.background =
					"linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 1) 50%), " +
					"linear-gradient(90deg, rgba(255, 0, 0, .6), rgba(0, 255, 0, .2), rgba(0, 0, 255, .6))";

				scanLinesEl.style.backgroundSize = `100% 4px, 3px 100%`;
				scanLinesEl.style.opacity = scanLinesOp;
				scanLinesEl.style.position = "absolute";
				scanLinesEl.style.left = _realCanvas.style.left;
				scanLinesEl.style.top = _realCanvas.style.top;
				scanLinesEl.style.width = _realCanvas.style.width;
				scanLinesEl.style.height = _realCanvas.style.height;
				scanLinesEl.style.zIndex = 1;

			} else {

				console.error( "beep8: 2D scanlines effect only works if beep8.CONFIG.CANVAS_SETTINGS.AUTO_POS and AUTO_SIZE are both on." );

			}

		}

	}

	let crashing = false;

	beep8.Core.handleCrash = function( errorMessage = "Fatal error" ) {

		if ( crashed || crashing ) return;
		crashing = true;

		setColor( beep8.CONFIG.COLORS.length - 1, 0 );
		cls();

		drawState.cursorCol = drawState.cursorRow = 1;
		_textRenderer.print( "*** CRASH ***:\n" + errorMessage );
		render();

		crashing = false;
		crashed = true;

	}


	beep8.Core.isMobile = function() {

		return isIOS() || isAndroid();

	}


	beep8.Core.isIOS = function() {

		return /(ipad|ipod|iphone)/i.test( navigator.userAgent );

	}


	beep8.Core.isAndroid = function() {

		return /android/i.test( navigator.userAgent );

	}

} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	/**
	 * beep8.CursorRenderer class handles the rendering and blinking of the cursor.
	 */
	beep8.CursorRenderer = class {

		constructor() {
			this.blinkCycle_ = 0;
			this.toggleBlinkHandle_ = null;
		}

		/**
		 * Sets the visibility of the cursor.
		 *
		 * @param {boolean} visible - Whether the cursor should be visible
		 * @throws {TypeError} If visible is not a boolean
		 * @returns {void}
		 */
		setCursorVisible( visible ) {
			beep8.Utilities.checkBoolean( "visible", visible );

			// If the cursor is already in the desired state, do nothing.
			if ( beep8.Core.drawState.cursorVisible === visible ) return;

			beep8.Core.drawState.cursorVisible = visible;
			this.blinkCycle_ = 0;
			beep8.Core.render();

			if ( this.toggleBlinkHandle_ !== null ) {
				clearInterval( this.toggleBlinkHandle_ );
				this.toggleBlinkHandle_ = null;
			}

			// If visible, start the blink cycle.
			if ( visible ) {
				this.toggleBlinkHandle_ = setInterval(
					() => this.advanceBlink_(),
					beep8.CONFIG.CURSOR.BLINK_INTERVAL
				);
			}
		}

		/**
		 * Advances the cursor blink cycle.
		 * @private
		 * @returns {void}
		 */
		advanceBlink_() {
			this.blinkCycle_ = ( this.blinkCycle_ + 1 ) % 2;
			beep8.Core.render();
		}

		/**
		 * Draws the cursor.
		 *
		 * @param {CanvasRenderingContext2D} targetCtx - The context to draw the cursor on
		 * @param {number} canvasWidth - The width of the canvas
		 * @param {number} canvasHeight - The height of the canvas
		 * @throws {TypeError} If targetCtx is not a CanvasRenderingContext2D
		 * @throws {TypeError} If canvasWidth is not a number
		 * @throws {TypeError} If canvasHeight is not a number
		 * @returns {void}
		 */
		drawCursor( targetCtx, canvasWidth, canvasHeight ) {
			beep8.Utilities.checkInstanceOf( "targetCtx", targetCtx, CanvasRenderingContext2D );
			beep8.Utilities.checkNumber( "canvasWidth", canvasWidth );
			beep8.Utilities.checkNumber( "canvasHeight", canvasHeight );

			// If the cursor is not visible or it is not time to blink, do nothing.
			if ( !beep8.Core.drawState.cursorVisible || this.blinkCycle_ <= 0 ) return;

			const ratio = canvasWidth / beep8.Core.canvas.width;

			// Calculate the real position of the cursor.
			const realX = Math.round(
				( beep8.Core.drawState.cursorCol + 0.5 - beep8.CONFIG.CURSOR.WIDTH_F / 2 + beep8.CONFIG.CURSOR.OFFSET_H ) *
				beep8.CONFIG.CHR_WIDTH * ratio
			);
			const realY = Math.round(
				( beep8.Core.drawState.cursorRow + 1 - beep8.CONFIG.CURSOR.HEIGHT_F - beep8.CONFIG.CURSOR.OFFSET_V ) *
				beep8.CONFIG.CHR_HEIGHT * ratio
			);

			// Draw the cursor.
			targetCtx.fillStyle = beep8.Core.getColorHex( beep8.Core.drawState.fgColor );
			targetCtx.fillRect(
				realX, realY,
				Math.round( beep8.CONFIG.CURSOR.WIDTH_F * beep8.CONFIG.CHR_WIDTH * ratio ),
				Math.round( beep8.CONFIG.CURSOR.HEIGHT_F * beep8.CONFIG.CHR_HEIGHT * ratio )
			);
		}
	}

} )( beep8 || ( beep8 = {} ) );

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

			if ( beep8.Core.hasPendingAsync( "beep8a.key" ) ) {
				beep8.Core.resolveAsync( "beep8a.key", e.key );
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
			return new Promise( ( resolve, reject ) => {
				beep8.Core.startAsync( "beep8a.key", resolve, reject );
			} );
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

( function( beep8 ) {

	beep8.Menu = {};

	/**
	 * Displays a menu with the given choices and returns the index of the selected choice.
	 *
	 *
	 * @param {string[]} choices - The choices to display.
	 * @param {object} [options] - Options for the menu.
	 * @param {string} [options.title=""] - The title of the menu.
	 * @param {string} [options.prompt=""] - The prompt to display above the choices.
	 * @param {string} [options.selBgColor=beep8.Core.drawState.fgColor] - The background color of the selected choice.
	 * @param {string} [options.selFgColor=beep8.Core.drawState.bgColor] - The foreground color of the selected choice.
	 * @param {number} [options.bgChar=32] - The character to use for the background.
	 * @param {number} [options.borderChar=0x80] - The character to use for the border.
	 * @param {boolean} [options.center=false] - Whether to center the menu horizontally and vertically.
	 * @param {boolean} [options.centerH=false] - Whether to center the menu horizontally.
	 * @param {boolean} [options.centerV=false] - Whether to center the menu vertically.
	 * @param {number} [options.padding=1] - The padding around the prompt and choices.
	 * @param {number} [options.selIndex=0] - The index of the initially selected choice.
	 * @param {boolean} [options.cancelable=false] - Whether the menu can be canceled with the Escape key.
	 * @returns {Promise<number>} A promise that resolves to the index of the selected choice.
	 */
	beep8.Menu.add = async function( choices, options ) {

		options = options || {};
		beep8.Utilities.checkArray( "choices", choices );
		beep8.Utilities.checkObject( "options", options );

		options = Object.assign(
			{
				title: "",
				prompt: "",
				selBgColor: beep8.Core.drawState.fgColor,
				selFgColor: beep8.Core.drawState.bgColor,
				bgChar: 32,
				borderChar: 0x80,
				center: false,
				centerH: false,
				centerV: false,
				padding: 1,
				selIndex: 0,
				cancelable: false,
			},
			options
		);

		let startCol = beep8.Core.drawState.cursorCol;
		let startRow = beep8.Core.drawState.cursorRow;

		const promptSize = beep8.Core.textRenderer.measure( options.prompt );
		const prompt01 = options.prompt ? 1 : 0;
		const border01 = options.borderChar ? 1 : 0;
		let choicesCols = 0;
		const choicesRows = choices.length;
		choices.forEach( choice => choicesCols = Math.max( choicesCols, choice.length ) );

		const totalCols = Math.max( promptSize.cols, choicesCols ) + 2 * options.padding + 2 * border01;
		const totalRows = prompt01 * ( promptSize.rows + 1 ) + choicesRows + 2 * options.padding + 2 * border01;

		if ( options.centerH || options.center ) {
			startCol = Math.round( ( beep8.CONFIG.SCREEN_COLS - totalCols ) / 2 );
		}

		if ( options.centerV || options.center ) {
			startRow = Math.round( ( beep8.CONFIG.SCREEN_ROWS - totalRows ) / 2 );
		}

		beep8.Core.drawState.cursorCol = startCol;
		beep8.Core.drawState.cursorRow = startRow;

		// Print the background.
		beep8.Core.textRenderer.printRect( totalCols, totalRows, options.bgChar );

		// Print the border.
		if ( options.borderChar ) {
			beep8.Core.textRenderer.printBox( totalCols, totalRows, false, options.borderChar );
			// Print title at the top of the border.
			if ( options.title ) {
				const t = " " + options.title + " ";
				beep8.Core.drawState.cursorCol = startCol + Math.round( ( totalCols - t.length ) / 2 );
				beep8.Core.textRenderer.print( t );
			}
		}

		if ( options.prompt ) {
			beep8.Core.drawState.cursorCol = promptSize.cols <= totalCols ?
				( startCol + border01 + options.padding ) :
				( startCol + Math.round( ( totalCols - promptSize.cols ) / 2 ) );
			beep8.Core.drawState.cursorRow = startRow + border01 + options.padding;
			beep8.Core.textRenderer.print( options.prompt );
		}

		// TODO: save the screen image before showing the menu and restore it later.

		let selIndex = options.selIndex;

		while ( true ) {

			// Draw choices.
			beep8.Core.drawState.cursorRow = startRow + border01 + options.padding + prompt01 * ( promptSize.rows + 1 );
			beep8.Core.drawState.cursorCol = ( promptSize.cols <= choicesCols ) ?
				( startCol + border01 + options.padding ) :
				( startCol + Math.round( ( totalCols - choicesCols ) / 2 ) );

			printChoices( choices, selIndex, options );

			const k = await beep8.Core.inputSys.readKeyAsync();

			if ( k === "ArrowUp" ) {
				selIndex = selIndex > 0 ? selIndex - 1 : choices.length - 1;
			} else if ( k === "ArrowDown" ) {
				selIndex = ( selIndex + 1 ) % choices.length;
			} else if ( k === "Enter" || k === "ButtonA" ) {
				// TODO: erase menu
				return selIndex;
			} else if ( ( k === "Escape" || k === "ButtonB" ) && options.cancelable ) {
				return -1;
			}

		}

	}


	/**
	 * Prints the choices for a menu.
	 *
	 * @param {string[]} choices - The choices to print.
	 * @param {number} selIndex - The index of the selected choice.
	 * @param {object} options - Options for the menu.
	 * @param {string} options.selBgColor - The background color of the selected choice.
	 * @param {string} options.selFgColor - The foreground color of the selected choice.
	 * @returns {void}
	 */
	beep8.Menu.printChoices = function( choices, selIndex, options ) {

		const origBg = beep8.Core.drawState.bgColor;
		const origFg = beep8.Core.drawState.fgColor;

		for ( let i = 0; i < choices.length; i++ ) {
			const isSel = i === selIndex;
			beep8.Core.setColor( isSel ? options.selFgColor : origFg, isSel ? options.selBgColor : origBg );
			beep8.Core.textRenderer.print( choices[ i ] + "\n" );
		}

		beep8.Core.setColor( origFg, origBg );

	}

} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	/**
	 * beep8.TextRenderer class handles the rendering of text using various fonts.
	 */
	beep8.TextRenderer = class {

		constructor() {
			// beep8.TextRendererFont for each font, keyed by font name. The default font is called "default".
			this.fonts_ = {};

			// Current font. This is never null after initialization. This is a reference
			// to a beep8.TextRendererFont object. For a font to be set as current, it must have a
			// character width and height that are INTEGER MULTIPLES of beep8.CONFIG.CHR_WIDTH and
			// beep8.CONFIG.CHR_HEIGHT, respectively, to ensure the row/column system continues to work.
			this.curFont_ = null;
		}

		/**
		 * Initializes the beep8.TextRenderer with the default font.
		 * @returns {Promise<void>}
		 */
		async initAsync() {
			beep8.Utilities.log( "beep8.TextRenderer init." );
			const defaultFont = new beep8.TextRendererFont( "default", beep8.CONFIG.CHR_FILE );
			await defaultFont.initAsync();

			const actualCharWidth = defaultFont.getCharWidth();
			const actualCharHeight = defaultFont.getCharHeight();

			beep8.Utilities.assert(
				actualCharWidth === defaultFont.getCharWidth() &&
				actualCharHeight === defaultFont.getCharHeight(),
				`The character image ${beep8.CONFIG.CHR_FILE} should be a 16x16 grid of characters with ` +
				`dimensions 16 * beep8.CONFIG.CHR_WIDTH, 16 * beep8.CONFIG.CHR_HEIGHT = ` +
				`${16 * beep8.CONFIG.CHR_WIDTH} x ${16 * beep8.CONFIG.CHR_HEIGHT}`
			);

			this.fonts_[ "default" ] = defaultFont;
			this.curFont_ = defaultFont;
		}

		/**
		 * Loads a new font asynchronously.
		 * @param {string} fontName - The name of the font.
		 * @param {string} fontImageFile - The URL of the image file for the font.
		 * @returns {Promise<void>}
		 */
		async loadFontAsync( fontName, fontImageFile ) {
			beep8.Utilities.checkString( "fontName", fontName );
			beep8.Utilities.checkString( "fontImageFile", fontImageFile );
			const font = new beep8.TextRendererFont( fontName, fontImageFile );
			await font.initAsync();
			this.fonts_[ fontName ] = font;
		}

		/**
		 * Sets the current font.
		 * @param {string} fontName - The name of the font to set.
		 * @returns {void}
		 * @throws {Error} If the font is not found or its dimensions are not compatible.
		 */
		setFont( fontName ) {
			beep8.Utilities.checkString( "fontName", fontName );
			const font = this.fonts_[ fontName ];

			if ( !font ) {
				beep8.Utilities.fatal( `setFont(): font not found: ${fontName}` );
				return;
			}

			const cw = font.getCharWidth();
			const ch = font.getCharHeight();

			if ( cw % beep8.CONFIG.CHR_WIDTH !== 0 || ch % beep8.CONFIG.CHR_HEIGHT !== 0 ) {
				beep8.Utilities.fatal(
					`setFont(): font ${fontName} has character size ${cw}x${ch}, ` +
					`which is not an integer multiple of beep8.CONFIG.CHR_WIDTH x beep8.CONFIG.CHR_HEIGHT = ` +
					`${beep8.CONFIG.CHR_WIDTH}x${beep8.CONFIG.CHR_HEIGHT}, so it can't be set as the ` +
					`current font due to the row,column system. However, you can still use it ` +
					`directly with drawText() by passing it as a parameter to that function.`
				);
				return;
			}

			this.curFont_ = font;
		}

		/**
		 * Prints text at the current cursor position.
		 * @param {string} text - The text to print.
		 * @returns {void}
		 */
		print( text ) {
			beep8.Utilities.checkString( "text", text );

			let col = beep8.Core.drawState.cursorCol;
			let row = beep8.Core.drawState.cursorRow;

			// Store a backup of foreground/background colors.
			this.origFgColor_ = beep8.Core.drawState.fgColor;
			this.origBgColor_ = beep8.Core.drawState.bgColor;

			const colInc = Math.floor( this.curFont_.getCharWidth() / beep8.CONFIG.CHR_WIDTH );
			const rowInc = Math.floor( this.curFont_.getCharHeight() / beep8.CONFIG.CHR_HEIGHT );

			const initialCol = col;

			for ( let i = 0; i < text.length; i++ ) {
				i = this.processEscapeSeq_( text, i );
				const ch = text.charCodeAt( i );

				if ( ch === 10 ) {
					col = initialCol;
					row += rowInc;
				} else {
					this.put_( ch, col, row, beep8.Core.drawState.fgColor, beep8.Core.drawState.bgColor );
					col += colInc;
				}
			}

			beep8.Core.drawState.cursorCol = col;
			beep8.Core.drawState.cursorRow = row;
			beep8.Core.drawState.fgColor = this.origFgColor_;
			beep8.Core.drawState.bgColor = this.origBgColor_;
			beep8.Core.markDirty();
		}

		/**
		 * Prints text centered within a given width.
		 * @param {string} text - The text to print.
		 * @param {number} width - The width to center the text within.
		 * @returns {void}
		 */
		printCentered( text, width ) {
			beep8.Utilities.checkString( "text", text );
			beep8.Utilities.checkNumber( "width", width );
			text = text.split( "\n" )[ 0 ];

			if ( !text ) return;

			const textWidth = this.measure( text ).cols;
			const col = Math.floor( beep8.Core.drawState.cursorCol + ( width - textWidth ) / 2 );

			beep8.Core.drawState.cursorCol = col;
			this.print( text );
		}

		/**
		 * Prints a character a specified number of times.
		 * @param {number} ch - The character to print.
		 * @param {number} n - The number of times to print the character.
		 * @returns {void}
		 */
		printChar( ch, n ) {
			if ( n === undefined || isNaN( n ) ) n = 1;
			beep8.Utilities.checkNumber( "ch", ch );
			beep8.Utilities.checkNumber( "n", n );

			while ( n-- > 0 ) {
				this.put_(
					ch,
					beep8.Core.drawState.cursorCol,
					beep8.Core.drawState.cursorRow,
					beep8.Core.drawState.fgColor,
					beep8.Core.drawState.bgColor
				);
				beep8.Core.drawState.cursorCol++;
			}

			beep8.Core.markDirty();
		}

		/**
		 * Prints a character as a "sprite" at a raw x, y position.
		 * @param {number} ch - The character to print.
		 * @param {number} x - The x-coordinate.
		 * @param {number} y - The y-coordinate.
		 * @returns {void}
		 */
		spr( ch, x, y ) {
			beep8.Utilities.checkNumber( "ch", ch );
			beep8.Utilities.checkNumber( "x", x );
			beep8.Utilities.checkNumber( "y", y );
			this.putxy_( ch, x, y, beep8.Core.drawState.fgColor, beep8.Core.drawState.bgColor );
		}

		/**
		 * Draws text at the given pixel coordinates, with no cursor movement.
		 * @param {number} x - The x-coordinate.
		 * @param {number} y - The y-coordinate.
		 * @param {string} text - The text to draw.
		 * @param {string} [fontName] - The name of the font to use.
		 * @returns {void}
		 */
		drawText( x, y, text, fontName ) {
			beep8.Utilities.checkNumber( "x", x );
			beep8.Utilities.checkNumber( "y", y );
			beep8.Utilities.checkString( "text", text );

			if ( fontName ) beep8.Utilities.checkString( "fontName", fontName );

			const x0 = x;
			const font = fontName ? ( this.fonts_[ fontName ] || this.curFont_ ) : this.curFont_;

			if ( !font ) {
				beep8.Utilities.warn( `Requested font '${fontName}' not found: not drawing text.` );
				return;
			}

			for ( let i = 0; i < text.length; i++ ) {
				const ch = text.charCodeAt( i );

				if ( ch === 10 ) {
					x = x0;
					y += font.getCharHeight();
				} else {
					this.putxy_(
						ch,
						x, y,
						beep8.Core.drawState.fgColor,
						beep8.Core.drawState.bgColor,
						font
					);
					x += font.getCharWidth();
				}
			}
		}

		/**
		 * Measures the dimensions of the text.
		 * @param {string} text - The text to measure.
		 * @returns {{cols: number, rows: number}} The dimensions of the text.
		 */
		measure( text ) {
			beep8.Utilities.checkString( "text", text );

			if ( text === "" ) return { cols: 0, rows: 0 }; // Special case

			let rows = 1;
			let thisLineWidth = 0;
			let cols = 0;

			for ( let i = 0; i < text.length; i++ ) {
				i = this.processEscapeSeq_( text, i, true );
				const ch = text.charCodeAt( i );

				if ( ch === 10 ) {
					rows++;
					thisLineWidth = 0;
				} else {
					++thisLineWidth;
					cols = Math.max( cols, thisLineWidth );
				}
			}

			return { cols, rows };
		}

		/**
		 * Prints a rectangle of a specified character.
		 * @param {number} width - The width of the rectangle.
		 * @param {number} height - The height of the rectangle.
		 * @param {number} ch - The character to fill the rectangle with.
		 * @returns {void}
		 */
		printRect( width, height, ch ) {
			beep8.Utilities.checkNumber( "width", width );
			beep8.Utilities.checkNumber( "height", height );
			beep8.Utilities.checkNumber( "ch", ch );

			const startCol = beep8.Core.drawState.cursorCol;
			const startRow = beep8.Core.drawState.cursorRow;

			for ( let i = 0; i < height; i++ ) {
				beep8.Core.drawState.cursorCol = startCol;
				beep8.Core.drawState.cursorRow = startRow + i;
				this.printChar( ch, width );
			}

			beep8.Core.drawState.cursorCol = startCol;
			beep8.Core.drawState.cursorRow = startRow;
		}

		/**
		 * Prints a box with borders.
		 * @param {number} width - The width of the box.
		 * @param {number} height - The height of the box.
		 * @param {boolean} fill - Whether to fill the box.
		 * @param {number} borderCh - The character to use for the border.
		 * @returns {void}
		 */
		printBox( width, height, fill, borderCh ) {
			const borderNW = borderCh;
			const borderNE = borderCh + 1;
			const borderSW = borderCh + 2;
			const borderSE = borderCh + 3;
			const borderV = borderCh + 4;
			const borderH = borderCh + 5;

			beep8.Utilities.checkNumber( "width", width );
			beep8.Utilities.checkNumber( "height", height );
			beep8.Utilities.checkBoolean( "fill", fill );
			beep8.Utilities.checkNumber( "borderCh", borderCh );

			const startCol = beep8.Core.drawState.cursorCol;
			const startRow = beep8.Core.drawState.cursorRow;

			for ( let i = 0; i < height; i++ ) {
				beep8.Core.drawState.cursorCol = startCol;
				beep8.Core.drawState.cursorRow = startRow + i;
				if ( i === 0 ) {
					// Top border
					this.printChar( borderNW );
					this.printChar( borderH, width - 2 );
					this.printChar( borderNE );
				} else if ( i === height - 1 ) {
					// Bottom border.
					this.printChar( borderSW );
					this.printChar( borderH, width - 2 );
					this.printChar( borderSE );
				} else {
					// Middle.
					this.printChar( borderV );
					beep8.Core.drawState.cursorCol = startCol + width - 1;
					this.printChar( borderV );
				}
			}

			if ( fill && width > 2 && height > 2 ) {
				beep8.Core.drawState.cursorCol = startCol + 1;
				beep8.Core.drawState.cursorRow = startRow + 1;
				this.printRect( width - 2, height - 2, 32 );
			}

			beep8.Core.drawState.cursorCol = startCol;
			beep8.Core.drawState.cursorRow = startRow;
		}

		/**
		 * Puts a character at the specified row and column.
		 * @param {number} ch - The character to put.
		 * @param {number} col - The column.
		 * @param {number} row - The row.
		 * @param {number} fgColor - The foreground color.
		 * @param {number} bgColor - The background color.
		 * @returns {void}
		 */
		put_( ch, col, row, fgColor, bgColor ) {
			const chrW = beep8.CONFIG.CHR_WIDTH;
			const chrH = beep8.CONFIG.CHR_HEIGHT;
			const x = Math.round( col * chrW );
			const y = Math.round( row * chrH );

			this.putxy_( ch, x, y, fgColor, bgColor );
		}

		/**
		 * Puts a character at the specified x and y coordinates.
		 * @param {number} ch - The character to put.
		 * @param {number} x - The x-coordinate.
		 * @param {number} y - The y-coordinate.
		 * @param {number} fgColor - The foreground color.
		 * @param {number} bgColor - The background color.
		 * @param {beep8.TextRendererFont} [font=null] - The font to use.
		 * @returns {void}
		 */
		putxy_( ch, x, y, fgColor, bgColor, font = null ) {
			font = font || this.curFont_;

			const chrW = font.getCharWidth();
			const chrH = font.getCharHeight();
			const fontRow = Math.floor( ch / 16 );
			const fontCol = ch % 16;

			x = Math.round( x );
			y = Math.round( y );

			if ( bgColor >= 0 ) {
				beep8.Core.ctx.fillStyle = beep8.Core.getColorHex( bgColor );
				beep8.Core.ctx.fillRect( x, y, chrW, chrH );
			}

			const color = beep8.Utilities.clamp( fgColor, 0, beep8.CONFIG.COLORS.length - 1 );
			const img = font.getImageForColor( color );

			beep8.Core.ctx.drawImage(
				img,
				fontCol * chrW,
				fontRow * chrH,
				chrW, chrH,
				x, y,
				chrW, chrH
			);
			beep8.Core.markDirty();
		}

		/**
		 * Tries to run an escape sequence that starts at text[pos].
		 * Returns the position after the escape sequence ends.
		 * If pretend is true, then this will only parse but not run it.
		 * @param {string} text - The text containing the escape sequence.
		 * @param {number} startPos - The start position of the escape sequence.
		 * @param {boolean} [pretend=false] - Whether to only parse but not run the sequence.
		 * @returns {number} The position after the escape sequence ends.
		 */
		processEscapeSeq_( text, startPos, pretend = false ) {
			// Shorthand.
			const startSeq = beep8.CONFIG.PRINT_ESCAPE_START;
			const endSeq = beep8.CONFIG.PRINT_ESCAPE_END;

			// If no escape sequences are configured in beep8.CONFIG, stop.
			if ( !startSeq || !endSeq ) return startPos;

			// Check that the start sequence is there.
			if ( text.substring( startPos, startPos + startSeq.length ) != startSeq ) {
				return startPos;
			}

			// Where does it end?
			const endPos = text.indexOf( endSeq, startPos + startSeq.length );

			if ( !pretend ) {
				// Get the contents of the sequence.
				const command = text.substring( startPos + startSeq.length, endPos );
				this.runEscapeCommand_( command );
			}

			return endPos + endSeq.length;
		}

		/**
		 * Runs an escape command.
		 * @param {string} command - The command to run.
		 * @returns {void}
		 */
		runEscapeCommand_( command ) {
			// If it contains commas, it's a compound command.
			if ( command.indexOf( ',' ) > 0 ) {
				const parts = command.split( ',' );
				for ( const part of parts ) this.runEscapeCommand_( part );
				return;
			}

			command = command.trim();

			if ( command === "" ) return;

			// The first character is the command's verb. The rest is the argument.
			const verb = command[ 0 ].toLowerCase();
			const arg = command.substring( 1 );
			const argNum = 1 * arg;

			switch ( verb ) {
				case "f":
				case "c": // Set foreground color.
					beep8.Core.drawState.fgColor = arg !== "" ? argNum : this.origFgColor_;
					break;

				case "b": // Set background color.
					beep8.Core.drawState.bgColor = arg !== "" ? argNum : this.origBgColor_;
					break;

				case "z": // Reset state.
					beep8.Core.drawState.fgColor = this.origFgColor_;
					beep8.Core.drawState.bgColor = this.origBgColor_;
					break;

				default:
					console.warn( "Unknown beep8 print escape command: " + command );
			}
		}

		/**
		 * Regenerates the colors for all fonts.
		 * @returns {void}
		 */
		regenColors() {
			// Tell all the fonts to regenerate their glyph images.
			Object.values( this.fonts_ ).forEach( f => f.regenColors() );
		}
	}

	beep8.TextRenderer = beep8.TextRenderer;

} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	/**
	 * Represents an individual font that can be used with beep8.TextRenderer.
	 */
	beep8.TextRendererFont = class {
		/**
		 * Constructs a font. NOTE: after construction, you must call await initAsync() to
		 * initialize the font.
		 * @param {string} fontName - The name of the font.
		 * @param {string} fontImageFile - The URL of the image file for the font.
		 */
		constructor( fontName, fontImageFile ) {
			beep8.Utilities.checkString( "fontName", fontName );
			beep8.Utilities.checkString( "fontImageFile", fontImageFile );
			this.fontName_ = fontName;
			this.fontImageFile_ = fontImageFile;
			this.origImg_ = null;
			this.chrImages_ = [];
			this.charWidth_ = 0;
			this.charHeight_ = 0;
			this.origFgColor_ = 0;
			this.origBgColor_ = 0;
		}

		/**
		 * Returns the character width of the font.
		 * @returns {number} The width of each character in pixels.
		 */
		getCharWidth() { return this.charWidth_; }

		/**
		 * Returns the character height of the font.
		 * @returns {number} The height of each character in pixels.
		 */
		getCharHeight() { return this.charHeight_; }

		/**
		 * Returns the image for a given color number.
		 * @param {number} colorNumber - The color number.
		 * @returns {HTMLImageElement} The image for the specified color.
		 */
		getImageForColor( colorNumber ) { return this.chrImages_[ colorNumber ]; }

		/**
		 * Sets up this font from the given character image file. It's assumed to contain the
		 * glyphs arranged in a 16x16 grid, so we will deduce the character size by dividing the
		 * width and height by 16.
		 * @returns {Promise<void>}
		 */
		async initAsync() {
			beep8.Utilities.log( `Building font ${this.fontName_} from image ${this.fontImageFile_}` );
			this.origImg_ = await beep8.Utilities.loadImageAsync( this.fontImageFile_ );
			beep8.Utilities.assert( this.origImg_.width % 16 === 0 && this.origImg_.height % 16 === 0,
				`Font ${this.fontName_}: image ${this.fontImageFile_} has dimensions ` +
				`${this.origImg_.width}x${this.origImg_.height}. It must ` +
				`have dimensions that are multiples of 16 (16x16 grid of characters).` );
			this.charWidth_ = Math.floor( this.origImg_.width / 16 );
			this.charHeight_ = Math.floor( this.origImg_.height / 16 );
			this.regenColors();
		}

		/**
		 * Regenerates the color text images.
		 * @returns {void}
		 */
		regenColors() {
			const tempCanvas = document.createElement( 'canvas' );
			tempCanvas.width = this.origImg_.width;
			tempCanvas.height = this.origImg_.height;
			const ctx = tempCanvas.getContext( '2d' );
			this.chrImages_ = [];

			for ( let c = 0; c < beep8.CONFIG.COLORS.length; c++ ) {
				beep8.Utilities.log( `Initializing font ${this.fontName_}, color ${c} = ${beep8.CONFIG.COLORS[ c ]}` );

				// Draw the font image to the temp canvas (white over transparent background).
				ctx.clearRect( 0, 0, this.origImg_.width, this.origImg_.height );
				ctx.globalCompositeOperation = 'source-over';
				ctx.drawImage( this.origImg_, 0, 0, this.origImg_.width, this.origImg_.height );

				// Now draw a filled rect with the desired color using the 'source-in' pixel
				// operation, which will tint the white pixels to that color.
				ctx.globalCompositeOperation = 'source-in';
				ctx.fillStyle = beep8.CONFIG.COLORS[ c ];
				ctx.fillRect( 0, 0, this.origImg_.width, this.origImg_.height );

				// Now extract the canvas contents as an image.
				const thisImg = new Image();
				thisImg.src = tempCanvas.toDataURL();
				this.chrImages_.push( thisImg );
			}
		}
	}

} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	beep8.Utilities = {};

	/**
	 * Shows a fatal error and throws an exception.
	 *
	 * @param {string} error - The error to show.
	 */
	beep8.Utilities.fatal = function( error ) {

		console.error( "Fatal error: " + error );
		try {
			beep8.Core.handleCrash( error );
		} catch ( e ) {
			console.error( "Error in beep8.Core.handleCrash: " + e + " while handling error " + error );
		}
		throw new Error( "Error: " + error );

	}


	/**
	 * Asserts that the given condition is true, else shows a fatal error.
	 *
	 * @param {boolean} cond - The condition that you fervently hope will be true.
	 * @param {string} msg - The error message to show if the condition is false.
	 * @returns {boolean} The 'cond' parameter.
	 */
	beep8.Utilities.assert = function( cond, msg ) {

		if ( !cond ) {
			beep8.Utilities.fatal( msg || "Assertion Failed" );
		}

		return cond;

	}


	/**
	 * Same as beep8.Utilities.assert() but only asserts if beep8.CONFIG.DEBUG is true.
	 *
	 * @param {boolean} cond - The condition that you fervently hope will be true.
	 * @param {string} msg - The error message to show if the condition is false.
	 * @returns {boolean} The 'cond' parameter.
	 */
	beep8.Utilities.assertDebug = function( cond, msg ) {
		if ( !cond ) {
			if ( beep8.CONFIG.DEBUG ) {
				warn( "DEBUG ASSERT failed: " + msg );
			} else {
				beep8.Utilities.fatal( msg );
			}
		}
		return cond;
	}


	/**
	 * Asserts that two values are equal.
	 *
	 * @param {any} expected - What you expect the value to be.
	 * @param {any} actual - What the value actually is.
	 * @param {string} what - A description of what the value is.
	 * @returns {any} The 'actual' parameter.
	 */
	beep8.Utilities.assertEquals = function( expected, actual, what ) {
		if ( expected !== actual ) {
			beep8.Utilities.fatal( `${what}: expected ${expected} but got ${actual}` );
		}
		return actual;
	}


	/**
	 * Checks the type of a variable and throws an exception if it's incorrect.
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @param {string} varType - The expected type of the variable.
	 * @returns {any} The 'varValue' parameter.
	 */
	beep8.Utilities.checkType = function( varName, varValue, varType ) {

		beep8.Utilities.assert( varName, "checkType: varName must be provided." );
		beep8.Utilities.assert( varType, "checkType: varType must be provided." );
		beep8.Utilities.assert(
			typeof ( varValue ) === varType,
			`${varName} should be of type ${varType} but was ${typeof ( varValue )}: ${varValue}`
		);
		return varValue;

	}


	/**
	 * Checks that a variable is a number.
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @param {number} [optMin] - The minimum acceptable value for the variable.
	 * @param {number} [optMax] - The maximum acceptable value for the variable.
	 * @returns {number} The 'varValue' parameter.
	 */
	beep8.Utilities.checkNumber = function( varName, varValue, optMin, optMax ) {

		beep8.Utilities.checkType( varName, varValue, "number" );

		if ( isNaN( varValue ) ) {
			beep8.Utilities.fatal( `${varName} should be a number but is NaN` );
		}

		if ( !isFinite( varValue ) ) {
			beep8.Utilities.fatal( `${varName} should be a number but is infinite: ${varValue}` );
		}

		if ( optMin !== undefined ) {
			beep8.Utilities.assert( varValue >= optMin, `${varName} should be >= ${optMin} but is ${varValue}` );
		}

		if ( optMax !== undefined ) {
			beep8.Utilities.assert( varValue <= optMax, `${varName} should be <= ${optMax} but is ${varValue}` );
		}

		return varValue;

	}


	/**
	 * Checks that a variable is a string.
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @returns {string} The 'varValue' parameter.
	 */
	beep8.Utilities.checkString = function( varName, varValue ) {

		return beep8.Utilities.checkType( varName, varValue, "string" );

	}


	/**
	 * Checks that a variable is a boolean.
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @returns {boolean} The 'varValue' parameter.
	 */
	beep8.Utilities.checkBoolean = function( varName, varValue ) {

		return beep8.Utilities.checkType( varName, varValue, "boolean" );

	}


	/**
	 * Checks that a variable is a function.
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @returns {Function} The 'varValue' parameter.
	 */
	beep8.Utilities.checkFunction = function( varName, varValue ) {

		return beep8.Utilities.checkType( varName, varValue, "function" );

	}


	/**
	 * Checks that a variable is an object.
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @returns {Object} The 'varValue' parameter.
	 */
	beep8.Utilities.checkObject = function( varName, varValue ) {

		if ( varValue === null ) {
			beep8.Utilities.fatal( `${varName} should be an object, but was null` );
		}

		return beep8.Utilities.checkType( varName, varValue, "object" );

	}


	/**
	 * Checks that a variable is an instance of a given class.
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @param {Function} expectedClass - The expected class.
	 * @returns {any} The 'varValue' parameter.
	 */
	beep8.Utilities.checkInstanceOf = function( varName, varValue, expectedClass ) {

		beep8.Utilities.assert(
			varValue instanceof expectedClass,
			`${varName} should be an instance of ${expectedClass.name} but was not, it's: ${varValue}`
		);

		return varValue;

	}


	/**
	 * Checks that a variable is an array.
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @returns {Array} The 'varValue' parameter.
	 */
	beep8.Utilities.checkArray = function( varName, varValue ) {

		beep8.Utilities.assert( Array.isArray( varValue ), `${varName} should be an array, but was: ${varValue}` );

		return varValue;

	}

	/**
	 * Prints a log to the console if beep8.CONFIG.DEBUG is true.
	 *
	 * @param {string} msg - The message to print.
	 */
	beep8.Utilities.log = beep8.CONFIG.DEBUG ? console.log : ( () => { } );


	/**
	 * Prints a warning to the console.
	 *
	 * @param {string} msg - The message to print.
	 */
	beep8.Utilities.warn = console.warn;


	/**
	 * Prints an error to the console.
	 *
	 * @param {string} msg - The message to print.
	 */
	beep8.Utilities.error = console.error;


	/**
	 * Loads an image asynchronously.
	 *
	 * @param {string} src - The source URL of the image.
	 * @returns {Promise<HTMLImageElement>} A promise that resolves to the loaded image.
	 */
	beep8.Utilities.loadImageAsync = async function( src ) {

		return new Promise(
			( resolver ) => {
				const img = new Image();
				img.onload = () => resolver( img );
				img.src = src;
			}
		);

	}


	/**
	 * Loads a file asynchronously.
	 *
	 * @param {string} url - The URL of the file.
	 * @returns {Promise<string>} A promise that resolves to the file content.
	 */
	beep8.Utilities.loadFileAsync = function( url ) {

		return new Promise(
			( resolve, reject ) => {

				const xhr = new XMLHttpRequest();

				xhr.addEventListener(
					"load",
					() => {
						if ( xhr.status < 200 || xhr.status > 299 ) {
							reject( "HTTP request finished with status " + xhr.status );
						} else {
							resolve( xhr.responseText );
						}
					}
				);

				xhr.addEventListener( "error", e => reject( e ) );
				xhr.open( "GET", url );
				xhr.send();

			}
		);

	}


	/**
	 * Clamps a number, ensuring it's between a minimum and a maximum.
	 *
	 * @param {number} x - The number to clamp.
	 * @param {number} lo - The minimum value.
	 * @param {number} hi - The maximum value.
	 * @returns {number} The clamped number.
	 */
	beep8.Utilities.clamp = function( x, lo, hi ) {

		return Math.min( Math.max( x, lo ), hi );

	}


	/**
	 * Returns a random integer in the given closed interval.
	 *
	 * @param {number} lowInclusive - The minimum value (inclusive).
	 * @param {number} highInclusive - The maximum value (inclusive).
	 * @returns {number} A random integer between lowInclusive and highInclusive.
	 */
	beep8.Utilities.randomInt = function( lowInclusive, highInclusive ) {

		checkNumber( "lowInclusive", lowInclusive );
		checkNumber( "highInclusive", highInclusive );

		lowInclusive = Math.round( lowInclusive );
		highInclusive = Math.round( highInclusive );

		if ( highInclusive <= lowInclusive ) return lowInclusive;

		return clamp(
			Math.floor(
				Math.random() * ( highInclusive - lowInclusive + 1 )
			) + lowInclusive,
			lowInclusive, highInclusive
		);

	}


	/**
	 * Returns a randomly picked element of the given array.
	 *
	 * @param {Array} array - The array to pick from.
	 * @returns {any} A randomly picked element of the array, or null if the array is empty.
	 */
	beep8.Utilities.randomPick = function( array ) {
		checkArray( "array", array );
		return array.length > 0 ? array[ randomInt( 0, array.length - 1 ) ] : null;
	}


	/**
	 * Shuffles an array, randomly reordering the elements.
	 * Does not modify the original array. Returns the shuffled array.
	 *
	 * @param {Array} array - The array to shuffle.
	 * @returns {Array} The shuffled array.
	 */
	beep8.Utilities.shuffleArray = function( array ) {

		checkArray( "array", array );

		array = array.slice();

		for ( let i = 0; i < array.length; i++ ) {
			const j = randomInt( 0, array.length - 1 );
			const tmp = array[ i ];
			array[ i ] = array[ j ];
			array[ j ] = tmp;
		}

		return array;

	}


	/**
	 * Calculates a 2D distance between points (x0, y0) and (x1, y1).
	 *
	 * @param {number} x0 - The x-coordinate of the first point.
	 * @param {number} y0 - The y-coordinate of the first point.
	 * @param {number} x1 - The x-coordinate of the second point.
	 * @param {number} y1 - The y-coordinate of the second point.
	 * @returns {number} The distance between the two points.
	 */
	beep8.Utilities.dist2d = function( x0, y0, x1, y1 ) {

		checkNumber( "x0", x0 );
		checkNumber( "y0", y0 );
		checkNumber( "x1", x1 );
		checkNumber( "y1", y1 );

		const dx = x0 - x1;
		const dy = y0 - y1;

		return Math.sqrt( dx * dx + dy * dy );

	}


	/**
	 * Calculates the intersection between two integer number intervals.
	 *
	 * @param {number} as - The start of the first interval.
	 * @param {number} ae - The end of the first interval.
	 * @param {number} bs - The start of the second interval.
	 * @param {number} be - The end of the second interval.
	 * @param {Object} [result=null] - If provided, used to return the intersection.
	 * @returns {boolean} True if there is an intersection, false otherwise.
	 */
	beep8.Utilities.intersectIntervals = function( as, ae, bs, be, result = null ) {

		checkNumber( "as", as );
		checkNumber( "ae", ae );
		checkNumber( "bs", bs );
		checkNumber( "be", be );

		if ( result ) checkObject( "result", result );

		const start = Math.max( as, bs );
		const end = Math.min( ae, be );

		if ( end >= start ) {
			if ( result ) {
				result.start = start;
				result.end = end;
			}
			return true;
		}

		return false;

	}


	/**
	 * Calculates the intersection of two rectangles.
	 *
	 * @param {Object} r1 - The first rectangle.
	 * @param {Object} r2 - The second rectangle.
	 * @param {number} [dx1=0] - The delta X to add to the first rectangle.
	 * @param {number} [dy1=0] - The delta Y to add to the first rectangle.
	 * @param {number} [dx2=0] - The delta X to add to the second rectangle.
	 * @param {number} [dy2=0] - The delta Y to add to the second rectangle.
	 * @param {Object} [result=null] - If provided, used to return the intersection.
	 * @returns {boolean} True if there is a non-empty intersection, false otherwise.
	 */
	beep8.Utilities.intersectRects = function( r1, r2, dx1 = 0, dy1 = 0, dx2 = 0, dy2 = 0, result = null ) {

		checkObject( "r1", r1 );
		checkObject( "r2", r2 );
		checkNumber( "r1.x", r1.x );
		checkNumber( "r1.y", r1.y );
		checkNumber( "r1.w", r1.w );
		checkNumber( "r1.h", r1.h );
		checkNumber( "r2.x", r2.x );
		checkNumber( "r2.y", r2.y );
		checkNumber( "r2.w", r2.w );
		checkNumber( "r2.h", r2.h );
		checkNumber( "dx1", dx1 );
		checkNumber( "dx2", dx2 );
		checkNumber( "dy1", dy1 );
		checkNumber( "dy2", dy2 );

		if ( result ) checkObject( "result", result );

		const xint = intersectRects_xint;
		const yint = intersectRects_yint;

		if (
			!intersectIntervals(
				r1.x + dx1,
				r1.x + dx1 + r1.w - 1,
				r2.x + dx2,
				r2.x + dx2 + r2.w - 1, xint
			)
		) {
			return false;
		}

		if (
			!intersectIntervals(
				r1.y + dy1,
				r1.y + dy1 + r1.h - 1,
				r2.y + dy2,
				r2.y + dy2 + r2.h - 1, yint
			)
		) {
			return false;
		}

		if ( result ) {
			result.x = xint.start;
			result.w = xint.end - xint.start + 1;
			result.y = yint.start;
			result.h = yint.end - yint.start + 1;
		}

		return true;

	}

	const intersectRects_xint = {};
	const intersectRects_yint = {};

} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	/**
	 * Virtual joystick setup.
	 *
	 * This module sets up a virtual joystick for mobile devices.
	 * The joystick has two parts: a directional pad on the left side of the screen,
	 * and three buttons on the right side of the screen.
	 * The directional pad has up, down, left, and right buttons.
	 * The right side has three buttons, labeled A, B, and =.
	 */
	beep8.Joystick = {};


	/**
	 * The HTML for the left side of the virtual joystick.
	 * This includes the up, down, left, and right buttons.
	 *
	 * @type {string}
	 */
	const LEFT_VJOY_HTML = `
		<div id='vjoy-button-up' class='vjoy-button'></div>
		<div id='vjoy-button-down' class='vjoy-button'></div>
		<div id='vjoy-button-left' class='vjoy-button'></div>
		<div id='vjoy-button-right' class='vjoy-button'></div>
	`;


	/**
	 * The HTML for the right side of the virtual joystick.
	 * This includes the A, B, and = buttons.
	 *
	 * @type {string}
	 */
	const RIGHT_VJOY_HTML = `
		<div id='vjoy-button-pri' class='vjoy-button'>A</div>
		<div id='vjoy-button-sec' class='vjoy-button'>B</div>
		<div id='vjoy-button-ter' class='vjoy-button'>=</div>
	`;


	/**
	 * The CSS for the virtual joystick.
	 *
	 * @type {string}
	 */
	const VJOY_CSS = `
		* {
			user-select: none;
			-webkit-user-select: none;
			-webkit-touch-callout: none;
		}

		#vjoy-scrim {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			top: 0;
			pointer-events: all;
		}

		#vjoy-container-left {
			box-sizing: border-box;
			position: fixed;
			bottom: 16px;
			left: 16px;
			width: 40vmin;
			height: 40vmin;
			user-select: none;
			touch-callout: none;
			-webkit-user-select: none;
			-webkit-touch-callout: none;
		}

		#vjoy-container-right {
			box-sizing: border-box;
			position: fixed;
			bottom: 16px;
			right: 16px;
			width: 40vmin;
			height: 40vmin;
			user-select: none;
			touch-callout: none;
			-webkit-user-select: none;
			-webkit-touch-callout: none;
		}

		.vjoy-button {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			background: #444;
			border: none;
			font: bold 14px monospace;
			color: #888;
			user-select: none;
			touch-callout: none;
			-webkit-user-select: none;
			-webkit-touch-callout: none;
		}
		.vjoy-button:active {
			background: #888;
		}

		#vjoy-button-up {
			position: absolute;
			left: 30%;
			top: 0px;
			width: 40%;
			height: 45%;
			border-radius: 0px 0px 50% 50%;
		}

		#vjoy-button-down {
			position: absolute;
			left: 30%;
			bottom: 0px;
			width: 40%;
			height: 45%;
			border-radius: 50% 50% 0px 0px;
		}

		#vjoy-button-left {
			position: absolute;
			left: 0px;
			bottom: 30%;
			width: 45%;
			height: 40%;
			border-radius: 0px 50% 50% 0px;
		}

		#vjoy-button-right {
			position: absolute;
			right: 0px;
			bottom: 30%;
			width: 45%;
			height: 40%;
			border-radius: 50% 0px 0px 50%;
		}

		#vjoy-button-pri {
			position: absolute;
			right: 0px;
			top: 30%;
			width: 50%;
			height: 50%;
			border-radius: 50%;
		}

		#vjoy-button-sec {
			position: absolute;
			left: 0px;
			top: 30%;
			width: 50%;
			height: 50%;
			border-radius: 50%;
		}

		#vjoy-button-ter {
			position: fixed;
			right: 0px;
			bottom: 0px;
			width: 10vw;
			height: 8vmin;
			border-radius: 8px;
			opacity: 0.5;
		}
	`;


	/**
	 * Sets up the virtual joystick.
	 *
	 * @returns {void}
	 */
	beep8.Joystick.setup = function() {

		beep8.Utilities.log( "Setting up virtual joystick..." );

		const styleEl = document.createElement( "style" );
		styleEl.setAttribute( "type", "text/css" );
		styleEl.innerText = VJOY_CSS;
		document.body.appendChild( styleEl );

		const scrim = document.createElement( "div" );
		scrim.setAttribute( "id", "vjoy-scrim" );
		scrim.addEventListener( "touchstart", e => e.preventDefault() );
		document.body.appendChild( scrim );

		const leftContainer = document.createElement( "div" );
		leftContainer.setAttribute( "id", "vjoy-container-left" );
		leftContainer.innerHTML = LEFT_VJOY_HTML;
		document.body.appendChild( leftContainer );

		const rightContainer = document.createElement( "div" );
		rightContainer.setAttribute( "id", "vjoy-container-right" );
		rightContainer.innerHTML = RIGHT_VJOY_HTML;
		document.body.appendChild( rightContainer );

		setTimeout( continueSetup, 10 );

	}


	/**
	 * Continues setting up the virtual joystick.
	 *
	 * @returns {void}
	 */
	beep8.Joystick.continueSetup = function() {

		setUpButton( "vjoy-button-up", "ArrowUp" );
		setUpButton( "vjoy-button-down", "ArrowDown" );
		setUpButton( "vjoy-button-left", "ArrowLeft" );
		setUpButton( "vjoy-button-right", "ArrowRight" );
		setUpButton( "vjoy-button-pri", "ButtonA" );
		setUpButton( "vjoy-button-sec", "ButtonB" );
		setUpButton( "vjoy-button-ter", "Escape" );

		// Prevent touches on the document body from doing what they usually do (opening
		// context menus, selecting stuff, etc).
		document.body.addEventListener( "touchstart", e => e.preventDefault() );

	}


	/**
	 * Sets up a virtual joystick button.
	 * If buttonKeyName is null, the button will be hidden.
	 * Otherwise, the button will be set up to simulate the given key.
	 *
	 * @param {string} buttonId - The ID of the button element
	 * @param {string} buttonKeyName - The key name to simulate
	 * @returns {void}
	 */
	beep8.Joystick.setUpButton = function( buttonId, buttonKeyName ) {

		const button = beep8.Utilities.assert(
			document.getElementById( buttonId ),
			"Could not find button ID " + buttonId
		);

		if ( buttonKeyName === null ) {
			// This means the user wants to hide the button.
			button.style.display = "none";
			return;
		}

		button.addEventListener(
			"mousedown",
			( e ) => handleButtonEvent( buttonKeyName, true, e )
		);

		button.addEventListener(
			"touchstart",
			( e ) => handleButtonEvent( buttonKeyName, true, e )
		);

		button.addEventListener(
			"mouseup",
			( e ) => handleButtonEvent( buttonKeyName, false, e )
		);

		button.addEventListener(
			"touchend",
			( e ) => handleButtonEvent( buttonKeyName, false, e )
		);

		button.addEventListener(
			"contextmenu",
			( e ) => e.preventDefault()
		);

	}


	/**
	 * Handles a button event.
	 *
	 * @param {string} buttonKeyName - The key name to simulate
	 * @param {boolean} down - Whether the button is being pressed or released
	 * @param {Event} evt - The event object
	 * @returns {void}
	 */
	beep8.Joystick.handleButtonEvent = function( buttonKeyName, down, evt ) {

		if ( down ) {
			inputSys.onKeyDown( { key: buttonKeyName } );
		} else {
			inputSys.onKeyUp( { key: buttonKeyName } );
		}

		evt.preventDefault();

	}

} )( beep8 || ( beep8 = {} ) );
