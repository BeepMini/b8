( function( beep8 ) {

	/**
	 * beep8.CursorRenderer class handles the rendering and blinking of the cursor.
	 */
	beep8.CursorRenderer = class {

		constructor() {
			this.blinkCycle_ = 0;
			this.toggleBlinkHandle_ = null;
		}

		/**
		 * Sets the visibility of the cursor.
		 *
		 * @param {boolean} visible - Whether the cursor should be visible
		 * @throws {TypeError} If visible is not a boolean
		 * @returns {void}
		 */
		setCursorVisible( visible ) {
			beep8.Utilities.checkBoolean( "visible", visible );

			// If the cursor is already in the desired state, do nothing.
			if ( beep8.Core.drawState.cursorVisible === visible ) return;

			beep8.Core.drawState.cursorVisible = visible;
			this.blinkCycle_ = 0;
			beep8.Core.render();

			if ( this.toggleBlinkHandle_ !== null ) {
				clearInterval( this.toggleBlinkHandle_ );
				this.toggleBlinkHandle_ = null;
			}

			// If visible, start the blink cycle.
			if ( visible ) {
				this.toggleBlinkHandle_ = setInterval(
					() => this.advanceBlink_(),
					beep8.CONFIG.CURSOR.BLINK_INTERVAL
				);
			}
		}

		/**
		 * Advances the cursor blink cycle.
		 * @private
		 * @returns {void}
		 */
		advanceBlink_() {
			this.blinkCycle_ = ( this.blinkCycle_ + 1 ) % 2;
			beep8.Core.render();
		}

		/**
		 * Draws the cursor.
		 *
		 * @param {CanvasRenderingContext2D} targetCtx - The context to draw the cursor on
		 * @param {number} canvasWidth - The width of the canvas
		 * @param {number} canvasHeight - The height of the canvas
		 * @throws {TypeError} If targetCtx is not a CanvasRenderingContext2D
		 * @throws {TypeError} If canvasWidth is not a number
		 * @throws {TypeError} If canvasHeight is not a number
		 * @returns {void}
		 */
		drawCursor( targetCtx, canvasWidth, canvasHeight ) {
			beep8.Utilities.checkInstanceOf( "targetCtx", targetCtx, CanvasRenderingContext2D );
			beep8.Utilities.checkNumber( "canvasWidth", canvasWidth );
			beep8.Utilities.checkNumber( "canvasHeight", canvasHeight );

			// If the cursor is not visible or it is not time to blink, do nothing.
			if ( !beep8.Core.drawState.cursorVisible || this.blinkCycle_ <= 0 ) return;

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
	}

} )( beep8 || ( beep8 = {} ) );
