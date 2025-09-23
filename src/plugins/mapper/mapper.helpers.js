mapper.helpers = {

	capitalizeWords: ( str ) => {
		return str.replace( /\b\p{L}/gu, c => c.toUpperCase() )
	},

}