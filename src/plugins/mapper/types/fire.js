mapper.types.fire = {

	color: 10,

	/**
	 * Spawn a fire entity on the map.
	 *
	 * @param {number} col - The tile column for the fire.
	 * @param {number} row - The tile row for the fire.
	 * @param {Object} props - Optional fire configuration overrides.
	 * @param {number} [props.lifeTurns] - Number of turns the fire should live.
	 * @param {number} [props.duration] - Legacy alias for lifeTurns.
	 * @param {number} [props.spreadTickRateTurns] - Turns between spread steps.
	 * @param {number} [props.startDelayMs] - Visual delay before the fire VFX starts.
	 * @returns {number|null} The spawned fire entity ID, or null if blocked.
	 */
	spawn: function( col, row, props = {} ) {

		// Prevent multiple fires stacking on the same tile.
		if ( mapper.hasEntityAt( col, row, 'fire' ) ) return null;

		let lifeTurns = parseInt( props.lifeTurns ?? props.duration );
		if ( lifeTurns === 0 ) {
			lifeTurns = Infinity;
		} else {
			lifeTurns = isNaN( lifeTurns ) ? mapper.CONFIG.fireLifeTurns : lifeTurns;
			lifeTurns += b8.Random.range( 0, 2 );
		}

		// Use a small random start offset for naturally spawned fire unless a
		// caller explicitly asks for an immediate visual replacement.
		const startDelayMs = Number.isFinite( props.startDelayMs ) ?
			props.startDelayMs :
			b8.Random.int( 0, 400 );

		return b8.ECS.create(
			{
				Type: { name: 'fire' },
				Loc: { col, row },
				Sprite: {
					type: 'vfx',
					id: 'fire',
					startTime: b8.Core.getNow() + startDelayMs,
					fg: mapper.types.fire.color,
					bg: 0,
				},
				Fire: {
					lifeTurns,
					spreadTickRateTurns: parseInt( props.spreadTickRateTurns ) || mapper.CONFIG.fireSpreadTurns,
					turnsUntilSpread: 0,
				},
			}
		);

	}
};
