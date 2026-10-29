mapper.types.switchToggle = {

	/**
	 * Spawn a standard toggle switch.
	 *
	 * Toggle switches activate when the player triggers them manually and then
	 * stay in their new state until triggered again.
	 *
	 * @param {number} col The map column.
	 * @param {number} row The map row.
	 * @param {Object} [props={}] Saved object properties from the map editor.
	 * @returns {number} The created entity ID.
	 */
	spawn: function( col, row, props = {} ) {

		return b8.ECS.create(
			{
				Type: { name: 'switchToggle' },
				Loc: { col, row },
				Sprite: {
					tile: 82,
					fg: props.fg || 10,
					bg: props.bg || 0,
				},
				Solid: {},
				Action: {
					ButtonA: 'trigger',
				},
				TriggerTarget: {
					name: props.name || null,
					target: props.target || '',
					action: props.action || 'toggle',
					active: false,
					message: props.message || '',
				},
			}
		);

	},


	/**
	 * Toggle the switch and apply its configured action to the named target.
	 *
	 * @param {number} playerId The player using the switch.
	 * @param {number} id The switch entity ID.
	 * @returns {void}
	 */
	triggerHandler: function( playerId, id ) {

		const trigger = b8.ECS.getComponent( id, 'TriggerTarget' );
		const sprite = b8.ECS.getComponent( id, 'Sprite' );

		if ( !trigger || !sprite ) return;

		trigger.active = !trigger.active;
		sprite.fg = trigger.active ? 14 : 10;

		mapper.helpers.applySwitchActionByName(
			trigger.target,
			trigger.action,
			trigger.active
		);

		if ( trigger.message ) {
			b8.Dialog.show( mapper.helpers.processChatText( trigger.message ) );
		}

		b8.Sfx.play( 'ui/click/004' );

	},

};
