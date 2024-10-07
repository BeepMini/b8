( function( beep8 ) {

	// Define the State object inside beep8.
	beep8.State = {};


	/**
	 * State management class that wraps a given object in a Proxy
	 * to enable reactivity and trigger a render function when the state changes.
	 */
	beep8.State = class {

		/**
		 * Constructor for the State class.
		 *
		 * @param {Object} initialState - The initial state object.
		 * @param {Function|null} renderFn - Optional render function to be called when the state changes.
		 */
		constructor( initialState = {}, renderFn = null ) {

			this.listeners = {};  // Not used in this version but reserved for future custom listeners.
			this.renderFn = renderFn;  // Store the render function.

			// Return the proxy wrapping the initial state.
			return this.createProxy( initialState );

		}


		/**
		 * Recursively creates proxies for nested objects to ensure reactivity.
		 *
		 * @param {Object} target - The object to wrap in a proxy.
		 * @returns {Proxy} - A Proxy that intercepts 'get' and 'set' operations.
		 */
		createProxy( target ) {

			return new Proxy(
				target,
				{

					/**
					 * Get trap for the Proxy.
					 * Intercepts property access on the state object.
					 *
					 * @param {Object} obj - The original object being proxied.
					 * @param {string} prop - The property being accessed.
					 * @returns {*} - The value of the accessed property.
					 */
					get: ( obj, prop ) => {

						// If the property is an object, recursively wrap it in a proxy to handle nested state changes.
						if ( typeof obj[ prop ] === 'object' && obj[ prop ] !== null ) {
							return this.createProxy( obj[ prop ] );
						}

						// Return the value of the property.
						return obj[ prop ];

					},


					/**
					 * Set trap for the Proxy.
					 * Intercepts property updates on the state object.
					 *
					 * @param {Object} obj - The original object being proxied.
					 * @param {string} prop - The property being updated.
					 * @param {*} value - The new value to assign to the property.
					 * @returns {boolean} - Returns true to indicate the operation was successful.
					 */
					set: ( obj, prop, value ) => {

						// Update the property with the new value.
						obj[ prop ] = value;

						// Fire a custom event 'stateChange' when the state is modified.
						// It passes the changed property and its new value.
						beep8.Utilities.event( 'stateChange', { prop, value } );

						// If a render function was provided, call it after the state changes.
						if ( this.renderFn ) {
							this.renderFn();
						}

						// Indicate that the set operation was successful.
						return true;

					}
				}
			);

		}

	};

} )( beep8 || ( beep8 = {} ) );
