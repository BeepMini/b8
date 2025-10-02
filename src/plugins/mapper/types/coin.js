mapper.types.coin = {

	spawn: function( col, row, props ) {

		return b8.ECS.create(
			{
				Type: { name: 'coin' },
				Loc: { col, row },
				Sprite: {
					tile: parseInt( mapper.settings.coin ) || 266,
					fg: props.fg || 14,
					bg: props.bg || 0
				},
			}
		);

	},

	onCharacterCollision: function( id ) {

		b8.ECS.removeEntity( id );
		b8.Inventory.add( 'coin' );
		b8.Sfx.play( 'game/coin/002' );

		return false;

	},

};
