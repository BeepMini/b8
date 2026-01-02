mapper.types.chest = {

	items: {
		0: 'Empty',
		1: 'Key',
		2: 'Coin',
		3: '10 Coins',
		4: '50 Coins',
		5: 'Half Heart',
		6: 'Heart',
		7: 'Full Heart',
		// 4: '1 Bomb',
		// 5: '5 Bombs',
	},

	messages: {
		0: "The chest is empty.",
		1: "You found a key!",
		2: "You found a coin!",
		3: "You found 10 coins!",
		4: "You found 50 coins!",
		5: "You found a half heart!",
		6: "You found a heart!",
		7: "You found a full heart!",
		// 4: "You found a bomb!",
		// 5: "You found 5 bombs!",
	},


	spawn: function( col, row, props = {} ) {

		let items = [];
		let foregroundColor = props.fg || 15;
		let containsType = '';

		if ( mapper.types.chest.items[ props.contains ] ) {
			containsType = mapper.types.chest.items[ props.contains ];
		}

		if ( containsType === 'Key' ) {
			items.push(
				{
					type: 'key',
					props: { name: `key-${foregroundColor}` },
				}
			);
		}

		if ( containsType.endsWith( 'Coins' ) ) {
			items.push(
				{
					type: 'coin',
					props: { amount: parseInt( containsType.split( ' ' )[ 0 ], 10 ) }
				}
			);
		}

		if ( containsType === 'Coin' ) {
			items.push(
				{
					type: 'coin',
					props: { amount: 1 }
				}
			);
		}

		if ( containsType === 'Half Heart' ) {
			items.push(
				{
					type: 'health',
					props: { amount: 1 }
				}
			);
		}

		if ( containsType === 'Heart' ) {
			items.push(
				{
					type: 'health',
					props: { amount: 2 }
				}
			);
		}

		if ( containsType === 'Full Heart' ) {
			items.push(
				{
					type: 'health',
					props: { amount: 9999 }
				}
			);
		}

		return b8.ECS.create(
			{
				Type: { name: 'chest' },
				Loc: { col, row },
				Sprite: {
					tile: 253,
					fg: foregroundColor,
					bg: props.bg || 0,
					depth: 10
				},
				Solid: {},
				Openable: {
					closedTile: 253,
					openedTile: 271,
					newType: 'chestOpen',
					message: mapper.types.chest.messages[ props.contains ] || "The chest is empty.",
				},
				Message: { message: props.message || "" },
				Reward: { items },
				Action: {
					ButtonA: 'open',
					ButtonB: 'open'
				},
			}
		);

	},


};