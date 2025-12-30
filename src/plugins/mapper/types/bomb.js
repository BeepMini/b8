mapper.types.bomb = {

	color: 8,
	flickerColor: 15,

	spawn: function( col, row, props = {} ) {

		return b8.ECS.create(
			{
				Type: { name: 'bomb' },
				Loc: { col, row },
				Sprite: {
					tile: 283,
					fg: mapper.types.bomb.color,
					bg: 0,
					depth: 10
				},
				Solid: {},
				Pushable: {},
				Action: {
					ButtonB: 'pull',
					ButtonA: 'ignite'
				},
				Bomb: {
					fuseTime: false,
					radius: parseInt( props.radius ) || 1,
					damage: 2,
				},
			}
		);

	},


	/**
	 * Handle bomb explosion.
	 *
	 * @param {number} bombId - The entity ID of the bomb.
	 * @returns {Promise<void>} Resolves when the explosion is complete.
	 */
	explode: async function( bombId ) {

		const bombLoc = b8.ECS.getComponent( bombId, 'Loc' );
		const bombComp = b8.ECS.getComponent( bombId, 'Bomb' );

		// Create explosion effect
		// Loop through tiles in radius.
		for ( let dx = -bombComp.radius; dx <= bombComp.radius; dx++ ) {
			for ( let dy = -bombComp.radius; dy <= bombComp.radius; dy++ ) {

				const row = bombLoc.row + dy;
				const col = bombLoc.col + dx;

				// Spawn fire only on walkable tiles.
				if ( !mapper.collision.isWalkable( col, row ) ) continue;
				mapper.types.fire.spawn( col, row );

			}
		}

	},



	burnHandler: function( id ) {

		const bomb = b8.ECS.getComponent( id, 'Bomb' );

		if ( bomb.fuseTime !== false ) return;

		bomb.fuseTime = 2;

	},

};