/**
 * b8 Music Module.
 *
 * This module handles the creation, manipulation, and playback of procedurally generated music.
 */
( function( b8 ) {

	b8.Music = {};

	/**
	 * BeepMini uses a custom version of p1.js for music generation and playback.
	 *
	 * Alphabet used for p1.js music notation.
	 * p1.js supports 52 keys using these 52 characters.
	 */
	const p1Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";


	/**
	 * Predefined song styles with associated tempo ranges, hold durations, and musical roles.
	 *
	 * Each style defines:
	 * - tempo: An array of possible tempos in BPM.
	 * - hold: An array of possible p1.js hold values.
	 * - channels: An array of musical roles that determine which parts to generate.
	 *
	 * Styles:
	 * - calm: Slower tempo, longer holds, and simpler instrumentation.
	 * - arcade: Medium tempo, moderate holds, and more varied instrumentation.
	 * - busy: Faster tempo, shorter holds, and complex instrumentation.
	 *
	 * @type {Object<string, {tempo: Array<number>, hold: Array<number>, channels: Array<string>}>}
	 */
	const SONG_STYLES = {
		calm: {
			tempo: [ 50, 70, 100 ],
			hold: [ 110, 120, 130, 140 ],
			noteCount: [ 48, 64, 96 ],
			chordLength: [ 8, 16 ],
			channels: [ "bass", "chords", "melody" ],
			melodyDensity: 2,
			melodyNotes: [ 0, 0, 2 ],
			chordDensity: 1,
			bassInterval: [ 8, 16 ],
			arpChance: 10,
			drumDensity: [ 0 ],
		},

		arcade: {
			tempo: [ 170, 200, 240 ],
			hold: [ 50, 60, 70, 80 ],
			noteCount: [ 32, 48, 64 ],
			chordLength: [ 4, 8 ],
			chordDensity: 4,
			channels: [ "bass", "arp", "melody", "drums" ],
			melodyDensity: 5,
			melodyNotes: [ 0, 0, 1, 2, 2 ],
			bassInterval: [ 4, 8 ],
			arpChance: 50,
			drumDensity: [ 2, 3 ],
		},

		busy: {
			tempo: [ 180, 200, 220 ],
			hold: [ 60, 70, 80 ],
			noteCount: [ 48, 64 ],
			chordLength: [ 4, 8 ],
			channels: [ "bass", "chords", "arp", "melody", "drums" ],
			melodyDensity: 6,
			melodyNotes: [ 0, 1, 2, 2, 3 ],
			chordDensity: 7,
			bassInterval: [ 2, 4 ],
			arpChance: 40,
			drumDensity: [ 2, 3 ],
		},

		menu: {
			tempo: [ 60, 70 ],
			hold: [ 140, 160, 180 ],
			noteCount: [ 32, 48 ],
			chordLength: [ 16, 32 ],
			channels: [ "bass", "chords" ],
			melodyDensity: 1,
			melodyNotes: [ 0 ],
			chordDensity: 1,
			bassInterval: [ 16 ],
			arpChance: 0,
			drumDensity: [ 0 ],
		},

		adventure: {
			tempo: [ 70, 85, 100 ],
			hold: [ 120, 150, 180 ],
			noteCount: [ 96, 128 ],
			chordLength: [ 16, 32 ],
			chordDensity: 1,
			channels: [ "bass", "chords", "melody" ],
			melodyDensity: 3,
			melodyNotes: [ 0, 1, 2, 2, 3 ],
			bassInterval: [ 8, 16 ],
			arpChance: 5,
			drumDensity: [ 0 ],
		},

		puzzle: {
			tempo: [ 130, 150, 170 ],
			hold: [ 70, 80, 90 ],
			noteCount: [ 64, 96 ],
			chordLength: [ 4, 8 ],
			channels: [ "bass", "arp", "melody", "drums" ],
			melodyDensity: 5,
			melodyNotes: [ 0, 1, 2, 3 ],
			chordDensity: 7,
			bassInterval: [ 4, 8 ],
			arpChance: 90,
			drumDensity: [ 1, 2 ],
		},

		shooter: {
			tempo: [ 240, 280, 320 ],
			hold: [ 20, 25, 30 ],
			noteCount: [ 32 ],
			chordLength: [ 2 ],
			channels: [ "bass", "arp", "counter", "drums" ],
			melodyDensity: 9,
			melodyNotes: [ 1, 2, 2, 3, 3 ],
			chordDensity: 9,
			bassInterval: [ 2 ],
			arpChance: 95,
			drumDensity: [ 4, 5 ],
		},

		triumphant: {
			tempo: [ 100, 120, 140 ],
			hold: [ 80, 90, 100 ],
			noteCount: [ 48, 64 ],
			chordLength: [ 8, 16 ],
			channels: [ "bass", "chords", "melody", "drums" ],
			melodyDensity: 5,
			melodyNotes: [ 0, 0, 1, 2, 2 ],  // strong chord tones
			chordDensity: 8,
			bassInterval: [ 4, 8 ],
			arpChance: 10,
			drumDensity: [ 2, 3 ],
		},

	};


	/**
	 * Common chord progressions represented as arrays of Roman numeral chord
	 * identifiers.
	 *
	 * Each progression is a sequence of chords that can be used to generate the
	 * harmonic structure of a song.
	 * The Roman numerals correspond to scale degrees and chord qualities
	 * (e.g., "I" is the tonic major chord, "VIm" is the minor chord built on the sixth degree).
	 *
	 * @type {Array<Array<string>>}
	 */
	const PROGRESSIONS = [
		[ "I", "V", "VIm", "IV" ],
		[ "I", "VIm", "IV", "V" ],
		[ "VIm", "IV", "I", "V" ],
		[ "I", "IV", "V", "I" ],
		[ "I", "IIm", "V", "I" ]
	];


	/**
	 * Chord mapping for key C.
	 *
	 * @type {Object<string, Array<string>>}
	 */
	const chordMap = {
		I: [ "C4", "E4", "G4", "B4" ],
		IIIm: [ "E4", "G4", "B4", "D5" ],
		VIm: [ "A3", "C4", "E4", "G4" ],
		IV: [ "F4", "A4", "C5", "E5" ],
		IIm: [ "D4", "F4", "A4", "C5" ],
		V: [ "G3", "B3", "D4", "F4" ],
		VIIm: [ "B3", "D4", "F4", "A4" ]
	};


	/**
	 * Mapping of key shifts for transposition.
	 *
	 * @type {Object<string, number>}
	 */
	const keyShift = {
		C: 0,
		D: 2,
		Eb: 3,
		F: 5,
		G: 7,
		A: 9,
		Bb: 10
	};


	/**
	 * Available instrument options.
	 *
	 * @type {Array<number>}
	 */
	const instrumentOptions = [ 0, 1, 2, 3, 4, 5 ];


	/**
	 * Available drum options.
	 *
	 * @type {Array<number>}
	 */
	const drumOptions = [ 6, 7 ];


	/**
	 * Stores the most recent song so it can be restarted after pausing.
	 * This is necessary because p1.js does not have a built-in pause/resume functionality.
	 *
	 * @type {string|null}
	 */
	let currentSong = null;


	/**
	 * Generates multi-track music in p1.js format.
	 * It creates a chord progression and then generates various parts (melody, chord, or drum).
	 * Optionally prepends tempo and hold information to the first part.
	 *
	 * @param {Object} [options] - Options for music generation.
	 * @param {number} [options.seed] - Random seed.
	 * @param {number} [options.noteCount] - Number of beats/positions.
	 * @param {number} [options.channelCount] - Number of parts to generate.
	 * @param {string} [options.style] - Song style name.
	 * @param {number|null} [options.tempo] - Tempo in BPM. If null, tempo info is omitted.
	 * @param {number|null} [options.hold] - Hold duration. If null, hold info is omitted.
	 * @returns {string} The generated multi-track music string.
	 */
	b8.Music.generate = function( options ) {

		if ( options && typeof options.seed !== "undefined" ) {
			b8.Random.setSeed( options.seed );
		}

		var styleName = options && options.style
			? options.style
			: b8.Random.pick( Object.keys( SONG_STYLES ) );

		var style = SONG_STYLES[ styleName ] || SONG_STYLES.arcade;

		const defaultOptions = {
			seed: b8.Random.int( 10000, 99999 ),
			style: styleName,
			noteCount: b8.Random.pick( style.noteCount || [ 32, 48, 64 ] ),
			channelCount: style.channels.length,
			tempo: b8.Random.pick( style.tempo ),
			hold: b8.Random.pick( style.hold )
		};

		const opts = Object.assign( {}, defaultOptions, options );

		b8.Music.currentSongProperties = opts;

		b8.Random.setSeed( opts.seed );

		var chordProgressionNotes = generateChordProgression( opts.noteCount, style );
		var roles = style.channels.slice( 0, opts.channelCount );

		var parts = roles.map(
			function( role ) {
				return generatePartByRole( role, opts.noteCount, chordProgressionNotes, style );
			}
		);

		if ( opts.tempo !== null ) {
			var tempoStr = String( opts.tempo );

			if ( opts.hold !== null ) {
				tempoStr += "." + String( opts.hold );
			}

			parts[ 0 ] = tempoStr + "\n" + parts[ 0 ];
		}

		return parts.join( "\n" );

	};


	/**
	 * Plays a p1.js music string.
	 *
	 * @param {string} song - The music string to play.
	 * @returns {void}
	 */
	b8.Music.play = function( song ) {

		p1( song );

		if ( song ) {
			currentSong = song;
		}

	};


	/**
	 * Stops the current music playback.
	 * If `clearCurrentSong` is true, it will also clear the current song reference.
	 * This is disabled when the music is paused to allow resuming playback.
	 *
	 * @param {boolean} [clearCurrentSong=true] - Whether to clear the current song reference.
	 * @returns {void}
	 */
	b8.Music.stop = function( clearCurrentSong = true ) {

		// Clear the currently stored song.
		b8.Utilities.checkBoolean( "clearCurrentSong", clearCurrentSong );
		if ( clearCurrentSong ) currentSong = null;

		// Stop the music playback.
		b8.Music.play( "" );

	};


	/**
	 * Pauses the current music playback.
	 *
	 * @returns {void}
	 */
	b8.Music.pause = function() {

		if ( b8.Music.isPlaying() ) {
			b8.Music.stop( false );
		}

	};


	/**
	 * Resumes the current music playback.
	 *
	 * Restarts the most recent song after it has been paused.
	 *
	 * p1.js does not resume from the exact paused position here. It starts the
	 * stored song again from the beginning.
	 *
	 * @returns {void}
	 */
	b8.Music.resume = function() {

		// Restart the stored song if playback is currently stopped.
		if ( currentSong && !b8.Music.isPlaying() ) {
			b8.Music.play( currentSong );
		}

	};


	/**
	 * Sets the volume for the music playback.
	 *
	 * @param {number} volume - The volume level (0 to 1).
	 * @returns {void}
	 */
	b8.Music.setVolume = function( volume ) {

		b8.Utilities.checkNumber( "volume", volume );

		p1.setVolume( volume );

	};


	/**
	 * Set the tempo of a currently playing song.
	 *
	 * @param {number} tempo - The new tempo in BPM.
	 * @returns {void}
	 */
	b8.Music.setTempo = function( tempo ) {

		b8.Utilities.checkInt( "tempo", tempo );

		// Ensure tempo is within a valid range.
		if ( tempo < 50 ) {
			tempo = 50;
		}

		p1.setTempo( tempo );

	};


	/**
	 * Checks if music is currently playing.
	 *
	 * @returns {boolean} True if music is playing, otherwise false.
	 */
	b8.Music.isPlaying = function() {

		return p1.isPlaying();

	};


	/**
	 * Gets the available style keys for music generation.
	 *
	 * @returns {Array<string>} An array of style keys.
	 */
	b8.Music.getStyleKeys = function() {

		return Object.keys( SONG_STYLES );

	};


	/**
	 * Resets the music module, stopping any playback and clearing the current song.
	 *
	 * @returns {void}
	 */
	b8.Music.reset = function() {

		b8.Music.stop();

	};


	// Handle page visibility changes to pause/resume music.
	document.addEventListener( 'b8.pageVisibility.wake', b8.Music.resume );
	document.addEventListener( 'b8.pageVisibility.sleep', b8.Music.pause );


	/**
	 * Creates a boolean pattern filled with the same value.
	 *
	 * @param {number} len - Number of values in the pattern.
	 * @param {boolean} value - Value to use for every position.
	 * @returns {Array<boolean>} The filled pattern.
	 */
	function createFilledPattern( len, value ) {

		return times(
			len,
			function() {
				return value;
			}
		);

	}


	/**
	 * Converts a note string (e.g. "C4" or "D#4") to a MIDI note number.
	 * Expects a format: letter, optional accidental (# or b), then octave digit.
	 *
	 * @param {string} note - The musical note string.
	 * @returns {number|null} The MIDI note number, or null if the note format is invalid.
	 */
	function noteToMidi( note ) {

		var regex = /^([A-Ga-g])([#b]?)(\d)$/;
		var match = note.match( regex );

		if ( !match ) return null;

		var letter = match[ 1 ].toUpperCase();
		var accidental = match[ 2 ];
		var octave = parseInt( match[ 3 ], 10 );

		// Map letter to its base semitone number.
		var semitones = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[ letter ];
		if ( accidental === "#" ) {
			semitones += 1;
		} else if ( accidental === "b" ) {
			semitones -= 1;
		}

		// MIDI formula: (octave + 1) * 12 + semitones.
		return ( octave + 1 ) * 12 + semitones;

	}


	/**
	 * Converts a musical note (e.g. "C4" or "D#4") to a p1.js note letter.
	 * The MIDI note is clamped to the range [36, 87] before conversion.
	 *
	 * @param {string} note - The musical note string.
	 * @returns {string} The corresponding p1.js letter, or "?" if invalid.
	 */
	function noteToP1( note ) {

		let midi = noteToMidi( note );

		if ( midi === null ) return "?";

		midi = b8.Utilities.clamp( midi, 36, 87 );

		return p1Alphabet.charAt( midi - 36 );

	}


	/**
	 * Compresses an array of note characters by replacing consecutive repeats
	 * (except for spaces and bars) with dashes to indicate sustained notes.
	 *
	 * @param {Array<string>} arr - Array of note characters.
	 * @returns {string} Compressed note string.
	 */
	function compressNotes( arr ) {

		if ( arr.length === 0 ) return "";

		var result = arr[ 0 ];

		for ( var i = 1; i < arr.length; i++ ) {
			if ( arr[ i ] === arr[ i - 1 ] && arr[ i ] !== " " && arr[ i ] !== "|" ) {
				result += "-";
			} else {
				result += arr[ i ];
			}
		}

		return result;

	}


	/**
	 * Creates a random boolean pattern of a given length.
	 * The pattern is modified several times with segment reversals.
	 *
	 * @param {number} len - The length of the pattern.
	 * @param {number} freq - Frequency parameter for reversals.
	 * @param {number} interval - Initial interval for segmentation.
	 * @param {number} loop - Number of times to modify the pattern.
	 * @returns {Array<boolean>} The generated pattern.
	 */
	function createRandomPattern( len, freq, interval, loop ) {

		var pattern = times(
			len,
			function() {
				return false;
			}
		);

		for ( var i = 0; i < loop; i++ ) {
			if ( interval > len ) break;
			pattern = reversePattern( pattern, interval, freq );
			interval *= 2;
		}

		return pattern;

	}


	/**
	 * Reverses segments of a boolean pattern based on a randomly generated toggle pattern.
	 *
	 * @param {Array<boolean>} pattern - The original boolean pattern.
	 * @param {number} interval - The segment length.
	 * @param {number} freq - Frequency of toggling within the segment.
	 * @returns {Array<boolean>} The modified pattern.
	 */
	function reversePattern( pattern, interval, freq ) {

		var togglePattern = times(
			interval,
			function() {
				return false;
			}
		);

		for ( var i = 0; i < freq; i++ ) {
			togglePattern[ b8.Random.int( 0, interval - 1 ) ] = true;
		}

		return pattern.map(
			function( p, i ) {
				return togglePattern[ i % interval ] ? !p : p;
			}
		);

	}

	/**
	 * Gets the chord notes for a given key, Roman numeral, and octave.
	 *
	 * @param {string} key - The musical key (e.g., "C").
	 * @param {string} roman - The Roman numeral chord identifier (e.g., "I", "IIIm").
	 * @returns {Array<string>} An array of chord note strings.
	 */
	function getChordNotes( key, roman ) {

		const base = chordMap[ roman ] || chordMap.I;
		const shift = keyShift[ key ] || 0;

		return base.map(
			function( note ) {
				return transpose( note, shift );
			}
		);

	}


	/**
	 * Transposes a note by a specified number of semitones.
	 *
	 * @param {string} note - The note to transpose (e.g., "C4").
	 * @param {number} shift - The number of semitones to shift.
	 * @returns {string} The transposed note.
	 */
	function transpose( note, shift ) {

		var midi = noteToMidi( note );
		if ( midi === null ) {
			return note;
		}

		midi += shift;
		var octave = Math.floor( midi / 12 ) - 1;
		var index = midi % 12;
		var noteNames = [ "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" ];

		return noteNames[ index ] + octave;

	}


	/**
	 * Generates a chord progression as chord notes for every note position.
	 *
	 * A key, Roman numeral progression, and chord length are chosen randomly.
	 * The returned array has one chord-note array per generated note position,
	 * which makes later melody, bass, and chord generation simpler.
	 *
	 * @param {number} noteCount - Number of note positions to generate chord data for.
	 * @param {Object} style - The song style object containing chord length options.
	 * @returns {Array<Array<string>>} Chord notes for each note position.
	 */
	function generateChordProgression( noteCount, style ) {

		var keys = [ "C", "D", "Eb", "F", "G", "A", "Bb" ];
		var key = b8.Random.pick( keys );
		var progression = b8.Random.pick( PROGRESSIONS );
		var chordLength = b8.Random.pick( style.chordLength || [ 4, 8, 8, 16 ] );
		var result = [];

		for ( var i = 0; i < noteCount; i++ ) {
			var chordIndex = Math.floor( i / chordLength ) % progression.length;
			var roman = progression[ chordIndex ];

			result.push( getChordNotes( key, roman ) );
		}

		return result;

	}


	/**
	 * Generates a bass part from the root note of each chord.
	 *
	 * The bass only plays at regular intervals. Between hits it inserts rests.
	 * Root notes are forced into octave 3 to keep the bass low and stable.
	 *
	 * @param {number} noteCount - Number of note positions to generate.
	 * @param {Array<Array<string>>} chordProgressionNotes - Chord notes for each note position.
	 * @param {Object} style - The song style object containing additional parameters.
	 * @returns {string} A compressed p1.js bass part.
	 */
	function generateBassNote( noteCount, chordProgressionNotes, style ) {

		const notes = [ b8.Random.pick( instrumentOptions ), "|" ];
		var interval = b8.Random.pick( style.bassInterval || [ 4, 8 ] );

		for ( var i = 0; i < noteCount; i++ ) {

			if ( i % interval !== 0 ) {
				notes.push( " " );
				continue;
			}

			var root = chordProgressionNotes[ i ][ 0 ];
			var noteName = root.slice( 0, -1 );
			var finalNote = noteName + "3";

			notes.push( noteToP1( finalNote ) );

		}

		notes.push( "|" );

		return compressNotes( notes );

	}


	/**
	 * Generates a p1.js part for a named musical role.
	 *
	 * This keeps style definitions simple. Styles only need to list role names,
	 * and this function decides which generator should be used for each role.
	 *
	 * @param {string} role - The part role: "bass", "drums", "arp", "chords", "counter", or "melody".
	 * @param {number} noteCount - Number of note positions to generate.
	 * @param {Array<Array<string>>} chordProgressionNotes - Chord notes for each note position.
	 * @param {Object} style - The song style object containing additional parameters.
	 * @returns {string} A compressed p1.js part.
	 */
	function generatePartByRole( role, noteCount, chordProgressionNotes, style ) {

		switch ( role ) {

			case "bass":
				return generateBassNote( noteCount, chordProgressionNotes, style );

			case "drums":
				return generateDrumNote( noteCount, style );

			case "arp":
			case "chords":
				return generateChordNote( noteCount, chordProgressionNotes, style );

			case "counter":
			case "melody":
			default:
				return generateMelodyNote( noteCount, chordProgressionNotes, style );

		}

	}


	/**
	 * Generates a melody note string based on note length and chord progression.
	 *
	 * @param {number} noteCount - The number of beats/positions.
	 * @param {Array<Array<string>>} chordProgressionNotes - The chord progression notes.
	 * @param {Object} style - The song style object containing additional parameters.
	 * @returns {string} The compressed melody note string.
	 */
	function generateMelodyNote( noteCount, chordProgressionNotes, style ) {

		var notes = [ b8.Random.pick( instrumentOptions ), '|' ];
		var density = style.melodyDensity || 4;
		var pattern = createRandomPattern( noteCount, density, 8, 3 );
		var octaveOffset = b8.Random.int( -1, 1 );

		for ( var i = 0; i < noteCount; i++ ) {

			// Occasionally adjust the octave offset.
			if ( b8.Random.chance( 10 ) ) {
				octaveOffset += b8.Random.int( -1, 1 );
			}

			// Add a rest if no note should be played.
			if ( !pattern[ i ] ) {
				notes.push( " " );
				continue;
			}

			var chordNotes = chordProgressionNotes[ i ];
			// Select a random note from the chord.
			var sourceNote = pickChordNote( chordNotes, style.melodyNotes );
			var baseOctave = parseInt( sourceNote.slice( -1 ), 10 );
			// Clamp the octave so it fits within p1.js range (3 to 6).
			var newOctave = b8.Utilities.clamp( baseOctave + octaveOffset, 3, 6 );
			var noteName = sourceNote.slice( 0, -1 ).toUpperCase();
			var finalNote = noteName + newOctave;
			var p1Note = noteToP1( finalNote );
			notes.push( p1Note );

		}

		notes.push( '|' );

		return compressNotes( notes );

	}


	/**
	 * Generates a chord or arpeggio note string based on note length and chord progression.
	 *
	 * @param {number} noteCount - The number of beats/positions.
	 * @param {Array<Array<string>>} chordProgressionNotes - The chord progression notes.
	 * @param {Object} style - The song style object containing additional parameters.
	 * @returns {string} The compressed chord/arpeggio note string.
	 */
	function generateChordNote( noteCount, chordProgressionNotes, style ) {

		const notes = [ b8.Random.pick( instrumentOptions ), '|' ];

		var isArpeggio = b8.Random.chance( style.arpChance || 30 );
		var arpeggioInterval = b8.Random.pick( [ 4, 8, 16 ] );
		var arpeggioPattern = times(
			arpeggioInterval,
			function() {
				return b8.Random.int( 0, 3 );
			}
		);

		var interval = b8.Random.pick( [ 2, 4, 8 ] );
		var pattern = isArpeggio
			? createFilledPattern( noteCount, true )
			: createRandomPattern(
				noteCount,
				style.chordDensity || 2,
				interval,
				2
			);

		var baseOctave = b8.Random.int( -1, 1 );
		var isReciprocatingOctave = b8.Random.chance( isArpeggio ? 30 : 80 );
		var octaveOffset = 0;

		for ( var i = 0; i < noteCount; i++ ) {

			// Adjust octave offset at set intervals.
			if ( isReciprocatingOctave && i % interval === 0 ) {
				octaveOffset = ( octaveOffset + 1 ) % 2;
			}

			// Insert a rest if no note is scheduled.
			if ( !pattern[ i ] ) {
				notes.push( " " );
				continue;
			}

			var chordNotes = chordProgressionNotes[ i ];
			var noteIndex = isArpeggio ? arpeggioPattern[ i % arpeggioInterval ] : 0;
			var sourceNote = chordNotes[ noteIndex ];
			var baseOct = parseInt( sourceNote.slice( -1 ), 10 );
			var newOct = b8.Utilities.clamp( baseOct + baseOctave + octaveOffset, 3, 6 );
			var noteName = sourceNote.slice( 0, -1 ).toUpperCase();
			var finalNote = noteName + newOct;
			var p1Note = noteToP1( finalNote );
			notes.push( p1Note );

		}

		notes.push( '|' );

		return compressNotes( notes );

	}


	/**
	 * Generates a drum note string for a given note length.
	 *
	 * @param {number} noteCount - The number of beats/positions.
	 * @param {Object} style - The song style object containing drum density options.
	 * @returns {string} The compressed drum note string.
	 */
	function generateDrumNote( noteCount, style ) {

		// Pick an instrument and add the starting pipe.
		const notes = [ b8.Random.pick( drumOptions ), '|' ];

		// Create a random pattern for drum hits.
		const pattern = createRandomPattern(
			noteCount,
			b8.Random.pick( style.drumDensity || [ 1, 2, 3 ] ),
			b8.Random.pick( [ 4, 8 ] ),
			3
		);

		// Fixed drum hit note (using "C4" converted to p1.js).
		var drumHit = noteToP1( "C4" );
		for ( var i = 0; i < noteCount; i++ ) {
			notes.push( pattern[ i ] ? drumHit : " " );
		}

		notes.push( '|' );

		return compressNotes( notes );

	}


	/**
	 * Picks a note from a chord using optional weighted chord-note indexes.
	 *
	 * @param {Array<string>} chordNotes - Notes in the current chord.
	 * @param {Array<number>} [noteIndexes] - Weighted chord-note indexes to choose from.
	 * @returns {string} The selected note.
	 */
	function pickChordNote( chordNotes, noteIndexes ) {

		if ( !noteIndexes || noteIndexes.length === 0 ) {
			return b8.Random.pick( chordNotes );
		}

		var noteIndex = b8.Random.pick( noteIndexes );
		noteIndex = b8.Utilities.clamp( noteIndex, 0, chordNotes.length - 1 );

		return chordNotes[ noteIndex ];

	}


	/**
	 * Calls a function n times and collects the results in an array.
	 *
	 * @param {number} n - Number of times to call the function.
	 * @param {function(number): any} fn - Function to be called with the current index.
	 * @returns {Array<any>} An array of results.
	 */
	function times( n, fn ) {

		var result = [];
		for ( var i = 0; i < n; i++ ) {
			result.push( fn( i ) );
		}
		return result;

	}

} )( b8 );