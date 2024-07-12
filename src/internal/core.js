( function( beep8 ) {

	let _textRenderer = null;
	let _inputSys = null;
	let _cursorRenderer = null;
	let _realCanvas = null;
	let _realCtx = null;
	let _canvas = null;
	let _ctx = null;
	let _deltaTime = 0;

	Object.defineProperty(
		beep8.core,
		'textRenderer',
		{
			get() { return _textRenderer; },
			set( value ) { _textRenderer = value; }
		}
	);

	Object.defineProperty(
		beep8.core,
		'inputSys',
		{
			get() { return _inputSys; },
			set( value ) { _inputSys = value; }
		}
	);

	Object.defineProperty(
		beep8.core,
		'cursorRenderer',
		{
			get() { return _cursorRenderer; },
			set( value ) { _cursorRenderer = value; }
		}
	);

	Object.defineProperty(
		beep8.core,
		'realCanvas',
		{
			get() { return _realCanvas; },
			set( value ) { _realCanvas = value; }
		}
	);

	Object.defineProperty(
		beep8.core,
		'realCtx',
		{
			get() { return _realCtx; },
			set( value ) { _realCtx = value; }
		}
	);

	Object.defineProperty(
		beep8.core,
		'canvas',
		{
			get() { return _canvas; },
			set( value ) { _canvas = value; }
		}
	);

	Object.defineProperty(
		beep8.core,
		'ctx',
		{
			get() { return _ctx; },
			set( value ) { _ctx = value; }
		}
	);

	Object.defineProperty(
		beep8.core,
		'deltaTime',
		{
			get() { return _deltaTime; },
			set( value ) { _deltaTime = value; }
		}
	);

	let lastFrameTime = null;
	let crashed = false;

	beep8.core.drawState = {
		fgColor: 7,
		bgColor: 0,  // -1 means transparent

		cursorCol: 0,
		cursorRow: 0,

		cursorVisible: false, // Don't change this directly, use cursorRenderer.setCursorVisible()
	};

	let initDone = false;
	let frameHandler = null;
	let frameHandlerTargetInterval = null;
	let animFrameRequested = false;
	let timeToNextFrame = 0;

	let scanLinesEl = null;

	let pendingAsync = null;
	let dirty = false;


	beep8.core.init = function( callback ) {

		beep8.utilities.checkFunction( "callback", callback );
		asyncInit( callback );

	}


	async function asyncInit( callback ) {

		beep8.utilities.log( "Sys init." );

		CONFIG.SCREEN_WIDTH = CONFIG.SCREEN_COLS * CONFIG.CHR_WIDTH;
		CONFIG.SCREEN_HEIGHT = CONFIG.SCREEN_ROWS * CONFIG.CHR_HEIGHT;

		_realCanvas = document.createElement( "canvas" );
		if ( CONFIG.CANVAS_SETTINGS && CONFIG.CANVAS_SETTINGS.CANVAS_ID ) {
			_realCanvas.setAttribute( "id", CONFIG.CANVAS_SETTINGS.CANVAS_ID );
		}

		if ( CONFIG.CANVAS_SETTINGS && CONFIG.CANVAS_SETTINGS.CANVAS_CLASSES ) {
			for ( const className of CONFIG.CANVAS_SETTINGS.CANVAS_CLASSES ) {
				_realCanvas.classList.add( className );
			}
		}

		_realCanvas.addEventListener( "touchstart", e => e.preventDefault() );

		let container = document.body;

		if ( CONFIG.CANVAS_SETTINGS && CONFIG.CANVAS_SETTINGS.CONTAINER ) {
			const containerSpec = CONFIG.CANVAS_SETTINGS.CONTAINER;
			if ( typeof ( containerSpec ) === "string" ) {
				container = document.getElementById( containerSpec );
				if ( !container ) {
					console.error( "beep8: Could not find container element with ID: " + containerSpec );
					container = document.body;
				}
			} else if ( containerSpec instanceof HTMLElement ) {
				container = containerSpec;
			} else {
				console.error( "beep8: CONFIG.CANVAS_SETTINGS.CONTAINER must be either an ID of an HTMLElement." );
				container = document.body;
			}
		}

		container.appendChild( _realCanvas );

		_canvas = document.createElement( "canvas" );
		_canvas.width = CONFIG.SCREEN_WIDTH;
		_canvas.height = CONFIG.SCREEN_HEIGHT;
		_canvas.style.width = CONFIG.SCREEN_WIDTH + "px";
		_canvas.style.height = CONFIG.SCREEN_HEIGHT + "px";
		_ctx = _canvas.getContext( "2d" );
		_ctx.imageSmoothingEnabled = false;

		_textRenderer = new TextRenderer();
		_inputSys = new InputSys();
		_cursorRenderer = new CursorRenderer();

		await _textRenderer.initAsync();

		updateLayout( false );
		window.addEventListener( "resize", () => updateLayout( true ) );

		if ( isMobile() ) {
			vjoy.setup();
		}

		initDone = true;

		await new Promise( resolve => setTimeout( resolve, 1 ) );
		await callback();

		render();

	}


	beep8.core.getContext = function() {

		return _ctx;

	}


	beep8.core.preflight = function( apiMethod ) {

		if ( crashed ) {
			throw new Error( `Can't call API method ${apiMethod}() because the engine has crashed.` );
		}

		if ( !initDone ) {
			beep8.utilities.fatal(
				`Can't call API method ${apiMethod}(): API not initialized. ` +
				`Call initAsync() wait until it finishes before calling API methods.`
			);
		}

		if ( pendingAsync ) {
			beep8.utilities.fatal(
				`Can't call API method ${apiMethod}() because there is a pending async ` +
				`call to ${pendingAsync.name}() that hasn't finished running yet. Are you missing ` +
				`an 'await' keyword to wait for the async method? Use 'await ${pendingAsync.name}()',` +
				`not just '${pendingAsync.name}()'`
			);
		}

	}


	beep8.core.startAsync = function( asyncMethodName, resolve, reject ) {

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
		}

		this.render();

	}


	beep8.core.hasPendingAsync = function( asyncMethodName ) {

		return pendingAsync && pendingAsync.name === asyncMethodName;

	}


	beep8.core.endAsyncImpl = function( asyncMethodName, isError, result ) {

		if ( !pendingAsync ) {
			throw new Error( `Internal bug: endAsync(${asyncMethodName}) called with no pendingAsync` );
		}

		if ( pendingAsync.name !== asyncMethodName ) {
			throw new Error( `Internal bug: endAsync(${asyncMethodName}) called but pendingAsync.name ` +
				`is ${pendingAsync.name}` );
		}

		const fun = isError ? pendingAsync.reject : pendingAsync.resolve;
		pendingAsync = null;
		fun( result );

	}


	beep8.core.resolveAsync = function( asyncMethodName, result ) {

		endAsyncImpl( asyncMethodName, false, result );

	}


	beep8.core.failAsync = function( asyncMethodName, error ) {

		endAsyncImpl( asyncMethodName, true, error );

	}


	beep8.core.setFrameHandler = function( callback, targetFps ) {

		frameHandler = callback;
		frameHandlerTargetInterval = 1.0 / ( targetFps || 30 );
		timeToNextFrame = 0;

		if ( !animFrameRequested ) {
			window.requestAnimationFrame( doFrame );
		}

	}


	beep8.core.render = function() {

		if ( crashed ) return;
		_realCtx.imageSmoothingEnabled = false;
		_realCtx.clearRect( 0, 0, _realCanvas.width, _realCanvas.height );
		_realCtx.drawImage(
			_canvas,
			0, 0,
			_realCanvas.width, _realCanvas.height
		);
		dirty = false;

		_cursorRenderer.drawCursor( _realCtx, _realCanvas.width, _realCanvas.height );

	}


	beep8.core.markDirty = function() {

		if ( dirty ) return;
		dirty = true;
		setTimeout( render, 1 );

	}

	beep8.core.cls = function() {

		_ctx.fillStyle = getColorHex( beep8.core.drawState.bgColor );
		_ctx.fillRect( 0, 0, _canvas.width, _canvas.height );
		this.setCursorLocation( 0, 0 );
		markDirty();

	}


	beep8.core.defineColors = function( colors ) {

		beep8.utilities.checkArray( "colors", colors );
		CONFIG.COLORS = colors.slice();
		_textRenderer.regenColors();

	}


	beep8.core.setColor = function( fg, bg ) {

		beep8.utilities.checkNumber( "fg", fg );
		drawState.fgColor = Math.round( fg );

		if ( bg !== undefined ) {
			beep8.utilities.checkNumber( "bg", bg );
			drawState.bgColor = Math.round( bg );
		}

	}


	beep8.core.setCursorLocation = function( col, row ) {

		beep8.utilities.checkNumber( "col", col );

		if ( row !== undefined ) beep8.utilities.checkNumber( "row", row );

		drawState.cursorCol = Math.round( col );

		if ( row !== undefined ) drawState.cursorRow = Math.round( row );

	}


	beep8.core.getColorHex = function( c ) {

		if ( typeof ( c ) !== "number" ) return "#f0f";

		if ( c < 0 ) return "#000";

		c = beep8.utilities.clamp( Math.round( c ), 0, CONFIG.COLORS.length - 1 );

		return CONFIG.COLORS[ c ];

	}


	beep8.core.getNow = function() {

		if ( window.performace.now ) {
			return window.performance.now();
		}

		return new Date().getTime();

	}


	beep8.core.drawImage = function( img, x, y, srcX, srcY, width, height ) {

		beep8.utilities.checkInstanceOf( "img", img, HTMLImageElement );
		beep8.utilities.checkNumber( "x", x );
		beep8.utilities.checkNumber( "y", y );

		if ( srcX !== undefined ) beep8.utilities.checkNumber( "srcX", srcX );
		if ( srcY !== undefined ) beep8.utilities.checkNumber( "srcY", srcY );
		if ( width !== undefined ) beep8.utilities.checkNumber( "width", width );
		if ( height !== undefined ) beep8.utilities.checkNumber( "height", height );
		if (
			srcX !== undefined && srcY !== undefined &&
			width !== undefined && height !== undefined
		) {
			_ctx.drawImage( img, srcX, srcY, width, height, x, y, width, height );
		} else {
			_ctx.drawImage( img, x, y );
		}

	}


	beep8.core.drawRect = function( x, y, width, height ) {

		beep8.utilities.checkNumber( "x", x );
		beep8.utilities.checkNumber( "y", y );
		beep8.utilities.checkNumber( "width", width );
		beep8.utilities.checkNumber( "height", height );

		let oldStrokeStyle = _ctx.strokeStyle;
		_ctx.strokeStyle = getColorHex( drawState.fgColor );
		_ctx.strokeRect(
			Math.round( x ) + 0.5, Math.round( y ) + 0.5,
			Math.round( width ) - 1, Math.round( height ) - 1
		);

		_ctx.strokeStyle = oldStrokeStyle;

	}


	beep8.core.fillRect = function( x, y, width, height ) {

		beep8.utilities.checkNumber( "x", x );
		beep8.utilities.checkNumber( "y", y );
		beep8.utilities.checkNumber( "width", width );
		beep8.utilities.checkNumber( "height", height );

		_ctx.fillStyle = getColorHex( drawState.fgColor );
		_ctx.fillRect(
			Math.round( x ) + 0.5, Math.round( y ) + 0.5,
			Math.round( width ) - 1, Math.round( height ) - 1
		);
	}


	beep8.core.saveScreen = function() {

		return _ctx.getImageData( 0, 0, _canvas.width, _canvas.height );

	}

	beep8.core.restoreScreen = function( screenData ) {

		beep8.utilities.checkInstanceOf( "screenData", screenData, ImageData );
		_ctx.putImageData( screenData, 0, 0 );

	}


	async function doFrame() {

		animFrameRequested = false;

		const now = getNow();
		_deltaTime = lastFrameTime !== null ? 0.001 * ( now - lastFrameTime ) : ( 1 / 60.0 );
		_deltaTime = Math.min( _deltaTime, 0.05 );
		lastFrameTime = now;

		timeToNextFrame += _deltaTime;

		let numFramesDone = 0;

		while ( frameHandler && numFramesDone < 4 && timeToNextFrame > frameHandlerTargetInterval ) {
			await frameHandler();
			_inputSys.onEndFrame();
			timeToNextFrame -= frameHandlerTargetInterval;
			++numFramesDone;
		}

		render();

		if ( frameHandler ) {
			animFrameRequested = true;
			window.requestAnimationFrame( doFrame );
		}

	}


	beep8.core.updateLayout = function( renderNow ) {

		updateLayout2d();

		if ( renderNow ) render();

	}


	beep8.core.updateLayout2d = function() {

		const autoSize = !CONFIG.CANVAS_SETTINGS || CONFIG.CANVAS_SETTINGS.AUTO_SIZE;
		const autoPos = !CONFIG.CANVAS_SETTINGS || CONFIG.CANVAS_SETTINGS.AUTO_POSITION;

		let useAutoScale = typeof ( CONFIG.SCREEN_SCALE ) !== 'number';
		let scale;

		if ( useAutoScale ) {

			const frac = CONFIG.MAX_SCREEN_FRACTION || 0.8;
			const availableSize = autoSize ?
				{ width: frac * window.innerWidth, height: frac * window.innerHeight } :
				_realCanvas.getBoundingClientRect();
			scale = Math.floor( Math.min(
				availableSize.width / CONFIG.SCREEN_WIDTH,
				availableSize.height / CONFIG.SCREEN_HEIGHT ) );
			scale = Math.min( Math.max( scale, 1 ), 5 );
			beep8.utilities.log( `Auto-scale: available size ${availableSize.width} x ${availableSize.height}, scale ${scale}, dpr ${window.devicePixelRatio}` );

		} else {

			scale = CONFIG.SCREEN_SCALE;

		}

		CONFIG.SCREEN_EL_WIDTH = CONFIG.SCREEN_WIDTH * scale;
		CONFIG.SCREEN_EL_HEIGHT = CONFIG.SCREEN_HEIGHT * scale;
		CONFIG.SCREEN_REAL_WIDTH = CONFIG.SCREEN_WIDTH * scale;
		CONFIG.SCREEN_REAL_HEIGHT = CONFIG.SCREEN_HEIGHT * scale;

		if ( autoSize ) {

			_realCanvas.style.width = CONFIG.SCREEN_EL_WIDTH + "px";
			_realCanvas.style.height = CONFIG.SCREEN_EL_HEIGHT + "px";
			_realCanvas.width = CONFIG.SCREEN_REAL_WIDTH;
			_realCanvas.height = CONFIG.SCREEN_REAL_HEIGHT;

		} else {

			const actualSize = _realCanvas.getBoundingClientRect();
			_realCanvas.width = actualSize.width;
			_realCanvas.height = actualSize.height;

		}

		_realCtx = _realCanvas.getContext( "2d" );
		_realCtx.imageSmoothingEnabled = false;

		if ( autoPos ) {

			_realCanvas.style.position = "absolute";
			_realCanvas.style.left = Math.round( ( window.innerWidth - _realCanvas.width ) / 2 ) + "px";
			_realCanvas.style.top = Math.round( ( window.innerHeight - _realCanvas.height ) / 2 ) + "px";

		}

		const scanLinesOp = CONFIG.SCAN_LINES_OPACITY || 0;

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
				scanLinesEl.style.left = _realCanvas.style.left;
				scanLinesEl.style.top = _realCanvas.style.top;
				scanLinesEl.style.width = _realCanvas.style.width;
				scanLinesEl.style.height = _realCanvas.style.height;
				scanLinesEl.style.zIndex = 1;

			} else {

				console.error( "beep8: 2D scanlines effect only works if CONFIG.CANVAS_SETTINGS.AUTO_POS and AUTO_SIZE are both on." );

			}

		}

	}

	let crashing = false;

	beep8.core.handleCrash = function( errorMessage = "Fatal error" ) {

		if ( crashed || crashing ) return;
		crashing = true;

		setColor( CONFIG.COLORS.length - 1, 0 );
		cls();

		drawState.cursorCol = drawState.cursorRow = 1;
		_textRenderer.print( "*** CRASH ***:\n" + errorMessage );
		render();

		crashing = false;
		crashed = true;

	}


	beep8.core.isMobile = function() {

		return isIOS() || isAndroid();

	}


	beep8.core.isIOS = function() {

		return /(ipad|ipod|iphone)/i.test( navigator.userAgent );

	}


	beep8.core.isAndroid = function() {

		return /android/i.test( navigator.userAgent );

	}

} )( beep8 || ( beep8 = {} ) );
