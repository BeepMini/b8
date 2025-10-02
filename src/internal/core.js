( function( b8 ) {

	b8.Core = {};

	b8.Core.realCanvas = null;
	b8.Core.realCtx = null;
	b8.Core.offCanvas = null;
	b8.Core.offCtx = null;
	b8.Core.container = null;
	b8.Core.startTime = 0;
	b8.Core.deltaTime = 0;
	b8.Core.crashed = false;
	b8.Core.crashing = false;

	b8.Core.drawState = {
		fgColor: 7,
		bgColor: 0,  // -1 means transparent

		cursorCol: 0,
		cursorRow: 0,

		cursorVisible: false, // Don't change this directly, use cursorRenderer.setCursorVisible()
	};

	let lastFrameTime = null;
	let initDone = false;
	let updateHandler = null;
	let renderHandler = null;
	let targetDt = 0;
	let timeToNextFrame = 0;
	let pendingAsync = null;


	/**
	 * Initializes the engine.
	 *
	 * This merges config properties and then calls b8.Core.asyncInit() to
	 * prepare assets.
	 *
	 * @param {Function} callback - The function to call when the engine is initialized.
	 * @return {void}
	 */
	b8.Core.init = function( callback, options = {} ) {

		b8.Utilities.checkFunction( "callback", callback );
		if ( options ) {
			b8.Utilities.checkObject( "options", options );
		}

		// Merge the options with the default configuration.
		b8.CONFIG = {
			...b8.CONFIG,
			...options,
		};

		b8.Hooks.doAction( 'beforeInit' );

		// Setup screenshot taking.
		b8.Core.initScreenshot();

		// Initialize the engine asynchronously.
		b8.Core.asyncInit( callback );

		// Initialize the game clock.
		b8.Core.startTime = b8.Core.getNow();

		b8.Hooks.doAction( 'afterInit' );

		b8.Utilities.event( 'initComplete' );

	}


	/**
	 * Checks if the engine has been initialized.
	 *
	 * @returns {boolean} True if the engine has been initialized.
	 */
	b8.Core.initialized = function() {

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
	b8.Core.asyncInit = async function( callback = null ) {

		b8.Utilities.log( "b8 System initializing" );

		// Computed values: width and height of screen in virtual pixels.
		b8.CONFIG.SCREEN_WIDTH = b8.CONFIG.SCREEN_COLS * b8.CONFIG.CHR_WIDTH;
		b8.CONFIG.SCREEN_HEIGHT = b8.CONFIG.SCREEN_ROWS * b8.CONFIG.CHR_HEIGHT;

		// Set up the real canvas (the one that really exists onscreen).
		b8.Core.realCanvas = document.createElement( "canvas" );

		if ( b8.CONFIG.CANVAS_SETTINGS && b8.CONFIG.CANVAS_SETTINGS.CANVAS_ID ) {
			b8.Core.realCanvas.setAttribute( "id", b8.CONFIG.CANVAS_SETTINGS.CANVAS_ID );
		}

		if ( b8.CONFIG.CANVAS_SETTINGS && b8.CONFIG.CANVAS_SETTINGS.CANVAS_CLASSES ) {
			for ( const className of b8.CONFIG.CANVAS_SETTINGS.CANVAS_CLASSES ) {
				b8.Core.realCanvas.classList.add( className );
			}
		}

		b8.Core.realCanvas.style.touchAction = "none";
		b8.Core.realCanvas.style.userSelect = "none";
		b8.Core.realCanvas.style.imageRendering = "pixelated";

		// Prevent default touch events on touch devices.
		b8.Core.realCanvas.addEventListener( "touchstart", e => e.preventDefault() );

		// Work out where to put the canvas.
		b8.Core.container = document.createElement( 'div' );
		b8.Core.container.setAttribute( "style", "" );
		b8.Core.container.id = "b8";
		b8.Core.container.style.display = "block";
		b8.Core.container.style.lineHeight = "0";
		b8.Core.container.style.position = "relative";

		// Add the canvas to the container.
		b8.Core.container.appendChild( b8.Core.realCanvas );

		// Put the canvas in the container.
		b8.Core.getBeepContainerEl().appendChild( b8.Core.container );

		// Set up the virtual canvas (the one we render to). This canvas isn't
		// part of the document( it's not added to document.body), it only
		// exists off-screen.
		b8.Core.offCanvas = new OffscreenCanvas( b8.CONFIG.SCREEN_WIDTH, b8.CONFIG.SCREEN_HEIGHT );
		b8.Core.offCtx = b8.Core.offCanvas.getContext(
			"2d",
			{
				alpha: false,
				colorSpace: 'srgb',
				desynchronized: true
			}
		);
		b8.Core.offCtx.imageSmoothingEnabled = false;

		// Load and initialize default fonts.
		await b8.TextRenderer.initAsync();
		b8.Input.init();

		// Update the positioning and size of the canvas.
		b8.Core.updateLayout( false );
		window.addEventListener(
			"resize",
			() => b8.Core.updateLayout( true )
		);

		if ( b8.Core.isMobile() ) {
			b8.Joystick.setup();
		}

		initDone = true;

		b8.Utilities.log( "b8 System initialized" );

		await b8.Intro.loading();
		await b8.Intro.splash();

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
	b8.Core.getBeepContainerEl = function() {

		let container = document.body;

		if ( b8.CONFIG.CANVAS_SETTINGS && b8.CONFIG.CANVAS_SETTINGS.CONTAINER ) {

			const containerSpec = b8.CONFIG.CANVAS_SETTINGS.CONTAINER;

			if ( typeof ( containerSpec ) === "string" ) {

				container = document.getElementById( containerSpec.replace( '#', '' ) );

				if ( !container ) {
					b8.Utilities.fatal( "b8: Could not find container element with ID: " + containerSpec );
				}

			} else if ( containerSpec instanceof HTMLElement ) {

				container = containerSpec;

			} else {

				b8.Utilities.error( "b8: b8.CONFIG.CANVAS_SETTINGS.CONTAINER must be either an ID of an HTMLElement." );
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
	 * This should be called at the start of any async operation.
	 *
	 * @param {string} apiMethod - The name of the API method being called.
	 * @returns {void}
	 */
	b8.Core.preflight = function( apiMethod ) {

		if ( b8.Core.crashed ) {
			throw new Error( `Can't call API method ${apiMethod}() because the engine has crashed.` );
		}

		if ( !initDone ) {

			b8.Utilities.fatal(
				`Can't call API method ${apiMethod}(): API not initialized. ` +
				`Call initAsync() wait until it finishes before calling API methods.`
			);

		}

		if ( pendingAsync ) {

			b8.Utilities.fatal(
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
	 * @param {string} asyncMethodName - The name of the asynchronous method.
	 * @param {Function} resolve - The function to call when the operation is successful.
	 * @param {Function} reject - The function to call when the operation fails.
	 * @returns {void}
	 */
	b8.Core.startAsync = function( asyncMethodName, resolve, reject ) {

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

		b8.Renderer.render();

	}


	/**
	 * Checks if there is a pending asynchronous operation.
	 *
	 * @param {string} asyncMethodName - The name of the asynchronous method.
	 * @returns {boolean} True if there is a pending asynchronous operation.
	 */
	b8.Core.hasPendingAsync = function( asyncMethodName = null ) {

		if ( null === asyncMethodName ) {
			return !!pendingAsync;
		}

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
	b8.Core.endAsyncImpl = function( asyncMethodName, isError, result ) {

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
	b8.Core.resolveAsync = function( asyncMethodName, result ) {

		b8.Core.endAsyncImpl( asyncMethodName, false, result );

	}


	/**
	 * Fails an asynchronous operation.
	 *
	 * @param {string} asyncMethodName - The name of the asynchronous method.
	 * @param {any} error - The error that occurred.
	 * @returns {void}
	 */
	b8.Core.failAsync = function( asyncMethodName, error ) {

		b8.Core.endAsyncImpl( asyncMethodName, true, error );

	}


	let running = false;
	let animationFrameId = null;


	/**
	 * Set the update and render callbacks for the game loop.
	 *
	 * @param {Function|null} updateCallback - The update function. Optional.
	 * @param {Function} renderCallback - The render function.
	 * @param {number} [targetFps=30] - Target frames per second.
	 * @returns {void}
	 */
	b8.Core.setFrameHandlers = function( renderCallback = null, updateCallback = null, targetFps = 30 ) {

		updateHandler = updateCallback || ( () => { } );
		renderHandler = renderCallback || ( () => { } );
		targetDt = 1 / targetFps;
		timeToNextFrame = 0;
		lastFrameTime = b8.Core.getNow();

		// Cancel current animation frame if running.
		if ( animationFrameId ) {
			window.cancelAnimationFrame( animationFrameId );
			animationFrameId = null;
		}

		running = true;

		animationFrameId = window.requestAnimationFrame( b8.Core.doFrame );

	}


	/**
	 * Update the game loop for realtime games.
	 *
	 * This function calls the update phase as many times as needed
	 * (capped to prevent spiraling) and then calls the render phase.
	 *
	 * @returns {void}
	 */
	b8.Core.doFrame = async function() {

		// Stop if not running.
		if ( !running ) return;

		// Get current time and compute delta (in seconds).
		const now = b8.Core.getNow();
		let delta = ( now - lastFrameTime ) / 1000;
		lastFrameTime = now;

		// Save actual delta time.
		b8.Core.deltaTime = delta;

		// Cap delta to avoid large time steps.
		delta = Math.min( delta, 0.05 );

		// Accumulate time.
		timeToNextFrame += delta;

		// Determine how many update steps to run based upon target delta time
		// and actual delta time.
		// This ensures updates are run even if the frame rate is lower than
		// intended.
		let numUpdates = Math.floor( timeToNextFrame / targetDt );
		const MAX_UPDATES = 10;
		if ( numUpdates > MAX_UPDATES ) {
			numUpdates = MAX_UPDATES;
			// Reset accumulator to prevent spiral of death.
			timeToNextFrame = 0;
		}

		// Run fixed update steps.
		for ( let i = 0; i < numUpdates; i++ ) {
			if ( updateHandler ) {
				updateHandler( targetDt );
			}
			if ( b8.Input && typeof b8.Input.onEndFrame === 'function' ) {
				b8.Input.onEndFrame();
			}
			b8.Particles.update( targetDt );
		}

		// Retain the fractional remainder for accurate timing.
		timeToNextFrame %= targetDt;

		// if pending async then skip render.
		if ( renderHandler ) {
			renderHandler();
		}

		b8.Renderer.render();

		animationFrameId = window.requestAnimationFrame( b8.Core.doFrame );

	}


	/**
	 * Stop the game loop.
	 *
	 * @returns {void}
	 */
	b8.Core.stopFrame = function() {

		running = false;
		if ( animationFrameId ) {
			window.cancelAnimationFrame( animationFrameId );
			animationFrameId = null;
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
	b8.Core.cls = function( bgColor = undefined ) {

		bgColor = bgColor || b8.Core.drawState.bgColor;

		b8.Utilities.checkNumber( "bgColor", bgColor );

		b8.Core.offCtx.fillStyle = b8.Core.getColorHex( bgColor );
		b8.Core.offCtx.fillRect( 0, 0, b8.Core.offCanvas.width, b8.Core.offCanvas.height );

		b8.Core.setCursorLocation( 0, 0 );
		b8.Renderer.markDirty();

	}


	/**
	 * Sets the colors used for text and background.
	 *
	 * @param {array} colors - A list of colours.
	 * @returns {void}
	 */
	b8.Core.defineColors = function( colors ) {

		b8.Utilities.checkArray( "colors", colors );

		b8.CONFIG.COLORS = colors.slice();
		b8.TextRenderer.regenColors();

	}


	/**
	 * Sets the colors used for text and background.
	 *
	 * @param {number} fg - The foreground color.
	 * @param {number} [bg=undefined] - The background color.
	 * @returns {void}
	 */
	b8.Core.setColor = function( fg, bg = undefined ) {

		b8.Utilities.checkNumber( "fg", fg );
		b8.Core.drawState.fgColor = Math.round( fg );

		if ( bg !== undefined ) {
			b8.Utilities.checkNumber( "bg", bg );
			b8.Core.drawState.bgColor = Math.round( bg );
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
	 * Rounds the position to the nearest 0.5.
	 *
	 * @param {number} col - The column.
	 * @param {number} row - The row.
	 * @returns {void}
	 */
	b8.Core.setCursorLocation = function( col, row ) {

		// Columns.
		b8.Utilities.checkNumber( "col", col );
		b8.Core.drawState.cursorCol = Math.round( col * 2 ) / 2;

		// Rows.
		if ( row !== undefined ) {
			b8.Utilities.checkNumber( "row", row );
			b8.Core.drawState.cursorRow = Math.round( row * 2 ) / 2;
		}

	}


	/**
	 * Move the cursor to the next character.
	 *
	 * This adjusts the drawing position without actually drawing anything.
	 *
	 * @returns {void}
	 */
	b8.Core.nextCursorLocation = function() {

		let currentCursorCol = b8.Core.drawState.cursorCol;
		let currentCursorRow = b8.Core.drawState.cursorRow;

		b8.Core.setCursorLocation( currentCursorCol + 1, currentCursorRow );

	}


	/**
	 * Gets the color for the specified index.
	 *
	 * @param {number} c - The color index.
	 * @returns {string} The color.
	 */
	b8.Core.getColorHex = function( c ) {

		if ( typeof ( c ) !== "number" ) {
			return "#f0f";
		}

		if ( c < 0 ) {
			return "#000";
		}

		c = b8.Utilities.clamp( Math.round( c ), 0, b8.CONFIG.COLORS.length - 1 );

		return b8.CONFIG.COLORS[ c ];

	}


	/**
	 * Gets the current time in milliseconds.
	 *
	 * This is used for rendering and animation, and can also be used in the game
	 * to get the current time for things like timers.
	 *
	 * You can get the game start time by calling b8.Core.startTime.
	 *
	 * @returns {number} The current time in milliseconds.
	 */
	b8.Core.getNow = function() {

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
	b8.Core.drawImage = function( img, x, y, srcX, srcY, width, height ) {

		b8.Utilities.checkInstanceOf( "img", img, HTMLImageElement );
		b8.Utilities.checkNumber( "x", x );
		b8.Utilities.checkNumber( "y", y );

		if ( srcX !== undefined ) b8.Utilities.checkNumber( "srcX", srcX );
		if ( srcY !== undefined ) b8.Utilities.checkNumber( "srcY", srcY );
		if ( width !== undefined ) b8.Utilities.checkNumber( "width", width );
		if ( height !== undefined ) b8.Utilities.checkNumber( "height", height );

		if (
			srcX !== undefined && srcY !== undefined &&
			width !== undefined && height !== undefined
		) {
			b8.Core.offCtx.drawImage( img, srcX, srcY, width, height, x, y, width, height );
		} else {
			b8.Core.offCtx.drawImage( img, x, y );
		}

	}


	/**
	 * Loads an image from the given URL.
	 *
	 * This function loads an image and converts its colors to the closest
	 * colors in the b8 color palette.
	 *
	 * Remember to keep images as small as possible. The larger the image the
	 * longer it will take to process.
	 *
	 * @param {string} url - The URL of the image to load.
	 * @returns {Promise<HTMLImageElement>} The loaded image.
	 */
	b8.Core.loadImage = async function( url ) {

		b8.Utilities.log( 'load image', url );

		return new Promise(
			( resolve ) => {

				const img = new Image();
				img.crossOrigin = "Anonymous"; // Allow cross-origin images if needed

				img.onload = () => {

					// Create a canvas to manipulate the image
					const canvas = document.createElement( "canvas" );
					const ctx = canvas.getContext( "2d" );

					canvas.width = img.width;
					canvas.height = img.height;
					ctx.drawImage( img, 0, 0 );

					// Get image data
					const imageData = ctx.getImageData( 0, 0, canvas.width, canvas.height );
					const data = imageData.data;

					// Use the precomputed lookup table
					const lookupTable = generateColorLookupTable( b8.CONFIG.COLORS );

					for ( let i = 0; i < data.length; i += 4 ) {

						const r = data[ i ];
						const g = data[ i + 1 ];
						const b = data[ i + 2 ];

						// Find the closest color using the lookup table
						const closestColor = findClosestColorUsingLookup( r, g, b, lookupTable );

						// Convert the closest hex color to RGB
						const { r: pr, g: pg, b: pb } = closestColor;

						// Replace the pixel color with the closest palette color
						data[ i ] = pr;
						data[ i + 1 ] = pg;
						data[ i + 2 ] = pb;

					}

					// Put the modified image data back on the canvas
					ctx.putImageData( imageData, 0, 0 );

					// Resolve with the modified image
					const modifiedImg = new Image();
					modifiedImg.onload = () => resolve( modifiedImg );
					modifiedImg.src = canvas.toDataURL();

				};
				img.src = url;
			}
		);

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
	b8.Core.drawRect = function( x, y, width, height, lineWidth = 1 ) {

		b8.Utilities.checkNumber( "x", x );
		b8.Utilities.checkNumber( "y", y );
		b8.Utilities.checkNumber( "width", width );
		b8.Utilities.checkNumber( "height", height );
		b8.Utilities.checkNumber( "lineWidth", lineWidth );

		const oldStrokeStyle = b8.Core.offCtx.strokeStyle;
		const oldLineWidth = b8.Core.offCtx.lineWidth;

		b8.Core.offCtx.strokeStyle = b8.Core.getColorHex( b8.Core.drawState.fgColor );
		b8.Core.offCtx.lineWidth = lineWidth;

		// Drawn inside the shape.
		b8.Core.offCtx.strokeRect(
			Math.round( x ), Math.round( y ),
			Math.round( width ), Math.round( height )
		);

		// Restore properties.
		b8.Core.offCtx.strokeStyle = oldStrokeStyle;
		b8.Core.offCtx.lineWidth = oldLineWidth;

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
	b8.Core.fillRect = function( x, y, width, height ) {

		b8.Utilities.checkNumber( "x", x );
		b8.Utilities.checkNumber( "y", y );
		b8.Utilities.checkNumber( "width", width );
		b8.Utilities.checkNumber( "height", height );

		b8.Core.offCtx.fillStyle = b8.Core.getColorHex( b8.Core.drawState.fgColor );
		b8.Core.offCtx.fillRect(
			Math.round( x ) + 0.5, Math.round( y ) + 0.5,
			Math.round( width ) - 1, Math.round( height ) - 1
		);

	}


	/**
	 * Take a screenshot when the 0 key is pressed.
	 *
	 * @returns {void}
	 */
	b8.Core.initScreenshot = function() {

		if ( b8.Core.initialized() ) {
			return;
		}

		const takeScreenshot = ( e ) => {
			if ( e.key === '0' ) {
				b8.Core.downloadScreenshot();
			}
		};

		// Take a screenshot when the 0 key is pressed.
		document.addEventListener( 'pointerup', takeScreenshot );
		document.addEventListener( 'keyup', takeScreenshot );

	}


	/**
	 * Generates the bitmap data for the current screen and returns it to you.
	 *
	 * @returns {ImageData} The saved screen.
	 */
	b8.Core.saveScreen = function() {

		return b8.Core.offCtx.getImageData(
			0, 0,
			b8.Core.offCanvas.width, b8.Core.offCanvas.height
		);

	}


	/**
	 * Download the current screen as a PNG image.
	 *
	 * @returns {void}
	 */
	b8.Core.downloadScreenshot = function() {

		// Grab the image data from the drawn canvas (to include screen effects).
		// const dataUrl = b8.Core.realCanvas.toDataURL( "image/png" );
		const dataUrl = b8.Core.getHighResDataURL( b8.Core.realCanvas );

		// Save as a file.
		b8.Utilities.downloadFile( "b8-screenshot.png", dataUrl );

	}

	let offscreenCanvas = null;

	/**
	 * Get a high-resolution data URL for the specified canvas.
	 *
	 * @param {HTMLCanvasElement} canvas - The canvas to get the data URL for.
	 * @param {number} [scale=4] - The scale factor.
	 * @param {string} [mimeType="image/png"] - The MIME type.
	 * @param {number} [quality=1] - The quality.
	 * @returns {string} The data URL.
	 */
	b8.Core.getHighResDataURL = function( canvas, scale = 4, mimeType = "image/png", quality = 1 ) {

		// Create an offscreen canvas (if needed) to draw the scaled image.
		// We keep this around to avoid creating a new canvas each time.
		if ( !offscreenCanvas ) {
			offscreenCanvas = document.createElement( "canvas" );
		}
		offscreenCanvas.width = canvas.width * scale;
		offscreenCanvas.height = canvas.height * scale;

		// Copy and scale the content
		const offscreenCtx = offscreenCanvas.getContext( "2d" );
		offscreenCtx.imageSmoothingEnabled = false; // Disable filtering
		offscreenCtx.scale( scale, scale ); // Use nearest-neighbor scaling
		offscreenCtx.drawImage( canvas, 0, 0 );

		// Get the data URL
		return offscreenCanvas.toDataURL( mimeType, quality );

	}


	/**
	 * Restores the screen.
	 *
	 * @param {ImageData} screenData - The screen to restore.
	 * @returns {void}
	 */
	b8.Core.restoreScreen = function( screenData ) {

		b8.Utilities.checkInstanceOf( "screenData", screenData, ImageData );
		b8.Core.offCtx.putImageData( screenData, 0, 0 );

	}


	/**
	 * Updates the layout.
	 *
	 * @param {boolean} renderNow - Whether to render immediately.
	 * @returns {void}
	 */
	b8.Core.updateLayout = function( renderNow ) {

		b8.Core.updateLayout2d();

		if ( renderNow ) {
			b8.Renderer.render();
		}

	}


	/**
	 * Updates the layout of the 2D canvas.
	 *
	 * @returns {void}
	 */
	b8.Core.updateLayout2d = function() {

		b8.Core.realCtx = b8.Core.realCanvas.getContext(
			"2d",
			{
				alpha: false,
				desynchronized: true
			}
		);
		b8.Core.realCtx.imageSmoothingEnabled = false;
		b8.Core.realCtx.imageSmoothingQuality = 'pixelated';

		b8.CONFIG.SCREEN_EL_WIDTH = b8.CONFIG.SCREEN_WIDTH;
		b8.CONFIG.SCREEN_EL_HEIGHT = b8.CONFIG.SCREEN_HEIGHT;
		b8.CONFIG.SCREEN_REAL_WIDTH = b8.CONFIG.SCREEN_WIDTH;
		b8.CONFIG.SCREEN_REAL_HEIGHT = b8.CONFIG.SCREEN_HEIGHT;

		b8.Core.realCanvas.style.width = '100%';
		b8.Core.realCanvas.style.height = '100%';
		b8.Core.realCanvas.style.filter = 'blur(0.5px)';
		b8.Core.realCanvas.width = b8.CONFIG.SCREEN_REAL_WIDTH;
		b8.Core.realCanvas.height = b8.CONFIG.SCREEN_REAL_HEIGHT;

		b8.Core.container.style.aspectRatio = `${b8.CONFIG.SCREEN_COLS} / ${b8.CONFIG.SCREEN_ROWS}`;

	}


	/**
	 * Handles a crash.
	 *
	 * @param {string} [errorMessage="Fatal error"] - The error message to display.
	 * @returns {void}
	 */
	b8.Core.handleCrash = function( errorMessage = "Fatal error" ) {

		if ( b8.Core.crashed || b8.Core.crashing ) return;

		b8.Core.crashing = true;

		b8.Core.setColor( b8.CONFIG.COLORS.length - 1, 0 );
		b8.Core.cls();

		b8.Core.setCursorLocation( 1, 1 );
		b8.TextRenderer.print( "*** CRASH ***:\n" + errorMessage, null, b8.CONFIG.SCREEN_COLS - 2 );
		b8.Renderer.render();

		b8.Core.crashing = false;
		b8.Core.crashed = true;

	}


	/**
	 * Is this a touch device?
	 *
	 * @returns {boolean} True if this is a touch device.
	 */
	b8.Core.isTouchDevice = function() {

		return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

	}


	/**
	 * Is this a mobile device?
	 *
	 * @returns {boolean} True if this is a mobile device.
	 */
	b8.Core.isMobile = function() {

		return b8.Core.isIOS() || b8.Core.isAndroid() || b8.Core.isTouchDevice();

	}


	/**
	 * Is this an iOS device?
	 *
	 * @returns {boolean} True if this is an iOS device.
	 */
	b8.Core.isIOS = function() {

		return /(ipad|ipod|iphone)/i.test( navigator.userAgent );

	}


	/**
	 * Is this an Android device?
	 *
	 * @returns {boolean} True if this is an Android device.
	 */
	b8.Core.isAndroid = function() {

		return /android/i.test( navigator.userAgent );

	}


	/**
	 * Finds the closest color in the palette to the given RGB values.
	 *
	 * @param {number} r - The red component (0-255).
	 * @param {number} g - The green component (0-255).
	 * @param {number} b - The blue component (0-255).
	 * @param {string[]} palette - The color palette (array of hex strings).
	 * @returns {string} The closest color in hex format.
	 */
	function findClosestColorUsingLookup( r, g, b, lookupTable, bucketSize = 4 ) {

		// Round RGB values to the nearest bucket
		const roundedR = Math.floor( r / bucketSize ) * bucketSize;
		const roundedG = Math.floor( g / bucketSize ) * bucketSize;
		const roundedB = Math.floor( b / bucketSize ) * bucketSize;

		const key = `${roundedR},${roundedG},${roundedB}`;
		return lookupTable[ key ];

	}


	// Cache the color lookup table to avoid recomputing it.
	// Only generated when an image is loaded externally.
	// Font images are not loaded this way.
	const colorLookupTable = {};


	/**
	 * Generates a color lookup table for the given palette.
	 *
	 * @param {string[]} palette - The color palette (array of hex strings).
	 * @param {number} [bucketSize=4] - The size of the color buckets.
	 * @returns {object} The color lookup table.
	 */
	function generateColorLookupTable( palette, bucketSize = 4 ) {

		if ( Object.keys( colorLookupTable ).length !== 0 ) {
			return colorLookupTable;
		}

		// Convert hex palette to rgb palette.
		const rgbPalette = palette.map( color => b8.Utilities.hexToRgb( color ) );

		for ( let r = 0; r < 256; r += bucketSize ) {
			for ( let g = 0; g < 256; g += bucketSize ) {
				for ( let b = 0; b < 256; b += bucketSize ) {
					const key = `${r},${g},${b}`;
					colorLookupTable[ key ] = findClosestColor( r, g, b, rgbPalette );
				}
			}
		}

		return colorLookupTable;

	}


	/**
	 * Finds the closest color in the palette to the given RGB values.
	 *
	 * @param {number} r - The red component (0-255).
	 * @param {number} g - The green component (0-255).
	 * @param {number} b - The blue component (0-255).
	 * @param {object[]} palette - The color palette (array of RGB objects).
	 * @returns {object} The closest color in RGB format.
	 */
	function findClosestColor( r, g, b, palette ) {

		let closestColor = null;
		let closestDistance = Infinity;

		for ( const color of palette ) {

			const distance = (
				Math.pow( color.r - r, 2 ) +
				Math.pow( color.g - g, 2 ) +
				Math.pow( color.b - b, 2 )
			);

			if ( distance < closestDistance ) {
				closestDistance = distance;
				closestColor = color;
			}

		}

		return closestColor;

	}


} )( b8 );
