mapper.actions.attack = ( playerId ) => {

	const ahead = mapper.ahead( playerId );
	const ids = mapper.entitiesAhead( playerId );

	for ( const targetId of ids ) {

		// Don't attack self.
		if ( targetId === playerId ) continue;

		// Only attack entities that can be attacked.
		if ( !b8.ECS.hasComponent( targetId, 'AttackTarget' ) ) continue;

		// Apply damage to the target.
		const targetHealth = b8.ECS.getComponent( targetId, 'Health' );
		const playerAttack = b8.ECS.getComponent( playerId, 'Attack' ) || { value: 1 };
		targetHealth.value -= playerAttack.value;

		// Check if target is defeated.
		if ( targetHealth.value <= 0 ) {

			// Remove the target entity.
			b8.ECS.removeEntity( targetId );

			// Spawn defeat VFX.
			mapper.types.vfx.spawn(
				ahead.x, ahead.y,
				{ id: 'skull', fg: 2, bg: 0, offsetTime: 200 }
			);

			// Small pause on defeat.
			mapper.updateMoveDelay( 0.6 );

			return;

		}

		// Only attack one target at a time.
		break;

	}

};