mapper.types.pickup = {

	/**
	 * Spawn a consumable reward with a sprite and type-specific pickup properties.
	 *
	 * @param {number} col Tile column.
	 * @param {number} row Tile row.
	 * @param {Object} [props={}] Type-specific settings read from the map object.
	 * @returns {number|undefined} New entity ID; undefined when props.type is missing.
	 */
	spawn: function( col, row, props = {} ) {

		if ( !props.type ) return;

		return b8.ECS.create(
			{
				Type: { name: 'pickup' },
				Loc: { col, row },
				Sprite: {
					tile: props.Sprite.tile ?? 415,
					fg: props.Sprite.fg ?? 8,
					bg: props.Sprite.bg ?? 0
				},
				Pickup: {
					// 'health', 'coin', 'key', etc
					type: props.type,
					// remove after pickup
					consume: props.consume ?? true,
					// Custom attributes for handler function
					props: props.props || {}
				},
			}
		);

	},

};
