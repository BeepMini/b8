( function( beep8 ) {

	/**
	 * Virtual joystick setup.
	 *
	 * This module sets up a virtual joystick for mobile devices.
	 * The joystick has two parts: a directional pad on the left side of the screen,
	 * and three buttons on the right side of the screen.
	 * The directional pad has up, down, left, and right buttons.
	 * The right side has three buttons, labeled A, B, and =.
	 */
	beep8.Joystick = {};


	const VJOY_HTML = `
<button id='vjoy-button-ter' class='vjoy-button'>Start</button>
<div class="vjoy-controls">
<div class="vjoy-dpad">
<button id='vjoy-button-up' class='vjoy-button'>Up</button>
<button id='vjoy-button-down' class='vjoy-button'>Down</button>
<button id='vjoy-button-left' class='vjoy-button'>Left</button>
<button id='vjoy-button-right' class='vjoy-button'>Right</button>
<div id='vjoy-button-center'></div>
</div>
<div class="vjoy-buttons">
<button id='vjoy-button-pri' class='vjoy-button'>A</button>
<button id='vjoy-button-sec' class='vjoy-button'>B</button>
</div>
</div>`;


	/**
	 * The CSS for the virtual joystick.
	 *
	 * @type {string}
	 */
	const VJOY_CSS = `
:root {
	--vjoy-button-color: #444;
	--vjoy-button-dpad-size: 40vw;
}

.vjoy-container,
.vjoy-container * {
	box-sizing: border-box;
	user-select: none;
	-webkit-user-select: none;
	-webkit-touch-callout: none;
}

.vjoy-container {
width: 100%;
padding: 0 5vw;
}

.vjoy-controls {
display: flex;
gap: 5vw;
justify-content: space-between;
align-items: center;
}

.vjoy-dpad {
aspect-ratio: 1;
display: grid;
grid-template-columns: 1fr 1fr 1fr;
grid-template-rows: 1fr 1fr 1fr;
width: var(--vjoy-button-dpad-size);
}

.vjoy-buttons {
display: flex;
gap: 5vw;
}

.vjoy-buttons button {
	width: calc( var(--vjoy-button-dpad-size) / 3 );
	height: calc( var(--vjoy-button-dpad-size) / 3 );
	border-radius: 5rem;
}

.vjoy-button {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	background: #444;
	border: none;
	font: bold 14px monospace;
	color: #888;
	user-select: none;
	touch-callout: none;
	-webkit-user-select: none;
	-webkit-touch-callout: none;
}
.vjoy-button:active,
.vjoy-button:active {
	background: #888;
}

#vjoy-button-up {
	grid-area: 1 / 2;
	border-radius: 1rem 1rem 0 0;
}

#vjoy-button-down {
	grid-area: 3 / 2;
	border-radius: 0 0 1rem 1rem;
}

#vjoy-button-left {
	grid-area: 2 / 1;
	border-radius: 1rem 0 0 1rem;
}

#vjoy-button-right {
	grid-area: 2 / 3;
	border-radius: 0 1rem 1rem 0;
}

#vjoy-button-center {
	grid-column: 2;
	grid-row: 2;
	background: #444;
}

#vjoy-button-pri {
	margin-top: 5vw;
}

#vjoy-button-ter {
	height: 10vw;
	border-radius: 1rem;
}
`;


	/**
	 * Sets up the virtual joystick.
	 *
	 * @returns {void}
	 */
	beep8.Joystick.setup = function() {

		beep8.Utilities.log( "Setting up virtual joystick..." );

		// Add controller styles.
		const styleEl = document.createElement( "style" );
		styleEl.setAttribute( "type", "text/css" );
		styleEl.innerText = VJOY_CSS;
		document.body.appendChild( styleEl );

		// Create a container element
		const container = document.createElement( 'div' );
		container.className = 'vjoy-container';
		container.innerHTML = VJOY_HTML;

		beep8.Core.getBeepContainerEl().appendChild( container );

		setTimeout( beep8.Joystick.continueSetup, 10 );

	}


	/**
	 * Continues setting up the virtual joystick.
	 *
	 * @returns {void}
	 */
	beep8.Joystick.continueSetup = function() {

		beep8.Joystick.setUpButton( "vjoy-button-up", "ArrowUp" );
		beep8.Joystick.setUpButton( "vjoy-button-down", "ArrowDown" );
		beep8.Joystick.setUpButton( "vjoy-button-left", "ArrowLeft" );
		beep8.Joystick.setUpButton( "vjoy-button-right", "ArrowRight" );
		beep8.Joystick.setUpButton( "vjoy-button-pri", "ButtonA" );
		beep8.Joystick.setUpButton( "vjoy-button-sec", "ButtonB" );
		beep8.Joystick.setUpButton( "vjoy-button-ter", "Escape" );

		// Prevent touches on the document body from doing what they usually do (opening
		// context menus, selecting stuff, etc).
		document.body.addEventListener( "touchstart", e => e.preventDefault() );

	}


	/**
	 * Sets up a virtual joystick button.
	 * If buttonKeyName is null, the button will be hidden.
	 * Otherwise, the button will be set up to simulate the given key.
	 *
	 * @param {string} buttonId - The ID of the button element
	 * @param {string} buttonKeyName - The key name to simulate
	 * @returns {void}
	 */
	beep8.Joystick.setUpButton = function( buttonId, buttonKeyName ) {

		const button = beep8.Utilities.assert(
			document.getElementById( buttonId ),
			"Could not find button ID " + buttonId
		);

		if ( buttonKeyName === null ) {
			// This means the user wants to hide the button.
			button.style.display = "none";
			return;
		}

		button.addEventListener(
			"pointerdown",
			( e ) => beep8.Joystick.handleButtonEvent( buttonKeyName, true, e )
		);

		button.addEventListener(
			"pointerstart",
			( e ) => beep8.Joystick.handleButtonEvent( buttonKeyName, true, e )
		);

		button.addEventListener(
			"pointerup",
			( e ) => beep8.Joystick.handleButtonEvent( buttonKeyName, false, e )
		);

		button.addEventListener(
			"pointerend",
			( e ) => beep8.Joystick.handleButtonEvent( buttonKeyName, false, e )
		);

		button.addEventListener(
			"contextmenu",
			( e ) => e.preventDefault()
		);

	}


	/**
	 * Handles a button event.
	 *
	 * @param {string} buttonKeyName - The key name to simulate
	 * @param {boolean} down - Whether the button is being pressed or released
	 * @param {Event} evt - The event object
	 * @returns {void}
	 */
	beep8.Joystick.handleButtonEvent = function( buttonKeyName, down, evt ) {

		console.log( 'handleButtonEvent', buttonKeyName, down, evt );

		if ( down ) {
			beep8.Core.inputSys.onKeyDown( { key: buttonKeyName } );
		} else {
			beep8.Core.inputSys.onKeyUp( { key: buttonKeyName } );
		}

		evt.preventDefault();

	}

} )( beep8 || ( beep8 = {} ) );
