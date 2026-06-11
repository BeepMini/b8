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
			noteCount: [ 64, 96, 128 ],
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
			noteCount: [ 48, 64, 96 ],
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
			noteCount: [ 64, 96 ],
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
			noteCount: [ 64, 96, 128 ],
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
			noteCount: [ 128, 160, 192 ],
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
			noteCount: [ 80, 96, 128 ],
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
			tempo: [ 175, 200, 225 ],
			hold: [ 30, 40, 50, 60 ],
			noteCount: [ 48, 64 ],
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
			noteCount: [ 64, 96 ],
			chordLength: [ 8, 16 ],
			channels: [ "bass", "chords", "melody", "drums" ],
			melodyDensity: 5,
			melodyNotes: [ 0, 0, 1, 2, 2 ],  // strong chord tones
			chordDensity: 8,
			bassInterval: [ 4, 8 ],
			arpChance: 10,
			drumDensity: [ 2, 3 ],
		},

		mysterious: {
			tempo: [ 60, 75, 90 ],
			hold: [ 130, 150, 170 ],
			noteCount: [ 96, 128, 160 ],
			chordLength: [ 16, 32 ],
			channels: [ "bass", "chords", "melody" ],
			melodyDensity: 2,
			melodyNotes: [ 0, 1, 2, 3 ],
			chordDensity: 2,
			bassInterval: [ 8, 16 ],
			arpChance: 15,
			drumDensity: [ 0 ],
		},

		stealth: {
			tempo: [ 85, 100, 115 ],
			hold: [ 90, 110, 130 ],
			noteCount: [ 64, 96, 128 ],
			chordLength: [ 8, 16 ],
			channels: [ "bass", "chords", "counter" ],
			melodyDensity: 2,
			melodyNotes: [ 0, 1, 2 ],
			chordDensity: 2,
			bassInterval: [ 8, 8, 16 ],
			arpChance: 20,
			drumDensity: [ 0, 1 ],
		},

		dreamy: {
			tempo: [ 70, 90, 110 ],
			hold: [ 110, 130, 150 ],
			noteCount: [ 96, 128, 160 ],
			chordLength: [ 8, 16, 32 ],
			channels: [ "bass", "chords", "counter", "melody" ],
			melodyDensity: 3,
			melodyNotes: [ 0, 1, 2, 2, 3 ],
			chordDensity: 2,
			bassInterval: [ 8, 16 ],
			arpChance: 25,
			drumDensity: [ 0 ],
		},

		tense: {
			tempo: [ 120, 140, 160 ],
			hold: [ 70, 80, 90 ],
			noteCount: [ 80, 96, 128 ],
			chordLength: [ 4, 8 ],
			channels: [ "bass", "arp", "melody", "drums" ],
			melodyDensity: 5,
			melodyNotes: [ 0, 1, 2, 3 ],
			chordDensity: 6,
			bassInterval: [ 4, 8 ],
			arpChance: 70,
			drumDensity: [ 1, 2 ],
		},

		march: {
			tempo: [ 95, 110, 125 ],
			hold: [ 70, 80, 90, 100 ],
			noteCount: [ 64, 96, 128 ],
			chordLength: [ 8, 16 ],
			channels: [ "bass", "chords", "melody", "drums" ],
			melodyDensity: 3,
			melodyNotes: [ 0, 0, 1, 2 ],
			chordDensity: 4,
			bassInterval: [ 4, 8 ],
			arpChance: 5,
			drumDensity: [ 2, 3 ],
		},

		exploration: {
			tempo: [ 80, 95, 110 ],
			hold: [ 100, 120, 140 ],
			noteCount: [ 96, 128, 160 ],
			chordLength: [ 8, 16, 32 ],
			channels: [ "bass", "chords", "melody" ],
			melodyDensity: 3,
			melodyNotes: [ 0, 1, 2, 2, 3 ],
			chordDensity: 2,
			bassInterval: [ 8, 16 ],
			arpChance: 10,
			drumDensity: [ 0, 1 ],
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
	 * Seed-profile option pools used to build a song blueprint.
	 *
	 * Keeping these lists in one place makes the high-level musical choices
	 * easier to scan and tweak without digging through the generator logic.
	 *
	 * @type {Object<string, Array<any>>}
	 */
	const SONG_PROFILE_OPTIONS = {
		phraseBarCount: [ 2, 2, 4, 4 ],
		sectionForms: [
			[ "A", "A" ],
			[ "A", "A_PRIME" ],
			[ "A", "B" ],
			[ "A", "B", "A" ],
			[ "A", "A", "B", "A" ],
			[ "A", "A_PRIME", "B", "A" ],
			[ "A", "B", "A", "C" ],
			[ "A", "B", "C", "A" ]
		],
		contourType: [ "rise", "fall", "arch", "wave", "hover", "stair" ],
		cadenceTarget: [ "root", "root", "third", "fifth" ],
		motifReuseChance: [ 50, 60, 70, 80 ],
		progressionRotation: [ 1, 1, 2, 3 ],
		altChordLengthBias: [ 0, 0, 1, -1 ],
		registerShape: [ "low", "mid", "high" ],
		arpeggioShape: [
			[ 0, 1, 2, 1, 3, 2, 1, 2 ],
			[ 0, 2, 1, 2, 0, 2, 3, 2 ],
			[ 0, 1, 0, 2, 1, 2, 1, 3 ]
		]
	};


	/**
	 * Compact rhythm-template definitions.
	 *
	 * Each string represents one bar of eight steps, where "x" means play and
	 * "." means rest. This is much easier to read than large arrays of booleans.
	 *
	 * @type {Object<string, Object<string, Array<string>>>}
	 */
	const RHYTHM_TEMPLATE_PATTERNS = {
		bass: {
			fast: [ "x.x.x.x.", "x.xx.x.x.", "xx.xx.x." ],
			medium: [ "x...x...", "x.x.x...", "x..xx..." ],
			slow: [ "x...x...", "x.....x.", "x...x..x" ]
		},
		drums: {
			light: [ "x...x...", "x.....x." ],
			medium: [ "x...x...", "x..xx..x", "x.x.x..." ],
			heavy: [ "x.x.x.x.", "x.xx.x.x." ]
		},
		arp: {
			normal: [ "xxxxxxxx", "x.x.x.x.", "xx.xxx.x" ],
			busy: [ "xxxxxxxx", "x.xx.x.xx", "xx.xxx.x" ]
		},
		chords: {
			light: [ "x...x...", "x.x.x.x.", "x..xx..x" ],
			dense: [ "x.x.x.x.", "x..xx.x.", "xx..xx.." ]
		},
		counter: {
			light: [ "x..x.x..", ".x.x.x.x", "x.x..x.." ],
			dense: [ "x.xx.x.x", ".x.xx.x.", "x.x.x.x." ]
		},
		melody: {
			sparse: [ "x...x...", "x..x....", "x.....x." ],
			normal: [ "x.x.x...", "x..xx.x.", "x.x..x.x" ],
			dense: [ "x.xxx.x.", "xx.xx.xx", "x.x.xx.x" ]
		}
	};


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

		var songProfile = createSongProfile( opts.noteCount );
		var progressionContext = generateChordProgression( opts.noteCount, style, songProfile );
		var roles = style.channels.slice( 0, opts.channelCount );

		var parts = roles.map(
			function( role ) {
				return generatePartByRole( role, opts.noteCount, progressionContext, style );
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
	 * Converts a MIDI note number back into a note string.
	 *
	 * @param {number} midi - MIDI note number.
	 * @returns {string} The note string.
	 */
	function midiToNote( midi ) {

		var octave = Math.floor( midi / 12 ) - 1;
		var index = ( ( midi % 12 ) + 12 ) % 12;
		var noteNames = [ "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" ];

		return noteNames[ index ] + octave;

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


	/**
	 * Gets the chord notes for a given key and Roman numeral.
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

		return midiToNote( midi + shift );

	}


	/**
	 * Returns the pulse count used as one bar for phrase-aware patterns.
	 *
	 * @returns {number} The number of note positions per bar.
	 */
	function getBarLength() {

		return 8;

	}


	/**
	 * Returns the relative strength of a step within a bar.
	 *
	 * Lower values represent stronger rhythmic positions.
	 *
	 * @param {number} stepIndex - Step index in the song.
	 * @returns {number} The step strength.
	 */
	function getStepStrength( stepIndex ) {

		var stepInBar = stepIndex % getBarLength();

		if ( stepInBar === 0 ) return 0;
		if ( stepInBar === 4 ) return 1;
		if ( stepInBar === 2 || stepInBar === 6 ) return 2;

		return 3;

	}


	/**
	 * Creates a seed-derived song profile.
	 *
	 * The profile acts as the musical blueprint for a seed. Styles then interpret
	 * that blueprint with their own density and instrumentation settings, which
	 * keeps the "same seed, same family" behaviour while making different seeds
	 * diverge more clearly.
	 *
	 * @param {number} noteCount - Number of note positions in the song.
	 * @returns {Object} Song profile used across the generator.
	 */
	function createSongProfile( noteCount ) {

		var totalBars = Math.max( 1, Math.ceil( noteCount / getBarLength() ) );
		// The profile is the "composer's sketch". Everything later reads from
		// these choices so the seed creates a recognisable musical identity.
		var phraseBarCount = pickPhraseBarCount( totalBars );
		var contourType = b8.Random.pick( SONG_PROFILE_OPTIONS.contourType );
		var cadenceTarget = b8.Random.pick( SONG_PROFILE_OPTIONS.cadenceTarget );
		var sectionForm = pickSectionForm( totalBars, phraseBarCount );
		var phraseCount = Math.max( 1, Math.ceil( totalBars / phraseBarCount ) );

		return {
			phraseBarCount: phraseBarCount,
			sectionForm: sectionForm,
			phraseCount: phraseCount,
			contourType: contourType,
			cadenceTarget: cadenceTarget,
			motifReuseChance: b8.Random.pick( SONG_PROFILE_OPTIONS.motifReuseChance ),
			progressionRotation: b8.Random.pick( SONG_PROFILE_OPTIONS.progressionRotation ),
			altChordLengthBias: b8.Random.pick( SONG_PROFILE_OPTIONS.altChordLengthBias ),
			melodicFreedom: b8.Random.pick( [ 15, 20, 25, 35 ] ),
			supportFreedom: b8.Random.pick( [ 8, 12, 18, 24 ] ),
			rhythmFamily: {
				bass: b8.Random.int( 0, 2 ),
				drums: b8.Random.int( 0, 2 ),
				arp: b8.Random.int( 0, 2 ),
				chords: b8.Random.int( 0, 2 ),
				melody: b8.Random.int( 0, 2 ),
				counter: b8.Random.int( 0, 2 )
			},
			registerShape: b8.Random.pick( SONG_PROFILE_OPTIONS.registerShape ),
			arpeggioShape: b8.Random.pick( SONG_PROFILE_OPTIONS.arpeggioShape )
		};

	}


	/**
	 * Picks a phrase size that fits the available song length.
	 *
	 * Longer songs are allowed broader phrases, while shorter songs stay more
	 * compact so the structure remains audible.
	 *
	 * @param {number} totalBars - Total bar count for the song.
	 * @returns {number} Phrase size in bars.
	 */
	function pickPhraseBarCount( totalBars ) {

		if ( totalBars >= 16 ) {
			return b8.Random.pick( [ 4, 4, 8 ] );
		}

		if ( totalBars >= 8 ) {
			return b8.Random.pick( [ 2, 4, 4 ] );
		}

		return b8.Random.pick( [ 2, 2, 4 ] );

	}


	/**
	 * Picks a section form that makes good use of the available number of phrases.
	 *
	 * Faster or longer songs benefit from more sections so they do not reveal the
	 * whole idea too quickly. Shorter songs use simpler forms to avoid feeling
	 * over-composed.
	 *
	 * @param {number} totalBars - Total bar count for the song.
	 * @param {number} phraseBarCount - Number of bars in each phrase.
	 * @returns {Array<string>} Section form such as A-B-A or A-A-B-A.
	 */
	function pickSectionForm( totalBars, phraseBarCount ) {

		var phraseCapacity = Math.max( 1, Math.floor( totalBars / phraseBarCount ) );
		var availableForms = SONG_PROFILE_OPTIONS.sectionForms.filter(
			function( form ) {
				return form.length <= phraseCapacity;
			}
		);

		if ( availableForms.length === 0 ) {
			availableForms = [ [ "A", "A" ] ];
		}

		if ( phraseCapacity >= 4 ) {
			availableForms = availableForms.filter(
				function( form ) {
					return form.length >= 3;
				}
			);
		}

		if ( availableForms.length === 0 ) {
			availableForms = SONG_PROFILE_OPTIONS.sectionForms.filter(
				function( form ) {
					return form.length <= phraseCapacity;
				}
			);
		}

		return b8.Random.pick( availableForms );

	}


	/**
	 * Generates a chord progression context for every note position.
	 *
	 * The old generator only returned chord notes. This version keeps that
	 * information and also annotates phrasing and cadence points so parts can
	 * make more musical decisions without changing the public API.
	 *
	 * @param {number} noteCount - Number of note positions to generate chord data for.
	 * @param {Object} style - The song style object containing chord length options.
	 * @param {Object} songProfile - Seed-derived musical blueprint for the song.
	 * @returns {Object} Progression context used by part generators.
	 */
	function generateChordProgression( noteCount, style, songProfile ) {

		var keys = [ "C", "D", "Eb", "F", "G", "A", "Bb" ];
		var key = b8.Random.pick( keys );
		var progression = b8.Random.pick( PROGRESSIONS ).slice();
		var chordLength = b8.Random.pick( style.chordLength || [ 4, 8, 8, 16 ] );
		var altChordLength = adjustChordLength( chordLength, songProfile.altChordLengthBias );
		var barLength = getBarLength();
		var phraseLength = barLength * songProfile.phraseBarCount;
		var scale = buildScaleMidi( key, 36, 87 );
		var chordSequence = [];
		var steps = [];

		for ( var i = 0; i < noteCount; i++ ) {
			// We work out where we are in the larger form first, then derive the
			// local harmony from that section and phrase position.
			var phraseIndex = Math.floor( i / phraseLength );
			var sectionName = getSectionName( songProfile, phraseIndex );
			var activeProgression = getSectionProgression( progression, songProfile, sectionName );
			var activeChordLength = sectionName === "B" ? altChordLength : chordLength;
			var sectionStepIndex = i % phraseLength;
			var sequenceIndex = Math.floor( sectionStepIndex / activeChordLength ) % activeProgression.length;
			var roman = activeProgression[ sequenceIndex ];
			var chordNotes = getChordNotes( key, roman );
			var chordMidi = toMidiList( chordNotes );

			chordSequence.push( roman );

			steps.push( {
				index: i,
				key: key,
				scale: scale,
				roman: roman,
				sectionName: sectionName,
				chordNotes: chordNotes,
				chordMidi: chordMidi,
				chordStart: sectionStepIndex % activeChordLength === 0,
				chordEnd: ( sectionStepIndex + 1 ) % activeChordLength === 0 || i === noteCount - 1,
				barStart: i % barLength === 0,
				phraseStart: i % phraseLength === 0,
				phraseEnd: ( i + 1 ) % phraseLength === 0 || i === noteCount - 1,
				stepStrength: getStepStrength( i )
			} );
		}

		return {
			key: key,
			scale: scale,
			chordLength: chordLength,
			altChordLength: altChordLength,
			barLength: barLength,
			phraseLength: phraseLength,
			songProfile: songProfile,
			progression: chordSequence,
			steps: steps
		};

	}


	/**
	 * Generates a p1.js part for a named musical role.
	 *
	 * This keeps style definitions simple. Styles only need to list role names,
	 * and this function decides which generator should be used for each role.
	 *
	 * @param {string} role - The part role: "bass", "drums", "arp", "chords", "counter", or "melody".
	 * @param {number} noteCount - Number of note positions to generate.
	 * @param {Object} progressionContext - Harmonic context for the generated song.
	 * @param {Object} style - The song style object containing additional parameters.
	 * @returns {string} A compressed p1.js part.
	 */
	function generatePartByRole( role, noteCount, progressionContext, style ) {

		switch ( role ) {

			case "bass":
				return generateBassNote( noteCount, progressionContext, style );

			case "drums":
				return generateDrumNote( noteCount, progressionContext, style );

			case "arp":
			case "chords":
				return generateChordNote( role, noteCount, progressionContext, style );

			case "counter":
			case "melody":
			default:
				return generateMelodyNote( role, noteCount, progressionContext, style );

		}

	}


	/**
	 * Generates a bass part with a steadier pulse and simple approach notes.
	 *
	 * @param {number} noteCount - Number of note positions to generate.
	 * @param {Object} progressionContext - Harmonic context for the generated song.
	 * @param {Object} style - The song style object containing additional parameters.
	 * @returns {string} A compressed p1.js bass part.
	 */
	function generateBassNote( noteCount, progressionContext, style ) {

		var notes = [ b8.Random.pick( instrumentOptions ), "|" ];
		var pattern = getPartPattern( "bass", noteCount, progressionContext, style );
		var previousMidi = null;

		for ( var i = 0; i < noteCount; i++ ) {
			var step = progressionContext.steps[ i ];

			if ( !pattern[ i ] ) {
				notes.push( " " );
				continue;
			}

			var rootMidi = normalizeMidiToOctave( step.chordMidi[ 0 ], 2 );
			var fifthMidi = normalizeMidiToOctave( step.chordMidi[ 2 ] || step.chordMidi[ 0 ], 2 );
			var candidates = [ rootMidi ];

			// Bass mostly states the root, but weaker beats can lean on the fifth
			// so the line feels like accompaniment instead of a metronome.
			if ( step.stepStrength > 0 ) {
				candidates.push( fifthMidi );
			}

			// Near the end of a chord we also allow a short approach move toward
			// the next root, which gives the bass a small sense of direction.
			if ( step.chordEnd && i < noteCount - 1 ) {
				var nextRoot = normalizeMidiToOctave(
					progressionContext.steps[ i + 1 ].chordMidi[ 0 ],
					2
				);
				candidates.push( moveOneStepToward( rootMidi, nextRoot, progressionContext.scale ) );
			}

			var selectedMidi = chooseCandidateMidi(
				uniqueNumbers( candidates ),
				previousMidi,
				{
					prefer: rootMidi,
					maxLeap: 7
				}
			);

			previousMidi = selectedMidi;
			notes.push( noteToP1( midiToNote( selectedMidi ) ) );
		}

		notes.push( "|" );

		return compressNotes( notes );

	}


	/**
	 * Generates the main melody or counter melody.
	 *
	 * The melody now prefers stepwise motion, repeats phrase fragments, and lands
	 * on stable tones at the ends of phrases so the result feels less random.
	 *
	 * @param {string} role - The part role being generated.
	 * @param {number} noteCount - The number of beats/positions.
	 * @param {Object} progressionContext - Harmonic context for the generated song.
	 * @param {Object} style - The song style object containing additional parameters.
	 * @returns {string} The compressed melody note string.
	 */
	function generateMelodyNote( role, noteCount, progressionContext, style ) {

		var notes = [ b8.Random.pick( instrumentOptions ), "|" ];
		var songProfile = progressionContext.songProfile;
		var pattern = getPartPattern( role, noteCount, progressionContext, style );
		var phraseLength = progressionContext.phraseLength;
		var targetOctave = getRoleTargetOctave( role, songProfile );
		var previousMidi = null;
		var previousInterval = null;
		var motifMemory = {};

		for ( var i = 0; i < noteCount; i++ ) {
			var step = progressionContext.steps[ i ];

			if ( !pattern[ i ] ) {
				notes.push( " " );
				continue;
			}

			var phraseStep = i % phraseLength;
			var motifKey = step.sectionName + ":" + String( phraseStep ) + ":" + String( step.stepStrength );
			// The candidate pool mixes harmony-safe notes, decorative motion, and
			// contour guidance. The picker then decides which one sounds best here.
			var candidates = gatherMelodyCandidates(
				step,
				progressionContext.scale,
				targetOctave,
				previousMidi,
				previousInterval,
				songProfile
			);
			var preferredMidi = getContourPreferredMidi(
				step,
				progressionContext.scale,
				targetOctave,
				songProfile,
				phraseStep,
				phraseLength
			);

			if ( step.barStart || step.phraseEnd ) {
				// Phrase edges should feel grounded, so we bias hard toward a
				// cadential chord tone instead of a freer passing note.
				preferredMidi = getCadenceMidi( step, targetOctave, songProfile );
				candidates.push( preferredMidi );
			} else if ( motifMemory[ motifKey ] && b8.Random.chance( songProfile.motifReuseChance ) ) {
				// Reusing an earlier phrase slot keeps the tune singable even when
				// the surrounding decoration changes.
				preferredMidi = motifMemory[ motifKey ];
				candidates.push( preferredMidi );
			}

			var selectedMidi = chooseCandidateMidi(
				uniqueNumbers( candidates ),
				previousMidi,
				{
					prefer: preferredMidi,
					maxLeap: step.stepStrength <= 1 ? 7 : 5,
					preferMotion: !step.barStart && !step.phraseEnd,
					avoidRepeat: step.stepStrength >= 2,
					explorationChance: step.stepStrength >= 2
						? songProfile.melodicFreedom
						: Math.max( 5, songProfile.melodicFreedom - 10 )
				}
			);

			motifMemory[ motifKey ] = selectedMidi;
			previousInterval = previousMidi === null ? null : selectedMidi - previousMidi;
			previousMidi = selectedMidi;
			notes.push( noteToP1( midiToNote( selectedMidi ) ) );
		}

		notes.push( "|" );

		return compressNotes( notes );

	}


	/**
	 * Generates a harmonic support line or arpeggio.
	 *
	 * @param {string} role - The part role being generated.
	 * @param {number} noteCount - The number of beats/positions.
	 * @param {Object} progressionContext - Harmonic context for the generated song.
	 * @param {Object} style - The song style object containing additional parameters.
	 * @returns {string} The compressed chord or arpeggio note string.
	 */
	function generateChordNote( role, noteCount, progressionContext, style ) {

		var notes = [ b8.Random.pick( instrumentOptions ), "|" ];
		var songProfile = progressionContext.songProfile;
		var harmonicRole = resolveHarmonicRole( role, style );
		var isArpeggio = harmonicRole === "arp";
		var pattern = getPartPattern( harmonicRole, noteCount, progressionContext, style );
		var phraseLength = progressionContext.phraseLength;
		var previousMidi = null;
		var arpeggioShape = songProfile.arpeggioShape;

		for ( var i = 0; i < noteCount; i++ ) {
			var step = progressionContext.steps[ i ];

			if ( !pattern[ i ] ) {
				notes.push( " " );
				continue;
			}

			var targetOctave = getRoleTargetOctave( harmonicRole, songProfile );
			var candidates = [];
			var selectionOptions = null;

			if ( isArpeggio ) {
				// Arpeggios follow a seed-shaped pattern so they feel deliberate and
				// related across styles using the same song blueprint.
				var chordIndex = arpeggioShape[ i % phraseLength % arpeggioShape.length ];
				candidates.push(
					normalizeMidiToOctave(
						step.chordMidi[ chordIndex % step.chordMidi.length ],
						targetOctave
					)
				);
				selectionOptions = {
					prefer: candidates[ 0 ],
					maxLeap: 8
				};
			} else {
				// Sustained support parts choose from the current chord plus a few
				// nearby colour notes so slow styles do not get stuck on one pitch.
				candidates = getChordSupportCandidates(
					step,
					progressionContext.scale,
					targetOctave,
					previousMidi,
					songProfile.supportFreedom
				);
				selectionOptions = {
					prefer: getChordSupportPreferredMidi( step, targetOctave ),
					maxLeap: 5,
					preferMotion: !step.chordStart,
					avoidRepeat: !step.chordStart,
					explorationChance: songProfile.supportFreedom
				};
			}

			var selectedMidi = chooseCandidateMidi(
				uniqueNumbers( candidates ),
				previousMidi,
				selectionOptions
			);

			previousMidi = selectedMidi;
			notes.push( noteToP1( midiToNote( selectedMidi ) ) );
		}

		notes.push( "|" );

		return compressNotes( notes );

	}


	/**
	 * Generates a steadier drum note string using repeated bar templates.
	 *
	 * @param {number} noteCount - The number of beats/positions.
	 * @param {Object} progressionContext - Harmonic context for the generated song.
	 * @param {Object} style - The song style object containing drum density options.
	 * @returns {string} The compressed drum note string.
	 */
	function generateDrumNote( noteCount, progressionContext, style ) {

		var notes = [ b8.Random.pick( drumOptions ), "|" ];
		var pattern = getPartPattern( "drums", noteCount, progressionContext, style );
		var drumHit = noteToP1( "C4" );

		for ( var i = 0; i < noteCount; i++ ) {
			notes.push( pattern[ i ] ? drumHit : " " );
		}

		notes.push( "|" );

		return compressNotes( notes );

	}


	/**
	 * Collects accompaniment chord-tone candidates for non-arpeggiated support.
	 *
	 * Slow support parts such as the menu style sound better when they can move
	 * around the current chord instead of sitting on one repeated pitch.
	 *
	 * @param {Object} step - Current progression step.
	 * @param {Array<number>} scale - MIDI notes in the key.
	 * @param {number} targetOctave - Preferred accompaniment octave.
	 * @param {number|null} previousMidi - Previously selected accompaniment note.
	 * @param {number} freedom - Chance of adding extra colour-note options.
	 * @returns {Array<number>} Candidate accompaniment notes.
	 */
	function getChordSupportCandidates( step, scale, targetOctave, previousMidi, freedom ) {

		var candidates = step.chordMidi.slice( 0, 4 ).map(
			function( midi ) {
				return normalizeMidiToOctave( midi, targetOctave );
			}
		);

		if ( step.chordStart ) {
			candidates.push( normalizeMidiToOctave( step.chordMidi[ 0 ], targetOctave ) );
		}

		// When we are staying on the same harmony, allow a nearby chord neighbour
		// so slow accompaniment parts keep breathing instead of freezing in place.
		if ( previousMidi !== null ) {
			candidates = candidates.concat(
				candidates.filter(
					function( midi ) {
						return Math.abs( midi - previousMidi ) <= 4;
					}
				)
			);

			if ( b8.Random.chance( freedom ) ) {
				candidates = candidates.concat(
					getNearbyScaleCandidates( scale, previousMidi, 1, 2 )
				);
			}
		}

		return uniqueNumbers( candidates );

	}


	/**
	 * Returns the preferred chord tone for non-arpeggiated accompaniment.
	 *
	 * Strong beats favour the root. Other beats lean toward the third or fifth so
	 * support parts vary their colour while staying harmonically stable.
	 *
	 * @param {Object} step - Current progression step.
	 * @param {number} targetOctave - Preferred accompaniment octave.
	 * @returns {number} Preferred accompaniment note.
	 */
	function getChordSupportPreferredMidi( step, targetOctave ) {

		var preferredIndex = 0;

		if ( !step.chordStart ) {
			preferredIndex = step.stepStrength <= 1 ? 1 : 2;
		}

		return normalizeMidiToOctave(
			step.chordMidi[ preferredIndex ] || step.chordMidi[ 0 ],
			targetOctave
		);

	}


	/**
	 * Creates a role-specific pattern by repeating bars and mutating them gently.
	 *
	 * @param {string} role - The part role to generate a pattern for.
	 * @param {number} noteCount - Number of note positions to fill.
	 * @param {Object} style - Style information that can influence density.
	 * @param {Object} songProfile - Seed-derived musical blueprint for the song.
	 * @param {number} phraseLength - Number of note positions in one phrase.
	 * @returns {Array<boolean>} The generated rhythmic pattern.
	 */
	function createRolePattern( role, noteCount, style, songProfile, phraseLength ) {

		var templates = getRoleTemplates( role, style );
		var barLength = getBarLength();
		var pattern = [];

		for ( var start = 0; start < noteCount; start += phraseLength ) {
			var phraseIndex = Math.floor( start / phraseLength );
			var sectionName = getSectionName( songProfile, phraseIndex );
			var phrasePattern = [];
			// The first bar states the groove clearly, then later bars mutate it so
			// the phrase feels related rather than freshly random.
			var baseTemplate = pickSeedTemplate( templates, role, songProfile, sectionName );
			var barCount = Math.max( 1, Math.ceil( phraseLength / barLength ) );

			for ( var barIndex = 0; barIndex < barCount; barIndex++ ) {
				var barPattern = barIndex === 0
					? baseTemplate.slice()
					: mutateBarPattern( phrasePattern.slice( -barLength ), role, style, songProfile, sectionName );
				phrasePattern = phrasePattern.concat( barPattern );
			}

			pattern = pattern.concat( phrasePattern );
		}

		pattern = pattern.slice( 0, noteCount );

		if ( pattern.length > 0 ) {
			pattern[ 0 ] = true;
			if ( role !== "drums" ) {
				pattern[ pattern.length - 1 ] = true;
			}
		}

		return pattern;

	}


	/**
	 * Builds a rhythmic pattern for a part using the shared progression context.
	 *
	 * This keeps the part generators shorter and makes it clearer that they all
	 * derive rhythm from the same phrase and song-profile information.
	 *
	 * @param {string} role - The part role to generate a pattern for.
	 * @param {number} noteCount - Number of note positions to fill.
	 * @param {Object} progressionContext - Harmonic context for the generated song.
	 * @param {Object} style - Style information that can influence density.
	 * @returns {Array<boolean>} The generated rhythmic pattern.
	 */
	function getPartPattern( role, noteCount, progressionContext, style ) {

		return createRolePattern(
			role,
			noteCount,
			style,
			progressionContext.songProfile,
			progressionContext.phraseLength
		);

	}


	/**
	 * Resolves whether a harmonic role should behave as chords or arpeggio.
	 *
	 * @param {string} role - Requested role.
	 * @param {Object} style - Style information that can influence arpeggio use.
	 * @returns {string} Either "arp" or "chords".
	 */
	function resolveHarmonicRole( role, style ) {

		if ( role === "arp" ) {
			return "arp";
		}

		return b8.Random.chance( style.arpChance || 30 ) ? "arp" : "chords";

	}


	/**
	 * Converts compact rhythm strings into boolean bar patterns.
	 *
	 * The parser keeps the data representation small and readable while the rest
	 * of the generator can continue working with plain boolean arrays.
	 *
	 * @param {Array<string>} patterns - Compact rhythm strings using "x" and ".".
	 * @returns {Array<Array<boolean>>} Parsed boolean patterns.
	 */
	function parseRhythmTemplates( patterns ) {

		return patterns.map( parseRhythmPattern );

	}


	/**
	 * Converts one compact rhythm string into a boolean bar pattern.
	 *
	 * @param {string} pattern - Compact rhythm string using "x" and ".".
	 * @returns {Array<boolean>} Parsed boolean pattern.
	 */
	function parseRhythmPattern( pattern ) {

		return pattern.split( "" ).map(
			function( char ) {
				return char === "x";
			}
		);

	}


	/**
	 * Returns one-bar rhythm templates for each musical role.
	 *
	 * @param {string} role - The role to generate a pattern for.
	 * @param {Object} style - Style information for optional density tweaks.
	 * @returns {Array<Array<boolean>>} Candidate one-bar patterns.
	 */
	function getRoleTemplates( role, style ) {

		if ( role === "bass" ) {
			return parseRhythmTemplates(
				selectBassTemplatePatterns( style )
			);
		}

		if ( role === "drums" ) {
			return parseRhythmTemplates(
				selectDrumTemplatePatterns( style )
			);
		}

		if ( role === "arp" ) {
			return parseRhythmTemplates(
				selectArpTemplatePatterns( style )
			);
		}

		if ( role === "chords" ) {
			return parseRhythmTemplates(
				selectChordTemplatePatterns( style )
			);
		}

		if ( role === "counter" ) {
			return parseRhythmTemplates(
				selectCounterTemplatePatterns( style )
			);
		}

		return parseRhythmTemplates(
			selectMelodyTemplatePatterns( style )
		);

	}


	/**
	 * Selects bass template patterns based on bass speed.
	 *
	 * @param {Object} style - Style information that influences bass density.
	 * @returns {Array<string>} Compact rhythm patterns.
	 */
	function selectBassTemplatePatterns( style ) {

		var fastestBass = Math.min.apply( null, style.bassInterval || [ 4, 8 ] );

		if ( fastestBass <= 2 ) {
			return RHYTHM_TEMPLATE_PATTERNS.bass.fast;
		}

		if ( fastestBass <= 4 ) {
			return RHYTHM_TEMPLATE_PATTERNS.bass.medium;
		}

		return RHYTHM_TEMPLATE_PATTERNS.bass.slow;

	}


	/**
	 * Selects drum template patterns based on drum density.
	 *
	 * @param {Object} style - Style information that influences drum density.
	 * @returns {Array<string>} Compact rhythm patterns.
	 */
	function selectDrumTemplatePatterns( style ) {

		var density = b8.Random.pick( style.drumDensity || [ 1, 2, 3 ] );

		if ( density >= 4 ) {
			return RHYTHM_TEMPLATE_PATTERNS.drums.heavy;
		}

		if ( density >= 2 ) {
			return RHYTHM_TEMPLATE_PATTERNS.drums.medium;
		}

		return RHYTHM_TEMPLATE_PATTERNS.drums.light;

	}


	/**
	 * Selects arpeggio template patterns based on arpeggio intensity.
	 *
	 * @param {Object} style - Style information that influences arpeggio use.
	 * @returns {Array<string>} Compact rhythm patterns.
	 */
	function selectArpTemplatePatterns( style ) {

		if ( ( style.arpChance || 0 ) >= 80 ) {
			return RHYTHM_TEMPLATE_PATTERNS.arp.busy;
		}

		return RHYTHM_TEMPLATE_PATTERNS.arp.normal;

	}


	/**
	 * Selects chord template patterns based on chord density.
	 *
	 * @param {Object} style - Style information that influences chord density.
	 * @returns {Array<string>} Compact rhythm patterns.
	 */
	function selectChordTemplatePatterns( style ) {

		if ( ( style.chordDensity || 0 ) >= 6 ) {
			return RHYTHM_TEMPLATE_PATTERNS.chords.dense;
		}

		return RHYTHM_TEMPLATE_PATTERNS.chords.light;

	}


	/**
	 * Selects counter-melody template patterns based on melody density.
	 *
	 * @param {Object} style - Style information that influences melody density.
	 * @returns {Array<string>} Compact rhythm patterns.
	 */
	function selectCounterTemplatePatterns( style ) {

		if ( ( style.melodyDensity || 0 ) >= 6 ) {
			return RHYTHM_TEMPLATE_PATTERNS.counter.dense;
		}

		return RHYTHM_TEMPLATE_PATTERNS.counter.light;

	}


	/**
	 * Selects melody template patterns based on melody density.
	 *
	 * @param {Object} style - Style information that influences melody density.
	 * @returns {Array<string>} Compact rhythm patterns.
	 */
	function selectMelodyTemplatePatterns( style ) {

		if ( ( style.melodyDensity || 0 ) <= 2 ) {
			return RHYTHM_TEMPLATE_PATTERNS.melody.sparse;
		}

		if ( ( style.melodyDensity || 0 ) >= 7 ) {
			return RHYTHM_TEMPLATE_PATTERNS.melody.dense;
		}

		return RHYTHM_TEMPLATE_PATTERNS.melody.normal;

	}


	/**
	 * Returns the preferred octave for a musical role and song profile.
	 *
	 * Seed-based register planning helps songs differ more clearly across seeds
	 * while keeping related styles in recognisably similar ranges.
	 *
	 * @param {string} role - The role being generated.
	 * @param {Object} songProfile - Seed-derived musical blueprint for the song.
	 * @returns {number} Preferred octave number.
	 */
	function getRoleTargetOctave( role, songProfile ) {

		var registerOffset = {
			low: -1,
			mid: 0,
			high: 1
		}[ songProfile.registerShape ] || 0;
		var defaults = {
			bass: 2,
			drums: 4,
			arp: 4,
			chords: 5,
			counter: 4,
			melody: 5
		};
		var baseOctave = defaults[ role ] || 5;

		if ( role === "bass" || role === "drums" ) {
			registerOffset = 0;
		}

		return b8.Utilities.clamp( baseOctave + registerOffset, 2, 6 );

	}


	/**
	 * Applies a small mutation to a bar pattern while preserving the main groove.
	 *
	 * @param {Array<boolean>} pattern - The source pattern to vary.
	 * @param {string} role - The part role being mutated.
	 * @param {Object} style - Style information that can influence variation.
	 * @param {Object} songProfile - Seed-derived musical blueprint for the song.
	 * @param {string} sectionName - Current section name such as A or B.
	 * @returns {Array<boolean>} The gently varied pattern.
	 */
	function mutateBarPattern( pattern, role, style, songProfile, sectionName ) {

		var result = pattern.slice();
		var candidateIndexes = role === "drums"
			? [ 2, 3, 5, 6, 7 ]
			: [ 1, 2, 3, 5, 6, 7 ];
		var changeCount = role === "arp" ? 1 : b8.Random.int( 0, 1 );

		if ( role === "melody" && ( style.melodyDensity || 0 ) >= 7 ) {
			changeCount = 1;
		}

		if ( role === "chords" && ( style.chordDensity || 0 ) >= 6 ) {
			changeCount = 1;
		}

		if ( sectionName === "B" || sectionName === "A_PRIME" ) {
			// Variant sections are allowed one extra mutation so the back half of
			// the song reads as an intentional development of the first half.
			changeCount += 1;
		}

		for ( var i = 0; i < changeCount; i++ ) {
			var familyOffset = songProfile.rhythmFamily[ role ] || 0;
			// The family offset nudges each role toward a repeatable mutation style
			// for the current seed instead of fully independent random flips.
			var index = candidateIndexes[ ( familyOffset + i + b8.Random.int( 0, candidateIndexes.length - 1 ) ) % candidateIndexes.length ];
			result[ index ] = !result[ index ];
		}

		result[ 0 ] = pattern[ 0 ];

		return result;

	}


	/**
	 * Picks a base rhythm template using the seed-derived rhythm family.
	 *
	 * This keeps songs with the same seed in the same rhythmic neighbourhood,
	 * while still allowing section B to branch to a related family member.
	 *
	 * @param {Array<Array<boolean>>} templates - Templates available for the role.
	 * @param {string} role - The role being generated.
	 * @param {Object} songProfile - Seed-derived musical blueprint for the song.
	 * @param {string} sectionName - Current section name.
	 * @returns {Array<boolean>} The selected bar template.
	 */
	function pickSeedTemplate( templates, role, songProfile, sectionName ) {

		var familyIndex = songProfile.rhythmFamily[ role ] || 0;
		var templateIndex = familyIndex % templates.length;

		if ( sectionName === "B" ) {
			templateIndex = ( templateIndex + 1 ) % templates.length;
		} else if ( sectionName === "A_PRIME" ) {
			templateIndex = ( templateIndex + templates.length - 1 ) % templates.length;
		}

		return templates[ templateIndex ];

	}


	/**
	 * Gets the section name for a phrase index using the song profile.
	 *
	 * @param {Object} songProfile - Seed-derived musical blueprint for the song.
	 * @param {number} phraseIndex - Phrase index in the song.
	 * @returns {string} The section name.
	 */
	function getSectionName( songProfile, phraseIndex ) {

		return songProfile.sectionForm[ phraseIndex % songProfile.sectionForm.length ];

	}


	/**
	 * Returns the progression to use for the current section.
	 *
	 * Section B rotates the progression so different seeds can have stronger
	 * contrast between sections without losing the harmonic family.
	 *
	 * @param {Array<string>} progression - Base progression.
	 * @param {Object} songProfile - Seed-derived musical blueprint for the song.
	 * @param {string} sectionName - Current section name.
	 * @returns {Array<string>} Progression for the current section.
	 */
	function getSectionProgression( progression, songProfile, sectionName ) {

		if ( sectionName === "B" ) {
			// Section B keeps the same harmonic family but starts from a different
			// point, which usually feels like motion without sounding unrelated.
			return rotateArray( progression, songProfile.progressionRotation );
		}

		if ( sectionName === "C" ) {
			// Section C is the most contrasting section: we rotate further and push
			// the start and end toward tension so it feels like a new chapter.
			var contrasted = rotateArray( progression, songProfile.progressionRotation + 1 );
			contrasted[ 0 ] = "VIm";
			contrasted[ contrasted.length - 1 ] = "V";
			return contrasted;
		}

		if ( sectionName === "A_PRIME" ) {
			var varied = progression.slice();
			varied[ varied.length - 2 ] = "V";
			return varied;
		}

		return progression;

	}


	/**
	 * Rotates an array by a fixed offset.
	 *
	 * @param {Array<any>} values - Values to rotate.
	 * @param {number} amount - Rotation amount.
	 * @returns {Array<any>} Rotated array.
	 */
	function rotateArray( values, amount ) {

		var result = [];

		for ( var i = 0; i < values.length; i++ ) {
			result.push( values[ ( i + amount ) % values.length ] );
		}

		return result;

	}


	/**
	 * Adjusts a chord length by one musical step while staying in the supported set.
	 *
	 * @param {number} chordLength - Original chord length.
	 * @param {number} bias - Signed shift amount.
	 * @returns {number} Adjusted chord length.
	 */
	function adjustChordLength( chordLength, bias ) {

		var supported = [ 2, 4, 8, 16, 32 ];
		var index = supported.indexOf( chordLength );

		if ( index === -1 ) {
			return chordLength;
		}

		return supported[ b8.Utilities.clamp( index + bias, 0, supported.length - 1 ) ];

	}


	/**
	 * Collects scale notes for a key across a MIDI range.
	 *
	 * @param {string} key - Musical key.
	 * @param {number} minMidi - Minimum MIDI value.
	 * @param {number} maxMidi - Maximum MIDI value.
	 * @returns {Array<number>} MIDI notes that belong to the scale.
	 */
	function buildScaleMidi( key, minMidi, maxMidi ) {

		var tonic = keyShift[ key ] || 0;
		var majorScale = [ 0, 2, 4, 5, 7, 9, 11 ];
		var pitchClasses = majorScale.map(
			function( value ) {
				return ( value + tonic ) % 12;
			}
		);
		var scale = [];

		for ( var midi = minMidi; midi <= maxMidi; midi++ ) {
			if ( pitchClasses.indexOf( ( ( midi % 12 ) + 12 ) % 12 ) !== -1 ) {
				scale.push( midi );
			}
		}

		return scale;

	}


	/**
	 * Converts an array of note strings to MIDI notes.
	 *
	 * @param {Array<string>} notes - Notes to convert.
	 * @returns {Array<number>} MIDI note values.
	 */
	function toMidiList( notes ) {

		return notes.map( noteToMidi ).filter(
			function( midi ) {
				return midi !== null;
			}
		);

	}


	/**
	 * Normalises a MIDI note so it sits near the requested octave.
	 *
	 * @param {number} midi - MIDI note to move.
	 * @param {number} octave - Target octave number.
	 * @returns {number} Adjusted MIDI note.
	 */
	function normalizeMidiToOctave( midi, octave ) {

		var target = ( octave + 1 ) * 12;
		var pitchClass = ( ( midi % 12 ) + 12 ) % 12;

		return target + pitchClass;

	}


	/**
	 * Returns a de-duplicated copy of a numeric array.
	 *
	 * @param {Array<number>} values - Values to de-duplicate.
	 * @returns {Array<number>} Unique numeric values.
	 */
	function uniqueNumbers( values ) {

		return Array.from( new Set( values ) );

	}


	/**
	 * Moves one step through the supplied scale toward a target MIDI note.
	 *
	 * @param {number} currentMidi - Current MIDI note.
	 * @param {number} targetMidi - Desired destination note.
	 * @param {Array<number>} scale - Available scale notes.
	 * @returns {number} The next scale step.
	 */
	function moveOneStepToward( currentMidi, targetMidi, scale ) {

		var orderedScale = scale.slice().sort(
			function( a, b ) {
				return a - b;
			}
		);
		var currentIndex = findNearestIndex( orderedScale, currentMidi );
		var targetIndex = findNearestIndex( orderedScale, targetMidi );

		if ( currentIndex === targetIndex ) {
			return orderedScale[ currentIndex ];
		}

		return orderedScale[ currentIndex + ( targetIndex > currentIndex ? 1 : -1 ) ];

	}


	/**
	 * Finds the nearest index in a sorted array of values.
	 *
	 * @param {Array<number>} values - Sorted values.
	 * @param {number} target - Target value.
	 * @returns {number} Index of the nearest value.
	 */
	function findNearestIndex( values, target ) {

		var nearestIndex = 0;
		var nearestDistance = Infinity;

		for ( var i = 0; i < values.length; i++ ) {
			var distance = Math.abs( values[ i ] - target );

			if ( distance < nearestDistance ) {
				nearestIndex = i;
				nearestDistance = distance;
			}
		}

		return nearestIndex;

	}


	/**
	 * Collects melody candidates for the current harmonic moment.
	 *
	 * Strong beats favour chord tones. Weak beats can also use passing tones from
	 * the current scale as long as they stay near the current melodic register.
	 *
	 * @param {Object} step - Current progression step.
	 * @param {Array<number>} scale - MIDI notes in the key.
	 * @param {number} targetOctave - Preferred melodic octave.
	 * @param {number|null} previousMidi - Previously selected melody note.
	 * @param {number|null} previousInterval - Previous melodic interval in semitones.
	 * @param {Object} songProfile - Seed-derived musical blueprint for the song.
	 * @returns {Array<number>} Candidate melody notes.
	 */
	function gatherMelodyCandidates( step, scale, targetOctave, previousMidi, previousInterval, songProfile ) {

		var anchor = normalizeMidiToOctave( step.chordMidi[ 0 ], targetOctave );
		var candidates = step.chordMidi.map(
			function( midi ) {
				return normalizeMidiToOctave( midi, targetOctave );
			}
		);

		// Strong beats lean toward harmony. Weak beats are where we allow more
		// passing colour so the melody can weave between the chord tones.
		if ( step.stepStrength >= 2 ) {
			candidates = candidates.concat(
				scale.filter(
					function( midi ) {
						return Math.abs( midi - anchor ) <= 4;
					}
				)
			);
		}

		if ( step.phraseEnd ) {
			candidates.push( normalizeMidiToOctave( step.chordMidi[ 0 ], targetOctave ) );
			candidates.push( normalizeMidiToOctave( step.chordMidi[ 1 ] || step.chordMidi[ 0 ], targetOctave ) );
		}

		candidates = candidates.concat(
			getMelodicDecorationCandidates(
				scale,
				previousMidi,
				previousInterval,
				step.stepStrength
			)
		);

		if ( previousMidi !== null && b8.Random.chance( songProfile.melodicFreedom ) ) {
			// This is the main "pleasant surprise" path: occasionally reaching for
			// a nearby scale tone that is good enough, even if not the safest pick.
			candidates = candidates.concat(
				getNearbyScaleCandidates(
					scale,
					previousMidi,
					1,
					step.stepStrength >= 2 ? 2 : 1
				)
			);
		}

		return uniqueNumbers( candidates );

	}


	/**
	 * Returns the preferred melodic target for a phrase step.
	 *
	 * Each contour type maps the phrase onto a different high-level shape so
	 * seeds differ more strongly in their melodic identity.
	 *
	 * @param {Object} step - Current progression step.
	 * @param {Array<number>} scale - MIDI notes in the key.
	 * @param {number} targetOctave - Preferred melodic octave.
	 * @param {Object} songProfile - Seed-derived musical blueprint for the song.
	 * @param {number} phraseStep - Step index within the phrase.
	 * @param {number} phraseLength - Total steps in the phrase.
	 * @returns {number} Preferred MIDI note.
	 */
	function getContourPreferredMidi( step, scale, targetOctave, songProfile, phraseStep, phraseLength ) {

		var anchorMidi = normalizeMidiToOctave( step.chordMidi[ 0 ], targetOctave );
		var ratio = phraseLength <= 1 ? 0 : phraseStep / ( phraseLength - 1 );
		var degreeOffset = 0;

		switch ( songProfile.contourType ) {
			case "rise":
				degreeOffset = Math.round( ratio * 4 );
				break;

			case "fall":
				degreeOffset = Math.round( ( 1 - ratio ) * 4 );
				break;

			case "arch":
				degreeOffset = Math.round( ( 1 - Math.abs( 0.5 - ratio ) * 2 ) * 4 );
				break;

			case "wave":
				degreeOffset = Math.round( Math.sin( ratio * Math.PI * 2 ) * 2 ) + 2;
				break;

			case "stair":
				degreeOffset = Math.floor( ratio * 5 );
				break;

			case "hover":
			default:
				degreeOffset = phraseStep % 2 === 0 ? 1 : 2;
				break;
		}

		return findScaleNoteByDegreeOffset( scale, anchorMidi, degreeOffset );

	}


	/**
	 * Adds small melodic decoration candidates around the previous note.
	 *
	 * This creates more motion inside a contour by offering passing tones,
	 * neighbour tones, and gentle continuation notes on weaker beats.
	 *
	 * @param {Array<number>} scale - MIDI notes in the key.
	 * @param {number|null} previousMidi - Previously selected melody note.
	 * @param {number|null} previousInterval - Previous melodic interval.
	 * @param {number} stepStrength - Strength of the current rhythmic position.
	 * @returns {Array<number>} Decoration candidates.
	 */
	function getMelodicDecorationCandidates( scale, previousMidi, previousInterval, stepStrength ) {

		if ( previousMidi === null ) {
			return [];
		}

		var candidates = [];

		// Weak beats are the best place for passing notes and neighbour notes.
		if ( stepStrength >= 2 ) {
			candidates.push( moveByScaleDegrees( scale, previousMidi, 1 ) );
			candidates.push( moveByScaleDegrees( scale, previousMidi, -1 ) );
		}

		// If we already moved, allow a small continuation or a step back.
		if ( previousInterval !== null && previousInterval !== 0 ) {
			var direction = previousInterval > 0 ? 1 : -1;
			candidates.push( moveByScaleDegrees( scale, previousMidi, direction ) );
			candidates.push( moveByScaleDegrees( scale, previousMidi, -direction ) );
		}

		return uniqueNumbers(
			candidates.filter(
				function( midi ) {
					return midi !== null;
				}
			)
		);

	}


	/**
	 * Returns the cadence tone preferred for the end of a phrase.
	 *
	 * @param {Object} step - Current progression step.
	 * @param {number} targetOctave - Preferred melodic octave.
	 * @param {Object} songProfile - Seed-derived musical blueprint for the song.
	 * @returns {number} Cadential MIDI note.
	 */
	function getCadenceMidi( step, targetOctave, songProfile ) {

		var chordIndex = 0;

		if ( songProfile.cadenceTarget === "third" ) {
			chordIndex = 1;
		} else if ( songProfile.cadenceTarget === "fifth" ) {
			chordIndex = 2;
		}

		return normalizeMidiToOctave(
			step.chordMidi[ chordIndex ] || step.chordMidi[ 0 ],
			targetOctave
		);

	}


	/**
	 * Finds a nearby scale tone by moving a number of scale degrees from an anchor.
	 *
	 * @param {Array<number>} scale - MIDI notes in the key.
	 * @param {number} anchorMidi - Starting note.
	 * @param {number} degreeOffset - Number of scale steps to move.
	 * @returns {number} The resulting scale note.
	 */
	function findScaleNoteByDegreeOffset( scale, anchorMidi, degreeOffset ) {

		var orderedScale = scale.slice().sort(
			function( a, b ) {
				return a - b;
			}
		);
		var anchorIndex = findNearestIndex( orderedScale, anchorMidi );
		var targetIndex = b8.Utilities.clamp(
			anchorIndex + degreeOffset,
			0,
			orderedScale.length - 1
		);

		return orderedScale[ targetIndex ];

	}


	/**
	 * Moves a note by a number of scale degrees inside the current key.
	 *
	 * @param {Array<number>} scale - MIDI notes in the key.
	 * @param {number} midi - Starting MIDI note.
	 * @param {number} degreeOffset - Number of scale steps to move.
	 * @returns {number|null} The destination note, or null if unavailable.
	 */
	function moveByScaleDegrees( scale, midi, degreeOffset ) {

		if ( degreeOffset === 0 ) {
			return midi;
		}

		var orderedScale = scale.slice().sort(
			function( a, b ) {
				return a - b;
			}
		);
		var anchorIndex = findNearestIndex( orderedScale, midi );
		var targetIndex = anchorIndex + degreeOffset;

		if ( targetIndex < 0 || targetIndex >= orderedScale.length ) {
			return null;
		}

		return orderedScale[ targetIndex ];

	}


	/**
	 * Collects nearby scale notes around a starting note.
	 *
	 * This gives the picker a few extra colour tones so the music can sometimes
	 * make a more interesting choice than the safest immediate winner.
	 *
	 * @param {Array<number>} scale - MIDI notes in the key.
	 * @param {number} midi - Starting MIDI note.
	 * @param {number} minDegrees - Minimum scale-step distance to include.
	 * @param {number} maxDegrees - Maximum scale-step distance to include.
	 * @returns {Array<number>} Nearby scale notes.
	 */
	function getNearbyScaleCandidates( scale, midi, minDegrees, maxDegrees ) {

		var candidates = [];

		for ( var degrees = minDegrees; degrees <= maxDegrees; degrees++ ) {
			candidates.push( moveByScaleDegrees( scale, midi, degrees ) );
			candidates.push( moveByScaleDegrees( scale, midi, -degrees ) );
		}

		return candidates.filter(
			function( candidate ) {
				return candidate !== null;
			}
		);

	}


	/**
	 * Chooses the most musical candidate note from a set of MIDI values.
	 *
	 * The scoring favours nearby notes, stepwise motion, and an optional pitch
	 * target so parts move smoothly instead of jumping around aimlessly.
	 *
	 * @param {Array<number>} candidates - Candidate MIDI notes.
	 * @param {number|null} previousMidi - Previously played MIDI note.
	 * @param {Object} options - Selection options.
	 * @param {number|null} [options.prefer] - Preferred pitch target.
	 * @param {number} [options.maxLeap=7] - Preferred maximum leap size in semitones.
	 * @param {boolean} [options.preferMotion=false] - Whether to favour local movement over exact repeats.
	 * @param {boolean} [options.avoidRepeat=false] - Whether to penalise repeating the previous pitch.
	 * @param {number} [options.explorationChance=0] - Chance of picking from the near-best set instead of the single best note.
	 * @returns {number|null} The selected MIDI note.
	 */
	function chooseCandidateMidi( candidates, previousMidi, options ) {

		if ( !candidates || candidates.length === 0 ) {
			return null;
		}

		options = options || {};

		var preferredMidi = typeof options.prefer === "number" ? options.prefer : null;
		var maxLeap = typeof options.maxLeap === "number" ? options.maxLeap : 7;
		var preferMotion = options.preferMotion === true;
		var avoidRepeat = options.avoidRepeat === true;
		var explorationChance = typeof options.explorationChance === "number"
			? options.explorationChance
			: 0;
		var bestScore = -Infinity;
		var bestCandidates = [];
		var scoredCandidates = [];

		for ( var i = 0; i < candidates.length; i++ ) {
			var candidate = candidates[ i ];
			var score = 0;

			// The score blends three goals: stay singable, respect the current
			// musical target, and avoid getting trapped in lifeless repetition.
			if ( previousMidi !== null ) {
				var leap = Math.abs( candidate - previousMidi );
				score -= leap;

				if ( leap === 0 ) {
					score -= avoidRepeat ? 4 : 1;
				} else if ( leap <= 2 ) {
					score += 5;
				} else if ( leap <= 4 ) {
					score += 2;
				} else if ( leap > maxLeap ) {
					score -= 8;
				}

				if ( preferMotion && leap > 0 && leap <= 2 ) {
					score += 2;
				}
			}

			if ( preferredMidi !== null ) {
				score -= Math.abs( candidate - preferredMidi ) * ( preferMotion ? 0.35 : 0.75 );
			}

			// A tiny nudge prevents every phrase from resolving identically.
			score += b8.Random.int( 0, 2 ) * 0.25;
			scoredCandidates.push( { candidate: candidate, score: score } );

			if ( score > bestScore ) {
				bestScore = score;
				bestCandidates = [ candidate ];
			} else if ( score === bestScore ) {
				bestCandidates.push( candidate );
			}
		}

		if ( explorationChance > 0 && b8.Random.chance( explorationChance ) ) {
			// Sometimes we intentionally pick from the near-best set. That keeps
			// the music lively while still staying within musically sensible bounds.
			var nearBestCandidates = scoredCandidates.filter(
				function( entry ) {
					return entry.score >= bestScore - 2;
				}
			).map(
				function( entry ) {
					return entry.candidate;
				}
			);

			if ( nearBestCandidates.length > 0 ) {
				return b8.Random.pick( uniqueNumbers( nearBestCandidates ) );
			}
		}

		return b8.Random.pick( bestCandidates );

	}

} )( b8 );
