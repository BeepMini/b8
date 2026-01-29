mapper.types.enemy = {

	// Properties [ health, attack, color ]
	difficulties: {
		'Easy': [ 3, 1, 11 ],
		'Medium': [ 5, 2, 9 ],
		'Hard': [ 8, 3, 8 ],
	},

	spawn: function( col, row, props = {} ) {

		const initialDirection = 'D';

		const difficulty = props.health || 'Easy';
		const [ health, attack, color ] = mapper.types.enemy.difficulties[ difficulty ] || mapper.types.enemy.difficulties[ 'Easy' ];

		/**
		 * Create enemy character entity.
		 */
		const characterProperties = {
			Type: { name: 'enemy' },
			Loc: { col, row },
			Direction: { dx: 0, dy: 1 }, // initial 'D'
			Sprite: {
				type: 'actor',
				tile: parseInt( props.actor ) || 6,
				fg: color || 15,
				bg: 0,
				depth: 50,
			},
			Solid: {},
			AI: {
				mode: mapper.ai.MODE.NONE,		// current intent: patrol|chase|attack|flee|loot|idle
				startLoc: { col, row },			// starting location for patrols
				targetId: mapper.player,		// entity id (player, item, etc)
				props: {
					canLoot: false,
					canDrop: false,
					viewRange: 5
				},
			},
			CharacterAnimation: {
				name: 'idle',
				default: 'idle',
				duration: 0,
			},
			Health: {
				value: health || 3,
				max: health || 3,
				cooldown: mapper.CONFIG.healthCooldown || 1.0,
			},
			Attack: {
				value: attack || 1
			},
			AttackTarget: {},
			Action: { ButtonA: 'attack' }
		};

		let steps = [];

		// Add PathFollower component if a path is defined
		if ( props.path && b8.Path.validPathSyntax( props.path ) ) {

			steps = b8.Path.parseCode(
				props.path,
				col,				// startCol
				row,				// startRow
				initialDirection	// initialDir
			);

			characterProperties.AI.path = steps;

		};

		const id = b8.ECS.create( characterProperties );

		return id;

	},


	setPath: function( id, steps, animationMode = null, index = 0 ) {

		// Determine animation mode if not provided.
		if ( !animationMode || animationMode === null ) {

			const Loc = b8.ECS.getComponent( id, 'Loc' );
			animationMode = b8.Path.AnimationMode.PINGPONG;

			const lastStep = steps.length - 1;
			if ( steps[ lastStep ].col === Loc.col && steps[ lastStep ].row === Loc.row ) {
				animationMode = b8.Path.AnimationMode.LOOP;
			}

		}

		// Set PathFollower component.
		b8.ECS.setComponent(
			id,
			'PathFollower',
			{
				steps,
				index,
				mode: animationMode,
				dirStep: 1,
				timer: 0,
				startDir: 'D',
			}
		);

	}

};
