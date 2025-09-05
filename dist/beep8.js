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
 * ---
 *
 * Website: https://beep8.com
 * Games: https://beepmini.com
 * Github: https://github.com/BinaryMoon/beep8
 * BlueSky: https://bsky.app/profile/binarymoon.bsky.social
 *
 * ---
 *
 * MIT License
 *
 * Copyright (c) 2024 - 2025 BinaryMoon
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

/**
 * An example project structure.
 *
 * const playGame = {
 *   init: () => { }
 *   update: async ( dt ) => { }
 *   render: () => { }
 * }
 *
 * window.addEventListener( "load", () => {
 *   beep8.init( async () => {
 *     // A function to run after everything loads.
 *     beep8.Scene.add( 'game', playGame, 30 );
 *     beep8.Scene.set( 'game' );
 *   } );
 * } );
 */

const beep8 = {};



( function( beep8 ) {

	beep8.CONFIG = {
		// Enable debug?
		DEBUG: true,
		// The name of the project.
		NAME: "beep8 Project",
		// The version of the project.
		VERSION: "1.0.0-dev",
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
			TYPING: 'ui/click/003',
			MENU_UP: 'tone/beep/002',
			MENU_DOWN: 'tone/beep/001',
			MENU_SELECT: 'tone/beep/003',
		},
		// The font files.
		// The font files must be PNG files, with the characters in a grid.
		FONT_DEFAULT: "../assets/font-default-thin.png",
		FONT_TILES: "../assets/font-tiles.png",
		FONT_ACTORS: "../assets/font-actors.png",
		// The characters in the font file.
		// These are for the default font(s). If you use a different list you
		// will need to upate the font file to match.
		CHRS: `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*+=-<>_#&@%^~$£€¥¢!?:;'"/\\()[]{}.,©®™•…| `,
		// Character size. The characters file's width must be
		// 12 * CHR_WIDTH and the height must be 12 * CHR_HEIGHT.
		CHR_WIDTH: 12,
		CHR_HEIGHT: 12,
		// Screen width and height in characters.
		SCREEN_ROWS: 25,
		SCREEN_COLS: 20,
		// EXPERIMENTAL
		// This is an experimental feature and is subject to change at any time.
		// The number of colors to use.
		// 1 = each tile is 2 colors (foreground and background).
		// 2 = each tile could be multiple colours. A background colour, and
		// shades of a foreground colour based upon the greyscale colours used
		// in the tiles.
		// Make sure to change the tiles image as well if you change this.
		SCREEN_COLORS: 1,
		// Disable to turn off CRT effect.
		// This is a number between 0 and 1, where 0 is no CRT effect and 1 is full CRT effect.
		// Anything over 0.4 is probably too much.
		CRT_ENABLE: 0.3,
		// Enable/ Disable vignette effect.
		// This is a boolean value.
		CRT_VIGNETTE: true,
		// Color palette.
		// Colors count from 0.
		// The first color is the background color.
		// This can be as many colors as you want, but each color requires us to
		// store a scaled copy of the characters image in memory, so more colors
		// = more memory.
		// You can redefine the colors at runtime with beep8.redefineColors([]).
		COLORS: [
			"#0A0C1F", // Very dark blue - almost black. The darkest colour.
			"#263264", // Dark blue
			"#A0ABB6", // Mid grey
			"#B2EFEB", // Light blue
			"#3FB0F1", // Mid blue
			"#3548A3", // Blue
			"#420241", // Dark red/ purple
			"#6A3E49", // Brown
			"#C22D44", // Red
			"#E08355", // Orange
			"#FFC763", // Yellow
			"#A7D171", // Light green
			"#30AB62", // Green
			"#1E7F82", // Dark Green
			"#FF76D7", // Pink
			"#F4F4F4", // Off white
		],
		// The passkey for the game.
		// This is used when generating passcodes for levels.
		// It should be unique for each game so that passcodes are different for each game.
		// You can generate a passcode for a level with beep8.Passcode.getCode( levelId ).
		// The passcode will be a 4-character code.
		PASSKEY: "beep8IsAwesome",
		// If this is not null, then we will display a virtual joystick if the user
		// is on a mobile device.
		TOUCH_VJOY: true,
		// Cursor config:
		CURSOR: {
			// Blink interval in milliseconds.
			BLINK_INTERVAL: 400,
		},
		// If set, then special escape sequences can be used when printing (to set colors, etc).
		// These are the sequences that starts and end an escape sequence. See the documentation for
		// beep8.print() for more info on escape sequences.
		// If you don't want this, comment out these line, or set them to null.
		PRINT_ESCAPE_START: "{{",
		PRINT_ESCAPE_END: "}}",
		// The first character to use for the border in printBox & menus.
		// The number is the index of the top left corner of a border pattern in the font file.
		// The method will use the 4 corners, and the top horizontal and left vertical sides.
		BORDER_CHAR: 54,
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

		// Combine options with beep8.CONFIG using deep merge
		if ( options !== null ) {
			beep8.CONFIG = beep8.Utilities.deepMerge( beep8.CONFIG, options );
		}

		return beep8.Core.init( callback );

	}


	/**
	 * Sets the frame handler, that is, the function that will be called on
	 * every frame to render the screen. This is only needed if you are making a
	 * real time game. For asynchronous games, you can update the screen manually.
	 *
	 * @param {Function} handler - The frame handler function.
	 * @param {number} [fps=30] - The target frames per second. Recommended: 30.
	 * @returns {void}
	 */
	beep8.frame = function( renderHandler = null, updateHandler = null, fps = 30 ) {

		beep8.Core.preflight( "beep8.frame" );

		if ( renderHandler !== null ) {
			beep8.Utilities.checkFunction( "render handler", renderHandler );
		}

		if ( updateHandler !== null ) {
			beep8.Utilities.checkFunction( "update handler", updateHandler );
		}

		beep8.Utilities.checkNumber( "fps", fps );

		return beep8.Core.setFrameHandlers( renderHandler, updateHandler, fps );

	}


	/**
	 * Forces the screen to render right now. Useful for immediate redraw in
	 * animations.
	 *
	 * You only need this if you are doing some kind of animation on your own
	 * and you want to redraw the screen immediately to show the current state.
	 *
	 * Otherwise the screen repaints automatically when waiting for user input.
	 *
	 * @returns {void}
	 */
	beep8.render = function() {

		beep8.Core.preflight( "beep8.render" );

		return beep8.Renderer.render();

	}


	/**
	 * Sets the foreground and/or background color.
	 *
	 * If you set the background color to -1, it will be transparent.
	 *
	 * @param {number} fg - The foreground color.
	 * @param {number} [bg=undefined] - The background color (optional).
	 * @returns {void}
	 */
	beep8.color = function( fg, bg = undefined ) {

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
	 * Clears the screen using the specified or current background color.
	 *
	 * @param {number} [bgColor=undefined] - Optional background color index.
	 * If provided, uses this index to get the color from the config. If not
	 * provided, uses the current background color (drawState.bgColor).
	 * @returns {void}
	 */
	beep8.cls = function( bgColor = undefined ) {

		beep8.Core.preflight( "beep8.Core.cls" );

		beep8.Core.cls( bgColor );

	}


	/**
	 * Places the cursor at the given screen column and row. All drawing and
	 * printing operations will start from here.
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

		beep8.CursorRenderer.setCursorVisible( visible );

	}


	/**
	 * Prints text at the cursor position, using the current foreground and
	 * background colors.
	 *
	 * The text can contain embedded newlines and they will behave as expected:
	 * printing will continue at the next line.
	 *
	 * Fonts use the defined tile size as their dimensions. Each character will
	 * be one tile. By default the tile size is: 12x12 pixels.
	 *
	 * If PRINT_ESCAPE_START and PRINT_ESCAPE_END are defined in CONFIG, then
	 * you can also use escape sequences. For example:
	 * - {{c1}} sets the color to 1
	 * - {{b2}} sets the background to 2 (red)
	 * - {{tfontname}} changes the current font to 'fontname' (temporary)
	 * - {{z}} resets the color and font to their states before printing started
	 *
	 * Note: Font changes using escape sequences are temporary and will be
	 * reset after the print operation is complete.
	 *
	 * See example-printing.html for an example.
	 *
	 * @param {string} text - The text to print.
	 * @param {number} [wrapWidth=-1] - The width to wrap text at. -1 for no wrapping.
	 * @returns {void}
	 */
	beep8.print = function( text, wrapWidth = -1, fontId = null ) {

		beep8.Core.preflight( "beep8.text" );

		beep8.Utilities.checkString( "text", text );
		beep8.Utilities.checkNumber( "wrapWidth", wrapWidth );

		let font = fontId;
		if ( null !== font ) {
			beep8.Utilities.checkString( "fontId", fontId );
			font = beep8.TextRenderer.getFontByName( fontId );
		}

		beep8.TextRenderer.print( text, font, wrapWidth );

	}


	/**
	 * Prints text centered horizontally in a field of the given width.
	 *
	 * If the text is bigger than the width, it will wrap.
	 *
	 * @param {string} text - The text to print.
	 * @param {number} width - The width of the space to place the text in, measured in Columns. Defaults to the screen width.
	 * @returns {void}
	 */
	beep8.printCentered = function( text, width = beep8.CONFIG.SCREEN_COLS, fontId = null ) {

		beep8.Core.preflight( "beep8.printCentered" );

		beep8.Utilities.checkString( "text", text );
		beep8.Utilities.checkNumber( "width", width );

		let font = fontId;
		if ( null !== font ) {
			beep8.Utilities.checkString( "fontId", fontId );
			font = beep8.TextRenderer.getFontByName( fontId );
		}

		beep8.TextRenderer.printCentered( text, width, font );

	}


	/**
	 * Prints text aligned to the right in a space of the given width.
	 * If the text is bigger than the width, it will wrap.
	 *
	 * @param {string} text - The text to print.
	 * @param {number} width - The width of the space to place the text in, measured in Columns. Defaults to the screen width.
	 * @param {string} [fontId=null] - The font ID to use.
	 * @returns {void}
	 */
	beep8.printRight = function( text, width = beep8.CONFIG.SCREEN_COLS, fontId = null ) {

		beep8.Core.preflight( "beep8.printRight" );

		beep8.Utilities.checkString( "text", text );
		beep8.Utilities.checkNumber( "width", width );

		let font = fontId;
		if ( null !== font ) {
			beep8.Utilities.checkString( "fontId", fontId );
			font = beep8.TextRenderer.getFontByName( fontId );
		}

		beep8.TextRenderer.printRight( text, width, font );

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

		beep8.TextRenderer.drawText( x, y, text, fontId );

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

		return beep8.TextRenderer.measure( text );

	}


	/**
	 * Prints a character at the current cursor position, advancing the cursor
	 * position.
	 *
	 * @param {number|string} charCode - The character to print, as an integer
	 * (ASCII code) or a one-character string.
	 * @param {number} [numTimes=1] - How many times to print the character.
	 * @param {string} fontId - The font id for the font to draw with.
	 * @returns {void}
	 */
	beep8.printChar = function( charCode, numTimes = 1, fontId = null ) {

		beep8.Core.preflight( "beep8.printChar" );

		charCode = beep8.convChar( charCode );
		beep8.Utilities.checkInt( "charCode", charCode );
		beep8.Utilities.checkInt( "numTimes", numTimes );

		if ( numTimes < 0 ) {
			beep8.Utilities.fatal( "[beep8.printChar] numTimes must be a positive integer" );
		}

		// Nothing to print.
		if ( 0 === numTimes ) {
			return;
		}

		let font = fontId;
		if ( null !== font ) {
			beep8.Utilities.checkString( "fontId", fontId );
			font = beep8.TextRenderer.getFontByName( fontId );
		}

		beep8.TextRenderer.printChar( charCode, numTimes, font );

	}


	/**
	 * Prints a rectangle of the given size with the given character, starting
	 * at the current cursor position.
	 *
	 * @param {number} widthCols - Width of the rectangle in screen columns.
	 * @param {number} heightRows - Height of the rectangle in screen rows.
	 * @param {number|string} [charCode=8] - The character to print.
	 * @returns {void}
	 */
	beep8.printRect = function( widthCols, heightRows, charCode = 8 ) {

		beep8.Core.preflight( "beep8.printRect" );
		charCode = beep8.convChar( charCode );

		beep8.Utilities.checkNumber( "widthCols", widthCols );
		beep8.Utilities.checkNumber( "heightRows", heightRows );
		beep8.Utilities.checkNumber( "charCode", charCode );

		beep8.TextRenderer.printRect( widthCols, heightRows, charCode );

	}


	/**
	 * Prints a box with a border of the given size starting at the cursor
	 * position, using border-drawing characters.
	 *
	 * @param {number} widthCols - Width of the box in screen columns, including
	 * the border.
	 * @param {number} heightRows - Height of the box in screen rows, including
	 * the border.
	 * @param {boolean} [fill=true] - If true, fill the interior with spaces.
	 * @param {number} [borderChar=54] - The first border-drawing character to
	 * use.
	 * @returns {void}
	 */
	beep8.printBox = function( widthCols, heightRows, fill = true, borderChar = beep8.CONFIG.BORDER_CHAR ) {

		beep8.Core.preflight( "beep8.printBox" );
		borderChar = beep8.convChar( borderChar );

		beep8.Utilities.checkNumber( "widthCols", widthCols );
		beep8.Utilities.checkNumber( "heightRows", heightRows );
		beep8.Utilities.checkBoolean( "fill", fill );
		beep8.Utilities.checkNumber( "borderChar", borderChar );

		beep8.TextRenderer.printBox( widthCols, heightRows, fill, borderChar );

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
	beep8.drawRect = function( x, y, width, height, lineWidth = 1 ) {

		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		beep8.Utilities.checkNumber( "width", width );
		beep8.Utilities.checkNumber( "height", height );
		beep8.Utilities.checkNumber( "lineWidth", lineWidth );

		beep8.Core.drawRect( x, y, width, height, lineWidth );

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
	 * Plays a sound (previously loaded with beep8.loadSound).
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

		beep8.TextRenderer.spr( ch, x, y );

	}


	/**
	 * Draws an actor on the screen with a specific frame and direction.
	 *
	 * @param {number} ch - The character code of the actor.
	 * @param {number} frame - The frame to draw.
	 * @param {number} [direction=0] - The direction to draw the actor in. 0 = right, 1 = left.
	 * @returns {void}
	 */
	beep8.drawActor = function( ch, animation ) {

		ch = beep8.convChar( ch );

		beep8.Utilities.checkInt( "ch", ch );
		beep8.Utilities.checkString( "animation", animation );

		beep8.Actors.draw( ch, animation );

	}


	/**
	 * Draws a sprite on the screen.
	 *
	 * @param {number|string} ch - The character code of the sprite.
	 * @param {number} x - The X position at which to draw.
	 * @param {number} y - The Y position at which to draw.
	 * @returns {boolean} True if the sprite was drawn, otherwise false.
	 */
	beep8.sprActor = function( ch, animation, x, y, startTime = null ) {

		ch = beep8.convChar( ch );

		beep8.Utilities.checkInt( "ch", ch );
		beep8.Utilities.checkString( "animation", animation );
		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );

		return beep8.Actors.spr( ch, animation, x, y, startTime );

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

		return beep8.Input.keyHeld( keyName );

	}


	/**
	 * Play a song.
	 *
	 * @param {string} song - The name of the song to play.
	 * @returns {void}
	 */
	beep8.playSong = function( song ) {

		beep8.Utilities.checkString( "song", song );

		beep8.Sound.playSong( song );

	}


	/**
	 * Play a sound effect.
	 *
	 * @param {string} sfx - The name of the sound effect to play.
	 * @returns {void}
	 */
	beep8.playSfx = function( sfx ) {

		beep8.Utilities.checkString( "sfx", sfx );

		beep8.Sfx.play( sfx );

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

		return beep8.Input.keyJustPressed( keyName );

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

		fontId = fontId || "default-thin";
		beep8.Utilities.checkString( "fontId", fontId );

		beep8.TextRenderer.setFont( fontId );

	}


	/**
	 * Returns the current font.
	 *
	 * @returns {string} The current font.
	 */
	beep8.getFont = function() {

		beep8.Core.preflight( "beep8.getFont" );

		beep8.TextRenderer.getFont();

	}


	/**
	 * Returns the font object for the given font name.
	 *
	 * @param {string} fontName - The name of the font.
	 * @returns {Object} The font object.
	 */
	beep8.getFontByName = function( fontName ) {

		beep8.Utilities.checkString( "fontName", fontName );

		return beep8.TextRenderer.getFontByName( fontName );

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

		beep8.TextRenderer.setTileFont( fontId );

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
	 * Run a screenshake effect.
	 *
	 * @param {number} duration - The duration of the screenshake effect in seconds.
	 * @returns {boolean} Returns true if the screenshake effect was successfully triggered.
	 */
	beep8.screenShake = function( duration ) {

		beep8.Utilities.checkNumber( "duration", duration );

		return beep8.Renderer.shakeScreen( duration );

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


	/**
	 * Returns the text with line breaks inserted so that it fits within the
	 * given width.
	 *
	 * @param {string} text - The text to wrap.
	 * @param {number} width - The width to wrap text at.
	 * @returns {string} The wrapped text.
	 */
	beep8.wrapText = function( text, width ) {

		beep8.Utilities.checkString( "text", text );
		beep8.Utilities.checkNumber( "width", width );

		return beep8.TextRenderer.wrapText( text, width );

	}


	/**
	 * Add a new game scene.
	 *
	 * @param {string} name - The name of the scene.
	 * @param {Function} update - The update function for the scene.
	 * @returns {void}
	 */
	beep8.addScene = function( name, update = {} ) {

		beep8.Scene.add( name, update );

	}


	/**
	 * Switches to a specified scene by name.
	 *
	 * @param {string} name - The name of the scene to switch to.
	 * @returns {void}
	 */
	beep8.switchScene = function( name ) {

		beep8.Scene.set( name );

	}


	/**
	 * Gets the current active scene.
	 *
	 * @returns {Object|null} The active scene object, or null if no scene is active.
	 */
	beep8.getScene = function() {

		return beep8.Scene.get();

	}


	/**
	 * Speaks the given text using the Web Speech API.
	 *
	 * @param {string} text - The text to speak.
	 * @param {Object} [options] - Optional settings for speech synthesis.
	 * @param {number} [options.pitch=1] - The pitch of the voice.
	 * @param {number} [options.rate=1] - The rate of speech.
	 * @param {number} [options.volume=1] - The volume of the speech.
	 * @returns {void}
	 */
	beep8.speak = function( text, options = {} ) {

		// Speech synthesis is not supported in this browser.
		if ( !window.speechSynthesis ) return;

		beep8.Utilities.checkString( "text", text );
		beep8.Utilities.checkObject( "options", options );

		const utterance = new SpeechSynthesisUtterance( text );

		// Optional settings
		utterance.pitch = options.pitch ?? 1;
		utterance.rate = options.rate ?? 1;
		utterance.volume = options.volume ?? 1;

		speechSynthesis.speak( utterance );

	};

} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	// Initialize a flag to track if we're already paused.
	beep8._asyncActive = false;

	/**
	 * ASYNC API FUNCTIONS
	 * These functions must be called with 'await'.
	 * For example:
	 *
	 * const k = await beep8.Async.key();
	 * console.log("The user pressed " + k);
	 */
	beep8.Async = beep8.Async || {};

	/**
	 * Create a Proxy for beep8.Async to intercept method calls.
	 *
	 * The Proxy's get handler wraps each function so that:
	 * 1. If no async function is currently active:
	 *    - It sets the _asyncActive flag.
	 *    - It pauses the scene.
	 * 2. It calls beep8.Core.preflight with the method's name.
	 * 3. It runs the original method.
	 * 4. In the finally block, if the pause was applied:
	 *    - It resumes the scene.
	 *    - It resets the _asyncActive flag.
	 *
	 * This mechanism prevents nested async calls from applying the pause/resume logic more than once.
	 */
	beep8.Async = new Proxy(
		beep8.Async,
		{
			get( target, prop, receiver ) {

				const orig = Reflect.get( target, prop, receiver );

				if ( typeof orig === "function" ) {

					// Return a wrapped function for any async API function
					return async function( ...args ) {

						// Only wrap if no async function is already active.
						let doWrap = !beep8._asyncActive;
						if ( doWrap ) {
							// Mark that an async function has started.
							beep8._asyncActive = true;
							// console.log( `pause beep8.Async.${prop}` );
							// Pause the scene to wait for the async call.
							beep8.Scene.pause();
						}

						try {

							// Call preflight check with the method identifier.
							beep8.Core.preflight( `beep8.Async.${prop}` );
							// Execute the original async function with its arguments.
							const result = await orig.apply( this, args );
							return result;

						} finally {

							// Only resume and reset _asyncActive if it was this call that paused.
							if ( doWrap ) {
								beep8.Scene.resume();
								beep8._asyncActive = false;
							}

						}

					}

				}

				// Return non-function properties as-is.
				return orig;

			}
		}

	);


	/**
	 * Waits until the user presses a key and returns it.
	 *
	 * @returns {Promise<string>} The name of the key that was pressed.
	 */
	beep8.Async.key = async function() {

		return await beep8.Input.readKeyAsync();

	}


	/**
	 * Waits until the user clicks/ taps the pointer and returns its position.
	 *
	 * @returns {Promise<{x: number, y: number}>} The pointer position.
	 */
	beep8.Async.pointer = async function() {

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
	 * @param {Object} [options={}] - Additional options for the dialog. Uses beep8.Menu.display options.
	 * @returns {Promise<number>} The index of the selected item.
	 */
	beep8.Async.dialog = async function( prompt, choices = [ "OK" ], options = {} ) {

		beep8.Utilities.checkString( "prompt", prompt );
		beep8.Utilities.checkArray( "choices", choices );

		return beep8.Async.menu( choices, { prompt, center: true, ...options } );

	}


	/**
	 * Displays a dialog with the given prompt and choices, showing the text character by character.
	 *
	 * @param {string} prompt - The text to show.
	 * @param {string[]} [choices=["OK"]] - The choices to present to the user.
	 * @param {number} [wrapWidth=-1] - The width at which to wrap the text.
	 * @param {number} [delay=0.05] - The delay between characters in seconds.
	 * @param {Object} [options={}] - Additional options for the dialog. Uses beep8.Menu.display options.
	 * @returns {Promise<number>} The index of the selected item.
	 */
	beep8.Async.dialogTypewriter = async function( prompt, choices = [ "OK" ], wrapWidth = -1, delay = 0.05, options = {} ) {

		beep8.Utilities.checkString( "prompt", prompt );
		beep8.Utilities.checkArray( "choices", choices );
		beep8.Utilities.checkNumber( "delay", delay );

		if ( wrapWidth > 0 ) {
			prompt = beep8.TextRenderer.wrapText( prompt, wrapWidth );
		}

		return await beep8.Async.menu( choices, { prompt, typewriter: true, center: true, ...options } );

	}


	/**
	 * Shows text slowly, character by character, as in a typewriter.
	 *
	 * @param {string} text - The text to print.
	 * @param {number} [delay=0.05] - The delay between characters in seconds.
	 * @returns {Promise<void>} Resolves after the text is printed.
	 */
	beep8.Async.typewriter = async function( text, wrapWidth = -1, delay = 0.035, fontId = null, ) {

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

		beep8.Utilities.checkString( "url", url );

		return await beep8.Core.loadImage( url );

	}


	/**
	 * Loads a sound file from the given URL.
	 *
	 * @param {string} url - The URL of the sound file.
	 * @returns {Promise<HTMLAudioElement>} The loaded sound.
	 */
	beep8.Async.loadSound = async function( url ) {

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
	 * @param {number} [tileSizeWidthMultiplier=1] - The width multiplier for the tile size.
	 * @param {number} [tileSizeHeightMultiplier=1] - The height multiplier for the tile size.
	 * @returns {Promise<string>} The font ID.
	 */
	beep8.Async.loadFont = async function( fontImageFile, tileSizeWidthMultiplier = 1, tileSizeHeightMultiplier = 1 ) {

		beep8.Utilities.checkString( "fontImageFile", fontImageFile );
		beep8.Utilities.checkNumber( "tileSizeWidthMultiplier", tileSizeWidthMultiplier );
		beep8.Utilities.checkNumber( "tileSizeHeightMultiplier", tileSizeHeightMultiplier );

		const fontName = "FONT@" + beep8.Utilities.makeUrlPretty( fontImageFile );
		await beep8.TextRenderer.loadFontAsync( fontName, fontImageFile, tileSizeWidthMultiplier, tileSizeHeightMultiplier );

		return fontName;

	}


	/**
	 * Waits for a given number of seconds and then continues execution.
	 *
	 * @param {number} seconds - The duration to wait.
	 * @returns {Promise<void>} Resolves after the specified time.
	 */
	beep8.Async.wait = async function( seconds ) {

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
			if ( key.includes( "Enter" ) || key.includes( "ButtonA" ) || key.includes( " " ) ) break;
		}

	}

} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	beep8.Actors = {};


	/**
	 * The animations for the default actors.
	 *
	 * @type {Object}
	 */
	beep8.Actors.animations = {
		'idle': {
			frames: [ 0 ],
			fps: 1,
		},
		'idle-right': {
			frames: [ 1 ],
			fps: 1,
		},
		'idle-left': {
			frames: [ -1 ],
			fps: 1,
		},
		'idle-up': {
			frames: [ 4 ],
			fps: 1,
		},
		'move-right': {
			frames: [ 1, 2 ],
			fps: 4,
			loop: true
		},
		'move-left': {
			frames: [ -1, -2 ],
			fps: 4,
			loop: true
		},
		'move-up': {
			frames: [ 5, -5 ],
			fps: 4,
			loop: true
		},
		'move-down': {
			frames: [ 3, -3 ],
			fps: 4,
			loop: true,
		},
		'jump-right': {
			frames: [ 5 ],
			fps: 1,
			loop: false
		},
		'jump-left': {
			frames: [ -5 ],
			fps: 1,
			loop: false
		},
		'spin-left': {
			frames: [ 0, 1, 4, -1 ],
			fps: 4,
			loop: true
		},
		'spin-right': {
			frames: [ 0, -1, 4, 1 ],
			fps: 4,
			loop: true
		}

	};


	/**
	 * Draw an actor at the specified x, y position.
	 *
	 * @param {number} ch - The character to draw.
	 * @param {string} animation - The animation to draw.
	 * @param {number} x - The x coordinate to draw the actor at.
	 * @param {number} y - The y coordinate to draw the actor at.
	 * @param {number} direction - The direction to draw the actor in. 0 = right, 1 = left.
	 * @returns {void}
	 */
	const drawActor = function( ch, animation, x, y, direction ) {

		const font = beep8.TextRenderer.curActors_;
		const chrIndex = ( ch * font.getColCount() ) + Math.abs( animationFrame( animation ) );

		beep8.TextRenderer.spr(
			chrIndex,
			x,
			y,
			font,
			direction || 0
		);

	}


	/**
	 * Draw an actor at the current cursor position.
	 *
	 * @param {number} ch - The character to draw.
	 * @param {number} frame - The frame to draw.
	 * @param {number} direction - The direction to draw the actor in. 0 = right, 1 = left.
	 * @returns {void}
	 */
	beep8.Actors.draw = function( ch, animation ) {

		beep8.Utilities.checkInt( "ch", ch );
		beep8.Utilities.checkString( "animation", animation );

		const frame = animationFrame( animation );
		const direction = frame >= 0 ? 0 : 1;

		drawActor(
			ch, animation,
			beep8.Core.drawState.cursorCol * beep8.CONFIG.CHR_WIDTH,
			beep8.Core.drawState.cursorRow * beep8.CONFIG.CHR_HEIGHT,
			direction || 0
		);

	};


	/**
	 * Draw an actor at the specified x, y position.
	 * This ignores the cursor position and draws at specific x, y coordinates.
	 * This is useful for drawing actors in the game world and real-time apps.
	 *
	 * By default the animations will start playing based upon the current game
	 * time. This means they may loop from anywhere in the animation sequence.
	 * If you specify the startTime then the animation will start from the
	 * beginning. This is particularly useful for non-looping animations.
	 *
	 * The startTime should be stored and not changed each time the animation is
	 * drawn.
	 *
	 * The function will return false if the animation has finished playing.
	 *
	 * @param {number} ch The character to draw.
	 * @param {string} animation The animation to draw.
	 * @param {number} x The x coordinate to draw the actor at.
	 * @param {number} y The y coordinate to draw the actor at.
	 * @param {number} [startTime=null] The time the animation started.
	 * @returns {boolean} True if the animation is still playing, false if it has finished.
	 */
	beep8.Actors.spr = function( ch, animation, x, y, startTime = null ) {

		beep8.Utilities.checkInt( "ch", ch );
		beep8.Utilities.checkString( "animation", animation );
		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		if ( startTime !== null ) beep8.Utilities.checkNumber( "startTime", startTime );

		const frame = animationFrame( animation, startTime );
		const anim = beep8.Actors.animations[ animation ];
		const direction = frame >= 0 ? 0 : 1;

		if ( !shouldLoopAnimation( anim, startTime ) ) {
			return false;
		}

		drawActor( ch, animation, x, y, direction || 0 );

		// The animation is still playing.
		return true;

	}


	/**
	 * Get the current frame of an animation.
	 * This is used internally to automatically determine what frame to draw.
	 * This uses delta time to determine the current frame.
	 *
	 * @param {string} animation The animation to get the frame for.
	 * @returns {number} The frame to draw for the animation.
	 */
	const animationFrame = function( animation, startTime = null ) {

		// Does the animation exist.
		if ( beep8.Actors.animations[ animation ] === undefined ) {
			beep8.Utilities.fatal( "Invalid animation: " + animation );
		}

		// If the animation has a start time, use that.
		if ( startTime === null ) {
			startTime = beep8.Core.startTime;
		}

		// Get the current animation properties.
		const anim = beep8.Actors.animations[ animation ];
		let frame = 0;

		// If there's only one frame, return it.
		if ( anim.frames.length === 1 ) {
			frame = anim.frames[ 0 ];
		}

		// If there's more than one frame, calculate the frame to display.
		if ( anim.frames.length > 1 ) {

			const totalTime = beep8.Core.getNow() - startTime;
			const frameCount = anim.frames.length;
			const frameDuration = 1 / anim.fps;

			// Dividing totalTime by 1000 to convert ms to seconds.
			// Dividing by frameDuration to get the current frame.
			// Modulo frameCount to loop the animation.
			const frameIndex = Math.floor( ( totalTime / 1000 ) / frameDuration % frameCount );

			frame = anim.frames[ frameIndex ];

		}

		return frame;

	}


	/**
	 * Checks if the animation has finished looping.
	 *
	 * @param {Object} anim - The animation object.
	 * @param {number} startTime - The start time of the animation.
	 * @returns {boolean} - Returns true if the animation should continue, false if it has finished looping.
	 */
	const shouldLoopAnimation = function( anim, startTime ) {

		// If the animation has not started or is set to loop, continue the animation.
		if ( startTime === null || anim.loop === true ) {
			return true;
		}

		// Calculate the total length of the animation in milliseconds.
		const animationLength = anim.frames.length * ( 1000 / anim.fps );

		// Check if the current time exceeds the animation length.
		if ( beep8.Core.getNow() - startTime >= animationLength ) {
			return false;
		}

		return true;

	}

} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	beep8.Collision = {};

	beep8.COLLISION = {};
	beep8.COLLISION.NONE = 0;
	beep8.COLLISION.N = 1;
	beep8.COLLISION.E = 2;
	beep8.COLLISION.S = 4;
	beep8.COLLISION.W = 8;
	beep8.COLLISION.NE = beep8.COLLISION.N + beep8.COLLISION.E;
	beep8.COLLISION.NS = beep8.COLLISION.N + beep8.COLLISION.S;
	beep8.COLLISION.NW = beep8.COLLISION.N + beep8.COLLISION.W;
	beep8.COLLISION.SE = beep8.COLLISION.S + beep8.COLLISION.E;
	beep8.COLLISION.SW = beep8.COLLISION.S + beep8.COLLISION.W;
	beep8.COLLISION.WE = beep8.COLLISION.W + beep8.COLLISION.E;
	beep8.COLLISION.WNE = beep8.COLLISION.W + beep8.COLLISION.N + beep8.COLLISION.E;
	beep8.COLLISION.WES = beep8.COLLISION.W + beep8.COLLISION.E + beep8.COLLISION.S;
	beep8.COLLISION.NES = beep8.COLLISION.N + beep8.COLLISION.E + beep8.COLLISION.S;
	beep8.COLLISION.ALL = beep8.COLLISION.N + beep8.COLLISION.E + beep8.COLLISION.S + beep8.COLLISION.W;

} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	beep8.Core = {};

	beep8.Core.realCanvas = null;
	beep8.Core.realCtx = null;
	beep8.Core.canvas = null;
	beep8.Core.ctx = null;
	beep8.Core.container = null;
	beep8.Core.startTime = 0;
	beep8.Core.deltaTime = 0;
	beep8.Core.crashed = false;
	beep8.Core.crashing = false;

	beep8.Core.drawState = {
		fgColor: 7,
		bgColor: 0,  // -1 means transparent

		cursorCol: 0,
		cursorRow: 0,

		cursorVisible: false, // Don't change this directly, use cursorRenderer.setCursorVisible()
	};

	let lastFrameTime = null;
	let initDone = false;
	let updateHandler = null;
	let renderHandler = null;
	let targetDt = 0;
	let timeToNextFrame = 0;
	let pendingAsync = null;


	/**
	 * Initializes the engine.
	 *
	 * This merges config properties and then calls beep8.Core.asyncInit() to
	 * prepare assets.
	 *
	 * @param {Function} callback - The function to call when the engine is initialized.
	 * @return {void}
	 */
	beep8.Core.init = function( callback, options = {} ) {

		beep8.Utilities.checkFunction( "callback", callback );
		if ( options ) {
			beep8.Utilities.checkObject( "options", options );
		}

		// Merge the options with the default configuration.
		beep8.CONFIG = {
			...beep8.CONFIG,
			...options,
		};

		// Setup screenshot taking.
		beep8.Core.initScreenshot();

		// Initialize the engine asynchronously.
		beep8.Core.asyncInit( callback );

		// Initialize the game clock.
		beep8.Core.startTime = beep8.Core.getNow();

		beep8.Utilities.event( 'initComplete' );

	}


	/**
	 * Checks if the engine has been initialized.
	 *
	 * @returns {boolean} True if the engine has been initialized.
	 */
	beep8.Core.initialized = function() {

		return initDone;

	}


	/**
	 * Asynchronously initializes the engine.
	 *
	 * This function sets up the canvas, initializes subsystems, and then calls
	 * the callback function if it's set.
	 *
	 * @param {Function} callback - The function to call when the engine is initialized.
	 * @returns {void}
	 */
	beep8.Core.asyncInit = async function( callback = null ) {

		beep8.Utilities.log( "beep8 System initializing" );

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
		beep8.Core.ctx = beep8.Core.canvas.getContext( "2d", { willReadFrequently: true } );
		beep8.Core.ctx.imageSmoothingEnabled = false;

		// Load and initialize default fonts.
		await beep8.TextRenderer.initAsync();
		beep8.Input.init();

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

		beep8.Utilities.log( "beep8 System initialized" );

		await beep8.Intro.loading();
		await beep8.Intro.splash();

		// Call the callback function if it's set.
		if ( callback ) {
			await callback();
		}

	}


	/**
	 * Gets the container element for the engine.
	 *
	 * This is the element under which the rendering canvas is created. If the
	 * container is not specified in the configuration, this will be the body element.
	 *
	 * @returns {HTMLElement} The container element.
	 */
	beep8.Core.getBeepContainerEl = function() {

		let container = document.body;

		if ( beep8.CONFIG.CANVAS_SETTINGS && beep8.CONFIG.CANVAS_SETTINGS.CONTAINER ) {

			const containerSpec = beep8.CONFIG.CANVAS_SETTINGS.CONTAINER;

			if ( typeof ( containerSpec ) === "string" ) {

				container = document.getElementById( containerSpec.replace( '#', '' ) );

				if ( !container ) {
					beep8.Utilities.fatal( "beep8: Could not find container element with ID: " + containerSpec );
				}

			} else if ( containerSpec instanceof HTMLElement ) {

				container = containerSpec;

			} else {

				beep8.Utilities.error( "beep8: beep8.CONFIG.CANVAS_SETTINGS.CONTAINER must be either an ID of an HTMLElement." );
				container = document.body;

			}

		}

		return container;

	}


	/**
	 * Checks if the engine (and specified api method) is ready to run.
	 *
	 * This function checks if the engine has crashed, if the initAsync() method
	 * has been called, and if there is a pending asynchronous operation.
	 *
	 * This should be called at the start of any async operation.
	 *
	 * @param {string} apiMethod - The name of the API method being called.
	 * @returns {void}
	 */
	beep8.Core.preflight = function( apiMethod ) {

		if ( beep8.Core.crashed ) {
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
	 * This function should be called at the beginning of an asynchronous method.
	 * It sets up the pendingAsync object, which is used to track the state of the
	 * asynchronous operation.
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

		beep8.Renderer.render();

	}


	/**
	 * Checks if there is a pending asynchronous operation.
	 *
	 * @param {string} asyncMethodName - The name of the asynchronous method.
	 * @returns {boolean} True if there is a pending asynchronous operation.
	 */
	beep8.Core.hasPendingAsync = function( asyncMethodName = null ) {

		if ( null === asyncMethodName ) {
			return !!pendingAsync;
		}

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
	 * This function should be called at the end of an asynchronous method.
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


	let running = false;
	let animationFrameId = null;


	/**
	 * Set the update and render callbacks for the game loop.
	 *
	 * @param {Function|null} updateCallback - The update function. Optional.
	 * @param {Function} renderCallback - The render function.
	 * @param {number} [targetFps=30] - Target frames per second.
	 * @returns {void}
	 */
	beep8.Core.setFrameHandlers = function( renderCallback = null, updateCallback = null, targetFps = 30 ) {

		updateHandler = updateCallback || ( () => { } );
		renderHandler = renderCallback || ( () => { } );
		targetDt = 1 / targetFps;
		timeToNextFrame = 0;
		lastFrameTime = beep8.Core.getNow();

		// Cancel current animation frame if running.
		if ( animationFrameId ) {
			window.cancelAnimationFrame( animationFrameId );
			animationFrameId = null;
		}

		running = true;

		animationFrameId = window.requestAnimationFrame( beep8.Core.doFrame );

	}


	/**
	 * Update the game loop for realtime games.
	 *
	 * This function calls the update phase as many times as needed
	 * (capped to prevent spiraling) and then calls the render phase.
	 *
	 * @returns {void}
	 */
	beep8.Core.doFrame = async function() {

		// Stop if not running.
		if ( !running ) return;

		// Get current time and compute delta (in seconds).
		const now = beep8.Core.getNow();
		let delta = ( now - lastFrameTime ) / 1000;
		lastFrameTime = now;

		// Save actual delta time.
		beep8.Core.deltaTime = delta;

		// Cap delta to avoid large time steps.
		delta = Math.min( delta, 0.05 );

		// Accumulate time.
		timeToNextFrame += delta;

		// Determine how many update steps to run based upon target delta time
		// and actual delta time.
		// This ensures updates are run even if the frame rate is lower than
		// intended.
		let numUpdates = Math.floor( timeToNextFrame / targetDt );
		const MAX_UPDATES = 10;
		if ( numUpdates > MAX_UPDATES ) {
			numUpdates = MAX_UPDATES;
			// Reset accumulator to prevent spiral of death.
			timeToNextFrame = 0;
		}

		// Run fixed update steps.
		for ( let i = 0; i < numUpdates; i++ ) {
			if ( updateHandler ) {
				updateHandler( targetDt );
			}
			if ( beep8.Input && typeof beep8.Input.onEndFrame === 'function' ) {
				beep8.Input.onEndFrame();
			}
			beep8.Particles.update( targetDt );
		}

		// Retain the fractional remainder for accurate timing.
		timeToNextFrame %= targetDt;

		// if pending async then skip render.
		if ( renderHandler ) {
			renderHandler();
		}

		beep8.Renderer.render();

		animationFrameId = window.requestAnimationFrame( beep8.Core.doFrame );

	}


	/**
	 * Stop the game loop.
	 *
	 * @returns {void}
	 */
	beep8.Core.stopFrame = function() {

		running = false;
		if ( animationFrameId ) {
			window.cancelAnimationFrame( animationFrameId );
			animationFrameId = null;
		}

	}


	/**
	 * Clears the screen and resets the cursor to the top-left corner.
	 *
	 * It will optionally also set the background colour. By default it uses the
	 * specified background but you can override this yourself.
	 *
	 * @param {number} [bgColor] - Optional background color index.
	 * @returns {void}
	 */
	beep8.Core.cls = function( bgColor = undefined ) {

		bgColor = bgColor || beep8.Core.drawState.bgColor;

		beep8.Utilities.checkNumber( "bgColor", bgColor );

		beep8.Core.ctx.fillStyle = beep8.Core.getColorHex( bgColor );
		beep8.Core.ctx.fillRect( 0, 0, beep8.Core.canvas.width, beep8.Core.canvas.height );

		beep8.Core.setCursorLocation( 0, 0 );
		beep8.Renderer.markDirty();

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
		beep8.TextRenderer.regenColors();

	}


	/**
	 * Sets the colors used for text and background.
	 *
	 * @param {number} fg - The foreground color.
	 * @param {number} [bg=undefined] - The background color.
	 * @returns {void}
	 */
	beep8.Core.setColor = function( fg, bg = undefined ) {

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
	 * The cursor location is used for text rendering and is the position where
	 * the next character will be drawn.
	 *
	 * Characters can be text or images, drawn using the loaded fonts.
	 *
	 * Rounds the position to the nearest 0.5.
	 *
	 * @param {number} col - The column.
	 * @param {number} row - The row.
	 * @returns {void}
	 */
	beep8.Core.setCursorLocation = function( col, row ) {

		// Columns.
		beep8.Utilities.checkNumber( "col", col );
		beep8.Core.drawState.cursorCol = Math.round( col * 2 ) / 2;

		// Rows.
		if ( row !== undefined ) {
			beep8.Utilities.checkNumber( "row", row );
			beep8.Core.drawState.cursorRow = Math.round( row * 2 ) / 2;
		}

	}


	/**
	 * Move the cursor to the next character.
	 *
	 * This adjusts the drawing position without actually drawing anything.
	 *
	 * @returns {void}
	 */
	beep8.Core.nextCursorLocation = function() {

		let currentCursorCol = beep8.Core.drawState.cursorCol;
		let currentCursorRow = beep8.Core.drawState.cursorRow;

		beep8.Core.setCursorLocation( currentCursorCol + 1, currentCursorRow );

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
	 * Gets the current time in milliseconds.
	 *
	 * This is used for rendering and animation, and can also be used in the game
	 * to get the current time for things like timers.
	 *
	 * You can get the game start time by calling beep8.Core.startTime.
	 *
	 * @returns {number} The current time in milliseconds.
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
	 * This function is a wrapper around the canvas drawImage() function and will
	 * draw the image at any x,y position. It does not use the cursor position.
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
	 * Loads an image from the given URL.
	 *
	 * This function loads an image and converts its colors to the closest
	 * colors in the beep8 color palette.
	 *
	 * Remember to keep images as small as possible. The larger the image the
	 * longer it will take to process.
	 *
	 * @param {string} url - The URL of the image to load.
	 * @returns {Promise<HTMLImageElement>} The loaded image.
	 */
	beep8.Core.loadImage = async function( url ) {

		beep8.Utilities.log( 'load image', url );

		return new Promise(
			( resolve ) => {

				const img = new Image();
				img.crossOrigin = "Anonymous"; // Allow cross-origin images if needed

				img.onload = () => {

					// Create a canvas to manipulate the image
					const canvas = document.createElement( "canvas" );
					const ctx = canvas.getContext( "2d" );

					canvas.width = img.width;
					canvas.height = img.height;
					ctx.drawImage( img, 0, 0 );

					// Get image data
					const imageData = ctx.getImageData( 0, 0, canvas.width, canvas.height );
					const data = imageData.data;

					// Use the precomputed lookup table
					const lookupTable = generateColorLookupTable( beep8.CONFIG.COLORS );

					for ( let i = 0; i < data.length; i += 4 ) {

						const r = data[ i ];
						const g = data[ i + 1 ];
						const b = data[ i + 2 ];

						// Find the closest color using the lookup table
						const closestColor = findClosestColorUsingLookup( r, g, b, lookupTable );

						// Convert the closest hex color to RGB
						const { r: pr, g: pg, b: pb } = closestColor;

						// Replace the pixel color with the closest palette color
						data[ i ] = pr;
						data[ i + 1 ] = pg;
						data[ i + 2 ] = pb;

					}

					// Put the modified image data back on the canvas
					ctx.putImageData( imageData, 0, 0 );

					// Resolve with the modified image
					const modifiedImg = new Image();
					modifiedImg.onload = () => resolve( modifiedImg );
					modifiedImg.src = canvas.toDataURL();

				};
				img.src = url;
			}
		);

	}


	/**
	 * Draws a rectangle of the specified width and height.
	 *
	 * This ignores the cursor position.
	 *
	 * @param {number} x - The x-coordinate of the upper-left corner of the rectangle.
	 * @param {number} y - The y-coordinate of the upper-left corner of the rectangle.
	 * @param {number} width - The width of the rectangle.
	 * @param {number} height - The height of the rectangle.
	 * @returns {void}
	 */
	beep8.Core.drawRect = function( x, y, width, height, lineWidth = 1 ) {

		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		beep8.Utilities.checkNumber( "width", width );
		beep8.Utilities.checkNumber( "height", height );
		beep8.Utilities.checkNumber( "lineWidth", lineWidth );

		const oldStrokeStyle = beep8.Core.ctx.strokeStyle;
		const oldLineWidth = beep8.Core.ctx.lineWidth;

		beep8.Core.ctx.strokeStyle = beep8.Core.getColorHex( beep8.Core.drawState.fgColor );
		beep8.Core.ctx.lineWidth = lineWidth;

		// Drawn inside the shape.
		beep8.Core.ctx.strokeRect(
			Math.round( x ), Math.round( y ),
			Math.round( width ), Math.round( height )
		);

		// Restore properties.
		beep8.Core.ctx.strokeStyle = oldStrokeStyle;
		beep8.Core.ctx.lineWidth = oldLineWidth;

	}


	/**
	 * Draws a filled rectangle using the current colours.
	 *
	 * Ignores the cursor position.
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
	 * Take a screenshot when the 0 key is pressed.
	 *
	 * @returns {void}
	 */
	beep8.Core.initScreenshot = function() {

		if ( beep8.Core.initialized() ) {
			return;
		}

		const takeScreenshot = ( e ) => {
			if ( e.key === '0' ) {
				beep8.Core.downloadScreenshot();
			}
		};

		// Take a screenshot when the 0 key is pressed.
		document.addEventListener( 'pointerup', takeScreenshot );
		document.addEventListener( 'keyup', takeScreenshot );

	}


	/**
	 * Generates the bitmap data for the current screen and returns it to you.
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
	 * Download the current screen as a PNG image.
	 *
	 * @returns {void}
	 */
	beep8.Core.downloadScreenshot = function() {

		// Grab the image data from the drawn canvas (to include screen effects).
		// const dataUrl = beep8.Core.realCanvas.toDataURL( "image/png" );
		const dataUrl = beep8.Core.getHighResDataURL( beep8.Core.realCanvas );

		// Save as a file.
		beep8.Utilities.downloadFile( "beep8-screenshot.png", dataUrl );

	}


	/**
	 * Get a high-resolution data URL for the specified canvas.
	 *
	 * @param {HTMLCanvasElement} canvas - The canvas to get the data URL for.
	 * @param {number} [scale=4] - The scale factor.
	 * @param {string} [mimeType="image/png"] - The MIME type.
	 * @param {number} [quality=1] - The quality.
	 * @returns {string} The data URL.
	 */
	beep8.Core.getHighResDataURL = function( canvas, scale = 4, mimeType = "image/png", quality = 1 ) {

		// Create an offscreen canvas
		const offscreenCanvas = document.createElement( "canvas" );
		offscreenCanvas.width = canvas.width * scale;
		offscreenCanvas.height = canvas.height * scale;

		// Copy and scale the content
		const offscreenCtx = offscreenCanvas.getContext( "2d" );
		offscreenCtx.imageSmoothingEnabled = false; // Disable filtering
		offscreenCtx.scale( scale, scale ); // Use nearest-neighbor scaling
		offscreenCtx.drawImage( canvas, 0, 0 );

		// Get the data URL
		return offscreenCanvas.toDataURL( mimeType, quality );

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
	 * Updates the layout.
	 *
	 * @param {boolean} renderNow - Whether to render immediately.
	 * @returns {void}
	 */
	beep8.Core.updateLayout = function( renderNow ) {

		beep8.Core.updateLayout2d();

		if ( renderNow ) {
			beep8.Renderer.render();
		}

	}


	/**
	 * Updates the layout of the 2D canvas.
	 *
	 * @returns {void}
	 */
	beep8.Core.updateLayout2d = function() {

		beep8.Core.realCtx = beep8.Core.realCanvas.getContext( "2d", { willReadFrequently: true } );
		beep8.Core.realCtx.imageSmoothingEnabled = false;

		beep8.CONFIG.SCREEN_EL_WIDTH = beep8.CONFIG.SCREEN_WIDTH;
		beep8.CONFIG.SCREEN_EL_HEIGHT = beep8.CONFIG.SCREEN_HEIGHT;
		beep8.CONFIG.SCREEN_REAL_WIDTH = beep8.CONFIG.SCREEN_WIDTH;
		beep8.CONFIG.SCREEN_REAL_HEIGHT = beep8.CONFIG.SCREEN_HEIGHT;

		beep8.Core.realCanvas.style.width = '100%';
		beep8.Core.realCanvas.style.height = '100%';
		beep8.Core.realCanvas.style.filter = 'blur(0.5px)';
		beep8.Core.realCanvas.width = beep8.CONFIG.SCREEN_REAL_WIDTH;
		beep8.Core.realCanvas.height = beep8.CONFIG.SCREEN_REAL_HEIGHT;

		beep8.Core.container.style.aspectRatio = `${beep8.CONFIG.SCREEN_COLS} / ${beep8.CONFIG.SCREEN_ROWS}`;

	}


	/**
	 * Handles a crash.
	 *
	 * @param {string} [errorMessage="Fatal error"] - The error message to display.
	 * @returns {void}
	 */
	beep8.Core.handleCrash = function( errorMessage = "Fatal error" ) {

		if ( beep8.Core.crashed || beep8.Core.crashing ) return;

		beep8.Core.crashing = true;

		beep8.Core.setColor( beep8.CONFIG.COLORS.length - 1, 0 );
		beep8.Core.cls();

		beep8.Core.setCursorLocation( 1, 1 );
		beep8.TextRenderer.print( "*** CRASH ***:\n" + errorMessage, null, beep8.CONFIG.SCREEN_COLS - 2 );
		beep8.Renderer.render();

		beep8.Core.crashing = false;
		beep8.Core.crashed = true;

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

		return beep8.Core.isIOS() || beep8.Core.isAndroid() || beep8.Core.isTouchDevice();

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


	/**
	 * Finds the closest color in the palette to the given RGB values.
	 *
	 * @param {number} r - The red component (0-255).
	 * @param {number} g - The green component (0-255).
	 * @param {number} b - The blue component (0-255).
	 * @param {string[]} palette - The color palette (array of hex strings).
	 * @returns {string} The closest color in hex format.
	 */
	function findClosestColorUsingLookup( r, g, b, lookupTable, bucketSize = 4 ) {

		// Round RGB values to the nearest bucket
		const roundedR = Math.floor( r / bucketSize ) * bucketSize;
		const roundedG = Math.floor( g / bucketSize ) * bucketSize;
		const roundedB = Math.floor( b / bucketSize ) * bucketSize;

		const key = `${roundedR},${roundedG},${roundedB}`;
		return lookupTable[ key ];

	}


	// Cache the color lookup table to avoid recomputing it.
	// Only generated when an image is loaded externally.
	// Font images are not loaded this way.
	const colorLookupTable = {};


	/**
	 * Generates a color lookup table for the given palette.
	 *
	 * @param {string[]} palette - The color palette (array of hex strings).
	 * @param {number} [bucketSize=4] - The size of the color buckets.
	 * @returns {object} The color lookup table.
	 */
	function generateColorLookupTable( palette, bucketSize = 4 ) {

		if ( Object.keys( colorLookupTable ).length !== 0 ) {
			return colorLookupTable;
		}

		// Convert hex palette to rgb palette.
		const rgbPalette = palette.map( color => beep8.Utilities.hexToRgb( color ) );

		for ( let r = 0; r < 256; r += bucketSize ) {
			for ( let g = 0; g < 256; g += bucketSize ) {
				for ( let b = 0; b < 256; b += bucketSize ) {
					const key = `${r},${g},${b}`;
					colorLookupTable[ key ] = findClosestColor( r, g, b, rgbPalette );
				}
			}
		}

		return colorLookupTable;

	}


	/**
	 * Finds the closest color in the palette to the given RGB values.
	 *
	 * @param {number} r - The red component (0-255).
	 * @param {number} g - The green component (0-255).
	 * @param {number} b - The blue component (0-255).
	 * @param {object[]} palette - The color palette (array of RGB objects).
	 * @returns {object} The closest color in RGB format.
	 */
	function findClosestColor( r, g, b, palette ) {

		let closestColor = null;
		let closestDistance = Infinity;

		for ( const color of palette ) {

			const distance = (
				Math.pow( color.r - r, 2 ) +
				Math.pow( color.g - g, 2 ) +
				Math.pow( color.b - b, 2 )
			);

			if ( distance < closestDistance ) {
				closestDistance = distance;
				closestColor = color;
			}

		}

		return closestColor;

	}


} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	/**
	 * beep8.CursorRenderer handles the rendering and blinking of the cursor.
	 */
	beep8.CursorRenderer = {};

	let blinkCycle_ = 0;
	let toggleBlinkHandle_ = null;


	/**
	 * Set the visibility of the cursor.
	 *
	 * @param {boolean} visible - Whether the cursor should be visible
	 * @returns {void}
	 */
	beep8.CursorRenderer.setCursorVisible = function( visible ) {

		beep8.Utilities.checkBoolean( "visible", visible );

		// If the cursor is already in the desired state, do nothing.
		if ( beep8.Core.drawState.cursorVisible === visible ) return;

		beep8.Core.drawState.cursorVisible = visible;

		blinkCycle_ = 0;
		beep8.Renderer.render();

		if ( toggleBlinkHandle_ !== null ) {
			clearInterval( toggleBlinkHandle_ );
			toggleBlinkHandle_ = null;
		}

		// If visible, start the blink cycle.
		if ( visible ) {
			toggleBlinkHandle_ = setInterval(
				() => advanceBlink_(),
				beep8.CONFIG.CURSOR.BLINK_INTERVAL
			);
		}

	}


	/**
	 * Draws the flashing cursor.
	 * This is called automatically in the beep8 render function so does not
	 * need to be called manually.
	 *
	 * @param {CanvasRenderingContext2D} targetCtx - The context to draw the cursor on
	 * @returns {void}
	 */
	beep8.CursorRenderer.draw = function( targetCtx ) {

		beep8.Utilities.checkInstanceOf( "targetCtx", targetCtx, CanvasRenderingContext2D );

		// If the cursor is not visible or it is not time to blink, do nothing.
		if ( !beep8.Core.drawState.cursorVisible || blinkCycle_ <= 0 ) return;

		const font = beep8.TextRenderer.getFont();

		// Calculate the real position of the cursor.
		const realX = beep8.Core.drawState.cursorCol * beep8.CONFIG.CHR_WIDTH;
		const realY = beep8.Core.drawState.cursorRow * beep8.CONFIG.CHR_HEIGHT;

		// Draw the cursor.
		targetCtx.fillStyle = beep8.Core.getColorHex( beep8.Core.drawState.fgColor );

		targetCtx.fillRect(
			realX + 1, realY + 1,
			font.charWidth_ - 2, font.charHeight_ - 2
		);

	}


	/**
	 * Advances the cursor blink cycle.
	 *
	 * @private
	 * @returns {void}
	 */
	function advanceBlink_() {

		blinkCycle_ = ( blinkCycle_ + 1 ) % 2;
		beep8.Renderer.render();

	}


} )( beep8 || ( beep8 = {} ) );


( function( beep8 ) {
	'use strict';

	/**
	 * Lightweight Entity-Component store for Beep8.
	 * ---------------------------------------------
	 * • Entity: A reference to a collection of data for an object in game. It is a numeric ID. Automatically assigned when using the create() method.
	 * • Component: A property for an entity. The data can be any plain object. Each entity has a key string used as a property name. Loc is reserved for location.
	 * • System: Code that executes commands on entities. There are different systems for different processes.
	 *
	 * All data is stored by reference; mutating the returned
	 * component objects is intentional and fast.
	 */
	beep8.ECS = {};

	// auto-incrementing entity IDs
	let nextId = 0;

	// Map<name, Map<id, data>>
	let components = new Map();

	// Grid for positional queries.
	// To keep this up to date you must use setLoc() to move entities.
	let grid = [];

	// Map<name, function> for systems
	let systems = new Map();



	/**
	 * Create a new unique entity ID.
	 *
	 * @returns {number}
	 */
	function makeEntity() {

		return nextId++;

	}


	/**
	 * Ensure a component bucket exists and return it.
	 *
	 * @param {string} name
	 * @returns {Map<number, Object>}
	 * @private
	 */
	function bucket( name ) {

		// If component store doesn't exist, create it.
		if ( !components.has( name ) ) components.set( name, new Map() );
		// Return the store.
		return components.get( name );

	}


	/**
	 * Get all entities at a specific grid location.
	 *
	 * @param {number} x
	 * @param {number} y
	 * @returns {number[]} Array of entity IDs at that location
	 */
	beep8.ECS.entitiesAt = function( x, y ) {

		return grid[ y ]?.[ x ] ?? [];

	}


	/* ------------------------------------------------------------------
	   System pipeline helpers
	   ------------------------------------------------------------------*/

	/**
	 * Register a system that runs every frame.
	 *
	 * @param {Function} fn   System function (dt)=>void
	 * @param {string}   name Unique system name
	 * @param {number}  [order=0] Lower numbers run first
	 */
	beep8.ECS.addSystem = function( name, fn, order = 0 ) {

		beep8.Utilities.checkFunction( 'fn', fn );
		beep8.Utilities.checkString( 'name', name );
		beep8.Utilities.checkInt( 'order', order );

		if ( systems.has( name ) ) beep8.Utilities.warn( `ECS: overwriting existing system "${name}"` );

		systems.set( name, { fn, order } );

	};


	/**
	 * Add a system a single time. Don't overwite existing systems or add multiple copies.
	 *
	 * @param {Function} fn   System function (dt)=>void
	 * @param {string}   name Unique system name
	 * @param {number}  [order=0] Lower numbers run first
	 */
	beep8.ECS.addSystemOnce = function( fn, name, order = 0 ) {

		beep8.Utilities.checkFunction( 'fn', fn );
		beep8.Utilities.checkString( 'name', name );
		beep8.Utilities.checkInt( 'order', order );

		if ( systems.has( name ) ) return;

		beep8.ECS.addSystem( fn, name, order );

	};


	/**
	 * Remove a previously-registered system.
	 *
	 * @param {string} name
	 */
	beep8.ECS.removeSystem = function( name ) {

		systems.delete( name );

	};


	/**
	 * Run every system in order.
	 * Optionally pass a filter:  (name)=>boolean
	 *
	 * @param {number} dt Delta-time in seconds
	 * @param {(name:string)=>boolean=} filter Skip systems that return false
	 */
	beep8.ECS.run = function( dt, filter = () => true ) {

		[ ...systems.entries() ]
			// Sort by order/ priority.
			.sort( ( a, b ) => a[ 1 ].order - b[ 1 ].order )   // order ASC
			// Execute each system in priority order.
			.forEach(
				( [ name, { fn } ] ) => {
					if ( filter( name ) ) fn( dt );
				}
			);

	};


	/**
	 * Attach or overwrite a component on an entity.
	 *
	 * @param {number} id Entity ID
	 * @param {string} name Component name
	 * @param {Object} [data={}] Component data (stored by reference)
	 * @returns {void}
	 */
	beep8.ECS.add = function( id, name = null, data = {} ) {

		beep8.Utilities.checkInt( 'id', id );
		beep8.Utilities.checkString( 'name', name );
		beep8.Utilities.checkObject( 'data', data );

		// Add the new component to the store.
		bucket( name ).set( id, data );

		// If the component is Loc (location), update the position grid.
		if ( 'Loc' === name ) beep8.ECS.setLoc( id, data.x, data.y );

	}


	/**
	 * Set a component on an entity, overwriting any existing data.
	 * This is a convenience method for add().
	 *
	 * @param {number} id Entity ID
	 * @param {string} name Component name
	 * @param {Object} data Component data (stored by reference)
	 * @returns {void}
	 */
	beep8.ECS.set = function( id, name, data ) {

		beep8.ECS.add( id, name, data );

	}


	/**
	 * Set the location of an entity.
	 *
	 * @param {number} id Entity ID
	 * @param {number} x X coordinate
	 * @param {number} y Y coordinate
	 * @returns {void}
	 */
	beep8.ECS.setLoc = function( id, x, y ) {

		beep8.Utilities.checkInt( 'id', id );
		beep8.Utilities.checkInt( 'x', x );
		beep8.Utilities.checkInt( 'y', y );

		// Get the current location component.
		const loc = this.getComponent( id, 'Loc' );

		// Remove from old position.
		const oldRow = grid[ loc.y ];
		if ( oldRow ) {
			const cell = oldRow[ loc.x ];
			if ( cell ) {
				const i = cell.indexOf( id );
				if ( i !== -1 ) cell.splice( i, 1 );
			}
		}

		// Update component position.
		loc.x = x;
		loc.y = y;

		// Save new grid location.
		if ( !grid[ y ] ) grid[ y ] = [];
		if ( !grid[ y ][ x ] ) grid[ y ][ x ] = [];
		grid[ y ][ x ].push( id );

	}


	/**
	 * Get the component map for a given component name.
	 *
	 * @param {string} name
	 * @returns {Map<number,Object>} Map<entityId,data>
	 */
	beep8.ECS.get = function( name ) {

		beep8.Utilities.checkString( 'name', name );

		return components.get( name ) ?? new Map();

	}


	/**
	 * Return *all* components for a given entity.
	 *
	 * @param {number} id
	 * @returns {Map<string, Object>} Map of name → data
	 */
	beep8.ECS.getEntity = function( id ) {

		beep8.Utilities.checkInt( 'id', id );

		const out = new Map();
		for ( const [ name, map ] of components ) {
			if ( map.has( id ) ) out.set( name, map.get( id ) );
		}
		return out;

	}


	/**
	 * Get one specific component for an entity.
	 *
	 * @param {number} id
	 * @param {string} name
	 * @returns {Object|undefined}
	 */
	beep8.ECS.getComponent = function( id, name ) {

		return components.get( name )?.get( id );

	}


	/**
	 * Check if an entity owns a component.
	 *
	 * @param {number} id
	 * @param {string} name
	 * @returns {boolean}
	 */
	beep8.ECS.hasComponent = function( id, name ) {

		return components.get( name )?.has( id ) ?? false;

	}


	/**
	 * Remove a single component from an entity.
	 *
	 * @param {number} id
	 * @param {string} name
	 * @returns {void}
	 */
	beep8.ECS.removeComponent = function( id, name ) {

		components.get( name )?.delete( id );

	}


	/**
	 * Remove an entity entirely (all its components).
	 *
	 * @param {number} id
	 * @returns {void}
	 */
	beep8.ECS.removeEntity = function( id ) {

		const loc = this.getComponent( id, 'Loc' );

		if ( loc ) {
			const cell = grid[ loc.y ]?.[ loc.x ];
			if ( cell ) cell.splice( cell.indexOf( id ), 1 );
		}

		for ( const store of components.values() ) store.delete( id );

	}


	/**
	 * Create an entity from a bundle of components.
	 *
	 * @param {Object.<string, Object>} bundle Keys = component names
	 * @returns {number} The new entity ID
	 */
	beep8.ECS.create = function( bundle ) {

		const id = makeEntity();
		for ( const [ name, data ] of Object.entries( bundle ) ) {
			beep8.ECS.add( id, name, data );
		}
		return id;

	}


	/**
	 * Query for entities that own *all* given components.
	 *
	 * @param {...string} names
	 * @returns {number[]} Array of entity IDs
	 */
	beep8.ECS.query = function( ...names ) {

		if ( names.length === 0 ) return [];
		const base = components.get( names[ 0 ] );

		if ( !base ) return [];

		return [ ...base.keys() ].filter( id =>
			names.every( n => components.get( n )?.has( id ) )
		);

	}


	/**
	 * Count entities by type.
	 *
	 * @param {string} typeName
	 * @returns {number}
	 */
	beep8.ECS.countByType = function( typeName ) {

		// get all entities with a Type component
		const typeMap = this.get( 'Type' );
		if ( !typeMap ) return 0;

		let count = 0;

		for ( const comp of typeMap.values() ) {
			if ( comp.name === typeName ) count++;
		}

		return count;

	}


	/**
	 * Reset the ECS (clears all entities & components).
	 *
	 * @returns {void}
	 */
	beep8.ECS.reset = function() {

		components = new Map();
		systems = new Map();
		grid = [];
		nextId = 0;

	}

} )( beep8 || ( beep8 = {} ) );



( function( beep8 ) {

	beep8.Hooks = {};

	/**
	 * Internal hook management for actions and filters.
	 * This is used to manage the hooks for actions and filters in the beep8 framework.
	 * It allows you to add, execute, and remove hooks for various game events.
	 */
	const actions = {};
	const filters = {};


	/**
	 * Adds a hook to the specified store with the given name, callback, and priority.
	 * This function is used internally to manage hooks for actions and filters.
	 *
	 * @param {Object} store - The store to add the hook to (actions or filters).
	 * @param {string} hookName - The name of the hook.
	 * @param {Function} callback - The function to call when the hook is triggered.
	 * @param {number} [priority=10] - The priority of the hook.
	 * @returns {void}
	 */
	function _add( store, hookName, callback, priority = 10 ) {

		if ( !store[ hookName ] ) store[ hookName ] = [];
		store[ hookName ].push( { callback, priority } );
		store[ hookName ].sort( ( a, b ) => a.priority - b.priority );

	}


	/**
	 * Registers an action hook.
	 * This allows you to add a callback that will be executed when the action is triggered.
	 * You can use this to modify game behavior or add custom functionality.
	 *
	 * @param {string} hookName - The name of the action hook.
	 * @param {Function} callback - The function to call when the action is triggered.
	 * @param {number} [priority=10] - The priority of the action hook.
	 * @returns {void}
	 */
	beep8.Hooks.addAction = function( hookName, callback, priority = 10 ) {

		_add( actions, hookName, callback, priority );

	}


	/**
	 * Executes all registered actions for the given hook name.
	 * This will call each action's callback with the provided arguments.
	 *
	 * @example
	 * beep8.Hooks.doAction( 'onPlayerMove', playerId, newX, newY, dx, dy );
	 *
	 * @param {string} hookName - The name of the action hook to execute.
	 * @param {...*} args - The arguments to pass to the action callbacks.
	 * @returns {void}
	 *
	 */
	beep8.Hooks.doAction = function( hookName, ...args ) {

		if ( !actions[ hookName ] ) return;
		for ( const { callback } of actions[ hookName ] ) {
			callback( ...args );
		}

	}


	/**
	 * Registers a filter hook.
	 * This allows you to add a callback that will modify a value before it is returned.
	 * You can use this to change game data or apply transformations.
	 *
	 * @param {string} hookName - The name of the filter hook.
	 * @param {Function} callback - The function to call when the filter is applied.
	 * @param {number} [priority=10] - The priority of the filter hook.
	 * @returns {void}
	 */
	beep8.Hooks.addFilter = function( hookName, callback, priority = 10 ) {

		_add( filters, hookName, callback, priority );

	}


	/**
	 * Applies all registered filters for the given hook name to a value.
	 * This will call each filter's callback with the value and any additional arguments,
	 * returning the modified value.
	 *
	 * @example
	 * const modifiedValue = beep8.Hooks.applyFilters( 'modifyPlayerSpeed', playerSpeed, playerId );
	 *
	 * @param {string} hookName - The name of the filter hook to apply.
	 * @param {*} value - The initial value to filter.
	 * @param {...*} args - Additional arguments to pass to the filter callbacks.
	 * @return {*} The modified value after all filters have been applied.
	 */
	beep8.Hooks.applyFilters = function( hookName, value, ...args ) {

		if ( !filters[ hookName ] ) return value;

		let result = value;
		for ( const { callback } of filters[ hookName ] ) {
			result = callback( result, ...args );
		}

		return result;

	}


	/**
	 * Removes a specific action hook by its name and callback.
	 * This is useful for cleaning up hooks that are no longer needed.
	 *
	 * @param {string} hookName - The name of the action hook to remove.
	 * @param {Function} callback - The callback function to remove.
	 * @returns {void}
	 */
	beep8.Hooks.removeAction = function( hookName, callback ) {

		actions[ hookName ] = ( actions[ hookName ] || [] ).filter( h => h.callback !== callback );

	}


	/**
	 * Removes a specific filter hook by its name and callback.
	 * This is useful for cleaning up filters that are no longer needed.
	 *
	 * @param {string} hookName - The name of the filter hook to remove.
	 * @param {Function} callback - The callback function to remove.
	 * @returns {void}
	 */
	beep8.Hooks.removeFilter = function( hookName, callback ) {

		filters[ hookName ] = ( filters[ hookName ] || [] ).filter( h => h.callback !== callback );

	}


} )( beep8 || ( beep8 = {} ) );

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
	 * @param {number} maxLen - The maximum length of the string to read.
	 * @param {number} [maxWidth=-1] - The maximum width of the line.
	 * @returns {Promise<string>} A promise that resolves to the string that was read.
	 */
	beep8.Input.readLine = async function( initString, maxLen, maxWidth = -1 ) {

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
					beep8.Core.setCursorLocation( 1, curRow + 1 );
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
		const prefix = "8> ";

		// Loop through all colours.
		beep8.color( 0, 4 );
		beep8.cls();
		beep8.locate( 1, 1 );
		beep8.print( prefix + "beep8 Loading...\n" );

		await beep8.Async.wait( 0.4 );

	}


	/**
	 * Display a splash screen.
	 *
	 * @param {string} [name="beep8 Project"] The name of the project.
	 * @returns {Promise<void>} A promise that resolves when the splash screen is dismissed.
	 */
	beep8.Intro.splash = async function() {

		// Load title screen image.
		const titleScreen = beep8.Tilemap.load( `mBqYHoMBBACDAAMEgwADBIMBBACDAQQAgxh6AwSDGJkDBIMBBACDAQQAgwEEAIMDAwSDAwMEgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAAA8AAA8AmB6DAQQAgwADBIMAAwSDAAMEgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwMDBIMDAwSDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAAQEgwAEBIMABAQADwAADwCYHoMBBACDGJIDBIMYNwMEgxhbAwSDGDcDBIMYNwMEgxg3AwSDGQEEAwSDGDcDBIMYNwMEgxg3AwSDGDcDBIMYNwMEgxg3AwSDGDcDBIMZARYDBIMYNwMEgxg4AwSDAQQAgwEEAIMBBACDAAQEgwMDBIMBBAAADwAADwCYHoMPBQSDGEgDBIMCDwSDAQ8AgxMPBIMBBACDGQGIDwSDGQGHDwSDGQGJDwSDGE4FBIMZAVMPBIMZAVQPBIMZAVUPBIMYTgUEgwEPBIMBDwCDEw8EgxhKAwSDAQQAgwEEAIMBBACDDwUEgwEEAIMBBAAADwAADwCYHoMBBACDGEgDBIMBDwCDGHIFBIMBDwCDGE4FBIMZAZkPBIMYcgUEgxg9BQSDGK8FBIMZAVMPBIMYcgUEgxg9BQSDGK8FBIMLDwSDGHIFBIMLDwSDGEgDBIMBBACDAQQAgwEEAIMABASDAQQAgw8FBAAPAAAPAJgegwEEAIMYSgMEgwEPAIMBDwCDFwQPgwEEAIMZAZ0PBIMBDwSDGE4FBIMBBACDGQFUDwSDGQFTDwSDGE4BBIMBBACDAQ8EgwEPAIMYJQ8FgxhuDwSDGG4PBIMYlw8EgwAPBIMABASDAQQAgwEEAAAPAAAPAJgegwEEAIMYSAMEgwkPBIMYcgUEgwEPAIMYTgEEgxkBnQ8EgxhyBQSDGK8FBIMBBACDGQFTDwSDGHIFBIMYrwUEgwEEAIMBDwSDGHIFBIMYPQUEgxhIAwSDAQQAgwEEAIMBBACDAAQEgwAEBIMABAQADwAADwCYHoMBBACDGEgDBIMYTw8EgwEPAIMYJQ8FgxhOBQSDGQGaDwSDEgoPgxgcBQqDGBkFCoMYHQUKgxMKD4MYHQUPgxhOBQSDBg8EgxhOBQSDDwMEgxhIAwSDDgUEgwEEAIMBBACDAQQAgwEEAIMBBAAADwAADwCYHoMBBACDGFoDBIMYNwMEgxg3AwSDGDcDBIMYNwMEgxg3AwSDAQoEgxgrCgWDGDcDBIMYKwQKgwEKBIMYKwUEgxg3AwSDGFsDBIMYNwMEgxg3AwSDGKUDBIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAAAPAAAPAJgegwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMYJAoEgxguBQqDGBkKBIMYLwQKgxglCgWDGCsBBIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAAA8AAA8AmB6DAQQAgxgpAwSDAQQAgwEEAIMBBACDAQQAgwEEAIMSCgSDGBwFCoMYGQEKgxgdBQqDEwoFgxgiBQSDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAAAPAAAPAJgegxiXDwODGJcPA4MYGAMEgwEEAIMBBACDAQQAgw0FBIMLBAqDGCsKBYMABASDGCsECoMBCgSDGDIFBIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMDAwSDAwMEgwEEAIMBBACDAQQAAA8AAA8AmB6DAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgxgkCgSDGC4FCoMYGQoEgxgvBAqDGCUKBYMYKwUEgwAFCoMYHQEEgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAAA8AAA8AmB6DAQQAgwEEAIMBBACDAQQAgwEEAIMACgSDAAoEgwAKBIMYLgUEgxgZBAWDGBkEAYMYGQQFgxgvBQSDGC4FBIMYLwUEgwEEAIMBBACDAQQAgwEEAIMYrAMEgxg3AwSDGDcDBIMYWwMEgxg3AwQADwAADwCYHoMYNwMEgxg3AwSDGJsDBIMBBACDAQQAgwEEAIMBBACDAQQEgwEEBIMBBASDAQQEgwEEBIMBBACDAQQAgwEEAIMBBACDGQHlAwSDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAAA8AAA8AmB6DAQQAgwEEAIMBBACDAQQAgwEEAIMYbgMEgxhuAwSDGG4DBIMYbgMEgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAAA8AAA8AmB6DAA8EgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwADBIMYegMEgxiZAwSDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMAAwSDAAMEgwADBAAPAAAPAJgegxgcCgSDGB0KBIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgxgpAwSDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAAA8AAA8AmB6DGC4KBIMYLwoEgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgxgpAwSDGCkDBIMBBACDAQQAgwEEAIMBBACDAQQAgxcDBIMBAwSDGBgDBIMAAwSDAQQAgxh0AwSDGIYDBIMABQSDAQQAAA8AAA8AmB6DAQQAgwEEAIMBBACDAA8EgwEEAIMBBACDAQQAgxcDBIMCAwSDAQMEgxgYAwSDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAAMEgwADBIMYdAMEgxkBbAUEgwEEAIMZAUYFBIMBBAAADwAADwCYHoMWAwSDGCgDBIMBBACDAQQAgxh0AwSDEAMEgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDFgMEgxgoAwSDGHQDBIMYhgMEgxkBbAUEgwAFBIMABQWDAQUEgwEFBIMBBQQADwAADwCYHoMYKAUDgwAFA4MYKAMEgxh0AwSDAQQAgwEEAIMNBQSDAQQAgwEEAIMYdAMEgxiGAwSDFgMEgxgoAwSDFgMEgwEDBIMBAwSDEAMEgxi0BQSDAAEFgwMBBYMABQWDAQUEgwEFBIMBBQQADwAADwCYHoMBBQSDGCgFA4MABQODGCgDBIMYuAUEgwEEAIMBBACDGIYDBIMYdAMEgxi4BQSDDwMEgwsDBIMBAwSDAQMEgxkBagUDgwEDBIMYnAUDgwADBYMAAQWDAQUEgwAFBYMPAQWDAQUEgwEFBAAPAAAPAJgegwMBBYMBBQSDAQUEgwEFBIMBBQSDAQUEgwEFBIMBBQSDAQUEgwEFBIMBBQSDAQUEgwEFBIMBBQSDAQUEgwEFBIMBBQSDAQUEgw8BBYMRAQWDDwEFgwMFAYMBBQSDAQUEAA8AAA8AloMRAQWDEQEFgwMBBYMDAQWDAwEFgwMBBYMADwWDAwEFgwMBBYMADwWDAA8FgwAPBYMDAQWDAA8FgwAPBYMADwWDDwEFgwsBBYMRAQWDCwEFgxhYBQGDAA8BloMADwGDEAEFgwAPBYMADwWDAA8FgwAPBYMADwWDAQEFgxABBYMADwWDAA8FgwAPBYMADwWDAA8FgwkBBYMADwWDAA8FgwQBBYMADwGDAA8BgwAPAYMABQE=` );

		// Draw title screen.
		beep8.locate( 0, 0 );
		beep8.Tilemap.draw( titleScreen );

		// Click to start.
		let message = "Click to start";
		if ( beep8.Core.isTouchDevice() ) message = "Tap to start";

		beep8.color( 4, 5 );
		beep8.locate( 0, beep8.CONFIG.SCREEN_ROWS - 2 );
		beep8.printCentered( message, beep8.CONFIG.SCREEN_COLS );

		// Wait for user input.
		await beep8.Input.readPointerAsync();

		beep8.color( 15, 0 );
		beep8.cls();

	}


} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	beep8.Menu = {};


	/**
	 * Displays a menu with the given choices and returns the index of the selected choice.
	 *
	 * Displaying a menu will pause the execution of other elements of your game
	 * until a choice has been made.
	 *
	 * The menu automatically beeps and boops as the player navigates through the choices.
	 *
	 * The options object can contain the following properties:
	 * - options.title - The title of the menu.
	 * - options.prompt - The prompt to display above the choices.
	 * - options.selBgColor - The background color of the selected choice. Defaults to the current foreground colour.
	 * - options.selFgColor - The foreground color of the selected choice. Defaults to the current background colour.
	 * - options.border - Whether to draw a border around the menu. Defaults to true.
	 * - options.borderChar - The character to use for the border.
	 * - options.center - Whether to center the menu horizontally and vertically.
	 * - options.centerH - Whether to center the menu horizontally.
	 * - options.centerV - Whether to center the menu vertically.
	 * - options.padding - The padding around the prompt and choices.
	 * - options.selIndex - The index of the initially selected choice.
	 * - options.cancelable - Whether the menu can be canceled with the Escape key.
	 * - options.typewriter - display the prompt as a typewriter effect.
	 *
	 * @param {string[]} choices - The choices to display.
	 * @param {object} [options] - Options for the menu.
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
				border: true,
				borderChar: beep8.CONFIG.BORDER_CHAR,
				center: false,
				centerH: false,
				centerV: false,
				padding: 1,
				selIndex: 0,
				cancelable: false,
				typewriter: false
			},
			options
		);

		let startCol = beep8.Core.drawState.cursorCol;
		let startRow = beep8.Core.drawState.cursorRow;

		const promptSize = beep8.TextRenderer.measure( options.prompt );
		const prompt01 = options.prompt ? 1 : 0;
		const border01 = options.borderChar ? 1 : 0;
		let choicesCols = 0;
		const choicesRows = choices.length;

		choices.forEach(
			( choice ) => {
				choicesCols = Math.ceil( Math.max( choicesCols, beep8.TextRenderer.measure( choice ).cols ) );
			}
		);

		let totalCols = Math.ceil( Math.max( promptSize.cols, choicesCols ) ) + 2 * options.padding + 2 * border01;
		totalCols = Math.min( totalCols, beep8.CONFIG.SCREEN_COLS );

		const totalRows = prompt01 * ( promptSize.rows + 1 ) + choicesRows + 2 * options.padding + 2 * border01;

		if ( options.centerH || options.center ) {
			startCol = Math.round( ( beep8.CONFIG.SCREEN_COLS - totalCols ) / 2 );
		}

		if ( options.centerV || options.center ) {
			startRow = Math.round( ( beep8.CONFIG.SCREEN_ROWS - totalRows ) / 2 );
		}

		beep8.Core.drawState.cursorCol = startCol;
		beep8.Core.drawState.cursorRow = startRow;

		if ( options.border ) {

			// Print the background & border.
			beep8.TextRenderer.printBox( totalCols, totalRows, true, options.borderChar );

			// Print title at the top of the border.
			if ( options.title ) {
				const t = " " + options.title + " ";
				beep8.Core.drawState.cursorCol = startCol + Math.round( ( totalCols - t.length ) / 2 );
				beep8.TextRenderer.print( t );
			}

		}

		if ( options.prompt ) {

			beep8.Core.drawState.cursorCol = promptSize.cols <= totalCols ?
				( startCol + border01 + options.padding ) :
				( startCol + Math.round( ( totalCols - promptSize.cols ) / 2 ) );
			beep8.Core.drawState.cursorRow = startRow + border01 + options.padding;

			if ( options.typewriter ) {
				await beep8.Async.typewriter( options.prompt );
			} else {
				beep8.TextRenderer.print( options.prompt );
			}

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

			const k = await beep8.Input.readKeyAsync();

			if ( k.includes( "ArrowUp" ) ) {

				// Go up the menu.
				selIndex = selIndex > 0 ? selIndex - 1 : choices.length - 1;
				if ( choices.length > 1 ) beep8.Sfx.play( beep8.CONFIG.SFX.MENU_UP );

			} else if ( k.includes( "ArrowDown" ) ) {

				// Go down the menu.
				selIndex = ( selIndex + 1 ) % choices.length;
				if ( choices.length > 1 ) beep8.Sfx.play( beep8.CONFIG.SFX.MENU_DOWN );

			} else if ( k.includes( "Enter" ) || k.includes( "ButtonA" ) || k.includes( " " ) ) {

				// Select menu item.
				beep8.Sfx.play( beep8.CONFIG.SFX.MENU_SELECT );
				return selIndex;

			} else if ( ( k.includes( "Escape" ) || k.includes( "ButtonB" ) ) && options.cancelable ) {

				// Close menu.
				return -1;

			}

		}

	}


	/**
	 * Prints the choices for a menu highlighting the current choice.
	 *
	 * The options object should contain the following properties:
	 * - options.selBgColor - The background color of the selected choice.
	 * - options.selFgColor - The foreground color of the selected choice.
	 *
	 * @param {string[]} choices - The choices to print.
	 * @param {number} selIndex - The index of the selected choice.
	 * @param {object} options - Options for the menu.
	 * @returns {void}
	 */
	const printChoices = function( choices, selIndex, options ) {

		const origBg = beep8.Core.drawState.bgColor;
		const origFg = beep8.Core.drawState.fgColor;

		for ( let i = 0; i < choices.length; i++ ) {
			const isSel = i === selIndex;
			beep8.Core.setColor( isSel ? options.selFgColor : origFg, isSel ? options.selBgColor : origBg );
			beep8.TextRenderer.print( choices[ i ] + "\n" );
		}

		beep8.Core.setColor( origFg, origBg );

	}

} )( beep8 || ( beep8 = {} ) );

/**
 * beep8 Music Module
 * This module handles the creation, manipulation, and playback of procedurally generated music.
 */
( function( beep8 ) {

	beep8.Music = {};


	/**
	 * Calls a function n times and collects the results in an array.
	 *
	 * @param {number} n - Number of times to call the function.
	 * @param {function(number): any} fn - Function to be called with the current index.
	 * @returns {Array<any>} An array of results.
	 */
	function times( n, fn ) {

		var result = [];
		for ( var i = 0; i < n; i++ ) {
			result.push( fn( i ) );
		}
		return result;

	}


	// --- p1.js Note Conversion ---

	// p1.js supports 52 keys using these 52 characters.
	const p1Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";


	/**
	 * Converts a note string (e.g. "C4" or "D#4") to a MIDI note number.
	 * Expects a format: letter, optional accidental (# or b), then octave digit.
	 *
	 * @param {string} note - The musical note string.
	 * @returns {number|null} The MIDI note number, or null if the note format is invalid.
	 */
	function noteToMidi( note ) {

		var regex = /^([A-Ga-g])([#b]?)(\d)$/;
		var match = note.match( regex );

		if ( !match ) return null;

		var letter = match[ 1 ].toUpperCase();
		var accidental = match[ 2 ];
		var octave = parseInt( match[ 3 ], 10 );

		// Map letter to its base semitone number.
		var semitones = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[ letter ];
		if ( accidental === "#" ) {
			semitones += 1;
		} else if ( accidental === "b" ) {
			semitones -= 1;
		}

		// MIDI formula: (octave + 1) * 12 + semitones.
		return ( octave + 1 ) * 12 + semitones;

	}


	/**
	 * Converts a musical note (e.g. "C4" or "D#4") to a p1.js note letter.
	 * The MIDI note is clamped to the range [36, 87] before conversion.
	 *
	 * @param {string} note - The musical note string.
	 * @returns {string} The corresponding p1.js letter, or "?" if invalid.
	 */
	function noteToP1( note ) {

		let midi = noteToMidi( note );

		if ( midi === null ) return "?";

		midi = beep8.Utilities.clamp( midi, 36, 87 );

		return p1Alphabet.charAt( midi - 36 );

	}


	/**
	 * Compresses an array of note characters by replacing consecutive repeats
	 * (except for spaces and bars) with dashes to indicate sustained notes.
	 *
	 * @param {Array<string>} arr - Array of note characters.
	 * @returns {string} Compressed note string.
	 */
	function compressNotes( arr ) {

		if ( arr.length === 0 ) return "";

		var result = arr[ 0 ];

		for ( var i = 1; i < arr.length; i++ ) {
			if ( arr[ i ] === arr[ i - 1 ] && arr[ i ] !== " " && arr[ i ] !== "|" ) {
				result += "-";
			} else {
				result += arr[ i ];
			}
		}

		return result;

	}


	/**
	 * Creates a random boolean pattern of a given length.
	 * The pattern is modified several times with segment reversals.
	 *
	 * @param {number} len - The length of the pattern.
	 * @param {number} freq - Frequency parameter for reversals.
	 * @param {number} interval - Initial interval for segmentation.
	 * @param {number} loop - Number of times to modify the pattern.
	 * @returns {Array<boolean>} The generated pattern.
	 */
	function createRandomPattern( len, freq, interval, loop ) {

		var pattern = times(
			len,
			function() {
				return false;
			}
		);

		for ( var i = 0; i < loop; i++ ) {
			if ( interval > len ) break;
			pattern = reversePattern( pattern, interval, freq );
			interval *= 2;
		}

		return pattern;

	}


	/**
	 * Reverses segments of a boolean pattern based on a randomly generated toggle pattern.
	 *
	 * @param {Array<boolean>} pattern - The original boolean pattern.
	 * @param {number} interval - The segment length.
	 * @param {number} freq - Frequency of toggling within the segment.
	 * @returns {Array<boolean>} The modified pattern.
	 */
	function reversePattern( pattern, interval, freq ) {

		var pt = times(
			interval,
			function() {
				return false;
			}
		);

		for ( var i = 0; i < freq; i++ ) {
			pt[ beep8.Random.int( 0, interval - 1 ) ] = true;
		}

		return pattern.map(
			function( p, i ) {
				return pt[ i % interval ] ? !p : p;
			}
		);

	}


	// --- Chord Progression Generation ---


	/**
	 * Available chord progressions represented in Roman numerals.
	 *
	 * @type {Array<Array<string>>}
	 */
	const chords = [
		[ "I", "IIIm", "VIm" ],
		[ "IV", "IIm" ],
		[ "V", "VIIm" ]
	];


	/**
	 * Mapping of next chord progression indices.
	 *
	 * @type {Array<Array<number>>}
	 */
	const nextChordsIndex = [
		[ 0, 1, 2 ],
		[ 1, 2, 0 ],
		[ 2, 0 ]
	];


	/**
	 * Chord mapping for key C.
	 *
	 * @type {Object<string, Array<string>>}
	 */
	const chordMap = {
		I: [ "C4", "E4", "G4", "B4" ],
		IIIm: [ "E4", "G4", "B4", "D5" ],
		VIm: [ "A3", "C4", "E4", "G4" ],
		IV: [ "F4", "A4", "C5", "E5" ],
		IIm: [ "D4", "F4", "A4", "C5" ],
		V: [ "G3", "B3", "D4", "F4" ],
		VIIm: [ "B3", "D4", "F4", "A4" ]
	};


	/**
	 * Mapping of key shifts for transposition.
	 *
	 * @type {Object<string, number>}
	 */
	const keyShift = {
		C: 0,
		D: 2,
		Eb: 3,
		F: 5,
		G: 7,
		A: 9,
		Bb: 10
	};


	/**
	 * Available instrument options.
	 *
	 * @type {Array<number>}
	 */
	const instrumentOptions = [ 0, 1, 2, 3, 4, 5 ];

	const drumOptions = [ 6, 7 ];


	/**
	 * Gets the chord notes for a given key, Roman numeral, and octave.
	 *
	 * @param {string} key - The musical key (e.g., "C").
	 * @param {string} roman - The Roman numeral chord identifier (e.g., "I", "IIIm").
	 * @returns {Array<string>} An array of chord note strings.
	 */
	function getChordNotes( key, roman ) {

		const base = chordMap[ roman ] || chordMap.I;
		const shift = keyShift[ key ] || 0;

		return base.map(
			function( note ) {
				return transpose( note, shift );
			}
		);

	}


	/**
	 * Transposes a note by a specified number of semitones.
	 *
	 * @param {string} note - The note to transpose (e.g., "C4").
	 * @param {number} shift - The number of semitones to shift.
	 * @returns {string} The transposed note.
	 */
	function transpose( note, shift ) {

		var midi = noteToMidi( note );
		if ( midi === null ) {
			return note;
		}

		midi += shift;
		var octave = Math.floor( midi / 12 ) - 1;
		var index = midi % 12;
		var noteNames = [ "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" ];

		return noteNames[ index ] + octave;

	}


	/**
	 * Generates a chord progression as an array of chord note arrays.
	 *
	 * @param {number} len - The number of segments in the progression.
	 * @returns {Array<Array<string>>} The chord progression.
	 */
	function generateChordProgression( len ) {

		var keys = [ "C", "D", "Eb", "F", "G", "A", "Bb" ];
		var key = beep8.Random.pick( keys );
		var chordChangeInterval = 4;
		var currentRoman = null;
		var chordsIndex = 0;
		var progression = [];

		for ( var i = 0; i < len; i++ ) {
			if ( i % chordChangeInterval === 0 ) {
				if ( i === 0 ) {
					chordsIndex = beep8.Random.int( 0, chords.length - 1 );
					currentRoman = beep8.Random.pick( chords[ chordsIndex ] );
				} else if (
					beep8.Random.num() <
					0.8 - ( ( i / chordChangeInterval ) % 2 ) * 0.5
				) {
					chordsIndex = beep8.Random.pick( nextChordsIndex[ chordsIndex ] );
					currentRoman = beep8.Random.pick( chords[ chordsIndex ] );
				}
				var currentChord = getChordNotes( key, currentRoman );
			}

			progression.push( currentChord );

		}

		return progression;

	}


	// --- p1.js Music String Generators ---

	/**
	 * Generates a melody note string based on note length and chord progression.
	 *
	 * @param {number} noteCount - The number of beats/positions.
	 * @param {Array<Array<string>>} chordProgressionNotes - The chord progression notes.
	 * @returns {string} The compressed melody note string.
	 */
	function generateMelodyNote( noteCount, chordProgressionNotes ) {

		var notes = [ beep8.Random.pick( instrumentOptions ), '|' ];
		var pattern = createRandomPattern( noteCount, 4, 8, 3 );
		var octaveOffset = beep8.Random.int( -1, 1 );

		for ( var i = 0; i < noteCount; i++ ) {

			// Occasionally adjust the octave offset.
			if ( beep8.Random.chance( 10 ) ) {
				octaveOffset += beep8.Random.int( -1, 1 );
			}

			// Add a rest if no note should be played.
			if ( !pattern[ i ] ) {
				notes.push( " " );
				continue;
			}

			var chordNotes = chordProgressionNotes[ i ];
			// Select a random note from the chord.
			var ns = chordNotes[ beep8.Random.int( 0, chordNotes.length - 1 ) ];
			var baseOctave = parseInt( ns.slice( -1 ), 10 );
			// Clamp the octave so it fits within p1.js range (3 to 6).
			var newOctave = beep8.Utilities.clamp( baseOctave + octaveOffset, 3, 6 );
			var noteName = ns.slice( 0, -1 ).toUpperCase();
			var finalNote = noteName + newOctave;
			var p1Note = noteToP1( finalNote );
			notes.push( p1Note );

		}

		notes.push( '|' );

		return compressNotes( notes );

	}


	/**
	 * Generates a chord or arpeggio note string based on note length and chord progression.
	 *
	 * @param {number} noteCount - The number of beats/positions.
	 * @param {Array<Array<string>>} chordProgressionNotes - The chord progression notes.
	 * @returns {string} The compressed chord/arpeggio note string.
	 */
	function generateChordNote( noteCount, chordProgressionNotes ) {

		const notes = [ beep8.Random.pick( instrumentOptions ), '|' ];

		var isArpeggio = beep8.Random.chance( 30 );
		var arpeggioInterval = beep8.Random.pick( [ 4, 8, 16 ] );
		var arpeggioPattern = times(
			arpeggioInterval,
			function() {
				return beep8.Random.int( 0, 3 );
			}
		);

		var interval = beep8.Random.pick( [ 2, 4, 8 ] );
		var pattern = isArpeggio
			? times(
				noteCount,
				function() {
					return true;
				}
			)
			: createRandomPattern( noteCount, beep8.Random.pick( [ 1, 1, interval / 2 ] ), interval, 2 );

		var baseOctave = beep8.Random.int( -1, 1 );
		var isReciprocatingOctave = beep8.Random.chance( isArpeggio ? 30 : 80 );
		var octaveOffset = 0;

		for ( var i = 0; i < noteCount; i++ ) {

			// Adjust octave offset at set intervals.
			if ( isReciprocatingOctave && i % interval === 0 ) {
				octaveOffset = ( octaveOffset + 1 ) % 2;
			}

			// Insert a rest if no note is scheduled.
			if ( !pattern[ i ] ) {
				notes.push( " " );
				continue;
			}

			var chordNotes = chordProgressionNotes[ i ];
			var noteIndex = isArpeggio ? arpeggioPattern[ i % arpeggioInterval ] : 0;
			var ns = chordNotes[ noteIndex ];
			var baseOct = parseInt( ns.slice( -1 ), 10 );
			var newOct = beep8.Utilities.clamp( baseOct + baseOctave + octaveOffset, 3, 6 );
			var noteName = ns.slice( 0, -1 ).toUpperCase();
			var finalNote = noteName + newOct;
			var p1Note = noteToP1( finalNote );
			notes.push( p1Note );

		}

		notes.push( '|' );

		return compressNotes( notes );

	}


	/**
	 * Generates a drum note string for a given note length.
	 *
	 * @param {number} noteCount - The number of beats/positions.
	 * @returns {string} The compressed drum note string.
	 */
	function generateDrumNote( noteCount ) {

		// Pick an instrument and add the starting pipe.
		const notes = [ beep8.Random.pick( drumOptions ), '|' ];

		// Create a random pattern for drum hits.
		const pattern = createRandomPattern(
			noteCount,
			beep8.Random.int( 1, 3 ),
			beep8.Random.pick( [ 4, 8 ] ),
			3
		);

		// Fixed drum hit note (using "C4" converted to p1.js).
		var drumHit = noteToP1( "C4" );
		for ( var i = 0; i < noteCount; i++ ) {
			notes.push( pattern[ i ] ? drumHit : " " );
		}

		notes.push( '|' );

		return compressNotes( notes );

	}


	/**
	 * Generates multi-track music in p1.js format.
	 * It creates a chord progression and then generates various parts (melody, chord, or drum).
	 * Optionally prepends tempo and hold information to the first part.
	 *
	 * @param {Object} [options] - Options for music generation.
	 * @param {number} [options.seed] - Random seed.
	 * @param {number} [options.noteCount] - Number of beats/positions.
	 * @param {number} [options.channelCount] - Number of parts to generate.
	 * @param {number} [options.drumPartRatio] - Ratio of parts to be drums.
	 * @param {number|null} [options.tempo] - Tempo in BPM. If null, tempo info is omitted.
	 * @param {number|null} [options.hold] - Hold duration. If null, hold info is omitted.
	 * @returns {string} The generated multi-track music string.
	 */
	beep8.Music.generate = function( options ) {

		if ( options && options.seed ) {
			beep8.Random.setSeed( options.seed );
		}

		/**
		 * Default options for the music generator.
		 *
		 * @type {Object}
		 */
		const defaultOptions = {
			seed: beep8.Random.int( 10000, 99999 ),
			noteCount: beep8.Random.pick( [ 16, 32, 48, 64 ] ),
			channelCount: beep8.Random.int( 2, 5 ),
			drumPartRatio: 0.3,
			tempo: beep8.Random.pick( [ 70, 100, 140, 170, 200, 240, 280 ] ), // Default tempo (BPM).
			hold: beep8.Random.pick( [ 40, 50, 60, 60, 70, 70, 70, 80, 80, 80, 80, 90, 90, 90, 100, 110, 120, 130, 140, 150 ] )    // Default hold duration.
		};

		// Merge default options with provided options.
		const opts = Object.assign( {}, defaultOptions, options );

		beep8.Music.currentSongProperties = opts;

		beep8.Random.setSeed( opts.seed );
		var chordProgressionNotes = generateChordProgression( opts.noteCount );
		var parts = times(
			opts.channelCount,
			function() {
				var isDrum = beep8.Random.num() < opts.drumPartRatio;
				if ( isDrum ) {
					return generateDrumNote( opts.noteCount );
				} else {
					if ( beep8.Random.num() < 0.5 ) {
						return generateMelodyNote( opts.noteCount, chordProgressionNotes );
					} else {
						return generateChordNote( opts.noteCount, chordProgressionNotes );
					}
				}
			}
		);

		// Prepend tempo (and hold) information to the first part if provided.
		if ( opts.tempo !== null ) {
			var tempoStr = String( opts.tempo );
			if ( opts.hold !== null ) {
				tempoStr += "." + String( opts.hold );
			}
			parts[ 0 ] = tempoStr + "\n" + parts[ 0 ];
		}

		// Join all parts with a newline so p1.js can play multi-track music.
		return parts.join( "\n" );

	}


	// Store the currently playing song so it can be started again after pausing.
	let currentSong = null;


	/**
	 * Plays a p1.js music string.
	 *
	 * @param {string} song - The music string to play.
	 * @returns {void}
	 */
	beep8.Music.play = function( song ) {

		p1( song );

		if ( song ) {
			currentSong = song;
		}

	}


	/**
	 * Stops the current music playback.
	 * If `clearCurrentSong` is true, it will also clear the current song reference.
	 * This is disabled when the music is paused to allow resuming playback.
	 *
	 * @param {boolean} [clearCurrentSong=true] - Whether to clear the current song reference.
	 * @returns {void}
	 */
	beep8.Music.stop = function( clearCurrentSong = true ) {

		// Clear the currently stored song.
		beep8.Utilities.checkBoolean( "clearCurrentSong", clearCurrentSong );
		if ( clearCurrentSong ) currentSong = null;

		// Stop the music playback.
		beep8.Music.play( "" );

	}


	/**
	 * Pauses the current music playback.
	 *
	 * @returns {void}
	 */
	beep8.Music.pause = function() {

		if ( beep8.Music.isPlaying() ) {
			beep8.Music.stop( false );
		}

	}


	/**
	 * Resumes the current music playback.
	 *
	 * If a song is currently playing, it will continue from where it left off.
	 * If no song is playing, it will do nothing.
	 *
	 * @returns {void}
	 */
	beep8.Music.resume = function() {

		// If there is a current song and it is not playing, resume playback.
		if ( currentSong && !beep8.Music.isPlaying() ) {
			beep8.Music.play( currentSong );
		}

	}


	/**
	 * Sets the volume for the music playback.
	 *
	 * @param {number} volume - The volume level (0 to 1).
	 * @returns {void}
	 */
	beep8.Music.setVolume = function( volume ) {

		beep8.Utilities.checkNumber( "volume", volume );

		p1.setVolume( volume );

	}


	/**
	 * Set the tempo of a currently playing song.
	 *
	 * @param {number} tempo - The new tempo in BPM.
	 * @returns {void}
	 */
	beep8.Music.setTempo = function( tempo ) {

		beep8.Utilities.checkInt( "tempo", tempo );

		// Ensure tempo is within a valid range.
		if ( tempo < 50 ) {
			tempo = 50;
		}

		p1.setTempo( tempo );

	}


	/**
	 * Checks if music is currently playing.
	 *
	 * @returns {boolean} True if music is playing, otherwise false.
	 */
	beep8.Music.isPlaying = function() {

		return p1.isPlaying();

	}

	document.addEventListener( 'beep8.pageVisibility.wake', beep8.Music.resume );
	document.addEventListener( 'beep8.pageVisibility.sleep', beep8.Music.pause );

} )( beep8 );
( function( beep8 ) {

	let timeHidden = 0;
	let isHidden = false;


	/**
	 * Called when the document is hidden (blurred).
	 *
	 * @returns {void}
	 */
	function sleep() {

		if ( isHidden ) return;

		isHidden = true;

		// Document is hidden (blurred) so start the timer.
		timeHidden = Date.now();

		// Log the event and notify listeners.
		beep8.Utilities.event( 'pageVisibility.sleep' );

	};


	/**
	 * Called when the document is shown (focused).
	 *
	 * @returns {void}
	 */
	function wake() {

		if ( !isHidden ) return;
		isHidden = false;

		if ( timeHidden === 0 ) return;

		// Document is shown again so the timer is stopped and totalled.
		const timeAsleep = Date.now() - timeHidden;
		beep8.Utilities.log( 'Time asleep:', ( timeAsleep / 1000 ).toFixed( 3 ) );
		beep8.Utilities.event( 'pageVisibility.wake', { time: timeAsleep } );
		timeHidden = 0;

	}


	// Set an event when the document loses focus (change tab/ window).
	document.addEventListener(
		'visibilitychange',
		function() {

			if ( document.hidden ) {
				sleep();
			} else {
				wake();
			}

		}
	);

	window.addEventListener( 'blur', () => sleep() );
	window.addEventListener( 'focus', () => wake() );

} )( beep8 || ( beep8 = {} ) );
( function( beep8 ) {

	/**
	 * beep8.Particles handles particles.
	 */
	beep8.Particles = {};

	// Private particle array.
	let particles_ = [];


	/**
	 * Adds a new particle to the system.
	 *
	 * Each particle is an object with properties:
	 * - x, y: position,
	 * - vx, vy: velocity (pixels per second, default=0),
	 * - life: remaining life time (seconds, default=1),
	 * - size: square size (pixels, default=1),
	 * - color: fill color (a beep8 palette id, default=15).
	 * - gravity: gravity (pixels per second, default=0).
	 *
	 * @param {object} particle - The particle object to add.
	 * @returns {void}
	 */
	beep8.Particles.add = function( x, y, props ) {

		beep8.Utilities.checkNumber( 'x', x );
		beep8.Utilities.checkNumber( 'y', y );
		beep8.Utilities.checkObject( 'props', props );

		const defaults = {
			x: x,
			y: y,
			vx: 0,
			vy: 0,
			life: 1,
			size: 1,
			color: 15,
			gravity: 0,
		}

		const newParticle = Object.assign( {}, defaults, props );

		// Particle Color.
		if ( Array.isArray( newParticle.color ) ) {
			newParticle.color = beep8.Random.pick( newParticle.color );
		}

		// Particle Size.
		if ( Array.isArray( newParticle.size ) ) {
			newParticle.size = beep8.Random.pick( newParticle.size );
		}

		particles_.push( newParticle );

	};


	/**
	 * Adds an explosion of particles to the system.
	 *
	 * The explosion is created at the x, y position with a number of particles.
	 *
	 * The optional properties include:
	 * - size: The size of the particles (in pixels, default=1).
	 * - color: The color of the particles (a beep8 palette id, default=fgColor).
	 * - life: The life of the particles (in seconds, default=2).
	 * - speed: The speed of the particles (in pixels per second, default=25).
	 * - gravity: The gravity of the particles (in pixels per second, default=0).
	 *
	 * @param {number} x - The x position of the explosion.
	 * @param {number} y - The y position of the explosion.
	 * @param {number} count - The number of particles to add.
	 * @param {object} props - The properties of the explosion.
	 * @returns {void}
	 */
	beep8.Particles.createExplosion = function( x, y, count = 10, props = {} ) {

		beep8.Utilities.checkNumber( 'x', x );
		beep8.Utilities.checkNumber( 'y', y );
		beep8.Utilities.checkNumber( 'count', count );
		beep8.Utilities.checkObject( 'props', props );

		const defaults = {
			size: 1,
			color: beep8.Core.drawState.fgColor,
			life: 2,
			speed: 25,
			gravity: 0,
		};

		const newExplosion = Object.assign( {}, defaults, props );

		for ( let i = 0; i < count; i++ ) {

			const angle = beep8.Random.range( 0, Math.PI * 2 );
			const speed = beep8.Random.range( newExplosion.speed / 2, newExplosion.speed );

			beep8.Particles.add(
				x,
				y,
				{
					size: newExplosion.size,
					color: newExplosion.color,
					life: newExplosion.life,
					vx: Math.cos( angle ) * speed,
					vy: Math.sin( angle ) * speed,
					g: newExplosion.gravity,
				}
			);

		}

	};


	/**
	 * Updates all particles.
	 *
	 * If you are using Beep8 scenes or the Beep8 game loop (doframe) then this
	 * is called automatically and you don't need to call it manually.
	 *
	 * @param {number} dt - Delta time to update particle movement.
	 * @returns {void}
	 */
	beep8.Particles.update = function( dt ) {

		// Loop backwards to allow for removal.
		for ( let i = particles_.length - 1; i >= 0; i-- ) {

			const p = particles_[ i ];
			// Apply gravity.
			p.vy += ( p.g * dt );
			// Update position based on velocity.
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			// Decrease life.
			p.life -= dt;

			// Remove particle if life expired.
			if ( p.life <= 0 ) {
				particles_.splice( i, 1 );
			}

		}

	};


	/**
	 * Renders all particles as squares.
	 *
	 * This should be called in your render method. This is not called
	 * automatically which allows you to control the draw order.
	 *
	 * @returns {void}
	 */
	beep8.Particles.render = function() {

		for ( let i = 0; i < particles_.length; i++ ) {

			const p = particles_[ i ];
			const center = p.size / 2;

			// Draw the square particle with p.x, p.y at the center.
			beep8.Core.ctx.fillStyle = beep8.Core.getColorHex( p.color );
			beep8.Core.ctx.fillRect( Math.round( p.x - center ), Math.round( p.y - center ), Math.round( p.size ), Math.round( p.size ) );

		}

	};


	/**
	 * Clears all particles from the system.
	 *
	 * @returns {void}
	 */
	beep8.Particles.clearAll = function() {

		particles_ = [];

	};


	/**
	 * Returns the particles array.
	 *
	 * This is useful for debugging or if you want to manipulate the particles
	 * directly.
	 *
	 * @returns {array} The particles array.
	 */
	beep8.Particles.getParticles = function() {

		return [ ...particles_ ];

	};


	/**
	 * Sets the particles array.
	 *
	 * Can be used with Particles.getParticles to manipulate the particles directly.
	 *
	 * @param {array} particles - The particles array.
	 * @returns {void}
	 */
	beep8.Particles.setParticles = function( particles ) {

		beep8.Utilities.checkArray( 'particles', particles );

		particles_ = particles;

	};

} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	beep8.Passcodes = {};


	/**
	 * The length of the level passcodes.
	 *
	 * @type {number}
	 */
	beep8.Passcodes.codeLength = 4;


	/**
	 * Function to generate a passcode for a given id.
	 * This is intended for level passcodes.
	 *
	 * @param {string} id - The id to generate a code for.
	 * @returns {string} The generated code.
	 */
	beep8.Passcodes.getCode = function( id ) {

		beep8.Utilities.checkIsSet( "id", id );

		// Combine the id and secret key for uniqueness.
		const combined = id + beep8.CONFIG.PASSKEY;

		// Generate hash of the combined string.
		let hash = hashString( combined );

		// Remove non-alphabetic characters and convert to uppercase.
		hash = hash.replace( /[^a-zA-Z]/g, '' );
		hash = hash.toUpperCase(); // Convert to uppercase

		// Return the first 'codeLength' characters.
		return hash.substring( 0, beep8.Passcodes.codeLength );

	}


	/**
	 * Function to check if a given code is valid for a given id.
	 *
	 * @param {string} id - The id to check the code for.
	 * @param {string} code - The code to check.
	 * @returns {boolean} True if the code is valid, false otherwise.
	 */
	beep8.Passcodes.checkCode = function( id, code ) {

		beep8.Utilities.checkIsSet( "id", id );
		beep8.Utilities.checkString( "code", code );

		const generatedCode = beep8.Passcodes.getCode( id );
		return generatedCode === code;

	}


	/**
	 * Function to work out the id from the code.
	 *
	 * @param {string} code - The code to get the id for.
	 * @returns {int} The id for the code.
	 */
	beep8.Passcodes.getId = function( code ) {

		beep8.Utilities.checkString( "code", code );

		// Loop through all levels to find a match.
		code = code.toUpperCase();
		for ( c = 1; c < 999; c++ ) {
			if ( beep8.Passcodes.checkCode( c, code ) ) {
				return c;
			}
		}

		// Return null if no match is found.
		return null;

	}


	/**
	 * Display a dialog to accept a passcode. This is automatically centered on
	 * the screen.
	 *
	 * The level id of the specified passcode is returned as an integer.
	 *
	 * This can be coloured with the standard beep8.color function.
	 *
	 * @returns {number|null} The level id of the passcode.
	 */
	beep8.Passcodes.input = async function() {

		const message = 'Enter code:';
		const width = message.length + 2 + 2;
		const height = 6;

		let xPosition = Math.round( ( beep8.CONFIG.SCREEN_COLS - width ) / 2 );
		let yPosition = Math.round( ( beep8.CONFIG.SCREEN_ROWS - height ) / 2 );

		beep8.Core.setCursorLocation( xPosition, yPosition );
		beep8.TextRenderer.printBox( width, height );

		beep8.Core.setCursorLocation( xPosition + 2, yPosition + 2 );
		beep8.TextRenderer.print( message + "\n>" );

		const passcode = await beep8.Async.readLine( "", beep8.Passcodes.codeLength );
		const value = beep8.Passcodes.getId( passcode );

		return value;

	}


	/**
	 * Function to hash a string.
	 *
	 * @param {string} input - The string to hash.
	 * @returns {string} The hashed string.
	 */
	function hashString( input ) {

		input = btoa( input );
		let hash = 0;
		let result = '';

		// Loop to hash the input string.
		for ( let i = 0; i < input.length; i++ ) {
			hash = ( hash << 5 ) - hash + input.charCodeAt( i );
			hash = hash & hash; // Convert to 32bit integer
		}

		// Loop to extend the length of the result by rehashing.
		// Adjust to control string length.
		for ( let j = 0; j < 5; j++ ) {
			hash = ( hash << 5 ) - hash + beep8.CONFIG.PASSKEY.charCodeAt( j % beep8.CONFIG.PASSKEY.length );
			// Append base-36 to the result.
			result += Math.abs( hash ).toString( 36 );
		}

		return result;

	}


} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	beep8.Random = {};

	/**
	 * The seed for the random number generator.
	 *
	 * @type {number}
	 */
	let randomSeed = null;


	/**
	 * Sets the seed for the random number generator.
	 * If the seed is null, the random number generator will reset to use the current time.
	 *
	 * @param {number|string} seed - The seed to use for the random number generator.
	 * @returns {void}
	 */
	beep8.Random.setSeed = function( seed = null ) {

		if ( seed === null ) {
			seed = Date.now();
		}

		// Convert seed string to number.
		if ( typeof seed === "string" ) {
			seed = seed.split( "" ).reduce( ( a, b ) => a + b.charCodeAt( 0 ), 0 );
		}

		// Extra mixing step using xorshift.
		seed ^= seed << 13;
		seed ^= seed >> 17;
		seed ^= seed << 5;
		seed >>>= 0; // Ensure an unsigned 32-bit integer

		// Set the global seed value.
		randomSeed = seed;

		// Burn a few random numbers to mix up initial values.
		for ( let i = 0; i < 10; i++ ) {
			beep8.Random.num();
		}

	}


	/**
	 * Returns the seed for the random number generator.
	 *
	 * @returns {number} The seed for the random number generator.
	 */
	beep8.Random.getSeed = function() {

		return randomSeed;

	}


	/**
	 * Returns a random number between 0 and 1.
	 *
	 * @returns {number} A random number between 0 and 1.
	 */
	beep8.Random.num = function() {

		const a = 1664525;
		const c = 1013904223;
		const m = 4294967296;

		randomSeed = ( randomSeed * a + c ) % m;

		return randomSeed / m;

	}


	/**
	 * Returns a random number (float) in the given closed interval.
	 *
	 * @param {number} min - The minimum value (inclusive).
	 * @param {number} max - The maximum value (inclusive).
	 * @returns {number} A random number between min and max.
	 */
	beep8.Random.range = function( min, max ) {

		beep8.Utilities.checkNumber( "min", min );
		beep8.Utilities.checkNumber( "max", max );

		return min + beep8.Random.num() * ( max - min );

	}


	/**
	 * Returns a random integer in the given closed interval.
	 *
	 * @param {number} min - The minimum value (inclusive).
	 * @param {number} max - The maximum value (inclusive).
	 * @returns {number} A random integer between min and max.
	 */
	beep8.Random.int = function( min, max ) {

		beep8.Utilities.checkInt( "min", min );
		beep8.Utilities.checkInt( "max", max );

		// Reverse max and min.
		if ( max <= min ) {
			const tmp = max;
			max = min;
			min = tmp;
		}

		const randomValue = beep8.Random.range( min, max );
		return Math.round( randomValue );

	}


	/**
	 * Returns a randomly picked element of the given array.
	 *
	 * @param {Array} array - The array to pick from.
	 * @returns {any} A randomly picked element of the array, or null if the array is empty.
	 */
	beep8.Random.pick = function( array ) {

		beep8.Utilities.checkArray( "array", array );

		// Pick a random number from 0 to array.length.
		const index = beep8.Random.int( 0, array.length - 1 );

		return array[ index ];

	}


	/**
	 * Returns a randomly picked element of the given array, with a weighted probability.
	 *
	 * @param {Array} array - The array to pick from, with each element repeated a number of times.
	 * @param {number} decayFactor - The decay factor for the weighted array.
	 * @returns {any} A randomly picked element of the array, or null if the array is empty.
	 */
	beep8.Random.pickWeighted = function( array, decayFactor = 0.2 ) {

		beep8.Utilities.checkArray( "array", array );

		const weightedArray = beep8.Random.weightedArray( array, decayFactor );

		return beep8.Random.pick( weightedArray );

	}


	/**
	 * Shuffles an array, randomly reordering the elements.
	 * Does not modify the original array. Returns the shuffled array.
	 *
	 * @param {Array} array - The array to shuffle.
	 * @returns {Array} The shuffled array.
	 */
	beep8.Random.shuffleArray = function( array ) {

		beep8.Utilities.checkArray( "array", array );

		array = array.slice();

		for ( let i = 0; i < array.length; i++ ) {
			const j = beep8.Random.int( 0, array.length - 1 );
			const tmp = array[ i ];
			array[ i ] = array[ j ];
			array[ j ] = tmp;
		}

		return array;

	}


	/**
	 * Returns a random boolean value based upon the probability percentage provided.
	 *
	 * @param {number} probability - A percentage value between 0 and 100 representing the chance of returning true.
	 * @returns {boolean} True with the specified probability, false otherwise.
	 */
	beep8.Random.chance = function( probability ) {

		beep8.Utilities.checkNumber( "probability", probability );

		return beep8.Random.num() < ( probability / 100 );

	}


	/**
	 * Returns a weighted array of elements.
	 * The array uses a decay factor to determine the number of times each element should be repeated.
	 *
	 * @param {Array} array - The array to weight.
	 * @param {number} decayFactor - The decay factor for the weighted array.
	 * @returns {Array} The weighted array.
	 */
	beep8.Random.weightedArray = function( array, decayFactor = 0.2 ) {

		beep8.Utilities.checkArray( "array", array );

		const weightedArray = [];

		for ( let i = 0; i < array.length; i++ ) {
			const count = Math.pow( decayFactor, i ) * 10;
			for ( let j = 0; j < count; j++ ) {
				weightedArray.push( array[ i ] );
			}
		}

		return weightedArray;

	}


	beep8.Random.setSeed();

} )( beep8 || ( beep8 = {} ) );


( function( beep8 ) {

	// Define the Renderer object inside beep8.
	beep8.Renderer = {};

	// Has the screen updated.
	let dirty = false;

	// Constants and variables used for phosphor and scanline effects.
	const phosphor_bloom = []; // Array to store bloom effect values.
	const scale_add = 1; // Additive scaling for bloom.
	const scale_times = 0.4; // Multiplicative scaling for bloom.
	let canvasImageData = null; // Stores image data for the canvas.

	// Effects.
	let screenshakeDuration = 0;


	/**
	 * Initialization function that precomputes bloom and scanline ranges.
	 *
	 * @returns {void}
	 */
	const initCrt = () => {

		/**
		 * Precompute phosphor bloom values to simulate the effect of phosphor
		 * persistence on older CRT screens.
		 * CRT displays have a characteristic glow, often caused by the
		 * persistence of phosphor pixels.
		 * Here, we calculate bloom values for each possible brightness level
		 * (0-255) to simulate this effect:
		 *  - The formula applies gamma correction with a value of 2.2 to mimic
		 * non-linear brightness response.
		 *  - A scaling factor of 0.5 reduces the brightness, and adding 1
		 * ensures a minimum glow intensity.
		 * These precomputed values are used later when blending pixels,
		 * creating a glow effect similar to retro CRT displays.
		 */
		for ( let i = 0; i < 256; i++ ) {
			phosphor_bloom[ i ] = ( scale_times * ( i / 255 ) ** ( 1 / 2.2 ) ) + scale_add;
		}

	}


	/**
	 * Renders the screen.
	 *
	 * @returns {void}
	 */
	beep8.Renderer.render = function() {

		if ( beep8.Core.crashed ) return;

		beep8.Core.realCtx.imageSmoothingEnabled = false;

		// Canvas Drawing location.
		let x = 0;
		let y = 0;

		// Do screenshake.
		if ( screenshakeDuration > 0 ) {

			let amount = screenshakeDuration * beep8.CONFIG.CHR_WIDTH;

			x = Math.round( ( Math.random() * amount ) - ( amount / 2 ) );
			y = Math.round( ( Math.random() * amount ) - ( amount / 2 ) );

			x = beep8.Utilities.clamp( x, -6, 6 );
			y = beep8.Utilities.clamp( y, -6, 6 );

			screenshakeDuration -= beep8.Core.deltaTime;

		}

		beep8.Core.realCtx.clearRect(
			0, 0,
			beep8.Core.realCanvas.width, beep8.Core.realCanvas.height
		);

		beep8.Core.realCtx.drawImage(
			beep8.Core.canvas,
			x, y,
			beep8.Core.realCanvas.width, beep8.Core.realCanvas.height
		);

		dirty = false;

		beep8.CursorRenderer.draw( beep8.Core.realCtx );

		beep8.Renderer.applyCrtFilter();

	}


	/**
	 * Triggers the screenshake effect.
	 *
	 * @param {number} duration - The duration of the screenshake effect in seconds.
	 * @returns {boolean} Returns true if the screenshake effect was successfully triggered.
	 */
	beep8.Renderer.shakeScreen = function( duration ) {

		beep8.Utilities.checkNumber( "duration", duration );

		if ( duration <= 0 ) {
			beep8.Utilities.warn( "Screenshake duration must be positive. Currently: " + duration );
			return false;
		}

		screenshakeDuration = duration;

		return true;

	}


	/**
	 * Marks the screen as dirty, so it will be re-rendered on the next frame.
	 *
	 * @returns {void}
	 */
	beep8.Renderer.markDirty = function() {

		if ( dirty ) {
			return;
		}

		dirty = true;
		setTimeout( beep8.Renderer.render, 1 );

	}


	/**
	 * Main function to apply CRT filter to the screen.
	 *
	 * @returns {void}
	 */
	beep8.Renderer.applyCrtFilter = function() {

		// If the CRT effect is disabled, return.
		if (
			beep8.CONFIG.CRT_ENABLE <= 0
			|| !beep8.CONFIG.CRT_VIGNETTE
		) {
			return;
		}

		// Get the pixel data from the canvas.
		canvasImageData = beep8.Core.realCtx.getImageData(
			0, 0,
			beep8.CONFIG.SCREEN_WIDTH, beep8.CONFIG.SCREEN_HEIGHT
		);

		// Cache the data array for faster access.
		const imageData = canvasImageData.data;

		drawVignette( imageData );
		drawScanlines( imageData );

		// Write the modified image data back to the canvas.
		beep8.Core.realCtx.putImageData( canvasImageData, 0, 0 );

	};


	/**
	 * Function to draw a vignette effect on the screen.
	 *
	 * @param {Uint8ClampedArray} imageData - The image data array.
	 * @returns {void}
	 */
	const drawVignette = ( imageData ) => {

		// Vignette constants.
		// ---
		if ( !beep8.CONFIG.CRT_VIGNETTE ) {
			return imageData;
		}

		// Get the screen width and height.
		const width = beep8.CONFIG.SCREEN_WIDTH;
		const height = beep8.CONFIG.SCREEN_HEIGHT;

		// The center of the vignette effect is a circle with a radius of 0.5 of the screen.
		const centerRadius = 0.8;
		// The maximum darkness of the vignette effect.
		const maxDarkness = 0.25;
		// Calculate the center of the screen and the maximum distance from the center.
		const centerX = width / 2, centerY = height / 2;
		// Calculate the inner radius of the vignette effect and the scaling factor.
		const maxDistance = Math.sqrt( centerX ** 2 + centerY ** 2 );
		// The inner radius is a fraction of the center radius.
		const innerRadius = centerRadius * maxDistance;
		// Calculate the scaling factor based on the maximum darkness and distance.
		const scaleFactor = maxDarkness / ( maxDistance * ( 1 - centerRadius ) );

		// Apply vignette effect pixel by pixel
		for ( let i = 0; i < imageData.length; i += 4 ) {
			const x = ( i / 4 ) % width;
			const y = Math.floor( ( i / 4 ) / width );
			const distance = Math.sqrt( ( x - centerX ) ** 2 + ( y - centerY ) ** 2 );

			// Calculate the vignette factor based on the distance from the center.
			const vignetteFactor = distance < innerRadius
				? 1
				: Math.max( 0, 1 - ( distance - innerRadius ) * scaleFactor );

			// Apply the vignette factor to the RGB channels
			imageData[ i ] *= vignetteFactor;     // Red
			imageData[ i + 1 ] *= vignetteFactor; // Green
			imageData[ i + 2 ] *= vignetteFactor; // Blue
		}

	};


	/**
	 * Function to draw scanlines and color distortion on the screen.
	 *
	 * @param {Uint8ClampedArray} imageData - The image data array.
	 * @returns {void}
	 */
	const drawScanlines = ( imageData ) => {

		// Get the screen width and height.
		const width = beep8.CONFIG.SCREEN_WIDTH;
		const height = beep8.CONFIG.SCREEN_HEIGHT;

		// Loop through every other line.
		for ( let y = 0; y < height; y += 2 ) {

			// Loop through each pixel on the current row.
			for ( let x = 0; x < width; x++ ) {

				// Get the position of the current pixel in the image data array.
				const currentPixelPos = getPixelPosition( x, y );
				// Get the current pixel's RGB data.
				const current_pixel_data = getPixelData( imageData, currentPixelPos );
				// Get the previous pixel data to the left (or use the current pixel if on the first column).
				const previous_pixel_data = ( x > 0 ) ? getPixelData( imageData, getPixelPosition( x - 1, y ) ) : current_pixel_data;
				const next_pixel_data = x < width - 1 ? getPixelData( imageData, getPixelPosition( x + 1, y ) ) : current_pixel_data;

				// Set the new pixel values back into the image data array.
				setPixel(
					imageData,
					currentPixelPos,
					blendPixels( current_pixel_data, previous_pixel_data, next_pixel_data )
				);

			}
		}

	};



	/**
	 * Helper function to blend a pixel's current value with the previous pixel's value.
	 * This function implements the phosphor effect.
	 *
	 * @param {number} currentValue - The current pixel value.
	 * @param {number} previousValue - The previous pixel value.
	 * @returns {object} The blended pixel value as an rgb object.
	 */
	const blendPixels = ( currentPixel, previousPixel, nextPixel ) => {

		// Bleed factor for neighboring pixel blending.
		const phosphor_bleed = beep8.CONFIG.CRT_ENABLE;
		// Remaining factor for current pixel blending.
		const phosphor_blend = ( 1 - phosphor_bleed );

		return {
			r: ( currentPixel[ 0 ] * phosphor_blend ) + ( ( previousPixel[ 0 ] + nextPixel[ 0 ] ) / 2 * phosphor_bleed * phosphor_bloom[ previousPixel[ 0 ] ] ),
			g: ( currentPixel[ 1 ] * phosphor_blend ) + ( ( previousPixel[ 1 ] + nextPixel[ 1 ] ) / 2 * phosphor_bleed * phosphor_bloom[ previousPixel[ 1 ] ] ),
			b: ( currentPixel[ 2 ] * phosphor_blend ) + ( ( previousPixel[ 2 ] + nextPixel[ 2 ] ) / 2 * phosphor_bleed * phosphor_bloom[ previousPixel[ 2 ] ] ),
		}

	};


	/**
	 * Helper function to get RGB data for a pixel at position (x, y) in the image data array.
	 *
	 * @param {Uint8ClampedArray} imageData - The image data array.
	 * @param {number} pixelPos - The position of the pixel in the image data array.
	 * @returns {number[]} An array of red, green, and blue values for the pixel.
	 */
	const getPixelData = ( imageData, pixelPos ) => {

		return [
			imageData[ pixelPos + 1 ], // Red
			imageData[ pixelPos + 2 ], // Green
			imageData[ pixelPos + 3 ]  // Blue
		];

	};


	/**
	 * Helper function to set RGB data for a pixel at position (x, y) in the image data array.
	 * This function modifies the image data array in place.
	 *
	 * @param {Uint8ClampedArray} imageData - The image data array.
	 * @param {number} pixelPos - The position of the pixel in the image data array.
	 * @param {object} color - An object containing red, green, and blue values for the pixel
	 * @returns {void}
	 */
	const setPixel = ( imageData, pixelPos, color ) => {

		imageData[ pixelPos + 1 ] = color.r;
		imageData[ pixelPos + 2 ] = color.g;
		imageData[ pixelPos + 3 ] = color.b;

	};


	/**
	 * Helper function to get the pixel position (index) in the image data array for coordinates (x, y).
	 *
	 * @param {number} x - The x-coordinate of the pixel.
	 * @param {number} y - The y-coordinate of the pixel.
	 * @returns {number} The index of the pixel in the image data array.
	 */
	const getPixelPosition = ( x, y ) => {

		// Each pixel is represented by 4 bytes (RGBA), so calculate the index for the pixel at (x, y).
		return ( y * beep8.CONFIG.SCREEN_WIDTH * 4 ) + ( x * 4 );

	};


	// Call init to precompute phosphor bloom.
	initCrt();


} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	/**
	 * Stores all scenes by name.
	 *
	 * @type {Object}
	 */
	beep8.Scene = {};


	/**
	 * Holds the current active scene object.
	 *
	 * @type {Object|null}
	 */
	let activeScene = null;

	const sceneList = {};


	/**
	 * Adds a new scene to the scene manager.
	 *
	 * A scene should be a javascript object with at least one of the following functions:
	 *
	 * - init (optional): A function that will be called when the scene is set.
	 * - update (optional): A function that will be called multiple times a frame and passed a deltatime value as a parameter.
	 * - render (optional): A function that will be called every frame.
	 *
	 * Init can be used to set up the scene. For asynchronous games you can add a while loop here and use await functions (eg for keypresses) and then render yourself.
	 * For synchronous games you can use the update and render functions to manage game logic and rendering efficiently.
	 *
	 * eg:
	 * const game = {
	 *  init: () => { }
	 *  update: ( dt ) => { }
	 *  render: () => { }
	 * }
	 *
	 * @param {string} name - The name of the scene.
	 * @param {object} gameObject - An object that includes init, update, and
	 * render methods as well as other properties for the scene. If update and
	 * render are set then these will be passed to `beep8.frame`.
	 * @param {number} frameRate - The frame rate at which to update and render
	 */
	beep8.Scene.add = function( name, gameObject = null, frameRate = 30 ) {

		beep8.Utilities.checkString( 'name', name );

		if ( gameObject !== null ) {
			beep8.Utilities.checkObject( 'gameObject', gameObject );
		}

		beep8.Utilities.checkInt( 'frameRate', frameRate );

		const init = gameObject.init || null;
		const update = gameObject.update || null;
		const render = gameObject.render || null;

		sceneList[ name ] = { init, update, render, frameRate };

	};


	/**
	 * Switches to a specified scene by name.
	 *
	 * @param {string} name - The name of the scene to switch to.
	 */
	beep8.Scene.set = function( name ) {

		beep8.Utilities.checkString( 'name', name );

		if ( !sceneList[ name ] ) {
			beep8.Utilities.fatal( `Scene "${name}" does not exist.` );
		}

		// Stop the current game loop.
		beep8.Core.stopFrame();

		// Store the active scene.
		activeScene = name;

		// Clear any inputs.
		if ( beep8.Input && typeof beep8.Input.onEndFrame === 'function' ) {
			beep8.Input.onEndFrame();
		}

		// Get the scene object.
		const currentScene = sceneList[ name ];

		// If there's an init method, call it.
		if ( currentScene.init ) {
			currentScene.init();
		}

		// If there's an update or render method, call frame to create a synchronous game.
		if ( currentScene.update || currentScene.render ) {
			beep8.frame( currentScene.render, currentScene.update, currentScene.frameRate );
		}

	};


	/**
	 * Pauses the current scene.
	 *
	 * @param {string} name - The name of the scene to pause.
	 * @returns {void}
	 */
	beep8.Scene.pause = function() {

		beep8.frame( null );

	};


	/**
	 * Resumes the current scene.
	 *
	 * @returns {void}
	 */
	beep8.Scene.resume = function() {

		// If there's no active scene, do nothing.
		if ( !activeScene ) {
			return;
		}

		// Get the currentScene.
		const currentScene = sceneList[ activeScene ];

		// If there's an update or render method, call frame to create a synchronous game.
		if ( currentScene.update || currentScene.render ) {
			beep8.frame(
				currentScene.render || ( () => { } ),
				currentScene.update || ( () => { } ),
				currentScene.frameRate || 30
			);
		}

	};


	/**
	 * Gets the current active scene.
	 *
	 * @returns {Object|null} The active scene object, or null if no scene is active.
	 */
	beep8.Scene.get = function() {

		return activeScene;

	};


	/**
	 * Gets all scenes.
	 *
	 * @returns {Object} All scenes.
	 */
	beep8.Scene.getAll = function() {

		return sceneList;

	};

} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	beep8.Sfx = {};


	/**
	 * Sound effect library.
	 *
	 * @see https://killedbyapixel.github.io/ZzFX/
	 * @see https://codepen.io/KilledByAPixel/pen/BaowKzv?editors=1000
	 * @type {Object}
	 */
	beep8.Sfx.library = {

		'fx/action/drag': [ , 0, 293.6648, .1, , , 4, 6, 32, , , , , 1, 1.4, .1, , .7, .1 ],

		'fx/break/001': [ 2.1, , 339, .02, .07, .09, 4, .2, -7, , , , .05, 1, , .1, .16, .45, .02, .03 ],
		'fx/break/002': [ 1.5, , 157, .16, , 0, , .35, -24, 28, , , , .1, , .6, , .19, .01 ],
		'fx/break/003': [ 2, , 180, 0.05, 0.03, 0.04, , 2.42, 0.6, , , , , , , , 0.15, 0.39, 0.04 ],

		'fx/fight/dodge': [ 1.2, .3, 150, .05, , .05, , , -1, , , , , 4, , , , , .02 ],
		'fx/fight/hit': [ 5, , 185, , , , 3, 1.6, -7, , , , , , , .2, .19, .1, , .38, 985 ],

		'fx/robot/001': [ 1.13, , 172, .04, .18, .09, , .06, - 38, -2.6, -99, , , , 35, , .08 ],
		'fx/robot/002': [ 1.42, , 61, .01, .02, 0, 1, .21, , , 816, .01, .05, , -40, , .05, .71, .11 ],
		'fx/robot/003': [ .9, , 164, .04, .03, .14, , .8, 46, 66, , , , , , , , .71, .08, , 217 ],
		'fx/robot/004': [ , .02, 1638, , .05, .17, 1, , , , 490, .09, , , , .1, .05, .5, .03 ],

		'fx/sci-fi/radioactive': [ 1, 0, 130, .02, .9, .39, 2, .8, , , , , .13, .2, , .1, , .93, .06, .28 ],
		'fx/sci-fi/robot': [ 1, 0, 847, .02, .3, .9, 1, 1.67, , , -294, .04, .13, , , , .1 ],
		'fx/sci-fi/teleport': [ 1, , 85, .08, .1, .01, 1, 4, , -11, 1, .07, , .1, 101, , .05, .68, .4, .12, 1 ],
		'fx/sci-fi/warp': [ 3, 0, 713, .16, .09, .24, , .6, -29, -16, , , .09, .5, , , .23, .75, .15, .48 ],
		'fx/sci-fi/beam': [ 1, 0, 662, .82, .11, .33, 1, 0, , -0.2, , , , 1.2, , .26, .01 ],
		'fx/sci-fi/hover': [ 2, 0, 262.63, 0.1, 0.12, 0.3, 0, 2.4, -0.1, 0, 0, 0, 0.24, 0, 0, 0.1, 0.05, 0.98, 0.07, 0.17, 0 ],

		'fx/thud/001': [ 1.5, , 90, , .01, .03, 4, , , , , , , 9, 50, .2, , .2, .01 ],
		'fx/thud/002': [ 1, , 129, .01, , .15, , , , , , , , 5 ],

		'fx/machine/buzz': [ 1, 0, 130.8128, .1, .1, .34, 3, 1.88, , , , , , , , .1, , .5, .04 ],
		'fx/machine/hum': [ 1, 0, 63, , 1, , 1, 1.5, , , , , , , , 3.69, .08 ],
		'fx/machine/humm': [ 1, , 110, .03, .25, .15, 2, 1.32, , , , , .07, , -0.1, , .11, .77 ],
		'fx/machine/warp': [ 2, , 128, , .12, .26, , 4.7, , -1, -62, .06, .07, , 52, , , .66, .08 ],

		'fx/noise/001': [ 1.27, , 390, 0.01, 0.04, 0.02, 4, 0.71, 4.8, , , , , , , , 0.01, 0.6, 0.06 ],
		'fx/noise/002': [ 0.4, , 60, , 0.01, 0, 4, 0.55, 62, 89, -88, 0.06, , , 173, 0.6, , , 0.05 ],
		'fx/noise/003': [ 0.2, , 523.2511, .1, 3, 3, 4, 0, , , 2250, , .04, , 10, .01, , .82, 1, , 30 ],

		'fx/random/tone': [ 2, .8, 999, , , , 1, 2, , , , , 1, , , .1, .2 ],

		'fx/swoosh/001': [ 1, , 1500, 0.02, , 0.02, 4, 0.68, 5, , , , 0.01, 0.7, 136, , , , , 0.11 ],
		'fx/swoosh/002': [ 1.2, , 585, , .02, .16, 4, .25, , , , , , , , , , .55, .03 ],
		'fx/swoosh/003': [ .2, , 836, .11, , 0, 4, .91, 13, , , , .09, .1, -39, , , .06, .07 ],
		'fx/swoosh/004': [ 1.2, , 9220, .01, , , , 5, , , , , , 9 ],
		'fx/swoosh/005': [ 1.5, 0, 150, .05, , .05, , 1.3, , , , , , 3 ],
		'fx/swoosh/006': [ 2, , 12, , , 0.008, , 1.2, 23, -7, , , 0.05, 0.4, , , 0.15, 0.82, 0.03, 0.28, ],

		'fx/vehicle/engine': [ 1.2, 0, 25, .05, .3, .5, 3, 9, -0.01, , , , , , 13, .1, .2 ],
		'fx/vehicle/carhorn': [ 1.8, 0, 250, .02, .02, .2, 2, 2, , , , , .02, , , .02, .01, , , .1 ],
		'fx/vehicle/horn': [ 2, , 688, .02, .01, .007, 1, 2.6, , , , , .01, , 85, , .01, .85, .03, .11, -818 ],
		'fx/vehicle/truckhorn': [ 1.5, , 1376, .02, .01, .007, 1, 2.6, , , , , .01, , 85, , .01, .85, .8, .11, -818 ],
		'fx/vehicle/siren': [ 1.3, 0, 960, , 1, .01, , .8, -0.01, , -190, .5, , .05, , , 1 ],
		'fx/vehicle/submarine': [ 1.2, 0, 1975, .08, .56, .02, , , -0.4, , -322, .56, .41, , , , .25 ],
		'fx/vehicle/rocket': [ 1.5, 0, 941, .8, , .8, 4, .74, -222, , , , , .8, , 1 ],

		'game/coin/001': [ 1.2, 0, 1675, , .06, .24, 1, 1.82, , , 837, .06 ],
		'game/coin/002': [ 1.2, 0, 523.2511, .01, .06, .3, 1, 1.82, , , 837, .06 ],
		'game/coin/003': [ 0.6, 0, 1874, , 0.01, 0.25, 2, 0.76, , , 622, 0.1 ],
		'game/coin/004': [ 1, 0, 277, .03, .04, .06, 1, 1.8, 1, , 140, .06, .04, , , .1, , .99, .03 ],

		'game/collect/001': [ 1.1, 0, 450, , .01, .13, , 2.7, , -9.5, 500, .08, , , , , , .89 ],
		'game/collect/002': [ 1.05, , 10, .08, .07, .24, 2, 1.03, , , -374, .04, .09, , , , , .72, .15, .18 ],

		'game/die/001': [ 1.5, 0, 537, .02, .02, .22, 1, 1.59, -6.98, 4.97 ],
		'game/die/002': [ 1, , 321, .01, .06, .06, 1, 3.8, , -49, , , , .3, , , , .79, .09 ],
		'game/die/003': [ 1, 0, 344, .01, .02, .28, 1, 1.4, , , 50, , , , .3, .2, .15, .6, .06 ],
		'game/die/004': [ 0.5, 0, 43, 0.01, , 1, 2, , , , , , , , , 0.02, 0.01 ],

		'game/jump/001': [ 1, .1, 75, .03, .08, .17, 1, 1.88, 7.83, , , , , .4 ],
		'game/jump/002': [ 1.2, , 311, .03, .05, .05, , 2.2, , 9, , , .02, , 2.7, , , .97, .05, , 101 ],
		'game/jump/003': [ 1.5, , 65, .04, .1, .13, 1, 1.5, , -31, , , , .3, , , , .99, .03 ],
		'game/jump/004': [ , 0, 500, , .01, .13, , .2, 1.7, , -400 ],
		'game/jump/005': [ 1, , 341, , .14, .23, 1, 1.01, .9, , -132, .03, , .1, , .1, , .52, .22 ],
		'game/jump/006': [ 0.7, , 1496, .09, .09, .01, 3, .14, , , -870, , , , 3.2, .2, , .31, .02 ],

		'game/powerup/001': [ , , 188, .03, .09, .12, 1, 2.4, , 95, , , , , , , , .63, .08 ],
		'game/powerup/002': [ 0.8, 0, 413, .03, .05, .05, , 1.8, , 19, 177, .05, , , , , , .83, .02 ],
		'game/powerup/003': [ 0.5, , 643, , 0.1, 0.12, 1, 0.1, , 99, , , , , , , , 0.6, 0.02, , -732 ],
		'game/powerup/004': [ 1.18, , 143, .05, .08, .06, , .09, 25, 4.1, , , , , , , .01, .52, .09 ],
		'game/powerup/005': [ 1, , 18, 0.01, 0.01, 0.21, 1, 0.49, 9.9, , , , , , , , 0.04, 0.95, 0.02 ],
		'game/powerup/006': [ 0.5, , 426, .01, , .05, , 2.54, 49, , 9, .1, , , , , , .46, .15 ],
		'game/powerup/007': [ 1, , 158, .09, .18, .03, , 2.53, 11, -58, 63, .02, .01, .5, , , , .16 ],
		'game/powerup/008': [ 1.2, 0, 539, 0, .04, .29, 1, 1.92, , , 567, .02, .02, , , , .04 ],

		'instrument/bass/001': [ 2, 0, 65, .01, .08, .2, , 2.6, , , , , , .1, , , , .61, .02, , -1686 ],
		'instrument/bass/002': [ 2, 0, 73, .01, .08, .2, , 2.6, , , , , , .1, , , , .61, .02, , -1686 ],
		'instrument/bass/003': [ 2, 0, 82, .01, .08, .2, , 2.6, , , , , , .1, , , , .61, .02, , -1686 ],
		'instrument/bass/004': [ 2, 0, 87, .01, .08, .2, , 2.6, , , , , , .1, , , , .61, .02, , -1686 ],
		'instrument/bass/005': [ 2, 0, 97, .01, .08, .2, , 2.6, , , , , , .1, , , , .61, .02, , -1686 ],
		'instrument/bass/006': [ 2, 0, 110, .01, .08, .2, , 2.6, , , , , , .1, , , , .61, .02, , -1686 ],
		'instrument/bass/007': [ 2, 0, 123, .01, .08, .2, , 2.6, , , , , , .1, , , , .61, .02, , -1686 ],
		'instrument/bass/008': [ 2, 0, 130, .01, .08, .2, , 2.6, , , , , , .1, , , , .61, .02, , -1686 ],

		'instrument/drum/001': [ 1.5, 0, 86, , , , , 0.7, , , , 0.5, , 6.7, 1, 0.05 ],
		'instrument/drum/002': [ 0.7, 0, 270, , , 0.12, 3, 1.65, -2, , , , , 4.5, , 0.02 ],

		'tone/beep/001': [ 2, 0, 130, , .1, , 1, 1.5, , , , , , , , .1, .01 ],
		'tone/beep/002': [ 2, 0, 146, , .1, , 1, 1.5, , , , , , , , .1, .01 ],
		'tone/beep/003': [ 2, 0, 164, , .1, , 1, 1.5, , , , , , , , .1, .01 ],
		'tone/beep/004': [ 2, 0, 174, , .1, , 1, 1.5, , , , , , , , .1, .01 ],
		'tone/beep/005': [ 2, 0, 195, , .1, , 1, 1.5, , , , , , , , .1, .01 ],
		'tone/beep/006': [ 2, 0, 220, , .1, , 1, 1.5, , , , , , , , .1, .01 ],
		'tone/beep/007': [ 2, 0, 246, , .1, , 1, 1.5, , , , , , , , .1, .01 ],
		'tone/beep/008': [ 2, 0, 261, , .1, , 1, 1.5, , , , , , , , .1, .01 ],

		'tone/bell/001': [ 2, 0, 999, , , , , 1.5, , .3, -99, .1, 1.63, , , .11, .22 ],
		'tone/bell/002': [ , 0, 1600, .13, .52, .61, 1, 1.1, , , , , , .1, , .14 ],
		'tone/bell/random': [ 2, .1, 999, , , , , 1.5, , .3, -99, .1, 1.63, , , .11, .22 ],

		'tone/blip/001': [ 5, 0, 130, .02, .03, .02, , 2.8, , , , , , , , , , .7, .02 ],
		'tone/blip/002': [ 3, 0, 146, .02, .03, .02, , 2.8, , , , , , , , , , .7, .02 ],
		'tone/blip/003': [ 3, 0, 164, .02, .03, .02, , 2.8, , , , , , , , , , .7, .02 ],
		'tone/blip/004': [ 3, 0, 174, .02, .03, .02, , 2.8, , , , , , , , , , .7, .02 ],
		'tone/blip/005': [ 3, 0, 195, .02, .03, .02, , 2.8, , , , , , , , , , .7, .02 ],
		'tone/blip/006': [ 3, 0, 220, .02, .03, .02, , 2.8, , , , , , , , , , .7, .02 ],
		'tone/blip/007': [ 3, 0, 246, .02, .03, .02, , 2.8, , , , , , , , , , .7, .02 ],
		'tone/blip/008': [ 3, 0, 261, .02, .03, .02, , 2.8, , , , , , , , , , .7, .02 ],

		'tone/bloop/001': [ 1, , 110, .02, , .09, 1, .61, , , 556, .12, , , , .3, , , .02 ],
		'tone/bloop/002': [ 1, 0, 521.25, , .02, .03, 2, 0, , .1, 700, .01, , , 1, .1 ],
		'tone/bloop/003': [ 1.12, , 73, , 0.02, 0.11, 2, 1.18, , -0.1, , , , , , 0.3, , 0.55, 0.05, 0.23 ],
		'tone/bloop/004': [ 0.5, , 1368, .09, , 0, , 1.11, -76, 9.1, -490, , , , , , , .56 ],
		'tone/bloop/005': [ 2.03, , 413, , , 0.24, 2, 0.12, , , , , 0.11, , 317, 0.1, 0.13, , , 0.01 ],
		'tone/bloop/006': [ , 0, , .01, .02, .09, , .6, 17, -3, , , .1, , , , , .76, .08 ],
		'tone/bloop/007': [ 0.3, , 10, 0.06, , 0, 2, 2.3, , , 621, , , , , , , , 0.21, 0.26 ],
		'tone/bloop/008': [ 1.5, 0.05, 24, 0.01, 0.02, 0.01, 1, 3.9, -33, 0, 0, 0, 0, 0, 355, 0, 0, 0.65, 0, 0, 0 ],
		'tone/bloop/009': [ 2, 0.05, 226, 0, 0.08, 0.13, 0, 3.1, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.02, 0.76, 0.04, 0, 105 ],
		'tone/bloop/010': [ 4, 0, 224, .02, .02, .08, 1, 1.7, -13.9, , , , , , 6.7 ],
		'tone/bloop/011': [ 1, , 283, .02, , .11, , .38, , , , , .07, , , .1, .08, .63, .02 ],
		'tone/bloop/012': [ 1, 0, 288, 0.05, 0.01, , , 2, - 10, , , , , , , , , 0.5, 0.1 ],
		'tone/bloop/013': [ 2, 0, 700, 0.01, , 0, , , , , , , , , , , , 0.1, 0.01 ],
		'tone/bloop/014': [ 2.21, , 107, 0.02, 0.04, 0.07, , 2.22, 2, 0.9, , , , 0.4, , 0.5, 0.15, 0.42, 0.04 ],
		'tone/bloop/015': [ 0.6, 0, 2200, , , 0.04, 3, 2, , , 800, 0.02, , 4.8, , 0.01, 0.1 ],

		'tone/jingle/001': [ 1.4, , 183, .07, .13, .34, , 3.3, , , 35, .06, .07, , , , .13, .95, .27, .11 ],
		'tone/jingle/002': [ .8, , 208, .02, .21, .13, 3, .2, , , 40, .06, .1, , , , , .91, .2, .27 ],
		'tone/jingle/003': [ .9, , 56, .15, .46, .08, , 1.6, -2, , -137, .01, .06, , , , .09, .77, .37, .13 ],
		'tone/jingle/004': [ .6, , 269, .03, .17, .41, , .2, , 1, 239, .08, .04, , , , , .72, .19, .43, -720 ],
		'tone/jingle/005': [ 1.3, 0, 130.81, 0.32, 0.35, 0.5, 3, 5.2, 0, 1, 50, 0, 0.14, 0, 0, 0, 0, 0.37, 0.04, 0.24, 0 ],
		'tone/jingle/006': [ 1, , 525, .18, .28, .17, 1, 1.24, 8.3, -9.7, -151, .03, .06, , , , , .93, .02, .14 ],
		'tone/jingle/007': [ .6, , 934, .12, .38, .93, 1, .27, , .4, -434, .08, .2, .1, , .1, .17, .55, 1, .46 ],
		'tone/jingle/008': [ 1.4, 0, 20, .04, , .6, , 1.31, , , -990, .06, .17, , , .04, .07 ],
		'tone/jingle/009': [ 1.2, 0, 80, .3, .4, .7, 2, .1, -0.73, 3.42, -430, .09, .17, , , , .19 ],
		'tone/jingle/010': [ 0.5, , 392, .06, .22, .5, 1, 1.85, -0.1, -0.9, 61, .05, .07, , , .1, , .96, .12 ],
		'tone/jingle/011': [ 0.5, , 146, .04, .23, .46, , .56, , -3.7, 658, .02, .15, .1, , , , .82, .13, .2 ],
		'tone/jingle/012': [ 1, , 284, .08, .2, .25, 1, 3, , , 50, .09, .06, , , , , .6, .28, .03, -1391 ],
		'tone/jingle/013': [ 1.5, , 430, .02, .12, .5, , .89, , -3.6, -133, .07, .13, , , .1, , .83, .23, .26 ],
		'tone/jingle/014': [ 0.4, , 22, .08, .22, .02, 1, .52, -4.2, -9.8, , , .14, , -18, .2, , , .05 ],
		'tone/jingle/015': [ , , 193, .04, .27, .42, 1, 1.71, 2.8, 4.9, , , .1, .2, , .1, , .55, .27, .47 ],
		'tone/jingle/016': [ 1.1, , 250, .07, .24, .26, , 2, , 164, 211, .07, .08, , , .1, , .75, .12, .09, 115 ],
		'tone/jingle/017': [ , , 103, .04, .11, .43, 1, .77, , , 57, .19, .05, , , .1, , .68, .24 ],

		'ui/click/001': [ 1.5, 0, 900, , .01, 0, 1, , -10, , -31, .02, , , , , , 1.2, , .16, -1448 ],
		'ui/click/002': [ 2.5, , 783, , .03, .02, 1, 2, , , 940, .03, , , , , .2, .6, , .06 ],
		'ui/click/003': [ 1.5, .01, 300, , , .02, 3, .22, , , -9, .2, , , , , , .5 ],
		'ui/click/004': [ 1, 0, 685, .01, .03, .17, 1, 1.4, , , , , , , , , , .63, .01, , 420 ],
		'ui/click/005': [ 6, , 205, , .02, 0, , 1.03, , , , , , , , , .12, .32 ],

		'weapon/explode/001': [ 1.5, 0, 333, .01, 0, .9, 4, 1.9, , , , , , .5, , .6 ],
		'weapon/explode/002': [ 1.1, 0, 418, 0, .02, .2, 4, 1.15, -8.5, , , , , .7, , .1 ],
		'weapon/explode/003': [ 1.2, 0, 82, .02, , .2, 4, 4, , , , , , .8, , .2, , .8, .09 ],
		'weapon/explode/004': [ 2, .2, 72, .01, .01, .2, 4, , , , , , , 1, , .5, .1, .5, .02 ],
		'weapon/explode/005': [ 2, , 1e3, .02, , .2, 1, 3, .1, , , , , 1, -30, .5, , .5 ],
		'weapon/explode/006': [ 1, , 485, .02, .2, .2, 4, .11, -3, .1, , , .05, 1.1, , .4, , .57, .5 ],
		'weapon/explode/007': [ 0.8, , 372, 0.02, 0.02, 0.5, 4, 2.29, 0.2, , , , , 0.6, , 0.6, , 0.7, 0.04, 0.19 ],
		'weapon/explode/008': [ 1.05, , 591, .03, .13, .51, 4, 3.02, .6, .1, , , .04, 1.6, , 1, , .46, .13 ],
		'weapon/explode/009': [ 1.99, , 770, 0.03, 0.19, 0.35, , 0.26, , , , , , 2, -50, 0.1, 0.27, 0.48, 0.06 ],
		'weapon/explode/010': [ 1.5, , 98, .08, .18, .02, 2, 2.47, 36, .5, , , .04, .1, , .9, .44, , .04 ],
		'weapon/explode/011': [ 1, , 400, , .03, .21, 3, .85, .5, , , , , 1.8, , .5, , .97, .05 ],
		'weapon/explode/012': [ 1, , 485, .02, .07, .03, 4, .11, -3, .1, , , .05, 1.1, , .4, , .57, .09 ],
		'weapon/explode/013': [ , , 30, .09, .12, .35, 4, 3, 4, , , , , 1.3, , .6, , .36, .21 ],

		'weapon/lazer/001': [ 1.5, 0, 515, .05, .07, .09, 1, 2.8, , , 302, .06, .1, , 3.5, .1, .08, .75, .04 ],
		'weapon/lazer/002': [ , 0, 925, .04, .3, .6, 1, .3, , 6.27, -184, .09, .17 ],
		'weapon/lazer/003': [ 1, , 375, .01, .06, , 2, 2.3, 18, -10, , , , , 18, , , .56, .14 ],
		'weapon/lazer/004': [ 0.5, , 2e3, , 0.05, 0, , 1.11, -17, , 197, 0.01, , 0.2, , , , , 0.16 ],
		'weapon/lazer/005': [ .9, , 752, .03, .01, .02, , 1.4, , , -10, .01, , , 3.4, , , .68, .03, , 106 ],
		'weapon/lazer/006': [ 1.9, , 221, .01, .05, .06, 1, 3.9, -2, , 116, .05, , , , , , .65, .02, , 452 ],
		'weapon/lazer/007': [ 1, , 659, .01, .04, , 1, .4, , -75, 179, .06, , , .2, , , .57 ],

		'world/footstep/001': [ 1.1, 0.05, 157, 0.03, 0.04, 0.04, 4, 4.9, 78, -13, 0, 0, 0.07, 0, 0, 0, 0, 0.91, 0.02, 0.33, 0 ],
		'world/footstep/002': [ .1, 1, 300, .05, .1, .05, 4, .2, -100, , -50, .07, , .5, , .4, , , , .05 ],
		'world/footstep/003': [ 3, , 5, , .06, .01, 2, 2.25, -19, -79, 409, .01, , , 6.6, , .2, .57, , .8 ],

		'world/nature/frog': [ 0.5, , 160, .03, .03, .02, , 1.52, -23, 93, 662, .02, , , , .1, , , .07, .01 ],
		'world/nature/dolphin': [ 0.5, 0, 448, .01, .1, .3, 3, .39, -0.5, , , , , , .2, .1, .08 ],
		'world/nature/whale': [ 1.2, 0, 1306, .8, .08, .02, 1, , , , , , .48, , -0.1, .11, .25 ],
		'world/nature/mouse': [ 1.2, 0, 1e3, .02, , .01, 2, , 18, , 475, .01, .01 ],
		'world/nature/small-dog': [ 1, , 759, .01, , .01, 1, .97, 15, , , , , , 3.1, , , .76, .04 ],
		'world/nature/tweet': [ 0.7, , 1305, , , .03, 1, .75, , 23, 694, .01, , , 3.9, , , , .01 ],

		'world/water/splash': [ 2, , 94, .07, .1, .33, 4, .6, 1, , , , , .1, 1, .1, .1, .45, .15 ],
		'world/water/wave': [ 1, 0, 40, .5, , 1.5, , 11, , , , , , 199 ],
		'world/water/pop': [ 1, 0, 103, , 0.02, 0.06, , 1.24, - 18, 4.4, , , , 0.7, , 0.1, , 0.95, 0.03 ],

		'world/weather/thunder': [ 1.2, 0, 471, , .09, .47, 4, 1.06, -6.7, , , , , .9, 61, .1, , .82, .09, .13 ],

	};


	/**
	 * Play a named sound effect.
	 *
	 * @param {string} sfx - The name of the sound effect to play.
	 * @throws {Error} If the sfx is not found.
	 * @returns	{void}
	 */
	beep8.Sfx.play = function( sfx = '' ) {

		// Quit if no sound specified.
		if ( !sfx ) return;

		// Check the sfx is a string.
		beep8.Utilities.checkString( 'sfx', sfx );

		// SFX not found.
		if ( !beep8.Sfx.library[ sfx ] ) {
			beep8.Utilities.fatal( `SFX ${sfx} not found.` );
		}

		beep8.Sfx.playFromArray( beep8.Sfx.library[ sfx ] );

	}


	/**
	 * Play a sound effect from a ZzFX array.
	 *
	 * This array can be generated with ZzFX. It should be just the array beginning and ending with square brackets.
	 *
	 * @see https://killedbyapixel.github.io/ZzFX/
	 *
	 * @param {Array} sfxArray - The sound effect array to play.
	 * @returns {void}
	 */
	beep8.Sfx.playFromArray = function( sfxArray = [] ) {

		// Check the sfx is an array.
		beep8.Utilities.checkArray( 'sfxArray', sfxArray );

		// Play the raw sound effect.
		zzfx( ...sfxArray );
	}


	/**
	 * Add a sound effect to the library.
	 *
	 * @param {string} sfxName - The name of the sound effect.
	 * @param {Array} sfxArray The sound effect array.
	 * @throws {Error} If the sfxName is not a string.
	 * @throws {Error} If the sfxArray is not an array.
	 * @return {void}
	 */
	beep8.Sfx.add = function( sfxName, sfxArray ) {

		beep8.Utilities.checkString( 'sfxName', sfxName );
		beep8.Utilities.checkArray( 'sfxArray', sfxArray );

		beep8.Sfx.library[ sfxName ] = sfxArray;

	}


	/**
	 * Get the list of sfx from the library.
	 *
	 * @return {Array} The list of sfx.
	 */
	beep8.Sfx.get = function() {

		return Object.keys( beep8.Sfx.library );

	}

} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	beep8.State = beep8.State || {};


	// This is the key used to store the state in localStorage.
	let STORAGE_KEY = '';

	document.addEventListener(
		'beep8.initComplete',
		function() {

			// Set the storage key based on the beep8 configuration name.
			STORAGE_KEY = `beep8.${beep8.Utilities.makeUrlPretty( beep8.CONFIG.NAME )}.state`;

		},
		{ once: true }
	);


	/**
	 * Recursively wraps an object in a Proxy to make it reactive.
	 *
	 * @param {Object} target - The object to wrap.
	 * @returns {Proxy} - The reactive proxy.
	 */
	function createProxy( target ) {

		return new Proxy(
			target,
			{

				/**
				 * Get trap for the Proxy.
				 * Intercepts property access on the state object.
				 *
				 * @param {Object} obj - The original object being proxied.
				 * @param {string} prop - The property being accessed.
				 * @returns {*} - The value of the accessed property.
				 */
				get( obj, prop ) {

					const value = obj[ prop ];
					if ( typeof value === 'object' && value !== null ) {
						return createProxy( value );
					}
					return value;

				},


				/**
				 * Set trap for the Proxy.
				 * Intercepts property updates on the state object.
				 *
				 * @param {Object} obj - The original object being proxied.
				 * @param {string} prop - The property being updated.
				 * @param {*} value - The new value to assign to the property.
				 * @returns {boolean} - Returns true to indicate the operation was successful.
				 */
				set( obj, prop, value ) {

					obj[ prop ] = value;
					beep8.Utilities.event( 'stateChange', { prop, value } );
					return true;

				}

			}
		);

	}


	/**
	 * Saves the current state to localStorage using CBOR and base64.
	 *
	 * @param {string} [key='beep8.state'] - Optional localStorage key.
	 */
	beep8.State.save = function( key = STORAGE_KEY ) {

		const encoded = beep8.Utilities.encodeData(
			{
				time: Date.now(),
				data: beep8.data
			}
		);

		localStorage.setItem( key, encoded );

		beep8.State.lastSave = Date.now();

	}


	/**
	 * Loads state from localStorage, replacing State.data.
	 *
	 * @param {string} [key='beep8.state'] - Optional localStorage key.
	 */
	beep8.State.load = function( key = STORAGE_KEY ) {

		const b64 = localStorage.getItem( key );

		if ( !b64 ) {
			beep8.Utilities.log( 'No state found for the given key.' );
			return;
		}

		const rawState = beep8.Utilities.decodeData( b64 );
		if ( rawState.data ) {
			beep8.data = createProxy( rawState.data );
		}

		if ( rawState.time ) {
			beep8.State.lastSave = rawState.time;
		}

	}


	/**
	 * Sets default values for missing keys in the state.
	 * Does not overwrite existing values.
	 *
	 * @param {Object} defaults - An object containing default key/value pairs.
	 */
	beep8.State.init = function( defaults ) {

		if ( !beep8.data ) {
			beep8.data = createProxy( {} );
		}

		// If there is a save file then load that too.
		if ( localStorage.getItem( STORAGE_KEY ) ) {
			beep8.State.load();
		}

		// beep8.data = beep8.Utilities.deepMergeByIndex( beep8.data, defaults );
		beep8.data = beep8.Utilities.deepMergeByIndex( defaults, beep8.data );

		beep8.Utilities.log( 'State initialized:', beep8.data );

	}


	/**
	 * Resets the state to its initial values.
	 * This is useful for starting a new game or resetting the application.
	 *
	 * @param {string} [key='beep8.state'] - Optional localStorage key.
	 * @returns {void}
	 */
	beep8.State.clear = function( key = STORAGE_KEY ) {

		beep8.Utilities.log( 'Clearing state...' );

		localStorage.removeItem( key );
		beep8.data = createProxy( {} );

	}


	/**
	 * The beep8.State data object.
	 */
	beep8.data = createProxy( {} );


} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	beep8.TextRenderer = {};

	/**
	 * An array of character codes for each character in the chars string.
	 * This is used to look up the index of a character in the chars string.
	 *
	 * @type {number[]}
	 */
	const charMap = [];

	// beep8.TextRendererFont for each font, keyed by font name. The default font is called "default".
	beep8.TextRenderer.fonts_ = {};

	// Current font. This is never null after initialization. This is a reference
	// to a beep8.TextRendererFont object. For a font to be set as current, it must have a
	// character width and height that are INTEGER MULTIPLES of beep8.CONFIG.CHR_WIDTH and
	// beep8.CONFIG.CHR_HEIGHT, respectively, to ensure the row/column system continues to work.
	beep8.TextRenderer.curFont_ = null;

	// Current tiles. This is a reference to a beep8.TextRendererFont object.
	// This is used for the tiles font.
	beep8.TextRenderer.curTiles_ = null;


	/**
	 * Prepares the charMap array.
	 *
	 * This is a list of character codes for each character in the chars string.
	 * This is used to look up the index of a character in the chars string.
	 *
	 * @returns {void}
	 */
	beep8.TextRenderer.prepareCharMap = function() {

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
	beep8.TextRenderer.initAsync = async function() {

		beep8.Utilities.log( "beep8.TextRenderer init." );

		// Prepare the text font.
		beep8.TextRenderer.curFont_ = await beep8.TextRenderer.loadFontAsync( "default-thin", beep8.CONFIG.FONT_DEFAULT, 0.5, 1 );

		// Prepare the tiles font.
		beep8.TextRenderer.curTiles_ = await beep8.TextRenderer.loadFontAsync( "tiles", beep8.CONFIG.FONT_TILES );

		// Prepare the actors/ player characters.
		beep8.TextRenderer.curActors_ = await beep8.TextRenderer.loadFontAsync( "actors", beep8.CONFIG.FONT_ACTORS );

		// Prepare the charMap array.
		beep8.TextRenderer.prepareCharMap();

	}


	/**
	 * Loads a new font asynchronously.
	 *
	 * @param {string} fontName - The name of the font.
	 * @param {string} fontImageFile - The URL of the image file for the font.
	 * @param {number} [tileSizeWidthMultiplier=1] - The tile size width multiplier for the font.
	 * @param {number} [tileSizeHeightMultiplier=1] - The tile size height multiplier for the font.
	 * @returns {Promise<void>}
	 */
	beep8.TextRenderer.loadFontAsync = async function( fontName, fontImageFile, tileSizeWidthMultiplier = 1, tileSizeHeightMultiplier = 1 ) {

		beep8.Utilities.checkString( "fontName", fontName );
		beep8.Utilities.checkString( "fontImageFile", fontImageFile );

		const font = new beep8.TextRendererFont( fontName, fontImageFile, tileSizeWidthMultiplier, tileSizeHeightMultiplier );
		await font.initAsync();

		beep8.TextRenderer.fonts_[ fontName ] = font;

		return font;

	}


	/**
	 * Sets the current font.
	 *
	 * @param {string} fontName - The name of the font to set.
	 * @returns {void}
	 * @throws {Error} If the font is not found or its dimensions are not compatible.
	 */
	beep8.TextRenderer.setFont = function( fontName ) {

		const font = beep8.TextRenderer.getFontByName( fontName );

		if ( font ) {
			beep8.TextRenderer.curFont_ = font;
		}

	}


	/**
	 * Get the current font.
	 *
	 * @returns {beep8.TextRendererFont} The current font.
	 */
	beep8.TextRenderer.getFont = function() {

		return beep8.TextRenderer.curFont_;

	}


	/**
	 * Sets the current tiles font.
	 *
	 * @param {string} fontName - The name of the font to set.
	 * @returns {void}
	 */
	beep8.TextRenderer.setTileFont = function( fontName ) {

		const font = beep8.TextRenderer.getFontByName( fontName );

		if ( font ) {
			beep8.TextRenderer.curTiles_ = font;
		}

	}


	/**
	 * Gets a font by name.
	 *
	 * @param {string} fontName - The name of the font to get.
	 * @returns {beep8.TextRendererFont} The font.
	 */
	beep8.TextRenderer.getFontByName = function( fontName ) {

		beep8.Utilities.checkString( "fontName", fontName );
		const font = beep8.TextRenderer.fonts_[ fontName ];

		if ( !font ) {
			beep8.Utilities.fatal( `setFont(): font not found: ${fontName}` );
			return;
		}

		return font;

	}


	/**
	 * Prints text at the current cursor position.
	 *
	 * @param {string} text - The text to print.
	 * @param {beep8.TextRendererFont} [font=null] - The font to use for printing.
	 * @param {number} [wrapWidth=-1] - The width to wrap text at.
	 * @returns {void}
	 */
	beep8.TextRenderer.print = function( text, font = null, wrapWidth = -1 ) {

		beep8.TextRenderer.printFont_ = font || beep8.TextRenderer.curFont_;

		// Property validation.
		beep8.Utilities.checkString( "text", text );
		beep8.Utilities.checkNumber( "wrapWidth", wrapWidth );
		if ( font !== null ) beep8.Utilities.checkObject( "font", font );

		// Wrap text to specified width.
		text = beep8.TextRenderer.wrapText( text, wrapWidth, font );

		// Store the start location.
		let col = beep8.Core.drawState.cursorCol;
		let row = beep8.Core.drawState.cursorRow;

		// Store a backup of foreground/background colors and fonts.
		beep8.TextRenderer.origFgColor_ = beep8.Core.drawState.fgColor;
		beep8.TextRenderer.origBgColor_ = beep8.Core.drawState.bgColor;
		beep8.TextRenderer.origFont_ = beep8.TextRenderer.printFont_;

		const colInc = beep8.TextRenderer.printFont_.getCharColCount();
		const rowInc = beep8.TextRenderer.printFont_.getCharRowCount();

		const initialCol = col;

		for ( let i = 0; i < text.length; i++ ) {

			i = processEscapeSeq_( text, i );
			const ch = text.charCodeAt( i );

			// New line character so set a new line and reset the column.
			if ( ch === 10 ) {

				col = initialCol;
				row += rowInc;

			} else {

				// Get index for the character from charMap.
				const chIndex = charMap.indexOf( ch );

				if ( chIndex >= 0 ) {

					put_(
						chIndex,
						col, row,
						beep8.Core.drawState.fgColor, beep8.Core.drawState.bgColor,
						beep8.TextRenderer.printFont_
					);
					col += colInc;

				}

			}

		}

		// Reset properties.
		beep8.Core.drawState.cursorCol = col;
		beep8.Core.drawState.cursorRow = row;
		beep8.Core.drawState.fgColor = beep8.TextRenderer.origFgColor_;
		beep8.Core.drawState.bgColor = beep8.TextRenderer.origBgColor_;

		beep8.Renderer.markDirty();

	}


	/**
	 * Prints text character by character, as in a typewriter.
	 *
	 * @param {string} text - The text to print.
	 * @param {number} [wrapWidth=-1] - The width to wrap text at.
	 * @param {number} [delay=0.05] - The delay between characters in seconds.
	 * @param {beep8.TextRendererFont} [font=null] - The font to use.
	 * @returns {Promise<void>} Resolves after the text is printed.
	 */
	beep8.TextRenderer.printTypewriter = async function( text, wrapWidth = -1, delay = 0.05, font = null ) {

		beep8.Utilities.checkString( "text", text );
		beep8.Utilities.checkNumber( "wrapWidth", wrapWidth );
		beep8.Utilities.checkNumber( "delay", delay );

		const startCol = beep8.col();
		const startRow = beep8.row();

		text = beep8.TextRenderer.wrapText( text, wrapWidth );

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
			beep8.Core.setCursorLocation( startCol, startRow );
			beep8.TextRenderer.print( text.substring( 0, i ), font );

			if ( c !== 32 ) {
				await beep8.Async.wait( delay );
			}

		}

	}


	/**
	 * Prints text centered within a given width.
	 *
	 * @param {string} text - The text to print.
	 * @param {number} width - The width to center the text within.
	 * @param {beep8.TextRendererFont} [font=null] - The font to use.
	 * @returns {void}
	 */
	beep8.TextRenderer.printCentered = function( text, width, font = null ) {

		beep8.TextRenderer.printFont_ = font || beep8.TextRenderer.curFont_;

		beep8.Utilities.checkString( "text", text );
		beep8.Utilities.checkNumber( "width", width );

		if ( !text ) {
			return;
		}

		const col = beep8.Core.drawState.cursorCol;
		const rowInc = beep8.TextRenderer.printFont_.getCharRowCount();

		// Split the text into lines.
		text = text.split( "\n" );

		// Remove last item from text if it is empty.
		if ( text[ text.length - 1 ] === "" ) text.pop();

		// Loop through each line of text.
		for ( let i = 0; i < text.length; i++ ) {

			const textWidth = beep8.TextRenderer.measure( text[ i ] ).cols;
			const tempCol = col + ( width - textWidth ) / 2;

			beep8.Core.drawState.cursorCol = tempCol;
			beep8.TextRenderer.print( text[ i ], font, width );

			beep8.Core.drawState.cursorRow += rowInc;

		}

		// Reset cursor position.
		beep8.Core.drawState.cursorCol = col;

	}


	/**
	 * Prints text right-aligned within a given width.
	 *
	 * @param {string} text - The text to print.
	 * @param {number} width - The width to right-align the text within.
	 * @param {beep8.TextRendererFont} [font=null] - The font to use.
	 * @returns {void}
	 */
	beep8.TextRenderer.printRight = function( text, width, font = null ) {

		beep8.TextRenderer.printFont_ = font || beep8.TextRenderer.curFont_;

		beep8.Utilities.checkString( "text", text );
		beep8.Utilities.checkNumber( "width", width );

		if ( !text ) {
			return;
		}

		const col = beep8.Core.drawState.cursorCol;
		const rowInc = beep8.TextRenderer.printFont_.getCharRowCount();

		text = beep8.TextRenderer.wrapText( text, width );

		// Split the text into lines.
		text = text.split( "\n" );

		// Remove last item from text if it is empty.
		if ( text[ text.length - 1 ] === "" ) text.pop();

		// Loop through each line of text.
		for ( let i = 0; i < text.length; i++ ) {

			let textWidth = beep8.TextRenderer.measure( text[ i ] ).cols;
			const tempCol = col + width - textWidth;

			beep8.Core.drawState.cursorCol = tempCol;
			beep8.TextRenderer.print( text[ i ], font, width );

			beep8.Core.drawState.cursorRow += rowInc;

		}

		// Reset cursor position.
		beep8.Core.drawState.cursorCol = col;

	}


	/**
	 * Prints a character a specified number of times.
	 *
	 * @param {number} ch - The character to print.
	 * @param {number} n - The number of times to print the character.
	 * @param {beep8.TextRendererFont} [font=null] - The font to use.
	 * @returns {void}
	 */
	beep8.TextRenderer.printChar = function( ch, n, font = null ) {

		if ( n === undefined || isNaN( n ) ) {
			n = 1;
		}

		beep8.Utilities.checkNumber( "ch", ch );
		beep8.Utilities.checkNumber( "n", n );

		// Check cursorCol and cursorRow are within bounds.
		if (
			beep8.Core.drawState.cursorCol < 0 ||
			beep8.Core.drawState.cursorRow < 0 ||
			beep8.Core.drawState.cursorCol >= beep8.CONFIG.SCREEN_COLS ||
			beep8.Core.drawState.cursorRow >= beep8.CONFIG.SCREEN_ROWS
		) {
			// No need for an error. Just end silently.
			return;
		}

		while ( n-- > 0 ) {

			put_(
				ch,
				beep8.Core.drawState.cursorCol,
				beep8.Core.drawState.cursorRow,
				beep8.Core.drawState.fgColor,
				beep8.Core.drawState.bgColor,
				font
			);

			beep8.Core.drawState.cursorCol++;

		}

		beep8.Renderer.markDirty();

	}


	/**
	 * Prints a character as a "sprite" at a raw x, y position.
	 *
	 * @param {number} ch - The character to print.
	 * @param {number} x - The x-coordinate.
	 * @param {number} y - The y-coordinate.
	 * @returns {void}
	 */
	beep8.TextRenderer.spr = function( ch, x, y, font = null, direction = 0 ) {

		beep8.Utilities.checkNumber( "ch", ch );
		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		beep8.Utilities.checkInt( "direction", direction );
		if ( font !== null ) beep8.Utilities.checkObject( "font", font );

		putxy_(
			ch,
			x,
			y,
			beep8.Core.drawState.fgColor,
			beep8.Core.drawState.bgColor,
			font,
			direction
		);

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
	beep8.TextRenderer.drawText = function( x, y, text, fontName ) {

		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		beep8.Utilities.checkString( "text", text );

		if ( fontName ) {
			beep8.Utilities.checkString( "fontName", fontName );
		}

		const x0 = x;
		const font = fontName ? ( beep8.TextRenderer.fonts_[ fontName ] || beep8.TextRenderer.curFont_ ) : beep8.TextRenderer.curFont_;

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

				putxy_(
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
	 * @param {beep8.TextRendererFont} [font=null] - The font to use for measurement.
	 * @returns {{cols: number, rows: number}} The dimensions of the text.
	 */
	beep8.TextRenderer.measure = function( text, font = null ) {

		beep8.Utilities.checkString( "text", text );

		font = font || beep8.TextRenderer.curFont_;

		if ( "" === text ) {
			return { cols: 0, rows: 0 }; // Special case
		}

		let rows = 1;
		let thisLineWidth = 0;
		let cols = 0;

		for ( let i = 0; i < text.length; i++ ) {
			i = processEscapeSeq_( text, i, true );
			const ch = text.charCodeAt( i );

			if ( ch === 10 ) {
				rows++;
				thisLineWidth = 0;
			} else {
				++thisLineWidth;
				cols = Math.max( cols, thisLineWidth );
			}
		}

		// Adjust the size of the cols and rows based on the size of the font.
		cols = cols * font.getCharColCount();
		rows = rows * font.getCharRowCount();

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
	beep8.TextRenderer.printRect = function( width, height, ch ) {

		beep8.Utilities.checkNumber( "width", width );
		beep8.Utilities.checkNumber( "height", height );
		beep8.Utilities.checkNumber( "ch", ch );

		const startCol = beep8.Core.drawState.cursorCol;
		const startRow = beep8.Core.drawState.cursorRow;

		for ( let i = 0; i < height; i++ ) {
			beep8.Core.drawState.cursorCol = startCol;
			beep8.Core.drawState.cursorRow = startRow + i;
			beep8.TextRenderer.printChar( ch, width );
		}

		beep8.Core.drawState.cursorCol = startCol;
		beep8.Core.drawState.cursorRow = startRow;

	}


	/**
	 * Prints a box with borders.
	 *
	 * @param {number} width - The width of the box.
	 * @param {number} height - The height of the box.
	 * @param {boolean} [fill=true] - Whether to fill the box.
	 * @param {number} [borderCh=beep8.CONFIG.BORDER_CHAR] - The character to use for the border.
	 * @returns {void}
	 */
	beep8.TextRenderer.printBox = function( width, height, fill = true, borderChar = beep8.CONFIG.BORDER_CHAR ) {

		beep8.Utilities.checkNumber( "width", width );
		beep8.Utilities.checkNumber( "height", height );
		beep8.Utilities.checkBoolean( "fill", fill );
		beep8.Utilities.checkNumber( "borderChar", borderChar );

		const colCount = beep8.TextRenderer.curTiles_.getColCount();
		const borders = {
			NW: borderChar,
			NE: borderChar + 2,
			SW: borderChar + colCount + colCount,
			SE: borderChar + colCount + colCount + 2,
			V: borderChar + colCount,
			H: borderChar + 1,
		};

		beep8.TextRenderer.drawBox( width, height, fill, borders );

	}


	/**
	 * Draws a box with borders.
	 *
	 * @param {number} width - The width of the box.
	 * @param {number} height - The height of the box.
	 * @param {boolean} [fill=true] - Whether to fill the box.
	 * @param {Object} [borders] - The borders to use.
	 * @param {number} [borders.NW] - The top-left corner character.
	 * @param {number} [borders.NE] - The top-right corner character.
	 * @param {number} [borders.SW] - The bottom-left corner character.
	 * @param {number} [borders.SE] - The bottom-right corner character.
	 * @param {number} [borders.V] - The vertical border character.
	 * @param {number} [borders.H] - The horizontal border character.
	 * @returns {void}
	 */
	beep8.TextRenderer.drawBox = function( width, height, fill = true, borders = {} ) {

		const startCol = beep8.Core.drawState.cursorCol;
		const startRow = beep8.Core.drawState.cursorRow;

		for ( let i = 0; i < height; i++ ) {

			beep8.Core.drawState.cursorCol = startCol;
			beep8.Core.drawState.cursorRow = startRow + i;

			if ( i === 0 ) {
				// Top border
				beep8.TextRenderer.printChar( borders.NW );
				beep8.TextRenderer.printChar( borders.H, width - 2 );
				beep8.TextRenderer.printChar( borders.NE );
			} else if ( i === height - 1 ) {
				// Bottom border.
				beep8.TextRenderer.printChar( borders.SW );
				beep8.TextRenderer.printChar( borders.H, width - 2 );
				beep8.TextRenderer.printChar( borders.SE );
			} else {
				// Middle.
				beep8.TextRenderer.printChar( borders.V );
				beep8.Core.drawState.cursorCol = startCol + width - 1;
				beep8.TextRenderer.printChar( borders.V );
			}
		}

		if ( fill && width > 2 && height > 2 ) {
			beep8.Core.drawState.cursorCol = startCol + 1;
			beep8.Core.drawState.cursorRow = startRow + 1;
			beep8.TextRenderer.printRect( width - 2, height - 2, 0 );
		}

		beep8.Core.drawState.cursorCol = startCol;
		beep8.Core.drawState.cursorRow = startRow;

	}


	/**
	 * Wraps text to a given width.
	 *
	 * @param {string} text - The text to wrap.
	 * @param {number} wrapWidth - The width to wrap the text to.
	 * @param {beep8.TextRendererFont} fontName - The font to use.
	 * @returns {string} The wrapped text.
	 */
	beep8.TextRenderer.wrapText = function( text, wrapWidth, font = null ) {

		font = font || beep8.TextRenderer.curFont_;

		// If 0 or less then don't wrap.
		if ( wrapWidth <= 0 ) return text;

		// Split the text into lines.
		const lines = text.split( "\n" );

		// New list of lines.
		const wrappedLines = [];

		for ( const line of lines ) {

			const words = line.split( " " );
			let wrappedLine = "";

			for ( const word of words ) {

				const lineWidth = beep8.TextRenderer.measure( ( wrappedLine + word ).trim() ).cols;

				// Is the line with the new word longer than the line width?
				if ( lineWidth > wrapWidth ) {
					wrappedLines.push( wrappedLine.trim() );
					wrappedLine = "";
				}

				// Add a space between words.
				wrappedLine += word + " ";

			}

			wrappedLines.push( wrappedLine.trim() );

		}

		return wrappedLines.join( "\n" );

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
	const put_ = function( ch, col, row, fgColor, bgColor, font = null, direction = 0 ) {

		// Calculate x and y row and column to place character.
		const x = Math.round( col * beep8.CONFIG.CHR_WIDTH );
		const y = Math.round( row * beep8.CONFIG.CHR_HEIGHT );

		putxy_( ch, x, y, fgColor, bgColor, font, direction );

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
	const putxy_ = function( ch, x, y, fgColor, bgColor, font = null, direction = 0 ) {

		font = font || beep8.TextRenderer.curTiles_;

		const colCount = font.getColCount();
		const chrW = font.getCharWidth();
		const chrH = font.getCharHeight();
		const fontRow = Math.floor( ch / colCount );
		const fontCol = ch % colCount;

		// Round so assets are always drawn on whole pixels.
		x = Math.round( x );
		y = Math.round( y );

		// Draw the background.
		// If bgColor is -1 then don't draw the background.
		// Or make the background transparent.
		if ( bgColor >= 0 ) {
			beep8.Core.ctx.fillStyle = beep8.Core.getColorHex( bgColor );
			beep8.Core.ctx.fillRect( x, y, chrW, chrH );
		}

		// Foreground and background are the same so don't draw anything else.
		if ( beep8.CONFIG.SCREEN_COLORS === 1 && bgColor === fgColor ) {
			return;
		}

		// Flippety flip the tiles.
		if ( direction > 0 ) {

			// Save the current state of the canvas context if flipping is needed.
			beep8.Core.ctx.save();

			// Determine whether to flip horizontally or vertically
			const flipH = ( direction & 1 ) !== 0; // Check if bit 1 is set (horizontal flip)
			const flipV = ( direction & 2 ) !== 0; // Check if bit 2 is set (vertical flip)

			// Adjust the origin based on flip direction
			const translateX = flipH ? chrW : 0;
			const translateY = flipV ? chrH : 0;
			beep8.Core.ctx.translate( x + translateX, y + translateY );

			// Apply scaling to flip the image
			const scaleX = flipH ? -1 : 1;
			const scaleY = flipV ? -1 : 1;
			beep8.Core.ctx.scale( scaleX, scaleY );

			// Reset x and y to 0 because the translate operation adjusts the positioning
			x = 0;
			y = 0;

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

		// Restore the canvas context if flipping was needed.
		if ( direction > 0 ) {
			beep8.Core.ctx.restore();
		}

		beep8.Renderer.markDirty();

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
	const processEscapeSeq_ = function( text, startPos, pretend = false ) {

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
			runEscapeCommand_( command );
		}

		return endPos + endSeq.length;

	}


	/**
	 * Runs an escape command.
	 *
	 * @param {string} command - The command to run.
	 * @returns {void}
	 */
	const runEscapeCommand_ = function( command ) {

		// If it contains commas, it's a compound command.
		if ( command.indexOf( ',' ) > 0 ) {
			const parts = command.split( ',' );
			for ( const part of parts ) runEscapeCommand_( part );
			return;
		}

		command = command.trim();

		if ( command === "" ) {
			return;
		}

		// The first character is the command's verb. The rest is the argument.
		const verb = command[ 0 ].toLowerCase();
		const arg = command.substring( 1 );

		// If the argument is not a number then the result will be NaN and
		// the default will be used.
		const argNum = 1 * arg;

		switch ( verb ) {
			// Set foreground color.
			case "f":
			case "c":
				beep8.Core.drawState.fgColor = arg !== "" ? argNum : beep8.TextRenderer.origFgColor_;
				break;

			// Set background color.
			case "b":
				beep8.Core.drawState.bgColor = arg !== "" ? argNum : beep8.TextRenderer.origBgColor_;
				break;

			// Change font.
			case "t":
				beep8.TextRenderer.printFont_ = beep8.TextRenderer.getFontByName( arg );
				break;

			// Reset state.
			case "z":
				beep8.Core.drawState.fgColor = beep8.TextRenderer.origFgColor_;
				beep8.Core.drawState.bgColor = beep8.TextRenderer.origBgColor_;
				// Use original font if available, otherwise default.
				beep8.TextRenderer.printFont_ = beep8.TextRenderer.origFont_ || beep8.TextRenderer.fonts_[ "default" ];
				break;

			default:
				beep8.Utilities.warn( "Unknown beep8 print escape command: " + command );
		}

	}


	/**
	 * Regenerates the colors for all fonts.
	 *
	 * @returns {void}
	 */
	beep8.TextRenderer.regenColors = function() {

		// Tell all the fonts to regenerate their glyph images.
		Object.values( beep8.TextRenderer.fonts_ ).forEach( f => f.regenColors() );

	}

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
		 * @param {number} [tileWidthMultiplier=1] - The tile width multiplier for the font.
		 * @param {number} [tileHeightMultiplier=1] - The tile height multiplier for the font.
		 */
		constructor( fontName, fontImageFile, tileWidthMultiplier = 1, tileHeightMultiplier = 1 ) {

			beep8.Utilities.checkString( "fontName", fontName );
			beep8.Utilities.checkString( "fontImageFile", fontImageFile );

			this.fontName_ = fontName;
			this.fontImageFile_ = fontImageFile;
			this.origImg_ = null;
			this.chrImages_ = [];
			this.imageWidth_ = 0;
			this.imageHeight_ = 0;
			this.colCount_ = 0;
			this.rowCount_ = 0;
			this.charWidth_ = 0;
			this.charHeight_ = 0;
			this.charColCount_ = 0;
			this.charRowCount_ = 0;
			this.tileWidthMultiplier_ = tileWidthMultiplier;
			this.tileHeightMultiplier_ = tileHeightMultiplier;

		}


		/**
		 * Sets up this font from the given character image file. It's assumed to contain the
		 * glyphs arranged in a 16x16 grid, so we will deduce the character size by dividing the
		 * width and height by 16.
		 *
		 * @returns {Promise<void>}
		 */
		async initAsync() {

			this.origImg_ = await beep8.Utilities.loadImageAsync( this.fontImageFile_ );

			const imageCharWidth = beep8.CONFIG.CHR_WIDTH * this.tileWidthMultiplier_;
			const imageCharHeight = beep8.CONFIG.CHR_HEIGHT * this.tileHeightMultiplier_;

			beep8.Utilities.assert(
				this.origImg_.width % imageCharWidth === 0 && this.origImg_.height % imageCharHeight === 0,
				`Font ${this.fontName_}: image ${this.fontImageFile_} has dimensions ` +
				`${this.origImg_.width}x${this.origImg_.height}.`
			);

			this.origImg_ = await beep8.Utilities.makeColorTransparent( this.origImg_ );

			this.charWidth_ = imageCharWidth;
			this.charHeight_ = imageCharHeight;
			this.imageWidth_ = this.origImg_.width;
			this.imageHeight_ = this.origImg_.height;
			this.colCount_ = this.imageWidth_ / this.charWidth_;
			this.rowCount_ = this.imageHeight_ / this.charHeight_;
			// How many tiles wide and tall each character is.
			this.charColCount_ = this.tileWidthMultiplier_;
			this.charRowCount_ = this.tileHeightMultiplier_;

			await this.regenColors();

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
		 *
		 * @returns {number} The width of each character in pixels.
		 */
		getCharColCount() {

			return this.charColCount_;

		}


		/**
		 * Returns the character height of the font.
		 *
		 * @returns {number} The height of each character in pixels.
		 */
		getCharRowCount() {

			return this.charRowCount_;

		}


		/**
		 * Returns the number of rows in the font image.
		 *
		 * @returns {number} The number of rows in the font image.
		 */
		getRowCount() {

			return this.rowCount_;

		}


		/**
		 * Returns the number of columns in the font image.
		 *
		 * @returns {number} The number of columns in the font image.
		 */
		getColCount() {

			return this.colCount_;

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
		 * Regenerates the color text images.
		 *
		 * @returns {Promise<void>}
		 */
		async regenColors() {

			this.chrImages_ = [];

			// Loop through each color.
			for ( let c = 0; c < beep8.CONFIG.COLORS.length; c++ ) {

				// Create a temp context to draw the font image to.
				const tempCanvas = document.createElement( 'canvas' );
				tempCanvas.width = this.origImg_.width;
				tempCanvas.height = this.origImg_.height;

				const ctx = tempCanvas.getContext( '2d' );

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

				// Now draw with multiply blend mode to add shading.
				// But only if we the config is set.
				if ( beep8.CONFIG.SCREEN_COLORS === 2 ) {
					ctx.globalCompositeOperation = 'multiply';
					ctx.drawImage( this.origImg_, 0, 0, this.origImg_.width, this.origImg_.height );
				}

				this.chrImages_.push( tempCanvas );

			}

		}

	}


} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	/**
	 * A collection of functions for working with tilemaps.
	 * The tilemaps are created with the beep8 Tilemap Editor.
	 *
	 * The tilemap format is a multi-dimensional array of arrays.
	 * The tile array is in the format:
	 * [0] = tile character code.
	 * [1] = foreground color code.
	 * [2] = background color code.
	 * [3] = collision flag.
	 * [4] = additional data.
	 */
	beep8.Tilemap = {};

	beep8.Tilemap.MAP_CHAR = 0;
	beep8.Tilemap.MAP_FG = 1;
	beep8.Tilemap.MAP_BG = 2;
	beep8.Tilemap.MAP_COLLISION = 3;
	beep8.Tilemap.MAP_DATA = 4;


	// Define a mapping from bitmask value to your desired tile name or index.
	const wallTiles = {
		'solid': {
			0: 1,  // wall_isolated.
			1: 1,  // wall_end_bottom.
			2: 1,  // wall_end_left.
			3: 36,  // wall_corner_bottomLeft.
			4: 1,  // wall_end_top.
			5: 1,  // wall_vertical.
			6: 18,  // wall_corner_topLeft.
			7: 1,  // wall_t_right.
			8: 1,  // wall_end_right.
			9: 37,  // wall_corner_bottomRight.
			10: 1, // wall_horizontal.
			11: 1, // wall_t_bottom.
			12: 19, // wall_corner_topRight.
			13: 1, // wall_t_left.
			14: 1, // wall_t_top.
			15: 1  // wall_cross.
		},
		'rounded': {
			0: 1,  // wall_isolated.
			1: 42,  // wall_end_bottom.
			2: 23,  // wall_end_left.
			3: 36,  // wall_corner_bottomLeft.
			4: 41,  // wall_end_top.
			5: 1,  // wall_vertical.
			6: 18,  // wall_corner_topLeft.
			7: 1,  // wall_t_right.
			8: 24,  // wall_end_right.
			9: 37,  // wall_corner_bottomRight.
			10: 1, // wall_horizontal.
			11: 1, // wall_t_bottom.
			12: 19, // wall_corner_topRight.
			13: 1, // wall_t_left.
			14: 1, // wall_t_top.
			15: 1  // wall_cross.
		},
		'half': {
			0: 128,  // wall_isolated.
			1: 75,  // wall_end_bottom.
			2: 58,  // wall_end_left.
			3: 93,  // wall_corner_bottomLeft.
			4: 75,  // wall_end_top.
			5: 75,  // wall_vertical.
			6: 57,  // wall_corner_topLeft.
			7: 129,  // wall_t_right.
			8: 58,  // wall_end_right.
			9: 95,  // wall_corner_bottomRight.
			10: 58, // wall_horizontal.
			11: 111, // wall_t_bottom.
			12: 59, // wall_corner_topRight.
			13: 130, // wall_t_left.
			14: 112, // wall_t_top.
			15: 113  // wall_cross.
		},
		'half_rounded': {
			0: 128,  // wall_isolated.
			1: 148,  // wall_end_bottom.
			2: 166,  // wall_end_left.
			3: 93,  // wall_corner_bottomLeft.
			4: 149,  // wall_end_top.
			5: 75,  // wall_vertical.
			6: 57,  // wall_corner_topLeft.
			7: 129,  // wall_t_right.
			8: 167,  // wall_end_right.
			9: 95,  // wall_corner_bottomRight.
			10: 58, // wall_horizontal.
			11: 111, // wall_t_bottom.
			12: 59, // wall_corner_topRight.
			13: 130, // wall_t_left.
			14: 112, // wall_t_top.
			15: 113  // wall_cross.
		},
		'pipe': {
			0: 128,  // wall_isolated.
			1: 148,  // wall_end_bottom.
			2: 166,  // wall_end_left.
			3: 93,  // wall_corner_bottomLeft.
			4: 149,  // wall_end_top.
			5: [ 75, 77 ],  // wall_vertical.
			6: 57,  // wall_corner_topLeft.
			7: 129,  // wall_t_right.
			8: 167,  // wall_end_right.
			9: 95,  // wall_corner_bottomRight.
			10: [ 58, 94 ], // wall_horizontal.
			11: 111, // wall_t_bottom.
			12: 59, // wall_corner_topRight.
			13: 130, // wall_t_left.
			14: 112, // wall_t_top.
			15: [ 113, 131, 76 ]  // wall_cross.
		},
		'thin': {
			0: 110,  // wall_isolated.
			1: 173,  // wall_end_bottom.
			2: 172,  // wall_end_left.
			3: 164,  // wall_corner_bottomLeft.
			4: 154,  // wall_end_top.
			5: 72,  // wall_vertical.
			6: 146,  // wall_corner_topLeft.
			7: 126,  // wall_t_right.
			8: 155,  // wall_end_right.
			9: 165,  // wall_corner_bottomRight.
			10: 55, // wall_horizontal.
			11: 108, // wall_t_bottom.
			12: 147, // wall_corner_topRight.
			13: 127, // wall_t_left.
			14: 109, // wall_t_top.
			15: 73  // wall_cross.
		},
	};


	/**
	 * Convert a tilemap array to a string.
	 *
	 * This string can be loaded with beep8.Tilemap.load.
	 *
	 * @param {Array} tilemap - The tilemap array to save.
	 * @returns {string} The encoded string
	 */
	beep8.Tilemap.save = function( tilemap ) {

		beep8.Utilities.checkArray( "tilemap", tilemap );

		return beep8.Utilities.encodeData( tilemap );

	}


	/**
	 * Load a tilemap array from a string.
	 *
	 * @param {string} data The encoded string
	 * @returns {Array} The tilemap array
	 */
	beep8.Tilemap.load = function( data ) {

		beep8.Utilities.checkString( "data", data );

		return beep8.Utilities.decodeData( data );

	}


	/**
	 * Draw a tilemap array to the screen.
	 *
	 * @param {Array} tilemap The tilemap array to draw.
	 * @param {number} [tileX=0] The x-coordinate of the tile to start drawing from.
	 * @param {number} [tileY=0] The y-coordinate of the tile to start drawing from.
	 * @param {number} [width=null] The width of the tilemap to draw.
	 * @param {number} [height=null] The height of the tilemap to draw.
	 * @returns {void}
	 */
	beep8.Tilemap.draw = function( tilemap, tileX = 0, tileY = 0, width = null, height = null ) {

		beep8.Utilities.checkArray( "tilemap", tilemap );

		if ( !width ) {
			width = tilemap[ 0 ].length;
		}

		if ( !height ) {
			height = tilemap.length;
		}

		beep8.Utilities.checkInt( "width", width );
		beep8.Utilities.checkInt( "height", height );

		const startRow = beep8.Core.drawState.cursorRow;
		const startCol = beep8.Core.drawState.cursorCol;

		for ( let y = tileY; y < tileY + height; y++ ) {

			// Position the cursor at the start of the row.
			const lx = 0 + startCol;
			const ly = y - tileY + startRow;
			beep8.locate( lx, ly );

			for ( let x = tileX; x < tileX + width; x++ ) {

				if ( !tilemap[ y ] || tilemap[ y ][ x ] == null ) continue;

				const tile = tilemap[ y ][ x ];
				if ( tile && tile.length >= 3 ) {

					beep8.color(
						tile[ beep8.Tilemap.MAP_FG ],
						tile[ beep8.Tilemap.MAP_BG ]
					);

					beep8.printChar( tile[ beep8.Tilemap.MAP_CHAR ] );

				}
			}
		}

	};


	/**
	 * Create an empty tilemap array of the specified size.
	 *
	 * @param {number} width The width of the tilemap.
	 * @param {number} height The height of the tilemap.
	 * @returns {Array} The empty tilemap array.
	 */
	beep8.Tilemap.createEmptyTilemap = function( width, height ) {

		let layout = [];

		for ( let y = 0; y < height; y++ ) {
			layout[ y ] = [];
			for ( let x = 0; x < width; x++ ) {

				layout[ y ][ x ] = beep8.Tilemap.getDefaultTile();

			}
		}

		return layout;

	};


	/**
	 * Shift and wrap a tilemap array by the specified amount.
	 *
	 * @param {Array} tilemap The tilemap array to shift.
	 * @param {number} dx The amount to shift the tilemap in the x direction.
	 * @param {number} dy The amount to shift the tilemap in the y direction.
	 * @returns {void}
	 */
	beep8.Tilemap.shift = function( tilemap, dx, dy ) {

		beep8.Utilities.checkArray( "tilemap", tilemap );
		beep8.Utilities.checkNumber( "dx", dx );
		beep8.Utilities.checkNumber( "dy", dy );

		const width = tilemap[ 0 ].length;
		const height = tilemap.length;

		const newTilemap = beep8.Tilemap.createEmptyTilemap( width, height );

		for ( let y = 0; y < height; y++ ) {
			for ( let x = 0; x < width; x++ ) {

				const newX = ( x + dx + width ) % width;
				const newY = ( y + dy + height ) % height;
				newTilemap[ newY ][ newX ] = [ ...tilemap[ y ][ x ] ];

			}
		}

		return newTilemap;

	};


	/**
	 * Resize a tilemap array to the specified width and height.
	 *
	 * @param {Array} tilemap The tilemap array to resize.
	 * @param {number} width The new width of the tilemap.
	 * @param {number} height The new height of the tilemap.
	 * @returns {Array} The resized tilemap array.
	 */
	beep8.Tilemap.resize = function( tilemap, width, height ) {

		beep8.Utilities.checkArray( "tilemap", tilemap );
		beep8.Utilities.checkNumber( "width", width );
		beep8.Utilities.checkNumber( "height", height );

		const newTilemap = beep8.Tilemap.createEmptyTilemap( width, height );

		for ( let y = 0; y < height; y++ ) {
			for ( let x = 0; x < width; x++ ) {
				if ( tilemap[ y ] && tilemap[ y ][ x ] ) {

					newTilemap[ y ][ x ] = [ ...tilemap[ y ][ x ] ];

				}
			}
		}

		return newTilemap;

	};


	/**
	 * Get the default tile for a tilemap.
	 *
	 * @returns {Array} The default tile.
	 */
	beep8.Tilemap.getDefaultTile = function() {

		return [
			0, // Tile
			15, // Fg
			0, // Bg
			0, // Collision
			{} // Data
		];

	};


	/**
	 * Get a text map and convert it to an array of arrays.
	 *
	 * An example text map might look like:
	 * #######
	 * #  1  #
	 * # ### #
	 * # 2 2 #
	 * #######
	 *
	 * The tilemap array will include the tile character code, foreground color,
	 * background color, collision flag, and additional data.
	 *
	 * @param {string} mapText The text map to convert.
	 * @returns {Array} The converted tilemap array.
	 */
	beep8.Tilemap.convertFromText = function( mapText ) {

		beep8.Utilities.checkString( "text", mapText );

		// Don't trim the text as we want to preserve the whitespace.
		// These may be empty tiles.
		const lines = mapText.split( '\n' );

		// Remove any lines that are just whitespace.
		const filteredLines = lines.filter( line => line.trim() !== '' );
		if ( filteredLines.length === 0 ) beep8.Utilities.fatal( "No valid lines found in the map text." );

		const map = filteredLines.map( row => row.split( '' ) );

		return map;

	}


	/**
	 * Check the validity of the encoded tilemap data.
	 *
	 * The checks are simple, but reduces liklihood of invalid data being used.
	 *
	 * @param {string} mapText The encoded tilemap data.
	 * @returns {boolean} True if the tilemap is valid, false otherwise.
	 */
	beep8.Tilemap.validateTilemap = function( mapText ) {

		beep8.Utilities.checkString( "text", mapText );

		const map = beep8.Tilemap.load( mapText );

		// Check map is an array of arrays.
		if ( !Array.isArray( map ) || !Array.isArray( map[ 0 ] ) ) {
			return false;
		}

		// Check 0, 0 is a valid tile (is an array and length is greater than 3).
		if ( !Array.isArray( map[ 0 ][ 0 ] ) || map[ 0 ][ 0 ].length <= 3 ) {
			return false;
		}

		return true;

	}


	/**
	 * Create a tilemap from an array of arrays.
	 * The tilePattern is an object that maps tile characters to tile properties.
	 *
	 * @param {Array} grid The grid array to create the tilemap from.
	 * @param {Object} tilePattern The tile pattern object.
	 * @returns {Array} The created tilemap array.
	 */
	beep8.Tilemap.createFromArray = function( grid, tilePattern, defaultTilePattern = null ) {

		beep8.Utilities.checkArray( "grid", grid );
		beep8.Utilities.checkObject( "tilePattern", tilePattern );

		if ( defaultTilePattern !== null ) {
			beep8.Utilities.checkObject( "defaultTilePattern", defaultTilePattern );
		}

		if ( null === defaultTilePattern ) {
			defaultTilePattern = beep8.Tilemap.getDefaultTile();
		}

		const tilemap = [];

		for ( let y = 0; y < grid.length; y++ ) {
			tilemap[ y ] = [];
			for ( let x = 0; x < grid[ y ].length; x++ ) {

				// Set default properties.
				tilemap[ y ][ x ] = [ ...defaultTilePattern ];

				// If tile pattern not defined assume tile is empty and continue.
				if ( !tilePattern[ grid[ y ][ x ] ] ) {
					// beep8.Utilities.log( "Tile pattern not found for: " + grid[ y ][ x ] );
					continue;
				}

				const tile = tilePattern[ grid[ y ][ x ] ];

				// Tile character code.
				let tileId = tile.t;

				// If tileId is a string and begins with "wall_" then compute bitmask.
				if ( typeof tileId === "string" && tileId.startsWith( "wall_" ) ) {
					tileId = beep8.Tilemap.wallTile( x, y, grid, tileId );
				}

				// If is an array of ids then do a weighted pick from those.
				if ( Array.isArray( tileId ) ) {
					tileId = beep8.Random.pickWeighted( tileId );
				}

				// Foreground colour.
				let fg = tile.fg || 15;
				if ( Array.isArray( fg ) ) {
					fg = beep8.Random.pickWeighted( fg );
				}

				// Background colour.
				let bg = tile.bg || 0;
				if ( Array.isArray( bg ) ) {
					bg = beep8.Random.pickWeighted( bg );
				}

				tilemap[ y ][ x ] = [
					tileId,
					fg,
					bg,
					tile.coll || 0,
					tile.data || {},
				];

			}
		}

		return tilemap;

	};


	/**
	 * Select a wall tile from a predefined list based on the surrounding tiles.
	 * The grid is the 2D array of tile ids.
	 * The x and y are the coordinates of the tile to check.
	 *
	 * @param {number} x The x coordinate of the tile.
	 * @param {number} y The y coordinate of the tile.
	 * @param {Array} grid The 2D array of tile ids.
	 * @param {string} name The name of the wall tile to select. Picked from the default lists of wall patterns.
	 * @returns {number} The selected wall tile id.
	 */
	beep8.Tilemap.wallTile = function( x, y, grid, name = null ) {

		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		beep8.Utilities.checkArray( "grid", grid );
		beep8.Utilities.checkString( "name", name );

		if ( null === name ) {
			beep8.Utilities.fatal( "Wall tile name not given: " + name );
		}

		// Remove wall_ prefix from name.
		const tileType = name.substring( 5 );

		if ( !wallTiles[ tileType ] ) {
			beep8.Utilities.fatal( "Wall tile type not found: " + tileType );
		}

		const mask = computeBitmask( grid, x, y );
		return wallTiles[ tileType ][ mask ];

	};


	// A helper function to compute a 4-bit bitmask for a wall tile.
	// Bit values: 1 = North, 2 = East, 4 = South, 8 = West.
	function computeBitmask( grid, x, y ) {

		let bitmask = 0;
		const tileId = grid[ y ][ x ];

		// Check North
		if ( y > 0 && grid[ y - 1 ][ x ] === tileId ) bitmask += 1;
		// Check East
		if ( x < grid[ y ].length - 1 && grid[ y ][ x + 1 ] === tileId ) bitmask += 2;
		// Check South
		if ( y < grid.length - 1 && grid[ y + 1 ][ x ] === tileId ) bitmask += 4;
		// Check West
		if ( x > 0 && grid[ y ][ x - 1 ] === tileId ) bitmask += 8;

		return bitmask;

	}


} )( beep8 || ( beep8 = {} ) );

( function( beep8 ) {

	beep8.Utilities = {};


	/**
	 * Shows a fatal error and throws an exception.
	 *
	 * @param {string} error - The error to show.
	 * @throws {Error} The error message.
	 * @returns {void}
	 */
	beep8.Utilities.fatal = function( error ) {

		beep8.Utilities.error( "Fatal error: " + error );

		try {
			beep8.Core.handleCrash( error );
		} catch ( e ) {
			beep8.Utilities.error( "Error in beep8.Core.handleCrash: " + e + " while handling error " + error );
		}

		throw new Error( error );

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
	 * @param {number} [optMin=undefined] - The minimum acceptable value for the variable.
	 * @param {number} [optMax=undefined] - The maximum acceptable value for the variable.
	 * @returns {number} The 'varValue' parameter.
	 */
	beep8.Utilities.checkNumber = function( varName, varValue, optMin = undefined, optMax = undefined ) {

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
	 * Checks that a variable is an integer.
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @returns {number} The 'varValue' parameter.
	 */
	beep8.Utilities.checkInt = function( varName, varValue, optMin, optMax ) {

		beep8.Utilities.checkNumber( varName, varValue, optMin, optMax );

		if ( varValue !== Math.round( varValue ) ) {
			beep8.Utilities.fatal( `${varName} should be an integer but is ${varValue}` );
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

		if ( varValue === null ) {
			beep8.Utilities.fatal( `${varName} should be a function, but was null` );
		}

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
	 * Checks that a variable is set (not undefined or null).
	 *
	 * @param {string} varName - The name of the variable.
	 * @param {any} varValue - The value of the variable.
	 * @returns {any} The 'varValue' parameter.
	 */
	beep8.Utilities.checkIsSet = function( varName, varValue ) {

		beep8.Utilities.assert(
			varValue !== undefined && varValue !== null,
			`${varName} should be set but was: ${varValue}`
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
	 * @returns {void}
	 */
	beep8.Utilities.log = function( msg ) {

		if ( beep8.CONFIG.DEBUG ) {
			console.log( msg );
		}

	}


	/**
	 * Prints a warning to the console.
	 *
	 * @param {string} msg - The message to print.
	 * @returns {void}
	 */
	beep8.Utilities.warn = function( msg ) {

		console.warn( msg );

	}


	/**
	 * Prints an error to the console.
	 *
	 * @param {string} msg - The message to print.
	 * @returns {void}
	 */
	beep8.Utilities.error = function( msg ) {

		console.error( msg );

	}


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
	 * Makes a color transparent in an image.
	 *
	 * This function is asynchronous because it uses an HTMLImageElement.
	 *
	 * Uses a range because I found that occassionally the RGB values of a saved
	 * png are not exactly as they were set in the image. Possibly due to
	 * compression.
	 *
	 * @param {HTMLImageElement} img - The image to process.
	 * @param {array} color - The color to make transparent. By default this is pure magenta [255,0,255].
	 * @param {number} range - The range of RGB values to consider as the target color.
	 * @returns The processed image.
	 */
	beep8.Utilities.makeColorTransparent = async function( img, color = [ 255, 0, 255 ], range = 5 ) {

		// Create a canvas the same size as the image and draw the image on it.
		const canvas = document.createElement( "canvas" );
		const ctx = canvas.getContext( "2d" );

		canvas.width = img.width;
		canvas.height = img.height;

		ctx.drawImage( img, 0, 0 );

		// Get the image data.
		const imageData = ctx.getImageData( 0, 0, canvas.width, canvas.height );
		const data = imageData.data;

		// Loop through the image data and set the alpha channel to 0 for the specified color.
		for ( let i = 0; i < data.length; i += 4 ) {

			const r = data[ i ];
			const g = data[ i + 1 ];
			const b = data[ i + 2 ];

			// Check if the pixel's RGB values are within the range of the target color
			if (
				Math.abs( r - color[ 0 ] ) <= range &&
				Math.abs( g - color[ 1 ] ) <= range &&
				Math.abs( b - color[ 2 ] ) <= range
			) {
				data[ i + 3 ] = 0; // Set alpha to 0 (fully transparent)
			}

		}

		// Put the modified image data back on the canvas.
		ctx.putImageData( imageData, 0, 0 );

		return canvas;

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
	 * Converts a hex color string to an RGB object.
	 *
	 * @param {string} hex - The hex color string (e.g., "#ff0000").
	 * @returns {object} An object with r, g, b properties.
	 */
	beep8.Utilities.hexToRgb = function( hex ) {

		// Remove the "#" if present
		hex = hex.replace( "#", "" );

		// Parse the RGB values
		const bigint = parseInt( hex, 16 );

		return {
			r: ( bigint >> 16 ) & 255, // Extract red
			g: ( bigint >> 8 ) & 255,  // Extract green
			b: bigint & 255          // Extract blue
		};

	}


	/**
	 * Calculates the intersection between two integer number intervals.
	 *
	 * Given 2 ranges it will see if these ranges overlap and if they do it will
	 * optionally return the intersection range.
	 *
	 * For example if the first interval is [1, 5] and the second interval is [3, 7]
	 * the intersection is [3, 5].
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


	/**
	 * Performs a deep merge of objects and returns new object. Does not modify
	 * objects (immutable) and merges arrays via concatenation.
	 *
	 * @param {...object} objects - Objects to merge
	 * @returns {object} New object with merged key/values
	 */
	beep8.Utilities.deepMerge = function( ...objects ) {

		const isObject = obj => obj && typeof obj === 'object';

		return objects.reduce(
			( prev, obj ) => {
				Object.keys( obj ).forEach(
					( key ) => {

						const existingValue = prev[ key ];
						const newValue = obj[ key ];

						if ( Array.isArray( existingValue ) && Array.isArray( newValue ) ) {
							prev[ key ] = existingValue.concat( ...newValue );
						}
						else if ( isObject( existingValue ) && isObject( newValue ) ) {
							prev[ key ] = beep8.Utilities.deepMerge( existingValue, newValue );
						}
						else {
							prev[ key ] = newValue;
						}
					}
				);

				return prev;
			},
			{}
		);

	}


	/**
	 * Deep merge objects and returns new object. Does not modify objects.
	 * Merges arrays by index.
	 *
	 * @param {...object} objects - Objects to merge
	 * @returns {object} New object with merged key/values
	 */
	beep8.Utilities.deepMergeByIndex = function( ...objects ) {

		const isObject = obj => obj && typeof obj === 'object';

		return objects.reduce(
			( prev, obj ) => {
				Object.keys( obj ).forEach(
					( key ) => {

						const existingValue = prev[ key ];
						const newValue = obj[ key ];

						if ( Array.isArray( existingValue ) && Array.isArray( newValue ) ) {
							prev[ key ] = mergeArraysByIndex( existingValue, newValue );
						}
						else if ( isObject( existingValue ) && isObject( newValue ) ) {
							prev[ key ] = beep8.Utilities.deepMergeByIndex( existingValue, newValue );
						}
						else {
							prev[ key ] = newValue;
						}
					}
				);
				return prev;
			},
			{}
		);
	};


	/**
	 * Pads a number with leading zeros to the specified length.
	 *
	 * Does not support negative numbers.
	 *
	 * @param {number} number - The number to pad.
	 * @param {number} length - The desired length of the output string.
	 * @returns {string} - The padded number as a string.
	 */
	beep8.Utilities.padWithZeros = function( number, length ) {

		beep8.Utilities.checkNumber( "number", number );
		beep8.Utilities.checkInt( "length", length );

		if ( number < 0 ) {
			beep8.Utilities.fatal( "padWithZeros does not support negative numbers" );
		}

		return number.toString().padStart( length, '0' );

	}


	/**
	 * Generate a new custom event.
	 *
	 * @param {string} eventName - The name of the event.
	 * @param {Object} [detail={}] - The event detail.
	 * @param {EventTarget} [target=document] - The target of the event.
	 * @returns {void}
	 */
	beep8.Utilities.event = function( eventName, detail = {}, target = document ) {

		beep8.Utilities.checkString( "eventName", eventName );
		beep8.Utilities.checkObject( "detail", detail );
		beep8.Utilities.checkObject( "target", target );

		// Prefix event name with beep8.
		eventName = `beep8.${eventName}`;

		// Create a custom event.
		const event = new CustomEvent( eventName, { detail } );

		// Dispatch the event.
		target.dispatchEvent( event );

	};


	/**
	 * Utility function to repeat an array a specified number of times.
	 *
	 * @param {Array} array - The array to repeat.
	 * @param {number} times - The number of times to repeat the array.
	 * @returns {Array} The repeated array.
	 */
	beep8.Utilities.repeatArray = function( array, times ) {

		beep8.Utilities.checkArray( "array", array );
		beep8.Utilities.checkInt( "times", times, 0 );

		return Array( times ).fill().flatMap( () => array );

	};


	/**
	 * Downloads a file.
	 *
	 * @param {string} filename - The name of the file.
	 * @param {string} src - The source URL of the file.
	 * @returns {void}
	 */
	beep8.Utilities.downloadFile = function( filename = '', src = '' ) {

		beep8.Utilities.checkString( "filename", filename );
		beep8.Utilities.checkString( "src", src );

		// Create a link element to use to download the image.
		const element = document.createElement( 'a' );
		element.setAttribute( 'href', src );
		element.setAttribute( 'download', filename );

		// Append the element to the body.
		document.body.appendChild( element );

		// Click the link to download.
		element.click();

		// Tidy up.
		document.body.removeChild( element );

	};


	/**
	 * Encodes data using CBOR and Base64.
	 *
	 * @param {any} data - The data to encode.
	 * @returns {string} The encoded data as a Base64 string.
	 */
	beep8.Utilities.encodeData = function( data ) {

		const cborString = CBOR.encode( data );
		const encodedString = btoa( String.fromCharCode.apply( null, new Uint8Array( cborString ) ) );
		return encodedString;

	};


	/**
	 * Decodes data from a Base64 string using CBOR.
	 *
	 * @param {string} data - The Base64 encoded data.
	 * @returns {any} The decoded data.
	 */
	beep8.Utilities.decodeData = function( data ) {

		// Step 1: Decode the Base64 string back to a binary string
		const binaryString = atob( data );

		// Step 2: Convert the binary string to a Uint8Array
		const byteArray = new Uint8Array( binaryString.length );
		for ( let i = 0; i < binaryString.length; i++ ) {
			byteArray[ i ] = binaryString.charCodeAt( i );
		}

		// Step 3: Convert the Uint8Array to an ArrayBuffer
		const arrayBuffer = byteArray.buffer;

		// Step 4: Use CBOR.decode to convert the byte array back to the original data structure
		return CBOR.decode( arrayBuffer );

	};


	/**
	 * Merges two arrays by index, filling in missing indices with values from
	 * the default array.
	 *
	 * @param {Array} targetArr - The target array to merge into.
	 * @param {Array} defaultArr - The default array to merge from.
	 * @returns {Array} The merged array.
	 */
	function mergeArraysByIndex( Arr1, Arr2 ) {

		for ( let i = 0; i < Arr2.length; i++ ) {
			Arr1[ i ] = Arr2[ i ];
		}

		return Arr1;

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

	let repeatIntervals = null;

	const VJOY_HTML = `
<div class="vjoy-options">
	<button id='vjoy-button-ter' class='vjoy-button'>Start</button>
	<button id='vjoy-button-screenshot' class='vjoy-button'>Snap</button>
</div>
<div class="vjoy-controls">
	<div class="vjoy-dpad">
	<button id='vjoy-button-up' class='vjoy-button'><span>U</span></button>
	<button id='vjoy-button-right' class='vjoy-button'><span>R</span></button>
	<button id='vjoy-button-left' class='vjoy-button'><span>L</span></button>
	<button id='vjoy-button-down' class='vjoy-button'><span>D</span></button>
	</div>
	<div class="vjoy-buttons">
	<button id='vjoy-button-pri' class='vjoy-button'><span>A</span></button>
	<button id='vjoy-button-sec' class='vjoy-button'><span>B</span></button>
	</div>
</div>`;


	/**
	 * The CSS for the virtual joystick.
	 *
	 * @type {string}
	 */
	const VJOY_CSS = `
:root {
	--b8-vjoy-button-color: #333;
	--b8-vjoy-button-size: 14vw;
	--b8-vjoy-button-dpad-size: calc(var(--b8-vjoy-button-size) * 2);
	--b8-console-radius: 2rem;
	--b8-border-radius: calc(var(--b8-vjoy-button-dpad-size) / 5);
}

.vjoy-container,
.vjoy-container * {
	box-sizing: border-box;
	user-select: none;
	-webkit-user-select: none;
	-webkit-touch-callout: none;
	touch-action: none;
}

.vjoy-container {
	position: relative;
	width: 100%;
	padding: 8vw 4vw 8vw 6vw;
	background: deeppink;
	border-radius: 0 0 var(--b8-console-radius) var(--b8-console-radius);
}

.vjoy-options {
	border-radius: 5rem;
	position: absolute;
	display: flex;
	gap: 2vw;
	align-items: center;
	padding: 2vw;
	border-radius: 2rem;
	background: inherit;
	top: -4vw;
	left: 50%;
	transform: translateX(-50%);
}

.vjoy-controls {
	display: flex;
	gap: 5vw;
	justify-content: space-between;
	align-items: center;
}

.vjoy-dpad {
	aspect-ratio: 1;
	max-width: 10rem;
	width: var(--b8-vjoy-button-dpad-size);
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr 1fr;
	flex-wrap: wrap;
	transform: rotate(45deg);
	border-radius: var(--b8-border-radius);
	background:black;
	gap: 1px;
	border: 2px solid black;
}

.vjoy-dpad button {
	width: 100%;
	height: 100%;
	position: relative;
}
.vjoy-dpad button span {
	transform: rotate(-45deg);
}
.vjoy-dpad button:after {
	position: absolute;
	content: '';
	display: block;
	width: 100%;
	height: 100%;
	background: rgba(0,0,0,0);
	transform: rotate(-45deg);
}

#vjoy-button-up {
	border-radius: var(--b8-border-radius) 0 0 0;
}
#vjoy-button-down {
	border-radius: 0 0 var(--b8-border-radius) 0;
}
#vjoy-button-left {
	border-radius: 0 0 0 var(--b8-border-radius);
}
#vjoy-button-right {
	border-radius: 0 var(--b8-border-radius) 0 0;
}

#vjoy-button-up:after {
	transform: rotate(-45deg) translateY(-30%) scale(1.1);
}
#vjoy-button-down:after {
	transform: rotate(-45deg) translateY(30%) scale(1.1);
}
#vjoy-button-left:after {
	transform: rotate(-45deg) translateX(-30%) scale(1.1);
}
#vjoy-button-right:after {
	transform: rotate(-45deg) translateX(30%) scale(1.1);
}

.vjoy-buttons {
	display: flex;
	gap: 2vw;
	transform: rotate(-45deg);
	border: 0.8vw solid rgba(0,0,0,0.2);
	border-radius: calc( var(--b8-border-radius) + 1vw );
	padding: 1vw;
}

.vjoy-buttons button {
	width: var(--b8-vjoy-button-size);
	max-width: 5rem;
	max-height: 5rem;
	height: var(--b8-vjoy-button-size);
	border-radius: var(--b8-border-radius);
	touch-action: none;
	border: 2px solid black;
	position: relative;
}

.vjoy-buttons button:after {
	position: absolute;
	content: '';
	display: block;
	width: 100%;
	height: 100%;
	background: rgba(0,0,0,0);
	transform: scale(1.2);
}

.vjoy-buttons button span {
	transform: rotate(45deg);
}

.vjoy-button {
	background: var(--b8-vjoy-button-color) !important;
	border: none;
	font-family: arial, sans-serif;
	font-size: 12px;
	font-weight: 600;
	color: #aaa !important;
	user-select: none;
	touch-callout: none;
	-webkit-user-select: none;
	-webkit-touch-callout: none;
	text-shadow: 0 -2px 0 black;
	padding: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	letter-spacing: 0.1em;
	text-transform: uppercase;
}

.vjoy-button:hover,
.vjoy-button:focus,
.vjoy-button:active {
	background: black;
	outline: none;
}

#vjoy-button-screenshot,
#vjoy-button-ter {
	width: calc(var(--b8-vjoy-button-size) * 1.4);
	padding: 1vw;
	border-radius: 1rem;
}
`;

	/**
	 * Sets up the virtual joystick.
	 *
	 * @returns {void}
	 */
	beep8.Joystick.setup = function() {

		beep8.Utilities.log( "Setting up virtual joystick..." );

		// Add controller styles.
		const styleEl = document.createElement( "style" );
		styleEl.setAttribute( "type", "text/css" );
		styleEl.innerText = VJOY_CSS;
		document.body.appendChild( styleEl );

		// Create a container element
		const container = document.createElement( 'div' );
		container.className = 'vjoy-container';
		container.innerHTML = VJOY_HTML;

		beep8.Core.getBeepContainerEl().appendChild( container );

		setTimeout( beep8.Joystick.continueSetup, 10 );

	}


	/**
	 * Continues setting up the virtual joystick.
	 *
	 * @returns {void}
	 */
	beep8.Joystick.continueSetup = function() {

		beep8.Joystick.setUpButton( "vjoy-button-up", "ArrowUp" );
		beep8.Joystick.setUpButton( "vjoy-button-down", "ArrowDown" );
		beep8.Joystick.setUpButton( "vjoy-button-left", "ArrowLeft" );
		beep8.Joystick.setUpButton( "vjoy-button-right", "ArrowRight" );
		beep8.Joystick.setUpButton( "vjoy-button-pri", "ButtonA" );
		beep8.Joystick.setUpButton( "vjoy-button-sec", "ButtonB" );
		beep8.Joystick.setUpButton( "vjoy-button-ter", "Enter" );
		beep8.Joystick.setUpButton( "vjoy-button-screenshot", "0" );

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

		[ "pointerdown", "pointerstart" ].forEach( eventName => {
			button.addEventListener(
				eventName,
				( e ) => {
					e.preventDefault();
					beep8.Joystick.handleButtonEvent( buttonKeyName, true, e );
				},
				{ passive: false }
			);
		} );

		// Cancel the button press if the pointer moves off the button.
		[ "pointerout", "pointerup", "pointerleave" ].forEach( eventName => {
			button.addEventListener(
				eventName,
				( e ) => beep8.Joystick.handleButtonEvent( buttonKeyName, false, e )
			);
		} );

		button.addEventListener(
			"pointermove",
			( e ) => {
				// Prevent default behavior for pointermove events.
				e.preventDefault();
			},
			{ passive: false }
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

		// Add key property to event.
		evt.key = buttonKeyName;

		// Initialize repeat intervals container if not already created.
		if ( !repeatIntervals ) {
			repeatIntervals = {};
		}

		if ( down ) {

			// Call onKeyDown immediately.
			beep8.Input.onKeyDown( evt );

			// If no timer exists for this button, start one.
			if ( !repeatIntervals[ buttonKeyName ] ) {
				repeatIntervals[ buttonKeyName ] = {};

				// Set a timeout for the initial delay.
				repeatIntervals[ buttonKeyName ].initialTimeout = setTimeout(
					function() {
						// After the delay, start repeating.
						repeatIntervals[ buttonKeyName ].interval = setInterval(
							function() {
								beep8.Input.onKeyDown( evt );
							},
							150
						);
					},
					150
				);
			}

		} else {

			// Clear any timers if they exist.
			if ( repeatIntervals[ buttonKeyName ] ) {
				if ( repeatIntervals[ buttonKeyName ].initialTimeout ) {
					clearTimeout( repeatIntervals[ buttonKeyName ].initialTimeout );
				}
				if ( repeatIntervals[ buttonKeyName ].interval ) {
					clearInterval( repeatIntervals[ buttonKeyName ].interval );
				}
				delete repeatIntervals[ buttonKeyName ];
			}

			beep8.Input.onKeyUp( evt );

		}

		evt.preventDefault();

	}

} )( beep8 || ( beep8 = {} ) );

/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Patrick Gansterer <paroga@paroga.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

( function( global, undefined ) {
	"use strict";
	var POW_2_24 = Math.pow( 2, -24 ),
		POW_2_32 = Math.pow( 2, 32 ),
		POW_2_53 = Math.pow( 2, 53 );

	function encode( value ) {
		var data = new ArrayBuffer( 256 );
		var dataView = new DataView( data );
		var lastLength;
		var offset = 0;

		function ensureSpace( length ) {
			var newByteLength = data.byteLength;
			var requiredLength = offset + length;
			while ( newByteLength < requiredLength )
				newByteLength *= 2;
			if ( newByteLength !== data.byteLength ) {
				var oldDataView = dataView;
				data = new ArrayBuffer( newByteLength );
				dataView = new DataView( data );
				var uint32count = ( offset + 3 ) >> 2;
				for ( var i = 0; i < uint32count; ++i )
					dataView.setUint32( i * 4, oldDataView.getUint32( i * 4 ) );
			}

			lastLength = length;
			return dataView;
		}
		function write() {
			offset += lastLength;
		}
		function writeFloat64( value ) {
			write( ensureSpace( 8 ).setFloat64( offset, value ) );
		}
		function writeUint8( value ) {
			write( ensureSpace( 1 ).setUint8( offset, value ) );
		}
		function writeUint8Array( value ) {
			var dataView = ensureSpace( value.length );
			for ( var i = 0; i < value.length; ++i )
				dataView.setUint8( offset + i, value[ i ] );
			write();
		}
		function writeUint16( value ) {
			write( ensureSpace( 2 ).setUint16( offset, value ) );
		}
		function writeUint32( value ) {
			write( ensureSpace( 4 ).setUint32( offset, value ) );
		}
		function writeUint64( value ) {
			var low = value % POW_2_32;
			var high = ( value - low ) / POW_2_32;
			var dataView = ensureSpace( 8 );
			dataView.setUint32( offset, high );
			dataView.setUint32( offset + 4, low );
			write();
		}
		function writeTypeAndLength( type, length ) {
			if ( length < 24 ) {
				writeUint8( type << 5 | length );
			} else if ( length < 0x100 ) {
				writeUint8( type << 5 | 24 );
				writeUint8( length );
			} else if ( length < 0x10000 ) {
				writeUint8( type << 5 | 25 );
				writeUint16( length );
			} else if ( length < 0x100000000 ) {
				writeUint8( type << 5 | 26 );
				writeUint32( length );
			} else {
				writeUint8( type << 5 | 27 );
				writeUint64( length );
			}
		}

		function encodeItem( value ) {
			var i;

			if ( value === false )
				return writeUint8( 0xf4 );
			if ( value === true )
				return writeUint8( 0xf5 );
			if ( value === null )
				return writeUint8( 0xf6 );
			if ( value === undefined )
				return writeUint8( 0xf7 );

			switch ( typeof value ) {
				case "number":
					if ( Math.floor( value ) === value ) {
						if ( 0 <= value && value <= POW_2_53 )
							return writeTypeAndLength( 0, value );
						if ( -POW_2_53 <= value && value < 0 )
							return writeTypeAndLength( 1, -( value + 1 ) );
					}
					writeUint8( 0xfb );
					return writeFloat64( value );

				case "string":
					var utf8data = [];
					for ( i = 0; i < value.length; ++i ) {
						var charCode = value.charCodeAt( i );
						if ( charCode < 0x80 ) {
							utf8data.push( charCode );
						} else if ( charCode < 0x800 ) {
							utf8data.push( 0xc0 | charCode >> 6 );
							utf8data.push( 0x80 | charCode & 0x3f );
						} else if ( charCode < 0xd800 ) {
							utf8data.push( 0xe0 | charCode >> 12 );
							utf8data.push( 0x80 | ( charCode >> 6 ) & 0x3f );
							utf8data.push( 0x80 | charCode & 0x3f );
						} else {
							charCode = ( charCode & 0x3ff ) << 10;
							charCode |= value.charCodeAt( ++i ) & 0x3ff;
							charCode += 0x10000;

							utf8data.push( 0xf0 | charCode >> 18 );
							utf8data.push( 0x80 | ( charCode >> 12 ) & 0x3f );
							utf8data.push( 0x80 | ( charCode >> 6 ) & 0x3f );
							utf8data.push( 0x80 | charCode & 0x3f );
						}
					}

					writeTypeAndLength( 3, utf8data.length );
					return writeUint8Array( utf8data );

				default:
					var length;
					if ( Array.isArray( value ) ) {
						length = value.length;
						writeTypeAndLength( 4, length );
						for ( i = 0; i < length; ++i )
							encodeItem( value[ i ] );
					} else if ( value instanceof Uint8Array ) {
						writeTypeAndLength( 2, value.length );
						writeUint8Array( value );
					} else {
						var keys = Object.keys( value );
						length = keys.length;
						writeTypeAndLength( 5, length );
						for ( i = 0; i < length; ++i ) {
							var key = keys[ i ];
							encodeItem( key );
							encodeItem( value[ key ] );
						}
					}
			}
		}

		encodeItem( value );

		if ( "slice" in data )
			return data.slice( 0, offset );

		var ret = new ArrayBuffer( offset );
		var retView = new DataView( ret );
		for ( var i = 0; i < offset; ++i )
			retView.setUint8( i, dataView.getUint8( i ) );
		return ret;
	}

	function decode( data, tagger, simpleValue ) {
		var dataView = new DataView( data );
		var offset = 0;

		if ( typeof tagger !== "function" )
			tagger = function( value ) { return value; };
		if ( typeof simpleValue !== "function" )
			simpleValue = function() { return undefined; };

		function read( value, length ) {
			offset += length;
			return value;
		}
		function readArrayBuffer( length ) {
			return read( new Uint8Array( data, offset, length ), length );
		}
		function readFloat16() {
			var tempArrayBuffer = new ArrayBuffer( 4 );
			var tempDataView = new DataView( tempArrayBuffer );
			var value = readUint16();

			var sign = value & 0x8000;
			var exponent = value & 0x7c00;
			var fraction = value & 0x03ff;

			if ( exponent === 0x7c00 )
				exponent = 0xff << 10;
			else if ( exponent !== 0 )
				exponent += ( 127 - 15 ) << 10;
			else if ( fraction !== 0 )
				return fraction * POW_2_24;

			tempDataView.setUint32( 0, sign << 16 | exponent << 13 | fraction << 13 );
			return tempDataView.getFloat32( 0 );
		}
		function readFloat32() {
			return read( dataView.getFloat32( offset ), 4 );
		}
		function readFloat64() {
			return read( dataView.getFloat64( offset ), 8 );
		}
		function readUint8() {
			return read( dataView.getUint8( offset ), 1 );
		}
		function readUint16() {
			return read( dataView.getUint16( offset ), 2 );
		}
		function readUint32() {
			return read( dataView.getUint32( offset ), 4 );
		}
		function readUint64() {
			return readUint32() * POW_2_32 + readUint32();
		}
		function readBreak() {
			if ( dataView.getUint8( offset ) !== 0xff )
				return false;
			offset += 1;
			return true;
		}
		function readLength( additionalInformation ) {
			if ( additionalInformation < 24 )
				return additionalInformation;
			if ( additionalInformation === 24 )
				return readUint8();
			if ( additionalInformation === 25 )
				return readUint16();
			if ( additionalInformation === 26 )
				return readUint32();
			if ( additionalInformation === 27 )
				return readUint64();
			if ( additionalInformation === 31 )
				return -1;
			throw "Invalid length encoding";
		}
		function readIndefiniteStringLength( majorType ) {
			var initialByte = readUint8();
			if ( initialByte === 0xff )
				return -1;
			var length = readLength( initialByte & 0x1f );
			if ( length < 0 || ( initialByte >> 5 ) !== majorType )
				throw "Invalid indefinite length element";
			return length;
		}

		function appendUtf16data( utf16data, length ) {
			for ( var i = 0; i < length; ++i ) {
				var value = readUint8();
				if ( value & 0x80 ) {
					if ( value < 0xe0 ) {
						value = ( value & 0x1f ) << 6
							| ( readUint8() & 0x3f );
						length -= 1;
					} else if ( value < 0xf0 ) {
						value = ( value & 0x0f ) << 12
							| ( readUint8() & 0x3f ) << 6
							| ( readUint8() & 0x3f );
						length -= 2;
					} else {
						value = ( value & 0x0f ) << 18
							| ( readUint8() & 0x3f ) << 12
							| ( readUint8() & 0x3f ) << 6
							| ( readUint8() & 0x3f );
						length -= 3;
					}
				}

				if ( value < 0x10000 ) {
					utf16data.push( value );
				} else {
					value -= 0x10000;
					utf16data.push( 0xd800 | ( value >> 10 ) );
					utf16data.push( 0xdc00 | ( value & 0x3ff ) );
				}
			}
		}

		function decodeItem() {
			var initialByte = readUint8();
			var majorType = initialByte >> 5;
			var additionalInformation = initialByte & 0x1f;
			var i;
			var length;

			if ( majorType === 7 ) {
				switch ( additionalInformation ) {
					case 25:
						return readFloat16();
					case 26:
						return readFloat32();
					case 27:
						return readFloat64();
				}
			}

			length = readLength( additionalInformation );
			if ( length < 0 && ( majorType < 2 || 6 < majorType ) )
				throw "Invalid length";

			switch ( majorType ) {
				case 0:
					return length;
				case 1:
					return -1 - length;
				case 2:
					if ( length < 0 ) {
						var elements = [];
						var fullArrayLength = 0;
						while ( ( length = readIndefiniteStringLength( majorType ) ) >= 0 ) {
							fullArrayLength += length;
							elements.push( readArrayBuffer( length ) );
						}
						var fullArray = new Uint8Array( fullArrayLength );
						var fullArrayOffset = 0;
						for ( i = 0; i < elements.length; ++i ) {
							fullArray.set( elements[ i ], fullArrayOffset );
							fullArrayOffset += elements[ i ].length;
						}
						return fullArray;
					}
					return readArrayBuffer( length );
				case 3:
					var utf16data = [];
					if ( length < 0 ) {
						while ( ( length = readIndefiniteStringLength( majorType ) ) >= 0 )
							appendUtf16data( utf16data, length );
					} else
						appendUtf16data( utf16data, length );
					return String.fromCharCode.apply( null, utf16data );
				case 4:
					var retArray;
					if ( length < 0 ) {
						retArray = [];
						while ( !readBreak() )
							retArray.push( decodeItem() );
					} else {
						retArray = new Array( length );
						for ( i = 0; i < length; ++i )
							retArray[ i ] = decodeItem();
					}
					return retArray;
				case 5:
					var retObject = {};
					for ( i = 0; i < length || length < 0 && !readBreak(); ++i ) {
						var key = decodeItem();
						retObject[ key ] = decodeItem();
					}
					return retObject;
				case 6:
					return tagger( decodeItem(), length );
				case 7:
					switch ( length ) {
						case 20:
							return false;
						case 21:
							return true;
						case 22:
							return null;
						case 23:
							return undefined;
						default:
							return simpleValue( length );
					}
			}
		}

		var ret = decodeItem();
		if ( offset !== data.byteLength )
			throw "Remaining bytes";
		return ret;
	}

	var obj = { encode: encode, decode: decode };

	if ( typeof define === "function" && define.amd )
		define( "cbor/cbor", obj );
	else if ( !global.CBOR )
		global.CBOR = obj;

} )( this );

( function() {

	// AudioContext.
	const audioCtx = new AudioContext();

	// Master gain node for volume control.
	const masterGain = audioCtx.createGain();
	masterGain.gain.value = 1;  // default volume (0.0–1.0)
	masterGain.connect( audioCtx.destination );

	// Cache for generated note buffers.
	const noteBuffers = {};

	// Scheduler variables.
	let schedulerInterval = null;
	let schedules = []; // Array of event arrays per track.
	let schedulePointers = []; // Next event index per track.
	let playbackStartTime = 0; // When playback starts.
	let tempo = 125; // Default tempo.
	const lookaheadTime = 0.5; // Only schedule events within the next 0.5 seconds.
	const schedulerIntervalMs = 50; // Check every 50ms.
	const volumeMultiplier = 0.1; // Volume multiplier.

	// iOS audio unlock flag.
	let unlocked = false;

	// -----------------------------
	// Instrument synthesis functions.
	// -----------------------------
	const sineComponent = ( x, offset ) => Math.sin( x * 6.28 + offset );

	const pianoWaveform = ( x ) => {
		return sineComponent( x, Math.pow( sineComponent( x, 0 ), 2 ) +
			sineComponent( x, 0.25 ) * 0.75 +
			sineComponent( x, 0.5 ) * 0.1 ) * volumeMultiplier;
	}

	const piano2WaveForm = ( x ) => {
		return ( Math.sin( x * 6.28 ) * Math.sin( x * 3.14 ) ) * volumeMultiplier;
	}
	const sineWaveform = ( x ) => {
		return Math.sin( 2 * Math.PI * x ) * volumeMultiplier;
	}
	const squareWaveform = ( x ) => {
		return ( Math.sin( 2 * Math.PI * x ) >= 0 ? 1 : -1 ) * volumeMultiplier;
	}
	const sawtoothWaveform = ( x ) => {
		let t = x - Math.floor( x );
		return ( 2 * t - 1 ) * volumeMultiplier;
	};
	const triangleWaveform = ( x ) => {
		let t = x - Math.floor( x );
		return ( 2 * Math.abs( 2 * t - 1 ) - 1 ) * volumeMultiplier;
	};
	const drumWaveform = ( x ) => {
		return ( ( Math.random() * 2 - 1 ) * Math.exp( -x / 10 ) ) * volumeMultiplier;
	};
	const softDrumWaveform = ( x ) => {
		return ( Math.sin( x * 2 ) + 0.3 * ( Math.random() - 0.5 ) ) *
			Math.exp( -x / 15 ) * volumeMultiplier * 2;
	};

	// Mapping of instrument ids to synthesis functions.
	// 0: Piano, 1: Piano 2, 2: Sine, 3: Sawtooth, 4: Square, 5: Triangle, 6: Drum, 7: Soft Drum
	const instrumentMapping = [
		pianoWaveform,
		piano2WaveForm,
		sineWaveform,
		sawtoothWaveform,
		squareWaveform,
		triangleWaveform,
		drumWaveform,
		softDrumWaveform,
	];

	// -----------------------------
	// Main Music Player Function (p1)
	// -----------------------------
	/**
	 * Use as a tag template literal:
	 *
	 *     p1`
	 *     0|f  dh   d T-X   X  T    X X V|
	 *     1|Y   Y Y Y Y Y Y Y   Y Y Y Y Y Y|
	 *     0|V   X   T   T   c   c   T   X|
	 *     0|c fVa a-   X T R  aQT Ta   RO- X|
	 *     [70.30]
	 *     `
	 */
	function p1( params ) {

		if ( Array.isArray( params ) ) {
			params = params[ 0 ];
		}
		if ( !params || params.trim() === '' ) {
			p1.stop();
			return;
		}

		if ( noteBuffers.length > 200 ) {
			console.warn( "Beep8.Music: Note buffers exceeded limit, clearing old buffers." );
			noteBuffers = {};
		}

		// Reset defaults.
		tempo = 125;
		let baseNoteDuration = 0.5; // seconds per note.
		schedules = [];

		// Split input into lines.
		const rawLines = params.split( '\n' ).map( line => line.trim() );
		let noteInterval = tempo / 1000; // seconds per note step.

		// Regular expression for track lines: instrument|track data|
		const trackLineRegex = /^([0-9])\|(.*)\|$/;

		rawLines.forEach( line => {
			if ( !line ) return;

			// Tempo/note duration lines.
			if ( ( line.startsWith( '[' ) && line.endsWith( ']' ) ) || ( /^\d+(\.\d+)?$/.test( line ) ) ) {
				const timing = line.replace( /[\[\]]/g, '' ).split( '.' );
				tempo = parseFloat( timing[ 0 ] ) || tempo;
				baseNoteDuration = ( parseFloat( timing[ 1 ] ) || 50 ) / 100;
				noteInterval = tempo / 1000;
				return;
			}

			// Track lines.
			if ( !trackLineRegex.test( line ) ) {
				console.error( "Track lines must be in the format 'instrument|track data|': " + line );
				return;
			}

			const match = line.match( trackLineRegex );
			const instrumentId = parseInt( match[ 1 ], 10 );
			const instrumentFn = instrumentMapping[ instrumentId ] || instrumentMapping[ 0 ];
			const trackData = match[ 2 ].trim();

			let events = [];
			// Parse trackData character by character.
			for ( let i = 0; i < trackData.length; i++ ) {
				const char = trackData[ i ];
				let dashCount = 1;
				while ( i + dashCount < trackData.length && trackData[ i + dashCount ] === '-' ) {
					dashCount++;
				}
				let eventTime = i * noteInterval;
				if ( char === ' ' ) {
					events.push( { startTime: eventTime, noteBuffer: null } );
					i += dashCount - 1;
					continue;
				}
				let noteValue = char.charCodeAt( 0 );
				noteValue -= noteValue > 90 ? 71 : 65;
				let noteDuration = dashCount * baseNoteDuration * ( tempo / 125 );
				let noteBuffer = createNoteBuffer( noteValue, noteDuration, 44100, instrumentFn );
				events.push( { startTime: eventTime, noteBuffer: noteBuffer } );
				i += dashCount - 1;
			}
			schedules.push( events );
		} );

		// Initialize schedule pointers and calculate loop duration.
		schedulePointers = schedules.map( () => 0 );
		playbackStartTime = audioCtx.currentTime + 0.1;

		p1.stop();
		schedulerInterval = setInterval( schedulerFunction, schedulerIntervalMs );
	}


	/**
	 * The scheduler function ensures the notes are played at the right time.
	 *
	 * This function is called every 50ms to check if any notes need to be played.
	 *
	 * The scheduler keeps track of the current time and the current note interval.
	 * It then checks each track to see if a note needs to be played.
	 *
	 * @returns {void}
	 */
	function schedulerFunction() {

		const currentTime = audioCtx.currentTime;
		const noteInterval = tempo / 1000; // note duration in seconds
		// Use the larger of the fixed lookahead and the current note interval.
		const effectiveLookahead = Math.max( lookaheadTime, noteInterval );
		schedules.forEach( ( events, trackIndex ) => {
			let pointer = schedulePointers[ trackIndex ];
			const trackLength = events.length;
			if ( trackLength === 0 ) return;
			const step = pointer % trackLength;
			const loopCount = Math.floor( pointer / trackLength );
			const eventTime = playbackStartTime + ( step * noteInterval ) + ( loopCount * trackLength * noteInterval );
			if ( eventTime < currentTime + effectiveLookahead ) {
				const event = events[ step ];
				if ( event.noteBuffer ) {
					playNoteBuffer( event.noteBuffer, audioCtx, eventTime );
				}
				schedulePointers[ trackIndex ]++;
			}
		} );
		if ( !p1.loop ) {
			const done = schedules.every( ( events, i ) => schedulePointers[ i ] >= events.length );
			if ( done ) {
				p1.stop();
			}
		}
	}


	/**
	 * Stop playback by clearing the scheduler and stopping all playing sources.
	 */
	p1.stop = function() {
		if ( schedulerInterval !== null ) {
			clearInterval( schedulerInterval );
			schedulerInterval = null;
		}
		playingSources.forEach( source => source.stop() );
		playingSources = [];
	};


	/**
	 * Check if music is currently playing.
	 */
	p1.isPlaying = function() {
		return schedulerInterval !== null;
	};


	/**
	 * Set the tempo (in BPM).
	 */
	p1.setTempo = function( newTempo ) {
		if ( newTempo < 50 ) newTempo = 50;

		// Calculate old and new note intervals in seconds.
		const oldNoteInterval = tempo / 1000;
		const newNoteInterval = newTempo / 1000;

		// Determine how much time has elapsed since playback started.
		const elapsed = audioCtx.currentTime - playbackStartTime;

		// Compute the current note position (could be fractional).
		const currentIndex = elapsed / oldNoteInterval;

		// Rebase playbackStartTime so that the currentIndex now corresponds to the current time.
		playbackStartTime = audioCtx.currentTime - currentIndex * newNoteInterval;

		// Finally, update the tempo.
		tempo = newTempo;
	};

	p1.setVolume = function( value ) {
		// clamp 0.0–1.0
		masterGain.gain.value = Math.min( 1, Math.max( 0, value ) );
	};


	p1.clearCache = function() {
		noteBuffers = {};
	};


	// Loop property: set to true to repeat playback.
	p1.loop = true;

	/**
	 * Create an audio buffer for a given note.
	 */
	const createNoteBuffer = ( note, durationSeconds, sampleRate, instrumentFn ) => {
		const key = note + '-' + durationSeconds + '-' + instrumentFn.name;
		let buffer = noteBuffers[ key ];
		if ( note >= 0 && !buffer ) {
			const frequencyFactor = 65.406 * Math.pow( 1.06, note ) / sampleRate;
			const totalSamples = Math.floor( sampleRate * durationSeconds );
			const attackSamples = 88;
			const decaySamples = sampleRate * ( durationSeconds - 0.002 );
			buffer = noteBuffers[ key ] = audioCtx.createBuffer( 1, totalSamples, sampleRate );
			const channelData = buffer.getChannelData( 0 );
			for ( let i = 0; i < totalSamples; i++ ) {
				let amplitude;
				if ( i < attackSamples ) {
					amplitude = i / ( attackSamples + 0.2 );
				} else {
					amplitude = Math.pow(
						1 - ( ( i - attackSamples ) / decaySamples ),
						Math.pow( Math.log( 1e4 * frequencyFactor ) / 2, 2 )
					);
				}
				channelData[ i ] = amplitude * instrumentFn( i * frequencyFactor );
			}
			// Unlock audio on iOS if needed.
			if ( !unlocked ) {
				playNoteBuffer( buffer, audioCtx, audioCtx.currentTime, true );
				unlocked = true;
			}
		}
		return buffer;
	};

	// Array to keep track of currently playing sources.
	let playingSources = [];


	/**
	 * Play an audio buffer at a scheduled time.
	 */
	const playNoteBuffer = ( buffer, context, when, stopImmediately = false ) => {
		const source = context.createBufferSource();
		source.buffer = buffer;

		source.connect( masterGain );
		source.start( when );
		playingSources.push( source );

		// source.connect( context.destination );
		// source.start( when );
		// playingSources.push( source );

		if ( stopImmediately ) {
			source.stop();
		}
		source.onended = () => {
			const index = playingSources.indexOf( source );
			if ( index !== -1 ) {
				playingSources.splice( index, 1 );
			}
		};
	};

	// Expose the p1 function globally.
	window.p1 = p1;

} )();

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