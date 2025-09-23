mapper.types.key = {

	spawn: function( col, row, props ) {

		return beep8.ECS.create(
			{
				Type: { name: 'key' },
				Loc: { col, row },
				Sprite: {
					tile: 255,
					fg: props.fg || 14,
					bg: props.bg || 0
				},
			}
		);

	},

	onCharacterCollision: function( id, newCol, newRow, dx, dy ) {

		const keyName = `key-${beep8.ECS.getComponent( id, 'Sprite' ).fg ?? "default"}`;
		beep8.Inventory.add( keyName );

		// console.log( 'Collect key:', keyName );

		beep8.ECS.removeEntity( id );
		beep8.Sfx.play( 'tone/bloop/006' );

		return false;

	},

};
