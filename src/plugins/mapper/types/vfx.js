mapper.types.vfx = {

	/**
	 * Spawn a timed visual effect with optional sprite offsets and colours.
	 *
	 * @param {number} col Tile column.
	 * @param {number} row Tile row.
	 * @param {Object} [props={}] Type-specific settings read from the map object.
	 * @returns {number|Object} New entity ID, or an empty object when props.id is missing.
	 */
	spawn: function( col, row, props = {} ) {

		if ( !props.id ) return {};

		return b8.ECS.create(
			{
				Type: { name: 'vfx' },
				Loc: { col, row },
				Vfx: {},
				Sprite: {
					type: props.type || 'vfx',
					id: props.id,
					startTime: b8.Core.getNow() + ( props.offsetTime || 0 ),
					fg: parseInt( props.fg ) || 15,
					bg: parseInt( props.bg ) || 0,
					nudgeCol: parseInt( props.nudgeCol ) || 0,
					nudgeRow: parseInt( props.nudgeRow ) || 0,
					depth: 101,
				},
			}
		);

	},

};
