mapper.types.chestOpen = {

	/**
	 * Spawn an opened chest, optionally retaining a readable message.
	 *
	 * @param {number} col Tile column.
	 * @param {number} row Tile row.
	 * @param {Object} [props={}] Type-specific settings read from the map object.
	 * @returns {number} The new entity ID.
	 */
	spawn: function( col, row, props = {} ) {

		const entitySettings = {
			Type: { name: 'chest' },
			Loc: { col, row },
			Sprite: {
				tile: 271,
				fg: props.fg || 15,
				bg: props.bg || 0,
				depth: 10
			},
			Solid: {},
		};

		if ( props.message ) {
			entitySettings.Message = { message: props.message };
			entitySettings.Action = {
				ButtonA: 'read',
				ButtonB: 'read'
			};
		}

		return b8.ECS.create( entitySettings );

	},

};
