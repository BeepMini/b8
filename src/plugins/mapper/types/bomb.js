mapper.types.bomb = {

	spawn: function( col, row, props ) {

		return b8.ECS.create(
			{
				Type: { name: 'bomb' },
				Loc: { col, row },
				Sprite: {
					tile: 283,
					fg: 5,
					bg: 0,
					depth: 10
				},
				Solid: {},
				Pushable: {},
				Action: { ButtonB: 'pull', ButtonA: 'ignite' },
				Bomb: {
					timer: parseInt( props.timer ) || 3,
					radius: parseInt( props.radius ) || 1,
					damage: parseInt( props.damage ) || 5,
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

		// Play sound effect
		b8.Sfx.play( 'explosion/large/001' );

	},

};