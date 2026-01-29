mapper.types.player = {

	spawn: function( col = 0, row = 0, props = {} ) {

		const player = b8.ECS.create(
			{
				Type: { name: 'player' },
				Loc: { row: row || 0, col: col || 0 },
				Direction: { dx: 0, dy: 1 },
				Sprite: {
					type: 'actor',
					tile: parseInt( mapper.settings.character ) || 6,
					fg: parseInt( mapper.settings.characterColor ) || 10,
					bg: 0,
					depth: 100,
				},
				Solid: {},
				CharacterAnimation: {
					name: 'idle',
					default: 'idle',
					duration: 0,
				},
				Health: {
					cooldown: mapper.CONFIG.healthCooldown || 1.0,
					value: 6,
					max: 12
				},
				Attack: {
					value: 1
				},
				AttackTarget: {},
				Action: { ButtonA: 'attack' },
			}
		);

		return player;

	}

}