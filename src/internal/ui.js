( function( b8 ) {

	/**
	 * Immediate-mode UI helpers.
	 *
	 * The UI system is designed for BeepMini's ephemeral rendering model.
	 * Buttons and regions are not persistent objects. Instead, they are
	 * registered as they are drawn during the current frame, then cleared
	 * automatically before the next frame.
	 *
	 * This allows game code to simply:
	 *   - locate the cursor
	 *   - draw a button or region
	 *   - react if it returns true
	 *
	 * Example:
	 *
	 *   b8.locate( 2, 10 );
	 *   if ( b8.UI.textButton( { width: 4, height: 2, label: "RUN" } ) ) {
	 *     startProgram();
	 *   }
	 */
	b8.UI = {};


	/**
	 * Registered UI regions for the current frame.
	 *
	 * Regions are tested in reverse order so that the last drawn region
	 * takes priority when regions overlap.
	 *
	 * @type {Array<Object>}
	 */
	let regions_ = [];


	/**
	 * Registers a clickable region at the current cursor position.
	 *
	 * The region is measured in tile units, using the current cursor
	 * position as its top-left corner.
	 *
	 * A region returns true only when:
	 *   - the pointer was pressed inside it
	 *   - the pointer was released inside it
	 *   - it is the topmost matching region
	 *
	 * This function does not draw anything.
	 *
	 * @param {Object} opts
	 * @param {number} opts.width Width of the region in tiles.
	 * @param {number} opts.height Height of the region in tiles.
	 * @param {boolean} [opts.disabled=false] If true, the region cannot be activated.
	 * @returns {boolean} True if the region was clicked this frame.
	 */
	b8.UI.region = function( opts = {} ) {

		const col = b8.Core.drawState.cursorCol;
		const row = b8.Core.drawState.cursorRow;
		const width = opts.width ?? 1;
		const height = opts.height ?? 1;
		const disabled = !!opts.disabled;

		const region = {
			col,
			row,
			width,
			height,
			disabled,
		};

		regions_.push( region );

		if ( disabled ) return false;

		return b8.Input.pointerJustReleased() && isPointerInRegion_( region );

	}


	/**
	 * Draws a simple filled text button at the current cursor position.
	 *
	 * The button uses the current foreground/background colour settings
	 * for drawing. Text is centered within the button region.
	 *
	 * This helper both draws the button and registers its clickable area.
	 *
	 * @param {Object} opts
	 * @param {number} opts.width Width of the button in tiles.
	 * @param {number} opts.height Height of the button in tiles.
	 * @param {string} opts.label Text or icon to display.
	 * @param {boolean} [opts.disabled=false] If true, the button cannot be activated.
	 * @returns {boolean} True if the button was clicked this frame.
	 */
	b8.UI.textButton = function( opts = {} ) {

		const col = b8.Core.drawState.cursorCol;
		const row = b8.Core.drawState.cursorRow;
		const width = opts.width ?? 1;
		const height = opts.height ?? 1;
		const label = opts.label ?? "";
		const disabled = !!opts.disabled;

		const clicked = b8.UI.region( {
			width,
			height,
			disabled,
		} );

		drawTextButton_( col, row, width, height, label, disabled );

		return clicked;
	}


	/**
	 * Ends UI processing for the frame.
	 *
	 * This is called internally by the engine at the end of each frame.
	 * It clears transient press state after releases have been processed.
	 *
	 * @returns {void}
	 */
	b8.UI.onEndFrame = function() {

		activeRegionId_ = null;

	}


	/**
	 * Resets all UI state immediately.
	 *
	 * This can be used to cancel active presses, for example when opening a
	 * menu in response to a button press. It is not usually necessary to call
	 * this directly, but it can be useful in some cases.
	 *
	 * @returns {void}
	 */
	b8.UI.reset = function() {

		regions_ = [];

	}


	/**
	 * Checks whether the current pointer position is inside a region.
	 *
	 * @param {Object} region
	 * @returns {boolean}
	 */
	function isPointerInRegion_( region ) {

		const pointer = b8.Input.pointerTile();

		return (
			pointer.col >= region.col &&
			pointer.col < region.col + region.width &&
			pointer.row >= region.row &&
			pointer.row < region.row + region.height
		);

	}


	/**
	 * Draws a simple filled button using text cells.
	 *
	 * This is intentionally minimal and is meant as a first-pass helper.
	 * More advanced button styles, such as framed or tile-skinned buttons,
	 * can be built on top later.
	 *
	 * @param {number} col
	 * @param {number} row
	 * @param {number} width
	 * @param {number} height
	 * @param {string} label
	 * @param {boolean} disabled
	 * @returns {void}
	 */
	function drawTextButton_( col, row, width, height, label, disabled ) {

		// Cache current colours so we can restore them afterwards.
		const oldFg = b8.Core.drawState.fgColor;
		const oldBg = b8.Core.drawState.bgColor;

		// Fill the button area with spaces using the current colours.
		b8.printRect( width, height, 0 );

		// Centre the label within the button area.
		const labelSize = b8.TextRenderer.measure( label );
		const labelCol = col;
		const labelRow = row + ( height / 2 ) - ( labelSize.rows / 2 );

		b8.locate( labelCol, labelRow );
		b8.printCentered( label, width );

		// Dim disabled buttons a little by forcing a muted foreground.
		if ( disabled ) {
			b8.color( 8, oldBg );
			b8.printCentered( label, width );
		}

		// Restore original colours and cursor.
		b8.color( oldFg, oldBg );
		b8.locate( col, row );

	}

} )( b8 );