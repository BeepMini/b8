( function( beep8 ) {

	beep8.Intro = {};

	/**
	 * Play a sound effect.
	 *
	 * @param {string} sfx The sound effect to play.
	 * @throws {Error} If the sfx is not found.
	 */
	beep8.Intro.loading = async function( sfx ) {

		// Colour count.
		const colourCount = beep8.CONFIG.COLORS.length;
		const prefix = "8> ";

		for ( let i = 0; i < colourCount; i++ ) {

			beep8.color( i, i );
			beep8.cls();
			await beep8.Async.wait( 0.03 );

		}

		// Loop through all colours.
		beep8.color( 7, 1 );
		beep8.cls();
		beep8.locate( 1, 1 );
		beep8.print( prefix + "beep8 Loading...\n" );

		await beep8.Async.wait( 1 );

		beep8.print( prefix + "Let's 'a go!" );

		await beep8.Async.wait( 0.5 );

	}


	/**
	 * Display a splash screen.
	 *
	 * @param {string} [name="beep8 Project"] The name of the project.
	 * @returns {Promise<void>} A promise that resolves when the splash screen is dismissed.
	 */
	beep8.Intro.splash = async function() {

		let name = beep8.CONFIG.NAME;
		let startCol = 2;

		beep8.color( 7, 1 );
		beep8.cls();

		// Border.
		beep8.locate( 1, 1 );
		beep8.printBox( beep8.CONFIG.SCREEN_COLS - 2, beep8.CONFIG.SCREEN_ROWS - 2 );

		// Project title.
		startCol = Math.floor( ( beep8.CONFIG.SCREEN_COLS - name.length ) / 2 );
		beep8.locate( startCol, Math.floor( beep8.CONFIG.SCREEN_ROWS * 0.3 ) );
		beep8.print( name + "\n" );
		beep8.print( "=".repeat( name.length ) + "\n" );

		// Click to start.
		let message = "Click to start";
		if ( beep8.Core.isTouchDevice() ) message = "Tap to start";

		startCol = Math.round( ( beep8.CONFIG.SCREEN_COLS - message.length ) / 2 );
		beep8.locate( startCol, beep8.CONFIG.SCREEN_ROWS - 4 );
		beep8.print( message );

		// Wait for user input.
		await beep8.Core.inputSys.readPointerAsync();

	}


} )( beep8 || ( beep8 = {} ) );
