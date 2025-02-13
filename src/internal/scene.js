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
	 * @param {Function} update - The update function for the scene, which will be passed to `beep8.frame`.
	 */
	beep8.Scenes.addScene = function( name, update = null, render = null, frameRate = 30 ) {

		beep8.Utilities.checkString( 'name', name );

		if ( update !== null ) {
			beep8.Utilities.checkFunction( 'update', update );
		}

		if ( render !== null ) {
			beep8.Utilities.checkFunction( 'render', render );
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
	beep8.Scenes.switchScene = function( name ) {

		beep8.Utilities.checkString( 'name', name );

		if ( !sceneList[ name ] ) {
			beep8.Utilities.fatal( `Scene "${name}" does not exist.` );
		}

		activeScene = name;

		beep8.frame( beep8.scenes[ name ].update, beep8.scenes[ name ].render, beep8.scenes[ name ].frameRate );

	};


	/**
	 * Gets the current active scene.
	 *
	 * @returns {Object|null} The active scene object, or null if no scene is active.
	 */
	beep8.Scenes.getActiveScene = function() {

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
