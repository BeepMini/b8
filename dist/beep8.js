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
		// The name of the project.
		NAME: "beep8 Project",
		// The version of the project.
		VERSION: "1.0.0",
		// Canvas settings
		CANVAS_SETTINGS: {
			// The ID to assign to the beep8 canvas.
			CANVAS_ID: "beep8-canvas",
			// If set, these CSS classes will be added to the beep8 canvas.
			// This is an array of strings, each of which is a class name (without the "."),
			// for example: [ "foo", "bar", "qux" ]
			CANVAS_CLASSES: [],
			// If null then the canvas will be appended to the body.
			// If this is not null, then this is the element under which to create the rendering canvas.
			// This can be the ID of an HTML element, or an HTMLElement reference.
			CONTAINER: null,
		},
		// Sound effects settings
		SFX: {
			// Key presses whilst using an input dialog.
			TYPING: 'click',
			MENU_UP: 'blip',
			MENU_DOWN: 'blip2',
			MENU_SELECT: 'blip3',
		},
		// The font files.
		// The font files must be PNG files, with the characters in a grid.
		FONT_DEFAULT: "../assets/font-default.png",
		FONT_TILES: "../assets/font-tiles.png",
		// The characters in the font file.
		// These are for the default font(s). If you use a different list you
		// will need to upate the font file to match.
		CHRS: `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*+=-<>_#&@%^~$£€¥¢!?:;'"/\\()[]{}.,©®™•…| `,
		// Character size. The characters file's width must be
		// 12 * CHR_WIDTH and the height must be 12 * CHR_HEIGHT.
		CHR_WIDTH: 12,
		CHR_HEIGHT: 12,
		// Screen width and height in characters.
		SCREEN_ROWS: 32,
		SCREEN_COLS: 32,
		// If set, this is the opacity of the "scan lines" effect.
		// If 0 or not set, don't show scan lines.
		SCAN_LINES_OPACITY: 0.1,
		// Color palette.
		// Colors count from 0.
		// The first color is the background color.
		// This can be as many colors as you want, but each color requires us to
		// store a scaled copy of the characters image in memory, so more colors
		// = more memory.
		// You can redefine the colors at runtime with beep8.redefineColors([]).
		COLORS: [
			"#0E0F17",
			"#2A3752",
			"#9DB1BF",
			"#8DF0F7",
			"#44BDF9",
			"#3C55B0",
			"#54002A",
			"#754B3B",
			"#B51212",
			"#F7883D",
			"#FFCF66",
			"#9AE065",
			"#42C26B",
			"#12897C",
			"#F078DC",
			"#F4F4F4",
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
	beep8.print = function( text, wrapWidth = -1 ) {

		beep8.Core.preflight( "beep8.text" );

		beep8.Utilities.checkString( "text", text );
		beep8.Utilities.checkNumber( "wrapWidth", wrapWidth );

		beep8.Core.textRenderer.print( text, null, wrapWidth );

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
	 * Returns the current font.
	 *
	 * @returns {string} The current font.
	 */
	beep8.getFont = function() {

		beep8.Core.preflight( "beep8.getFont" );

		beep8.Core.textRenderer.getFont();

	}


	/**
	 * Returns the font object for the given font name.
	 *
	 * @param {string} fontName - The name of the font.
	 * @returns {Object} The font object.
	 */
	beep8.getFontByName = function( fontName ) {

		beep8.Utilities.checkString( "fontName", fontName );

		return beep8.Core.textRenderer.getFontByName( fontName );

	}


	/**
	 * Sets the current tile font for text-based operations.
	 *
	 * @param {string} [fontId="tiles"] - The font ID to set. Pass null or
	 * omit to reset to default font.
	 * @returns {void}
	 */
	beep8.setTileFont = function( fontId ) {

		beep8.Core.preflight( "beep8.setTileFont" );

		fontId = fontId || "tiles";
		beep8.Utilities.checkString( "fontId", fontId );

		beep8.Core.textRenderer.setTileFont( fontId );

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
	 * Waits until the user clicks/ taps the pointer and returns its position.
	 *
	 * @returns {Promise<{x: number, y: number}>} The pointer position.
	 */
	beep8.Async.pointer = async function() {

		beep8.Core.preflight( "beep8.Async.pointer" );

		return await beep8.Core.inputSys.readPointerAsync();

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
	beep8.Async.typewriter = async function( text, wrapWidth = -1, delay = 0.05 ) {

		beep8.Core.preflight( "beep8.Async.typewriter" );

		beep8.Utilities.checkString( "text", text );
		beep8.Utilities.checkNumber( "delay", delay );

		const startCol = beep8.col();
		const startRow = beep8.row();

		text = beep8.Core.textRenderer.wrapText( text, wrapWidth );

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

		const fontName = "FONT@" + beep8.Utilities.makeUrlPretty( fontImageFile );
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
	beep8.Core.container = null;
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
	beep8.Core.init = function( callback, options ) {

		// Merge the options with the default configuration.
		beep8.CONFIG = {
			...beep8.CONFIG,
			...options,
		};

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

		beep8.Core.realCanvas.style.touchAction = "none";
		beep8.Core.realCanvas.style.userSelect = "none";
		beep8.Core.realCanvas.style.imageRendering = "pixelated";

		// Prevent default touch events on touch devices.
		beep8.Core.realCanvas.addEventListener( "touchstart", e => e.preventDefault() );

		// Work out where to put the canvas.
		beep8.Core.container = document.createElement( 'div' );
		beep8.Core.container.setAttribute( "style", "" );
		beep8.Core.container.id = "beep8";
		beep8.Core.container.style.display = "block";
		beep8.Core.container.style.lineHeight = "0";
		beep8.Core.container.style.position = "relative";

		// Add the canvas to the container.
		beep8.Core.container.appendChild( beep8.Core.realCanvas );

		// Put the canvas in the container.
		beep8.Core.getBeepContainerEl().appendChild( beep8.Core.container );

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

		beep8.Core.addScanlines();

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

		await beep8.Intro.loading();
		await beep8.Intro.splash();

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
	 * Gets the container element for the engine.
	 * This is the element under which the rendering canvas is created.
	 * If the container is not specified in the configuration, this will be the
	 * body element.
	 *
	 * @returns {HTMLElement} The container element.
	 */
	beep8.Core.getBeepContainerEl = function() {

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

		return container;

	}


	/**
	 * Checks if the engine (and specified method) is ready to run.
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

		beep8.Core.realCtx = beep8.Core.realCanvas.getContext( "2d" );
		beep8.Core.realCtx.imageSmoothingEnabled = false;

		beep8.CONFIG.SCREEN_EL_WIDTH = beep8.CONFIG.SCREEN_WIDTH;
		beep8.CONFIG.SCREEN_EL_HEIGHT = beep8.CONFIG.SCREEN_HEIGHT;
		beep8.CONFIG.SCREEN_REAL_WIDTH = beep8.CONFIG.SCREEN_WIDTH;
		beep8.CONFIG.SCREEN_REAL_HEIGHT = beep8.CONFIG.SCREEN_HEIGHT;

		beep8.Core.realCanvas.style.width = '100%';
		beep8.Core.realCanvas.style.height = '100%';
		beep8.Core.realCanvas.width = beep8.CONFIG.SCREEN_REAL_WIDTH;
		beep8.Core.realCanvas.height = beep8.CONFIG.SCREEN_REAL_HEIGHT;

		console.log( beep8.CONFIG.SCREEN_REAL_HEIGHT, beep8.CONFIG.SCREEN_EL_HEIGHT );

		beep8.Core.container.style.aspectRatio = `${beep8.CONFIG.SCREEN_ROWS} / ${beep8.CONFIG.SCREEN_COLS}`;

	}


	/**
	 * Adds scanlines to the screen.
	 * This is a simple effect that makes the screen look like an old CRT monitor.
	 *
	 * @returns {void}
	 */
	beep8.Core.addScanlines = function() {

		// If the scan lines element already exists, don't add it again.
		if ( scanLinesEl ) {
			return;
		}

		// If the scan lines opacity is set to 0, don't show scan lines.
		const scanLinesOp = beep8.CONFIG.SCAN_LINES_OPACITY || 0;

		if ( scanLinesOp > 0 ) {

			if ( !scanLinesEl ) {
				scanLinesEl = document.createElement( "div" );
				beep8.Core.container.appendChild( scanLinesEl );
			}

			scanLinesEl.style.background =
				"linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 1) 50%), " +
				"linear-gradient(90deg, rgba(255, 0, 0, .6), rgba(0, 255, 0, .2), rgba(0, 0, 255, .6))";

			scanLinesEl.style.backgroundSize = `100% 4px, 3px 100%`;
			scanLinesEl.style.opacity = scanLinesOp;
			scanLinesEl.style.position = "absolute";
			scanLinesEl.style.left = 0;
			scanLinesEl.style.top = 0;
			scanLinesEl.style.width = '100%';
			scanLinesEl.style.height = '100%';
			scanLinesEl.style.zIndex = 1;

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
	 * Is this a touch device?
	 *
	 * @returns {boolean} True if this is a touch device.
	 */
	beep8.Core.isTouchDevice = function() {

		return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

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
			window.addEventListener( "pointerdown", e => this.onPointerDown( e ) );

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
		 * Handles pointerdown events, resolving any pending asynchronous pointer events.
		 *
		 * @param {PointerEvent} e - The event object.
		 * @returns {void}
		 */
		onPointerDown( e ) {

			if ( beep8.Core.hasPendingAsync( "beep8.Async.pointer" ) ) {
				console.log( "Pointer event" );
				beep8.Core.resolveAsync( "beep8.Async.pointer", { x: e.clientX, y: e.clientY } );
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
		 * Reads a pointer asynchronously. Returns a promise that resolves to the pointer position.
		 *
		 * @returns {Promise<{x: number, y: number}>} A promise that resolves to the pointer position.
		 */
		readPointerAsync() {

			return new Promise(
				( resolve, reject ) => {
					beep8.Core.startAsync( "beep8.Async.pointer", resolve, reject );
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

					beep8.Sfx.play( beep8.CONFIG.SFX.TYPING );

				} else if ( key === "Enter" ) {

					// Handle enter: submit the text.
					beep8.Core.setCursorLocation( 1, curRow + 1 );
					beep8.Core.cursorRenderer.setCursorVisible( cursorWasVisible );

					beep8.Sfx.play( beep8.CONFIG.SFX.TYPING );

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

					beep8.Sfx.play( beep8.CONFIG.SFX.TYPING );

				}
			}
		}
	}

} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	beep8.Intro = {};

	/**
	 * Play a sound effect.
	 *
	 * @param {string} sfx The sound effect to play.
	 * @throws {Error} If the sfx is not found.
	 */
	beep8.Intro.loading = async function( sfx ) {

		// Colour count.
		const colourCount = beep8.CONFIG.COLORS.length;
		const prefix = "8> ";

		// Loop through all colours.
		beep8.color( 0, 10 );
		beep8.cls();
		beep8.locate( 1, 1 );
		beep8.print( prefix + "beep8 Loading...\n" );

		await beep8.Async.wait( 0.1 );

		beep8.print( prefix + "Let's 'a go!" );

		await beep8.Async.wait( 0.3 );

	}


	/**
	 * Display a splash screen.
	 *
	 * @param {string} [name="beep8 Project"] The name of the project.
	 * @returns {Promise<void>} A promise that resolves when the splash screen is dismissed.
	 */
	beep8.Intro.splash = async function() {

		let name = beep8.CONFIG.NAME;
		let startCol = 2;

		beep8.color( 0, 10 );
		beep8.cls();

		// Border.
		beep8.locate( 1, 1 );
		beep8.printBox( beep8.CONFIG.SCREEN_COLS - 2, beep8.CONFIG.SCREEN_ROWS - 2 );

		// Project title.
		startCol = Math.floor( ( beep8.CONFIG.SCREEN_COLS - name.length ) / 2 );
		beep8.locate( startCol, Math.floor( beep8.CONFIG.SCREEN_ROWS * 0.3 ) );
		beep8.print( name + "\n" );
		beep8.print( "_".repeat( name.length ) + "\n" );

		// Click to start.
		let message = "Click to start";
		if ( beep8.Core.isTouchDevice() ) message = "Tap to start";

		startCol = Math.round( ( beep8.CONFIG.SCREEN_COLS - message.length ) / 2 );
		beep8.locate( startCol, beep8.CONFIG.SCREEN_ROWS - 4 );
		beep8.print( message );

		// Wait for user input.
		await beep8.Core.inputSys.readPointerAsync();

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
				if ( choices.length > 1 ) beep8.Sfx.play( beep8.CONFIG.SFX.MENU_UP );

			} else if ( k === "ArrowDown" ) {

				// Go down the menu.
				selIndex = ( selIndex + 1 ) % choices.length;
				if ( choices.length > 1 ) beep8.Sfx.play( beep8.CONFIG.SFX.MENU_DOWN );

			} else if ( k === "Enter" || k === "ButtonA" ) {

				// Select menu item.
				beep8.Sfx.play( beep8.CONFIG.SFX.MENU_SELECT );
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
	 * @see https://killedbyapixel.github.io/ZzFX/
	 * @see https://codepen.io/KilledByAPixel/pen/BaowKzv?editors=1000
	 * @type {Object}
	 */
	const sfxLibrary = {
		coin: [ , 0, 1675, , .06, .24, 1, 1.82, , , 837, .06 ],
		coin2: [ , 0, 523.2511, .01, .06, .3, 1, 1.82, , , 837, .06 ],
		blip: [ 3, 0, 150, .02, .03, .02, , 2.8, , , , , , , , , , .7, .02 ],
		blip2: [ 1.5, 0, 200, .02, .03, .02, , 2.8, , , , , , , , , , .7, .02 ],
		blip3: [ 2, 0, 250, .02, .03, .02, , 2.8, , , , , , , , , , .7, .02 ],

		hit: [ , 0, 925, .04, .3, .6, 1, .3, , 6.27, -184, .09, .17 ],
		sparkle: [ , 0, 539, 0, .04, .29, 1, 1.92, , , 567, .02, .02, , , , .04 ],
		sparkle2: [ , 0, 80, .3, .4, .7, 2, .1, -0.73, 3.42, -430, .09, .17, , , , .19 ],
		life: [ , 0, 537, .02, .02, .22, 1, 1.59, -6.98, 4.97 ],
		break: [ , 0, 528, .01, , .48, , .6, -11.6, , , , .32, 4.2 ],
		life2: [ , 0, 20, .04, , .6, , 1.31, , , -990, .06, .17, , , .04, .07 ],
		alien: [ , 0, 662, .82, .11, .33, 1, 0, , -0.2, , , , 1.2, , .26, .01 ],
		beep: [ 1.5, 0, 270, , .1, , 1, 1.5, , , , , , , , .1, .01 ],
		beep2: [ 1.2, 0, 150, , .1, , 1, 1.5, , , , , , , , .1, .01 ],
		beep3: [ 1.5, 0, 200, , .1, , 1, 1.5, , , , , , , , .1, .01 ],
		ding: [ .9, 0, 685, .01, .03, .17, 1, 1.4, , , , , , , , , , .63, .01, , 420 ],
		drum: [ , 0, 129, .01, , .15, , , , , , , , 5 ],
		explode: [ , 0, 333, .01, 0, .9, 4, 1.9, , , , , , .5, , .6 ],
		explode2: [ , 0, 418, 0, .02, .2, 4, 1.15, -8.5, , , , , .7, , .1 ],
		explode3: [ , 0, 82, .02, , .2, 4, 4, , , , , , .8, , .2, , .8, .09 ],
		squeak1: [ , 0, 1975, .08, .56, .02, , , -0.4, , -322, .56, .41, , , , .25 ],
		squeak2: [ , 0, 75, .03, .08, .17, 1, 1.88, 7.83, , , , , .4 ],
		squeak3: [ , 0, 1306, .8, .08, .02, 1, , , , , , .48, , -0.1, .11, .25 ],
		squeak4: [ , 0, 1e3, .02, , .01, 2, , 18, , 475, .01, .01 ],
		bell: [ 2, 0, 999, , , , , 1.5, , .3, -99, .1, 1.63, , , .11, .22 ],
		satellite: [ , 0, 847, .02, .3, .9, 1, 1.67, , , -294, .04, .13, , , , .1 ],
		phone: [ , 0, 1600, .13, .52, .61, 1, 1.1, , , , , , .1, , .14 ],
		pop: [ , 0, 224, .02, .02, .08, 1, 1.7, -13.9, , , , , , 6.7 ],
		rocket: [ , 0, 941, .8, , .8, 4, .74, -222, , , , , .8, , 1 ],
		rocket2: [ , 0, 172, .8, , .8, 1, .76, 7.7, 3.73, -482, .08, .15, , .14 ],
		squirt: [ , 0, 448, .01, .1, .3, 3, .39, -0.5, , , , , , .2, .1, .08 ],
		swing: [ , 0, 150, .05, , .05, , 1.3, , , , , , 3 ],
		wave: [ , 0, 40, .5, , 1.5, , 11, , , , , , 199 ],
		warp: [ 2, 0, 713, .16, .09, .24, , .6, -29, -16, , , .09, .5, , , .23, .75, .15, .48 ],
		radioactive: [ , 0, 130, .02, .9, .39, 2, .8, , , , , .13, .2, , .1, , .93, .06, .28 ],
		siren: [ , 0, 960, , 1, .01, , .8, -0.01, , -190, .5, , .05, , , 1 ],
		car_horn: [ 1.5, 0, 250, .02, .02, .2, 2, 2, , , , , .02, , , .02, .01, , , .1 ],
		engine2: [ , 0, 25, .05, .3, .5, 3, 9, -0.01, , , , , , 13, .1, .2 ],
		thunder: [ , 0, 471, , .09, .47, 4, 1.06, -6.7, , , , , .9, 61, .1, , .82, .09, .13 ],
		sparkle3: [ , 0, 63, , 1, , 1, 1.5, , , , , , , , 3.69, .08 ],
		sweep: [ , 0, 9220, .01, , , , 5, , , , , , 9 ],
		click: [ 1.1, 0, 900, , .01, 0, 1, , -10, , -31, .02, , , , , , 1.2, , .16, -1448 ],
	};

	beep8.Sfx = {};


	/**
	 * Play a sound effect.
	 *
	 * @param {string} sfx The sound effect to play.
	 * @throws {Error} If the sfx is not found.
	 */
	beep8.Sfx.play = function( sfx = '' ) {

		// Quit if no sound specified.
		if ( !sfx ) return;

		// Check the sfx is a string.
		beep8.Utilities.checkString( 'sfx', sfx );

		// console.log( `[${sfxLibrary[ sfx ].toString().replace( ' ', '' )}]` );

		// SFX not found.
		if ( !sfxLibrary[ sfx ] ) {
			beep8.Utilities.error( `SFX ${sfx} not found.` );
		}

		zzfx( ...sfxLibrary[ sfx ] );

	}


	/**
	 * Add a sound effect to the library.
	 *
	 * @param {string} sfxName The name of the sound effect.
	 * @param {Array} sfxArray The sound effect array.
	 * @throws {Error} If the sfxName is not a string.
	 * @throws {Error} If the sfxArray is not an array.
	 * @return {void}
	 */
	beep8.Sfx.add = function( sfxName, sfxArray ) {

		beep8.Utilities.checkString( 'sfxName', sfxName );
		beep8.Utilities.checkArray( 'sfxArray', sfxArray );

		sfxLibrary[ sfxName ] = sfxArray;

	}


	/**
	 * Get the list of sfx from the library.
	 *
	 * @return {Array} The list of sfx.
	 */
	beep8.Sfx.get = function() {

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
	 * An array of character codes for each character in the chars string.
	 * This is used to look up the index of a character in the chars string.
	 *
	 * @type {number[]}
	 */
	const charMap = [];

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

			// Current tiles. This is a reference to a beep8.TextRendererFont object.
			// This is used for the tiles font.
			this.curTiles_ = null;

		}


		/**
		 * Prepares the charMap array.
		 * This is a list of character codes for each character in the chars string.
		 * This is used to look up the index of a character in the chars string.
		 *
		 * @returns {void}
		 */
		prepareCharMap() {

			let charString = [ ...beep8.CONFIG.CHRS ];

			for ( let i = 0; i < charString.length; i++ ) {
				charMap.push( charString[ i ].charCodeAt( 0 ) );
			}

		}


		/**
		 * Initializes the beep8.TextRenderer with the default font.
		 *
		 * @returns {Promise<void>}
		 */
		async initAsync() {

			beep8.Utilities.log( "beep8.TextRenderer init." );

			// Prepare the text font.
			this.curFont_ = await this.loadFontAsync( "default", beep8.CONFIG.FONT_DEFAULT );

			// Prepare the tiles font.
			this.curTiles_ = await this.loadFontAsync( "tiles", beep8.CONFIG.FONT_TILES );

			// Prepare the charMap array.
			this.prepareCharMap();

		}


		/**
		 * Loads a new font asynchronously.
		 *
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

			return font;

		}


		/**
		 * Sets the current font.
		 *
		 * @param {string} fontName - The name of the font to set.
		 * @returns {void}
		 * @throws {Error} If the font is not found or its dimensions are not compatible.
		 */
		setFont( fontName ) {

			const font = this.getFontByName( fontName );

			if ( font ) {
				this.curFont_ = font;
			}

		}


		/**
		 * Get the current font.
		 *
		 * @returns {beep8.TextRendererFont} The current font.
		 */
		getFont() {

			return this.curFont_;

		}


		/**
		 * Sets the current tiles font.
		 *
		 * @param {string} fontName - The name of the font to set.
		 * @returns {void}
		 */
		setTileFont( fontName ) {

			const font = this.getFontByName( fontName );

			if ( font ) {
				this.curTiles_ = font;
			}

		}


		/**
		 * Gets a font by name.
		 *
		 * @param {string} fontName - The name of the font to get.
		 * @returns {beep8.TextRendererFont} The font.
		 */
		getFontByName( fontName ) {

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
					`getFontByName(): font ${fontName} has character size ${cw}x${ch}, ` +
					`which is not an integer multiple of beep8.CONFIG.CHR_WIDTH x beep8.CONFIG.CHR_HEIGHT = ` +
					`${beep8.CONFIG.CHR_WIDTH}x${beep8.CONFIG.CHR_HEIGHT}, so it can't be set as the ` +
					`current font due to the row,column system. However, you can still use it ` +
					`directly with drawText() by passing it as a parameter to that function.`
				);

				return;

			}

			return font;

		}


		/**
		 * Prints text at the current cursor position.
		 *
		 * @param {string} text - The text to print.
		 * @returns {void}
		 */
		print( text, font = null, wrapWidth = -1 ) {

			font = font || this.curFont_;

			beep8.Utilities.checkString( "text", text );
			beep8.Utilities.checkNumber( "wrapWidth", wrapWidth );
			beep8.Utilities.checkObject( "font", font );

			text = this.wrapText( text, wrapWidth, font );

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
					// Get index for the character from charMap.
					const chIndex = charMap.indexOf( ch );

					if ( chIndex >= 0 ) {

						this.put_(
							chIndex,
							col, row,
							beep8.Core.drawState.fgColor, beep8.Core.drawState.bgColor,
							font
						);
						col += colInc;

					}

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
		 *
		 * @param {string} text - The text to print.
		 * @param {number} width - The width to center the text within.
		 * @returns {void}
		 */
		printCentered( text, width ) {

			beep8.Utilities.checkString( "text", text );
			beep8.Utilities.checkNumber( "width", width );
			text = text.split( "\n" )[ 0 ];

			if ( !text ) {
				return;
			}

			const textWidth = this.measure( text ).cols;
			const col = Math.floor( beep8.Core.drawState.cursorCol + ( width - textWidth ) / 2 );

			beep8.Core.drawState.cursorCol = col;
			this.print( text );

		}


		/**
		 * Prints a character a specified number of times.
		 *
		 * @param {number} ch - The character to print.
		 * @param {number} n - The number of times to print the character.
		 * @returns {void}
		 */
		printChar( ch, n, font = null ) {

			if ( n === undefined || isNaN( n ) ) {
				n = 1;
			}

			beep8.Utilities.checkNumber( "ch", ch );
			beep8.Utilities.checkNumber( "n", n );

			while ( n-- > 0 ) {

				this.put_(
					ch,
					beep8.Core.drawState.cursorCol,
					beep8.Core.drawState.cursorRow,
					beep8.Core.drawState.fgColor,
					beep8.Core.drawState.bgColor,
					font
				);

				beep8.Core.drawState.cursorCol++;

			}

			beep8.Core.markDirty();

		}


		/**
		 * Prints a character as a "sprite" at a raw x, y position.
		 *
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
		 *
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

			if ( fontName ) {
				beep8.Utilities.checkString( "fontName", fontName );
			}

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
		 *
		 * @param {string} text - The text to measure.
		 * @returns {{cols: number, rows: number}} The dimensions of the text.
		 */
		measure( text ) {

			beep8.Utilities.checkString( "text", text );

			if ( text === "" ) {
				return { cols: 0, rows: 0 }; // Special case
			}

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
		 *
		 * @param {number} width - The width of the rectangle.
		 * @param {number} height - The height of the rectangle.
		 * @param {number} ch - The character to fill the rectangle with.
		 * @returns {void}
		 */
		printRect( width, height, ch ) {

			beep8.Utilities.checkNumber( "width", width );
			beep8.Utilities.checkNumber( "height", height );
			beep8.Utilities.checkNumber( "ch", ch );

			const charIndex = charMap.indexOf( ch );

			const startCol = beep8.Core.drawState.cursorCol;
			const startRow = beep8.Core.drawState.cursorRow;

			for ( let i = 0; i < height; i++ ) {
				beep8.Core.drawState.cursorCol = startCol;
				beep8.Core.drawState.cursorRow = startRow + i;
				this.printChar( charIndex, width );
			}

			beep8.Core.drawState.cursorCol = startCol;
			beep8.Core.drawState.cursorRow = startRow;

		}


		/**
		 * Prints a box with borders.
		 *
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
		 *
		 * @param {number} ch - The character to put.
		 * @param {number} col - The column.
		 * @param {number} row - The row.
		 * @param {number} fgColor - The foreground color.
		 * @param {number} bgColor - The background color.
		 * @returns {void}
		 */
		put_( ch, col, row, fgColor, bgColor, font = null ) {

			const chrW = beep8.CONFIG.CHR_WIDTH;
			const chrH = beep8.CONFIG.CHR_HEIGHT;
			const x = Math.round( col * chrW );
			const y = Math.round( row * chrH );

			this.putxy_( ch, x, y, fgColor, bgColor, font );

		}


		/**
		 * Puts a character at the specified x and y coordinates.
		 *
		 * @param {number} ch - The character to put.
		 * @param {number} x - The x-coordinate.
		 * @param {number} y - The y-coordinate.
		 * @param {number} fgColor - The foreground color.
		 * @param {number} bgColor - The background color.
		 * @param {beep8.TextRendererFont} [font=null] - The font to use.
		 * @returns {void}
		 */
		putxy_( ch, x, y, fgColor, bgColor, font = null ) {

			font = font || this.curTiles_;

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
		 * Wraps text to a given width.
		 *
		 * @param {string} text - The text to wrap.
		 * @param {number} wrapWidth - The width to wrap the text to.
		 * @param {beep8.TextRendererFont} fontName - The font to use.
		 * @returns {string} The wrapped text.
		 */
		wrapText( text, wrapWidth, font = null ) {

			font = font || this.curFont_;

			// If 0 or less then don't wrap.
			if ( wrapWidth <= 0 ) {
				return text;
			}

			// Adjust the size of the wrap width based on the size of the font.
			wrapWidth = Math.floor( wrapWidth / font.getCharColCount() );

			// Split the text into lines.
			const lines = text.split( "\n" );

			// New list of lines.
			const wrappedLines = [];

			for ( const line of lines ) {

				const words = line.split( " " );

				let wrappedLine = "";
				let lineWidth = 0;

				for ( const word of words ) {

					const wordWidth = this.measure( word ).cols;

					// Is the line with the new word longer than the line width?
					if ( lineWidth + ( wordWidth ) > wrapWidth ) {
						wrappedLines.push( wrappedLine.trim() );
						wrappedLine = "";
						lineWidth = 0;
					}

					// Add a space between words.
					wrappedLine += word + " ";
					lineWidth += wordWidth + 1;

				}

				wrappedLines.push( wrappedLine.trim() );

			}

			return wrappedLines.join( "\n" );

		}


		/**
		 * Tries to run an escape sequence that starts at text[pos].
		 * Returns the position after the escape sequence ends.
		 * If pretend is true, then this will only parse but not run it.
		 *
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
			if ( !startSeq || !endSeq ) {
				return startPos;
			}

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
		 *
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

			if ( command === "" ) {
				return;
			}

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
		 *
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
		 *
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
			this.charColCount_ = 0;
			this.charRowCount_ = 0;
			this.origFgColor_ = 0;
			this.origBgColor_ = 0;

		}


		/**
		 * Returns the character width of the font.
		 *
		 * @returns {number} The width of each character in pixels.
		 */
		getCharWidth() {

			return this.charWidth_;

		}


		/**
		 * Returns the character height of the font.
		 *
		 * @returns {number} The height of each character in pixels.
		 */
		getCharHeight() {

			return this.charHeight_;

		}

		/**
		 * Returns the character width of the font.
		 * @returns {number} The width of each character in pixels.
		 */
		getCharColCount() {

			return this.charColCount_;

		}


		/**
		 * Returns the character height of the font.
		 * @returns {number} The height of each character in pixels.
		 */
		getCharRowCount() {

			return this.charRowCount_;

		}


		/**
		 * Returns the image for a given color number.
		 *
		 * @param {number} colorNumber - The color number.
		 * @returns {HTMLImageElement} The image for the specified color.
		 */
		getImageForColor( colorNumber ) {

			return this.chrImages_[ colorNumber ];

		}


		/**
		 * Sets up this font from the given character image file. It's assumed to contain the
		 * glyphs arranged in a 16x16 grid, so we will deduce the character size by dividing the
		 * width and height by 16.
		 *
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
			this.charColCount_ = this.charWidth_ / beep8.CONFIG.CHR_WIDTH;
			this.charRowCount_ = this.charHeight_ / beep8.CONFIG.CHR_HEIGHT;

			await this.regenColors();

		}


		/**
		 * Regenerates the color text images.
		 *
		 * @returns {Promise<void>}
		 */
		async regenColors() {

			const tempCanvas = document.createElement( 'canvas' );
			tempCanvas.width = this.origImg_.width;
			tempCanvas.height = this.origImg_.height;

			const ctx = tempCanvas.getContext( '2d' );
			this.chrImages_ = [];

			for ( let c = 0; c < beep8.CONFIG.COLORS.length; c++ ) {

				beep8.Utilities.log( `Initializing font ${this.fontName_}, color ${c} = ${beep8.CONFIG.COLORS[ c ]}` );

				// Clear the temp canvas.
				ctx.clearRect( 0, 0, this.origImg_.width, this.origImg_.height );

				// Draw the font image to the temp canvas (white over transparent background).
				ctx.globalCompositeOperation = 'source-over';
				ctx.drawImage( this.origImg_, 0, 0, this.origImg_.width, this.origImg_.height );

				// Now draw a filled rect with the desired color using the 'source-in' pixel
				// operation, which will tint the white pixels to that color.
				ctx.globalCompositeOperation = 'source-in';
				ctx.fillStyle = beep8.CONFIG.COLORS[ c ];
				ctx.fillRect( 0, 0, this.origImg_.width, this.origImg_.height );

				// Now extract the canvas contents as an image.
				const thisImg = await this.createImageFromCanvas( tempCanvas );
				this.chrImages_.push( thisImg );

			}

			// Delete the canvas.
			tempCanvas.remove();

		}

		// Function to create an image and wait for it to load
		createImageFromCanvas( canvas ) {

			return new Promise(
				( resolve ) => {
					const img = new Image();
					img.src = canvas.toDataURL();
					img.onload = () => resolve( img );
				}
			);

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
				img.src = src;
				img.onload = () => resolver( img );
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


	/**
	 * Converts a string to a pretty URL-friendly format.
	 *
	 * @param {string} str - The string to convert.
	 * @returns {string} The pretty string.
	 */
	beep8.Utilities.makeUrlPretty = function( uglyStr ) {

		beep8.Utilities.checkString( "uglyStr", uglyStr );

		let str = uglyStr;

		// Convert to lowercase
		str = str.toLowerCase();

		// Replace spaces and slashes with hyphens
		str = str.replace( /[\s/]+/g, '-' );

		// Remove all non-url-safe characters except hyphens
		str = str.replace( /[^a-z0-9\-]+/g, '' );

		// Remove multiple consecutive hyphens
		str = str.replace( /-+/g, '-' );

		// Trim hyphens from start and end
		str = str.replace( /^-+|-+$/g, '' );

		return str;

	}

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

// ZzFX - Zuper Zmall Zound Zynth - Micro Edition
// MIT License - Copyright 2019 Frank Force
// https://github.com/KilledByAPixel/ZzFX

// This is a minified build of zzfx for use in size coding projects.
// You can use zzfxV to set volume.
// Feel free to minify it further for your own needs!

'use strict';

///////////////////////////////////////////////////////////////////////////////

// ZzFXMicro - Zuper Zmall Zound Zynth - v1.3.1 by Frank Force

// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name ZzFXMicro.min.js
// @js_externs zzfx, zzfxG, zzfxP, zzfxV, zzfxX
// @language_out ECMASCRIPT_2019
// ==/ClosureCompiler==

const zzfx = ( ...z ) => zzfxP( zzfxG( ...z ) ); // generate and play sound
const zzfxV = .3;    // volume
const zzfxR = 44100; // sample rate
const zzfxX = new AudioContext; // audio context
const zzfxP = ( ...samples ) =>  // play samples
{
	// create buffer and source
	let buffer = zzfxX.createBuffer( samples.length, samples[ 0 ].length, zzfxR ),
		source = zzfxX.createBufferSource();

	// copy samples to buffer and play
	samples.map( ( d, i ) => buffer.getChannelData( i ).set( d ) );
	source.buffer = buffer;
	source.connect( zzfxX.destination );
	source.start();
	return source;
}
const zzfxG = // generate samples
	(
		// parameters
		volume = 1, randomness = .05, frequency = 220, attack = 0, sustain = 0,
		release = .1, shape = 0, shapeCurve = 1, slide = 0, deltaSlide = 0,
		pitchJump = 0, pitchJumpTime = 0, repeatTime = 0, noise = 0, modulation = 0,
		bitCrush = 0, delay = 0, sustainVolume = 1, decay = 0, tremolo = 0, filter = 0
	) => {
		// init parameters
		let PI2 = Math.PI * 2, sign = v => v < 0 ? -1 : 1,
			startSlide = slide *= 500 * PI2 / zzfxR / zzfxR,
			startFrequency = frequency *=
				( 1 + randomness * 2 * Math.random() - randomness ) * PI2 / zzfxR,
			b = [], t = 0, tm = 0, i = 0, j = 1, r = 0, c = 0, s = 0, f, length,

			// biquad LP/HP filter
			quality = 2, w = PI2 * Math.abs( filter ) * 2 / zzfxR,
			cos = Math.cos( w ), alpha = Math.sin( w ) / 2 / quality,
			a0 = 1 + alpha, a1 = -2 * cos / a0, a2 = ( 1 - alpha ) / a0,
			b0 = ( 1 + sign( filter ) * cos ) / 2 / a0,
			b1 = -( sign( filter ) + cos ) / a0, b2 = b0,
			x2 = 0, x1 = 0, y2 = 0, y1 = 0;

		// scale by sample rate
		attack = attack * zzfxR + 9; // minimum attack to prevent pop
		decay *= zzfxR;
		sustain *= zzfxR;
		release *= zzfxR;
		delay *= zzfxR;
		deltaSlide *= 500 * PI2 / zzfxR ** 3;
		modulation *= PI2 / zzfxR;
		pitchJump *= PI2 / zzfxR;
		pitchJumpTime *= zzfxR;
		repeatTime = repeatTime * zzfxR | 0;
		volume *= zzfxV;

		// generate waveform
		for ( length = attack + decay + sustain + release + delay | 0;
			i < length; b[ i++ ] = s * volume )               // sample
		{
			if ( !( ++c % ( bitCrush * 100 | 0 ) ) )                   // bit crush
			{
				s = shape ? shape > 1 ? shape > 2 ? shape > 3 ?      // wave shape
					Math.sin( t ** 3 ) :                       // 4 noise
					Math.max( Math.min( Math.tan( t ), 1 ), -1 ) :  // 3 tan
					1 - ( 2 * t / PI2 % 2 + 2 ) % 2 :                     // 2 saw
					1 - 4 * Math.abs( Math.round( t / PI2 ) - t / PI2 ) : // 1 triangle
					Math.sin( t );                           // 0 sin

				s = ( repeatTime ?
					1 - tremolo + tremolo * Math.sin( PI2 * i / repeatTime ) // tremolo
					: 1 ) *
					sign( s ) * ( Math.abs( s ) ** shapeCurve ) *      // curve
					( i < attack ? i / attack :                 // attack
						i < attack + decay ?                     // decay
							1 - ( ( i - attack ) / decay ) * ( 1 - sustainVolume ) : // decay falloff
							i < attack + decay + sustain ?          // sustain
								sustainVolume :                          // sustain volume
								i < length - delay ?                     // release
									( length - i - delay ) / release *           // release falloff
									sustainVolume :                          // release volume
									0 );                                      // post release

				s = delay ? s / 2 + ( delay > i ? 0 :           // delay
					( i < length - delay ? 1 : ( length - i ) / delay ) * // release delay
					b[ i - delay | 0 ] / 2 / volume ) : s;              // sample delay

				if ( filter )                                   // apply filter
					s = y1 = b2 * x2 + b1 * ( x2 = x1 ) + b0 * ( x1 = s ) - a2 * y2 - a1 * ( y2 = y1 );
			}

			f = ( frequency += slide += deltaSlide ) *// frequency
				Math.cos( modulation * tm++ );          // modulation
			t += f + f * noise * Math.sin( i ** 5 );        // noise

			if ( j && ++j > pitchJumpTime )           // pitch jump
			{
				frequency += pitchJump;             // apply pitch jump
				startFrequency += pitchJump;        // also apply to start
				j = 0;                              // stop pitch jump time
			}

			if ( repeatTime && !( ++r % repeatTime ) )  // repeat
			{
				frequency = startFrequency;         // reset frequency
				slide = startSlide;                 // reset slide
				j = j || 1;                         // reset pitch jump time
			}
		}

		return b;
	}
/**
 * ZzFX Music Renderer v2.0.3 by Keith Clark and Frank Force
 */

/**
 * @typedef Channel
 * @type {Array.<Number>}
 * @property {Number} 0 - Channel instrument
 * @property {Number} 1 - Channel panning (-1 to +1)
 * @property {Number} 2 - Note
 */

/**
 * @typedef Pattern
 * @type {Array.<Channel>}
 */

/**
 * @typedef Instrument
 * @type {Array.<Number>} ZzFX sound parameters
 */

/**
 * Generate a song
 *
 * @param {Array.<Instrument>} instruments - Array of ZzFX sound paramaters.
 * @param {Array.<Pattern>} patterns - Array of pattern data.
 * @param {Array.<Number>} sequence - Array of pattern indexes.
 * @param {Number} [speed=125] - Playback speed of the song (in BPM).
 * @returns {Array.<Array.<Number>>} Left and right channel sample data.
 */

zzfxM = ( instruments, patterns, sequence, BPM = 125 ) => {
	let instrumentParameters;
	let i;
	let j;
	let k;
	let note;
	let sample;
	let patternChannel;
	let notFirstBeat;
	let stop;
	let instrument;
	let pitch;
	let attenuation;
	let outSampleOffset;
	let isSequenceEnd;
	let sampleOffset = 0;
	let nextSampleOffset;
	let sampleBuffer = [];
	let leftChannelBuffer = [];
	let rightChannelBuffer = [];
	let channelIndex = 0;
	let panning = 0;
	let hasMore = 1;
	let sampleCache = {};
	let beatLength = zzfxR / BPM * 60 >> 2;

	// for each channel in order until there are no more
	for ( ; hasMore; channelIndex++ ) {

		// reset current values
		sampleBuffer = [ hasMore = notFirstBeat = pitch = outSampleOffset = 0 ];

		// for each pattern in sequence
		sequence.map( ( patternIndex, sequenceIndex ) => {
			// get pattern for current channel, use empty 1 note pattern if none found
			patternChannel = patterns[ patternIndex ][ channelIndex ] || [ 0, 0, 0 ];

			// check if there are more channels
			hasMore |= !!patterns[ patternIndex ][ channelIndex ];

			// get next offset, use the length of first channel
			nextSampleOffset = outSampleOffset + ( patterns[ patternIndex ][ 0 ].length - 2 - !notFirstBeat ) * beatLength;
			// for each beat in pattern, plus one extra if end of sequence
			isSequenceEnd = sequenceIndex == sequence.length - 1;
			for ( i = 2, k = outSampleOffset; i < patternChannel.length + isSequenceEnd; notFirstBeat = ++i ) {

				// <channel-note>
				note = patternChannel[ i ];

				// stop if end, different instrument or new note
				stop = i == patternChannel.length + isSequenceEnd - 1 && isSequenceEnd ||
					instrument != ( patternChannel[ 0 ] || 0 ) | note | 0;

				// fill buffer with samples for previous beat, most cpu intensive part
				for ( j = 0; j < beatLength && notFirstBeat;

					// fade off attenuation at end of beat if stopping note, prevents clicking
					j++ > beatLength - 99 && stop ? attenuation += ( attenuation < 1 ) / 99 : 0
				) {
					// copy sample to stereo buffers with panning
					sample = ( 1 - attenuation ) * sampleBuffer[ sampleOffset++ ] / 2 || 0;
					leftChannelBuffer[ k ] = ( leftChannelBuffer[ k ] || 0 ) - sample * panning + sample;
					rightChannelBuffer[ k ] = ( rightChannelBuffer[ k++ ] || 0 ) + sample * panning + sample;
				}

				// set up for next note
				if ( note ) {
					// set attenuation
					attenuation = note % 1;
					panning = patternChannel[ 1 ] || 0;
					if ( note |= 0 ) {
						// get cached sample
						sampleBuffer = sampleCache[
							[
								instrument = patternChannel[ sampleOffset = 0 ] || 0,
								note
							]
						] = sampleCache[ [ instrument, note ] ] || (
							// add sample to cache
							instrumentParameters = [ ...instruments[ instrument ] ],
							instrumentParameters[ 2 ] *= 2 ** ( ( note - 12 ) / 12 ),

							// allow negative values to stop notes
							note > 0 ? zzfxG( ...instrumentParameters ) : []
						);
					}
				}
			}

			// update the sample offset
			outSampleOffset = nextSampleOffset;
		} );
	}

	return [ leftChannelBuffer, rightChannelBuffer ];
}
