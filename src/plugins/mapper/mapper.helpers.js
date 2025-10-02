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

}