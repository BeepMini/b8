( function() {

	// AudioContext.
	const audioCtx = new AudioContext();

	// Cache for generated note buffers.
	const noteBuffers = {};

	// Scheduler variables.
	let schedulerInterval = null;
	let schedules = []; // Array of event arrays per track.
	let schedulePointers = []; // Next event index per track.
	let playbackStartTime = 0; // When playback starts.
	let tempo = 120; // Default tempo.
	const lookaheadTime = 0.5; // Only schedule events within the next 0.5 seconds.
	const schedulerIntervalMs = 50; // Check every 50ms.
	const volumeMultiplier = 0.2; // Volume multiplier.

	// iOS audio unlock flag.
	let unlocked = false;

	// -----------------------------
	// Instrument synthesis functions.
	// -----------------------------
	const sineComponent = ( x, offset ) => Math.sin( x * 6.28 + offset );

	const pianoWaveform = ( x ) => {
		return sineComponent( x, Math.pow( sineComponent( x, 0 ), 2 ) +
			sineComponent( x, 0.25 ) * 0.75 +
			sineComponent( x, 0.5 ) * 0.1 ) * volumeMultiplier;
	}

	const piano2WaveForm = ( x ) => {
		return ( Math.sin( x * 6.28 ) * Math.sin( x * 3.14 ) ) * volumeMultiplier;
	}
	const sineWaveform = ( x ) => {
		return Math.sin( 2 * Math.PI * x ) * volumeMultiplier;
	}
	const squareWaveform = ( x ) => {
		return ( Math.sin( 2 * Math.PI * x ) >= 0 ? 1 : -1 ) * volumeMultiplier;
	}
	const sawtoothWaveform = ( x ) => {
		let t = x - Math.floor( x );
		return ( 2 * t - 1 ) * volumeMultiplier;
	};
	const triangleWaveform = ( x ) => {
		let t = x - Math.floor( x );
		return ( 2 * Math.abs( 2 * t - 1 ) - 1 ) * volumeMultiplier;
	};
	const drumWaveform = ( x ) => {
		return ( ( Math.random() * 2 - 1 ) * Math.exp( -x / 10 ) ) * volumeMultiplier;
	};
	const softDrumWaveform = ( x ) => {
		return ( Math.sin( x * 2 ) + 0.3 * ( Math.random() - 0.5 ) ) *
			Math.exp( -x / 15 ) * volumeMultiplier * 2;
	};

	// Mapping of instrument ids to synthesis functions.
	// 0: Piano, 1: Piano 2, 2: Sine, 3: Sawtooth, 4: Square, 5: Triangle, 6: Drum, 7: Soft Drum
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
	// Main Music Player Function (p1)
	// -----------------------------
	/**
	 * Use as a tag template literal:
	 *
	 *     p1`
	 *     0|f  dh   d T-X   X  T    X X V|
	 *     1|Y   Y Y Y Y Y Y Y   Y Y Y Y Y Y|
	 *     0|V   X   T   T   c   c   T   X|
	 *     0|c fVa a-   X T R  aQT Ta   RO- X|
	 *     [70.30]
	 *     `
	 */
	function p1( params ) {

		if ( Array.isArray( params ) ) {
			params = params[ 0 ];
		}
		if ( !params || params.trim() === '' ) {
			p1.stop();
			return;
		}

		if ( noteBuffers.length > 200 ) {
			console.warn( "Beep8.Music: Note buffers exceeded limit, clearing old buffers." );
			noteBuffers = {};
		}

		// Reset defaults.
		tempo = 125;
		let baseNoteDuration = 0.5; // seconds per note.
		schedules = [];

		// Split input into lines.
		const rawLines = params.split( '\n' ).map( line => line.trim() );
		let noteInterval = tempo / 1000; // seconds per note step.

		// Regular expression for track lines: instrument|track data|
		const trackLineRegex = /^([0-9])\|(.*)\|$/;

		rawLines.forEach( line => {
			if ( !line ) return;

			// Tempo/note duration lines.
			if ( ( line.startsWith( '[' ) && line.endsWith( ']' ) ) || ( /^\d+(\.\d+)?$/.test( line ) ) ) {
				const timing = line.replace( /[\[\]]/g, '' ).split( '.' );
				tempo = parseFloat( timing[ 0 ] ) || tempo;
				baseNoteDuration = ( parseFloat( timing[ 1 ] ) || 50 ) / 100;
				noteInterval = tempo / 1000;
				return;
			}

			// Track lines.
			if ( !trackLineRegex.test( line ) ) {
				console.error( "Track lines must be in the format 'instrument|track data|': " + line );
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
		} );

		// Initialize schedule pointers and calculate loop duration.
		schedulePointers = schedules.map( () => 0 );
		playbackStartTime = audioCtx.currentTime + 0.1;

		p1.stop();
		schedulerInterval = setInterval( schedulerFunction, schedulerIntervalMs );
	}


	/**
	 * The scheduler function ensures the notes are played at the right time.
	 *
	 * This function is called every 50ms to check if any notes need to be played.
	 *
	 * The scheduler keeps track of the current time and the current note interval.
	 * It then checks each track to see if a note needs to be played.
	 *
	 * @returns {void}
	 */
	function schedulerFunction() {

		const currentTime = audioCtx.currentTime;
		const noteInterval = tempo / 1000; // note duration in seconds
		// Use the larger of the fixed lookahead and the current note interval.
		const effectiveLookahead = Math.max( lookaheadTime, noteInterval );
		schedules.forEach( ( events, trackIndex ) => {
			let pointer = schedulePointers[ trackIndex ];
			const trackLength = events.length;
			if ( trackLength === 0 ) return;
			const step = pointer % trackLength;
			const loopCount = Math.floor( pointer / trackLength );
			const eventTime = playbackStartTime + ( step * noteInterval ) + ( loopCount * trackLength * noteInterval );
			if ( eventTime < currentTime + effectiveLookahead ) {
				const event = events[ step ];
				if ( event.noteBuffer ) {
					playNoteBuffer( event.noteBuffer, audioCtx, eventTime );
				}
				schedulePointers[ trackIndex ]++;
			}
		} );
		if ( !p1.loop ) {
			const done = schedules.every( ( events, i ) => schedulePointers[ i ] >= events.length );
			if ( done ) {
				p1.stop();
			}
		}
	}


	/**
	 * Stop playback by clearing the scheduler and stopping all playing sources.
	 */
	p1.stop = function() {
		if ( schedulerInterval !== null ) {
			clearInterval( schedulerInterval );
			schedulerInterval = null;
		}
		playingSources.forEach( source => source.stop() );
		playingSources = [];
	};


	/**
	 * Check if music is currently playing.
	 */
	p1.isPlaying = function() {
		return schedulerInterval !== null;
	};


	/**
	 * Set the tempo (in BPM).
	 */
	p1.setTempo = function( newTempo ) {
		if ( newTempo < 50 ) newTempo = 50;

		// Calculate old and new note intervals in seconds.
		const oldNoteInterval = tempo / 1000;
		const newNoteInterval = newTempo / 1000;

		// Determine how much time has elapsed since playback started.
		const elapsed = audioCtx.currentTime - playbackStartTime;

		// Compute the current note position (could be fractional).
		const currentIndex = elapsed / oldNoteInterval;

		// Rebase playbackStartTime so that the currentIndex now corresponds to the current time.
		playbackStartTime = audioCtx.currentTime - currentIndex * newNoteInterval;

		// Finally, update the tempo.
		tempo = newTempo;
	};


	p1.clearCache = function() {
		noteBuffers = {};
	};


	// Loop property: set to true to repeat playback.
	p1.loop = true;

	/**
	 * Create an audio buffer for a given note.
	 */
	const createNoteBuffer = ( note, durationSeconds, sampleRate, instrumentFn ) => {
		const key = note + '-' + durationSeconds + '-' + instrumentFn.name;
		let buffer = noteBuffers[ key ];
		if ( note >= 0 && !buffer ) {
			const frequencyFactor = 65.406 * Math.pow( 1.06, note ) / sampleRate;
			const totalSamples = Math.floor( sampleRate * durationSeconds );
			const attackSamples = 88;
			const decaySamples = sampleRate * ( durationSeconds - 0.002 );
			buffer = noteBuffers[ key ] = audioCtx.createBuffer( 1, totalSamples, sampleRate );
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
				playNoteBuffer( buffer, audioCtx, audioCtx.currentTime, true );
				unlocked = true;
			}
		}
		return buffer;
	};

	// Array to keep track of currently playing sources.
	let playingSources = [];


	/**
	 * Play an audio buffer at a scheduled time.
	 */
	const playNoteBuffer = ( buffer, context, when, stopImmediately = false ) => {
		const source = context.createBufferSource();
		source.buffer = buffer;
		source.connect( context.destination );
		source.start( when );
		playingSources.push( source );
		if ( stopImmediately ) {
			source.stop();
		}
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
