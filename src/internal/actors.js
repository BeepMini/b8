( function( beep8 ) {

	beep8.Actors = {};


	/**
	 * Draw an actor at the current cursor position.
	 *
	 * @param {number} ch The character to draw.
	 * @param {number} frame The frame to draw.
	 * @param {number} direction The direction to draw the actor in. 0 = right, 1 = left.
	 * @returns {void}
	 */
	beep8.Actors.draw = function( ch, frame, direction = 0 ) {

		beep8.Utilities.checkInt( "ch", ch );
		beep8.Utilities.checkInt( "frame", frame );

		const font = beep8.Core.textRenderer.curActors_;

		const chrIndex = ( ch * font.getColCount() ) + frame;

		beep8.Core.textRenderer.put_(
			chrIndex,
			beep8.Core.drawState.cursorCol,
			beep8.Core.drawState.cursorRow,
			beep8.Core.drawState.fgColor,
			beep8.Core.drawState.bgColor,
			font,
			direction
		);

	};


	/**
	 * Animate an actor.
	 *
	 * No idea how I will do this yet, but I will figure it out.
	 *
	 * @param {number} ch The character to animate.
	 * @param {number[]} frames The frames to animate.
	 * @param {number} direction The direction to animate the actor in. 0 = right, 1 = left.
	 * @returns {void}
	 */
	beep8.Actors.animate = function( ch, frames = null, direction = 0 ) {

		beep8.Utilities.checkInt( "ch", ch );
		beep8.Utilities.checkArray( "frames", frames );

	};

} )( beep8 || ( beep8 = {} ) );
