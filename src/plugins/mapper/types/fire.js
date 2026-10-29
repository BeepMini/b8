mapper.types.fire = {

	color: 10,

	/**
	 * Spawn a fire entity on the map.
	 *
	 * @param {number} col - The tile column for the fire.
	 * @param {number} row - The tile row for the fire.
	 * @param {Object} [props={}] - Optional fire configuration overrides.
	 * @param {number} [props.duration] - Seconds the fire should live.
	 * @param {number} [props.startDelayMs] - Visual delay before the fire VFX starts.
	 * @returns {number|null} The spawned fire entity ID, or null if blocked.
	 */
	spawn: function( col, row, props = {} ) {

		// Prevent multiple fires stacking on the same tile.
		if ( mapper.hasEntityAt( col, row, 'fire' ) ) return null;

		let duration = parseFloat( props.duration );
		if ( duration === 0 ) {
			duration = Infinity;
		} else {
			duration = isNaN( duration ) ? mapper.CONFIG.fireLifetimeSeconds : duration;
			duration += b8.Random.range( 0, 2 );
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
				// A named fire can be addressed by switches and pressure plates in
				// exactly the same way as a named door.
				TriggerTarget: {
					name: props.name || null,
				},
				Sprite: {
					type: 'vfx',
					id: 'fire',
					startTime: b8.Core.getNow() + startDelayMs,
					fg: mapper.types.fire.color,
					bg: 0,
					visible: true,
				},
				Fire: {
					duration,
					// Keep the original lifetime so reigniting a finite fire starts a
					// fresh burn rather than resuming an expired timer.
					initialDuration: duration,
					active: true,
				},
			}
		);

	}
};
