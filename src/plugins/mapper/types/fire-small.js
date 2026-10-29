mapper.types.fireSmall = {

	/**
	 * Attach a temporary fire outline to the parent entity.
	 *
	 * @param {number} col Tile column.
	 * @param {number} row Tile row.
	 * @param {Object} [props={}] Type-specific settings read from the map object.
	 * @returns {number|undefined} New entity ID; undefined when props.parent is missing.
	 */
	spawn: function( col, row, props = {} ) {

		if ( !props.parent ) return;

		return b8.ECS.create(
			{
				Type: { name: 'fire-small' },
				Loc: { col, row },
				Sprite: {
					type: 'vfx-outline',
					id: 'fire-small',
					offsetY: -4,
					startTime: b8.Core.getNow(),
					fg: mapper.types.fire.color,
					bg: 0,
					depth: 100,
				},
				FireSmall: {
					// Store duration in seconds so the effect continues while idle.
					duration: props.duration || mapper.CONFIG.fireSmallDurationSeconds,
					parent: props.parent,
				},
			}
		);

	}
};
