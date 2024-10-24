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
	 * If the text is bigger than the width, it will overflow it.
	 *
	 * @param {string} text - The text to print.
	 * @param {number} width - The width of the field, in characters.
	 * @returns {void}
	 */
	beep8.printCentered = function( text, width, fontId = null ) {

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
	 * @returns {void}
	 */
	beep8.printChar = function( charCode, numTimes = 1 ) {

		beep8.Core.preflight( "beep8.printChar" );
		charCode = beep8.convChar( charCode );
		beep8.Utilities.checkNumber( "charCode", charCode );
		beep8.Utilities.checkNumber( "numTimes", numTimes );

		beep8.TextRenderer.printChar( charCode, numTimes );

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

		fontId = fontId || "default";
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

		beep8.Scenes.addScene( name, update );

	}


	/**
	 * Switches to a specified scene by name.
	 *
	 * @param {string} name - The name of the scene to switch to.
	 * @returns {void}
	 */
	beep8.switchScene = function( name ) {

		beep8.Scenes.switchScene( name );

	}


	/**
	 * Gets the current active scene.
	 *
	 * @returns {Object|null} The active scene object, or null if no scene is active.
	 */
	beep8.getScene = function() {

		return beep8.Scenes.getScene();

	}

} )( beep8 || ( beep8 = {} ) );
