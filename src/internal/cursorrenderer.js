( function( beep8 ) {

	/**
	 * beep8.CursorRenderer handles the rendering and blinking of the cursor.
	 */
	beep8.CursorRenderer = {};

	let blinkCycle_ = 0;
	let toggleBlinkHandle_ = null;


	/**
	 * Set the visibility of the cursor.
	 *
	 * @param {boolean} visible - Whether the cursor should be visible
	 * @returns {void}
	 */
	beep8.CursorRenderer.setCursorVisible = function( visible ) {

		beep8.Utilities.checkBoolean( "visible", visible );

		// If the cursor is already in the desired state, do nothing.
		if ( beep8.Core.drawState.cursorVisible === visible ) return;

		beep8.Core.drawState.cursorVisible = visible;

		blinkCycle_ = 0;
		beep8.Renderer.render();

		if ( toggleBlinkHandle_ !== null ) {
			clearInterval( toggleBlinkHandle_ );
			toggleBlinkHandle_ = null;
		}

		// If visible, start the blink cycle.
		if ( visible ) {
			toggleBlinkHandle_ = setInterval(
				() => advanceBlink_(),
				beep8.CONFIG.CURSOR.BLINK_INTERVAL
			);
		}

	}


	/**
	 * Draws the flashing cursor.
	 * This is called automatically in the beep8 render function so does not
	 * need to be called manually.
	 *
	 * @param {CanvasRenderingContext2D} targetCtx - The context to draw the cursor on
	 * @returns {void}
	 */
	beep8.CursorRenderer.draw = function( targetCtx ) {

		beep8.Utilities.checkInstanceOf( "targetCtx", targetCtx, CanvasRenderingContext2D );

		// If the cursor is not visible or it is not time to blink, do nothing.
		if ( !beep8.Core.drawState.cursorVisible || blinkCycle_ <= 0 ) return;

		const font = beep8.TextRenderer.getFont();

		// Calculate the real position of the cursor.
		const realX = beep8.Core.drawState.cursorCol * beep8.CONFIG.CHR_WIDTH;
		const realY = beep8.Core.drawState.cursorRow * beep8.CONFIG.CHR_HEIGHT;

		// Draw the cursor.
		targetCtx.fillStyle = beep8.Core.getColorHex( beep8.Core.drawState.fgColor );

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
		beep8.Renderer.render();

	}


} )( beep8 || ( beep8 = {} ) );
