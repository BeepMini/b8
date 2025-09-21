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
	 * @param {number} [maxWidth=-1] - The maximum width to wrap text at.
	 * @returns {void}
	 */
	beep8.TextRenderer.print = function( text, font = null, maxWidth = -1 ) {

		beep8.TextRenderer.printFont_ = font || beep8.TextRenderer.curFont_;

		// Property validation.
		beep8.Utilities.checkString( "text", text );
		beep8.Utilities.checkNumber( "maxWidth", maxWidth );
		if ( font !== null ) beep8.Utilities.checkObject( "font", font );

		// Wrap text to specified width.
		text = beep8.TextRenderer.wrapText( text, maxWidth, font );

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
	 * @param {number} [maxWidth=-1] - The width to wrap text at.
	 * @param {number} [delay=0.05] - The delay between characters in seconds.
	 * @param {beep8.TextRendererFont} [font=null] - The font to use.
	 * @returns {Promise<void>} Resolves after the text is printed.
	 */
	beep8.TextRenderer.printTypewriter = async function( text, maxWidth = -1, delay = 0.05, font = null ) {

		beep8.Utilities.checkString( "text", text );
		beep8.Utilities.checkNumber( "maxWidth", maxWidth );
		beep8.Utilities.checkNumber( "delay", delay );

		const startCol = beep8.col();
		const startRow = beep8.row();

		text = beep8.TextRenderer.wrapText( text, maxWidth );

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
	 * @param {number} maxWidth - The width to wrap the text to.
	 * @param {beep8.TextRendererFont} fontName - The font to use.
	 * @returns {string} The wrapped text.
	 */
	beep8.TextRenderer.wrapText = function( text, maxWidth, font = null ) {

		font = font || beep8.TextRenderer.curFont_;

		// If 0 or less then don't wrap.
		if ( maxWidth <= 0 ) return text;

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
				if ( lineWidth > maxWidth ) {
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