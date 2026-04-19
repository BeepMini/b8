( function( b8 ) {

	/**
	 * Immediate-mode UI helpers.
	 *
	 * The UI system follows BeepMini’s ephemeral rendering model:
	 * - UI elements are declared during rendering
	 * - No persistent widget state is stored
	 * - Input is resolved immediately and consumed
	 *
	 * This keeps UI logic simple, predictable, and stateless.
	 */
	b8.UI = {};


	/**
	 * Registers a clickable region at the current cursor position.
	 *
	 * A region is defined in tile space using the current cursor as
	 * the top-left corner.
	 *
	 * This uses the input system’s tap model:
	 * - A tap persists until consumed
	 * - Only one region can consume a tap
	 *
	 * @param {Object} opts
	 * @param {number} [opts.width=1] Width in tiles
	 * @param {number} [opts.height=1] Height in tiles
	 * @param {boolean} [opts.disabled=false] Whether the region is inactive
	 * @returns {boolean} True if this region consumed the tap
	 */
	b8.UI.region = function( opts = {} ) {

		const rect = getCurrentRect_( opts );

		if ( rect.disabled ) return false;

		return consumeTapInRect_( rect );

	};


	/**
	 * Draws a simple text button at the current cursor position.
	 *
	 * This helper:
	 * - Registers a clickable region
	 * - Draws a filled rectangle
	 * - Centers the label within the region
	 *
	 * @param {Object} opts
	 * @param {number} [opts.width=1] Width in tiles
	 * @param {number} [opts.height=1] Height in tiles
	 * @param {string} [opts.label=""] Text to display
	 * @param {boolean} [opts.disabled=false] Whether the button is inactive
	 * @returns {boolean} True if the button was clicked this frame
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

	};


	/**
	 * Resets UI state.
	 *
	 * Currently no persistent state is stored, but this exists for
	 * future expansion and consistency with other subsystems.
	 *
	 * @returns {void}
	 */
	b8.UI.reset = function() {
		// No-op for now.
	};


	/**
	 * Builds a rectangle from the current cursor position.
	 *
	 * @param {Object} opts
	 * @returns {{col:number,row:number,width:number,height:number,disabled:boolean}}
	 */
	function getCurrentRect_( opts = {} ) {

		return {
			col: b8.Core.drawState.cursorCol,
			row: b8.Core.drawState.cursorRow,
			width: opts.width ?? 1,
			height: opts.height ?? 1,
			disabled: !!opts.disabled,
		};

	}


	/**
	 * Tests whether a pending tap falls within a rectangle.
	 * If it does, the tap is consumed.
	 *
	 * This ensures:
	 * - One tap triggers only one UI element
	 * - Input remains deterministic and frame-independent
	 *
	 * @param {Object} rect
	 * @returns {boolean}
	 */
	function consumeTapInRect_( rect ) {

		if ( !b8.Input.hasTap() ) return false;

		const tap = b8.Input.tapTile();

		const hit =
			tap.col >= rect.col &&
			tap.col < rect.col + rect.width &&
			tap.row >= rect.row &&
			tap.row < rect.row + rect.height;

		if ( !hit ) return false;

		b8.Input.consumeTap();
		return true;

	}


	/**
	 * Draws a filled text button using tile cells.
	 *
	 * The button uses the current draw colours.
	 * The label is centered within the region.
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

		// Preserve current draw colours.
		const oldFg = b8.Core.drawState.fgColor;
		const oldBg = b8.Core.drawState.bgColor;

		// Fill button background.
		b8.printRect( width, height, 0 );

		// Measure label for vertical centering.
		const labelSize = b8.TextRenderer.measure( label );
		const labelRow = row + ( height / 2 ) - ( labelSize.rows / 2 );

		b8.locate( col, labelRow );

		// Apply disabled styling.
		if ( disabled ) {
			b8.color( 8, oldBg );
		}

		// Draw label centered horizontally.
		b8.printCentered( label, width );

		// Restore previous draw state.
		b8.color( oldFg, oldBg );
		b8.locate( col, row );

	}

} )( b8 );