mapper.sceneGame = {

	UI: null,


	/**
	 * Initialize the game scene.
	 *
	 * @returns {void}
	 */
	init: function() {

		console.log( mapper.CONFIG );

		mapper.sceneGame.UI = beep8.Tilemap.load( mapper.CONFIG.gameUI );

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
		const loc = beep8.ECS.getComponent( mapper.player, 'Loc' );
		const anim = beep8.ECS.getComponent( mapper.player, 'CharacterAnimation' );

		if ( mapper.CONFIG.moveDelay > 0 ) return;

		let dx = 0, dy = 0;

		// Calculate direction of movement.
		// Use else if so we can only move in one direction at a time and not jump
		// over collision walls diagonally.
		if ( beep8.keyp( "ArrowUp" ) ) { dy = -1; }
		else if ( beep8.keyp( "ArrowDown" ) ) { dy = 1; }
		else if ( beep8.keyp( "ArrowLeft" ) ) { dx = -1; }
		else if ( beep8.keyp( "ArrowRight" ) ) { dx = 1; }
		if ( beep8.keyp( "ButtonB" ) ) mapper.doAction( mapper.player );

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

			beep8.ECS.set( mapper.player, 'Direction', { dx, dy } );
			beep8.ECS.setLoc( mapper.player, newCol, newRow );

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

		beep8.cls();

		beep8.locate( mapper.CONFIG.mapOffsetX, mapper.CONFIG.mapOffsetY );
		mapper.drawScreen();
		mapper.render( mapper.CONFIG.mapOffsetX, mapper.CONFIG.mapOffsetY );

		// Draw UI background.
		beep8.locate( 0, beep8.CONFIG.SCREEN_ROWS - mapper.sceneGame.UI.length );
		beep8.Tilemap.draw( mapper.sceneGame.UI );

		// Draw currency value.
		beep8.locate( 2, beep8.CONFIG.SCREEN_ROWS - 2 );
		beep8.color( mapper.settings.coinColor, 0 );
		beep8.printChar( mapper.settings.coin || 266 );

		beep8.color( 15, 0 );
		beep8.print( ' ' + parseInt( beep8.Inventory.getCount( 'coin' ) ).toString().padStart( 4, '0' ) );

		// Draw keys.
		const keys = beep8.Inventory.filter( /^key/ );
		// Loop through keys and draw them.
		keys.forEach(
			( item, index ) => {
				const color = parseInt( item.id.split( '-' )[ 1 ] ) || 15;
				beep8.locate( 10 + index, beep8.CONFIG.SCREEN_ROWS - 2 );
				beep8.color( color, -1 );
				beep8.printChar( 255 );
			}
		);

		// Draw actions.
		// -------------
		beep8.color( 15, -1 );

		// A button.
		beep8.locate( 11, beep8.CONFIG.SCREEN_ROWS - 4 );
		beep8.print( ' ' );

		// B button.
		beep8.locate( 15, beep8.CONFIG.SCREEN_ROWS - 4 );
		beep8.print( mapper.helpers.capitalizeWords( ' ' + mapper.promptAhead( mapper.player ) ) );

		return;

	},

};