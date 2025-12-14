mapper.types.pickup = {

	spawn: function( col, row, props = {} ) {

		if ( !props.type ) return;

		return b8.ECS.create(
			{
				Type: { name: 'pickup' },
				Loc: { col, row },
				Sprite: {
					tile: props.Sprite.tile ?? 415,
					fg: props.Sprite.fg ?? 8,
					bg: props.Sprite.bg ?? 0
				},
				Pickup: {
					// 'health', 'coin', 'key', etc
					kind: props.type,
					// remove after pickup
					consume: props.consume ?? true,
					// Custom attributes for handler function
					atts: props.atts || {}
				},
			}
		);

	},

};


mapper.pickupHandlers = {

	health: function( playerId, pickup ) {

		const health = b8.ECS.getComponent( playerId, 'Health' );
		health.value = Math.min( health.max, health.value + ( pickup.atts.amount || 1 ) );

	},

	coin: function( playerId, pickup ) {

		b8.Inventory.add( 'coin' );
		b8.Sfx.play( 'game/coin/002' );

	},

	key: function( playerId, pickup ) {

		const inv = b8.ECS.get( playerId, 'Inventory' );
		( inv.keys ||= new Set() ).add( pickup.keyId );

	},

};
