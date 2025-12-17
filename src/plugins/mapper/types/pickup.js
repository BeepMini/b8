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
