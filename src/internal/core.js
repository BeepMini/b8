( function( beep8 ) {

	beep8.Core = {};

	beep8.Core.textRenderer = null;
	beep8.Core.inputSys = null;
	beep8.Core.cursorRenderer = null;
	beep8.Core.realCanvas = null;
	beep8.Core.realCtx = null;
	beep8.Core.canvas = null;
	beep8.Core.ctx = null;
	beep8.Core.deltaTime = 0;

	beep8.Core.drawState = {
		fgColor: 7,
		bgColor: 0,  // -1 means transparent

		cursorCol: 0,
		cursorRow: 0,

		cursorVisible: false, // Don't change this directly, use cursorRenderer.setCursorVisible()
	};

	let lastFrameTime = null;
	let crashed = false;
	let initDone = false;
	let frameHandler = null;
	let frameHandlerTargetInterval = null;
	let animFrameRequested = false;
	let timeToNextFrame = 0;
	let scanLinesEl = null;
	let pendingAsync = null;
	let dirty = false;

	/**
	 * Initializes the engine.
	 *
	 * @param {Function} callback - The function to call when the engine is initialized.
	 * @return {void}
	 */
	beep8.Core.init = function( callback ) {

		beep8.Utilities.checkFunction( "callback", callback );
		beep8.Core.asyncInit( callback );

	}


	/**
	 * Asynchronously initializes the engine.
	 *
	 * @param {Function} callback - The function to call when the engine is initialized.
	 * @returns {void}
	 */
	beep8.Core.asyncInit = async function( callback ) {

		beep8.Utilities.log( "beep8 System initialized" );

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

		// Prevent default touch events on touch devices.
		beep8.Core.realCanvas.addEventListener( "touchstart", e => e.preventDefault() );

		// Work out where to put the canvas.
		let container = document.body;

		if ( beep8.CONFIG.CANVAS_SETTINGS && beep8.CONFIG.CANVAS_SETTINGS.CONTAINER ) {

			const containerSpec = beep8.CONFIG.CANVAS_SETTINGS.CONTAINER;

			if ( typeof ( containerSpec ) === "string" ) {

				container = document.getElementById( containerSpec );

				if ( !container ) {
					console.error( "beep8: Could not find container element with ID: " + containerSpec );
					container = document.body;
				}

			} else if ( containerSpec instanceof HTMLElement ) {

				container = containerSpec;

			} else {

				console.error( "beep8: beep8.CONFIG.CANVAS_SETTINGS.CONTAINER must be either an ID of an HTMLElement." );
				container = document.body;

			}

		}

		// Put the canvas in the container.
		container.appendChild( beep8.Core.realCanvas );

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
		beep8.Core.textRenderer = new beep8.TextRenderer();
		beep8.Core.inputSys = new beep8.Input();
		beep8.Core.cursorRenderer = new beep8.CursorRenderer();

		await beep8.Core.textRenderer.initAsync();

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

		/**
		 * Work around an init bug where text would initially not render on
		 * Firefox. I'm not entirely sure I understand why, but this seems to
		 * fix it (perhaps waiting 1 frame gives the canvas time to initialize).
		 */
		await new Promise( resolve => setTimeout( resolve, 1 ) );
		await callback();

		beep8.render();

	}


	/**
	 * Checks if the engine (ans specified method) is ready to run.
	 *
	 * @param {string} apiMethod - The name of the API method being called.
	 * @returns {void}
	 */
	beep8.Core.preflight = function( apiMethod ) {

		if ( crashed ) {
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

		beep8.Core.render();

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
	 *
	 */
	beep8.Core.setFrameHandler = function( callback, targetFps ) {

		frameHandler = callback;
		frameHandlerTargetInterval = 1.0 / ( targetFps || 30 );
		timeToNextFrame = 0;

		if ( !animFrameRequested ) {
			window.requestAnimationFrame( doFrame );
		}

	}


	/**
	 * Renders the screen.
	 *
	 * @returns {void}
	 */
	beep8.Core.render = function() {

		if ( crashed ) return;

		beep8.Core.realCtx.imageSmoothingEnabled = false;
		beep8.Core.realCtx.clearRect( 0, 0, beep8.Core.realCanvas.width, beep8.Core.realCanvas.height );
		beep8.Core.realCtx.drawImage(
			beep8.Core.canvas,
			0, 0,
			beep8.Core.realCanvas.width, beep8.Core.realCanvas.height
		);

		dirty = false;

		beep8.Core.cursorRenderer.drawCursor( beep8.Core.realCtx, beep8.Core.realCanvas.width, beep8.Core.realCanvas.height );

	}


	/**
	 * Marks the screen as dirty, so it will be re-rendered on the next frame.
	 *
	 * @returns {void}
	 */
	beep8.Core.markDirty = function() {

		if ( dirty ) return;

		dirty = true;
		setTimeout( beep8.Core.render, 1 );

	}


	/**
	 * Clears the screen and resets the cursor to the top-left corner.
	 *
	 * @returns {void}
	 */
	beep8.Core.cls = function() {

		beep8.Core.ctx.fillStyle = beep8.Core.getColorHex( beep8.Core.drawState.bgColor );
		beep8.Core.ctx.fillRect( 0, 0, beep8.Core.canvas.width, beep8.Core.canvas.height );

		this.setCursorLocation( 0, 0 );
		beep8.Core.markDirty();

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
		beep8.Core.textRenderer.regenColors();

	}


	/**
	 * Sets the colors used for text and background.
	 *
	 * @param {number} fg - The foreground color.
	 * @param {number} bg - The background color.
	 * @returns {void}
	 */
	beep8.Core.setColor = function( fg, bg ) {

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
	 * Gets the current time.
	 *
	 * @returns {number} The current time.
	 */
	beep8.Core.getNow = function() {

		if ( window.performace.now ) {
			return window.performance.now();
		}

		return new Date().getTime();

	}


	/**
	 * Draws an image.
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
	 * Draws a rectangle.
	 *
	 * @param {number} x - The x-coordinate of the upper-left corner of the rectangle.
	 * @param {number} y - The y-coordinate of the upper-left corner of the rectangle.
	 * @param {number} width - The width of the rectangle.
	 * @param {number} height - The height of the rectangle.
	 * @returns {void}
	 */
	beep8.Core.drawRect = function( x, y, width, height ) {

		beep8.Utilities.checkNumber( "x", x );
		beep8.Utilities.checkNumber( "y", y );
		beep8.Utilities.checkNumber( "width", width );
		beep8.Utilities.checkNumber( "height", height );

		let oldStrokeStyle = beep8.Core.ctx.strokeStyle;
		beep8.Core.ctx.strokeStyle = beep8.Core.getColorHex( beep8.Core.drawState.fgColor );
		beep8.Core.ctx.strokeRect(
			Math.round( x ) + 0.5, Math.round( y ) + 0.5,
			Math.round( width ) - 1, Math.round( height ) - 1
		);

		beep8.Core.ctx.strokeStyle = oldStrokeStyle;

	}


	/**
	 * Fills a rectangle.
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
	 * Saves the current screen.
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
	 *
	 */
	beep8.Core.doFrame = async function() {

		animFrameRequested = false;

		const now = getNow();
		_deltaTime = lastFrameTime !== null ? 0.001 * ( now - lastFrameTime ) : ( 1 / 60.0 );
		_deltaTime = Math.min( _deltaTime, 0.05 );
		lastFrameTime = now;

		timeToNextFrame += _deltaTime;

		let numFramesDone = 0;

		while ( frameHandler && numFramesDone < 4 && timeToNextFrame > frameHandlerTargetInterval ) {
			await frameHandler();
			beep8.Core.inputSys.onEndFrame();
			timeToNextFrame -= frameHandlerTargetInterval;
			++numFramesDone;
		}

		beep8.render();

		if ( frameHandler ) {
			animFrameRequested = true;
			window.requestAnimationFrame( doFrame );
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
			beep8.Core.render();
		}

	}


	/**
	 * Updates the layout of the 2D canvas.
	 *
	 * @returns {void}
	 */
	beep8.Core.updateLayout2d = function() {

		const autoSize = !beep8.CONFIG.CANVAS_SETTINGS || beep8.CONFIG.CANVAS_SETTINGS.AUTO_SIZE;
		const autoPos = !beep8.CONFIG.CANVAS_SETTINGS || beep8.CONFIG.CANVAS_SETTINGS.AUTO_POSITION;

		let useAutoScale = typeof ( beep8.CONFIG.SCREEN_SCALE ) !== 'number';
		let scale;

		if ( useAutoScale ) {

			const frac = beep8.CONFIG.MAX_SCREEN_FRACTION || 0.8;
			const availableSize = autoSize ?
				{ width: frac * window.innerWidth, height: frac * window.innerHeight } :
				beep8.Core.realCanvas.getBoundingClientRect();
			scale = Math.floor( Math.min(
				availableSize.width / beep8.CONFIG.SCREEN_WIDTH,
				availableSize.height / beep8.CONFIG.SCREEN_HEIGHT ) );
			scale = Math.min( Math.max( scale, 1 ), 5 );
			beep8.Utilities.log( `Auto - scale: available size ${availableSize.width} x ${availableSize.height}, scale ${scale}, dpr ${window.devicePixelRatio}` );

		} else {

			scale = beep8.CONFIG.SCREEN_SCALE;

		}

		beep8.CONFIG.SCREEN_EL_WIDTH = beep8.CONFIG.SCREEN_WIDTH * scale;
		beep8.CONFIG.SCREEN_EL_HEIGHT = beep8.CONFIG.SCREEN_HEIGHT * scale;
		beep8.CONFIG.SCREEN_REAL_WIDTH = beep8.CONFIG.SCREEN_WIDTH * scale;
		beep8.CONFIG.SCREEN_REAL_HEIGHT = beep8.CONFIG.SCREEN_HEIGHT * scale;

		if ( autoSize ) {

			beep8.Core.realCanvas.style.width = beep8.CONFIG.SCREEN_EL_WIDTH + "px";
			beep8.Core.realCanvas.style.height = beep8.CONFIG.SCREEN_EL_HEIGHT + "px";
			beep8.Core.realCanvas.width = beep8.CONFIG.SCREEN_REAL_WIDTH;
			beep8.Core.realCanvas.height = beep8.CONFIG.SCREEN_REAL_HEIGHT;

		} else {

			const actualSize = beep8.Core.realCanvas.getBoundingClientRect();
			beep8.Core.realCanvas.width = actualSize.width;
			beep8.Core.realCanvas.height = actualSize.height;

		}

		beep8.Core.realCtx = beep8.Core.realCanvas.getContext( "2d" );
		beep8.Core.realCtx.imageSmoothingEnabled = false;

		if ( autoPos ) {

			beep8.Core.realCanvas.style.position = "absolute";
			beep8.Core.realCanvas.style.left = Math.round( ( window.innerWidth - beep8.Core.realCanvas.width ) / 2 ) + "px";
			beep8.Core.realCanvas.style.top = Math.round( ( window.innerHeight - beep8.Core.realCanvas.height ) / 2 ) + "px";

		}

		const scanLinesOp = beep8.CONFIG.SCAN_LINES_OPACITY || 0;

		if ( scanLinesOp > 0 ) {

			if ( autoPos && autoSize ) {

				if ( !scanLinesEl ) {
					scanLinesEl = document.createElement( "div" );
					document.body.appendChild( scanLinesEl );
				}

				scanLinesEl.style.background =
					"linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 1) 50%), " +
					"linear-gradient(90deg, rgba(255, 0, 0, .6), rgba(0, 255, 0, .2), rgba(0, 0, 255, .6))";

				scanLinesEl.style.backgroundSize = `100% 4px, 3px 100%`;
				scanLinesEl.style.opacity = scanLinesOp;
				scanLinesEl.style.position = "absolute";
				scanLinesEl.style.left = beep8.Core.realCanvas.style.left;
				scanLinesEl.style.top = beep8.Core.realCanvas.style.top;
				scanLinesEl.style.width = beep8.Core.realCanvas.style.width;
				scanLinesEl.style.height = beep8.Core.realCanvas.style.height;
				scanLinesEl.style.zIndex = 1;

			} else {

				console.error( "beep8: 2D scanlines effect only works if beep8.CONFIG.CANVAS_SETTINGS.AUTO_POS and AUTO_SIZE are both on." );

			}

		}

	}


	//
	let crashing = false;


	/**
	 * Handles a crash.
	 *
	 * @param {string} [errorMessage="Fatal error"] - The error message to display.
	 * @returns {void}
	 */
	beep8.Core.handleCrash = function( errorMessage = "Fatal error" ) {

		if ( crashed || crashing ) return;

		crashing = true;

		beep8.Core.setColor( beep8.CONFIG.COLORS.length - 1, 0 );
		beep8.Core.cls();

		beep8.Core.drawState.cursorCol = beep8.Core.drawState.cursorRow = 1;
		beep8.Core.textRenderer.print( "*** CRASH ***:\n" + errorMessage );
		beep8.render();

		crashing = false;
		crashed = true;

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
