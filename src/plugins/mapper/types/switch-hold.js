mapper.types.switchHold = {

	/**
	 * Spawn a hold-style pressure plate.
	 *
	 * Hold switches remain active only while something is standing on them. The
	 * pressure-plate system updates the linked target every frame.
	 *
	 * @param {number} col The map column.
	 * @param {number} row The map row.
	 * @param {Object} props Saved object properties from the map editor.
	 * @returns {number} The created entity ID.
	 */
	spawn: function( col, row, props = {} ) {

		return b8.ECS.create(
			{
				Type: { name: 'switchHold' },
				Loc: { col, row },
				Sprite: {
					tile: 254,
					fg: props.fg || 10,
					bg: props.bg || 0,
					depth: 1,
				},
				TriggerTarget: {
					name: props.name || null,
					target: props.target || '',
					action: props.action || 'open',
					active: false,
					requires: props.requires || 'Player or Pushable',
				},
				PressurePlate: {
					requires: props.requires || 'Player or Pushable',
				},
			}
		);

	},

};
