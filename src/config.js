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
			TYPING: 'ui/click/003',
			MENU_UP: 'tone/beep/002',
			MENU_DOWN: 'tone/beep/001',
			MENU_SELECT: 'tone/beep/003',
		},
		// The font files.
		// The font files must be PNG files, with the characters in a grid.
		FONT_DEFAULT: "../assets/font-default-thin.png",
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
		SCREEN_ROWS: 25,
		SCREEN_COLS: 20,
		// EXPERIMENTAL
		// This is an experimental feature and is subject to change at any time.
		// The number of colors to use.
		// 1 = each tile is 2 colors (foreground and background).
		// 2 = each tile could be multiple colours. A background colour, and
		// shades of a foreground colour based upon the greyscale colours used
		// in the tiles.
		// Make sure to change the tiles image as well if you change this.
		SCREEN_COLORS: 1,
		// Disable to turn off CRT effect.
		// This is a number between 0 and 1, where 0 is no CRT effect and 1 is full CRT effect.
		// Anything over 0.4 is probably too much.
		CRT_ENABLE: 0.3,
		// Enable/ Disable vignette effect.
		// This is a boolean value.
		CRT_VIGNETTE: true,
		// Color palette.
		// Colors count from 0.
		// The first color is the background color.
		// This can be as many colors as you want, but each color requires us to
		// store a scaled copy of the characters image in memory, so more colors
		// = more memory.
		// You can redefine the colors at runtime with beep8.redefineColors([]).
		COLORS: [
			"#0A0C1F", // 0. Very dark blue - almost black. The darkest colour.
			"#263264", // 1. Dark blue
			"#A0ABB6", // 2. Mid grey
			"#B2EFEB", // 3. Light blue
			"#3FB0F1", // 4. Mid blue
			"#3548A3", // 5. Blue
			"#420241", // 6. Dark red/ purple
			"#6A3E49", // 7. Brown
			"#C22D44", // 8. Red
			"#E08355", // 9. Orange
			"#FFC763", // 10. Yellow
			"#A7D171", // 11. Light green
			"#30AB62", // 12. Green
			"#1E7F82", // 13. Dark Green
			"#FF76D7", // 14. Pink
			"#F4F4F4", // 15. White
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
			// Blink interval in milliseconds.
			BLINK_INTERVAL: 400,
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

} )( beep8 );
