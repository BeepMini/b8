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
	 * Draws the cursor.
	 *
	 * @param {CanvasRenderingContext2D} targetCtx - The context to draw the cursor on
	 * @param {number} canvasWidth - The width of the canvas
	 * @param {number} canvasHeight - The height of the canvas
	 * @returns {void}
	 */
	beep8.CursorRenderer.draw = function( targetCtx, canvasWidth, canvasHeight ) {

		beep8.Utilities.checkInstanceOf( "targetCtx", targetCtx, CanvasRenderingContext2D );
		beep8.Utilities.checkNumber( "canvasWidth", canvasWidth );
		beep8.Utilities.checkNumber( "canvasHeight", canvasHeight );

		// If the cursor is not visible or it is not time to blink, do nothing.
		if ( !beep8.Core.drawState.cursorVisible || blinkCycle_ <= 0 ) return;

		const ratio = canvasWidth / beep8.Core.canvas.width;

		// Calculate the real position of the cursor.
		const realX = Math.round(
			( beep8.Core.drawState.cursorCol + 0.5 - beep8.CONFIG.CURSOR.WIDTH_F / 2 + beep8.CONFIG.CURSOR.OFFSET_H ) *
			beep8.CONFIG.CHR_WIDTH * ratio
		);

		const realY = Math.round(
			( beep8.Core.drawState.cursorRow + 1 - beep8.CONFIG.CURSOR.HEIGHT_F - beep8.CONFIG.CURSOR.OFFSET_V ) *
			beep8.CONFIG.CHR_HEIGHT * ratio
		);

		// Draw the cursor.
		targetCtx.fillStyle = beep8.Core.getColorHex( beep8.Core.drawState.fgColor );

		targetCtx.fillRect(
			realX, realY,
			Math.round( beep8.CONFIG.CURSOR.WIDTH_F * beep8.CONFIG.CHR_WIDTH * ratio ),
			Math.round( beep8.CONFIG.CURSOR.HEIGHT_F * beep8.CONFIG.CHR_HEIGHT * ratio )
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
