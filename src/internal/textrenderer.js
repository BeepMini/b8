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
