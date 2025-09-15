( function( beep8 ) {

	beep8.Inventory = {};


	document.addEventListener(
		'beep8.initComplete',
		() => {

			beep8.Inventory.reset();

		},
		{ once: true }
	);


	/**
	 * Reset the inventory to empty.
	 *
	 * This clears all item counts and flags.
	 *
	 * @returns {void}
	 */
	beep8.Inventory.reset = function() {

		beep8.data.inventory = {
			counts: {},
			flags: {}
		};

	};


	/**
	 * Get the count of a specific item in the inventory.
	 *
	 * @param {string} id The item ID to check.
	 * @returns {number} The count of the item (default: 0 if not found).
	 */
	beep8.Inventory.getCount = function( id ) {

		return beep8.data.inventory.counts[ id ] ?? 0;

	}


	/**
	 * Add a certain amount of an item to the inventory.
	 *
	 * If a max is provided, the item count will not exceed that max.
	 *
	 * @param {string} id The item ID to add.
	 * @param {number} [amount=1] The amount to add (default: 1).
	 * @param {number} [max=Infinity] The maximum amount allowed (default: Infinity).
	 */
	beep8.Inventory.add = function( id, amount = 1, max = Infinity ) {

		const current = beep8.Inventory.getCount( id );
		beep8.data.inventory.counts[ id ] = Math.min( current + amount, max );

	}


	/**
	 * Remove a certain amount of an item from the inventory.
	 *
	 * If the item count goes below zero, it is set to zero.
	 *
	 * @param {string} id The item ID to remove.
	 * @param {number} [amount=1] The amount to remove (default: 1).
	 */
	beep8.Inventory.remove = function( id, amount = 1 ) {

		const current = beep8.Inventory.getCount( id );
		beep8.data.inventory.counts[ id ] = Math.max( current - amount, 0 );

	}


	/**
	 * Check if the inventory has at least a certain amount of an item.
	 *
	 * @param {string} id The item ID to check.
	 * @param {number} [amount=1] The minimum amount required (default: 1).
	 * @returns {boolean} True if the inventory has at least the specified amount, false otherwise.
	 */
	beep8.Inventory.has = function( id, amount = 1 ) {

		return beep8.Inventory.getCount( id ) >= amount;

	}


	/**
	 * Set a flag in the inventory.
	 *
	 * For things like "door opened", "cutscene played"
	 *
	 * @param {string} flag The flag name to set.
	 * @param {boolean} [value=true] The value to set the flag to (default: true).
	 */
	beep8.Inventory.setFlag = function( flag, value = true ) {

		beep8.data.inventory.flags[ flag ] = value;

	}


	/**
	 * Get a flag from the inventory.
	 *
	 * Returns true/false if the flag is set.
	 *
	 * @param {string} flag The flag name to get.
	 * @returns {boolean} The value of the flag (default: false).
	 */
	beep8.Inventory.getFlag = function( flag ) {

		beep8.Utilities.checkString( 'flag', flag );

		return !!beep8.data.inventory.flags[ flag ];

	}


	/**
	 * Filters inventory items based on a prefix or a regular expression.
	 *
	 * This function returns an array of objects, each containing the `id` and `count`
	 * of items that match the given prefix or regular expression.
	 *
	 * Examples:
	 * - To get all keys by prefix:
	 *   const keys = beep8.Inventory.filter("key-");
	 *
	 * - To use a regex for finer control:
	 *   const special = beep8.Inventory.filter(/^potion-|^scroll-/);
	 *
	 * @param {string|RegExp} match Item ID prefix or regex to match.
	 * @returns {Array<{id:string,count:number}>} Matching items with counts.
	 */
	beep8.Inventory.filter = function( match ) {

		// Array to store matching items
		const out = [];
		// Reference to the inventory counts
		const counts = beep8.data.inventory.counts;
		// Check if `match` is a regular expression
		const isRegex = match instanceof RegExp;
		// Ensure the `match` parameter is a valid string or RegExp
		if ( !isRegex ) beep8.Utilities.checkString( 'match', match );


		// Iterate over all item IDs in the inventory
		for ( const id in counts ) {

			if ( !Object.hasOwn( counts, id ) ) continue;
			const count = counts[ id ];

			// Skip items with a count of 0 or less
			if ( count <= 0 ) continue;

			// Check if the item ID matches the given prefix or regex
			if (
				( isRegex && match.test( id ) ) || // If `match` is a regex, test the ID
				( !isRegex && id.includes( match ) ) // If `match` is a string, check if the ID includes it
			) {
				out.push( { id, count } );
			}
		}

		return out;

	}



} )( beep8 || ( beep8 = {} ) );
