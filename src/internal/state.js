( function( b8 ) {

	b8.State = b8.State || {};


	// This is the key used to store the state in localStorage.
	let STORAGE_KEY = '';

	document.addEventListener(
		'b8.initComplete',
		function() {

			// Set the storage key based on the b8 configuration name.
			STORAGE_KEY = `b8.${b8.Utilities.makeUrlPretty( b8.CONFIG.NAME )}.state`;

		},
		{ once: true }
	);


	/**
	 * Recursively wraps an object in a Proxy to make it reactive.
	 *
	 * @param {Object} target - The object to wrap.
	 * @returns {Proxy} - The reactive proxy.
	 */
	function createProxy( target ) {

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
				get( obj, prop ) {

					const value = obj[ prop ];
					if ( typeof value === 'object' && value !== null ) {
						return createProxy( value );
					}
					return value;

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
				set( obj, prop, value ) {

					obj[ prop ] = value;
					b8.Utilities.event( 'stateChange', { prop, value } );
					return true;

				}

			}
		);

	}


	/**
	 * Saves the current state to localStorage using CBOR and base64.
	 *
	 * @param {string} [key='b8.state'] - Optional localStorage key.
	 */
	b8.State.save = function( key = STORAGE_KEY ) {

		const encoded = b8.Utilities.encodeData(
			{
				time: Date.now(),
				data: b8.data
			}
		);

		localStorage.setItem( key, encoded );

		b8.State.lastSave = Date.now();

	}


	/**
	 * Loads state from localStorage, replacing State.data.
	 *
	 * @param {string} [key='b8.state'] - Optional localStorage key.
	 */
	b8.State.load = function( key = STORAGE_KEY ) {

		const b64 = localStorage.getItem( key );

		if ( !b64 ) {
			b8.Utilities.log( 'No state found for the given key.' );
			return;
		}

		const rawState = b8.Utilities.decodeData( b64 );
		if ( rawState.data ) {
			b8.data = createProxy( rawState.data );
		}

		if ( rawState.time ) {
			b8.State.lastSave = rawState.time;
		}

	}


	/**
	 * Sets default values for missing keys in the state.
	 * Does not overwrite existing values.
	 *
	 * @param {Object} defaults - An object containing default key/value pairs.
	 */
	b8.State.init = function( defaults ) {

		if ( !b8.data ) {
			b8.data = createProxy( {} );
		}

		// If there is a save file then load that too.
		if ( localStorage.getItem( STORAGE_KEY ) ) {
			b8.State.load();
		}

		b8.data = b8.Utilities.deepMergeByIndex( defaults, b8.data );

		b8.Utilities.log( 'State initialized:', b8.data );

	}


	/**
	 * Resets the state to its initial values.
	 * This is useful for starting a new game or resetting the application.
	 *
	 * @param {string} [key='b8.state'] - Optional localStorage key.
	 * @returns {void}
	 */
	b8.State.clear = function( key = STORAGE_KEY ) {

		b8.Utilities.log( 'Clearing state...' );

		localStorage.removeItem( key );
		b8.data = createProxy( {} );

	}


	/**
	 * The b8.State data object.
	 */
	b8.data = createProxy( {} );


} )( b8 );
