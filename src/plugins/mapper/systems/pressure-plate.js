/**
 * Update pressure plate sprites and targets when qualifying occupancy changes.
 *
 * @returns {void} Updates entity components in place.
 */
mapper.systems.pressurePlate = function() {

	/**
	 * Check whether a given entity satisfies the occupancy rule for a pressure
	 * plate.
	 *
	 * @param {number} entityId The entity standing on the pressure plate tile.
	 * @param {string} requires The plate requirement mode.
	 * @returns {boolean} True when the entity should count as pressure.
	 */
	const matchesRequirement = ( entityId, requires ) => {

		const type = b8.ECS.getComponent( entityId, 'Type' );
		if ( !type ) return false;

		if ( requires === 'Pushable Only' ) {
			return b8.ECS.hasComponent( entityId, 'Pushable' );
		}

		return type.name === 'player' || b8.ECS.hasComponent( entityId, 'Pushable' );

	};

	for ( const id of b8.ECS.query( 'PressurePlate', 'TriggerTarget', 'Loc', 'Sprite' ) ) {

		const loc = b8.ECS.getComponent( id, 'Loc' );
		const sprite = b8.ECS.getComponent( id, 'Sprite' );
		const plate = b8.ECS.getComponent( id, 'PressurePlate' );
		const trigger = b8.ECS.getComponent( id, 'TriggerTarget' );

		const occupied = b8.ECS.entitiesAt( loc.col, loc.row ).some(
			( entityId ) => {
				if ( entityId === id ) return false;
				return matchesRequirement( entityId, plate.requires );
			}
		);

		if ( occupied === trigger.active ) {
			continue;
		}

		trigger.active = occupied;
		sprite.fg = occupied ? 14 : 10;

		mapper.helpers.applySwitchActionByName(
			trigger.target,
			trigger.action,
			occupied
		);

	}

};
