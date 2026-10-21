# BeepMini Adventure Systems

This document is a quick reference for the systems supported by the mapper adventure plugin.

It should stay shorter and more concrete than the main spec.

For the full design direction, see [_new-spec.md](/Users/bengillbanks/Mamp/beep8/src/plugins/mapper/_new-spec.md).

## Design Goals

The goal of BeepMini adventures is not action combat.

The goal is exploration, discovery, secrets, puzzles, and emergent interactions between simple systems.

Worlds should be easy to build, easy to understand, and capable of surprising players through system interactions.

## Core Rule

The world is action-based.

Whenever the player performs a successful action, the world updates.

Examples:

* Move
* Wait
* Push object
* Open door
* Use item
* Activate switch
* Place bomb

The player acts, then the world acts.

Use this as the default rule for all systems listed below.

The main timing change is:

* Old model: systems update continuously in real time.
* New model: systems update in world turns.

## Existing Systems

### Keys

Collectable items used to unlock matching doors.

Keys may be:

* Single use
* Permanent
* Colour coded

### Doors

Block movement until opened.

Types:

* Key door
* Switch door
* Timed door
* Burnable door
* Hidden door

### Stairs

Move the player to another location.

Can be used for:

* Building interiors
* Caves
* Multi-level maps
* Fast travel

### Signs

Display information to the player.

Used for:

* Clues
* Story
* Directions
* Tutorials

### Chests

Contain rewards.

Examples:

* Keys
* Bombs
* Quest items
* Treasure

## World Update Systems

### Fire

Fire spreads through flammable objects.

Fire can:

* Burn crates
* Burn wooden doors
* Burn enemies
* Ignite bombs
* Reveal hidden routes

Fire should spread every N turns.

For v1, fire is an existing feature that should keep working in turn-based form rather than being redesigned from scratch.

Properties:

```js
{
	spreadRate: 2
}
```

Fire should not spread through:

* Stone walls
* Water
* Metal objects

Fire is intended to be both a hazard and a puzzle mechanic.

### Bombs

Bombs are placed by the player or triggered by other systems.

Bombs:

* Count down
* Explode
* Create fire
* Destroy weak objects

For v1, bombs should keep their current gameplay role, but their fuse and explosion timing should be based on turns rather than seconds.

Bombs can be used for:

* Combat
* Secret discovery
* Puzzle solving

Examples:

* Destroy cracked walls
* Burn barriers
* Trigger chain reactions

### Conveyors

Conveyors move objects automatically.

They update during world turns.

Can move:

* Crates
* Bombs
* Enemies
* Floating objects

Conveyors create predictable movement systems without requiring AI.

## Water System

Water is a future system.

It is included here as a reference direction, not as required v1 scope.

Water is primarily a terrain system.

It is not intended to simulate realistic fluids.

### Static Water

Default water behaviour.

Properties:

* Blocks movement
* Extinguishes fire
* Blocks fire spread
* Supports floating objects

Static water behaves like terrain.

Lakes and ponds use static water.

### Water Regions

A collection of water tiles grouped together.

Regions can be:

* Filled
* Drained

Used for:

* Revealing hidden areas
* Opening routes
* Creating environmental puzzles

Examples:

* Drain a pond to reveal stairs
* Flood a chamber to access an upper ledge

### Water Sources

Create water in connected regions.

Can be activated by:

* Switches
* Events
* NPC actions

### Drains

Remove water from connected regions.

Can be activated by:

* Switches
* Events
* NPC actions

### Water Interactions

Fire + Water

* Water extinguishes fire.
* Fire cannot spread through water.

Bomb + Water

* Bomb explodes normally.
* Explosion does not create fire.

Crate + Water

* Crate may float.
* Floating crates may be moved by conveyors or future flow systems.

## Pushable Objects

Pushable objects are a major puzzle system.

### Crates

Properties:

* Pushable
* Burnable
* Can hold switches
* Can block paths
* May float

### Metal Blocks

Properties:

* Pushable
* Fireproof
* Sink in water

### Bombs

Can also be pushed.

This allows players to move hazards around the world.

## Creature System

Creatures are moving entities.

Not all creatures are enemies.

### Behaviour Types

#### Chaser

Moves towards the player.

#### Wanderer

Moves randomly.

#### Patrol

Follows a fixed route.

#### Guard

Protects an area.

#### Coward

Moves away from the player.

### Interactions

Creatures can:

* Burn
* Trigger switches
* Block paths
* Ride conveyors

Creatures should behave predictably.

The goal is puzzle-like interactions rather than twitch combat.

## Spawners

Spawners create entities over time.

Examples:

* Slime nest
* Spider nest
* Treasure generator

Properties:

```js
{
	spawns: "slime",
	everyTurns: 6,
	maxAlive: 3,
	totalLimit: -1
}
```

Recommended defaults:

* Low spawn rate
* Small active limit

Spawners should support gameplay without overwhelming the world.

## Trigger System

Triggers allow systems to communicate.

### Pressure Plate

Activated while occupied.

Can be activated by:

* Player
* Crate
* Creature

### Floor Trigger

Activates once when stepped on.

### Toggle Switch

Changes state each time it is used.

### Timed Switch

Remains active for a number of turns.

Triggers can control:

* Doors
* Water regions
* Spawners
* Conveyors
* Hidden passages

## Hidden Areas

Secrets are a core pillar of BeepMini adventures.

Methods:

* Hidden doors
* Bombable walls
* Burnable barriers
* Drained lakes
* Pushable blocks
* Triggered passages

Secrets should reward observation and experimentation.

## NPC System

NPCs are interactive objects with dialogue and actions.

NPCs do not require scripting.

### Dialogue Rules

NPCs evaluate a list of conditions.

The first matching condition is used.

Example:

```js
[
	{
		hasItem: "goldKey",
		message: "You found the key!",
		giveItem: "reward"
	},
	{
		flag: "questStarted",
		message: "Keep searching."
	},
	{
		default: true,
		message: "Please find the key."
	}
]
```

### Conditions

Possible conditions:

* Has item
* Missing item
* Flag set
* Flag not set
* Creature defeated

## v1 Focus

The first implementation pass should focus on converting current real-time behaviour into readable turn-based behaviour.

Priorities:

* Player movement
* Wait action
* Fire spread
* Bomb fuse and explosion
* Existing enemy turns
* Existing doors, keys, switches, and hazards

Water should wait until the core turn loop feels solid.
