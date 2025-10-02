( function( b8 ) {

	/**
	 * b8.CursorRenderer handles the rendering and blinking of the cursor.
	 */
	b8.CursorRenderer = {};

	let blinkCycle_ = 0;
	let toggleBlinkHandle_ = null;


	/**
	 * Set the visibility of the cursor.
	 *
	 * @param {boolean} visible - Whether the cursor should be visible
	 * @returns {void}
	 */
	b8.CursorRenderer.setCursorVisible = function( visible ) {

		b8.Utilities.checkBoolean( "visible", visible );

		// If the cursor is already in the desired state, do nothing.
		if ( b8.Core.drawState.cursorVisible === visible ) return;

		b8.Core.drawState.cursorVisible = visible;

		blinkCycle_ = 0;
		b8.Renderer.render();

		if ( toggleBlinkHandle_ !== null ) {
			clearInterval( toggleBlinkHandle_ );
			toggleBlinkHandle_ = null;
		}

		// If visible, start the blink cycle.
		if ( visible ) {
			toggleBlinkHandle_ = setInterval(
				() => advanceBlink_(),
				b8.CONFIG.CURSOR.BLINK_INTERVAL
			);
		}

	}


	/**
	 * Draws the flashing cursor.
	 * This is called automatically in the b8 render function so does not
	 * need to be called manually.
	 *
	 * @param {CanvasRenderingContext2D} targetCtx - The context to draw the cursor on
	 * @returns {void}
	 */
	b8.CursorRenderer.draw = function( targetCtx ) {

		b8.Utilities.checkInstanceOf( "targetCtx", targetCtx, CanvasRenderingContext2D );

		// If the cursor is not visible or it is not time to blink, do nothing.
		if ( !b8.Core.drawState.cursorVisible || blinkCycle_ <= 0 ) return;

		const font = b8.TextRenderer.getFont();

		// Calculate the real position of the cursor.
		const realX = b8.Core.drawState.cursorCol * b8.CONFIG.CHR_WIDTH;
		const realY = b8.Core.drawState.cursorRow * b8.CONFIG.CHR_HEIGHT;

		// Draw the cursor.
		targetCtx.fillStyle = b8.Core.getColorHex( b8.Core.drawState.fgColor );

		targetCtx.fillRect(
			realX + 1, realY + 1,
			font.charWidth_ - 2, font.charHeight_ - 2
		);

	}


	/**
	 * Advances the cursor blink cycle.
	 *
	 * @private
	 * @returns {void}
	 */
	function advanceBlink_() {

		blinkCycle_ = ( blinkCycle_ + 1 ) % 2;
		b8.Renderer.render();

	}


} )( b8 );
