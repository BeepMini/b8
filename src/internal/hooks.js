( function( b8 ) {

	b8.Hooks = {};

	/**
	 * Internal hook management for actions and filters.
	 * This is used to manage the hooks for actions and filters in the b8 framework.
	 * It allows you to add, execute, and remove hooks for various game events.
	 */
	const actions = {};
	const filters = {};


	/**
	 * Adds a hook to the specified store with the given name, callback, and priority.
	 * This function is used internally to manage hooks for actions and filters.
	 *
	 * @param {Object} store - The store to add the hook to (actions or filters).
	 * @param {string} hookName - The name of the hook.
	 * @param {Function} callback - The function to call when the hook is triggered.
	 * @param {number} [priority=10] - The priority of the hook.
	 * @returns {void}
	 */
	function _add( store, hookName, callback, priority = 10 ) {

		if ( !store[ hookName ] ) store[ hookName ] = [];
		store[ hookName ].push( { callback, priority } );
		store[ hookName ].sort( ( a, b ) => a.priority - b.priority );

	}


	/**
	 * Registers an action hook.
	 * This allows you to add a callback that will be executed when the action is triggered.
	 * You can use this to modify game behavior or add custom functionality.
	 *
	 * @param {string} hookName - The name of the action hook.
	 * @param {Function} callback - The function to call when the action is triggered.
	 * @param {number} [priority=10] - The priority of the action hook.
	 * @returns {void}
	 */
	b8.Hooks.addAction = function( hookName, callback, priority = 10 ) {

		_add( actions, hookName, callback, priority );

	}


	/**
	 * Executes all registered actions for the given hook name.
	 * This will call each action's callback with the provided arguments.
	 *
	 * @example
	 * b8.Hooks.doAction( 'onPlayerMove', playerId, newX, newY, dx, dy );
	 *
	 * @param {string} hookName - The name of the action hook to execute.
	 * @param {...*} args - The arguments to pass to the action callbacks.
	 * @returns {void}
	 *
	 */
	b8.Hooks.doAction = function( hookName, ...args ) {

		if ( !actions[ hookName ] ) return;
		for ( const { callback } of actions[ hookName ] ) {
			callback( ...args );
		}

	}


	/**
	 * Registers a filter hook.
	 * This allows you to add a callback that will modify a value before it is returned.
	 * You can use this to change game data or apply transformations.
	 *
	 * @param {string} hookName - The name of the filter hook.
	 * @param {Function} callback - The function to call when the filter is applied.
	 * @param {number} [priority=10] - The priority of the filter hook.
	 * @returns {void}
	 */
	b8.Hooks.addFilter = function( hookName, callback, priority = 10 ) {

		_add( filters, hookName, callback, priority );

	}


	/**
	 * Applies all registered filters for the given hook name to a value.
	 * This will call each filter's callback with the value and any additional arguments,
	 * returning the modified value.
	 *
	 * @example
	 * const modifiedValue = b8.Hooks.applyFilters( 'modifyPlayerSpeed', playerSpeed, playerId );
	 *
	 * @param {string} hookName - The name of the filter hook to apply.
	 * @param {*} value - The initial value to filter.
	 * @param {...*} args - Additional arguments to pass to the filter callbacks.
	 * @return {*} The modified value after all filters have been applied.
	 */
	b8.Hooks.applyFilters = function( hookName, value, ...args ) {

		if ( !filters[ hookName ] ) return value;

		let result = value;
		for ( const { callback } of filters[ hookName ] ) {
			result = callback( result, ...args );
		}

		return result;

	}


	/**
	 * Removes a specific action hook by its name and callback.
	 * This is useful for cleaning up hooks that are no longer needed.
	 *
	 * @param {string} hookName - The name of the action hook to remove.
	 * @param {Function} callback - The callback function to remove.
	 * @returns {void}
	 */
	b8.Hooks.removeAction = function( hookName, callback ) {

		actions[ hookName ] = ( actions[ hookName ] || [] ).filter( h => h.callback !== callback );

	}


	/**
	 * Removes a specific filter hook by its name and callback.
	 * This is useful for cleaning up filters that are no longer needed.
	 *
	 * @param {string} hookName - The name of the filter hook to remove.
	 * @param {Function} callback - The callback function to remove.
	 * @returns {void}
	 */
	b8.Hooks.removeFilter = function( hookName, callback ) {

		filters[ hookName ] = ( filters[ hookName ] || [] ).filter( h => h.callback !== callback );

	}


} )( b8 );
