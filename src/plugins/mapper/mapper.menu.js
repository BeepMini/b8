mapper.menu = {

	/**
	 * Get the instructions text.
	 *
	 * @returns {string} The instructions text.
	 */
	getInstructions: function() {

		if ( mapper.hasInstructions() ) {
			return mapper.settings.instructions;
		}
		return '';

	},


	/**
	 * Check if there are instructions available.
	 *
	 * @returns {boolean} True if instructions are available, false otherwise.
	 */
	hasInstructions: function() {

		return !!mapper.settings.instructions;

	},


	/**
	 * Get the credits text.
	 *
	 * @returns {string} The credits text.
	 */
	getCredits: function() {

		if ( mapper.hasCredits() ) {
			return mapper.settings.credits;
		}

		return '';

	},


	/**
	 * Check if there are credits available.
	 *
	 * @returns {boolean} True if credits are available, false otherwise.
	 */
	hasCredits: function() {

		return !!mapper.settings.credits;

	},


	/**
	 * Draw the splash screen.
	 *
	 * @returns {void}
	 */
	drawSplash: function() {

		if ( mapper.bg.splash ) {
			beep8.Tilemap.draw( mapper.bg.splash );

			// Beep8 Logo
			console.log( 'Drawing Beep8 logo' );
			beep8.locate( beep8.CONFIG.SCREEN_COLS - 1, beep8.CONFIG.SCREEN_ROWS - 1 );
			beep8.color( 15, 0 );
			beep8.printChar( 88 );
		}

	},


	/**
	 * Check if there is a splash screen available.
	 *
	 * @returns {boolean} True if a splash screen is available, false otherwise.
	 */
	hasSplash: function() {

		return !!mapper.bg.splash;

	},

};