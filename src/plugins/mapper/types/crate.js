mapper.types.crate = {

	/**
	 * Spawn a solid, pushable crate that can catch fire.
	 *
	 * @param {number} col Tile column.
	 * @param {number} row Tile row.
	 * @param {Object} [props={}] Type-specific settings read from the map object.
	 * @returns {number} The new entity ID.
	 */
	spawn: function( col, row, props = {} ) {

		return b8.ECS.create(
			{
				Type: { name: 'crate' },
				Loc: { col, row },
				Sprite: {
					tile: 352,
					fg: props.fg || 15,
					bg: props.bg || 0,
					depth: 10
				},
				Solid: {},
				Pushable: {},
				Action: { ButtonB: 'pull' },
				Flammable: {
					temperature: 20,
				}
			}
		);

	},

};
