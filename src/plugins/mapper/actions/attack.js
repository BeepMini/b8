mapper.actions.attack = ( playerId ) => {

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

	}

};