mapper.types.skeleton = {

	/**
	 * Create an empty entity as a template for a new Mapper type.
	 *
	 * @param {number} col Tile column.
	 * @param {number} row Tile row.
	 * @param {Object} [props={}] Unused; accepted for the shared spawn interface.
	 * @returns {number} The new entity ID.
	 */
	spawn: function( col, row, props = {} ) {

		return b8.ECS.create(
			{


			}
		);

	},

	/**
	 * Template pickup hook for rewards.
	 *
	 * @param {number} playerId Player entity ID.
	 * @param {Object} pickup Pickup component.
	 * @returns {void}
	 */
	pickupHandler: function( playerId, pickup ) {
	},

	/**
	 * Template hook for a triggered interaction.
	 *
	 * @param {number} playerId Player entity ID.
	 * @param {number} id Triggered entity ID.
	 * @returns {void}
	 */
	triggerHandler: function( playerId, id ) {
	},

	/**
	 * Template collision hook; supply movement handling for the new type.
	 *
	 * @param {number} id Door entity ID.
	 * @param {number} newCol Destination tile column.
	 * @param {number} newRow Destination tile row.
	 * @param {number} dx Horizontal movement direction.
	 * @param {number} dy Vertical movement direction.
	 * @returns {void} No default collision behavior.
	 */
	onCharacterCollision: function( id, newCol, newRow, dx, dy ) {
	},

	/**
	 * Template hook for an entity affected by fire.
	 *
	 * @param {number} id Burning entity ID.
	 * @param {Object} fire Fire component supplied by the flammable system.
	 * @returns {void}
	 */
	burnHandler: function( id, fire ) {
	},

};
