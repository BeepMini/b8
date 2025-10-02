mapper.types.key = {

	spawn: function( col, row, props ) {

		return b8.ECS.create(
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

		const keyName = `key-${b8.ECS.getComponent( id, 'Sprite' ).fg ?? "default"}`;
		b8.Inventory.add( keyName );

		// console.log( 'Collect key:', keyName );

		b8.ECS.removeEntity( id );
		b8.Sfx.play( 'tone/bloop/006' );

		return false;

	},

};
