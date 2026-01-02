mapper.camera = {

	/**
	 * Get the top-left tile coordinates of the screen the player is currently on.
	 *
	 * @param {number} pCol - The player's column position.
	 * @param {number} pRow - The player's row position.
	 * @returns {Object} An object with col, row, w, and h properties representing the screen's top-left tile and dimensions.
	 */
	getScreenPosition: function( pCol, pRow ) {

		if ( !mapper.isValidMapId( mapper.currentMapId ) ) {
			b8.Utilities.error( "No current map set." );
			return { col: 0, row: 0 };
		}

		const currentMap = mapper.getCurrentMap();

		const screenWidth = currentMap.screenWidth;
		const screenHeight = currentMap.screenHeight;

		// Calculate which screen to draw based on player position.
		const screenX = Math.floor( pCol / screenWidth ) * screenWidth;
		const screenY = Math.floor( pRow / screenHeight ) * screenHeight;

		return { col: screenX, row: screenY, w: screenWidth, h: screenHeight };

	},


	/**
	 * Get the on-screen tile coordinates for a given map tile.
	 *
	 * @param {number} col - The map tile's column position.
	 * @param {number} row - The map tile's row position.
	 * @returns {Object} An object with col and row properties representing the tile's on-screen position.
	 */
	getTilePosition: function( col, row ) {

		const loc = b8.ECS.getComponent( mapper.player, 'Loc' );

		if ( !loc ) return { col: 0, row: 0 };

		const pos = mapper.camera.getScreenPosition( loc.col, loc.row );

		let tileCol = col - pos.col;
		let tileRow = row - pos.row;

		// If out of bounds push off the screen to avoid rendering.
		if ( tileCol < 0 ) tileCol = -100;
		if ( tileRow < 0 ) tileRow = -100;
		if ( tileCol >= pos.w ) tileCol = -100;
		if ( tileRow >= pos.h ) tileRow = -100;

		return {
			col: tileCol,
			row: tileRow,
		};

	},

};