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
		getCharWidth() {

			return this.charWidth_;

		}


		/**
		 * Returns the character height of the font.
		 * @returns {number} The height of each character in pixels.
		 */
		getCharHeight() {

			return this.charHeight_;

		}


		/**
		 * Returns the image for a given color number.
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
