( function( beep8 ) {

	beep8.Music = {};

	const BAR_LENGTH = 8;
	const BARS_PER_PATTERN = 1;
	const PATTERN_LENGTH = BAR_LENGTH * BARS_PER_PATTERN;
	const PATTERN_COUNT = 4;
	const KEYRANGE = [ 13, 25, 37 ];

	beep8.Music.songs_ = {};
	beep8.Music.activeSongAudioBuffers = []; // Store currently playing AudioBufferSourceNodes

	// musical scales in semitone intervals:
	const SCALES = {
		scaleChromatic: [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // (random,atonal: all twelve notes)
		scaleMajor: [ 2, 2, 1, 2, 2, 2, 1 ], // (classic, happy)
		scaleHarmonicMinor: [ 2, 1, 2, 2, 1, 3, 1 ], // (haunting, creepy)
		scaleMinorPentatonic: [ 3, 2, 2, 3, 2 ], // (blues, rock)
		scaleNaturalMinor: [ 2, 1, 2, 2, 1, 2, 2 ], // (scary, epic)
		scaleMelodicMinorUp: [ 2, 1, 2, 2, 2, 2, 1 ], // (wistful, mysterious)
		scaleMelodicMinorDown: [ 2, 2, 1, 2, 2, 1, 2 ], // (sombre, soulful)
		scaleDorian: [ 2, 1, 2, 2, 2, 1, 2 ], // (cool, jazzy)
		scaleMixolydian: [ 2, 2, 1, 2, 2, 1, 2 ], // (progressive, complex)
		scaleAhavaRaba: [ 1, 3, 1, 2, 1, 2, 2 ], // (exotic, unfamiliar)
		scaleMajorPentatonic: [ 2, 2, 3, 2, 3 ], // (country, gleeful)
		scaleDiatonic: [ 2, 2, 2, 2, 2, 2 ], //( bizarre, symmetrical )
	}

	/**
	 * Properties to add
	 * -----------------
	 * keyRange
	 * instruments
	 * noteStep
	 * how many pauses
	 */
	beep8.Music.types = {
		fast: {
			bpmRange: [ 120, 130 ],
			scales: [ 'scaleMinorPentatonic', 'scaleMajorPentatonic', 'scaleMajor' ],
			keyRange: [ 13, 25 ],
		},
		slow: {
			bpmRange: [ 30, 45 ],
			scales: [ 'scaleDorian', 'scaleMelodicMinorDown', 'scaleMelodicMinorUp' ],
			keyRange: [ 13, 25 ],
		},
		happy: {
			bpmRange: [ 60, 80 ],
			scales: [ 'scaleMajor', 'scaleMajorPentatonic' ],
			keyRange: [ 25, 37 ],
		},
		calm: {
			bpmRange: [ 40, 60 ],
			scales: [ 'scaleMelodicMinorUp', 'scaleDorian', 'scaleMajor' ],
			keyRange: [ 13, 25 ],
		},
		scary: {
			bpmRange: [ 60, 80 ],
			scales: [ 'scaleMelodicMinorDown', 'scaleHarmonicMinor', 'scaleDiatonic', 'scaleChromatic' ],
			keyRange: [ 13, 25, 37 ],
			noteStep: 4,
			pauseChance: 0.2,
		},
		joyful: {
			bpmRange: [ 80, 100 ],
			scales: [ 'scaleMajor', 'scaleMajorPentatonic', 'scaleMajorPentatonic' ],
			keyRange: [ 25, 37 ],
		},
	};

	/**
	 * Improve instruments.
	 */
	const INSTRUMENTS = {
		'piano': [ 1.5, 0, 90, .01, , .5, 2, 0, , , , , , , , , , , .1 ],
		'bass': [ 1.2, 0, 45, .04, .6, .46, 1, 2.2, , , , , .17, .1, , , , .65, .09, .04, -548 ],
		'burp': [ 1.4, 0, 291, .03, .04, .12, 2, 2.7, , 38, , , -0.01, .8, , , .04, .96, .02, , -1137 ],
		'boop': [ , , 293, .03, .02, .01, , .8, , , , , , .1, , , , .82, .02, .01 ],
		'buzz': [ 1.2, 0, 90, .01, , .5, 2, 0, , , , , , , , , , , .1 ],
		'drum1': [ 1.8, 0, 50, , , .2, , 4, -2, 6, 50, .15, , 6 ],
		'drum2': [ 1.4, 0, 84, , , , , .7, , , , .5, , 6.7, 1, .01 ],
	};

	/**
	 * Generate a song.
	 *
	 * @param {string} name The name of the song.
	 * @param {string} type The type of song to generate.
	 * @param {number} seed The seed for the random number generator.
	 */
	beep8.Music.generate = function( name = '', type = 'jolly', seed = 12345 ) {

		beep8.Random.setSeed( seed );

		const activeSong = new Song( name, type, seed ); // Create a new song with name
		beep8.Music.songs_[ name ] = activeSong.toZzfxM(); // Generate zzfxM song

	};


	/**
	 * Play a song.
	 *
	 * @param {string} name The name of the song to play.
	 * @returns {AudioBufferSourceNode} The AudioBufferSourceNode that is playing the song.
	 */
	beep8.Music.play = function( name = '' ) {

		const zzfxmSong = beep8.Music.songs_[ name ];

		if ( !zzfxmSong ) {
			console.error( 'No song found with the name:', name );
			return;
		}

		const ab = zzfxP( ...zzfxM( ...zzfxmSong ) ); // Play the song
		ab.loop = true;
		ab.name = name;

		beep8.Music.activeSongAudioBuffers.push( ab ); // Store the reference to stop later

		return ab;

	};

	/**
	 * Stop a song.
	 *
	 * @param {string} name The name of the song to stop.
	 * @returns {void}
	 */
	beep8.Music.stop = function( name = '' ) {

		// Stop specific song by name.
		if ( name ) {

			const songIndex = beep8.Music.activeSongAudioBuffers.findIndex( ab => ab.name === name );

			if ( songIndex !== -1 ) {
				beep8.Music.activeSongAudioBuffers[ songIndex ].stop();
				beep8.Music.activeSongAudioBuffers.splice( songIndex, 1 );
			}

			return;

		}

		// Stop all active songs
		beep8.Music.activeSongAudioBuffers.forEach( ab => ab.stop() );
		beep8.Music.activeSongAudioBuffers = [];

	}

	/**
	 * Check if a song is currently playing.
	 *
	 * @param {string} name The name of the song to check.
	 * @returns {boolean} True if the song is playing, false otherwise.
	 */
	beep8.Music.playing = function( name = '' ) {

		return beep8.Music.activeSongAudioBuffers.some( ab => ab.name === name );

	}

	// Song class to encapsulate all song-related logic
	class Song {

		constructor( name = '', type = 'jolly', seed = 12345 ) {

			const songType = beep8.Music.types[ type ];

			let noteScaleName = beep8.Random.pick( songType.scales );

			this.seed = seed;
			this.name = name;
			this.instruments = this.mutateInstruments( INSTRUMENTS );
			this.Channels = [];
			this.bpm = beep8.Random.int( songType.bpmRange[ 0 ], songType.bpmRange[ 1 ] );
			this.notes = this.getNoteScale( noteScaleName );
			this.key = beep8.Random.pick( songType.keyRange || KEYRANGE );
			this.noteStep = songType.noteStep || 1;
			this.pauseChance = songType.pauseChance || 0.25;

		}

		mutateInstruments( instruments ) {

			let newInstruments = { ...instruments };

			for ( let key in newInstruments ) {

				let instrument = newInstruments[ key ];

				for ( let i = 4; i < instrument.length; i++ ) {
					if ( typeof instrument[ i ] == "number" ) {
						instrument[ i ] = beep8.Random.range( instrument[ i ] * 0.5, instrument[ i ] * 1.5 );
					}
				}

			}

			return newInstruments;

		}

		getNoteScale( scale ) {

			// Make a big list of notes to choose from.
			const scaleIntervals = [ ...SCALES[ scale ], ...SCALES[ scale ], ...SCALES[ scale ], ...SCALES[ scale ] ];

			// Make a list of notes and include the first one.
			const notes = [ 0 ];

			// Loop through the notes and add the increments to the list.
			for ( let interval of scaleIntervals ) {
				notes.push( notes[ notes.length - 1 ] + interval );
			}

			return notes;

		}

		// Generate random melody and drum patterns for the song
		generatePatterns() {

			const patterns = [];
			const useDrums = beep8.Random.num() > 0.5;
			const useBass = beep8.Random.num() > 0.5;
			const melodyInstruments = [ 'piano', 'buzz', 'burp', 'boop' ];
			const melodyInstrument = beep8.Random.pick( melodyInstruments );

			for ( let i = 0; i < PATTERN_COUNT; i++ ) {

				let pattern = [];

				// Melody.
				let channel_melody = {
					id: this.Channels.length,
					instrument: melodyInstrument,
					notes: []
				};
				this.Channels.push( channel_melody );
				generateMusicalMelody( this, channel_melody );
				pattern.push( channel_melody );

				// Bass.
				if ( useBass ) {
					let channel_bass = {
						id: this.Channels.length,
						instrument: 'bass',
						notes: []
					};
					this.Channels.push( channel_bass );
					generateBassLine( channel_bass );
					pattern.push( channel_bass );
				}

				// Drums.
				if ( useDrums ) {
					let channel_drums = {
						id: this.Channels.length,
						instrument: 'drum2',
						notes: []
					};
					this.Channels.push( channel_drums );
					generateDrumBeat( channel_drums );
					pattern.push( channel_drums );
				}

				patterns.push( pattern );

			}

			return patterns;

		}

		// Generate song data in zzfxM format
		toZzfxM() {

			// Get instrument key -> id mapping.
			const instrumentKeys = Object.keys( this.instruments );
			const songInstruments = Object.values( this.instruments );

			const patterns = this.generatePatterns();
			const sequence = generateSequence();

			let zzfxmSong = [
				songInstruments,
				[], // Patterns (generated below)
				sequence, // Sequence order
				this.bpm
			];

			// Convert the channels and notes into zzfxM patterns
			for ( let p of patterns ) {
				let pattern = [];
				for ( let t of p ) {
					let instrumentId = instrumentKeys.indexOf( t.instrument );
					let track = [ instrumentId, 0 ]; // Instrument index, speaker mode
					for ( let note of t.notes ) {
						let value = this.key + note;
						if ( note === 0 ) value = 0;
						track.push( parseFloat( value ) );
					}
					pattern.push( track );
				}
				zzfxmSong[ 1 ].push( pattern );
			}

			console.log( 'patterns', zzfxmSong[ 1 ][ 0 ] );
			console.log( 'song', zzfxmSong );

			return zzfxmSong;
		}
	}

	// Utility function to generate random drum beats
	function generateDrumBeat( channel ) {

		for ( let i = 0; i < PATTERN_LENGTH; i++ ) {

			let key = 0;
			let noteVal = i % 4;

			// Hi-hat with a 70% chance on every beat
			if ( beep8.Random.num() < 0.7 ) {
				if ( noteVal % 2 === 1 ) key = 42; // hi-hat
			}

			// Kick on beats 1, 5, 9, 13
			if ( noteVal === 0 ) key = 1; // kick

			// Snare on beats 3, 7, 11, 15
			if ( noteVal === 2 ) key = 25; // snare

			channel.notes.push( key );
		}

	}

	// Utility function to generate a bass line
	function generateBassLine( channel ) {

		// Get first 4 notes from ActiveSong.notes.
		let bassKey = ActiveSong.notes.slice( 0, 4 );

		for ( let i = 0; i < PATTERN_LENGTH; i++ ) {
			let key = 0;
			let noteVal = i % 4;

			// Bass on beats 1 and 3
			if ( noteVal === 0 || noteVal === 2 ) {
				// Assign a bass note (e.g., 36 for C2, you can change this)
				key = 12;
				if ( beep8.Random.num() > 0.5 ) key = beep8.Random.pick( bassKey );
			}

			// Optionally, add randomness to occasionally skip notes
			if ( beep8.Random.num() > 0.2 ) {
				channel.notes.push( key ); // Play the bass note
				// console.log( 'bass', key );
			}
		}

	}

	// Generate random sequence of patterns
	function generateSequence() {

		const sequences = [
			[ 0, 1, 0, 2, 0, 3 ],
			[ 0, 1, 2, 3 ],
			[ 0, 0, 1, 1, 2, 2, 3, 3 ],
			[ 0, 0, 1, 0, 0, 2, 0, 0, 3 ],
			[ 0, 1, 1, 0, 2, 2, 0, 3 ],
			[ 0, 1, 1, 0, 2, 3, 3, 2 ],
		];
		return beep8.Random.pick( sequences );

	}


	function getPerlinInt( x, y, range, frequency = 50 ) {

		let noiseValue = noise.simplex2( x / frequency, y / frequency ) * 10;
		console.log( 'noise', noiseValue );

		// Scale the noise to fit within the desired range, then round to integer
		let scaledValue = Math.round( noiseValue * range );

		return scaledValue;

	}

	function generateMusicalMelody( song, channel ) {

		const noteCount = song.notes.length;
		const songNotes = [ ...song.notes ];

		let currentNoteId = beep8.Random.int( 0, noteCount );

		for ( let i = 0; i < PATTERN_LENGTH; i++ ) {

			// const progression = Math.round( generateMusicPattern( startTime + ( i * channel.id * 10 ), 3 ) );
			const progression = beep8.Random.pick( [ -2, -1, -1, 0, 0, 0, 0, 1, 1, 2 ] );
			currentNoteId += progression;

			// Reverse the notes if we reach one of the ends.
			if ( currentNoteId >= noteCount || currentNoteId < 0 ) {
				currentNoteId = 0;
				songNotes.reverse();
			}

			currentNoteId = beep8.Utilities.clamp( currentNoteId, 0, noteCount - 1 );

			console.log( 'currentNoteId', currentNoteId, songNotes[ currentNoteId ], progression );

			let key = songNotes[ currentNoteId ] + 1;
			let currentPosition = i % 4;

			if ( currentPosition !== 0 && currentPosition !== 3 ) {
				if ( beep8.Random.num() > 0.333 ) {
					key = 0;
				}
			}

			channel.notes.push( key );
		}

	}

} )( beep8 || ( beep8 = {} ) );