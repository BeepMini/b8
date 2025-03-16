( function() {

	// Constants for audio setup.
	const NUMBER_OF_TRACKS = 4;
	const CONTEXTS_PER_TRACK = 3;
	const TOTAL_CONTEXTS = Math.ceil( NUMBER_OF_TRACKS * CONTEXTS_PER_TRACK * 1.2 );

	// Cache for generated note buffers.
	const noteBuffers = {};

	// Create multiple AudioContext objects.
	const audioContexts = Array.from( { length: TOTAL_CONTEXTS }, () => new AudioContext() );

	// Scheduler variables.
	let schedulerInterval = null;
	let schedules = []; // Array of event arrays per track.
	let schedulePointers = []; // Next event index per track.
	let playbackStartTime = 0; // When playback starts.
	let loopDuration = 0; // Duration (in seconds) of one full loop.
	const lookaheadTime = 0.5; // Seconds to schedule ahead.
	const schedulerIntervalMs = 1000 * ( lookaheadTime - 0.1 ); // Scheduler check interval.
	const volumeMultiplier = 0.2; // Volume multiplier.

	// iOS audio unlock flag.
	let unlocked = false;

	// -----------------------------
	// Instrument synthesis functions.
	// -----------------------------

	// Helper sine component.
	const sineComponent = ( x, offset ) => {
		return Math.sin( x * 6.28 + offset );
	};

	// Piano: uses a more complex modulation.
	const pianoWaveform = ( x ) => {
		return sineComponent(
			x,
			Math.pow( sineComponent( x, 0 ), 2 ) +
			sineComponent( x, 0.25 ) * 0.75 +
			sineComponent( x, 0.5 ) * 0.1
		) * volumeMultiplier;
	};

	const piano2WaveForm = ( x ) => {
		return ( Math.sin( x * 6.28 ) * Math.sin( x * 3.14 ) ) * volumeMultiplier;
	};

	// Sine waveform
	const sineWaveform = ( x ) => {
		return Math.sin( 2 * Math.PI * x ) * volumeMultiplier;
	};

	// Square waveform
	const squareWaveform = ( x ) => {
		return ( Math.sin( 2 * Math.PI * x ) >= 0 ? 1 : -1 ) * volumeMultiplier;
	};

	// Sawtooth waveform
	const sawtoothWaveform = ( x ) => {
		let t = x - Math.floor( x );
		return ( 2 * t - 1 ) * volumeMultiplier;
	};

	// Triangle waveform
	const triangleWaveform = ( x ) => {
		let t = x - Math.floor( x );
		return ( 2 * Math.abs( 2 * t - 1 ) - 1 ) * volumeMultiplier;
	};

	// Drum: a simple noise burst.
	const drumWaveform = ( x ) => {
		return ( ( Math.random() * 2 - 1 ) * Math.exp( -x / 10 ) ) * volumeMultiplier;
	};

	const softDrumWaveform = ( x ) => {
		return ( 1 * Math.sin( x * 2 ) + 0.3 * ( Math.random() - 0.5 ) ) * Math.exp( -x / 15 ) * volumeMultiplier * 2;
	};

	// Mapping of instrument ids to synthesis functions.
	// 0: Piano (default)
	// 1: Piano 2
	// 2: Sine
	// 3: Sawtooth
	// 4: Square
	// 5: Triangle
	// 6: Drum
	// 7: Soft Drum
	const instrumentMapping = [
		pianoWaveform,
		piano2WaveForm,
		sineWaveform,
		sawtoothWaveform,
		squareWaveform,
		triangleWaveform,
		drumWaveform,
		softDrumWaveform,
	];

	// -----------------------------
	// Music player with lookahead scheduling.
	// -----------------------------

	/**
	 * Main function to play music in the p1 format.
	 *
	 * Use it as a tag template literal. For example:
	 *
	 *     p1`
	 *     0|f  dh   d T-X   X  T    X X V|
	 *     1|Y   Y Y Y Y Y Y Y   Y Y Y Y Y Y|
	 *     0|V   X   T   T   c   c   T   X|
	 *     0|c fVa a-   X T R  aQT Ta   RO- X|
	 *     [70.30]
	 *     `
	 *
	 * Tempo lines are detected if the line is entirely numeric (or wrapped in [ ]).
	 * Track lines must be in the format: instrument|track data|
	 *
	 * Passing an empty string stops playback.
	 *
	 * @param {Array|string} params Music data.
	 */
	function p1( params ) {

		if ( Array.isArray( params ) ) {
			params = params[ 0 ];
		}

		if ( !params || params.trim() === '' ) {
			p1.stop();
			return;
		}

		// Default settings.
		let tempo = 125; // ms per note step.
		let baseNoteDuration = 0.5; // seconds per note.
		schedules = [];

		// Split input into lines.
		const rawLines = params.split( '\n' ).map( line => line.trim() );
		let noteInterval = tempo / 1000; // in seconds

		// Regular expression for track lines: instrument digit, then |, then track data, then |
		const trackLineRegex = /^([0-9])\|(.*)\|$/;

		rawLines.forEach(
			line => {

				if ( !line ) return;

				// Check for tempo/note duration line.
				// Tempo lines are entirely numeric or wrapped in [ ].
				if ( ( line.startsWith( '[' ) && line.endsWith( ']' ) ) || ( /^\d+(\.\d+)?$/.test( line ) ) ) {
					const timing = line.replace( /[\[\]]/g, '' ).split( '.' );
					tempo = parseFloat( timing[ 0 ] ) || tempo;
					baseNoteDuration = ( parseFloat( timing[ 1 ] ) || 50 ) / 100;
					noteInterval = tempo / 1000;
					return;
				}

				// Check for track lines in the new format.
				if ( !trackLineRegex.test( line ) ) {
					console.error( "Track lines must be in the format 'instrument id|track data|': " + line );
					return;
				}

				const match = line.match( trackLineRegex );
				const instrumentId = parseInt( match[ 1 ], 10 );
				const instrumentFn = instrumentMapping[ instrumentId ] || instrumentMapping[ 0 ];
				const trackData = match[ 2 ].trim();

				let events = [];
				// Parse trackData character by character.
				for ( let i = 0; i < trackData.length; i++ ) {
					const char = trackData[ i ];
					let dashCount = 1;
					while ( i + dashCount < trackData.length && trackData[ i + dashCount ] === '-' ) {
						dashCount++;
					}
					let eventTime = i * noteInterval;
					if ( char === ' ' ) {
						events.push( { startTime: eventTime, noteBuffer: null } );
						i += dashCount - 1;
						continue;
					}
					let noteValue = char.charCodeAt( 0 );
					noteValue -= noteValue > 90 ? 71 : 65;
					let noteDuration = dashCount * baseNoteDuration * ( tempo / 125 );
					let noteBuffer = createNoteBuffer( noteValue, noteDuration, 44100, instrumentFn );
					events.push( { startTime: eventTime, noteBuffer: noteBuffer } );
					i += dashCount - 1;
				}

				schedules.push( events );

			}
		);

		// Initialize scheduler.
		schedulePointers = schedules.map( () => 0 );
		loopDuration = Math.max(
			...schedules.map( events =>
				events.length > 0 ? events[ events.length - 1 ].startTime + noteInterval : 0
			)
		);
		playbackStartTime = audioContexts[ 0 ].currentTime + 0.1;

		p1.stop();

		schedulerInterval = setInterval( schedulerFunction, schedulerIntervalMs );

	}


	/**
	 * Lookahead scheduler to schedule note events ahead of time.
	 * This function is called at regular intervals to schedule note events.
	 *
	 * The scheduler uses a lookahead time to schedule events ahead of time.
	 *
	 * The scheduler will stop playback if all tracks have reached the end of their events.
	 *
	 * The scheduler will stop playback if the p1.loop property is set to false.
	 *
	 * This function iterates over scheduled events and plays them when appropriate.
	 *
	 */
	function schedulerFunction() {
		const currentTime = audioContexts[ 0 ].currentTime;
		schedules.forEach(
			( events, trackIndex ) => {
				let pointer = schedulePointers[ trackIndex ];
				while ( true ) {
					if ( events.length === 0 ) break;

					const localIndex = pointer % events.length;
					const loopCount = Math.floor( pointer / events.length );
					const event = events[ localIndex ];
					const eventTime = playbackStartTime + event.startTime + loopCount * loopDuration;
					if ( eventTime < currentTime + lookaheadTime ) {
						if ( event.noteBuffer ) {
							const contextIndex =
								( trackIndex * CONTEXTS_PER_TRACK ) +
								( localIndex % CONTEXTS_PER_TRACK );
							playNoteBuffer( event.noteBuffer, audioContexts[ contextIndex ], eventTime );
						}
						pointer++;
						schedulePointers[ trackIndex ] = pointer;
					} else {
						break;
					}
				}
			}
		);

		if ( !p1.loop ) {
			const done = schedules.every( ( events, i ) => schedulePointers[ i ] >= events.length );
			if ( done ) {
				p1.stop();
			}
		}

	}


	/**
	 * Stop playback by clearing the scheduler.
	 *
	 * @returns {void}
	 */
	p1.stop = function() {

		if ( schedulerInterval !== null ) {
			clearInterval( schedulerInterval );
			schedulerInterval = null;
		}

		// Stop all currently playing sources
		playingSources.forEach( source => source.stop() );
		playingSources = [];

	};


	/**
	 * Check if music is currently playing.
	 *
	 * @returns {boolean} True if playing, else false.
	 */
	p1.isPlaying = function() {

		return schedulerInterval !== null;

	};


	// Loop property: set to true to repeat playback.
	p1.loop = true;


	/**
	 * Create an audio buffer for a given note.
	 *
	 * @param {number} note - Note value.
	 * @param {number} durationSeconds - Duration in seconds.
	 * @param {number} sampleRate - Sample rate.
	 * @param {function} instrumentFn - Instrument synthesis function.
	 * @returns {AudioBuffer} The generated buffer.
	 */
	const createNoteBuffer = ( note, durationSeconds, sampleRate, instrumentFn ) => {

		// Include instrument function name in key for caching.
		const key = note + '-' + durationSeconds + '-' + instrumentFn.name;
		let buffer = noteBuffers[ key ];

		if ( note >= 0 && !buffer ) {
			const frequencyFactor = 65.406 * Math.pow( 1.06, note ) / sampleRate;
			const totalSamples = Math.floor( sampleRate * durationSeconds );
			const attackSamples = 88;
			const decaySamples = sampleRate * ( durationSeconds - 0.002 );
			buffer = noteBuffers[ key ] = audioContexts[ 0 ].createBuffer( 1, totalSamples, sampleRate );
			const channelData = buffer.getChannelData( 0 );

			for ( let i = 0; i < totalSamples; i++ ) {
				let amplitude;
				if ( i < attackSamples ) {
					amplitude = i / ( attackSamples + 0.2 );
				} else {
					amplitude = Math.pow(
						1 - ( ( i - attackSamples ) / decaySamples ),
						Math.pow( Math.log( 1e4 * frequencyFactor ) / 2, 2 )
					);
				}
				channelData[ i ] = amplitude * instrumentFn( i * frequencyFactor );
			}

			// Unlock audio on iOS if needed.
			if ( !unlocked ) {
				audioContexts.forEach(
					( context ) => {
						playNoteBuffer( buffer, context, context.currentTime, true );
					}
				);
				unlocked = true;
			}
		}
		return buffer;

	};


	// Add this array to keep track of currently playing sources
	let playingSources = [];

	/**
	 * Play an audio buffer using a given AudioContext at a scheduled time.
	 *
	 * @param {AudioBuffer} buffer - The note buffer.
	 * @param {AudioContext} context - The audio context.
	 * @param {number} when - Absolute time (in seconds) to start playback.
	 * @param {boolean} [stopImmediately=false] - Whether to stop immediately after starting.
	 * @returns {void}
	 */
	const playNoteBuffer = ( buffer, context, when, stopImmediately = false ) => {

		const source = context.createBufferSource();
		source.buffer = buffer;
		source.connect( context.destination );
		source.start( when );

		playingSources.push( source );

		/**
		 * The stopImmediately parameter is likely to unlock audio on iOS devices.
		 * iOS requires a user interaction to start audio playback, so this parameter
		 * allows the function to start and immediately stop the audio buffer to
		 * unlock the audio context without actually playing any sound.
		 */
		if ( stopImmediately ) {
			source.stop();
		}

		// Remove the source from the playingSources array when it ends
		source.onended = () => {
			const index = playingSources.indexOf( source );
			if ( index !== -1 ) {
				playingSources.splice( index, 1 );
			}
		};

	};


	// Expose the p1 function globally.
	window.p1 = p1;

} )();
