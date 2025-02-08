/**
 * beep8 Music Module
 * This module handles the creation, manipulation, and playback of procedurally generated music.
 */
( function( beep8 ) {

	beep8.Music = {};

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


	// --- p1.js Note Conversion ---

	// p1.js supports 52 keys using these 52 characters.
	var p1Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

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

		midi = beep8.Utilities.clamp( midi, 36, 87 );

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

		var pt = times(
			interval,
			function() {
				return false;
			}
		);

		for ( var i = 0; i < freq; i++ ) {
			pt[ beep8.Random.int( 0, interval - 1 ) ] = true;
		}

		return pattern.map(
			function( p, i ) {
				return pt[ i % interval ] ? !p : p;
			}
		);

	}


	// --- Chord Progression Generation ---


	/**
	 * Available chord progressions represented in Roman numerals.
	 *
	 * @type {Array<Array<string>>}
	 */
	const chords = [
		[ "I", "IIIm", "VIm" ],
		[ "IV", "IIm" ],
		[ "V", "VIIm" ]
	];


	/**
	 * Mapping of next chord progression indices.
	 *
	 * @type {Array<Array<number>>}
	 */
	const nextChordsIndex = [
		[ 0, 1, 2 ],
		[ 1, 2, 0 ],
		[ 2, 0 ]
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
	const instrumentOptions = [ 0, 1, 2, 3, 4 ];

	const drumOptions = [ 5, 6 ];


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
	 * Generates a chord progression as an array of chord note arrays.
	 *
	 * @param {number} len - The number of segments in the progression.
	 * @returns {Array<Array<string>>} The chord progression.
	 */
	function generateChordProgression( len ) {

		var keys = [ "C", "D", "Eb", "F", "G", "A", "Bb" ];
		var key = beep8.Random.pick( keys );
		var chordChangeInterval = 4;
		var currentRoman = null;
		var chordsIndex = 0;
		var progression = [];

		for ( var i = 0; i < len; i++ ) {
			if ( i % chordChangeInterval === 0 ) {
				if ( i === 0 ) {
					chordsIndex = beep8.Random.int( 0, chords.length - 1 );
					currentRoman = beep8.Random.pick( chords[ chordsIndex ] );
				} else if (
					beep8.Random.num() <
					0.8 - ( ( i / chordChangeInterval ) % 2 ) * 0.5
				) {
					chordsIndex = beep8.Random.pick( nextChordsIndex[ chordsIndex ] );
					currentRoman = beep8.Random.pick( chords[ chordsIndex ] );
				}
				var currentChord = getChordNotes( key, currentRoman );
			}

			progression.push( currentChord );

		}

		return progression;

	}


	// --- p1.js Music String Generators ---

	/**
	 * Generates a melody note string based on note length and chord progression.
	 *
	 * @param {number} noteLength - The number of beats/positions.
	 * @param {Array<Array<string>>} chordProgressionNotes - The chord progression notes.
	 * @returns {string} The compressed melody note string.
	 */
	function generateMelodyNote( noteLength, chordProgressionNotes ) {

		var notes = [ beep8.Random.pick( instrumentOptions ), '|' ];
		var pattern = createRandomPattern( noteLength, 4, 8, 3 );
		var octaveOffset = beep8.Random.int( -1, 1 );

		for ( var i = 0; i < noteLength; i++ ) {

			// Occasionally adjust the octave offset.
			if ( beep8.Random.chance( 10 ) ) {
				octaveOffset += beep8.Random.int( -1, 1 );
			}

			// Add a rest if no note should be played.
			if ( !pattern[ i ] ) {
				notes.push( " " );
				continue;
			}

			var chordNotes = chordProgressionNotes[ i ];
			// Select a random note from the chord.
			var ns = chordNotes[ beep8.Random.int( 0, chordNotes.length - 1 ) ];
			var baseOctave = parseInt( ns.slice( -1 ), 10 );
			// Clamp the octave so it fits within p1.js range (3 to 6).
			var newOctave = beep8.Utilities.clamp( baseOctave + octaveOffset, 3, 6 );
			var noteName = ns.slice( 0, -1 ).toUpperCase();
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
	 * @param {number} noteLength - The number of beats/positions.
	 * @param {Array<Array<string>>} chordProgressionNotes - The chord progression notes.
	 * @returns {string} The compressed chord/arpeggio note string.
	 */
	function generateChordNote( noteLength, chordProgressionNotes ) {

		const notes = [ beep8.Random.pick( instrumentOptions ), '|' ];

		var isArpeggio = beep8.Random.chance( 30 );
		var arpeggioInterval = beep8.Random.pick( [ 4, 8, 16 ] );
		var arpeggioPattern = times(
			arpeggioInterval,
			function() {
				return beep8.Random.int( 0, 3 );
			}
		);

		var interval = beep8.Random.pick( [ 2, 4, 8 ] );
		var pattern = isArpeggio
			? times(
				noteLength,
				function() {
					return true;
				}
			)
			: createRandomPattern( noteLength, beep8.Random.pick( [ 1, 1, interval / 2 ] ), interval, 2 );

		var baseOctave = beep8.Random.int( -1, 1 );
		var isReciprocatingOctave = beep8.Random.chance( isArpeggio ? 30 : 80 );
		var octaveOffset = 0;

		for ( var i = 0; i < noteLength; i++ ) {

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
			var ns = chordNotes[ noteIndex ];
			var baseOct = parseInt( ns.slice( -1 ), 10 );
			var newOct = beep8.Utilities.clamp( baseOct + baseOctave + octaveOffset, 3, 6 );
			var noteName = ns.slice( 0, -1 ).toUpperCase();
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
	 * @param {number} noteLength - The number of beats/positions.
	 * @returns {string} The compressed drum note string.
	 */
	function generateDrumNote( noteLength ) {

		// Pick an instrument and add the starting pipe.
		const notes = [ beep8.Random.pick( drumOptions ), '|' ];

		// Create a random pattern for drum hits.
		const pattern = createRandomPattern(
			noteLength,
			beep8.Random.int( 1, 3 ),
			beep8.Random.pick( [ 4, 8 ] ),
			3
		);

		// Fixed drum hit note (using "C4" converted to p1.js).
		var drumHit = noteToP1( "C4" );
		for ( var i = 0; i < noteLength; i++ ) {
			notes.push( pattern[ i ] ? drumHit : " " );
		}

		notes.push( '|' );

		return compressNotes( notes );

	}


	/**
	 * Generates multi-track music in p1.js format.
	 * It creates a chord progression and then generates various parts (melody, chord, or drum).
	 * Optionally prepends tempo and hold information to the first part.
	 *
	 * @param {Object} [options] - Options for music generation.
	 * @param {number} [options.seed] - Random seed.
	 * @param {number} [options.noteLength] - Number of beats/positions.
	 * @param {number} [options.partCount] - Number of parts to generate.
	 * @param {number} [options.drumPartRatio] - Ratio of parts to be drums.
	 * @param {number|null} [options.tempo] - Tempo in BPM. If null, tempo info is omitted.
	 * @param {number|null} [options.hold] - Hold duration. If null, hold info is omitted.
	 * @returns {string} The generated multi-track music string.
	 */
	beep8.Music.generate = function( options ) {

		if ( options && options.seed ) {
			beep8.Random.setSeed( options.seed );
		}

		/**
		 * Default options for the music generator.
		 *
		 * @type {Object}
		 */
		const defaultOptions = {
			seed: beep8.Random.int( 10000, 99999 ),
			noteLength: beep8.Random.pick( [ 16, 32, 48, 64 ] ),
			partCount: beep8.Random.int( 2, 5 ),
			drumPartRatio: 0.3,
			tempo: beep8.Random.pick( [ 70, 100, 140, 170, 200, 240, 280, 300 ] ), // Default tempo (BPM).
			hold: beep8.Random.pick( [ 10, 20, 30, 40, 50, 60, 60, 70, 70, 70, 80, 80, 80, 80, 90, 90, 90, 100 ] )    // Default hold duration.
		};

		// Merge default options with provided options.
		const opts = Object.assign( {}, defaultOptions, options );

		console.log( opts );

		beep8.Random.setSeed( opts.seed );
		var chordProgressionNotes = generateChordProgression( opts.noteLength );
		var parts = times(
			opts.partCount,
			function() {
				var isDrum = beep8.Random.num() < opts.drumPartRatio;
				if ( isDrum ) {
					return generateDrumNote( opts.noteLength );
				} else {
					if ( beep8.Random.num() < 0.5 ) {
						return generateMelodyNote( opts.noteLength, chordProgressionNotes );
					} else {
						return generateChordNote( opts.noteLength, chordProgressionNotes );
					}
				}
			}
		);

		// Prepend tempo (and hold) information to the first part if provided.
		if ( opts.tempo !== null ) {
			var tempoStr = String( opts.tempo );
			if ( opts.hold !== null ) {
				tempoStr += "." + String( opts.hold );
			}
			parts[ 0 ] = tempoStr + "\n" + parts[ 0 ];
		}

		// Join all parts with a newline so p1.js can play multi-track music.
		return parts.join( "\n" );

	}


	/**
	 * Stops the current music playback.
	 *
	 * @returns {void}
	 */
	beep8.Music.stop = function() {

		beep8.Music.play( "" );

	}


	/**
	 * Plays a p1.js music string.
	 *
	 * @param {string} song - The music string to play.
	 * @returns {void}
	 */
	beep8.Music.play = function( song ) {

		p1( song );

	}


	/**
	 * Checks if music is currently playing.
	 *
	 * @returns {boolean} True if music is playing, otherwise false.
	 */
	beep8.Music.isPlaying = function() {

		return p1.isPlaying();

	}

} )( beep8 );