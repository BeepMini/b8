mapper.types.coin = {

	spawn: function( col, row, props ) {

		return beep8.ECS.create(
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

		beep8.ECS.removeEntity( id );
		beep8.Inventory.add( 'coin' );
		beep8.Sfx.play( 'game/coin/002' );

		return false;

	},

};
