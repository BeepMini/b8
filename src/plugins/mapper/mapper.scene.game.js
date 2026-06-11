mapper.sceneGame = {

	UI: null,

	moveDelay: 0.15,


	/**
	 * Initialize the game scene.
	 *
	 * @returns {void}
	 */
	init: function() {

		mapper.sceneGame.UI = b8.Tilemap.load( mapper.CONFIG.gameUI );

	},


	/**
	 * Update the game scene.
	 *
	 * @param {number} dt Delta time in seconds since last frame.
	 * @returns {void}
	 */
	update: function( dt ) {

		// Update frame-time systems.
		mapper.updateFrame( dt );

		mapper.sceneGame.moveDelay -= dt;
		if ( mapper.sceneGame.moveDelay > 0 ) return;

		// Get player components
		const loc = b8.ECS.getComponent( mapper.player, 'Loc' );

		let dx = 0, dy = 0, keyPressed = false;

		// Calculate direction of movement.
		// Use else if so we can only move in one direction at a time and not jump
		// over collision walls diagonally.
		if ( b8.key( "ArrowUp" ) ) { dy = -1; keyPressed = true; }
		else if ( b8.key( "ArrowDown" ) ) { dy = 1; keyPressed = true; }
		else if ( b8.key( "ArrowLeft" ) ) { dx = -1; keyPressed = true; }
		else if ( b8.key( "ArrowRight" ) ) { dx = 1; keyPressed = true; }
		let didAdvanceWorld = false;
		if ( b8.key( "ButtonA" ) ) {
			keyPressed = true;
			didAdvanceWorld = mapper.doAttack( mapper.player, 'ButtonA' ) || didAdvanceWorld;
		}
		if ( b8.key( "ButtonB" ) ) {
			keyPressed = true;
			didAdvanceWorld = mapper.doAction( mapper.player, 'ButtonB' ) || didAdvanceWorld;
		}

		// Update move delay when a key is pressed.
		if ( keyPressed ) mapper.updateMoveDelay();

		// Move player.
		if ( dx !== 0 || dy !== 0 ) {

			// Capture the player's starting tile before any movement happens.
			// b8.ECS.setLoc() mutates the existing Loc component in place, so we
			// need stable copies here to detect whether the move really succeeded.
			const startCol = loc.col;
			const startRow = loc.row;
			let newCol = loc.col + dx;
			let newRow = loc.row + dy;

			mapper.setPlayerWalkAnimation( mapper.player, dx, dy );

			// Now check for regular collision (walls etc).
			if (
				!mapper.collision.isWalkable( newCol, newRow ) ||
				mapper.doCollision( loc.col, loc.row, newCol, newRow, dx, dy )
			) {
				newCol = loc.col;
				newRow = loc.row;
			}

			b8.ECS.setComponent( mapper.player, 'Direction', { dx, dy } );
			b8.ECS.setLoc( mapper.player, newCol, newRow );
			didAdvanceWorld = ( newCol !== startCol || newRow !== startRow ) || didAdvanceWorld;

		}

		if ( didAdvanceWorld ) {
			mapper.doWorldTurn(
				{
					type: dx !== 0 || dy !== 0 ? 'move' : 'action',
					actorId: mapper.player,
				}
			);
		}

	},


	/**
	 * Render the game scene.
	 *
	 * @returns {void}
	 */
	render: function() {

		b8.cls( 0 );

		b8.locate( mapper.CONFIG.mapOffsetX, mapper.CONFIG.mapOffsetY );
		mapper.drawScreen();
		mapper.render( mapper.CONFIG.mapOffsetX, mapper.CONFIG.mapOffsetY );

		// Draw UI background.
		b8.locate( 0, b8.CONFIG.SCREEN_ROWS - mapper.sceneGame.UI.length );
		b8.Tilemap.draw( mapper.sceneGame.UI );

		// Draw currency value.
		b8.locate( 2, b8.CONFIG.SCREEN_ROWS - 2 );
		b8.color( parseInt( mapper.settings.coinColor ) || 10, 0 );
		b8.printChar( parseInt( mapper.settings.coin ) || 266 );

		b8.color( 15, 0 );
		b8.print( ' ' + parseInt( b8.Inventory.getCount( 'coin' ) ).toString().padStart( 4, '0' ) );

		// Draw heart containers.
		const health = b8.ECS.getComponent( mapper.player, 'Health' );
		const max = health.max;
		const hp = Math.floor( health.value );

		for ( let i = 0; i < Math.floor( max / 2 ); i++ ) {
			const x = 2 + i;
			const y = b8.CONFIG.SCREEN_ROWS - 3;
			b8.locate( x, y );
			if ( hp >= ( i * 2 ) + 2 ) {
				// Full heart.
				b8.color( 8, 0 );
				b8.printChar( 415 );
			} else if ( hp === ( i * 2 ) + 1 ) {
				// Half heart.
				b8.color( 8, 0 );
				b8.printChar( 416 );
			} else {
				// Empty heart.
				b8.color( 6, 0 );
				b8.printChar( 417 );
			}
		}

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

		// I add a space before the text to add a gap between the icon and the text.
		// The gap is a half tile which is harder to add directly.

		// A button.
		b8.locate( 11, b8.CONFIG.SCREEN_ROWS - 4 );
		b8.print( ' Hit' );

		// B button.
		b8.locate( 15, b8.CONFIG.SCREEN_ROWS - 4 );
		b8.print( mapper.helpers.capitalizeWords( ' ' + mapper.promptAhead( mapper.player, 'ButtonB' ) ) );

		return;

	},

};
