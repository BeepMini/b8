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


	/**
	 * Save a tilemap array to a string.
	 *
	 * @param {Array} tilemap The tilemap array to save.
	 * @returns {string} The encoded string
	 */
	beep8.Tilemap.save = function( tilemap ) {

		beep8.Utilities.checkArray( "tilemap", tilemap );

		const cborString = CBOR.encode( tilemap );
		const encodedString = btoa( String.fromCharCode.apply( null, new Uint8Array( cborString ) ) );

		return encodedString;

	}


	/**
	 * Load a tilemap array from a string.
	 *
	 * @param {string} data The encoded string
	 * @returns {Array} The tilemap array
	 */
	beep8.Tilemap.load = function( data ) {

		beep8.Utilities.checkString( "data", data );

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
		const mapData = CBOR.decode( arrayBuffer );

		return mapData;

	}


	/**
	 * Draw a tilemap array to the screen.
	 *
	 * @param {Array} tilemap The tilemap array to draw.
	 * @param {number} [width=null] The width of the tilemap to draw.
	 * @param {number} [height=null] The height of the tilemap to draw.
	 * @returns {void}
	 */
	beep8.Tilemap.draw = function( tilemap, width = null, height = null ) {

		beep8.Utilities.checkArray( "tilemap", tilemap );

		if ( !width ) {
			width = tilemap[ 0 ].length;
		}

		if ( !height ) {
			height = tilemap.length;
		}

		beep8.Utilities.checkNumber( "width", width );
		beep8.Utilities.checkNumber( "height", height );

		for ( let y = 0; y < height; y++ ) {
			beep8.locate( 0, y );
			for ( let x = 0; x < width; x++ ) {
				const tile = tilemap[ y ][ x ];
				if ( tile ) {
					beep8.color(
						tile[ engine.MAP_FG ],
						tile[ engine.MAP_BG ]
					);
					beep8.printChar( tile[ engine.MAP_CHAR ] );
				}
			}
		}

	};


} )( beep8 || ( beep8 = {} ) );
