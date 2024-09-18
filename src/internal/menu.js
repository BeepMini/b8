( function( beep8 ) {

	beep8.Menu = {};


	/**
	 * Displays a menu with the given choices and returns the index of the selected choice.
	 *
	 *
	 * @param {string[]} choices - The choices to display.
	 * @param {object} [options] - Options for the menu.
	 * @param {string} [options.title=""] - The title of the menu.
	 * @param {string} [options.prompt=""] - The prompt to display above the choices.
	 * @param {string} [options.selBgColor=beep8.Core.drawState.fgColor] - The background color of the selected choice.
	 * @param {string} [options.selFgColor=beep8.Core.drawState.bgColor] - The foreground color of the selected choice.
	 * @param {number} [options.bgChar=32] - The character to use for the background.
	 * @param {number} [options.borderChar=0x80] - The character to use for the border.
	 * @param {boolean} [options.center=false] - Whether to center the menu horizontally and vertically.
	 * @param {boolean} [options.centerH=false] - Whether to center the menu horizontally.
	 * @param {boolean} [options.centerV=false] - Whether to center the menu vertically.
	 * @param {number} [options.padding=1] - The padding around the prompt and choices.
	 * @param {number} [options.selIndex=0] - The index of the initially selected choice.
	 * @param {boolean} [options.cancelable=false] - Whether the menu can be canceled with the Escape key.
	 * @returns {Promise<number>} A promise that resolves to the index of the selected choice.
	 */
	beep8.Menu.display = async function( choices, options ) {

		options = options || {};
		beep8.Utilities.checkArray( "choices", choices );
		beep8.Utilities.checkObject( "options", options );

		options = Object.assign(
			{
				title: "",
				prompt: "",
				selBgColor: beep8.Core.drawState.fgColor,
				selFgColor: beep8.Core.drawState.bgColor,
				bgChar: 0,
				borderChar: beep8.CONFIG.BORDER_CHAR,
				center: false,
				centerH: false,
				centerV: false,
				padding: 1,
				selIndex: 0,
				cancelable: false,
			},
			options
		);

		let startCol = beep8.Core.drawState.cursorCol;
		let startRow = beep8.Core.drawState.cursorRow;

		const promptSize = beep8.Core.textRenderer.measure( options.prompt );
		const prompt01 = options.prompt ? 1 : 0;
		const border01 = options.borderChar ? 1 : 0;
		let choicesCols = 0;
		const choicesRows = choices.length;

		choices.forEach(
			( choice ) => {
				choicesCols = Math.max( choicesCols, choice.length );
			}
		);

		let totalCols = Math.max( promptSize.cols, choicesCols ) + 2 * options.padding + 2 * border01;
		totalCols = Math.min( totalCols, beep8.CONFIG.SCREEN_COLS );

		const totalRows = prompt01 * ( promptSize.rows + 1 ) + choicesRows + 2 * options.padding + 2 * border01;

		if ( options.centerH || options.center ) {
			startCol = Math.round( ( beep8.CONFIG.SCREEN_COLS - totalCols ) / 2 );
		}

		if ( options.centerV || options.center ) {
			startRow = Math.round( ( beep8.CONFIG.SCREEN_ROWS - totalRows ) / 2 );
		}

		beep8.Core.drawState.cursorCol = startCol;
		beep8.Core.drawState.cursorRow = startRow;

		// Print the background.
		beep8.Core.textRenderer.printRect( totalCols, totalRows, options.bgChar );

		// Print the border.
		if ( options.borderChar ) {

			beep8.Core.textRenderer.printBox( totalCols, totalRows, false, options.borderChar );

			// Print title at the top of the border.
			if ( options.title ) {
				const t = " " + options.title + " ";
				beep8.Core.drawState.cursorCol = startCol + Math.round( ( totalCols - t.length ) / 2 );
				beep8.Core.textRenderer.print( t );
			}
		}

		if ( options.prompt ) {
			beep8.Core.drawState.cursorCol = promptSize.cols <= totalCols ?
				( startCol + border01 + options.padding ) :
				( startCol + Math.round( ( totalCols - promptSize.cols ) / 2 ) );
			beep8.Core.drawState.cursorRow = startRow + border01 + options.padding;
			beep8.Core.textRenderer.print( options.prompt );
		}

		// TODO: save the screen image before showing the menu and restore it later.

		let selIndex = options.selIndex;

		while ( true ) {

			// Draw choices.
			beep8.Core.drawState.cursorRow = startRow + border01 + options.padding + prompt01 * ( promptSize.rows + 1 );
			beep8.Core.drawState.cursorCol = ( promptSize.cols <= choicesCols ) ?
				( startCol + border01 + options.padding ) :
				( startCol + Math.round( ( totalCols - choicesCols ) / 2 ) );

			beep8.Menu.printChoices( choices, selIndex, options );

			const k = await beep8.Core.inputSys.readKeyAsync();

			if ( k.includes( "ArrowUp" ) ) {

				// Go up the menu.
				selIndex = selIndex > 0 ? selIndex - 1 : choices.length - 1;
				if ( choices.length > 1 ) beep8.Sfx.play( beep8.CONFIG.SFX.MENU_UP );

			} else if ( k.includes( "ArrowDown" ) ) {

				// Go down the menu.
				selIndex = ( selIndex + 1 ) % choices.length;
				if ( choices.length > 1 ) beep8.Sfx.play( beep8.CONFIG.SFX.MENU_DOWN );

			} else if ( k.includes( "Enter" ) || k.includes( "ButtonA" ) ) {

				// Select menu item.
				beep8.Sfx.play( beep8.CONFIG.SFX.MENU_SELECT );
				return selIndex;

			} else if ( ( k.includes( "Escape" ) || k.includes( "ButtonB" ) ) && options.cancelable ) {

				// Close menu.
				return -1;

			}

		}

	}


	/**
	 * Prints the choices for a menu.
	 *
	 * @param {string[]} choices - The choices to print.
	 * @param {number} selIndex - The index of the selected choice.
	 * @param {object} options - Options for the menu.
	 * @param {string} options.selBgColor - The background color of the selected choice.
	 * @param {string} options.selFgColor - The foreground color of the selected choice.
	 * @returns {void}
	 */
	beep8.Menu.printChoices = function( choices, selIndex, options ) {

		const origBg = beep8.Core.drawState.bgColor;
		const origFg = beep8.Core.drawState.fgColor;

		for ( let i = 0; i < choices.length; i++ ) {
			const isSel = i === selIndex;
			beep8.Core.setColor( isSel ? options.selFgColor : origFg, isSel ? options.selBgColor : origBg );
			beep8.Core.textRenderer.print( choices[ i ] + "\n" );
		}

		beep8.Core.setColor( origFg, origBg );

	}

} )( beep8 || ( beep8 = {} ) );
