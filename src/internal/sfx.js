( function( beep8 ) {


	/**
	 * Sound effect library.
	 *
	 * @see https://codepen.io/KilledByAPixel/pen/BaowKzv?editors=1000
	 * @see https://codepen.io/KilledByAPixel/pen/BaowKzv?editors=1000
	 * @type {Object}
	 */
	const sfxLibrary = {
		coin: {
			staccato: 0.55,
			notes: [
				"E5 e",
				"E6 q"
			]
		},
		coin2: {
			notes: [
				'G5 e',
				'G6 q',
			]
		},
		jump: {
			smoothing: 1,
			notes: [
				"E4 e",
				"E3 q"
			]
		},
		change: {
			notes: [
				"B3 e",
				"D4b e",
				"D4 e",
				"E4 e"
			]
		},
		die: {
			staccato: 0.55,
			gain: 0.4,
			notes: [
				"E0 e",
				"F0 e",
				"E0 h",
			]
		},
		knockout: {
			staccato: 0.2,
			notes: [
				"E6 e",
				"E5 e",
				"E4 e",
				"E3 q",
			]
		},
		dash: {
			smoothing: 1,
			notes: [
				"E2 q",
				"E5 q"
			]
		},
		beep: {
			staccato: 0.55,
			waveType: 'sine',
			gain: 0.8,
			notes: [
				'G3 e',
			]
		},
		beep2: {
			staccato: 0.55,
			waveType: 'sine',
			gain: 0.7,
			notes: [
				'G4 e',
			]
		},
		beep3: {
			staccato: 0.55,
			waveType: 'sine',
			gain: 0.7,
			notes: [
				'G5 e',
			]
		},
		stars: {
			staccato: 0.2,
			waveType: 'triangle',
			gain: 0.5,
			notes: [
				'C6 s',
				'C6 s',
				'B6 s',
				'B6 s',
				'A6 s',
			]
		},
		engine: {
			customWave: [ [ -1, 1, -1, 1, -1, 1 ], [ 1, 0, 1, 0, 1, 0 ] ],
			gain: 0.8,
			notes: [
				'C1 w',
				'C1 w'
			]
		},
		next: {
			customWave: [ -1, -0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9, 1 ],
			gain: 0.8,
			notes: [
				'C2 e',
				'C3 e',
				'D2 e',
				'D3 e',
				'E2 e',
				'E3 e',
			]
		},
		start: {
			notes: [
				'D4 h',
				'- h',
				'D4 h',
				'- h',
				'G4 w',
			]
		},
		buzzbuzzbuzz: {
			gain: 0.35,
			notes: [
				'E1 e',
				'- s',
				'E1 e',
				'- s',
				'E1 e',
				'- s',
				'E1 e',
				'- s',
				'E1 e',
				'- s',
				'E1 e',
				'- s',
				'E1 e',
				'- s',
				'E1 e',
			]
		},
		siren: {
			smoothing: 0.5,
			notes: [
				'C4 h',
				'A3 h',
				'C4 h',
				'A3 h',
				'C4 h',
				'A3 h',
				'C4 h',
				'A3 h',
				'C4 h',
				'A3 h',
			],
		},
		click: {
			staccato: 0.8,
			notes: [
				'A5 e',
			]
		},
	};


	/**
	 * Cached sequence objects.
	 *
	 * @type {Object}
	 */
	const sfxSequence = {};


	/**
	 * AudioContext object.
	 *
	 * @type {AudioContext}
	 */
	const audioContext = typeof AudioContext !== 'undefined' ? new AudioContext : new webkitAudioContext;


	beep8.Sfx = {};


	/**
	 * Play a sound effect.
	 *
	 * @param {string} sfx The sound effect to play.
	 * @throws {Error} If the sfx is not found.
	 */
	beep8.Sfx.play = function( sfx ) {

		// AudioContext is not supported.
		if ( !audioContext ) {
			return;
		}

		beep8.Utilities.checkString( 'sfx', sfx );

		// SFX not found.
		if ( !sfxLibrary[ sfx ] ) {
			beep8.Utilities.error( `SFX ${sfx} not found.` );
		}

		// Setup the sfx sequence if it doesn't exist.
		if ( !sfxSequence[ sfx ] ) {

			sfxSequence[ sfx ] = new TinyMusic.Sequence(
				audioContext,
				sfxLibrary[ sfx ].tempo || 300,
				sfxLibrary[ sfx ].notes
			);

			sfxSequence[ sfx ].loop = false;
			sfxSequence[ sfx ].gain.gain.value = sfxLibrary[ sfx ].gain || 0.1;

			if ( sfxLibrary[ sfx ].staccato ) {
				sfxSequence[ sfx ].staccato = sfxLibrary[ sfx ].staccato;
			}

			if ( sfxLibrary[ sfx ].smoothing ) {
				sfxSequence[ sfx ].smoothing = sfxLibrary[ sfx ].smoothing;
			}

			if ( sfxLibrary[ sfx ].waveType ) {
				sfxSequence[ sfx ].waveType = sfxLibrary[ sfx ].waveType;
			}

			if ( sfxLibrary[ sfx ].customWave ) {

				beep8.Utilities.checkArray( 'customWave', sfxLibrary[ sfx ].customWave );

				if ( sfxLibrary[ sfx ].customWave.length === 2 ) {
					sfxSequence[ sfx ].createCustomWave( sfxLibrary[ sfx ].customWave[ 0 ], sfxLibrary[ sfx ].customWave[ 1 ] );
				} else {
					sfxSequence[ sfx ].createCustomWave( sfxLibrary[ sfx ].customWave );
				}

			}

		}

		sfxSequence[ sfx ].play( audioContext.currentTime );

	}


	/**
	 * Get the list of sfx from the library.
	 *
	 * @return {Array} The list of sfx.
	 */
	beep8.Sfx.get = function() {

		// return sfxLibrary keys.
		return Object.keys( sfxLibrary );

	}

} )( beep8 || ( beep8 = {} ) );
