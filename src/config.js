( function( beep8 ) {

	beep8.CONFIG = {
		// Enable debug?
		DEBUG: true,
		// The name of the project.
		NAME: "beep8 Project",
		// The version of the project.
		VERSION: "1.0.0",
		// Canvas settings
		CANVAS_SETTINGS: {
			// The ID to assign to the beep8 canvas.
			CANVAS_ID: "beep8-canvas",
			// If set, these CSS classes will be added to the beep8 canvas.
			// This is an array of strings, each of which is a class name (without the "."),
			// for example: [ "foo", "bar", "qux" ]
			CANVAS_CLASSES: [],
			// If this is true, then we will automatically position the canvas using absolute positioning
			// to ensure it's centered on the viewport and it's the right size.
			// If this is false, then you are responsible for positioning the canvas to your liking.
			AUTO_POSITION: true,
			// If this is true, we will resize the canvas automatically to match the screen. If false,
			// you're responsible for sizing the canvas to your liking.
			// You probably want to specify a fixed scale in SCREEN_SCALE rather than "auto", so you
			// have control over how large the canvas will be.
			AUTO_SIZE: true,
			// If this is not null, then this is the element under which to create the rendering canvas.
			// This can be the ID of an HTML element, or an HTMLElement reference.
			CONTAINER: null,
		},
		// Sound effects settings
		SFX: {
			// Key presses whilst using an input dialog.
			TYPING: 'click',
			MENU_UP: 'blip',
			MENU_DOWN: 'blip2',
			MENU_SELECT: 'blip3',
		},
		// Background color to fill the space not used by the screen.
		// For best results this should be the same as the page's background.
		BG_COLOR: "#000",
		// Characters file
		CHR_FILE: "../assets/chr.png",
		// Character size. The characters file's width must be
		// 16 * CHR_WIDTH and the height must be 16 * CHR_HEIGHT.
		CHR_WIDTH: 12,
		CHR_HEIGHT: 12,
		// Screen width and height in characters.
		SCREEN_ROWS: 28,
		SCREEN_COLS: 28,
		// Pixel scale (magnification). Can be "auto" or an int >= 1.
		// If this is "auto", we'll automatically compute this to be the maximum possible size
		// for the current screen size.
		SCREEN_SCALE: "auto",
		// Maximum fraction of the screen to occupy with the canvas.
		MAX_SCREEN_FRACTION: 0.95,
		// If set, this is the opacity of the "scan lines" effect.
		// If 0 or not set, don't show scan lines.
		SCAN_LINES_OPACITY: 0.1,
		// Color palette.
		// Colors count from 0.
		// The first color is the background color.
		// This can be as many colors as you want, but each color requires us to
		// store a scaled copy of the characters image in memory, so more colors
		// = more memory.
		// You can redefine the colors at runtime with beep8.redefineColors([]).
		COLORS: [
			"#000", "#00A", "#A00", "#A0A", "#0A0", "#0AA", "#AA0", "#DDD",
			"#666", "#00F", "#F00", "#F0F", "#0F0", "#0FF", "#FF0", "#FFF"
		],
		// If this is not null, then we will display a virtual joystick if the user
		// is on a mobile device.
		TOUCH_VJOY: true,
		// Cursor config:
		CURSOR: {
			// Cursor width, as a fraction of the character width (0 to 1)
			WIDTH_F: 0.8,
			// Cursor height, as a fraction of the character height (0 to 1)
			HEIGHT_F: 0.8,
			// Blink interval in millis.
			BLINK_INTERVAL: 400,
			// Cursor offset (as fraction of, respectively, char width and height). Tweak these if
			// you want to adjust the positioning of the cursor.
			OFFSET_V: 0.1,
			OFFSET_H: 0,
		},
		// If set, then special escape sequences can be used when printing (to set colors, etc).
		// These are the sequences that starts and end an escape sequence. See the documentation for
		// beep8.print() for more info on escape sequences.
		// If you don't want this, comment out these line, or set them to null.
		PRINT_ESCAPE_START: "{{",
		PRINT_ESCAPE_END: "}}",
	};

} )( beep8 || ( beep8 = {} ) );
