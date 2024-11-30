( function( beep8 ) {

	beep8.Core = {};

	beep8.Core.realCanvas = null;
	beep8.Core.realCtx = null;
	beep8.Core.canvas = null;
	beep8.Core.ctx = null;
	beep8.Core.container = null;
	beep8.Core.startTime = 0;
	beep8.Core.deltaTime = 0;
	beep8.Core.crashed = false;
	beep8.Core.crashing = false;
	beep8.Core.state = null;

	beep8.Core.drawState = {
		fgColor: 7,
		bgColor: 0,  // -1 means transparent

		cursorCol: 0,
		cursorRow: 0,

		cursorVisible: false, // Don't change this directly, use cursorRenderer.setCursorVisible()
	};

	let lastFrameTime = null;
	let initDone = false;
	let frameHandler = null;
	let frameHandlerTargetInterval = null;
	let animFrameRequested = false;
	let timeToNextFrame = 0;
	let pendingAsync = null;


	/**
	 * Initializes the engine.
	 *
	 * This merges config properties and then calls beep8.Core.asyncInit() to
	 * prepare assets.
	 *
	 * @param {Function} callback - The function to call when the engine is initialized.
	 * @return {void}
	 */
	beep8.Core.init = function( callback, options = {} ) {

		beep8.Utilities.checkFunction( "callback", callback );
		if ( options ) {
			beep8.Utilities.checkObject( "options", options );
		}

		// Merge the options with the default configuration.
		beep8.CONFIG = {
			...beep8.CONFIG,
			...options,
		};

		// Initialize the engine asynchronously.
		beep8.Core.asyncInit( callback );

		// Initialize the game clock.
		beep8.Core.startTime = beep8.Core.getNow();

	}


	/**
	 * Checks if the engine has been initialized.
	 *
	 * @returns {boolean} True if the engine has been initialized.
	 */
	beep8.Core.initialized = function() {

		return initDone;

	}



	/**
	 * Asynchronously initializes the engine.
	 *
	 * This function sets up the canvas, initializes subsystems, and then calls
	 * the callback function if it's set.
	 *
	 * @param {Function} callback - The function to call when the engine is initialized.
	 * @returns {void}
	 */
	beep8.Core.asyncInit = async function( callback = null ) {

		beep8.Utilities.log( "beep8 System initializing" );

		// Computed values: width and height of screen in virtual pixels.
		beep8.CONFIG.SCREEN_WIDTH = beep8.CONFIG.SCREEN_COLS * beep8.CONFIG.CHR_WIDTH;
		beep8.CONFIG.SCREEN_HEIGHT = beep8.CONFIG.SCREEN_ROWS * beep8.CONFIG.CHR_HEIGHT;

		// Set up the real canvas (the one that really exists onscreen).
		beep8.Core.realCanvas = document.createElement( "canvas" );

		if ( beep8.CONFIG.CANVAS_SETTINGS && beep8.CONFIG.CANVAS_SETTINGS.CANVAS_ID ) {
			beep8.Core.realCanvas.setAttribute( "id", beep8.CONFIG.CANVAS_SETTINGS.CANVAS_ID );
		}

		if ( beep8.CONFIG.CANVAS_SETTINGS && beep8.CONFIG.CANVAS_SETTINGS.CANVAS_CLASSES ) {
			for ( const className of beep8.CONFIG.CANVAS_SETTINGS.CANVAS_CLASSES ) {
				beep8.Core.realCanvas.classList.add( className );
			}
		}

		beep8.Core.realCanvas.style.touchAction = "none";
		beep8.Core.realCanvas.style.userSelect = "none";
		beep8.Core.realCanvas.style.imageRendering = "pixelated";

		// Prevent default touch events on touch devices.
		beep8.Core.realCanvas.addEventListener( "touchstart", e => e.preventDefault() );

		// Work out where to put the canvas.
		beep8.Core.container = document.createElement( 'div' );
		beep8.Core.container.setAttribute( "style", "" );
		beep8.Core.container.id = "beep8";
		beep8.Core.container.style.display = "block";
		beep8.Core.container.style.lineHeight = "0";
		beep8.Core.container.style.position = "relative";

		// Add the canvas to the container.
		beep8.Core.container.appendChild( beep8.Core.realCanvas );

		// Put the canvas in the container.
		beep8.Core.getBeepContainerEl().appendChild( beep8.Core.container );

		// Set up the virtual canvas (the one we render to). This canvas isn't
		// part of the document( it's not added to document.body), it only
		// exists off-screen.
		beep8.Core.canvas = document.createElement( "canvas" );
		beep8.Core.canvas.width = beep8.CONFIG.SCREEN_WIDTH;
		beep8.Core.canvas.height = beep8.CONFIG.SCREEN_HEIGHT;
		beep8.Core.canvas.style.width = beep8.CONFIG.SCREEN_WIDTH + "px";
		beep8.Core.canvas.style.height = beep8.CONFIG.SCREEN_HEIGHT + "px";
		beep8.Core.ctx = beep8.Core.canvas.getContext( "2d" );
		beep8.Core.ctx.imageSmoothingEnabled = false;

		// Initialize subsystems
		beep8.Core.state = new beep8.State();

		// Load and initialize default fonts.
		await beep8.TextRenderer.initAsync();
		beep8.Input.init();

		// Update the positioning and size of the canvas.
		beep8.Core.updateLayout( false );
		window.addEventListener(
			"resize",
			() => beep8.Core.updateLayout( true )
		);

		if ( beep8.Core.isMobile() ) {
			beep8.Joystick.setup();
		}

		initDone = true;

		beep8.Utilities.log( "beep8 System initialized" );

		await beep8.Intro.loading();
		await beep8.Intro.splash();

		// Call the callback function if it's set.
		if ( callback ) {
			await callback();
		}

	}


	/**
	 * Gets the container element for the engine.
	 *
	 * This is the element under which the rendering canvas is created. If the
	 * container is not specified in the configuration, this will be the body element.
	 *
	 * @returns {HTMLElement} The container element.
	 */
	beep8.Core.getBeepContainerEl = function() {

		let container = document.body;

		if ( beep8.CONFIG.CANVAS_SETTINGS && beep8.CONFIG.CANVAS_SETTINGS.CONTAINER ) {

			const containerSpec = beep8.CONFIG.CANVAS_SETTINGS.CONTAINER;

			if ( typeof ( containerSpec ) === "string" ) {

				container = document.getElementById( containerSpec.replace( '#', '' ) );

				if ( !container ) {
					beep8.Utilities.fatal( "beep8: Could not find container element with ID: " + containerSpec );
				}

			} else if ( containerSpec instanceof HTMLElement ) {

				container = containerSpec;

			} else {

				console.error( "beep8: beep8.CONFIG.CANVAS_SETTINGS.CONTAINER must be either an ID of an HTMLElement." );
				container = document.body;

			}

		}

		return container;

	}


	/**
	 * Checks if the engine (and specified api method) is ready to run.
	 *
	 * This function checks if the engine has crashed, if the initAsync() method
	 * has been called, and if there is a pending asynchronous operation.
	 *
	 * @param {string} apiMethod - The name of the API method being called.
	 * @returns {void}
	 */
	beep8.Core.preflight = function( apiMethod ) {

		if ( beep8.Core.crashed ) {
			throw new Error( `Can't call API method ${apiMethod}() because the engine has crashed.` );
		}

		if ( !initDone ) {

			beep8.Utilities.fatal(
				`Can't call API method ${apiMethod}(): API not initialized. ` +
				`Call initAsync() wait until it finishes before calling API methods.`
			);

		}

		if ( pendingAsync ) {

			beep8.Utilities.fatal(
				`Can't call API method ${apiMethod}() because there is a pending async ` +
				`call to ${pendingAsync.name}() that hasn't finished running yet. Are you missing ` +
				`an 'await' keyword to wait for the async method? Use 'await ${pendingAsync.name}()',` +
				`not just '${pendingAsync.name}()'`
			);

		}

	}


	/**
	 * Starts an asynchronous operation.
	 *
	 * This function should be called at the beginning of an asynchronous method.
	 * It sets up the pendingAsync object, which is used to track the state of the
	 * asynchronous operation.
	 *
	 * This function should be called at the beginning of an asynchronous method.
	 *
	 * @param {string} asyncMethodName - The name of the asynchronous method.
	 * @param {Function} resolve - The function to call when the operation is successful.
	 * @param {Function} reject - The function to call when the operation fails.
	 * @returns {void}
	 */
	beep8.Core.startAsync = function( asyncMethodName, resolve, reject ) {

		if ( pendingAsync ) {

			throw new Error(
				"Internal bug: startAsync called while pendingAsync is not null. " +
				"Missing preflight() call?"
			);

		}

		pendingAsync = {
			name: asyncMethodName,
			resolve,
			reject,
		};

		beep8.Renderer.render();

	}


	/**
	 * Checks if there is a pending asynchronous operation.
	 *
	 * @param {string} asyncMethodName - The name of the asynchronous method.
	 * @returns {boolean} True if there is a pending asynchronous operation.
	 */
	beep8.Core.hasPendingAsync = function( asyncMethodName ) {

		return pendingAsync && pendingAsync.name === asyncMethodName;

	}


	/**
	 * Ends an asynchronous operation.
	 *
	 * @param {string} asyncMethodName - The name of the asynchronous method.
	 * @param {boolean} isError - Whether the operation failed.
	 * @param {any} result - The result of the operation.
	 * @returns {void}
	 */
	beep8.Core.endAsyncImpl = function( asyncMethodName, isError, result ) {

		if ( !pendingAsync ) {
			throw new Error( `Internal bug: endAsync(${asyncMethodName}) called with no pendingAsync` );
		}

		if ( pendingAsync.name !== asyncMethodName ) {
			throw new Error(
				`Internal bug: endAsync(${asyncMethodName}) called but pendingAsync.name ` +
				`is ${pendingAsync.name}`
			);
		}

		const fun = isError ? pendingAsync.reject : pendingAsync.resolve;
		pendingAsync = null;
		fun( result );

	}


	/**
	 * Resolves an asynchronous operation.
	 *
	 * This function should be called at the end of an asynchronous method.
	 *
	 * @param {string} asyncMethodName - The name of the asynchronous method.
	 * @param {any} result - The result of the operation.
	 * @returns {void}
	 */
	beep8.Core.resolveAsync = function( asyncMethodName, result ) {

		beep8.Core.endAsyncImpl( asyncMethodName, false, result );

	}


	/**
	 * Fails an asynchronous operation.
	 *
	 * @param {string} asyncMethodName - The name of the asynchronous method.
	 * @param {any} error - The error that occurred.
	 * @returns {void}
	 */
	beep8.Core.failAsync = function( asyncMethodName, error ) {

		beep8.Core.endAsyncImpl( asyncMethodName, true, error );

	}


	/**
	 * Set the callback function for the game loop. Will be called targetFps
	 * times per second.
	 *
	 * @param {Function} callback - The function to call.
	 * @param {number} [targetFps=30] - The target frames per second.
	 * @returns {void}
	 */
	beep8.Core.setFrameHandler = function( callback, targetFps = 30 ) {

		frameHandler = callback;
		frameHandlerTargetInterval = 1.0 / ( targetFps || 30 );
		timeToNextFrame = 0;

		if ( !animFrameRequested ) {
			window.requestAnimationFrame( beep8.Core.doFrame );
		}

	}


	/**
	 * Clears the screen and resets the cursor to the top-left corner.
	 *
	 * It will optionally also set the background colour. By default it uses the
	 * specified background but you can override this yourself.
	 *
	 * @param {number} [bgColor] - Optional background color index.
	 * @returns {void}
	 */
	beep8.Core.cls = function( bgColor = undefined ) {

		bgColor = bgColor || beep8.Core.drawState.bgColor;

		beep8.Utilities.checkNumber( "bgColor", bgColor );

		beep8.Core.ctx.fillStyle = beep8.Core.getColorHex( bgColor );
		beep8.Core.ctx.fillRect( 0, 0, beep8.Core.canvas.width, beep8.Core.canvas.height );

		beep8.Core.setCursorLocation( 0, 0 );
		beep8.Renderer.markDirty();

	}


	/**
	 * Sets the colors used for text and background.
	 *
	 * @param {array} colors - A list of colours.
	 * @returns {void}
	 */
	beep8.Core.defineColors = function( colors ) {

		beep8.Utilities.checkArray( "colors", colors );

		beep8.CONFIG.COLORS = colors.slice();
		beep8.TextRenderer.regenColors();

	}


	/**
	 * Sets the colors used for text and background.
	 *
	 * @param {number} fg - The foreground color.
	 * @param {number} [bg=undefined] - The background color.
	 * @returns {void}
	 */
	beep8.Core.setColor = function( fg, bg = undefined ) {

		beep8.Utilities.checkNumber( "fg", fg );
		beep8.Core.drawState.fgColor = Math.round( fg );

		if ( bg !== undefined ) {
			beep8.Utilities.checkNumber( "bg", bg );
			beep8.Core.drawState.bgColor = Math.round( bg );
		}

	}


	/**
	 * Sets the cursor location.
	 *
	 * The cursor location is used for text rendering and is the position where
	 * the next character will be drawn.
	 *
	 * Characters can be text or images, drawn using the loaded fonts.
	 *
	 * @param {number} col - The column.
	 * @param {number} row - The row.
	 * @returns {void}
	 */
	beep8.Core.setCursorLocation = function( col, row ) {

		beep8.Utilities.checkNumber( "col", col );

		if ( row !== undefined ) {
			beep8.Utilities.checkNumber( "row", row );
		}

		beep8.Core.drawState.cursorCol = Math.round( col );

		if ( row !== undefined ) {
			beep8.Core.drawState.cursorRow = Math.round( row );
		}

	}


	/**
	 * Move the cursor to the next character.
	 *
	 * This adjusts the drawing position without actually drawing anything.
	 *
	 * @returns {void}
	 */
	beep8.Core.nextCursorLocation = function() {

		let currentCursorCol = beep8.Core.drawState.cursorCol;
		let currentCursorRow = beep8.Core.drawState.cursorRow;

		beep8.Core.setCursorLocation( currentCursorCol + 1, currentCursorRow );

	}


	/**
	 * Gets the color for the specified index.
	 *
	 * @param {number} c - The color index.
	 * @returns {string} The color.
	 */
	beep8.Core.getColorHex = function( c ) {

		if ( typeof ( c ) !== "number" ) {
			return "#f0f";
		}

		if ( c < 0 ) {
			return "#000";
		}

		c = beep8.Utilities.clamp( Math.round( c ), 0, beep8.CONFIG.COLORS.length - 1 );

		return beep8.CONFIG.COLORS[ c ];

	}


	/**
	 * Gets the current time in milliseconds.
	 *
	 * This is used for rendering and animation, and can also be used in the game
	 * to get the current time for things like timers.
	 *
	 * You can get the game start time by calling beep8.Core.startTime.
	 *
	 * @returns {number} The current time in milliseconds.
	 */
	beep8.Core.getNow = function() {

		if ( window.performance && window.performance.now ) {
			return window.performance.now();
		}

		return new Date().getTime();

	}


	/**
	 * Draws an image.
	 *
	 * This function is a wrapper around the canvas drawImage() function and will
	 * draw the image at any x,y position. It does not use the cursor position.
	 *
	 * @param {HTMLImageElement} img - The image to draw.
	 * @param {number} x - The x-coordinate of the upper-left corner of the image.
	 * @param {number} y - The y-coordinate of the upper-left corner of the image.
	 * @param {number} [srcX] - The x-coordinate of the upper-left corner of the source image.
	 * @param {number} [srcY] - The y-coordinate of the upper-left corner of the source image.
	 * @param {number} [width] - The width of the image.
	 * @param {number} [height] - The height of the image.
	 * @returns {void}
	 */
	beep8.Core.drawImage = function( img, x, y, srcX, srcY, width, height ) {

		beep8.Utilities.checkInstanceOf( "img", img, HTMLImageElement );
		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );

		if ( srcX !== undefined ) beep8.Utilities.checkNumber( "srcX", srcX );
		if ( srcY !== undefined ) beep8.Utilities.checkNumber( "srcY", srcY );
		if ( width !== undefined ) beep8.Utilities.checkNumber( "width", width );
		if ( height !== undefined ) beep8.Utilities.checkNumber( "height", height );

		if (
			srcX !== undefined && srcY !== undefined &&
			width !== undefined && height !== undefined
		) {
			beep8.Core.ctx.drawImage( img, srcX, srcY, width, height, x, y, width, height );
		} else {
			beep8.Core.ctx.drawImage( img, x, y );
		}

	}


	/**
	 * Draws a rectangle of the specified width and height.
	 *
	 * This ignores the cursor position.
	 *
	 * @param {number} x - The x-coordinate of the upper-left corner of the rectangle.
	 * @param {number} y - The y-coordinate of the upper-left corner of the rectangle.
	 * @param {number} width - The width of the rectangle.
	 * @param {number} height - The height of the rectangle.
	 * @returns {void}
	 */
	beep8.Core.drawRect = function( x, y, width, height, lineWidth = 1 ) {

		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		beep8.Utilities.checkNumber( "width", width );
		beep8.Utilities.checkNumber( "height", height );
		beep8.Utilities.checkNumber( "lineWidth", lineWidth );

		const oldStrokeStyle = beep8.Core.ctx.strokeStyle;
		const oldLineWidth = beep8.Core.ctx.lineWidth;

		const halfLineWidth = lineWidth / 2;

		beep8.Core.ctx.strokeStyle = beep8.Core.getColorHex( beep8.Core.drawState.fgColor );
		beep8.Core.ctx.lineWidth = lineWidth;

		// Drawn inside the shape.
		beep8.Core.ctx.strokeRect(
			Math.round( x ), Math.round( y ),
			Math.round( width ), Math.round( height )
		);

		console.log(
			lineWidth,
			Math.round( x ) + halfLineWidth, Math.round( y ) + halfLineWidth,
			Math.round( width ) - lineWidth, Math.round( height ) - lineWidth
		);


		// Restore properties.
		beep8.Core.ctx.strokeStyle = oldStrokeStyle;
		beep8.Core.ctx.lineWidth = oldLineWidth;

	}


	/**
	 * Draws a filled rectangle using the current colours.
	 *
	 * Ignores the cursor position.
	 *
	 * @param {number} x - The x-coordinate of the upper-left corner of the rectangle.
	 * @param {number} y - The y-coordinate of the upper-left corner of the rectangle.
	 * @param {number} width - The width of the rectangle.
	 * @param {number} height - The height of the rectangle.
	 * @returns {void}
	 */
	beep8.Core.fillRect = function( x, y, width, height ) {

		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		beep8.Utilities.checkNumber( "width", width );
		beep8.Utilities.checkNumber( "height", height );

		beep8.Core.ctx.fillStyle = beep8.Core.getColorHex( beep8.Core.drawState.fgColor );
		beep8.Core.ctx.fillRect(
			Math.round( x ) + 0.5, Math.round( y ) + 0.5,
			Math.round( width ) - 1, Math.round( height ) - 1
		);
	}


	/**
	 * Generates the bitmap data for the current screen and returns it to you.
	 *
	 * @returns {ImageData} The saved screen.
	 */
	beep8.Core.saveScreen = function() {

		return beep8.Core.ctx.getImageData(
			0, 0,
			beep8.Core.canvas.width, beep8.Core.canvas.height
		);

	}


	/**
	 * Download the current screen as a PNG image.
	 *
	 * @returns {void}
	 */
	beep8.Core.downloadScreenshot = function() {

		// Grab the image data from the drawn canvas (to include screen effects).
		const dataUrl = beep8.Core.realCanvas.toDataURL( "image/png" );

		// Save as a file.
		beep8.Utilities.downloadFile( "beep8-screenshot.png", dataUrl );

	}


	/**
	 * Restores the screen.
	 *
	 * @param {ImageData} screenData - The screen to restore.
	 * @returns {void}
	 */
	beep8.Core.restoreScreen = function( screenData ) {

		beep8.Utilities.checkInstanceOf( "screenData", screenData, ImageData );
		beep8.Core.ctx.putImageData( screenData, 0, 0 );

	}


	/**
	 * Run the game loop.
	 *
	 * This function ensures we stay as close to the target frame rate as
	 * possible.
	 *
	 * @returns {void}
	 */
	beep8.Core.doFrame = async function() {

		// Flag to track if an animation frame has been requested is reset
		animFrameRequested = false;

		// Get the current time
		const now = beep8.Core.getNow();

		// Calculate the time difference between the current and last frame, or use a default value if this is the first frame
		beep8.Core.deltaTime = lastFrameTime !== null ? 0.001 * ( now - lastFrameTime ) : ( 1 / 60.0 );

		// Cap the delta time to prevent large time steps (e.g., if the browser tab was inactive)
		beep8.Core.deltaTime = Math.min( beep8.Core.deltaTime, 0.05 );

		// Update the last frame time to the current time
		lastFrameTime = now;

		// Accumulate the time to the next frame
		timeToNextFrame += beep8.Core.deltaTime;

		// Initialize the counter for the number of frames processed in this loop
		let numFramesDone = 0;

		// Process frames while there is a frame handler, the number of processed frames is less than 4, and the accumulated time exceeds the target interval
		// This helps to catch up with missed frames.
		while ( frameHandler && numFramesDone < 4 && timeToNextFrame > frameHandlerTargetInterval ) {
			// Await the frame handler's completion
			await frameHandler();

			// Call the input system's end frame handler
			beep8.Input.onEndFrame();

			// Decrease the accumulated time by the target interval
			timeToNextFrame -= frameHandlerTargetInterval;

			// Increment the count of processed frames
			++numFramesDone;
		}

		// Call the render function to update the visuals
		beep8.Renderer.render();

		// If there is a frame handler, request the next animation frame
		if ( frameHandler ) {
			animFrameRequested = true;
			window.requestAnimationFrame( beep8.Core.doFrame );
		}

	}


	/**
	 * Updates the layout.
	 *
	 * @param {boolean} renderNow - Whether to render immediately.
	 * @returns {void}
	 */
	beep8.Core.updateLayout = function( renderNow ) {

		beep8.Core.updateLayout2d();

		if ( renderNow ) {
			beep8.Renderer.render();
		}

	}


	/**
	 * Updates the layout of the 2D canvas.
	 *
	 * @returns {void}
	 */
	beep8.Core.updateLayout2d = function() {

		beep8.Core.realCtx = beep8.Core.realCanvas.getContext( "2d" );
		beep8.Core.realCtx.imageSmoothingEnabled = false;

		beep8.CONFIG.SCREEN_EL_WIDTH = beep8.CONFIG.SCREEN_WIDTH;
		beep8.CONFIG.SCREEN_EL_HEIGHT = beep8.CONFIG.SCREEN_HEIGHT;
		beep8.CONFIG.SCREEN_REAL_WIDTH = beep8.CONFIG.SCREEN_WIDTH;
		beep8.CONFIG.SCREEN_REAL_HEIGHT = beep8.CONFIG.SCREEN_HEIGHT;

		beep8.Core.realCanvas.style.width = '100%';
		beep8.Core.realCanvas.style.height = '100%';
		beep8.Core.realCanvas.width = beep8.CONFIG.SCREEN_REAL_WIDTH;
		beep8.Core.realCanvas.height = beep8.CONFIG.SCREEN_REAL_HEIGHT;

		beep8.Core.container.style.aspectRatio = `${beep8.CONFIG.SCREEN_COLS} / ${beep8.CONFIG.SCREEN_ROWS}`;

	}


	/**
	 * Handles a crash.
	 *
	 * @param {string} [errorMessage="Fatal error"] - The error message to display.
	 * @returns {void}
	 */
	beep8.Core.handleCrash = function( errorMessage = "Fatal error" ) {

		if ( beep8.Core.crashed || beep8.Core.crashing ) return;

		beep8.Core.crashing = true;

		beep8.Core.setColor( beep8.CONFIG.COLORS.length - 1, 0 );
		beep8.Core.cls();

		beep8.Core.setCursorLocation( 1, 1 );
		beep8.TextRenderer.print( "*** CRASH ***:\n" + errorMessage, null, beep8.CONFIG.SCREEN_COLS - 2 );
		beep8.Renderer.render();

		beep8.Core.crashing = false;
		beep8.Core.crashed = true;

	}


	/**
	 * Is this a touch device?
	 *
	 * @returns {boolean} True if this is a touch device.
	 */
	beep8.Core.isTouchDevice = function() {

		return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

	}


	/**
	 * Is this a mobile device?
	 *
	 * @returns {boolean} True if this is a mobile device.
	 */
	beep8.Core.isMobile = function() {

		return beep8.Core.isIOS() || beep8.Core.isAndroid();

	}


	/**
	 * Is this an iOS device?
	 *
	 * @returns {boolean} True if this is an iOS device.
	 */
	beep8.Core.isIOS = function() {

		return /(ipad|ipod|iphone)/i.test( navigator.userAgent );

	}


	/**
	 * Is this an Android device?
	 *
	 * @returns {boolean} True if this is an Android device.
	 */
	beep8.Core.isAndroid = function() {

		return /android/i.test( navigator.userAgent );

	}


} )( beep8 || ( beep8 = {} ) );
