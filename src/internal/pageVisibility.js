( function( b8 ) {

	let timeHidden = 0;
	let isHidden = false;


	/**
	 * Called when the document is hidden (blurred).
	 *
	 * @returns {void}
	 */
	function sleep() {

		if ( isHidden ) return;

		isHidden = true;

		// Document is hidden (blurred) so start the timer.
		timeHidden = Date.now();

		// Log the event and notify listeners.
		b8.Utilities.event( 'pageVisibility.sleep' );

	};


	/**
	 * Called when the document is shown (focused).
	 *
	 * @returns {void}
	 */
	function wake() {

		if ( !isHidden ) return;
		isHidden = false;

		if ( timeHidden === 0 ) return;

		// Document is shown again so the timer is stopped and totalled.
		const timeAsleep = Date.now() - timeHidden;
		b8.Utilities.log( 'Time asleep:', ( timeAsleep / 1000 ).toFixed( 3 ) );
		b8.Utilities.event( 'pageVisibility.wake', { time: timeAsleep } );
		timeHidden = 0;

	}


	// Set an event when the document loses focus (change tab/ window).
	document.addEventListener(
		'visibilitychange',
		function() {

			if ( document.hidden ) {
				sleep();
			} else {
				wake();
			}

		}
	);

	window.addEventListener( 'blur', () => sleep() );
	window.addEventListener( 'focus', () => wake() );

} )( b8 );