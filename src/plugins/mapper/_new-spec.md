# Turn-Based World Update System

## Goal

Change BeepMini adventure games from real-time worlds to action-based worlds.

The world should only advance when the player performs an action. This makes games easier to reason about, easier to author in the editor, and better suited to tile-based movement.

The core rule is:

> When the player acts, the world acts.

This supports exploration, discovery, secrets, hazards, and emergent systems without requiring twitch combat.

## Scope

This change is mainly about converting the current mapper plugin from real-time logic to turn-based logic.

Existing features should continue to work:

* Fire should still spread.
* Bombs should still count down and explode.
* Enemies should still move and react.
* Doors, switches, hazards, and triggers should still behave as they do now.

The difference is that these systems should resolve in world turns instead of real time.

This is not a full redesign of the adventure plugin.

It is a change to the timing model.

## Non-Goals

This spec does not try to:

* Turn the mapper into a roguelike.
* Add heavy simulation or complex systemic randomness.
* Replace clear tile logic with hidden rules.
* Require every adventure game to use combat.
* Fully design water for v1.

Water is a future system and should not block the core turn-based conversion.

## Core Design

The game no longer runs enemy AI, fire spread, bombs, projectiles, or other world systems continuously.

Instead, the world updates after meaningful player actions.

A player action includes:

* Moving one tile.
* Waiting.
* Pushing an object.
* Opening a door.
* Activating a switch.
* Using an item.
* Attacking, if combat exists.
* Dropping or placing an object, such as a bomb.

A failed action may not advance the world.

Examples of failed actions:

* Walking into a wall.
* Trying to open a locked door without the key.
* Trying to push an immovable object.

This should be configurable later, but the v1 default should be:

> Only successful actions advance the world.

The only obvious exception is an explicit wait action, which should always consume a turn.

## Turn Flow

Each player action triggers a world turn.

Recommended order:

```js
player action
→ resolve immediate result
→ update triggers
→ update hazards
→ update moving objects
→ update creatures
→ update projectiles
→ resolve deaths / destruction
→ render animations
```

The exact order matters because it makes systems predictable.

For example, if fire spreads before enemies move, then enemies can react to newly created fire on the same turn. If enemies move first, fire becomes easier to avoid.

Use one fixed order everywhere.

## World Turns vs Animation

The logic should be turn-based.

The presentation can still be animated.

For example:

1. Player presses right.
2. Player moves one tile.
3. Fire spreads.
4. Enemy moves.
5. Bomb fuse decreases.
6. Animations play smoothly.
7. Input unlocks.

The player should not be able to act again until the current world turn has finished resolving.

This keeps the game readable while avoiding real-time pressure.

## Example Turns

These examples show the intended feel of the system.

### Example: Moving Near Fire

1. Player moves one tile.
2. The move succeeds.
3. The world turn begins.
4. Nearby fire spreads or heats flammable objects.
5. A bomb next to the fire reduces its fuse.
6. An enemy takes its turn and moves.
7. Deaths and destruction resolve.
8. Animations play.
9. Input unlocks.

### Example: Failed Push

1. Player tries to push a solid object.
2. The push fails.
3. No world turn happens.
4. Fire does not spread.
5. Bombs do not tick down.
6. Enemies do not move.

### Example: Waiting for a Bomb

1. Player chooses Wait.
2. The world turn begins.
3. Bomb fuse decreases by one turn.
4. Fire spreads.
5. Enemy moves.
6. Bomb reaches zero and explodes.
7. Explosion creates temporary fire.
8. Animations play.
9. Input unlocks.

## Entity Update Model

Each interactive object may implement one or more turn hooks.

These are intended as engine-facing hooks, not just design language.

For example:

```js
onPlayerAction( action )
onWorldTurn( turnContext )
onTouch( entity )
onEnter( entity )
onBurn( source )
onExplode( source )
onDestroy( reason )
```

Most systems should use `onWorldTurn()`.

Examples:

```js
fire.onWorldTurn()
enemy.onWorldTurn()
bomb.onWorldTurn()
projectile.onWorldTurn()
```

This replaces continuous `update( deltaTime )` gameplay logic for adventure games.

Real-time animation can still use frame updates, but it should not affect gameplay rules.

## Tick Rates

Not every system needs to update every turn.

Entities can have a turn rate.

```js
fire.tickRate = 2
enemy.tickRate = 1
bomb.fuse = 3
projectile.tickRate = 1
```

Examples:

* Enemy moves every turn.
* Slow enemy moves every 2 turns.
* Fire spreads every 2 turns.
* Bomb explodes after 3 turns.
* Door closes after 5 turns.

This gives the editor simple values for creators to understand.

Use turns, not seconds.

## Fire System

Fire should be a world hazard and an interaction system, not just damage.

For v1, keep the fire model close to the current plugin behaviour and convert it to turns.

Fire can:

* Spread to flammable tiles.
* Burn crates.
* Burn wooden doors.
* Ignite bombs.
* Damage or destroy creatures.
* Reveal hidden paths.
* Be blocked by stone, metal, or empty gaps.
* Be extinguished by water or rain, if added.

Suggested fire properties:

```js
{
	type: "fire",
	spreadRate: 2,
	life: -1,
	damage: 1,
	spreadsTo: [ "grass", "wood", "crate", "woodDoor" ],
	blockedBy: [ "stone", "wall", "metal" ]
}
```

`life: -1` means the fire burns forever.

Optional finite fire:

```js
life: 5
```

This means the fire burns out after 5 world turns.

For v1, fire should follow one clear rule:

> Fire affects nearby flammable things every N turns and burns forever unless something explicitly removes it.

That keeps it predictable and close to how the current system already feels.

## Bomb System

Bombs create controlled fire and destruction.

Suggested behaviour:

* Player places bomb.
* Bomb fuse decreases each world turn.
* Bomb explodes at zero.
* Explosion creates temporary fire around the bomb.
* Explosion can destroy crates, cracked walls, wooden doors, and enemies.

Example:

```js
{
	type: "bomb",
	fuse: 3,
	radius: 1,
	creates: "fire"
}
```

For v1, bomb behaviour should remain familiar:

* A lit bomb loses one fuse step per world turn.
* At zero it explodes.
* The explosion creates fire using the same fire system as normal map fire.
* Fire can ignite bombs to create chain reactions.

Bombs should be useful for secrets, not only combat.

Examples:

* Burn a wooden barrier.
* Reveal a hidden passage.
* Chain-react with fire.
* Destroy cracked walls.
* Trigger distant hazards.

## Enemy System

Enemies should be predictable rather than twitchy.

They should feel like moving puzzle pieces.

Possible enemy types:

* Chaser: moves towards the player.
* Wanderer: moves randomly.
* Patrol: follows a route.
* Guard: blocks an area.
* Sleeper: wakes when approached.
* Coward: runs away from the player.
* Fire-fearer: avoids fire.
* Fire-lover: follows fire or spreads it.

Enemy properties:

```js
{
	type: "enemy",
	behaviour: "chase",
	tickRate: 1,
	health: 1,
	damage: 1,
	canBurn: true
}
```

Combat should be optional.

Enemies can be interesting without fighting if they:

* Block paths.
* Chase keys.
* Trigger switches.
* Avoid light.
* Spread fire.
* Eat crates.
* Patrol near secrets.

## Projectile System

Projectiles should move on world turns.

Suggested behaviour:

* Move one tile per turn.
* Hit the first blocking object.
* Trigger `onTouch`.
* Disappear on impact.

Example:

```js
{
	type: "projectile",
	direction: "right",
	speed: 1,
	damage: 1,
	destroyOnHit: true
}
```

Projectiles can come from:

* Traps.
* Enemies.
* Switches.
* Player items.

They should work more like moving hazards than action-game bullets.

## Water System

Water should act as the opposite of fire.

It does not need full fluid simulation. Keep it simple and tile-based.

Water is not required for the first turn-based conversion.

This section is future-facing and should not define v1 scope.

Water can:

* Extinguish fire.
* Block movement unless the player has a matching item.
* Carry floating objects.
* Fill holes.
* Spread slowly from a source.
* Flow in a direction.
* Activate water wheels or pressure systems.
* Stop bombs from exploding into fire.

Recommended water types:

### Static Water

A normal water tile.

Rules:

* Blocks normal walking.
* Extinguishes adjacent fire.
* Can be crossed with boots, boat, bridge, or swimming ability.
* Can receive crates to create a bridge.

### Flowing Water

Water with a direction.

Rules:

* Pushes floating objects one tile per turn.
* May push the player if standing in it.
* Can carry crates, rafts, bombs, or enemies.

### Water Source

A tile that creates water.

Rules:

* Adds water to adjacent valid tiles every few turns.
* Can be opened or closed by switches.
* Can flood areas.

### Drain

A tile that removes water.

Rules:

* Deletes water that reaches it.
* Can be blocked by crates.
* Can be opened or closed by switches.

Suggested water properties:

```js
{
	type: "water",
	mode: "static",
	flowDirection: null,
	spreadRate: 3,
	extinguishesFire: true,
	pushesFloatingObjects: false
}
```

Water should be predictable. It should not try to simulate real liquid.

## Water and Fire Interactions

Suggested rules:

* Fire entering water disappears.
* Water entering fire turns fire into steam or empty floor.
* Bombs in water fizzle.
* Burning crates in water are extinguished.
* Fire cannot spread across water.
* Steam can optionally become a temporary blocking or obscuring tile.

For v1, keep it simple:

```js
fire + water = empty floor
```

Steam can wait.

## Pushable Objects

Pushable objects are important for emergent puzzles.

Types:

* Crate.
* Metal block.
* Ice block.
* Bomb.
* Raft.

Suggested properties:

```js
{
	type: "crate",
	pushable: true,
	flammable: true,
	floats: true
}
```

Interactions:

* Crates burn.
* Crates can block enemies.
* Crates can hold switches down.
* Crates can fill water.
* Metal blocks do not burn.
* Floating crates can move with water.

## Switches and Triggers

Switches should be simple and visual.

Types:

* Step switch.
* Toggle switch.
* One-shot switch.
* Timed switch.
* Remote trigger.

Switches can affect:

* Doors.
* Bridges.
* Fire sources.
* Water sources.
* Drains.
* Spawners.
* Moving platforms.
* Hidden passages.

Timed switches should use turns.

Example:

```js
{
	type: "switch",
	mode: "timed",
	duration: 5,
	target: "door_01"
}
```

## Secrets

Secrets should remain a core part of the adventure system.

Possible secret mechanics:

* Hidden doors.
* Bombable walls.
* Burnable wooden barriers.
* Pushable blocks hiding stairs.
* Switches hidden under crates.
* Fire revealing paths.
* Water draining to reveal tunnels.
* Enemies accidentally opening routes.
* NPCs giving clues.
* Fake walls.
* One-way shortcuts.

Secrets should mostly come from world interactions, not invisible guesses.

## Editor Changes

The editor should expose turn-based values.

This is one of the main benefits of the timing change.

Replace real-time values like:

```js
speed: 120
cooldown: 500
duration: 2000
```

with turn-based values:

```js
tickRate: 2
cooldownTurns: 3
durationTurns: 5
```

Editor labels should avoid technical language where possible.

Use:

* Acts every X turns.
* Spreads every X turns.
* Burns out after X turns.
* Opens for X turns.
* Explodes after X turns.

Avoid milliseconds and frame rates.

## Recommended v1 Systems

For the first turn-based prototype, implement:

* Player movement.
* Wait action.
* Fire spread.
* Bomb fuse and explosion.
* Burnable crates.
* Burnable wooden doors.
* One simple enemy.
* One simple switch.
* One timed door.

Do not add water immediately unless the basic turn system feels good.

The goal of v1 is to preserve the existing mapper adventure feel while changing when systems update.

## Recommended v2 Systems

After v1 works, add:

* Static water.
* Crates that fill water.
* Fire extinguishing.
* Water sources.
* Drains.
* Flowing water.
* Enemies that avoid hazards.
* Projectiles.
* Pressure plates.
* Hidden passages.

## Design Principle

Every system should be understandable in one sentence.

Good:

> Fire spreads to nearby wood every 2 turns.

Good:

> Water puts out fire and carries floating crates.

Bad:

> Fire has a real-time spread timer affected by distance, temperature, and random chance.

The editor should encourage simple rules that combine in interesting ways.

## Summary

BeepMini adventure games should become action-based worlds.

The player acts, then the world responds.

This fits tile-based movement, supports slower and more thoughtful play, and makes emergent systems easier to build in the editor.

The goal is not to make a roguelike.

The goal is to make a simple adventure editor where players can explore strange little worlds full of secrets, systems, and surprises.
