( function( beep8 ) {

	beep8.Textmode = {};

	/**
	 * Load a textmode tilemap from data.
	 * This is a wrapper for beep8.Tilemap.load to keep the API consistent.
	 *
	 * @param {Object} data The textmode tilemap data.
	 * @returns {Promise} Resolves when the tilemap is loaded.
	 */
	beep8.Textmode.load = async function( data ) {

		return beep8.Tilemap.load( data );

	};


	/**
	 * Draw a textmode tilemap to the screen.
	 * This is a wrapper for beep8.Tilemap.draw to keep the API consistent.
	 *
	 * @param {Array} tilemap The tilemap array to draw.
	 * @param {number} [tileX=0] The x-coordinate of the tile to start drawing from.
	 * @param {number} [tileY=0] The y-coordinate of the tile to start drawing from.
	 * @param {number} [width=null] The width of the tilemap to draw.
	 * @param {number} [height=null] The height of the tilemap to draw.
	 * @returns {void}
	 */
	beep8.Textmode.draw = async function( tilemap, tileXOffset = 0, tileYOffset = 0, width = null, height = null ) {

		return beep8.Tilemap.draw( tilemap, tileXOffset, tileYOffset, width, height );

	}


} )( beep8 );
