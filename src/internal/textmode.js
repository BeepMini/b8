( function( b8 ) {

	b8.Textmode = {};

	/**
	 * Load a textmode tilemap from data.
	 * This is a wrapper for b8.Tilemap.load to keep the API consistent.
	 *
	 * @param {Object} data The textmode tilemap data.
	 * @returns {Promise} Resolves when the tilemap is loaded.
	 */
	b8.Textmode.load = async function( data ) {

		return b8.Tilemap.load( data );

	};


	/**
	 * Draw a textmode tilemap to the screen.
	 * This is a wrapper for b8.Tilemap.draw to keep the API consistent.
	 *
	 * @param {Array} tilemap The tilemap array to draw.
	 * @param {number} [tileX=0] The x-coordinate of the tile to start drawing from.
	 * @param {number} [tileY=0] The y-coordinate of the tile to start drawing from.
	 * @param {number} [width=null] The width of the tilemap to draw.
	 * @param {number} [height=null] The height of the tilemap to draw.
	 * @returns {void}
	 */
	b8.Textmode.draw = async function( tilemap, tileXOffset = 0, tileYOffset = 0, width = null, height = null ) {

		return b8.Tilemap.draw( tilemap, tileXOffset, tileYOffset, width, height );

	}


} )( b8 );
