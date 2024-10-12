/**
 * beep8 Music Module
 * This module handles the creation, manipulation, and playback of procedurally generated music.
 */
( function( beep8 ) {

	beep8.Music = {};

	const BAR_LENGTH = 8; // Number of beats per bar
	const BARS_PER_PATTERN = 1; // Number of bars per pattern
	const PATTERN_LENGTH = BAR_LENGTH * BARS_PER_PATTERN; // Total length of a pattern
	const PATTERN_COUNT = 4; // Number of patterns per song
	const KEYRANGE = [ 13, 25, 37 ]; // Key range for generating songs


	/**
	 * Musical scales in semitone intervals.
	 *
	 * @type {Object}
	 */
	const SCALES = {
		scaleChromatic: [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // (random, atonal: all twelve notes)
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
		scaleDiatonic: [ 2, 2, 2, 2, 2, 2 ], //(bizarre, symmetrical)
	};


	/**
	 * Improve instruments.
	 *
	 * @type {Object}
	 */
	const INSTRUMENTS = {
		'piano': [ 1.5, 0, 90, .01, , .5, 2, 0, , , , , , , , , , , .1 ],
		'bass': [ 1.2, 0, 45, .04, .6, .46, 1, 2.2, , , , , .17, .1, , , , .65, .09, .04, -548 ],
		'burp': [ 1.4, 0, 291, .03, .04, .12, 2, 2.7, , 38, , , -0.01, .8, , , .04, .96, .02, , -1137 ],
		'boop': [ 1.5, , 293, .03, .02, .01, , .8, , , , , , .1, , , , .82, .02, .01 ],
		'buzz': [ 1.2, 0, 90, .01, , .5, 2, 0, , , , , , , , , , , .1 ],
		'drum1': [ 1.8, 0, 50, , , .2, , 4, -2, 6, 50, .15, , 6 ],
		'drum2': [ 1.4, 0, 84, , , , , .7, , , , .5, , 6.7, 1, .01 ],
	};


	/**
	 * Sequence patterns for repeating the mysic.
	 *
	 * @type {Array}
	 */
	const SEQUENCE_PATTERNS = [
		[ 0, 1, 0, 2, 0, 3 ],
		[ 0, 1, 2, 3 ],
		[ 0, 1, 1, 2, 2, 3 ],
		[ 0, 1, 1, 2, 3, 3 ],
		[ 0, 0, 1, 1, 2, 2, 3, 3 ],
		[ 0, 0, 1, 0, 0, 2, 0, 0, 3 ],
		[ 0, 1, 1, 0, 2, 2, 0, 3 ],
		[ 0, 1, 1, 0, 2, 3, 3, 2 ]
	];


	/**
	 * Properties to add
	 * -----------------
	 * instruments
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
			pauseChance: 0.2,
		},
		joyful: {
			bpmRange: [ 80, 100 ],
			scales: [ 'scaleMajor', 'scaleMajorPentatonic', 'scaleMajorPentatonic' ],
			keyRange: [ 25, 37 ],
		},
	};


	/**
	 * Store generated songs and active playback information.
	 *
	 * @type {Object}
	 */
	beep8.Music.songs = {};


	/**
	 * Generate a song.
	 *
	 * @param {string} name - The name of the song.
	 * @param {string} type - The type of song to generate.
	 * @param {number} seed - The seed for the random number generator.
	 */
	beep8.Music.generate = function( name = '', type = 'jolly', seed = 12345 ) {

		beep8.Random.setSeed( seed );
		const songData = new Song( name, type, seed ).generateSongData(); // Generate song data
		beep8.Music.songs[ name ] = { data: songData, buffer: null }; // Store song data

	};


	/**
	 * Play a song.
	 *
	 * @param {string} name - The name of the song to play.
	 * @returns {AudioBufferSourceNode} The AudioBufferSourceNode that is playing the song.
	 */
	beep8.Music.play = function( name = '' ) {

		const songEntry = beep8.Music.songs[ name ];

		if ( !songEntry ) {
			console.error( 'No song found with the name:', name );
			return;
		}

		const zzfxmSong = songEntry.data;
		const ab = zzfxP( ...zzfxM( ...zzfxmSong ) ); // Play the song
		ab.loop = true;
		ab.name = name;

		// Store the buffer in the song entry
		songEntry.buffer = ab;

		return ab;

	};


	/**
	 * Stop a song.
	 *
	 * @param {string} name - The name of the song to stop.
	 */
	beep8.Music.stop = function( name = '' ) {

		// Stop specific song by name.
		if ( name ) {
			const songEntry = beep8.Music.songs[ name ];
			if ( songEntry && songEntry.buffer ) {
				songEntry.buffer.stop();
				songEntry.buffer = null;
			}
			return;
		}

		// Stop all active songs
		for ( let songName in beep8.Music.songs ) {
			const songEntry = beep8.Music.songs[ songName ];
			if ( songEntry.buffer ) {
				songEntry.buffer.stop();
				songEntry.buffer = null;
			}
		}

	};


	/**
	 * Check if a song is currently playing.
	 *
	 * @param {string} name - The name of the song to check.
	 * @returns {boolean} True if the song is playing, false otherwise.
	 */
	beep8.Music.playing = function( name = '' ) {

		const songEntry = beep8.Music.songs[ name ];
		return songEntry && songEntry.buffer !== null;

	};


	/**
	 * Add a custom zzfxM song.
	 *
	 * You can compose your own songs using the [zzfxM format](https://keithclark.github.io/ZzFXM/)
	 * and the [zzfxM song tracker](https://keithclark.github.io/ZzFXM/tracker/).
	 *
	 * You should use the addSong function to add the song to the music library,
	 * and then use the play and stop functions as you would with a generated song.
	 *
	 * @param {string} name - The name of the custom song.
	 * @param {Array} zzfxmData - The zzfxM song data composed by the user.
	 */
	beep8.Music.addSong = function( name, zzfxmData ) {

		if ( !name || !Array.isArray( zzfxmData ) ) {
			console.error( "Invalid song name or song data." );
			return;
		}

		// Store the custom song in the songs object with buffer as null initially
		beep8.Music.songs[ name ] = { data: zzfxmData, buffer: null };
		console.log( `Custom song "${name}" added successfully.` );

	};


	/**
	 * Generate a generic pattern by applying note logic to a channel.
	 *
	 * @param {Object} song - The song object containing song details.
	 * @param {Array} channel - The channel to add notes to.
	 * @param {Function} noteLogic - Function that determines note generation logic.
	 */
	function generatePattern( song, channel, noteLogic ) {

		for ( let i = 0; i < PATTERN_LENGTH; i++ ) {
			const key = noteLogic( i, song );
			if ( key !== null ) {
				addNoteToChannel( channel, key );
			}
		}

	}


	/**
	 * Add a note to a channel.
	 *
	 * @param {Array} channel - The channel to add the note to.
	 * @param {number} key - The note key to add.
	 */
	function addNoteToChannel( channel, key ) {

		channel.push( key );

	}


	/**
	 * Generate drum notes based on beat position.
	 *
	 * @param {number} i - The current beat index.
	 * @param {Object} song - The song object containing song details.
	 * @returns {number} The key value for the drum note.
	 */
	function drumNoteLogic( i, song ) {

		let key = 0;
		let noteVal = i % 4;

		// Hi-hat with a 70% chance on every beat
		if ( beep8.Random.num() < 0.7 && noteVal % 2 === 1 ) key = 42;

		// Kick on beats 1, 5, 9, 13
		if ( noteVal === 0 ) key = 1;

		// Snare on beats 3, 7, 11, 15
		if ( noteVal === 2 ) key = 25;

		return key;

	}


	/**
	 * Generate bass notes for a bass channel.
	 *
	 * @param {number} i - The current beat index.
	 * @param {Object} song - The song object containing song details.
	 * @returns {number} The key value for the bass note.
	 */
	function bassNoteLogic( i, song ) {

		let key = 0;
		let noteVal = i % 4;
		let bassKey = song.notes.slice( 0, 4 );

		// Bass on beats 1 and 3
		if ( noteVal === 0 || noteVal === 2 ) {
			key = 12;
			if ( beep8.Random.num() > 0.5 ) key = beep8.Random.pick( bassKey );
		}

		// Occasionally skip notes
		if ( beep8.Random.num() > 0.2 ) key = 0;

		return key;

	}


	/**
	 * Generate melody notes for a melody channel.
	 *
	 * @param {number} i - The current beat index.
	 * @param {Object} song - The song object containing song details.
	 * @returns {number} The key value for the melody note.
	 */
	function melodyNoteLogic( i, song ) {

		// If it's the first beat, pick a random note to start with.
		if ( 0 === i ) {
			song.currentNoteId = beep8.Random.int( 0, song.notes.length / 2 );
		}

		const noteCount = song.notes.length;
		const progression = beep8.Random.pick( [ -2, -1, -1, 0, 0, 0, 0, 1, 1, 2 ] );
		song.currentNoteId += progression;

		song.currentNoteId = beep8.Utilities.clamp( song.currentNoteId, 0, noteCount - 1 );

		let key = song.notes[ song.currentNoteId ] + 1;
		let currentPosition = i % 4;

		if ( currentPosition !== 0 && currentPosition !== 3 && beep8.Random.num() > 0.333 ) {
			key = 0;
		}

		return key;

	}


	/**
	 * Song class to encapsulate all song-related logic.
	 */
	class Song {


		/**
		 * Create a new Song instance.
		 *
		 * @param {string} name - The name of the song.
		 * @param {string} type - The type of song to generate.
		 * @param {number} seed - The seed for the random number generator.
		 */
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
			this.pauseChance = songType.pauseChance || 0.25;

		}


		/**
		 * Mutate instruments to create variations.
		 *
		 * @param {Object} instruments - The base instruments.
		 * @returns {Object} A new set of instruments with random variations.
		 */
		mutateInstruments( instruments ) {

			let newInstruments = { ...instruments };

			for ( let key in newInstruments ) {
				let instrument = newInstruments[ key ];

				for ( let i = 4; i < instrument.length; i++ ) {
					if ( typeof instrument[ i ] == 'number' ) {
						instrument[ i ] = beep8.Random.range( instrument[ i ] * 0.5, instrument[ i ] * 1.5 );
					}
				}
			}

			return newInstruments;

		}


		/**
		 * Generate a note scale based on the selected scale type.
		 *
		 * @param {string} scale - The scale type to generate.
		 * @param {number} repetitions - Number of times to repeat the scale.
		 * @param {number} startNote - The starting note value.
		 * @param {number} skipChance - The chance of skipping a note.
		 * @returns {Array} The generated note scale.
		 */
		getNoteScale( scale, repetitions = 3, startNote = 0, skipChance = 0 ) {

			// Generate repeated scale intervals
			const scaleIntervals = beep8.Utilities.repeatArray( SCALES[ scale ], repetitions );

			// Generate the notes based on the scale intervals and skip chance
			const notes = [ startNote ];

			scaleIntervals.forEach(
				( interval ) => {
					if ( beep8.Random.num() > skipChance ) {
						notes.push( notes[ notes.length - 1 ] + interval );
					}
				}
			);

			return notes;

		}


		/**
		 * Generate random melody and drum patterns for the song.
		 *
		 * @returns {Array} The generated patterns for the song.
		 */
		generatePatterns() {

			const patterns = [];
			const useDrums = beep8.Random.num() > 0.5;
			const useBass = beep8.Random.num() > 0.5;
			// const melodyInstruments = [ 'piano', 'buzz', 'burp', 'boop' ];
			const melodyInstruments = [ 'boop' ];
			const melodyInstrument = beep8.Random.pick( melodyInstruments );

			for ( let i = 0; i < PATTERN_COUNT; i++ ) {

				let pattern = [];

				// Melody.
				let channel_melody = [ melodyInstrument, 0 ];
				this.Channels.push( channel_melody );
				generatePattern( this, channel_melody, melodyNoteLogic );
				pattern.push( channel_melody );

				// Bass.
				if ( useBass ) {
					let channel_bass = [ 'bass', 0 ];
					this.Channels.push( channel_bass );
					generatePattern( this, channel_bass, bassNoteLogic );
					pattern.push( channel_bass );
				}

				// Drums.
				if ( useDrums ) {
					let channel_drums = [ 'drum2', 0 ];
					this.Channels.push( channel_drums );
					generatePattern( this, channel_drums, drumNoteLogic );
					pattern.push( channel_drums );
				}

				patterns.push( pattern );
			}

			return patterns;

		}


		/**
		 * Generate song data in a generic format.
		 *
		 * @returns {Array} The generated song data.
		 */
		generateSongData() {

			// Get instrument key -> id mapping.
			const instrumentKeys = Object.keys( this.instruments );
			const songInstruments = Object.values( this.instruments );

			// Generate patterns and sequence
			const patterns = this.generatePatterns();
			const sequence = generateSequence();

			// Build the song structure
			let zzfxmSong = [
				songInstruments,
				this.generateTrackPatterns( patterns, instrumentKeys ),
				sequence,
				this.bpm
			];

			console.log( 'patterns', zzfxmSong[ 1 ][ 0 ] );
			console.log( 'song', zzfxmSong );

			return zzfxmSong;

		}


		/**
		 * Generate track patterns from channel data.
		 *
		 * @param {Array} patterns - The list of patterns to convert to tracks.
		 * @param {Array} instrumentKeys - List of instrument keys to reference.
		 * @returns {Array} The generated track patterns.
		 */
		generateTrackPatterns( patterns, instrumentKeys ) {
			let trackPatterns = [];

			patterns.forEach(
				( pattern ) => {

					let trackPattern = pattern.map(
						( channel ) => {
							return this.convertChannelToTrack( channel, instrumentKeys );
						}
					);

					trackPatterns.push( trackPattern );

				}
			);

			return trackPatterns;
		}


		/**
		 * Convert a channel into a track format.
		 *
		 * @param {Array} channel - The channel data to convert.
		 * @param {Array} instrumentKeys - List of instrument keys to reference.
		 * @returns {Array} The generated track data.
		 */
		convertChannelToTrack( channel, instrumentKeys ) {

			let instrumentId = instrumentKeys.indexOf( channel[ 0 ] );
			let track = [ instrumentId, 0 ]; // Instrument index, speaker mode

			for ( let i = 2; i < channel.length; i++ ) {
				let note = channel[ i ];
				let value = this.key + note;
				if ( note === 0 ) value = 0;
				track.push( parseFloat( value ) );
			}

			return track;

		}
	}


	/**
	 * Generate a random sequence of patterns for a song.
	 *
	 * @returns {Array} The generated sequence of patterns.
	 */
	function generateSequence() {

		return beep8.Random.pick( SEQUENCE_PATTERNS );

	}

} )( beep8 || ( beep8 = {} ) );