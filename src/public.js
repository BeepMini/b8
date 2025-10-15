( function( b8 ) {

	/**
	 * Initializes the API. This must be called before other functions and must
	 * finish executing before other API functions are called.
	 * Once the supplied callback is called, you can start using b8 functions.
	 *
	 * @param {Function} callback - The callback to call when initialization is done.
	 * @param {Object} [options] - Optional options object.
	 * @returns {void}
	 */
	b8.init = function( callback, options = {} ) {

		b8.Utilities.checkFunction( "callback", callback );
		b8.Utilities.checkObject( "options", options );

		// Combine options with b8.CONFIG using deep merge
		if ( options !== null ) {
			b8.CONFIG = b8.Utilities.deepMerge( b8.CONFIG, options );
		}

		return b8.Core.init( callback );

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
	b8.frame = function( renderHandler = null, updateHandler = null, fps = 30 ) {

		b8.Core.preflight( "b8.frame" );

		if ( renderHandler !== null ) {
			b8.Utilities.checkFunction( "render handler", renderHandler );
		}

		if ( updateHandler !== null ) {
			b8.Utilities.checkFunction( "update handler", updateHandler );
		}

		b8.Utilities.checkNumber( "fps", fps );

		return b8.Core.setFrameHandlers( renderHandler, updateHandler, fps );

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
	b8.render = function() {

		b8.Core.preflight( "b8.render" );

		return b8.Renderer.render();

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
	b8.color = function( fg, bg = undefined ) {

		b8.Core.preflight( "b8.color" );
		b8.Utilities.checkNumber( "fg", fg );

		if ( bg !== undefined ) {
			b8.Utilities.checkNumber( "bg", bg );
		}

		b8.Core.setColor( fg, bg );

	}


	/**
	 * Gets the current foreground color.
	 *
	 * @returns {number} The current foreground color.
	 */
	b8.getFgColor = function() {

		b8.Core.preflight( "getFgColor" );

		return b8.Core.drawState.fgColor;

	}


	/**
	 * Gets the current background color.
	 * -1 means transparent.
	 *
	 * @returns {number} The current background color.
	 */
	b8.getBgColor = function() {

		b8.Core.preflight( "b8.getBgColor" );

		return b8.Core.drawState.bgColor;

	}


	/**
	 * Clears the screen using the specified or current background color.
	 *
	 * @param {number} [bg=undefined] - Optional background color index.
	 * If provided, uses this index to get the color from the config. If not
	 * provided, uses the current background color (drawState.bgColor).
	 * @returns {void}
	 */
	b8.cls = function( bg = undefined ) {

		b8.Core.preflight( "b8.Core.cls" );

		if ( bg !== undefined ) {
			b8.Utilities.checkNumber( "bg", bg );
			b8.Core.cls( bg );
			return;
		}

		b8.Core.cls();

	}


	/**
	 * Places the cursor at the given screen column and row. All drawing and
	 * printing operations will start from here.
	 *
	 * @param {number} col - The column where the cursor is to be placed.
	 * @param {number} [row] - The row where the cursor is to be placed (optional).
	 * @returns {void}
	 */
	b8.locate = function( col, row ) {

		b8.Core.preflight( "b8.locate" );
		b8.Utilities.checkNumber( "col", col );

		if ( row !== undefined ) {
			b8.Utilities.checkNumber( "row", row );
		}

		b8.Core.setCursorLocation( col, row );

	}


	/**
	 * Returns the cursor's current column.
	 *
	 * @returns {number} The cursor's current column.
	 */
	b8.col = function() {

		b8.Core.preflight( "col" );

		return b8.Core.drawState.cursorCol;

	}


	/**
	 * Returns the cursor's current row.
	 *
	 * @returns {number} The cursor's current row.
	 */
	b8.row = function() {

		b8.Core.preflight( "row" );

		return b8.Core.drawState.cursorRow;

	}


	/**
	 * Shows or hides the cursor.
	 *
	 * @param {boolean} visible - If true, show the cursor. If false, hide the
	 * cursor.
	 * @returns {void}
	 */
	b8.cursor = function( visible ) {

		b8.Core.preflight( "cursor" );
		b8.Utilities.checkBoolean( "visible", visible );

		b8.CursorRenderer.setCursorVisible( visible );

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
	 * @param {number} [maxWidth=-1] - The maximum width to wrap text at. -1 for no wrapping.
	 * @returns {void}
	 */
	b8.print = function( text, maxWidth = -1, fontName = null ) {

		b8.Core.preflight( "b8.text" );

		b8.Utilities.checkString( "text", text );
		b8.Utilities.checkNumber( "maxWidth", maxWidth );

		let font = fontName;
		if ( null !== font ) {
			b8.Utilities.checkString( "fontName", fontName );
			font = b8.TextRenderer.getFontByName( fontName );
		}

		b8.TextRenderer.print( text, font, maxWidth );

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
	b8.printCentered = function( text, width = b8.CONFIG.SCREEN_COLS, fontName = null ) {

		b8.Core.preflight( "b8.printCentered" );

		b8.Utilities.checkString( "text", text );
		b8.Utilities.checkNumber( "width", width );

		let font = fontName;
		if ( null !== font ) {
			b8.Utilities.checkString( "fontName", fontName );
			font = b8.TextRenderer.getFontByName( fontName );
		}

		b8.TextRenderer.printCentered( text, width, font );

	}


	/**
	 * Prints text aligned to the right in a space of the given width.
	 * If the text is bigger than the width, it will wrap.
	 *
	 * @param {string} text - The text to print.
	 * @param {number} width - The width of the space to place the text in, measured in Columns. Defaults to the screen width.
	 * @param {string} [fontName=null] - The font ID to use.
	 * @returns {void}
	 */
	b8.printRight = function( text, width = b8.CONFIG.SCREEN_COLS, fontName = null ) {

		b8.Core.preflight( "b8.printRight" );

		b8.Utilities.checkString( "text", text );
		b8.Utilities.checkNumber( "width", width );

		let font = fontName;
		if ( null !== font ) {
			b8.Utilities.checkString( "fontName", fontName );
			font = b8.TextRenderer.getFontByName( fontName );
		}

		b8.TextRenderer.printRight( text, width, font );

	}


	/**
	 * Draws text at an arbitrary pixel position on the screen, not following
	 * the "row and column" system.
	 *
	 * @param {number} x - The X coordinate of the top-left of the text.
	 * @param {number} y - The Y coordinate of the top-left of the text.
	 * @param {string} text - The text to print.
	 * @param {string} [fontName=null] - The font ID to use.
	 * @returns {void}
	 */
	b8.drawText = function( x, y, text, fontName = null ) {

		b8.Core.preflight( "b8.drawText" );
		b8.Utilities.checkNumber( "x", x );
		b8.Utilities.checkNumber( "y", y );
		b8.Utilities.checkString( "text", text );

		if ( fontName ) {
			b8.Utilities.checkString( "fontName", fontName );
		}

		b8.TextRenderer.drawText( x, y, text, fontName );

	}


	/**
	 * Measures the size of the given text without printing it.
	 *
	 * @param {string} text - The text to measure.
	 * @returns {Object} An object with {cols, rows} indicating the dimensions.
	 */
	b8.measure = function( text ) {

		b8.Core.preflight( "measure" );
		b8.Utilities.checkString( "text", text );

		return b8.TextRenderer.measure( text );

	}


	/**
	 * Prints a character at the current cursor position, advancing the cursor
	 * position.
	 *
	 * @param {number|string} charCode - The character to print, as an integer
	 * (ASCII code) or a one-character string.
	 * @param {number} [numTimes=1] - How many times to print the character.
	 * @param {string} fontName - The font id for the font to draw with.
	 * @returns {void}
	 */
	b8.printChar = function( charCode, numTimes = 1, fontName = null ) {

		b8.Core.preflight( "b8.printChar" );

		charCode = b8.convChar( charCode );
		b8.Utilities.checkInt( "charCode", charCode );
		b8.Utilities.checkInt( "numTimes", numTimes );

		if ( numTimes < 0 ) {
			b8.Utilities.fatal( "[b8.printChar] numTimes must be a positive integer" );
		}

		// Nothing to print.
		if ( 0 === numTimes ) {
			return;
		}

		let font = fontName;
		if ( null !== font ) {
			b8.Utilities.checkString( "fontName", fontName );
			font = b8.TextRenderer.getFontByName( fontName );
		}

		b8.TextRenderer.printChar( charCode, numTimes, font );

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
	b8.printRect = function( widthCols, heightRows, charCode = 8 ) {

		b8.Core.preflight( "b8.printRect" );
		charCode = b8.convChar( charCode );

		b8.Utilities.checkNumber( "widthCols", widthCols );
		b8.Utilities.checkNumber( "heightRows", heightRows );
		b8.Utilities.checkNumber( "charCode", charCode );

		b8.TextRenderer.printRect( widthCols, heightRows, charCode );

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
	b8.printBox = function( widthCols, heightRows, fill = true, borderChar = b8.CONFIG.BORDER_CHAR ) {

		b8.Core.preflight( "b8.printBox" );
		borderChar = b8.convChar( borderChar );

		b8.Utilities.checkNumber( "widthCols", widthCols );
		b8.Utilities.checkNumber( "heightRows", heightRows );
		b8.Utilities.checkBoolean( "fill", fill );
		b8.Utilities.checkNumber( "borderChar", borderChar );

		b8.TextRenderer.printBox( widthCols, heightRows, fill, borderChar );

	}


	/**
	 * Draws an image (previously loaded with b8.loadImage).
	 *
	 * @param {number} x - The X coordinate of the top-left of the image.
	 * @param {number} y - The Y coordinate of the top-left of the image.
	 * @param {HTMLImageElement} image - The image to draw.
	 * @returns {void}
	 */
	b8.drawImage = function( x, y, image ) {

		b8.Utilities.checkInstanceOf( "image", image, HTMLImageElement );
		b8.Utilities.checkNumber( "x", x );
		b8.Utilities.checkNumber( "y", y );

		b8.Core.drawImage( image, x, y );

	}


	/**
	 * Draws a rectangular part of an image (previously loaded with
	 * b8.loadImage).
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
	b8.drawImageRect = function( x, y, image, srcX, srcY, width, height ) {

		b8.Utilities.checkInstanceOf( "image", image, HTMLImageElement );
		b8.Utilities.checkNumber( "x", x );
		b8.Utilities.checkNumber( "y", y );
		b8.Utilities.checkNumber( "srcX", srcX );
		b8.Utilities.checkNumber( "srcY", srcY );
		b8.Utilities.checkNumber( "width", width );
		b8.Utilities.checkNumber( "height", height );

		b8.Core.drawImage( image, x, y, srcX, srcY, width, height );

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
	b8.drawRect = function( x, y, width, height, lineWidth = 1 ) {

		b8.Utilities.checkNumber( "x", x );
		b8.Utilities.checkNumber( "y", y );
		b8.Utilities.checkNumber( "width", width );
		b8.Utilities.checkNumber( "height", height );
		b8.Utilities.checkNumber( "lineWidth", lineWidth );

		b8.Core.drawRect( x, y, width, height, lineWidth );

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
	b8.fillRect = function( x, y, width, height ) {

		b8.Utilities.checkNumber( "x", x );
		b8.Utilities.checkNumber( "y", y );
		b8.Utilities.checkNumber( "width", width );
		b8.Utilities.checkNumber( "height", height );

		b8.Core.fillRect( x, y, width, height );

	}


	/**
	 * Plays a sound (previously loaded with b8.loadSound).
	 *
	 * @param {HTMLAudioElement} sfx - The sound to play.
	 * @param {number} [volume=1] - The volume to play the sound at.
	 * @param {boolean} [loop=false] - If true, play the sound in a loop.
	 * @returns {void}
	 */
	b8.playSound = function( sfx, volume = 1, loop = false ) {

		b8.Utilities.checkInstanceOf( "sfx", sfx, HTMLAudioElement );

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
	b8.spr = function( ch, x, y ) {

		ch = b8.convChar( ch );

		b8.Utilities.checkNumber( "ch", ch );
		b8.Utilities.checkNumber( "x", x );
		b8.Utilities.checkNumber( "y", y );

		b8.TextRenderer.spr( ch, x, y );

	}


	/**
	 * Draws an actor on the screen with a specific frame and direction.
	 *
	 * @param {number} ch - The character code of the actor.
	 * @param {number} frame - The frame to draw.
	 * @param {number} [direction=0] - The direction to draw the actor in. 0 = right, 1 = left.
	 * @returns {void}
	 */
	b8.drawActor = function( ch, animation ) {

		ch = b8.convChar( ch );

		b8.Utilities.checkInt( "ch", ch );
		b8.Utilities.checkString( "animation", animation );

		b8.Actors.draw( ch, animation );

	}


	/**
	 * Draws a sprite on the screen.
	 *
	 * @param {number|string} ch - The character code of the sprite.
	 * @param {string} animation - The animation to play.
	 * @param {number} x - The X position at which to draw.
	 * @param {number} y - The Y position at which to draw.
	 * @param {number|null} startTime - The start time of the animation in milliseconds.
	 * @returns {boolean} True if the sprite was drawn, otherwise false.
	 */
	b8.sprActor = function( ch, animation, x, y, startTime = null ) {

		ch = b8.convChar( ch );

		b8.Utilities.checkInt( "ch", ch );
		b8.Utilities.checkString( "animation", animation );
		b8.Utilities.checkNumber( "x", x );
		b8.Utilities.checkNumber( "y", y );
		if ( startTime !== null ) b8.Utilities.checkNumber( "startTime", startTime );

		return b8.Actors.spr( ch, animation, x, y, startTime );

	}


	/**
	 * Checks if the given key is currently pressed or not.
	 *
	 * @param {string} keyName - The name of the key.
	 * @returns {boolean} True if the key is pressed, otherwise false.
	 */
	b8.key = function( keyName ) {

		b8.Core.preflight( "b8.key" );

		b8.Utilities.checkString( "keyName", keyName );

		return b8.Input.keyHeld( keyName );

	}


	/**
	 * Checks if the given key was JUST pressed on this frame.
	 *
	 * @param {string} keyName - The name of the key.
	 * @returns {boolean} True if the key was just pressed, otherwise false.
	 */
	b8.keyp = function( keyName ) {

		b8.Core.preflight( "b8.keyp" );

		b8.Utilities.checkString( "keyName", keyName );

		return b8.Input.keyJustPressed( keyName );

	}



	/**
	 * Play a song.
	 *
	 * @param {string} song - The name of the song to play.
	 * @returns {void}
	 */
	b8.playSong = function( song ) {

		b8.Utilities.checkString( "song", song );

		b8.Sound.playSong( song );

	}


	/**
	 * Play a sound effect.
	 *
	 * @param {string} sfx - The name of the sound effect to play.
	 * @returns {void}
	 */
	b8.playSfx = function( sfx ) {

		b8.Utilities.checkString( "sfx", sfx );

		b8.Sfx.play( sfx );

	}


	/**
	 * Redefines the colors, assigning new RGB values to each color.
	 *
	 * @param {Array<number>} colors - An array of RGB values.
	 * @returns {void}
	 */
	b8.redefineColors = function( colors ) {

		b8.Core.preflight( "b8.redefineColors" );

		b8.Utilities.checkArray( "colors", colors );

		b8.Core.defineColors( colors );

	}


	/**
	 * Sets the current font for text-based operations.
	 *
	 * @param {string} [fontName="default"] - The font ID to set. Pass null or
	 * omit to reset to default font.
	 * @returns {void}
	 */
	b8.setFont = function( fontName ) {

		b8.Core.preflight( "b8.setFont" );

		fontName = fontName || "default-thin";
		b8.Utilities.checkString( "fontName", fontName );

		b8.TextRenderer.setFont( fontName );

	}


	/**
	 * Returns the current font.
	 *
	 * @returns {string} The current font.
	 */
	b8.getFont = function() {

		b8.Core.preflight( "b8.getFont" );

		b8.TextRenderer.getFont();

	}


	/**
	 * Returns the font object for the given font name.
	 *
	 * @param {string} fontName - The name of the font.
	 * @returns {Object} The font object.
	 */
	b8.getFontByName = function( fontName ) {

		b8.Utilities.checkString( "fontName", fontName );

		return b8.TextRenderer.getFontByName( fontName );

	}


	/**
	 * Sets the current tile font for text-based operations.
	 *
	 * @param {string} [fontName="tiles"] - The font ID to set. Pass null or
	 * omit to reset to default font.
	 * @returns {void}
	 */
	b8.setTileFont = function( fontName ) {

		b8.Core.preflight( "b8.setTileFont" );

		fontName = fontName || "tiles";
		b8.Utilities.checkString( "fontName", fontName );

		b8.TextRenderer.setTileFont( fontName );

	}


	/**
	 * Converts a character code to its integer representation if needed.
	 *
	 * @param {number|string} charCode - The character code to convert.
	 * @returns {number} The integer representation of the character code.
	 */
	b8.convChar = function( charCode ) {

		if ( typeof ( charCode ) === "string" && charCode.length > 0 ) {
			return charCode.charCodeAt( 0 );
		}

		return charCode;

	}


	/**
	 * Stops a sound (previously loaded with b8.playSound).
	 *
	 * @param {HTMLAudioElement} sfx - The sound to stop playing.
	 * @returns {void}
	 */
	b8.stopSound = function( sfx ) {

		b8.Utilities.checkInstanceOf( "sfx", sfx, HTMLAudioElement );
		sfx.currentTime = 0;
		sfx.pause();

	}


	/**
	 * Returns the raw canvas 2D context for drawing.
	 *
	 * @returns {CanvasRenderingContext2D} The raw HTML 2D canvas context.
	 */
	b8.getContext = function() {

		return b8.Core.getContext();

	}


	/**
	 * Saves the contents of the screen into an ImageData object and returns it.
	 *
	 * @returns {ImageData} An ImageData object with the screen's contents.
	 */
	b8.saveScreen = function() {

		return b8.Core.saveScreen();

	}


	/**
	 * Run a screenshake effect.
	 *
	 * @param {number} duration - The duration of the screenshake effect in seconds.
	 * @returns {boolean} Returns true if the screenshake effect was successfully triggered.
	 */
	b8.screenShake = function( duration ) {

		b8.Utilities.checkNumber( "duration", duration );

		return b8.Renderer.shakeScreen( duration );

	}


	/**
	 * Restores the contents of the screen using an ImageData object.
	 *
	 * @param {ImageData} screenData - The ImageData object with the screen's
	 * contents.
	 * @returns {void}
	 */
	b8.restoreScreen = function( screenData ) {

		return b8.Core.restoreScreen( screenData );

	}


	/**
	 * Returns the text with line breaks inserted so that it fits within the
	 * given width.
	 *
	 * @param {string} text - The text to wrap.
	 * @param {number} maxWidth - The maximum width to wrap text at.
	 * @returns {string} The wrapped text.
	 */
	b8.wrapText = function( text, maxWidth ) {

		b8.Utilities.checkString( "text", text );
		b8.Utilities.checkNumber( "maxWidth", maxWidth );

		return b8.TextRenderer.wrapText( text, maxWidth );

	}


	/**
	 * Add a new game scene.
	 *
	 * @param {string} name - The name of the scene.
	 * @param {Function} update - The update function for the scene.
	 * @returns {void}
	 */
	b8.addScene = function( name, update = {} ) {

		b8.Scene.add( name, update );

	}


	/**
	 * Switches to a specified scene by name.
	 *
	 * @param {string} name - The name of the scene to switch to.
	 * @returns {void}
	 */
	b8.switchScene = function( name ) {

		b8.Scene.set( name );

	}


	/**
	 * Gets the current active scene.
	 *
	 * @returns {Object|null} The active scene object, or null if no scene is active.
	 */
	b8.getScene = function() {

		return b8.Scene.get();

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
	b8.speak = function( text, options = {} ) {

		// Speech synthesis is not supported in this browser.
		if ( !window.speechSynthesis ) return;

		b8.Utilities.checkString( "text", text );
		b8.Utilities.checkObject( "options", options );

		const utterance = new SpeechSynthesisUtterance( text );

		// Optional settings
		utterance.pitch = options.pitch ?? 1;
		utterance.rate = options.rate ?? 1;
		utterance.volume = options.volume ?? 1;

		speechSynthesis.speak( utterance );

	};

} )( b8 );
