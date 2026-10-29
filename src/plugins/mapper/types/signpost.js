mapper.types.signpost = {

	/**
	 * Spawn a solid signpost with readable and triggerable message actions.
	 *
	 * @param {number} col Tile column.
	 * @param {number} row Tile row.
	 * @param {Object} [props={}] Type-specific settings read from the map object.
	 * @returns {number} The new entity ID.
	 */
	spawn: function( col, row, props = {} ) {

		return b8.ECS.create(
			{
				Type: { name: 'signpost' },
				Loc: { col, row },
				Sprite: {
					tile: props.icon || 252,
					fg: props.fg || 15,
					bg: props.bg || 0
				},
				Solid: {},
				Message: { message: props.message || "" },
				Action: {
					ButtonA: 'trigger',
					ButtonB: 'read'
				},
			}
		);

	},


	/**
	 * Handle the signpost being triggered (Button A).
	 *
	 * @param {number} playerId - Acting player entity ID; unused by this handler.
	 * @param {number} id - The entity ID of the signpost.
	 * @returns {void}
	 */
	triggerHandler: function( playerId, id ) {

		const sprite = b8.ECS.getComponent( id, 'Sprite' );

		// Quit if not the default signpost.
		if ( sprite.tile !== 252 ) return;

		// Make the cut in half signpost.
		sprite.tile = 270;

		// Return if no message to change.
		if ( !b8.ECS.hasComponent( id, 'Message' ) ) return;

		const message = b8.ECS.getComponent( id, 'Message' );

		// Change both actions to 'read'.
		b8.ECS.addComponent( id, 'Action', { ButtonA: 'read', ButtonB: 'read' } );

		// Truncate the front half of the message and prepend ...
		message.message = '... ' + message.message.slice( Math.floor( message.message.length / 2 ) );

	},

};
