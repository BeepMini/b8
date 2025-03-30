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
