( function( beep8 ) {

	/**
	 * Initializes the API. This must be called before other functions and must finish executing before other API functions are called.
	 * Once the supplied callback is called, you can start using beep8 functions.
	 *
	 * @param {Function} callback - The callback to call when initialization is done.
	 * @returns {void}
	 */
	function init( callback ) {

		return beep8.core.init( callback );

	}


	/**
	 * Sets the frame handler, that is, the function that will be called on every frame to render the screen.
	 *
	 * @param {Function} handler - The frame handler function.
	 * @param {number} [fps=30] - The target frames per second. Recommended: 30.
	 * @returns {void}
	 */
	function frame( handler, fps = 30 ) {

		beep8.core.preflight( "beep8.frame" );

		if ( handler !== null ) {
			beep8.utilities.checkFunction( "handler", handler );
		}

		beep8.utilities.checkNumber( "fps", fps );

		return beep8.core.setFrameHandler( handler, fps );

	}


	/**
	 * Forces the screen to render right now. Useful for immediate redraw in animations.
	 *
	 * @returns {void}
	 */
	function render() {

		beep8.core.preflight( "beep8.render" );

		return beep8.core.render();

	}


	/**
	 * Sets the foreground and/or background color.
	 *
	 * @param {number} fg - The foreground color.
	 * @param {number} [bg] - The background color (optional).
	 * @returns {void}
	 */
	function color( fg, bg ) {

		beep8.core.preflight( "beep8.color" );
		beep8.utilities.checkNumber( "fg", fg );

		if ( bg !== undefined ) {
			beep8.utilities.checkNumber( "bg", bg );
		}

		beep8.core.setColor( fg, bg );

	}


	/**
	 * Gets the current foreground color.
	 *
	 * @returns {number} The current foreground color.
	 */
	function getFgColor() {

		beep8.core.preflight( "getFgColor" );

		return beep8.core.drawState.fgColor;

	}


	/**
	 * Gets the current background color. -1 means transparent.
	 *
	 * @returns {number} The current background color.
	 */
	function getBgColor() {

		beep8.core.preflight( "getBgColor" );

		return beep8.core.drawState.bgColor;

	}


	/**
	 * Clears the screen using the current background color.
	 *
	 * @returns {void}
	 */
	function cls() {

		beep8.core.preflight( "beep8.cls" );
		beep8.core.cls();

	}


	/**
	 * Places the cursor at the given screen column and row.
	 *
	 * @param {number} col - The column where the cursor is to be placed.
	 * @param {number} [row] - The row where the cursor is to be placed (optional).
	 * @returns {void}
	 */
	function locate( col, row ) {

		beep8.core.preflight( "beep8.locate" );
		beep8.utilities.checkNumber( "col", col );

		if ( row !== undefined ) {
			beep8.utilities.checkNumber( "row", row );
		}

		beep8.core.setCursorLocation( col, row );

	}

	/**
	 * Returns the cursor's current column.
	 *
	 * @returns {number} The cursor's current column.
	 */
	function col() {

		beep8.core.preflight( "col" );

		return beep8.core.drawState.cursorCol;

	}


	/**
	 * Returns the cursor's current row.
	 *
	 * @returns {number} The cursor's current row.
	 */
	function row() {

		beep8.core.preflight( "row" );

		return beep8.core.drawState.cursorRow;

	}


	/**
	 * Shows or hides the cursor.
	 *
	 * @param {boolean} visible - If true, show the cursor. If false, hide the cursor.
	 * @returns {void}
	 */
	function cursor( visible ) {

		beep8.core.preflight( "cursor" );
		beep8.utilities.checkBoolean( "visible", visible );
		beep8.core.cursorRenderer.setCursorVisible( visible );

	}

	/**
	 * Prints text at the cursor position, using the current foreground and background colors.
	 *
	 * @param {string} text - The text to print.
	 * @returns {void}
	 */
	function print( text ) {

		beep8.core.preflight( "beep8.text" );
		beep8.utilities.checkString( "text", text );
		beep8.core.textRenderer.print( text );

	}


	/**
	 * Prints text centered horizontally in a field of the given width.
	 *
	 * @param {string} text - The text to print.
	 * @param {number} width - The width of the field, in characters.
	 * @returns {void}
	 */
	function printCentered( text, width ) {

		beep8.core.preflight( "beep8.printCentered" );
		beep8.utilities.checkString( "text", text );
		beep8.utilities.checkNumber( "width", width );
		beep8.core.textRenderer.printCentered( text, width );

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
	function drawText( x, y, text, fontId = null ) {

		beep8.core.preflight( "beep8.drawText" );
		beep8.utilities.checkNumber( "x", x );
		beep8.utilities.checkNumber( "y", y );
		beep8.utilities.checkString( "text", text );

		if ( fontId ) {
			beep8.utilities.checkString( "fontId", fontId );
		}

		beep8.core.textRenderer.drawText( x, y, text, fontId );

	}


	/**
	 * Measures the size of the given text without printing it.
	 *
	 * @param {string} text - The text to measure.
	 * @returns {Object} An object with {cols, rows} indicating the dimensions.
	 */
	function measure( text ) {

		beep8.core.preflight( "measure" );
		beep8.utilities.checkString( "text", text );

		return beep8.core.textRenderer.measure( text );

	}


	/**
	 * Prints a character at the current cursor position, advancing the cursor position.
	 *
	 * @param {number|string} charCode - The character to print, as an integer (ASCII code) or a one-character string.
	 * @param {number} [numTimes=1] - How many times to print the character.
	 * @returns {void}
	 */
	function printChar( charCode, numTimes = 1 ) {

		beep8.core.preflight( "beep8.printChar" );
		charCode = convChar( charCode );
		beep8.utilities.checkNumber( "charCode", charCode );
		beep8.utilities.checkNumber( "numTimes", numTimes );
		beep8.core.textRenderer.printChar( charCode, numTimes );

	}

	/**
	 * Prints a rectangle of the given size with the given character, starting at the current cursor position.
	 * @param {number} widthCols - Width of the rectangle in screen columns.
	 * @param {number} heightRows - Height of the rectangle in screen rows.
	 * @param {number|string} [charCode=32] - The character to print, as an integer (ASCII code) or a one-character string.
	 * @returns {void}
	 */
	function printRect( widthCols, heightRows, charCode = 32 ) {

		beep8.core.preflight( "beep8.printRect" );
		charCode = convChar( charCode );
		beep8.utilities.checkNumber( "widthCols", widthCols );
		beep8.utilities.checkNumber( "heightRows", heightRows );
		beep8.utilities.checkNumber( "charCode", charCode );
		beep8.core.textRenderer.printRect( widthCols, heightRows, charCode );

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
	function printBox( widthCols, heightRows, fill = true, borderChar = 0x80 ) {

		beep8.core.preflight( "beep8.printBox" );
		borderChar = convChar( borderChar );
		beep8.utilities.checkNumber( "widthCols", widthCols );
		beep8.utilities.checkNumber( "heightRows", heightRows );
		beep8.utilities.checkBoolean( "fill", fill );
		beep8.utilities.checkNumber( "borderChar", borderChar );
		beep8.core.textRenderer.printBox( widthCols, heightRows, fill, borderChar );

	}

	/**
	 * Draws an image (previously loaded with beep8a.loadImage).
	 *
	 * @param {number} x - The X coordinate of the top-left of the image.
	 * @param {number} y - The Y coordinate of the top-left of the image.
	 * @param {HTMLImageElement} image - The image to draw.
	 * @returns {void}
	 */
	function drawImage( x, y, image ) {

		beep8.utilities.checkInstanceOf( "image", image, HTMLImageElement );
		beep8.utilities.checkNumber( "x", x );
		beep8.utilities.checkNumber( "y", y );
		beep8.core.drawImage( image, x, y );

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
	function drawImageRect( x, y, image, srcX, srcY, width, height ) {

		beep8.utilities.checkInstanceOf( "image", image, HTMLImageElement );
		beep8.utilities.checkNumber( "x", x );
		beep8.utilities.checkNumber( "y", y );
		beep8.utilities.checkNumber( "srcX", srcX );
		beep8.utilities.checkNumber( "srcY", srcY );
		beep8.utilities.checkNumber( "width", width );
		beep8.utilities.checkNumber( "height", height );
		beep8.core.drawImage( image, x, y, srcX, srcY, width, height );

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
	function drawRect( x, y, width, height ) {

		beep8.utilities.checkNumber( "x", x );
		beep8.utilities.checkNumber( "y", y );
		beep8.utilities.checkNumber( "width", width );
		beep8.utilities.checkNumber( "height", height );
		beep8.core.drawRect( x, y, width, height );

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
	function fillRect( x, y, width, height ) {

		beep8.utilities.checkNumber( "x", x );
		beep8.utilities.checkNumber( "y", y );
		beep8.utilities.checkNumber( "width", width );
		beep8.utilities.checkNumber( "height", height );
		beep8.core.fillRect( x, y, width, height );

	}


	/**
	 * Plays a sound (previously loaded with beep8a.playSound).
	 *
	 * @param {HTMLAudioElement} sfx - The sound to play.
	 * @param {number} [volume=1] - The volume to play the sound at.
	 * @param {boolean} [loop=false] - If true, play the sound in a loop.
	 * @returns {void}
	 */
	function playSound( sfx, volume = 1, loop = false ) {

		beep8.utilities.checkInstanceOf( "sfx", sfx, HTMLAudioElement );
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
	function spr( ch, x, y ) {

		ch = convChar( ch );
		beep8.utilities.checkNumber( "ch", ch );
		beep8.utilities.checkNumber( "x", x );
		beep8.utilities.checkNumber( "y", y );
		beep8.core.textRenderer.spr( ch, x, y );

	}


	/**
	 * Checks if the given key is currently pressed or not.
	 *
	 * @param {string} keyName - The name of the key.
	 * @returns {boolean} True if the key is pressed, otherwise false.
	 */
	function key( keyName ) {

		beep8.core.preflight( "beep8.key" );
		beep8.utilities.checkString( "keyName", keyName );

		return beep8.core.inputSys.keyHeld( keyName );

	}


	/**
	 * Checks if the given key was JUST pressed on this frame.
	 *
	 * @param {string} keyName - The name of the key.
	 * @returns {boolean} True if the key was just pressed, otherwise false.
	 */
	function keyp( keyName ) {

		beep8.core.preflight( "beep8.keyp" );
		beep8.utilities.checkString( "keyName", keyName );

		return beep8.core.inputSys.keyJustPressed( keyName );

	}


	/**
	 * Redefines the colors, assigning new RGB values to each color.
	 *
	 * @param {Array<number>} colors - An array of RGB values.
	 * @returns {void}
	 */
	function redefineColors( colors ) {

		beep8.core.preflight( "beep8.redefineColors" );
		beep8.utilities.checkArray( "colors", colors );
		beep8.core.defineColors( colors );

	}


	/**
	 * Sets the current font for text-based operations.
	 *
	 * @param {string} [fontId="default"] - The font ID to set. Pass null or omit to reset to default font.
	 * @returns {void}
	 */
	function setFont( fontId ) {

		beep8.core.preflight( "beep8.setFont" );
		fontId = fontId || "default";
		beep8.utilities.checkString( "fontId", fontId );
		beep8.core.textRenderer.setFont( fontId );

	}


	/**
	 * Converts a character code to its integer representation if needed.
	 *
	 * @param {number|string} charCode - The character code to convert.
	 * @returns {number} The integer representation of the character code.
	 */
	function convChar( charCode ) {

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
	function stopSound( sfx ) {

		beep8.utilities.checkInstanceOf( "sfx", sfx, HTMLAudioElement );
		sfx.currentTime = 0;
		sfx.pause();

	}


	/**
	 * Returns the raw canvas 2D context for drawing.
	 *
	 * @returns {CanvasRenderingContext2D} The raw HTML 2D canvas context.
	 */
	function getContext() {

		return beep8.core.getContext();

	}


	/**
	 * Saves the contents of the screen into an ImageData object and returns it.
	 *
	 * @returns {ImageData} An ImageData object with the screen's contents.
	 */
	function saveScreen() {

		return beep8.core.saveScreen();

	}


	/**
	 * Restores the contents of the screen using an ImageData object.
	 *
	 * @param {ImageData} screenData - The ImageData object with the screen's contents.
	 * @returns {void}
	 */
	function restoreScreen( screenData ) {

		return beep8.core.restoreScreen( screenData );

	}


	beep8.init = init;
	beep8.frame = frame;
	beep8.render = render;
	beep8.color = color;
	beep8.getFgColor = getFgColor;
	beep8.getBgColor = getBgColor;
	beep8.cls = cls;
	beep8.locate = locate;
	beep8.col = col;
	beep8.row = row;
	beep8.cursor = cursor;
	beep8.print = print;
	beep8.printCentered = printCentered;
	beep8.drawText = drawText;
	beep8.measure = measure;
	beep8.printChar = printChar;
	beep8.printRect = printRect;
	beep8.printBox = printBox;
	beep8.drawImage = drawImage;
	beep8.drawImageRect = drawImageRect;
	beep8.drawRect = drawRect;
	beep8.fillRect = fillRect;
	beep8.playSound = playSound;
	beep8.spr = spr;
	beep8.key = key;
	beep8.keyp = keyp;
	beep8.redefineColors = redefineColors;
	beep8.setFont = setFont;
	beep8.stopSound = stopSound;
	beep8.getContext = getContext;
	beep8.saveScreen = saveScreen;
	beep8.restoreScreen = restoreScreen;

} )( beep8 );
