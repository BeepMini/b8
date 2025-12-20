mapper.actions.open = async function( playerId ) {

	const entities = mapper.entitiesAhead( playerId );

	for ( const id of entities ) {

		const obj = b8.ECS.getComponent( id, 'Openable' );
		const sprite = b8.ECS.getComponent( id, 'Sprite' );

		if ( !obj || !sprite ) continue;

		// Change the tile.
		if ( obj.openedTile ) sprite.tile = obj.openedTile;

		// Play sound effect.
		b8.Sfx.play( 'tone/jingle/017' );

		// Rewards.
		const rewards = b8.ECS.getComponent( id, 'Reward' );
		mapper.giveRewards( playerId, rewards.items || [] );

		// Clean up components.
		b8.ECS.removeComponent( id, 'Reward' );
		b8.ECS.removeComponent( id, 'Action' );
		b8.ECS.removeComponent( id, 'Openable' );

		// If message then change the entity to a Signpost entity and change the
		// action verb to read.
		const messageComp = b8.ECS.getComponent( id, 'Message' );
		if ( messageComp && messageComp.message.length > 0 ) {
			b8.ECS.addComponent( id, 'Type', { name: 'signpost' } );
			b8.ECS.addComponent( id, 'Action', { verb: 'read' } );
		}

		mapper.delayKeyPress();

		return;

	}

};