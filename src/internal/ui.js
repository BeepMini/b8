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
	 * @param {Object} opts
	 * @param {number} [opts.width=1]
	 * @param {number} [opts.height=1]
	 * @param {string} [opts.label=""]
	 * @param {string} [opts.style="flat"]
	 * @param {boolean} [opts.disabled=false]
	 * @returns {boolean}
	 */
	b8.UI.textButton = function( opts = {} ) {

		const col = b8.Core.drawState.cursorCol;
		const row = b8.Core.drawState.cursorRow;
		const width = opts.width ?? 1;
		const height = opts.height ?? 1;
		const label = opts.label ?? "";
		const style = opts.style ?? "plain";
		const disabled = !!opts.disabled;

		drawTextButton_( col, row, width, height, label, style, disabled );

		return b8.UI.region(
			{
				width,
				height,
				disabled,
			}
		);

	};


	/**
	 * Draws a simple icon button at the current cursor position.
	 *
	 * @param {Object} opts
	 * @param {number} [opts.width=1]
	 * @param {number} [opts.height=1]
	 * @param {number} opts.icon Character / tile index
	 * @param {boolean} [opts.disabled=false]
	 * @returns {boolean}
	 */
	b8.UI.iconButton = function( opts = {} ) {

		const col = b8.Core.drawState.cursorCol;
		const row = b8.Core.drawState.cursorRow;
		const width = opts.width ?? 1;
		const height = opts.height ?? 1;
		const icon = opts.icon ?? 0;
		const style = opts.style ?? "plain";
		const disabled = !!opts.disabled;

		drawIconButton_( col, row, width, height, icon, style, disabled );

		return b8.UI.region( {
			width,
			height,
			disabled,
		} );

	}


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
	 * Draws the base button background.
	 *
	 * @param {number} col
	 * @param {number} row
	 * @param {number} width
	 * @param {number} height
	 * @returns {{fg:number,bg:number}} Previous colours
	 */
	function drawButtonBase_( width, height, style = "plain" ) {

		const oldFg = b8.Core.drawState.fgColor;
		const oldBg = b8.Core.drawState.bgColor;

		b8.TextRenderer.printStyledBox(
			width,
			height,
			{
				style
			}
		);

		return { oldFg, oldBg };

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
	 * @param {string} style
	 * @param {boolean} disabled
	 * @returns {void}
	 */
	function drawTextButton_( col, row, width, height, label, style, disabled ) {

		const oldFg = b8.Core.drawState.fgColor;
		const oldBg = b8.Core.drawState.bgColor;

		drawButtonBase_( width, height, style );

		const labelSize = b8.TextRenderer.measure( label );
		const labelRow = row + ( height / 2 ) - ( labelSize.rows / 2 );

		b8.locate( col, labelRow );

		if ( disabled ) {
			b8.color( 8, oldBg );
		}

		b8.printCentered( label, width );

		b8.color( oldFg, oldBg );
		b8.locate( col, row );

	}


	/**
	 * Draws a button with a single character icon.
	 *
	 * @param {number} col
	 * @param {number} row
	 * @param {number} width
	 * @param {number} height
	 * @param {number} char Tile index / character code
	 * @param {boolean} disabled
	 * @returns {void}
	 */
	function drawIconButton_( col, row, width, height, icon, style, disabled ) {

		const oldFg = b8.Core.drawState.fgColor;
		const oldBg = b8.Core.drawState.bgColor;

		drawButtonBase_( width, height, style );

		const iconCol = col + ( width / 2 ) - 0.5;
		const iconRow = row + ( height / 2 ) - 0.5;

		b8.locate( iconCol, iconRow );

		if ( disabled ) {
			b8.color( 8, -1 );
		}

		b8.printChar( icon );

		b8.color( oldFg, oldBg );
		b8.locate( col, row );

	}

} )( b8 );