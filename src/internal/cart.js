( function( b8 ) {

	b8.Cart = {};


	// Magic string used to identify the custom trailer in the PNG file
	const MAGIC_STR = "b8";

	// Encoded version of the magic string as a Uint8Array
	const MAGIC = new TextEncoder().encode( MAGIC_STR );

	// Version number for the trailer format
	const VERSION = 1;


	/**
	 * Saves the current canvas as a PNG file with a custom trailer.
	 *
	 * The trailer includes metadata (e.g., game data) appended to the PNG file.
	 * This metadata is stored as a JSON object and can be extracted later using the `load` function.
	 *
	 * @param {HTMLCanvasElement} canvas - The canvas element to save as a PNG file.
	 * @param {Object|String} data - The metadata object to append as a trailer. This object will be serialized as JSON.
	 * @param {string} [filename="cart.png"] - The name of the file to save. Defaults to "cart.png".
	 * @returns {Promise<void>} - A promise that resolves when the file is saved.
	 */
	b8.Cart.save = async function( canvas, data, filename = "cart.png" ) {

		b8.Utilities.checkInstanceOf( "canvas", canvas, HTMLCanvasElement );
		b8.Utilities.checkString( "data", data );
		b8.Utilities.checkString( "filename", filename );

		const pngBlob = await new Promise( res => canvas.toBlob( res, "image/png" ) );

		// Append the custom trailer to the PNG Blob
		const cartBlob = await _appendTrailer( pngBlob, data );

		// Save the resulting Blob as a file (requires FileSaver.js)
		saveAs( cartBlob, filename );

	}


	/**
	 * Loads a PNG file with a custom trailer (set of game data) and extracts the appended data.
	 *
	 * The PNG file should be created using the b8.Cart.save function which appends the required trailer data.
	 *
	 * @param {Blob|string} pngBlobOrUrl - The PNG file as a Blob or a URL.
	 * @returns {Promise<Object>} - A promise that resolves to the extracted data object.
	 */
	b8.Cart.load = async function( pngBlobOrUrl ) {

		// Fetch the PNG data as an ArrayBuffer
		const buffer = await ( typeof pngBlobOrUrl === "string"
			? ( await fetch( pngBlobOrUrl ) ).arrayBuffer()
			: pngBlobOrUrl.arrayBuffer() );

		// Convert the ArrayBuffer to a Uint8Array
		const bytes = new Uint8Array( buffer );

		// Find the position of the magic string in the byte array
		const offset = _findMagicFromEnd( bytes, MAGIC_STR );
		if ( offset < 0 ) b8.Utilities.fatal( "Error Loading Cart: No b8 trailer found" );

		// Read the version number
		const version = bytes[ offset + 5 ];
		if ( version !== VERSION ) b8.Utilities.fatal( `Error Loading Cart: Unsupported version ${version}` );

		// Read the payload length
		const payloadLength = _readU32BE( bytes, offset + 6 );

		// Calculate the start and end of the payload
		const payloadStart = offset + 10;
		const payloadEnd = payloadStart + payloadLength;

		// Ensure the payload length is within bounds
		if ( payloadEnd + 4 > bytes.length ) {
			b8.Utilities.fatal( "Error Loading Cart: Trailer length out of range" );
		}

		// Extract the payload data
		const payload = bytes.subarray( payloadStart, payloadEnd );

		// Verify the CRC32 checksum
		const expectedCrc = _readU32BE( bytes, payloadEnd );
		if ( _crc32( payload ) !== expectedCrc ) {
			b8.Utilities.fatal( "Error Loading Cart: Bad payload CRC" );
		}

		// Decode and return the payload as a JSON object
		return JSON.parse( new TextDecoder().decode( payload ) );

	}


	/**
	 * Appends a custom trailer to a PNG file.
	 *
	 * The trailer includes a magic string, version, payload length, payload data, and a CRC32 checksum.
	 *
	 * @param {Blob} pngBlob - The PNG file as a Blob.
	 * @param {Object} dataObj - The data object to append as a trailer.
	 * @returns {Blob} - A new Blob containing the original PNG data and the appended trailer.
	 */
	async function _appendTrailer( pngBlob, dataObj ) {

		// Encode the data object as a JSON string and then to a Uint8Array
		const payload = new TextEncoder().encode( JSON.stringify( dataObj ) );

		// Calculate the total header size
		const headerSize = MAGIC.length + 1 + 4 + payload.length + 4; // MAGIC + VERSION + LENGTH + PAYLOAD + CRC32
		const header = new Uint8Array( headerSize );

		let offset = 0;

		// Add the magic string
		header.set( MAGIC, offset );
		offset += MAGIC.length;

		// Add the version number
		header[ offset++ ] = VERSION;

		// Add the payload length (big-endian)
		_writeU32BE( header, offset, payload.length );
		offset += 4;

		// Add the payload data
		header.set( payload, offset );
		offset += payload.length;

		// Add the CRC32 checksum of the payload
		_writeU32BE( header, offset, _crc32( payload ) );
		offset += 4;

		// Combine the original PNG data with the new header
		const pngBytes = new Uint8Array( await pngBlob.arrayBuffer() );
		return new Blob( [ pngBytes, header ], { type: "image/png" } );

	}


	/**
	 * Finds the position of a magic string in a byte array, searching from the end.
	 *
	 * @param {Uint8Array} bytes - The byte array to search in.
	 * @param {string} magicStr - The magic string to find.
	 * @returns {number} - The index of the magic string, or -1 if not found.
	 */
	function _findMagicFromEnd( bytes, magicStr ) {

		// Encode the magic string into a Uint8Array
		const magic = new TextEncoder().encode( magicStr );

		// Start searching from the end of the byte array
		for ( let i = bytes.length - magic.length; i >= 0; i-- ) {
			let found = true;

			// Check if the magic string matches at the current position
			for ( let j = 0; j < magic.length; j++ ) {
				if ( bytes[ i + j ] !== magic[ j ] ) {
					found = false;
					break;
				}
			}

			// If the magic string was found, return its starting index
			if ( found ) return i;
		}

		// Return -1 if the magic string was not found
		return -1;

	}


	/**
	 * Reads a 32-bit unsigned integer from a byte array in big-endian order.
	 *
	 * @param {Uint8Array} byteArray - The byte array to read from.
	 * @param {number} offset - The offset (index) in the byte array to start reading.
	 * @returns {number} - The 32-bit unsigned integer.
	 */
	function _readU32BE( byteArray, offset ) {

		// Extract four bytes starting at the given offset
		const byte1 = byteArray[ offset ];
		const byte2 = byteArray[ offset + 1 ];
		const byte3 = byteArray[ offset + 2 ];
		const byte4 = byteArray[ offset + 3 ];

		// Combine the bytes into a 32-bit unsigned integer (big-endian order)
		return ( ( byte1 << 24 ) | ( byte2 << 16 ) | ( byte3 << 8 ) | byte4 ) >>> 0;

	}


	/**
	 * Writes a 32-bit unsigned integer to a byte array in big-endian order.
	 *
	 * @param {Uint8Array} byteArray - The byte array to write to.
	 * @param {number} offset - The offset (index) in the byte array to start writing.
	 * @param {number} value - The 32-bit unsigned integer to write.
	 * @returns {void}
	 */
	function _writeU32BE( byteArray, offset, value ) {

		// Write each byte of the 32-bit integer in big-endian order
		byteArray[ offset ] = ( value >>> 24 ) & 0xFF; // Most significant byte
		byteArray[ offset + 1 ] = ( value >>> 16 ) & 0xFF;
		byteArray[ offset + 2 ] = ( value >>> 8 ) & 0xFF;
		byteArray[ offset + 3 ] = value & 0xFF; // Least significant byte

	}


	/**
	 * Calculates the CRC32 checksum of a byte array.
	 *
	 * @param {Uint8Array} byteArray - The byte array to calculate the checksum for.
	 * @returns {number} - The CRC32 checksum as an unsigned 32-bit integer.
	 */
	function _crc32( byteArray ) {

		// Initialize the CRC value to all 1s
		let crc = ~0 >>> 0;

		// Process each byte in the array
		for ( let i = 0; i < byteArray.length; i++ ) {
			crc ^= byteArray[ i ]; // XOR the byte with the current CRC value

			// Process each bit in the byte
			for ( let bit = 0; bit < 8; bit++ ) {
				// If the least significant bit is 1, apply the polynomial
				if ( crc & 1 ) {
					crc = ( crc >>> 1 ) ^ 0xEDB88320;
				} else {
					crc >>>= 1; // Otherwise, just shift right
				}
			}
		}

		// Return the bitwise NOT of the final CRC value
		return ~crc >>> 0;

	}

} )( b8 );
