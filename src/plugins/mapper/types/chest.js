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
				},
				Message: { message: props.message || "" },
				Reward: { items },
				Action: {
					ButtonB: 'open'
				},
			}
		);

	},


};