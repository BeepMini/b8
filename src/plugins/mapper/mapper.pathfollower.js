// Namespace for shared data + helpers
mapper.pathFollower = {

	DIRS: {
		U: { dx: 0, dy: -1 },
		D: { dx: 0, dy: 1 },
		L: { dx: -1, dy: 0 },
		R: { dx: 1, dy: 0 },
	},

	VEC_TO_DIR: null,

	animationMap: {
		U: "move-up",
		D: "move-down",
		L: "move-left",
		R: "move-right",
		FU: "idle-up",
		FD: "idle-down",
		FL: "idle-left",
		FR: "idle-right",
	},

	animationInverse: {
		U: "D",
		D: "U",
		L: "R",
		R: "L",
		FU: "FD",
		FD: "FU",
		FL: "FR",
		FR: "FL",
	},


	/**
	 * Initialize the path follower module.
	 *
	 * @returns {void}
	 */
	init: function() {

		mapper.pathFollower.VEC_TO_DIR = Object.fromEntries(
			Object.entries( mapper.pathFollower.DIRS )
				.map( ( [ dir, v ] ) => [ `${v.dx},${v.dy}`, dir ] )
		);

		console.log( mapper.pathFollower.VEC_TO_DIR );

	},


	/**
	 * Advance the path index based on the current mode.
	 *
	 * @param {Object} pf - The PathFollower component.
	 * @returns {void}
	 */
	advancePathIndex: function( pf ) {

		const last = pf.steps.length - 1;

		switch ( pf.mode ) {
			case b8.Path.AnimationMode.ONCE:
				if ( pf.index < last ) pf.index++;
				break;

			case b8.Path.AnimationMode.LOOP:
				pf.index = ( pf.index + 1 ) % pf.steps.length;
				break;

			case b8.Path.AnimationMode.PINGPONG:
			default:
				if ( pf.index === 0 ) pf.dirStep = 1;
				else if ( pf.index === last ) pf.dirStep = -1;

				pf.index += pf.dirStep;
				break;
		}

	},


	/**
	 * Get the facing direction string from a vector.
	 *
	 * @param {Object} vec - The direction vector with `dx` and `dy`.
	 * @returns {string|undefined} The direction string (e.g., 'U', 'D', 'L', 'R') or undefined if not found.
	 */
	getFaceDirection: function( vec ) {

		return mapper.pathFollower.VEC_TO_DIR[ `${vec.dx},${vec.dy}` ];

	},

};

mapper.pathFollower.init();
