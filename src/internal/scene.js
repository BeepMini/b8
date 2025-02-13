( function( beep8 ) {

	/**
	 * Stores all scenes by name.
	 *
	 * @type {Object}
	 */
	beep8.Scenes = {};


	/**
	 * Holds the current active scene object.
	 *
	 * @type {Object|null}
	 */
	let activeScene = null;

	const sceneList = {};


	/**
	 * Adds a new scene to the scene manager.
	 *
	 * @param {string} name - The name of the scene.
	 * @param {object} gameObject - An object that includes init, update, and
	 * render methods as well as other properties for the scene. If update and
	 * render are set then these will be passed to `beep8.frame`.
	 * @param {number} frameRate - The frame rate at which to update and render
	 */
	beep8.Scenes.add = function( name, gameObject = null, frameRate = 30 ) {

		beep8.Utilities.checkString( 'name', name );

		if ( gameObject !== null ) {
			beep8.Utilities.checkObject( 'gameObject', gameObject );
		}

		beep8.Utilities.checkInt( 'frameRate', frameRate );

		const init = gameObject.init || null;
		const update = gameObject.update || null;
		const render = gameObject.render || null;

		sceneList[ name ] = { init, update, render, frameRate };

	};


	/**
	 * Switches to a specified scene by name.
	 *
	 * @param {string} name - The name of the scene to switch to.
	 */
	beep8.Scenes.setActive = function( name ) {

		beep8.Utilities.checkString( 'name', name );

		if ( !sceneList[ name ] ) {
			beep8.Utilities.fatal( `Scene "${name}" does not exist.` );
		}

		// Stop the current game loop.
		beep8.Core.stopFrame();

		// Store the active scene.
		activeScene = name;

		// Get the scene object.
		const currentScene = sceneList[ name ];

		// If there's an init method, call it.
		if ( currentScene.init ) {
			currentScene.init();
		}

		// If there's an update or render method, call frame to create a synchronous game.
		if ( currentScene.update || currentScene.render ) {
			beep8.frame( currentScene.render, currentScene.update, currentScene.frameRate );
		}

	};


	/**
	 * Gets the current active scene.
	 *
	 * @returns {Object|null} The active scene object, or null if no scene is active.
	 */
	beep8.Scenes.getActive = function() {

		return activeScene;

	};


	/**
	 * Gets all scenes.
	 *
	 * @returns {Object} All scenes.
	 */
	beep8.Scenes.getAll = function() {

		return sceneList;

	};

} )( beep8 || ( beep8 = {} ) );
