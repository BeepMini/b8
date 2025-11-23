mapper.helpers = {

	/**
	 * Capitalize the first letter of each word in a string.
	 *
	 * @param {string} str Input string
	 * @returns {string} Capitalized string
	 */
	capitalizeWords: ( str ) => {

		return str.replace( /\b\p{L}/gu, c => c.toUpperCase() )

	},


	/**
	 * Process chat text, replacing tokens with dynamic values.
	 *
	 * @param {string} str Input string
	 * @returns {string} Processed string
	 */
	processChatText: ( str ) => {

		// Replace [levelName] with the actual level name.
		str = str.replace( /\[levelName\]/g, b8.data.levelName ?? 'Unknown' );

		// Replace [playerName] with the actual player name.
		str = str.replace( /\[playerName\]/g, b8.data.playerName ?? 'Player' );

		// Replace [totalCoins] with the actual total coins value.
		str = str.replace( /\[totalCoins\]/g, b8.data.totalCoins ?? '0' );

		return str;

	},


	/**
	 * Get all map objects of a given type.
	 *
	 * @param {string} type The object type to search for.
	 * @returns {Object[]} Array of matching objects.
	 */
	getObjectsByType: ( type ) => {

		const objects = [];

		for ( let l = 0; l < mapper.maps.length; l++ ) {
			const map = mapper.maps[ l ];
			for ( const obj of map.objects ) {
				// Support type prefixes, e.g., "door" matches "doorway", "doorLarge", etc.
				if ( obj.type.startsWith( type ) ) objects.push( obj );
			}
		}

		return objects;

	},

}