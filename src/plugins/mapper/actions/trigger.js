/**
 * A generic action trigger handler.
 *
 * Will execute the handleTrigger logic for each entity in front of the player.
 * This can be used for any random one off properties with the code added to the
 * entity type's handleTrigger function.
 *
 * @param {number} playerId - The entity ID of the player.
 * @returns {void}
 */
mapper.actions.trigger = function( playerId ) {

	const ids = mapper.entitiesAhead( playerId );

	for ( const targetId of ids ) {

		const type = b8.ECS.getComponent( targetId, 'Type' );

		if ( mapper.types[ type.name ]?.triggerHandler ) {
			mapper.types[ type.name ].triggerHandler( playerId, targetId );
		}

	}

};

