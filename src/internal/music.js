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
	 * Tonal palettes used to give songs different harmonic colours.
	 *
	 * Each palette provides scale intervals relative to its tonic. Most palettes
	 * also provide their own diatonic chord map. The pentatonic palette keeps the
	 * familiar major harmony while restricting melodic movement to five notes.
	 *
	 * @type {Object<string, {scaleIntervals: Array<number>, chordMap: Object<string, Array<string>>}>}
	 */
	const TONAL_PALETTES = {
		major: {
			scaleIntervals: [ 0, 2, 4, 5, 7, 9, 11 ],
			chordMap: chordMap
		},
		naturalMinor: {
			scaleIntervals: [ 0, 2, 3, 5, 7, 8, 10 ],
			chordMap: {
				I: [ "C4", "Eb4", "G4", "Bb4" ],
				IIIm: [ "Eb4", "G4", "Bb4", "D5" ],
				VIm: [ "Ab3", "C4", "Eb4", "G4" ],
				IV: [ "F4", "Ab4", "C5", "Eb5" ],
				IIm: [ "D4", "F4", "Ab4", "C5" ],
				V: [ "G3", "Bb3", "D4", "F4" ],
				VIIm: [ "Bb3", "D4", "F4", "Ab4" ]
			}
		},
		dorian: {
			scaleIntervals: [ 0, 2, 3, 5, 7, 9, 10 ],
			chordMap: {
				I: [ "C4", "Eb4", "G4", "Bb4" ],
				IIIm: [ "Eb4", "G4", "Bb4", "D5" ],
				VIm: [ "A3", "C4", "Eb4", "G4" ],
				IV: [ "F4", "A4", "C5", "Eb5" ],
				IIm: [ "D4", "F4", "A4", "C5" ],
				V: [ "G3", "Bb3", "D4", "F4" ],
				VIIm: [ "Bb3", "D4", "F4", "A4" ]
			}
		},
		mixolydian: {
			scaleIntervals: [ 0, 2, 4, 5, 7, 9, 10 ],
			chordMap: {
				I: [ "C4", "E4", "G4", "Bb4" ],
				IIIm: [ "E4", "G4", "Bb4", "D5" ],
				VIm: [ "A3", "C4", "E4", "G4" ],
				IV: [ "F4", "A4", "C5", "E5" ],
				IIm: [ "D4", "F4", "A4", "C5" ],
				V: [ "G3", "Bb3", "D4", "F4" ],
				VIIm: [ "Bb3", "D4", "F4", "A4" ]
			}
		},
		pentatonic: {
			scaleIntervals: [ 0, 2, 4, 7, 9 ],
			chordMap: chordMap
		}
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
	 * Seed-plan options used to build a song blueprint.
	 *
	 * Keeping these lists in one place makes the high-level musical choices
	 * easier to scan and tweak without digging through the generator logic.
	 *
	 * @type {Object<string, Array<any>>}
	 */
	const SONG_PLAN_OPTIONS = {
		sectionForms: [
			[ "A", "A_PRIME" ],
			[ "A", "B" ],
			[ "A", "B", "A" ],
			[ "A", "B", "A_PRIME" ],
			[ "A", "B", "C" ],
			[ "A", "A_PRIME", "B", "A" ],
			[ "A", "A_PRIME", "B", "C" ],
			[ "A", "B", "A_PRIME", "C" ],
			[ "A", "B", "A", "C" ],
			[ "A", "B", "C", "A" ],
			[ "A", "B", "A_PRIME", "B", "C" ],
			[ "A", "A_PRIME", "B", "A_PRIME", "C" ]
		],
		contours: [ "rise", "fall", "arch", "wave", "hover", "stair" ],
		cadenceTarget: [ "root", "root", "third", "fifth" ],
		// Major remains the common home base, while the other palettes provide
		// predictable but noticeably different moods for some seeds.
		palettes: [ "major", "major", "major", "naturalMinor", "dorian", "mixolydian", "pentatonic" ],
		arrangements: [
			{
				name: "build",
				roles: {
					A: [ "bass", "chords" ],
					A_PRIME: [ "bass", "chords", "melody" ],
					B: [ "bass", "chords", "arp", "melody" ],
					C: [ "bass", "chords", "arp", "melody", "counter", "drums" ]
				}
			},
			{
				name: "wave",
				roles: {
					A: [ "bass", "chords", "melody" ],
					A_PRIME: [ "bass", "chords", "arp", "melody" ],
					B: [ "bass", "chords", "counter" ],
					C: [ "bass", "chords", "arp", "melody", "counter", "drums" ]
				}
			},
			{
				name: "spotlight",
				roles: {
					A: [ "bass", "chords", "counter" ],
					A_PRIME: [ "bass", "chords", "melody" ],
					B: [ "bass", "chords", "arp", "melody", "drums" ],
					C: [ "bass", "chords", "arp", "melody", "counter", "drums" ]
				}
			}
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

		var songPlan = createSongPlan( opts.noteCount );
		var progressionContext = generateChordProgression( opts.noteCount, style, songPlan );
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
 * Gets the chord notes for a given key, Roman numeral, and tonal palette.
 *
 * @param {string} key - The musical key (e.g., "C").
 * @param {string} roman - The Roman numeral chord identifier (e.g., "I", "IIIm").
 * @param {Object} tonalPalette - Palette containing the chord qualities to use.
 * @returns {Array<string>} An array of chord note strings.
 */
	function getChordNotes( key, roman, tonalPalette ) {

		const paletteChordMap = tonalPalette && tonalPalette.chordMap
			? tonalPalette.chordMap
			: chordMap;
		const base = paletteChordMap[ roman ] || paletteChordMap.I;
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
 * Creates a seed-derived song plan.
	 *
	 * The profile acts as the musical blueprint for a seed. Styles then interpret
	 * that blueprint with their own density and instrumentation settings, which
	 * keeps the "same seed, same family" behaviour while making different seeds
	 * diverge more clearly.
	 *
	 * @param {number} noteCount - Number of note positions in the song.
 * @returns {Object} Song plan used across the generator.
 */
	function createSongPlan( noteCount ) {

		var totalBars = Math.max( 1, Math.ceil( noteCount / getBarLength() ) );
		// The plan is the complete high-level identity of the song. Every later
		// generator reads these four decisions instead of making structural choices.
		var sectionForm = pickSectionForm( totalBars );

		return {
			sectionForm: sectionForm,
			phraseBarCount: getPhraseBarCount( totalBars, sectionForm ),
			contour: b8.Random.pick( SONG_PLAN_OPTIONS.contours ),
			cadenceTarget: b8.Random.pick( SONG_PLAN_OPTIONS.cadenceTarget ),
			tonalPaletteName: b8.Random.pick( SONG_PLAN_OPTIONS.palettes ),
			arrangement: b8.Random.pick( SONG_PLAN_OPTIONS.arrangements )
		};

	}


	/**
 * Derives a phrase size that fits the available song length and form.
	 *
	 * Longer songs are allowed broader phrases, while shorter songs stay more
	 * compact so the structure remains audible.
	 *
	 * @param {number} totalBars - Total bar count for the song.
 * @param {Array<string>} sectionForm - Chosen section form for the song.
 * @returns {number} Phrase size in bars.
 */
	function getPhraseBarCount( totalBars, sectionForm ) {

		var barsPerSection = Math.max( 2, Math.floor( totalBars / sectionForm.length ) );

		if ( barsPerSection >= 8 ) return 8;
		if ( barsPerSection >= 4 ) return 4;

		return 2;

	}


	/**
	 * Picks a section form that makes good use of the available number of phrases.
	 *
	 * Faster or longer songs benefit from more sections so they do not reveal the
	 * whole idea too quickly. Shorter songs use simpler forms to avoid feeling
	 * over-composed.
	 *
	 * @param {number} totalBars - Total bar count for the song.
 * @returns {Array<string>} Section form such as A-B-A or A-A-B-A.
 */
	function pickSectionForm( totalBars ) {

		var phraseCapacity = Math.max( 1, Math.floor( totalBars / 2 ) );
		var availableForms = SONG_PLAN_OPTIONS.sectionForms.filter(
			function( form ) {
				return form.length <= phraseCapacity;
			}
		);

		if ( availableForms.length === 0 ) {
			availableForms = [ [ "A", "B" ] ];
		}

		if ( phraseCapacity >= 4 ) {
			availableForms = availableForms.filter(
				function( form ) {
					return form.length >= 3;
				}
			);
		}

		if ( availableForms.length === 0 ) {
			availableForms = SONG_PLAN_OPTIONS.sectionForms.filter(
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
	 * @param {Object} songPlan - Seed-derived musical plan for the song.
	 * @returns {Object} Progression context used by part generators.
	 */
	function generateChordProgression( noteCount, style, songPlan ) {

		var keys = [ "C", "D", "Eb", "F", "G", "A", "Bb" ];
		var key = b8.Random.pick( keys );
		var progression = b8.Random.pick( PROGRESSIONS ).slice();
		var chordLength = b8.Random.pick( style.chordLength || [ 4, 8, 8, 16 ] );
		var barLength = getBarLength();
		var phraseLength = barLength * songPlan.phraseBarCount;
		var tonalPalette = TONAL_PALETTES[ songPlan.tonalPaletteName ] || TONAL_PALETTES.major;
		// The selected palette supplies both the notes melodies may use and the
		// chord qualities the progression is built from.
		var scale = buildScaleMidi( key, tonalPalette.scaleIntervals, 36, 87 );
		var chordSequence = [];
		var steps = [];

		for ( var i = 0; i < noteCount; i++ ) {
			// We work out where we are in the larger form first, then derive the
			// local harmony from that section and phrase position.
			var phraseIndex = Math.floor( i / phraseLength );
			var sectionName = getSectionName( songPlan, phraseIndex );
			var activeProgression = getSectionProgression( progression, sectionName );
			var activeChordLength = chordLength;
			var sectionStepIndex = i % phraseLength;
			var sequenceIndex = Math.floor( sectionStepIndex / activeChordLength ) % activeProgression.length;
			var roman = activeProgression[ sequenceIndex ];
			var chordNotes = getChordNotes( key, roman, tonalPalette );
			var chordMidi = toMidiList( chordNotes );

			chordSequence.push( roman );

			steps.push( {
				index: i,
				key: key,
				tonalPaletteName: songPlan.tonalPaletteName,
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
			barLength: barLength,
			phraseLength: phraseLength,
			songPlan: songPlan,
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

		for ( var i = 0; i < noteCount; i++ ) {
			var step = progressionContext.steps[ i ];

			if ( !pattern[ i ] || !isRoleActiveInSection( "bass", step.sectionName, progressionContext.songPlan ) ) {
				notes.push( " " );
				continue;
			}

			var rootMidi = normalizeMidiToOctave( step.chordMidi[ 0 ], 2 );
			var fifthMidi = normalizeMidiToOctave( step.chordMidi[ 2 ] || step.chordMidi[ 0 ], 2 );
			var selectedMidi = step.stepStrength > 0 ? fifthMidi : rootMidi;

			// A chord change is announced by its root. Just before one, the bass
			// walks one scale step toward the next root instead of guessing a note.
			if ( step.chordEnd && i < noteCount - 1 ) {
				var nextRoot = normalizeMidiToOctave(
					progressionContext.steps[ i + 1 ].chordMidi[ 0 ],
					2
				);
				selectedMidi = moveOneStepToward( rootMidi, nextRoot, progressionContext.scale );
			}
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
		var pattern = getPartPattern( role, noteCount, progressionContext, style );
		var phraseLength = progressionContext.phraseLength;
		var targetOctave = getRoleTargetOctave( role );
		var previousMidi = null;

		for ( var i = 0; i < noteCount; i++ ) {
			var step = progressionContext.steps[ i ];

			if ( !pattern[ i ] || !isRoleActiveInSection( role, step.sectionName, progressionContext.songPlan ) ) {
				notes.push( " " );
				continue;
			}

			var contourTarget = getContourTargetMidi(
				step,
				progressionContext.scale,
				targetOctave,
				progressionContext.songPlan,
				i % phraseLength,
				phraseLength
			);
			var selectedMidi = getMelodyStepMidi(
				step,
				previousMidi,
				contourTarget,
				progressionContext.scale,
				targetOctave,
				progressionContext.songPlan
			);
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
		var harmonicRole = role;
		var isArpeggio = harmonicRole === "arp";
		var pattern = getPartPattern( harmonicRole, noteCount, progressionContext, style );

		for ( var i = 0; i < noteCount; i++ ) {
			var step = progressionContext.steps[ i ];

			if ( !pattern[ i ] || !isRoleActiveInSection( harmonicRole, step.sectionName, progressionContext.songPlan ) ) {
				notes.push( " " );
				continue;
			}

			var targetOctave = getRoleTargetOctave( harmonicRole );
			var chordIndex = 0;

			if ( isArpeggio ) {
				// This fixed shape makes arpeggios recognisable without a second set
				// of seed settings: root, third, fifth, then a gentle way back down.
				chordIndex = [ 0, 1, 2, 1, 3, 2, 1, 2 ][ i % 8 ];
			} else {
				// Held accompaniment alternates through chord tones between chord
				// changes, which prevents slow songs from sitting on one note.
				chordIndex = step.chordStart ? 0 : step.stepStrength <= 1 ? 1 : 2;
			}

			var selectedMidi = normalizeMidiToOctave(
				step.chordMidi[ chordIndex % step.chordMidi.length ],
				targetOctave
			);
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
			var step = progressionContext.steps[ i ];
			var shouldPlay = pattern[ i ] && isRoleActiveInSection(
				"drums", step.sectionName, progressionContext.songPlan
			);
			notes.push( shouldPlay ? drumHit : " " );
		}

		notes.push( "|" );

		return compressNotes( notes );

	}


	/**
	 * Decides whether a role belongs in the current section.
	 *
	 * Rhythm patterns decide individual hits; this list decides which instruments
	 * are present at all. Reading the chosen arrangement tells us the song's
	 * build immediately, without translating probability ranges.
	 *
	 * @param {string} role - Musical role being considered.
	 * @param {string} sectionName - Current section name.
	 * @param {Object} songPlan - Seed-derived musical plan.
	 * @returns {boolean} Whether the role belongs in this section.
	 */
	function isRoleActiveInSection( role, sectionName, songPlan ) {

		var roles = songPlan.arrangement.roles[ sectionName ] || songPlan.arrangement.roles.A;

		return roles.indexOf( role ) !== -1;

	}


	/**
	 * Creates a role-specific pattern by repeating bars and mutating them gently.
	 *
	 * @param {string} role - The part role to generate a pattern for.
	 * @param {number} noteCount - Number of note positions to fill.
	 * @param {Object} style - Style information that can influence density.
	 * @param {Object} songPlan - Seed-derived musical plan for the song.
	 * @param {number} phraseLength - Number of note positions in one phrase.
	 * @returns {Array<boolean>} The generated rhythmic pattern.
	 */
	function createRolePattern( role, noteCount, style, songPlan, phraseLength ) {

		var templates = getRoleTemplates( role, style );
		var barLength = getBarLength();
		var pattern = [];

		for ( var start = 0; start < noteCount; start += phraseLength ) {
			var phraseIndex = Math.floor( start / phraseLength );
			var sectionName = getSectionName( songPlan, phraseIndex );
			var phrasePattern = [];
			// The first bar states the groove clearly, then later bars mutate it so
			// the phrase feels related rather than freshly random.
			var baseTemplate = pickSectionTemplate( templates, sectionName );
			var barCount = Math.max( 1, Math.ceil( phraseLength / barLength ) );

			for ( var barIndex = 0; barIndex < barCount; barIndex++ ) {
				var barPattern = barIndex === 0
					? baseTemplate.slice()
					: mutateBarPattern( phrasePattern.slice( -barLength ), role, style, sectionName );
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
			progressionContext.songPlan,
			progressionContext.phraseLength
		);

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

		var templateRole = RHYTHM_TEMPLATE_PATTERNS[ role ] ? role : "melody";
		var templateFamily = getRhythmTemplateFamily( templateRole, style );

		return parseRhythmTemplates(
			RHYTHM_TEMPLATE_PATTERNS[ templateRole ][ templateFamily ]
		);

	}


	/**
	 * Selects the named rhythm-template family for a role.
	 *
	 * This is the single bridge from broad style settings to the compact rhythm
	 * data above. Keeping the decision here prevents each role from needing a
	 * separate near-identical selector function.
	 *
	 * @param {string} role - The role whose rhythm templates are needed.
	 * @param {Object} style - Style information that controls rhythm density.
	 * @returns {string} Key of the template family to use.
	 */
	function getRhythmTemplateFamily( role, style ) {

		switch ( role ) {
			case "bass":
				var fastestBass = Math.min.apply( null, style.bassInterval || [ 4, 8 ] );
				return fastestBass <= 2 ? "fast" : fastestBass <= 4 ? "medium" : "slow";

			case "drums":
				var drumDensity = b8.Random.pick( style.drumDensity || [ 1, 2, 3 ] );
				return drumDensity >= 4 ? "heavy" : drumDensity >= 2 ? "medium" : "light";

			case "arp":
				return ( style.arpChance || 0 ) >= 80 ? "busy" : "normal";

			case "chords":
				return ( style.chordDensity || 0 ) >= 6 ? "dense" : "light";

			case "counter":
				return ( style.melodyDensity || 0 ) >= 6 ? "dense" : "light";

			case "melody":
			default:
				if ( ( style.melodyDensity || 0 ) <= 2 ) return "sparse";
				return ( style.melodyDensity || 0 ) >= 7 ? "dense" : "normal";
		}

	}


	/**
	 * Returns the preferred octave for a musical role.
	 *
	 * @param {string} role - The role being generated.
	 * @returns {number} Preferred octave number.
	 */
	function getRoleTargetOctave( role ) {
		var defaults = {
			bass: 2,
			drums: 4,
			arp: 4,
			chords: 5,
			counter: 4,
			melody: 5
		};
		return defaults[ role ] || 5;

	}


	/**
	 * Applies a small mutation to a bar pattern while preserving the main groove.
	 *
	 * @param {Array<boolean>} pattern - The source pattern to vary.
	 * @param {string} role - The part role being mutated.
	 * @param {Object} style - Style information that can influence variation.
	 * @param {string} sectionName - Current section name such as A or B.
	 * @returns {Array<boolean>} The gently varied pattern.
	 */
	function mutateBarPattern( pattern, role, style, sectionName ) {

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
			var index = candidateIndexes[ b8.Random.int( 0, candidateIndexes.length - 1 ) ];
			result[ index ] = !result[ index ];
		}

		result[ 0 ] = pattern[ 0 ];

		return result;

	}


	/**
	 * Picks a base rhythm template, with related sections using nearby templates.
	 *
	 * @param {Array<Array<boolean>>} templates - Templates available for the role.
	 * @param {string} sectionName - Current section name.
	 * @returns {Array<boolean>} The selected bar template.
	 */
	function pickSectionTemplate( templates, sectionName ) {

		var templateIndex = b8.Random.int( 0, templates.length - 1 );

		if ( sectionName === "B" ) {
			templateIndex = ( templateIndex + 1 ) % templates.length;
		} else if ( sectionName === "A_PRIME" ) {
			templateIndex = ( templateIndex + templates.length - 1 ) % templates.length;
		}

		return templates[ templateIndex ];

	}


	/**
	 * Gets the section name for a phrase index using the song plan.
	 *
	 * @param {Object} songPlan - Seed-derived musical plan for the song.
	 * @param {number} phraseIndex - Phrase index in the song.
	 * @returns {string} The section name.
	 */
	function getSectionName( songPlan, phraseIndex ) {

		return songPlan.sectionForm[ phraseIndex % songPlan.sectionForm.length ];

	}


	/**
	 * Returns the progression to use for the current section.
	 *
	 * Each named section has one understandable harmonic variation.
	 *
	 * @param {Array<string>} progression - Base progression.
	 * @param {string} sectionName - Current section name.
	 * @returns {Array<string>} Progression for the current section.
	 */
	function getSectionProgression( progression, sectionName ) {

		if ( sectionName === "B" ) {
			// Section B keeps the same harmonic family but starts from a different
			// point, which usually feels like motion without sounding unrelated.
			return rotateArray( progression, 1 );
		}

		if ( sectionName === "C" ) {
			// Section C is the most contrasting section: we rotate further and push
			// the start and end toward tension so it feels like a new chapter.
			var contrasted = rotateArray( progression, 2 );
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
 * Collects tonal-palette notes for a key across a MIDI range.
 *
 * @param {string} key - Musical key.
 * @param {Array<number>} scaleIntervals - Semitone offsets that define the palette.
 * @param {number} minMidi - Minimum MIDI value.
 * @param {number} maxMidi - Maximum MIDI value.
 * @returns {Array<number>} MIDI notes that belong to the tonal palette.
 */
	function buildScaleMidi( key, scaleIntervals, minMidi, maxMidi ) {

		var tonic = keyShift[ key ] || 0;
		var pitchClasses = scaleIntervals.map(
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
	 * Returns the preferred melodic target for a phrase step.
	 *
	 * Each contour type maps the phrase onto a different high-level shape so
	 * seeds differ more strongly in their melodic identity.
	 *
	 * @param {Object} step - Current progression step.
	 * @param {Array<number>} scale - MIDI notes in the key.
	 * @param {number} targetOctave - Preferred melodic octave.
	 * @param {Object} songPlan - Seed-derived musical plan for the song.
	 * @param {number} phraseStep - Step index within the phrase.
	 * @param {number} phraseLength - Total steps in the phrase.
	 * @returns {number} Preferred MIDI note.
	 */
	function getContourTargetMidi( step, scale, targetOctave, songPlan, phraseStep, phraseLength ) {

		var anchorMidi = normalizeMidiToOctave( step.chordMidi[ 0 ], targetOctave );
		var ratio = phraseLength <= 1 ? 0 : phraseStep / ( phraseLength - 1 );
		var degreeOffset = 0;

		switch ( songPlan.contour ) {
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
	 * Returns the next melody note from a short, predictable set of rules.
	 *
	 * Phrase endings settle on a chord tone. A new bar starts near the harmony.
	 * Other notes take one scale step toward the phrase contour.
	 *
	 * @param {Object} step - Current progression step.
	 * @param {number|null} previousMidi - Previously played melodic note.
	 * @param {number} contourTarget - Pitch the contour is heading toward.
	 * @param {Array<number>} scale - MIDI notes in the key.
	 * @param {number} targetOctave - Preferred melodic octave.
	 * @param {Object} songPlan - Seed-derived musical plan.
	 * @returns {number} The selected MIDI note.
	 */
	function getMelodyStepMidi( step, previousMidi, contourTarget, scale, targetOctave, songPlan ) {

		if ( step.phraseEnd ) {
			return getCadenceMidi( step, targetOctave, songPlan );
		}

		if ( previousMidi === null || step.barStart ) {
			return getNearestChordMidi( step, contourTarget, targetOctave );
		}

		return moveOneStepToward( previousMidi, contourTarget, scale );

	}


	/**
	 * Finds the current chord tone nearest to a target pitch.
	 *
	 * @param {Object} step - Current progression step.
	 * @param {number} targetMidi - Pitch to compare chord tones against.
	 * @param {number} targetOctave - Preferred melodic octave.
	 * @returns {number} Nearest chord-tone MIDI note.
	 */
	function getNearestChordMidi( step, targetMidi, targetOctave ) {

		var nearestMidi = normalizeMidiToOctave( step.chordMidi[ 0 ], targetOctave );

		for ( var i = 1; i < step.chordMidi.length; i++ ) {
			var candidate = normalizeMidiToOctave( step.chordMidi[ i ], targetOctave );

			if ( Math.abs( candidate - targetMidi ) < Math.abs( nearestMidi - targetMidi ) ) {
				nearestMidi = candidate;
			}
		}

		return nearestMidi;

	}


	/**
	 * Returns the cadence tone preferred for the end of a phrase.
	 *
	 * @param {Object} step - Current progression step.
	 * @param {number} targetOctave - Preferred melodic octave.
	 * @param {Object} songPlan - Seed-derived musical plan for the song.
	 * @returns {number} Cadential MIDI note.
	 */
	function getCadenceMidi( step, targetOctave, songPlan ) {

		var chordIndex = 0;

		if ( songPlan.cadenceTarget === "third" ) {
			chordIndex = 1;
		} else if ( songPlan.cadenceTarget === "fifth" ) {
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
