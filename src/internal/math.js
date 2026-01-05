( function( b8 ) {

	b8.Math = {};


	/**
	 * Calculates a 2D distance between points (x0, y0) and (x1, y1).
	 *
	 * @param {number} x0 - The x-coordinate of the first point.
	 * @param {number} y0 - The y-coordinate of the first point.
	 * @param {number} x1 - The x-coordinate of the second point.
	 * @param {number} y1 - The y-coordinate of the second point.
	 * @returns {number} The distance between the two points.
	 */
	b8.Math.dist2D = function( x0, y0, x1, y1 ) {

		b8.Utilities.checkNumber( "x0", x0 );
		b8.Utilities.checkNumber( "y0", y0 );
		b8.Utilities.checkNumber( "x1", x1 );
		b8.Utilities.checkNumber( "y1", y1 );

		const dx = x0 - x1;
		const dy = y0 - y1;

		return Math.sqrt( dx * dx + dy * dy );

	}


	/**
	 * Calculate the Manhattan distance between two locations.
	 *
	 * The Manhattan distance is the sum of the absolute differences
	 * of their Cartesian coordinates. It represents the distance
	 * traveled along axes at right angles (like navigating a grid). It's not
	 * a straight-line distance, but rather the total number of steps required
	 * to move from one point to another when only moving horizontally and
	 * vertically.
	 *
	 * @param {Object} a - The first location with col and row properties.
	 * @param {Object} b - The second location with col and row properties.
	 * @returns {number} The Manhattan distance between the two locations.
	 */
	b8.Math.distManhattan = function( a, b ) {

		return Math.abs( a.col - b.col ) + Math.abs( a.row - b.row );

	};


	/**
	 * Linearly interpolates between two values.
	 *
	 * @param {number} a - The start value.
	 * @param {number} b - The end value.
	 * @param {number} t - The interpolation factor (0.0 to 1.0).
	 * @returns {number} The interpolated value.
	 */
	b8.Math.lerp = function( a, b, t ) {

		return a + ( b - a ) * t;

	}


	/**
	 * A smoothing function for interpolation.
	 *
	 * This is Perlin's classic fade function 6t^5 - 15t^4 + 10t^3.
	 * It eases coordinate values so that they will ease towards integral values.
	 * This ends up smoothing the final output.
	 *
	 * @param {number} t - The interpolation factor (0.0 to 1.0).
	 * @returns {number} The smoothed interpolation factor.
	 */
	b8.Math.fade = function( t ) {

		return t * t * t * ( t * ( t * 6 - 15 ) + 10 );

	}


	/**
	 * A simpler smoothing function for interpolation.
	 *
	 * This is the smoothstep function 3t^2 - 2t^3.
	 * It eases coordinate values so that they will ease towards integral values.
	 * This ends up smoothing the final output.
	 *
	 * @param {number} t - The interpolation factor (0.0 to 1.0).
	 * @returns {number} The smoothed interpolation factor.
	 */
	b8.Math.smoothstep = function( t ) {

		return t * t * ( 3 - 2 * t );

	}


	// Ken Perlin's quintic fade (smoother than smoothstep)
	function fade( t ) {

		return t * t * t * ( t * ( t * 6 - 15 ) + 10 );

	}


} )( b8 );
