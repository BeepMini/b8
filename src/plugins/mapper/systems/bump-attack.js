mapper.systems.bumpAttack = function( dt ) {

	const ids = b8.ECS.query( 'BumpAttack' );

	for ( const id of ids ) {

		const bump = b8.ECS.getComponent( id, 'BumpAttack' );
		const targetId = bump.targetId;

		if ( !b8.ECS.hasComponent( targetId, 'Health' ) ) {
			// Target has no health, remove BumpAttack component.
			b8.ECS.removeComponent( id, 'BumpAttack' );
			continue;
		}

		const targetHealth = b8.ECS.getComponent( targetId, 'Health' );

		// Simple attack logic: reduce target health by attacker's attack value.
		const attackerAttack = b8.ECS.getComponent( id, 'Attack' ) || { value: 1 };
		targetHealth.value -= attackerAttack.value;

		// Check if target is defeated.
		if ( targetHealth.value <= 0 ) {
			b8.ECS.removeEntity( targetId );
		}

		// Remove BumpAttack component after processing.
		b8.ECS.removeComponent( id, 'BumpAttack' );

	}

};

