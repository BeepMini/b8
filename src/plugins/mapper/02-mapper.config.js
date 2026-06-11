mapper.CONFIG = {

	// Time in seconds between repeated player movement steps while holding a
	// direction. This remains frame-time based so movement still feels smooth.
	moveDelay: 0.2,

	// General action delay in seconds. This is kept for compatibility with
	// older mapper behavior and action flows that still read this value.
	actionDelay: 0.5,

	// Time in seconds an entity with Health stays invulnerable after taking
	// damage. This still uses frame time rather than turn time.
	healthCooldown: 1.2,

	// Time in seconds before the same action button can be used again. This
	// helps stop held buttons from firing interaction logic every frame.
	keyPressDelay: 0.25,

	// Legacy real-time AI delay. The turn-based mapper now uses
	// aiTickRateTurns instead, but this remains for backward compatibility.
	aiUpdateDelay: 0.5,

	// Number of world turns between enemy AI decisions and movement.
	aiTickRateTurns: 1,

	// Number of world turns between automatic path follower steps.
	pathFollowerTickRateTurns: 1,

	// Number of world turns a bomb fuse lasts before exploding.
	bombFuseTurns: 5,

	// Number of successful player actions a regular fire survives for before it
	// burns out.
	fireLifeTurns: 10,

	// Number of world turns between each fire spread attempt.
	fireSpreadTurns: 1,

	// Amount of heat a nearby fire adds to a flammable entity each world turn.
	// With the default ignite threshold of 100 this makes crates ignite after
	// two adjacent turns.
	fireHeatPerTurn: 50,

	// Amount of heat a flammable entity loses on turns where it was not heated
	// by nearby fire.
	flammableCoolingPerTurn: 10,

	// Temperature at which a flammable entity ignites and runs its burn logic.
	flammableIgniteThreshold: 100,

	// Number of world turns a fire-small effect stays attached to a burning
	// living entity.
	fireSmallDurationTurns: 3,

	// Damage dealt per world turn by a fire-small effect.
	fireSmallDamagePerTurn: 1,

	/**
	 * Horizontal tile offset applied when drawing the map and entities.
	 * Use this to leave room for borders or UI framing.
	 */
	mapOffsetX: 1,

	/**
	 * Vertical tile offset applied when drawing the map and entities.
	 * Use this to leave room for borders or UI framing.
	 */
	mapOffsetY: 1,

	// Encoded tilemap data for the in-game HUD panel drawn beneath the map.
	gameUI: `hpgYhRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGJUHAACghRiVBwAAoIUYlQcAAKCFGJUKAACgmBiFGBwHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFDAYHAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGB0HBgCghRgZBwgAoIUYIAgHAKCFGCsHBgCghRkBXAoAAKCYGIUYKwYHAKCFEgAHAKCFAAgAAKCFAAgAAKCFAAgAAKCFAwEAAKCFAAgAAKCFAA8AAKCFEwAHAKCFAQcGAKCFGQG0CgcAoIUBBwYAoIUBBwYAoIUBBwYAoIUZAbUKBwCghQEHBgCghQEHBgCghQEHBgCghQEHBgCghREGBwCghQAAAACghRMABwCghRgrBwYAoIUZAV4KAACgmBiFGCsGBwCghQEABwCghRkBnwgAAKCFGQGfCAAAoIUZAZ8IAACghRkBnwgAAKCFGQGfCAAAoIUZAZ8IAACghQEABwCghRg9AAEAoIUYPQABAKCFGD0AAQCghRg9AAEAoIUYPQABAKCFGD0AAQCghRg9AAEAoIUYPQABAKCFGD4AAQCghQEHBgCghRgrBwYAoIUAAAAAoIUAAAAAoIUYKwcGAKCFGQFdCgAAoJgYhRgrBgcAoIUBAAcAoIUBAAEAoIUADgAAoIUADwAAoIUADwAAoIUADwAAoIUADwAAoIUAAQAAoIUABQEAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUYUAABAKCFAAYHAKCFGCsHBgCghQAAAACghRglAAcAoIUYKwcGAKCFGQFeCgAAoJgYhRguBwYAoIUBAAEAoIUAAQAAoIUAAQAAoIUAAQAAoIUAAQAAoIURAQAAoIURAQAAoIUBAAEAoIUYYQABAKCFGGEAAQCghRhhAAEAoIUYYQABAKCFGGEAAQCghRhhAAEAoIURBgEAoIURBgEAoIUYYgABAKCFEQYHAKCFGC8HBgCghRgZBgcAoIUYGQYHAKCFGDEHBgCghRkBXQoAAKA=`,

};
