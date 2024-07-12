( function( beep8 ) {

	/**
	 * CursorRenderer class handles the rendering and blinking of the cursor.
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
			beep8.utilities.checkBoolean( "visible", visible );

			// If the cursor is already in the desired state, do nothing.
			if ( beep8.core.drawState.cursorVisible === visible ) return;

			beep8.core.drawState.cursorVisible = visible;
			this.blinkCycle_ = 0;
			beep8.core.render();

			if ( this.toggleBlinkHandle_ !== null ) {
				clearInterval( this.toggleBlinkHandle_ );
				this.toggleBlinkHandle_ = null;
			}

			// If visible, start the blink cycle.
			if ( visible ) {
				this.toggleBlinkHandle_ = setInterval(
					() => this.advanceBlink_(),
					CONFIG.CURSOR.BLINK_INTERVAL
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
			beep8.core.render();
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
			beep8.utilities.checkInstanceOf( "targetCtx", targetCtx, CanvasRenderingContext2D );
			beep8.utilities.checkNumber( "canvasWidth", canvasWidth );
			beep8.utilities.checkNumber( "canvasHeight", canvasHeight );

			// If the cursor is not visible or it is not time to blink, do nothing.
			if ( !beep8.core.drawState.cursorVisible || this.blinkCycle_ <= 0 ) return;

			const ratio = canvasWidth / beep8.core.canvas.width;

			// Calculate the real position of the cursor.
			const realX = Math.round(
				( beep8.core.drawState.cursorCol + 0.5 - CONFIG.CURSOR.WIDTH_F / 2 + CONFIG.CURSOR.OFFSET_H ) *
				CONFIG.CHR_WIDTH * ratio
			);
			const realY = Math.round(
				( beep8.core.drawState.cursorRow + 1 - CONFIG.CURSOR.HEIGHT_F - CONFIG.CURSOR.OFFSET_V ) *
				CONFIG.CHR_HEIGHT * ratio
			);

			// Draw the cursor.
			targetCtx.fillStyle = beep8.core.getColorHex( beep8.core.drawState.fgColor );
			targetCtx.fillRect(
				realX, realY,
				Math.round( CONFIG.CURSOR.WIDTH_F * CONFIG.CHR_WIDTH * ratio ),
				Math.round( CONFIG.CURSOR.HEIGHT_F * CONFIG.CHR_HEIGHT * ratio )
			);
		}
	}

} )( beep8 || ( beep8 = {} ) );
