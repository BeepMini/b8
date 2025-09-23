mapper.camera = {

	getScreenPosition: function( pCol, pRow ) {

		if ( !mapper.currentMap ) {
			beep8.Utilities.error( "No current map set." );
			return { col: 0, row: 0 };
		}

		const currentMap = mapper.currentMap;

		const screenWidth = currentMap.screenWidth;
		const screenHeight = currentMap.screenHeight;

		// Calculate which screen to draw based on player position.
		const screenX = Math.floor( pCol / screenWidth ) * screenWidth;
		const screenY = Math.floor( pRow / screenHeight ) * screenHeight;

		return { col: screenX, row: screenY, w: screenWidth, h: screenHeight };

	},


	getTilePosition: function( col, row ) {

		const loc = beep8.ECS.getComponent( mapper.player, 'Loc' );
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