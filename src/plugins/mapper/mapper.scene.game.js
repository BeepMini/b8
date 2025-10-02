mapper.sceneGame = {

	UI: null,


	/**
	 * Initialize the game scene.
	 *
	 * @returns {void}
	 */
	init: function() {

		console.log( mapper.CONFIG );

		mapper.sceneGame.UI = b8.Tilemap.load( mapper.CONFIG.gameUI );

	},


	/**
	 * Update the game scene.
	 *
	 * @param {number} dt Delta time in seconds since last frame.
	 * @returns {void}
	 */
	update: function( dt ) {

		mapper.CONFIG.moveDelay -= dt;
		if ( mapper.CONFIG.moveDelay > 0 ) return;

		// Get player components
		const loc = b8.ECS.getComponent( mapper.player, 'Loc' );
		const anim = b8.ECS.getComponent( mapper.player, 'CharacterAnimation' );

		if ( mapper.CONFIG.moveDelay > 0 ) return;

		let dx = 0, dy = 0;

		// Calculate direction of movement.
		// Use else if so we can only move in one direction at a time and not jump
		// over collision walls diagonally.
		if ( b8.keyp( "ArrowUp" ) ) { dy = -1; }
		else if ( b8.keyp( "ArrowDown" ) ) { dy = 1; }
		else if ( b8.keyp( "ArrowLeft" ) ) { dx = -1; }
		else if ( b8.keyp( "ArrowRight" ) ) { dx = 1; }
		if ( b8.keyp( "ButtonB" ) ) mapper.doAction( mapper.player );

		if ( dx !== 0 || dy !== 0 ) {

			let newCol = loc.col + dx;
			let newRow = loc.row + dy;

			if ( dy > 0 ) anim.name = 'move-down';
			if ( dy < 0 ) anim.name = 'move-up';
			if ( dx > 0 ) anim.name = 'move-right';
			if ( dx < 0 ) anim.name = 'move-left';
			anim.duration = 0.3;

			// Now check for regular collision (walls etc).
			if ( !mapper.collision.isWalkable( newCol, newRow ) || mapper.doCollision( loc.col, loc.row, newCol, newRow, dx, dy ) ) {
				newCol = loc.col;
				newRow = loc.row;
			}

			b8.ECS.set( mapper.player, 'Direction', { dx, dy } );
			b8.ECS.setLoc( mapper.player, newCol, newRow );

			mapper.CONFIG.moveDelay = 0.15;

		}

		mapper.update( dt );

	},


	/**
	 * Render the game scene.
	 *
	 * @returns {void}
	 */
	render: function() {

		b8.cls();

		b8.locate( mapper.CONFIG.mapOffsetX, mapper.CONFIG.mapOffsetY );
		mapper.drawScreen();
		mapper.render( mapper.CONFIG.mapOffsetX, mapper.CONFIG.mapOffsetY );

		// Draw UI background.
		b8.locate( 0, b8.CONFIG.SCREEN_ROWS - mapper.sceneGame.UI.length );
		b8.Tilemap.draw( mapper.sceneGame.UI );

		// Draw currency value.
		b8.locate( 2, b8.CONFIG.SCREEN_ROWS - 2 );
		b8.color( mapper.settings.coinColor, 0 );
		b8.printChar( mapper.settings.coin || 266 );

		b8.color( 15, 0 );
		b8.print( ' ' + parseInt( b8.Inventory.getCount( 'coin' ) ).toString().padStart( 4, '0' ) );

		// Draw keys.
		const keys = b8.Inventory.filter( /^key/ );
		// Loop through keys and draw them.
		keys.forEach(
			( item, index ) => {
				const color = parseInt( item.id.split( '-' )[ 1 ] ) || 15;
				b8.locate( 10 + index, b8.CONFIG.SCREEN_ROWS - 2 );
				b8.color( color, -1 );
				b8.printChar( 255 );
			}
		);

		// Draw actions.
		// -------------
		b8.color( 15, -1 );

		// A button.
		b8.locate( 11, b8.CONFIG.SCREEN_ROWS - 4 );
		b8.print( ' ' );

		// B button.
		b8.locate( 15, b8.CONFIG.SCREEN_ROWS - 4 );
		b8.print( mapper.helpers.capitalizeWords( ' ' + mapper.promptAhead( mapper.player ) ) );

		return;

	},

};