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

	let repeatIntervals = null;

	const VJOY_HTML = `
<div class="vjoy-options">
<button id='vjoy-button-ter' class='vjoy-button'>Start</button>
<button id='vjoy-button-screenshot' class='vjoy-button'>Snap</button>
</div>
<div class="vjoy-controls">
<div class="vjoy-dpad">
<button id='vjoy-button-up' class='vjoy-button'><span>U</span></button>
<button id='vjoy-button-right' class='vjoy-button'><span>R</span></button>
<button id='vjoy-button-left' class='vjoy-button'><span>L</span></button>
<button id='vjoy-button-down' class='vjoy-button'><span>D</span></button>
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
	--b8-vjoy-button-color: #333;
	--b8-vjoy-button-size: 14vw;
	--b8-vjoy-button-dpad-size: calc(var(--b8-vjoy-button-size) * 2);
	--b8-console-radius: 2rem;
}

.vjoy-container,
.vjoy-container * {
	box-sizing: border-box;
	user-select: none;
	-webkit-user-select: none;
	-webkit-touch-callout: none;
	touch-action: none;
}

.vjoy-container {
position: relative;
width: 100%;
padding: 8vw 6vw;
background: deeppink;
border-radius: 0 0 var(--b8-console-radius) var(--b8-console-radius);
}

.vjoy-options {
border-radius: 5rem;
position: absolute;
display: flex;
gap: 2vw;
align-items: center;
padding: 2vw;
border-radius: 2rem;
background: inherit;
top: -4vw;
left: 50%;
transform: translateX(-50%);
}

.vjoy-controls {
display: flex;
gap: 5vw;
justify-content: space-between;
align-items: center;
}

.vjoy-dpad {
aspect-ratio: 1;
max-width: var(--b8-vjoy-button-dpad-size);
width: 100%;
display: grid;
grid-template-columns: 1fr 1fr;
grid-template-rows: 1fr 1fr;
flex-wrap: wrap;
transform: rotate(45deg);
border-radius: calc(var(--b8-vjoy-button-dpad-size) / 5);
overflow: hidden;
background:black;
gap: 1px;
border: 2px solid black;
}

.vjoy-dpad button {
	width: 100%;
	height: 100%;
}
.vjoy-dpad button span {
	transform: rotate(-45deg);
}

.vjoy-buttons {
display: flex;
gap: 2vw;
}

.vjoy-buttons button {
	width: var(--b8-vjoy-button-size);
	max-width: 5rem;
	max-height: 5rem;
	height: var(--b8-vjoy-button-size);
	border-radius: 5rem;
	touch-action: none;
}

.vjoy-button {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	background: var(--b8-vjoy-button-color) !important;
	border: none;
	font: bold 14px monospace;
	color: #999 !important;
	user-select: none;
	touch-callout: none;
	-webkit-user-select: none;
	-webkit-touch-callout: none;
	text-shadow: 0 -2px 0 black;
	padding: 0;
}

.vjoy-button:active,
.vjoy-button:active {
	background: black;
}

#vjoy-button-pri {
	margin-top: calc(var(--b8-vjoy-button-size) / 2);
}

#vjoy-button-screenshot,
#vjoy-button-ter {
	width: calc(var(--b8-vjoy-button-size) * 1.4);
	padding: 1vw;
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
		beep8.Joystick.setUpButton( "vjoy-button-ter", "Enter" );
		beep8.Joystick.setUpButton( "vjoy-button-screenshot", "0" );

		// Prevent touches on the document body from doing what they usually do (opening
		// context menus, selecting stuff, etc).
		document.body.addEventListener( "touchstart", e => e.preventDefault() );

		document.addEventListener( 'pointerup', ( e ) => {
			// Loop over any active buttons stored in repeatIntervals.
			for ( const buttonKey in repeatIntervals ) {
				if ( repeatIntervals.hasOwnProperty( buttonKey ) ) {
					// Call handleButtonEvent with false to release the button.
					beep8.Joystick.handleButtonEvent( buttonKey, false, e );
				}
			}
		} );

		document.addEventListener( 'pointercancel', ( e ) => {
			for ( const buttonKey in repeatIntervals ) {
				if ( repeatIntervals.hasOwnProperty( buttonKey ) ) {
					beep8.Joystick.handleButtonEvent( buttonKey, false, e );
				}
			}
		} );


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
			( e ) => {
				e.preventDefault();
				beep8.Joystick.handleButtonEvent( buttonKeyName, true, e );
			},
			{ passive: false }
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
			"pointermove",
			( e ) => {
				// Prevent default behavior for pointermove events.
				e.preventDefault();
			},
			{ passive: false }
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

		// Add key property to event.
		evt.key = buttonKeyName;

		// Initialize repeat intervals container if not already created.
		if ( !repeatIntervals ) {
			repeatIntervals = {};
		}

		if ( down ) {

			// Call onKeyDown immediately.
			beep8.Input.onKeyDown( evt );

			// If no timer exists for this button, start one.
			if ( !repeatIntervals[ buttonKeyName ] ) {
				repeatIntervals[ buttonKeyName ] = {};

				// Set a timeout for the initial delay.
				repeatIntervals[ buttonKeyName ].initialTimeout = setTimeout(
					function() {
						// After the delay, start repeating.
						repeatIntervals[ buttonKeyName ].interval = setInterval(
							function() {
								beep8.Input.onKeyDown( evt );
							},
							150
						);
					},
					150
				);
			}

		} else {

			// Clear any timers if they exist.
			if ( repeatIntervals[ buttonKeyName ] ) {
				if ( repeatIntervals[ buttonKeyName ].initialTimeout ) {
					clearTimeout( repeatIntervals[ buttonKeyName ].initialTimeout );
				}
				if ( repeatIntervals[ buttonKeyName ].interval ) {
					clearInterval( repeatIntervals[ buttonKeyName ].interval );
				}
				delete repeatIntervals[ buttonKeyName ];
			}

			beep8.Input.onKeyUp( evt );

		}

		evt.preventDefault();

	}

} )( beep8 || ( beep8 = {} ) );
