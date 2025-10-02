( function( b8 ) {

	b8.Menu = {};


	/**
	 * Displays a menu with the given choices and returns the index of the selected choice.
	 *
	 * Displaying a menu will pause the execution of other elements of your game
	 * until a choice has been made.
	 *
	 * The menu automatically beeps and boops as the player navigates through the choices.
	 *
	 * The options object can contain the following properties:
	 * - options.title - The title of the menu.
	 * - options.prompt - The prompt to display above the choices.
	 * - options.selBgColor - The background color of the selected choice. Defaults to the current foreground colour.
	 * - options.selFgColor - The foreground color of the selected choice. Defaults to the current background colour.
	 * - options.border - Whether to draw a border around the menu. Defaults to true.
	 * - options.borderChar - The character to use for the border.
	 * - options.center - Whether to center the menu horizontally and vertically.
	 * - options.centerH - Whether to center the menu horizontally.
	 * - options.centerV - Whether to center the menu vertically.
	 * - options.padding - The padding around the prompt and choices.
	 * - options.selIndex - The index of the initially selected choice.
	 * - options.typewriter - display the prompt as a typewriter effect.
	 *
	 * @param {string[]} choices - The choices to display.
	 * @param {object} [options] - Options for the menu.
	 * @returns {Promise<number>} A promise that resolves to the index of the selected choice.
	 */
	b8.Menu.display = async function( choices, options ) {

		options = options || {};
		b8.Utilities.checkArray( "choices", choices );
		b8.Utilities.checkObject( "options", options );

		options = Object.assign(
			{
				title: "",
				prompt: "",
				selBgColor: b8.Core.drawState.fgColor,
				selFgColor: b8.Core.drawState.bgColor,
				border: true,
				borderChar: b8.CONFIG.BORDER_CHAR,
				center: false,
				centerH: false,
				centerV: false,
				padding: 1,
				selIndex: 0,
				typewriter: false
			},
			options
		);

		let startCol = b8.Core.drawState.cursorCol;
		let startRow = b8.Core.drawState.cursorRow;

		const promptSize = b8.TextRenderer.measure( options.prompt );
		const prompt01 = options.prompt ? 1 : 0;
		const border01 = options.borderChar ? 1 : 0;
		let choicesCols = 0;
		const choicesRows = choices.length;

		choices.forEach(
			( choice ) => {
				choicesCols = Math.ceil( Math.max( choicesCols, b8.TextRenderer.measure( choice ).cols ) );
			}
		);

		let totalCols = Math.ceil( Math.max( promptSize.cols, choicesCols ) ) + 2 * options.padding + 2 * border01;
		totalCols = Math.min( totalCols, b8.CONFIG.SCREEN_COLS );

		const totalRows = prompt01 * ( promptSize.rows + 1 ) + choicesRows + 2 * options.padding + 2 * border01;

		if ( options.centerH || options.center ) {
			startCol = Math.round( ( b8.CONFIG.SCREEN_COLS - totalCols ) / 2 );
		}

		if ( options.centerV || options.center ) {
			startRow = Math.round( ( b8.CONFIG.SCREEN_ROWS - totalRows ) / 2 );
		}

		b8.Core.drawState.cursorCol = startCol;
		b8.Core.drawState.cursorRow = startRow;

		if ( options.border ) {

			// Print the background & border.
			b8.TextRenderer.printBox( totalCols, totalRows, true, options.borderChar );

			// Print title at the top of the border.
			if ( options.title ) {
				const t = " " + options.title + " ";
				b8.Core.drawState.cursorCol = startCol + Math.round( ( totalCols - t.length ) / 2 );
				b8.TextRenderer.print( t );
			}

		}

		if ( options.prompt ) {

			b8.Core.drawState.cursorCol = promptSize.cols <= totalCols ?
				( startCol + border01 + options.padding ) :
				( startCol + Math.round( ( totalCols - promptSize.cols ) / 2 ) );
			b8.Core.drawState.cursorRow = startRow + border01 + options.padding;

			if ( options.typewriter ) {
				await b8.Async.typewriter( options.prompt );
			} else {
				b8.TextRenderer.print( options.prompt );
			}

		}

		// TODO: save the screen image before showing the menu and restore it later.

		let selIndex = options.selIndex;

		while ( true ) {

			// Draw choices.
			b8.Core.drawState.cursorRow = startRow + border01 + options.padding + prompt01 * ( promptSize.rows + 1 );
			b8.Core.drawState.cursorCol = ( promptSize.cols <= choicesCols ) ?
				( startCol + border01 + options.padding ) :
				( startCol + Math.round( ( totalCols - choicesCols ) / 2 ) );

			printChoices( choices, selIndex, options );

			const k = await b8.Input.readKeyAsync();

			if ( k.includes( "ArrowUp" ) ) {

				// Go up the menu.
				selIndex = selIndex > 0 ? selIndex - 1 : choices.length - 1;
				if ( choices.length > 1 ) b8.Sfx.play( b8.CONFIG.SFX.MENU_UP );

			} else if ( k.includes( "ArrowDown" ) ) {

				// Go down the menu.
				selIndex = ( selIndex + 1 ) % choices.length;
				if ( choices.length > 1 ) b8.Sfx.play( b8.CONFIG.SFX.MENU_DOWN );

			} else if (
				k.includes( "Enter" ) ||
				k.includes( "ButtonA" ) ||
				k.includes( "ButtonB" ) ||
				k.includes( " " )
			) {

				// Select menu item.
				b8.Sfx.play( b8.CONFIG.SFX.MENU_SELECT );
				return selIndex;

			}

		}

	}


	/**
	 * Prints the choices for a menu highlighting the current choice.
	 *
	 * The options object should contain the following properties:
	 * - options.selBgColor - The background color of the selected choice.
	 * - options.selFgColor - The foreground color of the selected choice.
	 *
	 * @param {string[]} choices - The choices to print.
	 * @param {number} selIndex - The index of the selected choice.
	 * @param {object} options - Options for the menu.
	 * @returns {void}
	 */
	const printChoices = function( choices, selIndex, options ) {

		const origBg = b8.Core.drawState.bgColor;
		const origFg = b8.Core.drawState.fgColor;

		for ( let i = 0; i < choices.length; i++ ) {
			const isSel = i === selIndex;
			b8.Core.setColor( isSel ? options.selFgColor : origFg, isSel ? options.selBgColor : origBg );
			b8.TextRenderer.print( choices[ i ] + "\n" );
		}

		b8.Core.setColor( origFg, origBg );

	}

} )( b8 );
