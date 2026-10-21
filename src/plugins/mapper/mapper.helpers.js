mapper.helpers = {

	/**
	 * Capitalize the first letter of each word in a string.
	 *
	 * @param {string} str Input string
	 * @returns {string} Capitalized string
	 */
	capitalizeWords: ( str ) => {

		return str.replace( /\b\p{L}/gu, c => c.toUpperCase() )

	},


	/**
	 * Process chat text, replacing tokens with dynamic values.
	 *
	 * @param {string} str Input string
	 * @returns {string} Processed string
	 */
	processChatText: ( str ) => {

		// Replace [levelName] with the actual level name.
		str = str.replace( /\[levelName\]/g, b8.data.levelName ?? 'Unknown' );

		// Replace [playerName] with the actual player name.
		str = str.replace( /\[playerName\]/g, b8.data.playerName ?? 'Player' );

		// Replace [totalCoins] with the actual total coins value.
		str = str.replace( /\[totalCoins\]/g, b8.data.totalCoins ?? '0' );

		return str;

	},


	/**
	 * Get all map objects of a given type.
	 *
	 * @param {string} type The object type to search for.
	 * @returns {Object[]} Array of matching objects.
	 */
	getObjectsByType: ( type ) => {

		const objects = [];

		for ( let l = 0; l < mapper.maps.length; l++ ) {
			const map = mapper.maps[ l ];
			for ( const obj of map.objects ) {
				// Support type prefixes, e.g., "door" matches "doorway", "doorLarge", etc.
				if ( obj.type.startsWith( type ) ) objects.push( obj );
			}
		}

		return objects;

	},


	/**
	 * Find all active entity IDs in the current map that expose a matching
	 * trigger target name.
	 *
	 * Different entity types can store their name in different components. This
	 * helper gives switches one place to look up a target without needing to know
	 * how each target type stores its identity.
	 *
	 * @param {string} targetName The named target to search for.
	 * @returns {number[]} Matching active entity IDs.
	 */
	findNamedEntitiesInCurrentMap: ( targetName ) => {

		if ( !targetName ) {
			return [];
		}

		const matches = [];

		for ( const entityId of b8.ECS.getAllEntities() ) {

			const portal = b8.ECS.getComponent( entityId, 'Portal' );
			if ( portal?.name === targetName ) {
				matches.push( entityId );
				continue;
			}

			const triggerTarget = b8.ECS.getComponent( entityId, 'TriggerTarget' );
			if ( triggerTarget?.name === targetName ) {
				matches.push( entityId );
			}

		}

		return matches;

	},


	/**
	 * Apply a switch action to a named target entity.
	 *
	 * Hold switches pass `isActive` so targets can react to both press and
	 * release. Toggle switches only call this on the trigger edge.
	 *
	 * @param {number} targetId The entity to affect.
	 * @param {string} action The requested switch action.
	 * @param {boolean} isActive Whether the switch is currently active.
	 * @returns {void}
	 */
	applySwitchActionToEntity: ( targetId, action, isActive = true ) => {

		const type = b8.ECS.getComponent( targetId, 'Type' );
		if ( !type ) return;

		switch ( action ) {

			case 'open':
				if ( type.name === 'door' ) {
					if ( isActive ) {
						mapper.types.door.openDoor( targetId );
					} else {
						mapper.types.door.closeDoor( targetId );
					}
				}
				break;

			case 'toggle':
				if ( type.name === 'door' ) {
					if ( b8.ECS.hasComponent( targetId, 'Solid' ) ) {
						mapper.types.door.openDoor( targetId );
					} else {
						mapper.types.door.closeDoor( targetId );
					}
				}
				if ( type.name === 'fire' ) {
					const fire = b8.ECS.getComponent( targetId, 'Fire' );
					mapper.helpers.setFireActive( targetId, fire?.active === false );
				}
				break;

			case 'ignite':
				if ( type.name === 'fire' ) {
					mapper.helpers.setFireActive( targetId, isActive );
				}
				break;

			case 'extinguish':
				if ( type.name === 'fire' ) {
					mapper.helpers.setFireActive( targetId, !isActive );
				}
				break;

		}

		},


	/**
	 * Turn a fire on or off while preserving its entity and target name.
	 *
	 * @param {number} fireId The fire entity to update.
	 * @param {boolean} isActive Whether the fire should burn.
	 * @returns {void}
	 */
	setFireActive: ( fireId, isActive ) => {

		const fire = b8.ECS.getComponent( fireId, 'Fire' );
		const sprite = b8.ECS.getComponent( fireId, 'Sprite' );
		if ( !fire || !sprite ) return;

		// Treat maps created before fire switch support as initially lit.
		if ( fire.active === undefined ) fire.active = true;
		if ( fire.initialDuration === undefined ) fire.initialDuration = fire.duration;
		if ( fire.active === isActive ) return;

		fire.active = isActive;
		sprite.visible = isActive;

		if ( isActive ) {
			fire.duration = fire.initialDuration;
			sprite.startTime = b8.Core.getNow();
		}

	},


	/**
	 * Apply a switch action to every active entity with the requested name.
	 *
	 * @param {string} targetName The named target to affect.
	 * @param {string} action The requested switch action.
	 * @param {boolean} isActive Whether the switch is currently active.
	 * @returns {void}
	 */
	applySwitchActionByName: ( targetName, action, isActive = true ) => {

		const ids = mapper.helpers.findNamedEntitiesInCurrentMap( targetName );

		ids.forEach(
			( targetId ) => {
				mapper.helpers.applySwitchActionToEntity( targetId, action, isActive );
			}
		);

	},

}
