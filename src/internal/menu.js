( function( beep8 ) {

	/**
	 * Displays a menu with the given choices and returns the index of the selected choice.
	 *
	 *
	 * @param {string[]} choices - The choices to display.
	 * @param {object} [options] - Options for the menu.
	 * @param {string} [options.title=""] - The title of the menu.
	 * @param {string} [options.prompt=""] - The prompt to display above the choices.
	 * @param {string} [options.selBgColor=main.drawState.fgColor] - The background color of the selected choice.
	 * @param {string} [options.selFgColor=main.drawState.bgColor] - The foreground color of the selected choice.
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
	async function menu( choices, options ) {

		options = options || {};
		qut.checkArray( "choices", choices );
		qut.checkObject( "options", options );

		options = Object.assign(
			{
				title: "",
				prompt: "",
				selBgColor: main.drawState.fgColor,
				selFgColor: main.drawState.bgColor,
				bgChar: 32,
				borderChar: 0x80,
				center: false,
				centerH: false,
				centerV: false,
				padding: 1,
				selIndex: 0,
				cancelable: false,
			},
			options
		);

		let startCol = main.drawState.cursorCol;
		let startRow = main.drawState.cursorRow;

		const promptSize = main.textRenderer.measure( options.prompt );
		const prompt01 = options.prompt ? 1 : 0;
		const border01 = options.borderChar ? 1 : 0;
		let choicesCols = 0;
		const choicesRows = choices.length;
		choices.forEach( choice => choicesCols = Math.max( choicesCols, choice.length ) );

		const totalCols = Math.max( promptSize.cols, choicesCols ) + 2 * options.padding + 2 * border01;
		const totalRows = prompt01 * ( promptSize.rows + 1 ) + choicesRows + 2 * options.padding + 2 * border01;

		if ( options.centerH || options.center ) {
			startCol = Math.round( ( CONFIG.SCREEN_COLS - totalCols ) / 2 );
		}

		if ( options.centerV || options.center ) {
			startRow = Math.round( ( CONFIG.SCREEN_ROWS - totalRows ) / 2 );
		}

		main.drawState.cursorCol = startCol;
		main.drawState.cursorRow = startRow;

		// Print the background.
		main.textRenderer.printRect( totalCols, totalRows, options.bgChar );

		// Print the border.
		if ( options.borderChar ) {
			main.textRenderer.printBox( totalCols, totalRows, false, options.borderChar );
			// Print title at the top of the border.
			if ( options.title ) {
				const t = " " + options.title + " ";
				main.drawState.cursorCol = startCol + Math.round( ( totalCols - t.length ) / 2 );
				main.textRenderer.print( t );
			}
		}

		if ( options.prompt ) {
			main.drawState.cursorCol = promptSize.cols <= totalCols ?
				( startCol + border01 + options.padding ) :
				( startCol + Math.round( ( totalCols - promptSize.cols ) / 2 ) );
			main.drawState.cursorRow = startRow + border01 + options.padding;
			main.textRenderer.print( options.prompt );
		}

		// TODO: save the screen image before showing the menu and restore it later.

		let selIndex = options.selIndex;

		while ( true ) {

			// Draw choices.
			main.drawState.cursorRow = startRow + border01 + options.padding + prompt01 * ( promptSize.rows + 1 );
			main.drawState.cursorCol = ( promptSize.cols <= choicesCols ) ?
				( startCol + border01 + options.padding ) :
				( startCol + Math.round( ( totalCols - choicesCols ) / 2 ) );

			printChoices( choices, selIndex, options );

			const k = await main.inputSys.readKeyAsync();

			if ( k === "ArrowUp" ) {
				selIndex = selIndex > 0 ? selIndex - 1 : choices.length - 1;
			} else if ( k === "ArrowDown" ) {
				selIndex = ( selIndex + 1 ) % choices.length;
			} else if ( k === "Enter" || k === "ButtonA" ) {
				// TODO: erase menu
				return selIndex;
			} else if ( ( k === "Escape" || k === "ButtonB" ) && options.cancelable ) {
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
	beep8.printChoices = function( choices, selIndex, options ) {

		const origBg = main.drawState.bgColor;
		const origFg = main.drawState.fgColor;

		for ( let i = 0; i < choices.length; i++ ) {
			const isSel = i === selIndex;
			main.setColor( isSel ? options.selFgColor : origFg, isSel ? options.selBgColor : origBg );
			main.textRenderer.print( choices[ i ] + "\n" );
		}

		main.setColor( origFg, origBg );

	}

	beep8.menu = menu;

} )( beep8 || ( beep8 = {} ) );
