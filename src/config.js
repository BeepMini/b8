( function( beep8 ) {

	beep8.CONFIG = {
		// Enable debug?
		DEBUG: true,
		// The name of the project.
		NAME: "beep8 Project",
		// The version of the project.
		VERSION: "1.0.0-dev",
		// Canvas settings
		CANVAS_SETTINGS: {
			// The ID to assign to the beep8 canvas.
			CANVAS_ID: "beep8-canvas",
			// If set, these CSS classes will be added to the beep8 canvas.
			// This is an array of strings, each of which is a class name (without the "."),
			// for example: [ "foo", "bar", "qux" ]
			CANVAS_CLASSES: [],
			// If null then the canvas will be appended to the body.
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
		// The font files.
		// The font files must be PNG files, with the characters in a grid.
		FONT_DEFAULT: "../assets/font-default.png",
		FONT_TILES: "../assets/font-tiles.png",
		FONT_ACTORS: "../assets/font-actors.png",
		// The characters in the font file.
		// These are for the default font(s). If you use a different list you
		// will need to upate the font file to match.
		CHRS: `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*+=-<>_#&@%^~$£€¥¢!?:;'"/\\()[]{}.,©®™•…| `,
		// Character size. The characters file's width must be
		// 12 * CHR_WIDTH and the height must be 12 * CHR_HEIGHT.
		CHR_WIDTH: 12,
		CHR_HEIGHT: 12,
		// Screen width and height in characters.
		SCREEN_ROWS: 30,
		SCREEN_COLS: 24,
		// Disable to turn off CRT effect.
		// This is a number between 0 and 1, where 0 is no CRT effect and 1 is full CRT effect.
		// Anything over 0.4 is probably too much.
		CRT_ENABLE: 0.3,
		// Color palette.
		// Colors count from 0.
		// The first color is the background color.
		// This can be as many colors as you want, but each color requires us to
		// store a scaled copy of the characters image in memory, so more colors
		// = more memory.
		// You can redefine the colors at runtime with beep8.redefineColors([]).
		COLORS: [
			"#0E0F17",
			"#2A3752",
			"#9DB1BF",
			"#8DF0F7",
			"#44BDF9",
			"#3C55B0",
			"#54002A",
			"#754B3B",
			"#B51212",
			"#F7883D",
			"#FFCF66",
			"#9AE065",
			"#42C26B",
			"#12897C",
			"#F078DC",
			"#F4F4F4",
		],
		// The passkey for the game.
		// This is used when generating passcodes for levels.
		// It should be unique for each game so that passcodes are different for each game.
		// You can generate a passcode for a level with beep8.Passcode.getCode( levelId ).
		// The passcode will be a 4-character code.
		PASSKEY: "beep8IsAwesome",
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
		// The first character to use for the border in printBox & menus.
		// The number is the index of the top left corner of a border pattern in the font file.
		// The method will use the 4 corners, and the top horizontal and left vertical sides.
		BORDER_CHAR: 54,
	};

} )( beep8 || ( beep8 = {} ) );
