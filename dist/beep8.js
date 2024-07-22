/*!
 * beep8.js - A Retro Game Library
 *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 * ░░░░       ░░        ░        ░       ░░░     ░░░░░        ░░      ░░░░░
 * ▒▒▒▒  ▒▒▒▒  ▒  ▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒  ▒▒▒▒  ▒  ▒▒▒  ▒▒▒▒▒▒▒▒▒▒  ▒  ▒▒▒▒▒▒▒▒▒▒
 * ▓▓▓▓       ▓▓      ▓▓▓      ▓▓▓       ▓▓▓     ▓▓▓▓▓▓▓▓▓▓▓  ▓▓      ▓▓▓▓▓
 * ████  ████  █  ███████  ███████  ███████  ███  ████  ████  ███████  ████
 * ████       ██        █        █  ████████     ██  ██      ███      █████
 * ████████████████████████████████████████████████████████████████████████
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
		CHR_FILE: "../assets/chr.png",
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
	 * Initializes the API. This must be called before other functions and must
	 * finish executing before other API functions are called.
	 * Once the supplied callback is called, you can start using beep8 functions.
	 *
	 * @param {Function} callback - The callback to call when initialization is done.
	 * @param {Object} [options] - Optional options object.
	 * @returns {void}
	 */
	beep8.init = function( callback, options = {} ) {

		beep8.Utilities.checkFunction( "callback", callback );
		beep8.Utilities.checkObject( "options", options );

		// Combine options with beep8.CONFIG.
		if ( options !== null ) {
			beep8.CONFIG = Object.assign( beep8.CONFIG, options );
		}

		return beep8.Core.init( callback );

	}


	/**
	 * Sets the frame handler, that is, the function that will be called on
	 * every frame to render the screen.
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
	 * Forces the screen to render right now. Useful for immediate redraw in
	 * animations.
	 * Forces the screen to render right now. You only need this if you are
	 * doing some kind of animation on your own and you want to redraw the
	 * screen immediately to show the current state.
	 * Otherwise the screen repaints automatically when waiting for user input.
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
	 * Gets the current background color.
	 * -1 means transparent.
	 *
	 * @returns {number} The current background color.
	 */
	beep8.getBgColor = function() {

		beep8.Core.preflight( "beep8.getBgColor" );

		return beep8.Core.drawState.bgColor;

	}


	/**
	 * Clears the screen using the current background color.
	 *
	 * @returns {void}
	 */
	beep8.cls = function() {

		beep8.Core.preflight( "beep8.Core.cls" );
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
	 * @param {boolean} visible - If true, show the cursor. If false, hide the
	 * cursor.
	 * @returns {void}
	 */
	beep8.cursor = function( visible ) {

		beep8.Core.preflight( "cursor" );
		beep8.Utilities.checkBoolean( "visible", visible );
		beep8.Core.cursorRenderer.setCursorVisible( visible );

	}


	/**
	 * Prints text at the cursor position, using the current foreground and
	 * background colors.
	 *
	 * The text can contain embedded newlines and they will behave as you expect:
	 * printing will continue at the next line.
	 *
	 * If PRINT_ESCAPE_START and PRINT_ESCAPE_END are defined in CONFIG, then
	 * you can also use escape sequences. For example {{c1}} sets the color to
	 * 1, so your string can be "I like the color {{c1}}blue" and the word
	 * 'blue' would be in blue. The sequence {{b2}} sets the background to 2
	 * (red). The sequence {{z}} resets the color to the default. See
	 * example-printing.html for an example.
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
	 * If the text is bigger than the width, it will overflow it.
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
	 * Draws text at an arbitrary pixel position on the screen, not following
	 * the "row and column" system.
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
	 * Prints a character at the current cursor position, advancing the cursor
	 * position.
	 *
	 * @param {number|string} charCode - The character to print, as an integer
	 * (ASCII code) or a one-character string.
	 * @param {number} [numTimes=1] - How many times to print the character.
	 * @returns {void}
	 */
	beep8.printChar = function( charCode, numTimes = 1 ) {

		beep8.Core.preflight( "beep8.printChar" );
		charCode = beep8.convChar( charCode );
		beep8.Utilities.checkNumber( "charCode", charCode );
		beep8.Utilities.checkNumber( "numTimes", numTimes );
		beep8.Core.textRenderer.printChar( charCode, numTimes );

	}


	/**
	 * Prints a rectangle of the given size with the given character, starting
	 * at the current cursor position.
	 *
	 * @param {number} widthCols - Width of the rectangle in screen columns.
	 * @param {number} heightRows - Height of the rectangle in screen rows.
	 * @param {number|string} [charCode=32] - The character to print, as an
	 * integer (ASCII code) or a one-character string.
	 * @returns {void}
	 */
	beep8.printRect = function( widthCols, heightRows, charCode = 32 ) {

		beep8.Core.preflight( "beep8.printRect" );
		charCode = beep8.convChar( charCode );
		beep8.Utilities.checkNumber( "widthCols", widthCols );
		beep8.Utilities.checkNumber( "heightRows", heightRows );
		beep8.Utilities.checkNumber( "charCode", charCode );
		beep8.Core.textRenderer.printRect( widthCols, heightRows, charCode );

	}


	/**
	 * Prints a box of the given size starting at the cursor position, using
	 * border-drawing characters.
	 *
	 * @param {number} widthCols - Width of the box in screen columns, including
	 * the border.
	 * @param {number} heightRows - Height of the box in screen rows, including
	 * the border.
	 * @param {boolean} [fill=true] - If true, fill the interior with spaces.
	 * @param {number} [borderChar=0x80] - The first border-drawing character to
	 * use.
	 * @returns {void}
	 */
	beep8.printBox = function( widthCols, heightRows, fill = true, borderChar = 0x80 ) {

		beep8.Core.preflight( "beep8.printBox" );
		borderChar = beep8.convChar( borderChar );
		beep8.Utilities.checkNumber( "widthCols", widthCols );
		beep8.Utilities.checkNumber( "heightRows", heightRows );
		beep8.Utilities.checkBoolean( "fill", fill );
		beep8.Utilities.checkNumber( "borderChar", borderChar );
		beep8.Core.textRenderer.printBox( widthCols, heightRows, fill, borderChar );

	}


	/**
	 * Draws an image (previously loaded with beep8.loadImage).
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
	 * Draws a rectangular part of an image (previously loaded with
	 * beep8.loadImage).
	 *
	 * @param {number} x - The X coordinate of the top-left of the image.
	 * @param {number} y - The Y coordinate of the top-left of the image.
	 * @param {HTMLImageElement} image - The image to draw.
	 * @param {number} srcX - The X coordinate of the top-left of the rectangle
	 * to be drawn.
	 * @param {number} srcY - The Y coordinate of the top-left of the rectangle
	 * to be drawn.
	 * @param {number} width - The width in pixels of the rectangle to be drawn.
	 * @param {number} height - The height in pixels of the rectangle to be
	 * drawn.
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
	 * Plays a sound (previously loaded with beep8.playSound).
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

		ch = beep8.convChar( ch );

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


	beep8.playSong = function( song ) {

		beep8.Utilities.checkString( "song", song );

		beep8.Sound.playSong( song );

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
	 * @param {string} [fontId="default"] - The font ID to set. Pass null or
	 * omit to reset to default font.
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
	 * Stops a sound (previously loaded with beep8.playSound).
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
	 * @param {ImageData} screenData - The ImageData object with the screen's
	 * contents.
	 * @returns {void}
	 */
	beep8.restoreScreen = function( screenData ) {

		return beep8.Core.restoreScreen( screenData );

	}


} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {


	// Predefined list of start patterns
	const startPatterns = [
		"X-X-",
		"XX--",
	];

	// Predefined list of follow-up patterns
	const followPatterns = [
		"X--X",
		"X-X-",
		"XX--",
		// "X X-",
		// "-X-X",
		// "--XX",
		// "X---",
		// "-X--",
		// "X---X---",
		// "X---    "
	];

	const bassPatterns = [
		'X---',
		'X---X---',
		'X-------',
		'X-X-X-X-',
		'X-------X-------',
		'X-------        ',
		'        X-------',
	];

	const scales = {

		// [ 2, 2, 1, 2, 2, 2, 1 ], // major.
		// [ 0, 0, 1, 0, 0, -1 ],
		// [ 1, 1, 1, -2, 1, 1 ],
		// [ 1, -1, 1, -1, 1, -1 ],
		// [ 1, -1 ],
		// [ 1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1 ],

		minor: [ 2, 1, 2, 2, 1, 2, 2 ],
		harmonicMinor: [ 2, 1, 2, 2, 1, 3, 1 ],
		melodicMinorAscending: [ 2, 1, 2, 2, 2, 2, 1 ],
		melodicMinorDescending: [ 2, 1, 2, 2, 1, 2, 2 ], // Same as natural minor
		pentatonicMajor: [ 2, 2, 3, 2, 3 ],
		pentatonicMinor: [ 3, 2, 2, 3, 2 ],
		blues: [ 3, 2, 1, 1, 3, 2 ],
		chromatic: [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
		wholeTone: [ 2, 2, 2, 2, 2, 2 ],
		dorian: [ 2, 1, 2, 2, 2, 1, 2 ],
		phrygian: [ 1, 2, 2, 2, 1, 2, 2 ],
		lydian: [ 2, 2, 2, 1, 2, 2, 1 ],
		mixolydian: [ 2, 2, 1, 2, 2, 1, 2 ],
		aeolian: [ 2, 1, 2, 2, 1, 2, 2 ], // Same as natural minor
		locrian: [ 1, 2, 2, 1, 2, 2, 2 ],
		// Exotic Scales
		phrygianDominant: [ 1, 3, 1, 2, 1, 2, 2 ],
		hungarianMinor: [ 2, 1, 3, 1, 1, 3, 1 ],
		gypsy: [ 1, 3, 1, 2, 1, 3, 1 ],
		japanese: [ 1, 4, 2, 1, 4 ],
		arabian: [ 2, 2, 1, 1, 2, 2, 2 ],
		eastern: [ 1, 2, 2, 1, 1, 3, 1 ],
	};

	const scaleRangeDistance = [
		3,
		2, 2,
		1, 1, 1,
		0, 0, 0, 0,
		-1, -1, -1,
		-2, -2,
		-3,
	];

	const speedRange = [ 75, 100, 150, 200, 250, 300 ];
	const durationRange = [ 40, 50, 60, 70, 80, 90 ];


	const scaleRange = 12;
	const noteMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split( '' );



	beep8._Music = {};


	/**
	 * Play a song.
	 *
	 * @param {string} song The song to play.
	 * @returns {void}
	 */
	beep8._Music.play = function( song ) {

		console.log( 'play song', song );
		p1( song );

	}


	/**
	 * Create a song.
	 *
	 * @returns {string} The song.
	 */
	beep8._Music.create = function() {

		let melody = [];

		// Pick a random key from the list of scales.
		let scaleKeys = Object.keys( scales );
		let scaleIndex = scaleKeys[ Math.floor( Math.random() * scaleKeys.length ) ];

		// The main 'song' melody.
		const pattern = generatePattern( 8, startPatterns, followPatterns );
		melody.push( generateMelody( generateScale( 2, scaleIndex ), pattern ) );
		melody.push( generateMelody( generateScale( 1, scaleIndex ), pattern ) );

		// Add some BASS.
		// Number of patterns to add to the bass line.
		const bassRepeat = Math.floor( Math.random() * 3 ) + 1;
		// Generate the bass line.
		melody.push( generateMelody( generateScale( 0, scaleIndex ), generatePattern( bassRepeat, [], bassPatterns ) ) );

		// Return.
		// Should change this and the p1 player so they accept JSON rather than a weird string.
		return `${beep8.Utilities.randomPick( speedRange )}.${beep8.Utilities.randomPick( durationRange )}
${melody.join( '\n' )}`;

	};


	/**
	 * Generate a note scale.
	 *
	 * @param {number} noteMapId The group of keys to start from.
	 * @param {string} scaleIndex The scale pattern to use.
	 * @returns {string[]} The scale.
	 */
	function generateScale( noteMapId, scaleIndex ) {

		const startNote = noteMapId * scaleRange;

		let scale = [];
		let currentIndex = startNote;

		// Generate the list of notes that can be used.
		for ( let interval of scales[ scaleIndex ] ) {
			scale.push( noteMap[ currentIndex ] );
			console.log( noteMap[ currentIndex ], currentIndex );
			currentIndex += interval;
		}

		return scale;

	}


	/**
	 * Generate a rhythmic pattern from predefined patterns
	 *
	 * @param {number} totalPatterns The number of patterns to generate.
	 * @param {string[]} startPatterns The list of start patterns.
	 * @param {string[]} followPatterns The list of follow patterns.
	 * @returns {string} The generated pattern.
	 */
	function generatePattern( totalPatterns = 4, startPatterns = startPatterns, followPatterns = followPatterns ) {

		if ( totalPatterns < 1 ) {
			return '';
		}

		let pattern = [];

		// Ensure there is at least one start pattern
		if ( startPatterns.length > 0 ) {
			pattern.push( startPatterns[ Math.floor( Math.random() * startPatterns.length ) ] );
		}

		if ( followPatterns.length > 0 ) {

			// Add subsequent patterns from the followPatterns list
			for ( let i = 1; i < totalPatterns; i++ ) {
				let randomPattern = followPatterns[ Math.floor( Math.random() * followPatterns.length ) ];
				let patternRepeat = Math.floor( Math.random() * 3 ) + 1;

				for ( let j = 0; j < patternRepeat; j++ ) {
					pattern.push( randomPattern );
				}
			}

		}

		console.log( pattern );

		return pattern.join( '|' );

	}


	// Function to generate a melody based on a scale and a rhythmic pattern
	function generateMelody( scale, rhythmPattern ) {

		let melody = "";
		// Pick a random index from scale array to start from.
		let scaleIndex = Math.floor( Math.random() * scale.length );


		for ( let i = 0; i < rhythmPattern.length; i++ ) {
			if ( rhythmPattern[ i ] === '-' ) {
				melody += '-';
			}

			if ( rhythmPattern[ i ] === ' ' ) {
				melody += ' ';
			}

			if ( rhythmPattern[ i ] === '|' ) {
				melody += '|';
			}

			if ( rhythmPattern[ i ] === 'X' ) {

				melody += scale[ scaleIndex ];
				scaleIndex += scaleRangeDistance[ Math.floor( Math.random() * scaleRangeDistance.length ) ];
				if ( scaleIndex < 0 ) {
					scaleIndex = 0;
				}
				if ( scaleIndex >= scale.length ) {
					scaleIndex = scale.length - 1;
				}
			}
		}

		return melody;

	}


} )( beep8 || ( beep8 = {} ) );

/* p1.js Piano music player.
There is only 1 function: p1
You call it without parenthesis.

EXAMPLE, PLAY JINGLE BELLS:
p1`c-c-c---|c-c-c---|c-f-Y--a|c-------|d-d-d--d|d-c-c-cc|f-f-d-a-|Y---f---`

TO STOP:
p1``

WITH BASS TRACK:
p1`
|V-Y-c-V-|d---c-a-|
|M-------|R-------|
`

Bass track can be shorter and will repeat.

WITH CUSTOM TEMPO (in milliseconds per note):
p1`70
V-Y-c-V-d---c-a-
M-------R-------`

WITH NOTES HELD DOWN LESS LONG = 30 (0 to 100, default is 50):
p1`70.30
V-Y-c-V-d---c-a-
M-------R-------`

Vertical bars are ingored and don't do anything.
Dashes make the note held longer.
Spaces are silent space.

Supports 52 notes (4 octaves)
How to convert from piano notes to p1 letters:
|Low C      |Tenor C    |Middle C   |Treble C   |High C
C#D#EF#G#A#BC#D#EF#G#A#BC#D#EF#G#A#BC#D#EF#G#A#BC#D#
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz
*/
!function() {

	const numberOfTracks = 4;
	const contextsPerTrack = 3;
	const totalContexts = Math.ceil( numberOfTracks * contextsPerTrack * 1.2 );

	// Object to store generated audio buffers.
	let buffers = {};

	// Array of 13 AudioContext objects to handle multiple audio channels.
	let contexts = [ ...Array( totalContexts ).keys() ].map( _ => new AudioContext );

	// Variables for tracks, track length, playback interval, unlocked state, and note index.
	let tracks;
	let trackLen;
	let interval;
	let unlocked;
	let noteI;

	// Modulation. Generates a sample of a sinusoidal signal with a specific frequency and amplitude.
	let b = ( note, add ) => {

		return Math.sin( note * 6.28 + add );

	}

	// Instrument synthesis. Creates a more complex waveform by combining sinusoidal signals.
	const pianoify = ( note ) => {

		return b( note, b( note, 0 ) ** 2 + b( note, .25 ) * .75 + b( note, .5 ) * .1 );

	}

	const drummify = ( note ) => {


	}

	// Create a buffer for a note.
	var makeNote = ( note, seconds, sampleRate ) => {

		// console.log( note, seconds );

		// Create a unique key for caching the buffer.
		var key = note + '' + seconds;
		var buffer = buffers[ key ];

		if ( note >= 0 && !buffer ) {

			// Calculate frequency/pitch. "Low C" is 65.406 Hz.
			note = 65.406 * 1.06 ** note / sampleRate

			let i = sampleRate * seconds | 0;
			let sampleRest = sampleRate * ( seconds - .002 );
			let bufferArray;

			buffer = buffers[ key ] = contexts[ 0 ].createBuffer( 1, i, sampleRate )
			bufferArray = buffer.getChannelData( 0 )

			// Fill the samples array.
			for ( ; i--; ) {
				bufferArray[ i ] =
					// The first 88 samples represent the note's attack phase.
					( i < 88 ?
						i / 88.2
						// The other samples represent the decay/sustain/release phases.
						: ( 1 - ( i - 88.2 ) / sampleRest ) ** ( ( Math.log( 1e4 * note ) / 2 ) ** 2 )
					) * pianoify( i * note )
			}

			// Safari hack: Play every AudioContext then stop them immediately to "unlock" them on iOS.
			if ( !unlocked ) {

				contexts.map( context => playBuffer( buffer, context, unlocked = 1 ) )

			}

		}

		return buffer

	}

	/**
	 * Play a buffer.
	 *
	 * @param {AudioBuffer} buffer The buffer to play.
	 * @param {AudioContext} context The context to play the buffer in.
	 * @param {boolean} stop If true, stop the buffer.
	 * @returns {void}
	 */
	const playBuffer = ( buffer, context, stop ) => {

		var source = context.createBufferSource();

		source.buffer = buffer;
		source.connect( context.destination );
		source.start();

		stop && source.stop();

	};


	/**
	 * Play music in the p1 format.
	 *
	 * @param {string} params The music to play.
	 * @returns {void}
	 */
	p1 = ( params ) => {

		let tempo = 125;
		let noteLen = .5;
		trackLen = 0;

		// If params is a string, use it, otherwise use the first item from the array.
		params = typeof params === 'array' ? params[ 0 ] : params;

		// Process the tracks.
		tracks = params.replace( /[\!\|]/g, '' ).split( '\n' ).map(
			( track ) => {
				track = track.trim();

				if (
					( track[ 0 ] === '[' && track[ track.length - 1 ] === ']' ) ||
					( !isNaN( parseFloat( track ) ) )
				) {

					// If starts with [ and ends with ], then it's the tempo and note length.
					track = track.split( '.' );

					tempo = track[ 0 ];
					noteLen = track[ 1 ] / 100 || noteLen;

					return undefined;

				}

				if ( track.length === 0 ) {

					return undefined;

				}

				return track.split( '' ).map(
					( letter, i ) => {
						let duration = 1;
						let note = letter.charCodeAt( 0 );
						note -= note > 90 ? 71 : 65;

						while ( track[ i + duration ] == '-' ) {
							duration++;
						}

						if ( trackLen < i ) {
							trackLen = i + 1;
						}

						return makeNote( note, duration * noteLen * tempo / 125, 44100 )
					}
				);
			}
		).filter( ( element ) => element !== undefined );

		// console.log( tracks, tempo );
		// return;

		noteI = 0;
		clearInterval( interval );

		interval = setInterval(
			( j ) => {

				tracks.map(
					( track, trackI ) => {
						if ( track[ j = noteI % track.length ] ) {
							const contextId = ( trackI * contextsPerTrack ) + ( noteI % contextsPerTrack );
							playBuffer( track[ j ], contexts[ contextId ] )
						}
					}
				);

				// Next note.
				noteI++;

				// Loop notes.
				noteI %= trackLen;
			},
			tempo
		);
	}

}();

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
	beep8.Async.readLine = async function( initString = "", maxLen = -1, maxWidth = -1 ) {

		beep8.Core.preflight( "beep8.Async.readLine" );

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
	beep8.Async.menu = async function( choices, options = {} ) {

		beep8.Core.preflight( "beep8.Async.menu" );

		beep8.Utilities.checkArray( "choices", choices );
		beep8.Utilities.checkObject( "options", options );

		return await beep8.Menu.display( choices, options );

	}


	/**
	 * Displays a dialog with the given prompt and choices.
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


	/**
	 * Waits for a given number of seconds.
	 *
	 * @param {number} seconds - The duration to wait.
	 * @returns {Promise<void>} Resolves after the specified time.
	 */
	beep8.Async.wait = async function( seconds ) {

		beep8.Core.preflight( "beep8.Async.wait" );

		beep8.Utilities.checkNumber( "seconds", seconds );
		beep8.Core.render();

		return await new Promise( resolve => setTimeout( resolve, Math.round( seconds * 1000 ) ) );

	}


	/**
	 * Shows text slowly, character by character, as in a typewriter.
	 *
	 * @param {string} text - The text to print.
	 * @param {number} [delay=0.05] - The delay between characters in seconds.
	 * @returns {Promise<void>} Resolves after the text is printed.
	 */
	beep8.Async.typewriter = async function( text, delay = 0.05 ) {

		beep8.Core.preflight( "beep8.Async.typewriter" );

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

				if ( endPos >= 0 ) {
					i = endPos + beep8.CONFIG.PRINT_ESCAPE_END.length;
				}

			}

			const c = text.charCodeAt( i );
			beep8.locate( startCol, startRow );
			beep8.print( text.substring( 0, i ) );

			if ( c !== 32 ) {
				await beep8.Async.wait( delay );
			}

		}

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
	beep8.Async.loadFont = async function( fontImageFile ) {

		beep8.Core.preflight( "beep8.Async.loadFont" );

		beep8.Utilities.checkString( "fontImageFile", fontImageFile );
		const fontName = "FONT@" + fontImageFile;
		await beep8.Core.textRenderer.loadFontAsync( fontName, fontImageFile );

		return fontName;

	}

} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	beep8.Core = {};

	beep8.Core.textRenderer = null;
	beep8.Core.inputSys = null;
	beep8.Core.cursorRenderer = null;
	beep8.Core.realCanvas = null;
	beep8.Core.realCtx = null;
	beep8.Core.canvas = null;
	beep8.Core.ctx = null;
	beep8.Core.deltaTime = 0;

	beep8.Core.drawState = {
		fgColor: 7,
		bgColor: 0,  // -1 means transparent

		cursorCol: 0,
		cursorRow: 0,

		cursorVisible: false, // Don't change this directly, use cursorRenderer.setCursorVisible()
	};

	let lastFrameTime = null;
	let crashed = false;
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
		beep8.Core.asyncInit( callback );

	}


	/**
	 * Asynchronously initializes the engine.
	 *
	 * @param {Function} callback - The function to call when the engine is initialized.
	 * @returns {void}
	 */
	beep8.Core.asyncInit = async function( callback ) {

		beep8.Utilities.log( "beep8 System initialized" );

		// Computed values: width and height of screen in virtual pixels.
		beep8.CONFIG.SCREEN_WIDTH = beep8.CONFIG.SCREEN_COLS * beep8.CONFIG.CHR_WIDTH;
		beep8.CONFIG.SCREEN_HEIGHT = beep8.CONFIG.SCREEN_ROWS * beep8.CONFIG.CHR_HEIGHT;

		// Set up the real canvas (the one that really exists onscreen).
		beep8.Core.realCanvas = document.createElement( "canvas" );

		if ( beep8.CONFIG.CANVAS_SETTINGS && beep8.CONFIG.CANVAS_SETTINGS.CANVAS_ID ) {
			beep8.Core.realCanvas.setAttribute( "id", beep8.CONFIG.CANVAS_SETTINGS.CANVAS_ID );
		}

		if ( beep8.CONFIG.CANVAS_SETTINGS && beep8.CONFIG.CANVAS_SETTINGS.CANVAS_CLASSES ) {
			for ( const className of beep8.CONFIG.CANVAS_SETTINGS.CANVAS_CLASSES ) {
				beep8.Core.realCanvas.classList.add( className );
			}
		}

		// Prevent default touch events on touch devices.
		beep8.Core.realCanvas.addEventListener( "touchstart", e => e.preventDefault() );

		// Work out where to put the canvas.
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

		// Put the canvas in the container.
		container.appendChild( beep8.Core.realCanvas );

		// Set up the virtual canvas (the one we render to). This canvas isn't
		// part of the document( it's not added to document.body), it only
		// exists off-screen.
		beep8.Core.canvas = document.createElement( "canvas" );
		beep8.Core.canvas.width = beep8.CONFIG.SCREEN_WIDTH;
		beep8.Core.canvas.height = beep8.CONFIG.SCREEN_HEIGHT;
		beep8.Core.canvas.style.width = beep8.CONFIG.SCREEN_WIDTH + "px";
		beep8.Core.canvas.style.height = beep8.CONFIG.SCREEN_HEIGHT + "px";
		beep8.Core.ctx = beep8.Core.canvas.getContext( "2d" );
		beep8.Core.ctx.imageSmoothingEnabled = false;

		// Initialize subsystems
		beep8.Core.textRenderer = new beep8.TextRenderer();
		beep8.Core.inputSys = new beep8.Input();
		beep8.Core.cursorRenderer = new beep8.CursorRenderer();

		await beep8.Core.textRenderer.initAsync();

		// Update the positioning and size of the canvas.
		beep8.Core.updateLayout( false );
		window.addEventListener(
			"resize",
			() => beep8.Core.updateLayout( true )
		);

		if ( beep8.Core.isMobile() ) {
			beep8.Joystick.setup();
		}

		initDone = true;

		/**
		 * Work around an init bug where text would initially not render on
		 * Firefox. I'm not entirely sure I understand why, but this seems to
		 * fix it (perhaps waiting 1 frame gives the canvas time to initialize).
		 */
		await new Promise( resolve => setTimeout( resolve, 1 ) );
		await callback();

		beep8.Core.render();

	}


	/**
	 * Checks if the engine (ans specified method) is ready to run.
	 *
	 * @param {string} apiMethod - The name of the API method being called.
	 * @returns {void}
	 */
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


	/**
	 * Starts an asynchronous operation.
	 *
	 * @param {string} asyncMethodName - The name of the asynchronous method.
	 * @param {Function} resolve - The function to call when the operation is successful.
	 * @param {Function} reject - The function to call when the operation fails.
	 * @returns {void}
	 */
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
		};

		beep8.Core.render();

	}


	/**
	 * Checks if there is a pending asynchronous operation.
	 *
	 * @param {string} asyncMethodName - The name of the asynchronous method.
	 * @returns {boolean} True if there is a pending asynchronous operation.
	 */
	beep8.Core.hasPendingAsync = function( asyncMethodName ) {

		return pendingAsync && pendingAsync.name === asyncMethodName;

	}


	/**
	 * Ends an asynchronous operation.
	 *
	 * @param {string} asyncMethodName - The name of the asynchronous method.
	 * @param {boolean} isError - Whether the operation failed.
	 * @param {any} result - The result of the operation.
	 * @returns {void}
	 */
	beep8.Core.endAsyncImpl = function( asyncMethodName, isError, result ) {

		if ( !pendingAsync ) {
			throw new Error( `Internal bug: endAsync(${asyncMethodName}) called with no pendingAsync` );
		}

		if ( pendingAsync.name !== asyncMethodName ) {
			throw new Error(
				`Internal bug: endAsync(${asyncMethodName}) called but pendingAsync.name ` +
				`is ${pendingAsync.name}`
			);
		}

		const fun = isError ? pendingAsync.reject : pendingAsync.resolve;
		pendingAsync = null;
		fun( result );

	}


	/**
	 * Resolves an asynchronous operation.
	 *
	 * @param {string} asyncMethodName - The name of the asynchronous method.
	 * @param {any} result - The result of the operation.
	 * @returns {void}
	 */
	beep8.Core.resolveAsync = function( asyncMethodName, result ) {

		beep8.Core.endAsyncImpl( asyncMethodName, false, result );

	}


	/**
	 * Fails an asynchronous operation.
	 *
	 * @param {string} asyncMethodName - The name of the asynchronous method.
	 * @param {any} error - The error that occurred.
	 * @returns {void}
	 */
	beep8.Core.failAsync = function( asyncMethodName, error ) {

		beep8.Core.endAsyncImpl( asyncMethodName, true, error );

	}


	/**
	 * Set the callback function for the game loop. Will be called targetFps
	 * times per second.
	 *
	 * @param {Function} callback - The function to call.
	 * @param {number} [targetFps=30] - The target frames per second.
	 * @returns {void}
	 */
	beep8.Core.setFrameHandler = function( callback, targetFps = 30 ) {

		frameHandler = callback;
		frameHandlerTargetInterval = 1.0 / ( targetFps || 30 );
		timeToNextFrame = 0;

		if ( !animFrameRequested ) {
			window.requestAnimationFrame( beep8.Core.doFrame );
		}

	}


	/**
	 * Renders the screen.
	 *
	 * @returns {void}
	 */
	beep8.Core.render = function() {

		if ( crashed ) return;

		beep8.Core.realCtx.imageSmoothingEnabled = false;
		beep8.Core.realCtx.clearRect( 0, 0, beep8.Core.realCanvas.width, beep8.Core.realCanvas.height );
		beep8.Core.realCtx.drawImage(
			beep8.Core.canvas,
			0, 0,
			beep8.Core.realCanvas.width, beep8.Core.realCanvas.height
		);

		dirty = false;

		beep8.Core.cursorRenderer.drawCursor( beep8.Core.realCtx, beep8.Core.realCanvas.width, beep8.Core.realCanvas.height );

	}


	/**
	 * Marks the screen as dirty, so it will be re-rendered on the next frame.
	 *
	 * @returns {void}
	 */
	beep8.Core.markDirty = function() {

		if ( dirty ) return;

		dirty = true;
		setTimeout( beep8.Core.render, 1 );

	}


	/**
	 * Clears the screen and resets the cursor to the top-left corner.
	 *
	 * @returns {void}
	 */
	beep8.Core.cls = function() {

		beep8.Core.ctx.fillStyle = beep8.Core.getColorHex( beep8.Core.drawState.bgColor );
		beep8.Core.ctx.fillRect( 0, 0, beep8.Core.canvas.width, beep8.Core.canvas.height );

		this.setCursorLocation( 0, 0 );
		beep8.Core.markDirty();

	}


	/**
	 * Sets the colors used for text and background.
	 *
	 * @param {array} colors - A list of colours.
	 * @returns {void}
	 */
	beep8.Core.defineColors = function( colors ) {

		beep8.Utilities.checkArray( "colors", colors );
		beep8.CONFIG.COLORS = colors.slice();
		beep8.Core.textRenderer.regenColors();

	}


	/**
	 * Sets the colors used for text and background.
	 *
	 * @param {number} fg - The foreground color.
	 * @param {number} bg - The background color.
	 * @returns {void}
	 */
	beep8.Core.setColor = function( fg, bg ) {

		beep8.Utilities.checkNumber( "fg", fg );
		beep8.Core.drawState.fgColor = Math.round( fg );

		if ( bg !== undefined ) {
			beep8.Utilities.checkNumber( "bg", bg );
			beep8.Core.drawState.bgColor = Math.round( bg );
		}

	}


	/**
	 * Sets the cursor location.
	 *
	 * @param {number} col - The column.
	 * @param {number} row - The row.
	 * @returns {void}
	 */
	beep8.Core.setCursorLocation = function( col, row ) {

		beep8.Utilities.checkNumber( "col", col );

		if ( row !== undefined ) {
			beep8.Utilities.checkNumber( "row", row );
		}

		beep8.Core.drawState.cursorCol = Math.round( col );

		if ( row !== undefined ) {
			beep8.Core.drawState.cursorRow = Math.round( row );
		}

	}


	/**
	 * Gets the color for the specified index.
	 *
	 * @param {number} c - The color index.
	 * @returns {string} The color.
	 */
	beep8.Core.getColorHex = function( c ) {

		if ( typeof ( c ) !== "number" ) {
			return "#f0f";
		}

		if ( c < 0 ) {
			return "#000";
		}

		c = beep8.Utilities.clamp( Math.round( c ), 0, beep8.CONFIG.COLORS.length - 1 );

		return beep8.CONFIG.COLORS[ c ];

	}


	/**
	 * Gets the current time.
	 *
	 * @returns {number} The current time.
	 */
	beep8.Core.getNow = function() {

		if ( window.performance && window.performance.now ) {
			return window.performance.now();
		}

		return new Date().getTime();

	}


	/**
	 * Draws an image.
	 *
	 * @param {HTMLImageElement} img - The image to draw.
	 * @param {number} x - The x-coordinate of the upper-left corner of the image.
	 * @param {number} y - The y-coordinate of the upper-left corner of the image.
	 * @param {number} [srcX] - The x-coordinate of the upper-left corner of the source image.
	 * @param {number} [srcY] - The y-coordinate of the upper-left corner of the source image.
	 * @param {number} [width] - The width of the image.
	 * @param {number} [height] - The height of the image.
	 * @returns {void}
	 */
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
			beep8.Core.ctx.drawImage( img, srcX, srcY, width, height, x, y, width, height );
		} else {
			beep8.Core.ctx.drawImage( img, x, y );
		}

	}


	/**
	 * Draws a rectangle.
	 *
	 * @param {number} x - The x-coordinate of the upper-left corner of the rectangle.
	 * @param {number} y - The y-coordinate of the upper-left corner of the rectangle.
	 * @param {number} width - The width of the rectangle.
	 * @param {number} height - The height of the rectangle.
	 * @returns {void}
	 */
	beep8.Core.drawRect = function( x, y, width, height ) {

		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		beep8.Utilities.checkNumber( "width", width );
		beep8.Utilities.checkNumber( "height", height );

		let oldStrokeStyle = beep8.Core.ctx.strokeStyle;
		beep8.Core.ctx.strokeStyle = beep8.Core.getColorHex( beep8.Core.drawState.fgColor );
		beep8.Core.ctx.strokeRect(
			Math.round( x ) + 0.5, Math.round( y ) + 0.5,
			Math.round( width ) - 1, Math.round( height ) - 1
		);

		beep8.Core.ctx.strokeStyle = oldStrokeStyle;

	}


	/**
	 * Fills a rectangle.
	 *
	 * @param {number} x - The x-coordinate of the upper-left corner of the rectangle.
	 * @param {number} y - The y-coordinate of the upper-left corner of the rectangle.
	 * @param {number} width - The width of the rectangle.
	 * @param {number} height - The height of the rectangle.
	 * @returns {void}
	 */
	beep8.Core.fillRect = function( x, y, width, height ) {

		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		beep8.Utilities.checkNumber( "width", width );
		beep8.Utilities.checkNumber( "height", height );

		beep8.Core.ctx.fillStyle = beep8.Core.getColorHex( beep8.Core.drawState.fgColor );
		beep8.Core.ctx.fillRect(
			Math.round( x ) + 0.5, Math.round( y ) + 0.5,
			Math.round( width ) - 1, Math.round( height ) - 1
		);
	}


	/**
	 * Saves the current screen.
	 *
	 * @returns {ImageData} The saved screen.
	 */
	beep8.Core.saveScreen = function() {

		return beep8.Core.ctx.getImageData(
			0, 0,
			beep8.Core.canvas.width, beep8.Core.canvas.height
		);

	}


	/**
	 * Restores the screen.
	 *
	 * @param {ImageData} screenData - The screen to restore.
	 * @returns {void}
	 */
	beep8.Core.restoreScreen = function( screenData ) {

		beep8.Utilities.checkInstanceOf( "screenData", screenData, ImageData );
		beep8.Core.ctx.putImageData( screenData, 0, 0 );

	}


	/**
	 * Run the game loop.
	 * This function ensures we stay as close to the target frame rate as
	 * possible.
	 *
	 * @returns {void}
	 */
	beep8.Core.doFrame = async function() {

		// Flag to track if an animation frame has been requested is reset
		animFrameRequested = false;

		// Get the current time
		const now = beep8.Core.getNow();

		// Calculate the time difference between the current and last frame, or use a default value if this is the first frame
		beep8.Core.deltaTime = lastFrameTime !== null ? 0.001 * ( now - lastFrameTime ) : ( 1 / 60.0 );

		// Cap the delta time to prevent large time steps (e.g., if the browser tab was inactive)
		beep8.Core.deltaTime = Math.min( beep8.Core.deltaTime, 0.05 );

		// Update the last frame time to the current time
		lastFrameTime = now;

		// Accumulate the time to the next frame
		timeToNextFrame += beep8.Core.deltaTime;

		// Initialize the counter for the number of frames processed in this loop
		let numFramesDone = 0;

		// Process frames while there is a frame handler, the number of processed frames is less than 4, and the accumulated time exceeds the target interval
		// This helps to catch up with missed frames.
		while ( frameHandler && numFramesDone < 4 && timeToNextFrame > frameHandlerTargetInterval ) {
			// Await the frame handler's completion
			await frameHandler();

			// Call the input system's end frame handler
			beep8.Core.inputSys.onEndFrame();

			// Decrease the accumulated time by the target interval
			timeToNextFrame -= frameHandlerTargetInterval;

			// Increment the count of processed frames
			++numFramesDone;
		}

		// Call the render function to update the visuals
		beep8.Core.render();

		// If there is a frame handler, request the next animation frame
		if ( frameHandler ) {
			animFrameRequested = true;
			window.requestAnimationFrame( beep8.Core.doFrame );
		}

	}


	/**
	 * Updates the layout.
	 *
	 * @param {boolean} renderNow - Whether to render immediately.
	 * @returns {void}
	 */
	beep8.Core.updateLayout = function( renderNow ) {

		beep8.Core.updateLayout2d();

		if ( renderNow ) {
			beep8.Core.render();
		}

	}


	/**
	 * Updates the layout of the 2D canvas.
	 *
	 * @returns {void}
	 */
	beep8.Core.updateLayout2d = function() {

		const autoSize = !beep8.CONFIG.CANVAS_SETTINGS || beep8.CONFIG.CANVAS_SETTINGS.AUTO_SIZE;
		const autoPos = !beep8.CONFIG.CANVAS_SETTINGS || beep8.CONFIG.CANVAS_SETTINGS.AUTO_POSITION;

		let useAutoScale = typeof ( beep8.CONFIG.SCREEN_SCALE ) !== 'number';
		let scale;

		if ( useAutoScale ) {

			const frac = beep8.CONFIG.MAX_SCREEN_FRACTION || 0.8;
			const availableSize = autoSize ?
				{ width: frac * window.innerWidth, height: frac * window.innerHeight } :
				beep8.Core.realCanvas.getBoundingClientRect();
			scale = Math.floor( Math.min(
				availableSize.width / beep8.CONFIG.SCREEN_WIDTH,
				availableSize.height / beep8.CONFIG.SCREEN_HEIGHT ) );
			scale = Math.min( Math.max( scale, 1 ), 5 );
			beep8.Utilities.log( `Auto - scale: available size ${availableSize.width} x ${availableSize.height}, scale ${scale}, dpr ${window.devicePixelRatio}` );

		} else {

			scale = beep8.CONFIG.SCREEN_SCALE;

		}

		beep8.CONFIG.SCREEN_EL_WIDTH = beep8.CONFIG.SCREEN_WIDTH * scale;
		beep8.CONFIG.SCREEN_EL_HEIGHT = beep8.CONFIG.SCREEN_HEIGHT * scale;
		beep8.CONFIG.SCREEN_REAL_WIDTH = beep8.CONFIG.SCREEN_WIDTH * scale;
		beep8.CONFIG.SCREEN_REAL_HEIGHT = beep8.CONFIG.SCREEN_HEIGHT * scale;

		if ( autoSize ) {

			beep8.Core.realCanvas.style.width = beep8.CONFIG.SCREEN_EL_WIDTH + "px";
			beep8.Core.realCanvas.style.height = beep8.CONFIG.SCREEN_EL_HEIGHT + "px";
			beep8.Core.realCanvas.width = beep8.CONFIG.SCREEN_REAL_WIDTH;
			beep8.Core.realCanvas.height = beep8.CONFIG.SCREEN_REAL_HEIGHT;

		} else {

			const actualSize = beep8.Core.realCanvas.getBoundingClientRect();
			beep8.Core.realCanvas.width = actualSize.width;
			beep8.Core.realCanvas.height = actualSize.height;

		}

		beep8.Core.realCtx = beep8.Core.realCanvas.getContext( "2d" );
		beep8.Core.realCtx.imageSmoothingEnabled = false;

		if ( autoPos ) {

			beep8.Core.realCanvas.style.position = "absolute";
			beep8.Core.realCanvas.style.left = Math.round( ( window.innerWidth - beep8.Core.realCanvas.width ) / 2 ) + "px";
			beep8.Core.realCanvas.style.top = Math.round( ( window.innerHeight - beep8.Core.realCanvas.height ) / 2 ) + "px";

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
				scanLinesEl.style.left = beep8.Core.realCanvas.style.left;
				scanLinesEl.style.top = beep8.Core.realCanvas.style.top;
				scanLinesEl.style.width = beep8.Core.realCanvas.style.width;
				scanLinesEl.style.height = beep8.Core.realCanvas.style.height;
				scanLinesEl.style.zIndex = 1;

			} else {

				console.error( "beep8: 2D scanlines effect only works if beep8.CONFIG.CANVAS_SETTINGS.AUTO_POS and AUTO_SIZE are both on." );

			}

		}

	}


	//
	let crashing = false;


	/**
	 * Handles a crash.
	 *
	 * @param {string} [errorMessage="Fatal error"] - The error message to display.
	 * @returns {void}
	 */
	beep8.Core.handleCrash = function( errorMessage = "Fatal error" ) {

		if ( crashed || crashing ) return;

		crashing = true;

		beep8.Core.setColor( beep8.CONFIG.COLORS.length - 1, 0 );
		beep8.Core.cls();

		beep8.Core.drawState.cursorCol = beep8.Core.drawState.cursorRow = 1;
		beep8.Core.textRenderer.print( "*** CRASH ***:\n" + errorMessage );
		beep8.Core.render();

		crashing = false;
		crashed = true;

	}


	/**
	 * Is this a mobile device?
	 *
	 * @returns {boolean} True if this is a mobile device.
	 */
	beep8.Core.isMobile = function() {

		return beep8.Core.isIOS() || beep8.Core.isAndroid();

	}


	/**
	 * Is this an iOS device?
	 *
	 * @returns {boolean} True if this is an iOS device.
	 */
	beep8.Core.isIOS = function() {

		return /(ipad|ipod|iphone)/i.test( navigator.userAgent );

	}


	/**
	 * Is this an Android device?
	 *
	 * @returns {boolean} True if this is an Android device.
	 */
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
		 *
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
				beep8.Sfx.play( 'click' );

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
	beep8.Menu.display = async function( choices, options ) {

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

			beep8.Menu.printChoices( choices, selIndex, options );

			const k = await beep8.Core.inputSys.readKeyAsync();

			if ( k === "ArrowUp" ) {

				// Go up the menu.
				selIndex = selIndex > 0 ? selIndex - 1 : choices.length - 1;
				if ( choices.length > 1 ) beep8.Sfx.play( "beep3" );

			} else if ( k === "ArrowDown" ) {

				// Go down the menu.
				selIndex = ( selIndex + 1 ) % choices.length;
				if ( choices.length > 1 ) beep8.Sfx.play( "beep2" );

			} else if ( k === "Enter" || k === "ButtonA" ) {

				// Select menu item.
				beep8.Sfx.play( "beep" );
				return selIndex;

			} else if ( ( k === "Escape" || k === "ButtonB" ) && options.cancelable ) {

				// Close menu.
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

	const audioContext = typeof AudioContext !== 'undefined' ? new AudioContext : new webkitAudioContext;

	// Predefined list of start patterns
	const startPatterns = [
		"X-X-",
		"XX--",
	];

	// Predefined list of follow-up patterns
	const followPatterns = [
		"X--X",
		"X-X-",
		"XX--",
		// "X X-",
		// "-X-X",
		// "--XX",
		// "X---",
		// "-X--",
		// "X---X---",
		// "X---    "
	];

	const bassPatterns = [
		'X---',
		'X---X---',
		'X-------',
		'X-X-X-X-',
		'X-------X-------',
		'X-------        ',
		'        X-------',
	];

	const scales = {

		// [ 2, 2, 1, 2, 2, 2, 1 ], // major.
		// [ 0, 0, 1, 0, 0, -1 ],
		// [ 1, 1, 1, -2, 1, 1 ],
		// [ 1, -1, 1, -1, 1, -1 ],
		// [ 1, -1 ],
		// [ 1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1 ],

		minor: [ 2, 1, 2, 2, 1, 2, 2 ],
		harmonicMinor: [ 2, 1, 2, 2, 1, 3, 1 ],
		melodicMinorAscending: [ 2, 1, 2, 2, 2, 2, 1 ],
		melodicMinorDescending: [ 2, 1, 2, 2, 1, 2, 2 ], // Same as natural minor
		pentatonicMajor: [ 2, 2, 3, 2, 3 ],
		pentatonicMinor: [ 3, 2, 2, 3, 2 ],
		blues: [ 3, 2, 1, 1, 3, 2 ],
		chromatic: [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
		wholeTone: [ 2, 2, 2, 2, 2, 2 ],
		dorian: [ 2, 1, 2, 2, 2, 1, 2 ],
		phrygian: [ 1, 2, 2, 2, 1, 2, 2 ],
		lydian: [ 2, 2, 2, 1, 2, 2, 1 ],
		mixolydian: [ 2, 2, 1, 2, 2, 1, 2 ],
		aeolian: [ 2, 1, 2, 2, 1, 2, 2 ], // Same as natural minor
		locrian: [ 1, 2, 2, 1, 2, 2, 2 ],
		// Exotic Scales
		phrygianDominant: [ 1, 3, 1, 2, 1, 2, 2 ],
		hungarianMinor: [ 2, 1, 3, 1, 1, 3, 1 ],
		gypsy: [ 1, 3, 1, 2, 1, 3, 1 ],
		japanese: [ 1, 4, 2, 1, 4 ],
		arabian: [ 2, 2, 1, 1, 2, 2, 2 ],
		eastern: [ 1, 2, 2, 1, 1, 3, 1 ],
	};

	const scaleRangeDistance = [
		3,
		2, 2,
		1, 1, 1,
		0, 0, 0, 0,
		-1, -1, -1,
		-2, -2,
		-3,
	];

	const speedRange = [ 75, 100, 150, 200, 250, 300 ];
	const durationRange = [ 40, 50, 60, 70, 80, 90 ];


	const scaleRange = 12;
	const noteMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split( '' );



	beep8.Music = {};


	/**
	 * Play a song.
	 *
	 * @param {string} song The song to play.
	 * @returns {void}
	 */
	beep8.Music.play = function( song ) {

		console.log( 'play song', song );
		p1( song );

	}


	/**
	 * Create a song.
	 *
	 * @returns {string} The song.
	 */
	beep8.Music.create = function() {

		let melody = [];

		// Pick a random key from the list of scales.
		let scaleKeys = Object.keys( scales );
		let scaleIndex = scaleKeys[ Math.floor( Math.random() * scaleKeys.length ) ];

		// The main 'song' melody.
		const pattern = generatePattern( 8, startPatterns, followPatterns );
		melody.push( generateMelody( generateScale( 2, scaleIndex ), pattern ) );
		melody.push( generateMelody( generateScale( 1, scaleIndex ), pattern ) );

		// Add some BASS.
		// Number of patterns to add to the bass line.
		const bassRepeat = Math.floor( Math.random() * 3 ) + 1;
		// Generate the bass line.
		melody.push( generateMelody( generateScale( 0, scaleIndex ), generatePattern( bassRepeat, [], bassPatterns ) ) );

		// Return.
		// Should change this and the p1 player so they accept JSON rather than a weird string.
		return `${beep8.Utilities.randomPick( speedRange )}.${beep8.Utilities.randomPick( durationRange )}
${melody.join( '\n' )}`;

	};


	/**
	 * Generate a note scale.
	 *
	 * @param {number} noteMapId The group of keys to start from.
	 * @param {string} scaleIndex The scale pattern to use.
	 * @returns {string[]} The scale.
	 */
	function generateScale( noteMapId, scaleIndex ) {

		const startNote = noteMapId * scaleRange;

		let scale = [];
		let currentIndex = startNote;

		// Generate the list of notes that can be used.
		for ( let interval of scales[ scaleIndex ] ) {
			scale.push( noteMap[ currentIndex ] );
			console.log( noteMap[ currentIndex ], currentIndex );
			currentIndex += interval;
		}

		return scale;

	}


	/**
	 * Generate a rhythmic pattern from predefined patterns
	 *
	 * @param {number} totalPatterns The number of patterns to generate.
	 * @param {string[]} startPatterns The list of start patterns.
	 * @param {string[]} followPatterns The list of follow patterns.
	 * @returns {string} The generated pattern.
	 */
	function generatePattern( totalPatterns = 4, startPatterns = startPatterns, followPatterns = followPatterns ) {

		if ( totalPatterns < 1 ) {
			return '';
		}

		let pattern = [];

		// Ensure there is at least one start pattern
		if ( startPatterns.length > 0 ) {
			pattern.push( startPatterns[ Math.floor( Math.random() * startPatterns.length ) ] );
		}

		if ( followPatterns.length > 0 ) {

			// Add subsequent patterns from the followPatterns list
			for ( let i = 1; i < totalPatterns; i++ ) {
				let randomPattern = followPatterns[ Math.floor( Math.random() * followPatterns.length ) ];
				let patternRepeat = Math.floor( Math.random() * 3 ) + 1;

				for ( let j = 0; j < patternRepeat; j++ ) {
					pattern.push( randomPattern );
				}
			}

		}

		console.log( pattern );

		return pattern.join( '|' );

	}


	// Function to generate a melody based on a scale and a rhythmic pattern
	function generateMelody( scale, rhythmPattern ) {

		let melody = "";
		// Pick a random index from scale array to start from.
		let scaleIndex = Math.floor( Math.random() * scale.length );


		for ( let i = 0; i < rhythmPattern.length; i++ ) {
			if ( rhythmPattern[ i ] === '-' ) {
				melody += '-';
			}

			if ( rhythmPattern[ i ] === ' ' ) {
				melody += ' ';
			}

			if ( rhythmPattern[ i ] === '|' ) {
				melody += '|';
			}

			if ( rhythmPattern[ i ] === 'X' ) {

				melody += scale[ scaleIndex ];
				scaleIndex += scaleRangeDistance[ Math.floor( Math.random() * scaleRangeDistance.length ) ];
				if ( scaleIndex < 0 ) {
					scaleIndex = 0;
				}
				if ( scaleIndex >= scale.length ) {
					scaleIndex = scale.length - 1;
				}
			}
		}

		return melody;

	}


} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {


	/**
	 * Sound effect library.
	 *
	 * @see https://codepen.io/KilledByAPixel/pen/BaowKzv?editors=1000
	 * @see https://codepen.io/KilledByAPixel/pen/BaowKzv?editors=1000
	 * @type {Object}
	 */
	const sfxLibrary = {
		coin: {
			staccato: 0.55,
			notes: [
				"E5 e",
				"E6 q"
			]
		},
		coin2: {
			notes: [
				'G5 e',
				'G6 q',
			]
		},
		jump: {
			smoothing: 1,
			notes: [
				"E4 e",
				"E3 q"
			]
		},
		change: {
			notes: [
				"B3 e",
				"D4b e",
				"D4 e",
				"E4 e"
			]
		},
		die: {
			staccato: 0.55,
			gain: 0.4,
			notes: [
				"E0 e",
				"F0 e",
				"E0 h",
			]
		},
		knockout: {
			staccato: 0.2,
			notes: [
				"E6 e",
				"E5 e",
				"E4 e",
				"E3 q",
			]
		},
		dash: {
			smoothing: 1,
			notes: [
				"E2 q",
				"E5 q"
			]
		},
		beep: {
			staccato: 0.55,
			waveType: 'sine',
			gain: 0.8,
			notes: [
				'G3 e',
			]
		},
		beep2: {
			staccato: 0.55,
			waveType: 'sine',
			gain: 0.7,
			notes: [
				'G4 e',
			]
		},
		beep3: {
			staccato: 0.55,
			waveType: 'sine',
			gain: 0.7,
			notes: [
				'G5 e',
			]
		},
		stars: {
			staccato: 0.2,
			waveType: 'triangle',
			gain: 0.5,
			notes: [
				'C6 s',
				'C6 s',
				'B6 s',
				'B6 s',
				'A6 s',
			]
		},
		engine: {
			customWave: [ [ -1, 1, -1, 1, -1, 1 ], [ 1, 0, 1, 0, 1, 0 ] ],
			gain: 0.8,
			notes: [
				'C1 w',
				'C1 w'
			]
		},
		next: {
			customWave: [ -1, -0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9, 1 ],
			gain: 0.8,
			notes: [
				'C2 e',
				'C3 e',
				'D2 e',
				'D3 e',
				'E2 e',
				'E3 e',
			]
		},
		start: {
			notes: [
				'D4 h',
				'- h',
				'D4 h',
				'- h',
				'G4 w',
			]
		},
		buzzbuzzbuzz: {
			gain: 0.35,
			notes: [
				'E1 e',
				'- s',
				'E1 e',
				'- s',
				'E1 e',
				'- s',
				'E1 e',
				'- s',
				'E1 e',
				'- s',
				'E1 e',
				'- s',
				'E1 e',
				'- s',
				'E1 e',
			]
		},
		siren: {
			smoothing: 0.5,
			notes: [
				'C4 h',
				'A3 h',
				'C4 h',
				'A3 h',
				'C4 h',
				'A3 h',
				'C4 h',
				'A3 h',
				'C4 h',
				'A3 h',
			],
		},
		click: {
			staccato: 0.8,
			notes: [
				'A5 e',
			]
		},
	};


	/**
	 * Cached sequence objects.
	 *
	 * @type {Object}
	 */
	const sfxSequence = {};


	/**
	 * AudioContext object.
	 *
	 * @type {AudioContext}
	 */
	const audioContext = typeof AudioContext !== 'undefined' ? new AudioContext : new webkitAudioContext;


	beep8.Sfx = {};


	/**
	 * Play a sound effect.
	 *
	 * @param {string} sfx The sound effect to play.
	 * @throws {Error} If the sfx is not found.
	 */
	beep8.Sfx.play = function( sfx ) {

		// AudioContext is not supported.
		if ( !audioContext ) {
			return;
		}

		beep8.Utilities.checkString( 'sfx', sfx );

		// SFX not found.
		if ( !sfxLibrary[ sfx ] ) {
			beep8.Utilities.error( `SFX ${sfx} not found.` );
		}

		// Setup the sfx sequence if it doesn't exist.
		if ( !sfxSequence[ sfx ] ) {

			sfxSequence[ sfx ] = new TinyMusic.Sequence(
				audioContext,
				sfxLibrary[ sfx ].tempo || 300,
				sfxLibrary[ sfx ].notes
			);

			sfxSequence[ sfx ].loop = false;
			sfxSequence[ sfx ].gain.gain.value = sfxLibrary[ sfx ].gain || 0.1;

			if ( sfxLibrary[ sfx ].staccato ) {
				sfxSequence[ sfx ].staccato = sfxLibrary[ sfx ].staccato;
			}

			if ( sfxLibrary[ sfx ].smoothing ) {
				sfxSequence[ sfx ].smoothing = sfxLibrary[ sfx ].smoothing;
			}

			if ( sfxLibrary[ sfx ].waveType ) {
				sfxSequence[ sfx ].waveType = sfxLibrary[ sfx ].waveType;
			}

			if ( sfxLibrary[ sfx ].customWave ) {

				beep8.Utilities.checkArray( 'customWave', sfxLibrary[ sfx ].customWave );

				if ( sfxLibrary[ sfx ].customWave.length === 2 ) {
					sfxSequence[ sfx ].createCustomWave( sfxLibrary[ sfx ].customWave[ 0 ], sfxLibrary[ sfx ].customWave[ 1 ] );
				} else {
					sfxSequence[ sfx ].createCustomWave( sfxLibrary[ sfx ].customWave );
				}

			}

		}

		sfxSequence[ sfx ].play( audioContext.currentTime );

	}


	/**
	 * Get the list of sfx from the library.
	 *
	 * @return {Array} The list of sfx.
	 */
	beep8.Sfx.get = function() {

		// return sfxLibrary keys.
		return Object.keys( sfxLibrary );

	}

} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	// Define the musical parameters
	const styles = {
		classical: {
			roots: "CDEFGAB".split( "" ),
			modes: [ "maj", "min" ],
			len_seqs: [
				[ 1 ],
				[ 2, 2 ],
				[ 2, 4, 4 ],
				[ 2, 4, 8, 8 ],
				[ 4, 4, 4, 4 ],
				[ 2, 8, 8, 8, 8 ],
				[ 4, 4, 4, 8, 8 ],
				[ 8, 8, 8, 8, 8, 8, 8, 8 ],
			],
			numNotes: 64,
			numTracks: 4,
			tempo: 600,
			sustain: 70,
		},
		jazz: {
			roots: "CDEFGAB".split( "" ),
			modes: [ "maj", "min", "blues", "pentatonic" ],
			len_seqs: [
				[ 2, 2, 2, 2, 2, 2 ],
				[ 3, 3, 3 ],
				[ 4, 4, 8 ],
				[ 8, 8 ],
			],
			numNotes: 48,
			numTracks: 5,
			tempo: 450,
			sustain: 60,
		},
		rock: {
			roots: "CDEFGAB".split( "" ),
			modes: [ "maj", "min", "pentatonic" ],
			len_seqs: [
				[ 4, 4, 4, 4 ],
				[ 8, 8, 8, 8 ],
				[ 4, 8, 8, 8 ],
			],
			numNotes: 32,
			numTracks: 3,
			tempo: 500,
			sustain: 80,
		},
		electro: {
			roots: "CDEFGAB".split( "" ),
			modes: [ "maj", "min" ],
			len_seqs: [
				[ 8, 8, 8, 8, 8, 8, 8, 8 ],
				[ 16, 16, 16, 16 ],
				[ 8, 8, 16, 16 ],
			],
			numNotes: 32,
			numTracks: 2,
			tempo: 400,
			sustain: 90,
		}
	};

	beep8.Sound = {};



	beep8.Sound.playSong = function( song ) {

		console.log( 'play song', song );
		p1( song );

	};

	beep8.Sound.stopSong = function() {

		p1( '' );

	};


	beep8.Sound.createMusic = function() {

		function generateP1Music( seed, style ) {

			// Set up the seed-based random number generator
			const generator = new Math.seedrandom( seed );

			const selectedStyle = styles[ style ];
			const { roots, modes, len_seqs, numNotes, numTracks, tempo, sustain } = selectedStyle;

			// Generate a random key and mode
			const root = roots[ Math.floor( generator() * roots.length ) ];
			const mode = modes[ Math.floor( generator() * modes.length ) ];

			// Generate the musical scale
			const scale = generateScale( root, mode, 2, 5 );

			// Define a simple Markov chain for note transitions
			const markovChain = {
				"C": [ "D", "E", "G" ],
				"D": [ "E", "F", "A" ],
				"E": [ "F", "G", "C" ],
				"F": [ "G", "A", "D" ],
				"G": [ "A", "B", "E" ],
				"A": [ "B", "C", "F" ],
				"B": [ "C", "D", "G" ]
			};

			// Generate the sequences of notes for each track
			const tracks = [];
			for ( let t = 0; t < numTracks; t++ ) {
				const notes = generateNotes( scale, len_seqs, generator, 8, numNotes, markovChain );
				const p1Music = convertNotesToP1( notes );
				tracks.push( p1Music );
			}

			// Combine tracks into the p1 format with tempo and sustain
			const p1FormattedMusic = `${tempo}.${sustain}\n${tracks.join( '\n' )}`;

			// Return the p1 formatted music string
			return p1FormattedMusic;
		}

		// Helper functions

		function generateScale( root, mode, min_oct, max_oct ) {
			const steps = {
				maj: [ 2, 2, 1, 2, 2, 2, 1 ],
				min: [ 2, 1, 2, 2, 1, 2, 2 ],
				blues: [ 3, 2, 1, 1, 3, 2 ],
				pentatonic: [ 2, 2, 3, 2, 3 ],
			}[ mode ];
			const notes = "CDEFGAB".split( "" );
			let scale = [];
			for ( let oct = min_oct; oct <= max_oct; oct++ ) {
				let noteIndex = notes.indexOf( root );
				for ( let step of steps ) {
					scale.push( notes[ noteIndex ] + oct );
					noteIndex = ( noteIndex + step ) % notes.length;
				}
			}
			return scale;
		}

		function generateNotes( scale, len_seqs, generator, res, numNotes, markovChain ) {
			let notes = "";
			let currentNote = scale[ Math.floor( generator() * scale.length ) ];
			for ( let i = 0; i < numNotes; i++ ) {
				const seq = len_seqs[ Math.floor( generator() * len_seqs.length ) ];
				const len = seq[ Math.floor( generator() * seq.length ) ];
				const noteLen = res / len;
				notes += currentNote[ 0 ] + currentNote[ 1 ] + "-".repeat( noteLen - 1 ) + " ";
				currentNote = getNextNoteUsingMarkovChain( currentNote, markovChain, generator );
			}
			return notes.trim();
		}

		function getNextNoteUsingMarkovChain( currentNote, markovChain, generator ) {
			const note = currentNote[ 0 ]; // Extract the note (ignoring the octave)
			const possibleNextNotes = markovChain[ note ];
			const nextNote = possibleNextNotes[ Math.floor( generator() * possibleNextNotes.length ) ];
			return nextNote + currentNote[ 1 ]; // Keep the same octave as the current note
		}

		function convertNotesToP1( notes ) {
			const p1Letters = {
				C2: "C", D2: "D", E2: "E", F2: "F", G2: "G", A2: "A", B2: "B",
				C3: "V", D3: "W", E3: "X", F3: "Y", G3: "Z", A3: "a", B3: "b",
				C4: "c", D4: "d", E4: "e", F4: "f", G4: "g", A4: "h", B4: "i",
				C5: "j", D5: "k", E5: "l", F5: "m", G5: "n", A5: "o", B5: "p"
			};

			let p1String = "";
			for ( let note of notes.split( " " ) ) {
				const p1Note = p1Letters[ note[ 0 ] + note[ 1 ] ];
				p1String += p1Note ? p1Note + note.slice( 2 ) : " ";
			}

			return p1String.trim();
		}

		// Example usage
		const seed = "d12d21ddd";
		const music = generateP1Music( seed, 'rock' );
		console.log( music );


		return music;

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

		beep8.Utilities.checkNumber( "lowInclusive", lowInclusive );
		beep8.Utilities.checkNumber( "highInclusive", highInclusive );

		lowInclusive = Math.round( lowInclusive );
		highInclusive = Math.round( highInclusive );

		if ( highInclusive <= lowInclusive ) {
			return lowInclusive;
		}

		return beep8.Utilities.clamp(
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

		beep8.Utilities.checkArray( "array", array );

		return array.length > 0 ? array[ beep8.Utilities.randomInt( 0, array.length - 1 ) ] : null;

	}


	/**
	 * Shuffles an array, randomly reordering the elements.
	 * Does not modify the original array. Returns the shuffled array.
	 *
	 * @param {Array} array - The array to shuffle.
	 * @returns {Array} The shuffled array.
	 */
	beep8.Utilities.shuffleArray = function( array ) {

		beep8.Utilities.checkArray( "array", array );

		array = array.slice();

		for ( let i = 0; i < array.length; i++ ) {
			const j = beep8.Utilities.randomInt( 0, array.length - 1 );
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

		beep8.Utilities.checkNumber( "x0", x0 );
		beep8.Utilities.checkNumber( "y0", y0 );
		beep8.Utilities.checkNumber( "x1", x1 );
		beep8.Utilities.checkNumber( "y1", y1 );

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

		beep8.Utilities.checkNumber( "as", as );
		beep8.Utilities.checkNumber( "ae", ae );
		beep8.Utilities.checkNumber( "bs", bs );
		beep8.Utilities.checkNumber( "be", be );

		if ( result ) {
			beep8.Utilities.checkObject( "result", result );
		}

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

		beep8.Utilities.checkObject( "r1", r1 );
		beep8.Utilities.checkObject( "r2", r2 );
		beep8.Utilities.checkNumber( "r1.x", r1.x );
		beep8.Utilities.checkNumber( "r1.y", r1.y );
		beep8.Utilities.checkNumber( "r1.w", r1.w );
		beep8.Utilities.checkNumber( "r1.h", r1.h );
		beep8.Utilities.checkNumber( "r2.x", r2.x );
		beep8.Utilities.checkNumber( "r2.y", r2.y );
		beep8.Utilities.checkNumber( "r2.w", r2.w );
		beep8.Utilities.checkNumber( "r2.h", r2.h );
		beep8.Utilities.checkNumber( "dx1", dx1 );
		beep8.Utilities.checkNumber( "dx2", dx2 );
		beep8.Utilities.checkNumber( "dy1", dy1 );
		beep8.Utilities.checkNumber( "dy2", dy2 );

		if ( result ) {
			checkObject( "result", result );
		}

		const xint = intersectRects_xint;
		const yint = intersectRects_yint;

		if (
			!beep8.Utilities.intersectIntervals(
				r1.x + dx1,
				r1.x + dx1 + r1.w - 1,
				r2.x + dx2,
				r2.x + dx2 + r2.w - 1, xint
			)
		) {
			return false;
		}

		if (
			!beep8.Utilities.intersectIntervals(
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

function generatePerlinNoise( width, height, options ) {

	options = options || {};
	var octaveCount = options.octaveCount || 4;
	var amplitude = options.amplitude || 0.1;
	var persistence = options.persistence || 0.2;
	var whiteNoise = generateWhiteNoise( width, height );

	var smoothNoiseList = new Array( octaveCount );
	var i;
	for ( i = 0; i < octaveCount; ++i ) {
		smoothNoiseList[ i ] = generateSmoothNoise( i );
	}
	var perlinNoise = new Array( width * height );
	var totalAmplitude = 0;
	// blend noise together
	for ( i = octaveCount - 1; i >= 0; --i ) {
		amplitude *= persistence;
		totalAmplitude += amplitude;

		for ( var j = 0; j < perlinNoise.length; ++j ) {
			perlinNoise[ j ] = perlinNoise[ j ] || 0;
			perlinNoise[ j ] += smoothNoiseList[ i ][ j ] * amplitude;
		}
	}
	// normalization
	for ( i = 0; i < perlinNoise.length; ++i ) {
		perlinNoise[ i ] /= totalAmplitude;
	}

	return perlinNoise;

	function generateSmoothNoise( octave ) {
		var noise = new Array( width * height );
		var samplePeriod = Math.pow( 2, octave );
		var sampleFrequency = 1 / samplePeriod;
		var noiseIndex = 0;
		for ( var y = 0; y < height; ++y ) {
			var sampleY0 = Math.floor( y / samplePeriod ) * samplePeriod;
			var sampleY1 = ( sampleY0 + samplePeriod ) % height;
			var vertBlend = ( y - sampleY0 ) * sampleFrequency;
			for ( var x = 0; x < width; ++x ) {
				var sampleX0 = Math.floor( x / samplePeriod ) * samplePeriod;
				var sampleX1 = ( sampleX0 + samplePeriod ) % width;
				var horizBlend = ( x - sampleX0 ) * sampleFrequency;

				// blend top two corners
				var top = interpolate( whiteNoise[ sampleY0 * width + sampleX0 ], whiteNoise[ sampleY1 * width + sampleX0 ], vertBlend );
				// blend bottom two corners
				var bottom = interpolate( whiteNoise[ sampleY0 * width + sampleX1 ], whiteNoise[ sampleY1 * width + sampleX1 ], vertBlend );
				// final blend
				noise[ noiseIndex ] = interpolate( top, bottom, horizBlend );
				noiseIndex += 1;
			}
		}
		return noise;
	}
}
/*
Copyright 2019 David Bau.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

!( function( global, pool, math ) {
	//
	// The following constants are related to IEEE 754 limits.
	//

	var width = 256,        // each RC4 output is 0 <= x < 256
		chunks = 6,         // at least six RC4 outputs for each double
		digits = 52,        // there are 52 significant digits in a double
		rngname = 'random', // rngname: name for Math.random and Math.seedrandom
		startdenom = math.pow( width, chunks ),
		significance = math.pow( 2, digits ),
		overflow = significance * 2,
		mask = width - 1,
		nodecrypto;         // node.js crypto module, initialized at the bottom.

	//
	// seedrandom()
	// This is the seedrandom function described above.
	//
	function seedrandom( seed, options, callback ) {
		var key = [];
		options = ( options == true ) ? { entropy: true } : ( options || {} );

		// Flatten the seed string or build one from local entropy if needed.
		var shortseed = mixkey( flatten(
			options.entropy ? [ seed, tostring( pool ) ] :
				( seed == null ) ? autoseed() : seed, 3 ), key );

		// Use the seed to initialize an ARC4 generator.
		var arc4 = new ARC4( key );

		// This function returns a random double in [0, 1) that contains
		// randomness in every bit of the mantissa of the IEEE 754 value.
		var prng = function() {
			var n = arc4.g( chunks ),             // Start with a numerator n < 2 ^ 48
				d = startdenom,                 //   and denominator d = 2 ^ 48.
				x = 0;                          //   and no 'extra last byte'.
			while ( n < significance ) {          // Fill up all significant digits by
				n = ( n + x ) * width;              //   shifting numerator and
				d *= width;                       //   denominator and generating a
				x = arc4.g( 1 );                    //   new least-significant-byte.
			}
			while ( n >= overflow ) {             // To avoid rounding up, before adding
				n /= 2;                           //   last byte, shift everything
				d /= 2;                           //   right using integer math until
				x >>>= 1;                         //   we have exactly the desired bits.
			}
			return ( n + x ) / d;                 // Form the number within [0, 1).
		};

		prng.int32 = function() { return arc4.g( 4 ) | 0; }
		prng.quick = function() { return arc4.g( 4 ) / 0x100000000; }
		prng.double = prng;

		// Mix the randomness into accumulated entropy.
		mixkey( tostring( arc4.S ), pool );

		// Calling convention: what to return as a function of prng, seed, is_math.
		return ( options.pass || callback ||
			function( prng, seed, is_math_call, state ) {
				if ( state ) {
					// Load the arc4 state from the given state if it has an S array.
					if ( state.S ) { copy( state, arc4 ); }
					// Only provide the .state method if requested via options.state.
					prng.state = function() { return copy( arc4, {} ); }
				}

				// If called as a method of Math (Math.seedrandom()), mutate
				// Math.random because that is how seedrandom.js has worked since v1.0.
				if ( is_math_call ) { math[ rngname ] = prng; return seed; }

				// Otherwise, it is a newer calling convention, so return the
				// prng directly.
				else return prng;
			} )(
				prng,
				shortseed,
				'global' in options ? options.global : ( this == math ),
				options.state );
	}

	//
	// ARC4
	//
	// An ARC4 implementation.  The constructor takes a key in the form of
	// an array of at most (width) integers that should be 0 <= x < (width).
	//
	// The g(count) method returns a pseudorandom integer that concatenates
	// the next (count) outputs from ARC4.  Its return value is a number x
	// that is in the range 0 <= x < (width ^ count).
	//
	function ARC4( key ) {
		var t, keylen = key.length,
			me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

		// The empty key [] is treated as [0].
		if ( !keylen ) { key = [ keylen++ ]; }

		// Set up S using the standard key scheduling algorithm.
		while ( i < width ) {
			s[ i ] = i++;
		}
		for ( i = 0; i < width; i++ ) {
			s[ i ] = s[ j = mask & ( j + key[ i % keylen ] + ( t = s[ i ] ) ) ];
			s[ j ] = t;
		}

		// The "g" method returns the next (count) outputs as one number.
		( me.g = function( count ) {
			// Using instance members instead of closure state nearly doubles speed.
			var t, r = 0,
				i = me.i, j = me.j, s = me.S;
			while ( count-- ) {
				t = s[ i = mask & ( i + 1 ) ];
				r = r * width + s[ mask & ( ( s[ i ] = s[ j = mask & ( j + t ) ] ) + ( s[ j ] = t ) ) ];
			}
			me.i = i; me.j = j;
			return r;
			// For robust unpredictability, the function call below automatically
			// discards an initial batch of values.  This is called RC4-drop[256].
			// See http://google.com/search?q=rsa+fluhrer+response&btnI
		} )( width );
	}

	//
	// copy()
	// Copies internal state of ARC4 to or from a plain object.
	//
	function copy( f, t ) {
		t.i = f.i;
		t.j = f.j;
		t.S = f.S.slice();
		return t;
	};

	//
	// flatten()
	// Converts an object tree to nested arrays of strings.
	//
	function flatten( obj, depth ) {
		var result = [], typ = ( typeof obj ), prop;
		if ( depth && typ == 'object' ) {
			for ( prop in obj ) {
				try { result.push( flatten( obj[ prop ], depth - 1 ) ); } catch ( e ) { }
			}
		}
		return ( result.length ? result : typ == 'string' ? obj : obj + '\0' );
	}

	//
	// mixkey()
	// Mixes a string seed into a key that is an array of integers, and
	// returns a shortened string seed that is equivalent to the result key.
	//
	function mixkey( seed, key ) {
		var stringseed = seed + '', smear, j = 0;
		while ( j < stringseed.length ) {
			key[ mask & j ] =
				mask & ( ( smear ^= key[ mask & j ] * 19 ) + stringseed.charCodeAt( j++ ) );
		}
		return tostring( key );
	}

	//
	// autoseed()
	// Returns an object for autoseeding, using window.crypto and Node crypto
	// module if available.
	//
	function autoseed() {
		try {
			var out;
			if ( nodecrypto && ( out = nodecrypto.randomBytes ) ) {
				// The use of 'out' to remember randomBytes makes tight minified code.
				out = out( width );
			} else {
				out = new Uint8Array( width );
				( global.crypto || global.msCrypto ).getRandomValues( out );
			}
			return tostring( out );
		} catch ( e ) {
			var browser = global.navigator,
				plugins = browser && browser.plugins;
			return [ +new Date, global, plugins, global.screen, tostring( pool ) ];
		}
	}

	//
	// tostring()
	// Converts an array of charcodes to a string
	//
	function tostring( a ) {
		return String.fromCharCode.apply( 0, a );
	}

	//
	// When seedrandom.js is loaded, we immediately mix a few bits
	// from the built-in RNG into the entropy pool.  Because we do
	// not want to interfere with deterministic PRNG state later,
	// seedrandom will not call math.random on its own again after
	// initialization.
	//
	mixkey( math.random(), pool );

	//
	// Nodejs and AMD support: export the implementation as a module using
	// either convention.
	//
	if ( ( typeof module ) == 'object' && module.exports ) {
		module.exports = seedrandom;
		// When in node.js, try using crypto package for autoseeding.
		try {
			nodecrypto = require( 'crypto' );
		} catch ( ex ) { }
	} else if ( ( typeof define ) == 'function' && define.amd ) {
		define( function() { return seedrandom; } );
	} else {
		// When included as a plain script, set up Math.seedrandom global.
		math[ 'seed' + rngname ] = seedrandom;
	}

	console.log( 'seed random init' );


	// End anonymous scope, and pass initial values.
} )(
	// global: `self` in browsers (including strict mode and web workers),
	// otherwise `this` in Node and other environments
	( typeof self !== 'undefined' ) ? self : this,
	[],     // pool: entropy pool starts empty
	Math    // math: package containing random, pow, and seedrandom
);

// https://github.com/kevincennis/TinyMusic/

( function( root, factory ) {
	if ( typeof define === 'function' && define.amd ) {
		define( [ 'exports' ], factory );
	} else if ( typeof exports === 'object' && typeof exports.nodeName !== 'string' ) {
		factory( exports );
	} else {
		factory( root.TinyMusic = {} );
	}
}( this, function( exports ) {

	/*
	 * Private stuffz
	 */

	var enharmonics = 'B#-C|C#-Db|D|D#-Eb|E-Fb|E#-F|F#-Gb|G|G#-Ab|A|A#-Bb|B-Cb',
		middleC = 440 * Math.pow( Math.pow( 2, 1 / 12 ), -9 ),
		numeric = /^[0-9.]+$/,
		octaveOffset = 4,
		space = /\s+/,
		num = /(\d+)/,
		offsets = {};

	// populate the offset lookup (note distance from C, in semitones)
	enharmonics.split( '|' ).forEach( function( val, i ) {
		val.split( '-' ).forEach( function( note ) {
			offsets[ note ] = i;
		} );
	} );

	/*
	 * Note class
	 *
	 * new Note ('A4 q') === 440Hz, quarter note
	 * new Note ('- e') === 0Hz (basically a rest), eigth note
	 * new Note ('A4 es') === 440Hz, dotted eighth note (eighth + sixteenth)
	 * new Note ('A4 0.0125') === 440Hz, 32nd note (or any arbitrary
	 * divisor/multiple of 1 beat)
	 *
	 */

	// create a new Note instance from a string
	function Note( str ) {
		var couple = str.split( space );
		// frequency, in Hz
		this.frequency = Note.getFrequency( couple[ 0 ] ) || 0;
		// duration, as a ratio of 1 beat (quarter note = 1, half note = 0.5, etc.)
		this.duration = Note.getDuration( couple[ 1 ] ) || 0;
	}

	// convert a note name (e.g. 'A4') to a frequency (e.g. 440.00)
	Note.getFrequency = function( name ) {
		var couple = name.split( num ),
			distance = offsets[ couple[ 0 ] ],
			octaveDiff = ( couple[ 1 ] || octaveOffset ) - octaveOffset,
			freq = middleC * Math.pow( Math.pow( 2, 1 / 12 ), distance );
		return freq * Math.pow( 2, octaveDiff );
	};

	// convert a duration string (e.g. 'q') to a number (e.g. 1)
	// also accepts numeric strings (e.g '0.125')
	// and compund durations (e.g. 'es' for dotted-eight or eighth plus sixteenth)
	Note.getDuration = function( symbol ) {
		return numeric.test( symbol ) ? parseFloat( symbol ) :
			symbol.toLowerCase().split( '' ).reduce( function( prev, curr ) {
				return prev + ( curr === 'w' ? 4 : curr === 'h' ? 2 :
					curr === 'q' ? 1 : curr === 'e' ? 0.5 :
						curr === 's' ? 0.25 : 0 );
			}, 0 );
	};

	/*
	 * Sequence class
	 */

	// create a new Sequence
	function Sequence( ac, tempo, arr ) {
		this.ac = ac || new AudioContext();
		this.createFxNodes();
		this.tempo = tempo || 120;
		this.loop = true;
		this.smoothing = 0;
		this.staccato = 0;
		this.notes = [];
		this.push.apply( this, arr || [] );
	}

	// create gain and EQ nodes, then connect 'em
	Sequence.prototype.createFxNodes = function() {
		var eq = [ [ 'bass', 100 ], [ 'mid', 1000 ], [ 'treble', 2500 ] ],
			prev = this.gain = this.ac.createGain();
		eq.forEach( function( config, filter ) {
			filter = this[ config[ 0 ] ] = this.ac.createBiquadFilter();
			filter.type = 'peaking';
			filter.frequency.value = config[ 1 ];
			prev.connect( prev = filter );
		}.bind( this ) );
		prev.connect( this.ac.destination );
		return this;
	};

	// accepts Note instances or strings (e.g. 'A4 e')
	Sequence.prototype.push = function() {
		Array.prototype.forEach.call( arguments, function( note ) {
			this.notes.push( note instanceof Note ? note : new Note( note ) );
		}.bind( this ) );
		return this;
	};

	// create a custom waveform as opposed to "sawtooth", "triangle", etc
	Sequence.prototype.createCustomWave = function( real, imag ) {
		// Allow user to specify only one array and dupe it for imag.
		if ( !imag ) {
			imag = real;
		}

		// Wave type must be custom to apply period wave.
		this.waveType = 'custom';

		// Reset customWave
		this.customWave = [ new Float32Array( real ), new Float32Array( imag ) ];
	};

	// recreate the oscillator node (happens on every play)
	Sequence.prototype.createOscillator = function() {
		this.stop();
		this.osc = this.ac.createOscillator();

		// customWave should be an array of Float32Arrays. The more elements in
		// each Float32Array, the dirtier (saw-like) the wave is
		if ( this.customWave ) {
			this.osc.setPeriodicWave(
				this.ac.createPeriodicWave.apply( this.ac, this.customWave )
			);
		} else {
			this.osc.type = this.waveType || 'square';
		}

		this.osc.connect( this.gain );
		return this;
	};

	// schedules this.notes[ index ] to play at the given time
	// returns an AudioContext timestamp of when the note will *end*
	Sequence.prototype.scheduleNote = function( index, when ) {
		var duration = 60 / this.tempo * this.notes[ index ].duration,
			cutoff = duration * ( 1 - ( this.staccato || 0 ) );

		this.setFrequency( this.notes[ index ].frequency, when );

		if ( this.smoothing && this.notes[ index ].frequency ) {
			this.slide( index, when, cutoff );
		}

		this.setFrequency( 0, when + cutoff );
		return when + duration;
	};

	// get the next note
	Sequence.prototype.getNextNote = function( index ) {
		return this.notes[ index < this.notes.length - 1 ? index + 1 : 0 ];
	};

	// how long do we wait before beginning the slide? (in seconds)
	Sequence.prototype.getSlideStartDelay = function( duration ) {
		return duration - Math.min( duration, 60 / this.tempo * this.smoothing );
	};

	// slide the note at <index> into the next note at the given time,
	// and apply staccato effect if needed
	Sequence.prototype.slide = function( index, when, cutoff ) {
		var next = this.getNextNote( index ),
			start = this.getSlideStartDelay( cutoff );
		this.setFrequency( this.notes[ index ].frequency, when + start );
		this.rampFrequency( next.frequency, when + cutoff );
		return this;
	};

	// set frequency at time
	Sequence.prototype.setFrequency = function( freq, when ) {
		this.osc.frequency.setValueAtTime( freq, when );
		return this;
	};

	// ramp to frequency at time
	Sequence.prototype.rampFrequency = function( freq, when ) {
		this.osc.frequency.linearRampToValueAtTime( freq, when );
		return this;
	};

	// run through all notes in the sequence and schedule them
	Sequence.prototype.play = function( when ) {
		when = typeof when === 'number' ? when : this.ac.currentTime;

		this.createOscillator();
		this.osc.start( when );

		this.notes.forEach( function( note, i ) {
			when = this.scheduleNote( i, when );
		}.bind( this ) );

		this.osc.stop( when );
		this.osc.onended = this.loop ? this.play.bind( this, when ) : null;

		return this;
	};

	// stop playback, null out the oscillator, cancel parameter automation
	Sequence.prototype.stop = function() {
		if ( this.osc ) {
			this.osc.onended = null;
			this.osc.disconnect();
			this.osc = null;
		}
		return this;
	};

	exports.Note = Note;
	exports.Sequence = Sequence;
} ) );
