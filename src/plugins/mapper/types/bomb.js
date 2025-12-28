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
				Flammable: {
					temperature: 20,
				},
			}
		);

	},


	explode: async function( bombId ) {

		const bombLoc = b8.ECS.getComponent( bombId, 'Loc' );
		const bombComp = b8.ECS.getComponent( bombId, 'Bomb' );

		// Create explosion effect
		// Loop through an area with radius and create explosion VFX
		// Also allow damage to entities in the blast radius
		// Also set fire to anything flammable in the blast radius

		// Loop through tiles in radius.
		for ( let dx = -bombComp.radius; dx <= bombComp.radius; dx++ ) {
			for ( let dy = -bombComp.radius; dy <= bombComp.radius; dy++ ) {

				console.log( 'Spawn fire', dx, dy );
				const row = bombLoc.row + dy;
				const col = bombLoc.col + dx;

				if ( !mapper.collision.isWalkable( col, row ) ) continue;

				mapper.types.fire.spawn( col, row );

			}
		}

	}

};