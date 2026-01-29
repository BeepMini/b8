const mapper = {
  // All loaded maps.
  maps: [],
  // Currently active map.
  currentMapId: null,
  // Map of entity types to their handlers.
  types: {},
  systems: {},
  actions: {},
  settings: {},
  bg: {},
  lastPosition: null,
  // The player entity ID.
  player: null,
  /**
   * Initialize and start the game with the provided map data.
   *
   * @param {Object} mapData - The map data object containing map layout, tiles, objects, and settings.
   * @returns {void}
   */
  play: function(mapData) {
    b8.Utilities.checkObject("mapData", mapData);
    mapper.mapData = mapData;
    mapper.reset();
    b8.Scene.add("menu", mapper.sceneMenu);
    b8.Scene.add("game", mapper.sceneGame);
    b8.Scene.add("gameover", mapper.sceneGameOver);
    b8.Scene.set("menu");
  },
  /**
   * Reset the game state to the initial map data.
   *
   * @returns {void}
   */
  reset: function() {
    mapper.load(mapper.mapData);
  },
  /**
   * Continue the game from the last doorway.
   *
   * @returns {void}
   */
  continue: function() {
    b8.ECS.setComponent(
      mapper.player,
      "Health",
      {
        value: 6,
        max: 12
      }
    );
    mapper.setCurrentMap(mapper.lastPosition.map, true);
    b8.ECS.setLoc(
      mapper.player,
      mapper.lastPosition.col,
      mapper.lastPosition.row
    );
  },
  /**
   * Update the game state.
   *
   * @param {number} dt - The delta time since the last update call.
   * @returns {void}
   */
  update: function(dt) {
    b8.ECS.run(dt);
  },
  /**
   * Draw an actor at its location with optional offsets.
   *
   * @param {Object} actor - The actor entity with properties: id, col, row, fg, bg, animation.
   * @returns {void}
   */
  drawActor: function(actor) {
    const screenPosition = mapper.camera.getScreenPosition(actor.col, actor.row);
    const actorX = actor.col - screenPosition.col;
    const actorY = actor.row - screenPosition.row;
    b8.locate(actorX + offsetX, actorY + offsetY);
    b8.color(actor.fg, actor.bg);
    b8.drawActor(actor.id, actor.animation);
  },
  /**
   * Set a delay for key presses to prevent rapid actions.
   *
   * @returns {void}
   */
  delayKeyPress: function(id) {
    console.log(`Key press delay for entity ${id}`);
    b8.ECS.setComponent(id, "ActionCooldown", { time: mapper.CONFIG.keyPressDelay });
  },
  /**
   * Set the player's walking animation based on movement direction.
   *
   * @param {number} playerId - The entity ID of the player.
   * @param {number} dx - The change in x (column) direction.
   * @param {number} dy - The change in y (row) direction.
   * @returns {void}
   */
  setPlayerWalkAnimation: function(playerId, dx, dy) {
    const anim = b8.ECS.getComponent(playerId, "CharacterAnimation");
    if (dy > 0) anim.name = "move-down";
    if (dy < 0) anim.name = "move-up";
    if (dx > 0) anim.name = "move-right";
    if (dx < 0) anim.name = "move-left";
    anim.duration = 0.3;
  },
  /**
   * Render all entities on the screen with optional offsets.
   *
   * @param {number} offsetX - Horizontal offset for rendering.
   * @param {number} offsetY - Vertical offset for rendering.
   * @returns {void}
   */
  render: function(offsetX2 = 0, offsetY2 = 0) {
    const list = [];
    for (const id of b8.ECS.query("Sprite", "Loc")) {
      const spr = b8.ECS.getComponent(id, "Sprite");
      const loc = b8.ECS.getComponent(id, "Loc");
      const anim = b8.ECS.getComponent(id, "CharacterAnimation");
      list.push({ spr, loc, anim });
    }
    if (list.length === 0) return;
    list.sort((a, b) => (a.spr.depth ?? 0) - (b.spr.depth ?? 0));
    for (const { spr, loc, anim } of list) {
      const pos = mapper.camera.getTilePosition(loc.col, loc.row);
      const nudgeCol = spr.nudgeCol || 0;
      const nudgeRow = spr.nudgeRow || 0;
      b8.locate(pos.col + offsetX2, pos.row + offsetY2);
      b8.color(spr.fg ?? 15, spr.bg ?? 0);
      switch (spr.type) {
        case "actor":
          b8.drawActor(parseInt(spr.tile), anim.name, nudgeCol, nudgeRow);
          break;
        case "vfx":
          b8.Vfx.draw(spr.id, spr.startTime, nudgeCol, nudgeRow);
          break;
        case "vfx-outline":
          b8.Vfx.drawOutline(spr.id, spr.startTime, nudgeCol, nudgeRow);
          break;
        default:
          b8.printChar(parseInt(spr.tile));
          break;
      }
    }
  },
  /**
   * Draw the visible portion of the current map to the screen.
   *
   * @returns {void}
   */
  drawScreen: function() {
    if (!mapper.isValidMapId(mapper.currentMapId)) {
      b8.Utilities.fatal("No current map set.");
      return;
    }
    let loc = b8.ECS.getComponent(mapper.player, "Loc");
    if (!loc) loc = { col: 0, row: 0 };
    const screenPosition = mapper.camera.getScreenPosition(loc.col, loc.row);
    const currentMap = mapper.getCurrentMap();
    b8.Tilemap.draw(
      currentMap.mapData,
      screenPosition.col,
      screenPosition.row,
      screenPosition.w,
      screenPosition.h
    );
  },
  /**
   * Set a tile at the specified coordinates in the current map.
   *
   * @param {number} x - The x-coordinate (column) of the tile to set.
   * @param {number} y - The y-coordinate (row) of the tile to set.
   * @param {string} tile - The tile character to set at the specified coordinates.
   * @returns {void}
   */
  setTile: function(x, y, tile) {
    if (!mapper.currentMap) {
      b8.Utilities.error("No current map set.");
      return;
    }
    if (x < 0 || y < 0 || y >= mapper.currentMap.map.mapHeight || x >= mapper.currentMap.map.mapWidth) {
      b8.Utilities.error("Mapper.setTile, coordinates out of bounds.");
      return;
    }
    mapper.currentMap.map[y][x] = tile;
  },
  /**
   * Get the action verb for a given entity ID.
   *
   * @param {number} id - The entity ID to get the verb for.
   * @param {string} propertyName - The name of the property to retrieve.
   * @returns {string} The action verb associated with the entity, or an empty string if none exists.
   */
  getPropForEntity: (id, propertyName = null) => {
    const a = b8.ECS.getComponent(id, "Action");
    if (!a) return "";
    if (!propertyName) return "";
    if (!(propertyName in a)) return "";
    return a[propertyName] ?? "";
  },
  /**
   * Retrieve the currently active map.
   *
   * @returns {Object} The current map object.
   */
  getCurrentMap: () => {
    return mapper.maps[mapper.currentMapId];
  },
  /**
   * Get the pixel width of the current map.
   *
   * @returns {number} The width of the current map in tiles.
   */
  getMapWidth: () => {
    const currentMap = mapper.getCurrentMap();
    return currentMap.mapWidth;
  },
  /**
   * Get the pixel height of the current map.
   *
   * @returns {number} The height of the current map in tiles.
   */
  getMapHeight: () => {
    const currentMap = mapper.getCurrentMap();
    return currentMap.mapHeight;
  },
  /**
   * Get the action verb for the entity directly in front of the player.
   *
   * @param {number} playerId - The player entity ID.
   * @param {string|null} propertyName - The name of the property to retrieve.
   * @returns {string} The action verb of the entity ahead, or an empty string if none exists.
   */
  promptAhead: (playerId, propertyName = null) => {
    if (!propertyName) return "";
    const ids = mapper.entitiesAhead(playerId);
    for (const id of ids) {
      const verb = mapper.getPropForEntity(id, propertyName);
      if (verb) return verb;
    }
    return "";
  },
  /**
   * Get the tile coordinates directly in front of the player.
   *
   * @param {number} playerId - The player entity ID.
   * @returns {Object} An object with x and y properties representing the tile coordinates ahead of the player.
   */
  ahead: (playerId) => {
    const loc = b8.ECS.getComponent(playerId, "Loc");
    const dir = b8.ECS.getComponent(playerId, "Direction");
    if (!loc || !dir) return { x: 0, y: 0 };
    const x = loc.col + (dir.dx || 0);
    const y = loc.row + (dir.dy || 0);
    return { x, y };
  },
  /**
   * Get all entities located directly in front of the player.
   *
   * @param {number} playerId - The player entity ID.
   * @returns {Array} An array of entity IDs located ahead of the player.
   */
  entitiesAhead: (playerId) => {
    const { x, y } = mapper.ahead(playerId);
    return b8.ECS.entitiesAt(x, y) ?? [];
  },
  /**
   * Get all entities located next to the player (up, down, left, right).
   *
   * @param {number} playerId - The player entity ID.
   * @returns {Array} An array of entity IDs located next to the player.
   */
  entitiesNextTo: (playerId) => {
    const loc = b8.ECS.getComponent(playerId, "Loc");
    if (!loc) return [];
    const adjacentEntities = /* @__PURE__ */ new Set();
    const directions = [
      { dx: -1, dy: 0 },
      // left
      { dx: 1, dy: 0 },
      // right
      { dx: 0, dy: -1 },
      // up
      { dx: 0, dy: 1 }
      // down
    ];
    for (const dir of directions) {
      const x = loc.col + dir.dx;
      const y = loc.row + dir.dy;
      const entities = b8.ECS.entitiesAt(x, y);
      if (entities) {
        entities.forEach((id) => adjacentEntities.add(id));
      }
    }
    return Array.from(adjacentEntities);
  },
  /**
   * Handle collision when the player attempts to move to a new tile.
   *
   * @param {number} x - The current x-coordinate (column) of the player.
   * @param {number} y - The current y-coordinate (row) of the player.
   * @param {number} newCol - The target x-coordinate (column) the player is moving to.
   * @param {number} newRow - The target y-coordinate (row) the player is moving to.
   * @param {number} dx - The change in x (column) direction.
   * @param {number} dy - The change in y (row) direction.
   * @return {boolean} True if the movement is blocked by a collision, false otherwise.
   */
  doCollision: function(x, y, newCol, newRow, dx, dy) {
    if (mapper.systems.tryPushing(x, y, dx, dy)) return true;
    for (const id of b8.ECS.entitiesAt(newCol, newRow)) {
      const typeComp = b8.ECS.getComponent(id, "Type");
      const handler = typeComp ? mapper.types[typeComp.name] : null;
      if (handler?.onCharacterCollision) {
        const blocked = handler.onCharacterCollision(id, newCol, newRow, dx, dy);
        if (blocked) return true;
      }
      const isSolid = b8.ECS.hasComponent(id, "Solid");
      if (isSolid) return true;
    }
    return false;
  },
  /**
   * Perform the action associated with the entity directly in front of the player.
   *
   * @param {number} playerId - The player entity ID.
   * @param {string} propertyName - The name of the property to check for an action.
   * @returns {boolean} True if an action was performed, false otherwise.
   */
  doAction: (playerId, propertyName) => {
    if (!propertyName) return false;
    const ac = b8.ECS.getComponent(playerId, "ActionCooldown");
    if (!ac) {
      mapper.delayKeyPress(playerId);
    } else {
      if (ac.time > 0) return false;
    }
    const action = mapper.promptAhead(playerId, propertyName);
    if (action && mapper.actions[action]) {
      mapper.actions[action](playerId);
    }
    mapper.delayKeyPress(playerId);
    return true;
  },
  /**
   * Perform an attack action by the player.
   *
   * @param {number} playerId - The player entity ID.
   * @param {string} propertyName - The name of the property to check for an attack action.
   * @returns {void}
   */
  doAttack: (playerId, propertyName) => {
    if (!mapper.doAction(playerId, propertyName)) return;
    const ahead = mapper.ahead(playerId);
    mapper.types.vfx.spawn(
      ahead.x,
      ahead.y,
      { id: "swipe", fg: 15, bg: 0, type: "vfx-outline" }
    );
  },
  /**
   * Update the move delay to control player movement speed.
   *
   * @param {number} amount - The amount of delay to set (in seconds).
   * @returns {void}
   */
  updateMoveDelay: function(amount = mapper.CONFIG.moveDelay) {
    mapper.sceneGame.moveDelay = Math.max(amount, mapper.sceneGame.moveDelay);
  },
  /**
   * Check if the provided map ID is valid.
   *
   * @param {number} mapId - The map ID to validate.
   * @returns {boolean} True if the map ID is valid, false otherwise.
   */
  isValidMapId: (mapId) => {
    return typeof mapId === "number" && mapId >= 0;
  },
  /**
   * Check if there is an entity of a specific type at the given coordinates.
   *
   * @param {number} col - The column coordinate to check.
   * @param {number} row - The row coordinate to check.
   * @param {string} type - The type of the entity to look for.
   * @returns {boolean} True if an entity of the specified type exists at the coordinates, false otherwise.
   */
  hasEntityAt: function(col, row, type) {
    const entities = b8.ECS.entitiesAt(col, row);
    for (const id of entities) {
      const typeComp = b8.ECS.getComponent(id, "Type");
      if (typeComp?.name === type) return true;
    }
    return false;
  },
  /**
   * Remove an object of a specific type at the given coordinates from the current map.
   *
   * @param {number} col - The column coordinate of the object to remove.
   * @param {number} row - The row coordinate of the object to remove.
   * @param {string} type - The type of the object to remove.
   * @returns {void}
   */
  removeObjectAt: function(col, row, type) {
    const currentMap = mapper.getCurrentMap();
    currentMap.objects = currentMap.objects.filter(
      (obj) => !(obj.x === col && obj.y === row && obj.type.startsWith(type))
    );
  },
  /**
   * Change properties of an object at the given coordinates in the current map.
   *
   * @param {number} col - The column coordinate of the object to change.
   * @param {number} row - The row coordinate of the object to change.
   * @param {string} type - The current type of the object to change.
   * @param {Object} properties - An object containing the properties to update.
   * @returns {void}
   */
  changeObjectPropertiesAt: function(col, row, type, properties = {}) {
    const currentMap = mapper.getCurrentMap();
    for (const obj of currentMap.objects) {
      if (obj.x === col && obj.y === row && obj.type.startsWith(type)) {
        Object.assign(obj, properties);
        return;
      }
    }
  },
  /**
   * Change the type of an object at the given coordinates in the current map.
   *
   * @param {number} col - The column coordinate of the object to change.
   * @param {number} row - The row coordinate of the object to change.
   * @param {string} type - The current type of the object to change.
   * @param {string} newType - The new type to set for the object.
   * @returns {void}
   */
  changeObjectTypeAt: function(col, row, type, newType) {
    const currentMap = mapper.getCurrentMap();
    for (const obj of currentMap.objects) {
      if (obj.x === col && obj.y === row && obj.type.startsWith(type)) {
        obj.type = newType;
        return;
      }
    }
  },
  /**
   * Give rewards to the player.
   *
   * @param {number} playerId - The entity ID of the player.
   * @param {Array} rewards - An array of reward objects to give to the player.
   * @returns {void}
   */
  giveRewards: function(playerId, rewards = []) {
    if (!rewards || rewards.length === 0) return;
    rewards.forEach(
      (reward) => {
        if (!reward.type) return;
        if (!reward.props) reward.props = {};
        const fn = mapper.types[reward.type]?.pickupHandler;
        if (fn) fn(playerId, reward);
      }
    );
  },
  /**
   * Invoke a handler function for a given entity based on its type.
   *
   * @param {number} entityId - The entity ID to invoke the handler for.
   * @param {string} handlerName - The name of the handler function to invoke.
   * @returns {boolean} The result of the handler function, or false if not found.
   */
  doHandler: function(entityId, handlerName) {
    const type = b8.ECS.getComponent(entityId, "Type");
    const handler = type && mapper.types[type.name];
    if (handler?.[handlerName]) return handler[handlerName](entityId);
    return false;
  },
  /**
   * Repeat the last step of a path a specified number of times.
   *
   * @param {Array} path - The path array to modify.
   * @param {number} count - The number of times to repeat the last step.
   * @returns {void}
   */
  repeatLastValue: function(path, count) {
    const last = path.at(-1);
    path.push(...Array(count).fill(last));
  }
};
mapper.CONFIG = {
  // Time in seconds for player movement delay.
  moveDelay: 0.2,
  actionDelay: 0.5,
  // Time in seconds for player to not take damage after being hit.
  healthCooldown: 1.2,
  // Key press delay.
  keyPressDelay: 0.25,
  // Time in seconds between AI updates.
  aiUpdateDelay: 0.5,
  /**
   * Offset to apply when drawing the map and actors.
   * This is to account for any borders or UI elements.
   */
  mapOffsetX: 1,
  mapOffsetY: 1,
  // UI graphics.
  gameUI: `hpgYhRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGJUHAACghRiVBwAAoIUYlQcAAKCFGJUKAACgmBiFGBwHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFDAYHAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGB0HBgCghRgZBwgAoIUYIAgHAKCFGCsHBgCghRkBXAoAAKCYGIUYKwYHAKCFEgAHAKCFAAgAAKCFAAgAAKCFAAgAAKCFAwEAAKCFAAgAAKCFAA8AAKCFEwAHAKCFAQcGAKCFGQG0CgcAoIUBBwYAoIUBBwYAoIUBBwYAoIUZAbUKBwCghQEHBgCghQEHBgCghQEHBgCghQEHBgCghREGBwCghQAAAACghRMABwCghRgrBwYAoIUZAV4KAACgmBiFGCsGBwCghQEABwCghRkBnwgAAKCFGQGfCAAAoIUZAZ8IAACghRkBnwgAAKCFGQGfCAAAoIUZAZ8IAACghQEABwCghRg9AAEAoIUYPQABAKCFGD0AAQCghRg9AAEAoIUYPQABAKCFGD0AAQCghRg9AAEAoIUYPQABAKCFGD4AAQCghQEHBgCghRgrBwYAoIUAAAAAoIUAAAAAoIUYKwcGAKCFGQFdCgAAoJgYhRgrBgcAoIUBAAcAoIUBAAEAoIUADgAAoIUADwAAoIUADwAAoIUADwAAoIUADwAAoIUAAQAAoIUABQEAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUYUAABAKCFAAYHAKCFGCsHBgCghQAAAACghRglAAcAoIUYKwcGAKCFGQFeCgAAoJgYhRguBwYAoIUBAAEAoIUAAQAAoIUAAQAAoIUAAQAAoIUAAQAAoIURAQAAoIURAQAAoIUBAAEAoIUYYQABAKCFGGEAAQCghRhhAAEAoIUYYQABAKCFGGEAAQCghRhhAAEAoIURBgEAoIURBgEAoIUYYgABAKCFEQYHAKCFGC8HBgCghRgZBgcAoIUYGQYHAKCFGDEHBgCghRkBXQoAAKA=`
};
mapper.actions.attack = (playerId) => {
  const ids = mapper.entitiesAhead(playerId);
  for (const targetId of ids) {
    if (targetId === playerId) continue;
    if (!b8.ECS.hasComponent(targetId, "AttackTarget")) continue;
    const targetHealth = b8.ECS.getComponent(targetId, "Health");
    const playerAttack = b8.ECS.getComponent(playerId, "Attack") || { value: 1 };
    targetHealth.value -= playerAttack.value;
  }
};
mapper.actions.ignite = function(playerId) {
  const ids = mapper.entitiesAhead(playerId);
  for (const targetId of ids) {
    if (targetId === playerId) continue;
    const bomb = b8.ECS.getComponent(targetId, "Bomb");
    if (!bomb) continue;
    bomb.fuseTime = 5;
  }
  ;
};
mapper.actions.open = async function(playerId) {
  const entities = mapper.entitiesAhead(playerId);
  for (const id of entities) {
    const obj = b8.ECS.getComponent(id, "Openable");
    const sprite = b8.ECS.getComponent(id, "Sprite");
    if (!obj || !sprite) continue;
    if (obj.openedTile) sprite.tile = obj.openedTile;
    if (obj.newType) {
      const loc = b8.ECS.getComponent(id, "Loc");
      const type = b8.ECS.getComponent(id, "Type");
      mapper.changeObjectTypeAt(loc.col, loc.row, type.name, obj.newType);
    }
    b8.Sfx.play("tone/jingle/017");
    if (obj.message) {
      b8.color(
        sprite.fg ?? 15,
        sprite.bg ?? 5
      );
      const message = mapper.helpers.processChatText(obj.message || "");
      await b8.Async.dialogTypewriter(message, ["OK"], 20);
    }
    const rewards = b8.ECS.getComponent(id, "Reward");
    mapper.giveRewards(playerId, rewards?.items || []);
    b8.ECS.removeComponent(id, "Reward");
    b8.ECS.removeComponent(id, "Action");
    b8.ECS.removeComponent(id, "Openable");
    const messageComponent = b8.ECS.getComponent(id, "Message");
    if (messageComponent?.message?.length > 0) {
      b8.ECS.addComponent(id, "Action", { ButtonA: "read", ButtonB: "read" });
    }
    mapper.delayKeyPress(id);
    return;
  }
};
mapper.actions.pull = function(playerId) {
  const loc = b8.ECS.getComponent(playerId, "Loc");
  const dir = b8.ECS.getComponent(playerId, "Direction");
  mapper.systems.tryPulling(loc.col, loc.row, dir.dx, dir.dy, playerId);
};
mapper.actions.read = async function(playerId) {
  const entities = mapper.entitiesAhead(playerId);
  for (const id of entities) {
    const obj = b8.ECS.getComponent(id, "Message");
    const sprite = b8.ECS.getComponent(id, "Sprite");
    if (!obj || !sprite) continue;
    b8.color(
      sprite.fg ?? 15,
      sprite.bg ?? 5
    );
    const message = mapper.helpers.processChatText(obj.message || "");
    await b8.Async.dialogTypewriter(message, ["OK"], 20);
    mapper.delayKeyPress(id);
    return;
  }
};
mapper.actions.trigger = function(playerId) {
  const ids = mapper.entitiesAhead(playerId);
  for (const targetId of ids) {
    const type = b8.ECS.getComponent(targetId, "Type");
    if (mapper.types[type.name]?.triggerHandler) {
      mapper.types[type.name].triggerHandler(playerId, targetId);
    }
  }
};
mapper.ai = {
  MODE: {
    NONE: "none",
    RETURN: "return",
    CHASE: "chase",
    ATTACK: "attack",
    FLEE: "flee",
    LOOT: "loot",
    WANDER: "wander",
    PATROL: "patrol",
    CHASE_LAST_SEEN: "chase_last_seen"
  },
  /**
   * Is location b next to (adjacent to) location a?
   *
   * @param {Object} a - The first location with col and row properties.
   * @param {Object} b - The second location with col and row properties.
   * @returns {boolean} True if the locations are adjacent, false otherwise.
   */
  isAdjacent: (a, b) => {
    return b8.Math.distManhattan(a, b) === 1;
  },
  /**
   * Get the direction from one location to another.
   * Returns a direction object with dx and dy.
   *
   * @param {Object} from - The starting location with col and row properties.
   * @param {Object} to - The target location with col and row properties.
   * @returns {Object} An object with dx and dy properties representing the direction.
   */
  dirTo: (from, to) => {
    if (to.col > from.col) return { dx: 1, dy: 0 };
    if (to.col < from.col) return { dx: -1, dy: 0 };
    if (to.row > from.row) return { dx: 0, dy: 1 };
    if (to.row < from.row) return { dx: 0, dy: -1 };
    return { dx: 0, dy: 0 };
  },
  /**
   * Is the 'from' location facing the to location based on direction?
   *
   * @param {Object} from - The id of the entity in the from location.
   * @param {Object} to - The id of the entity in the to location.
   * @returns {boolean} True if 'to' is in front of 'from', false otherwise.
   */
  isFacing: (from, to) => {
    b8.Utilities.checkInt("from", from);
    b8.Utilities.checkInt("to", to);
    const fromDir = b8.ECS.getComponent(from, "Direction");
    const fromLoc = b8.ECS.getComponent(from, "Loc");
    const toLoc = b8.ECS.getComponent(to, "Loc");
    const d = mapper.ai.dirTo(fromLoc, toLoc);
    return fromDir.dx === d.dx && fromDir.dy === d.dy;
  },
  face: (from, to) => {
    const direction = mapper.ai.dirTo(from, to);
    b8.ECS.setComponent(
      from,
      "Direction",
      direction
    );
  },
  /**
   * Is the 'to' location behind the 'from' location based on direction?
   *
   * @param {Object} direction - The direction object with dx and dy.
   * @param {Object} from - The starting location with col and row properties.
   * @param {Object} to - The target location with col and row properties.
   * @returns {boolean} True if 'to' is behind 'from', false otherwise.
   */
  isBehind: (direction, from, to) => {
    const d = mapper.ai.dirTo(from, to);
    return direction.dx === -d.dx && direction.dy === -d.dy;
  },
  /**
   * Determine if there is a line of sight between two locations within a given range,
   * considering solid obstacles.
   *
   * Uses Bresenham's algorithm to step to next tile.
   *
   * Bresenham's line algorithm is used here to determine which tiles
   * the line passes through, allowing us to check for obstacles.
   *
   * The algorithm works by calculating the error term to decide
   * when to step in the y-direction while iterating over x (or vice versa).
   *
   * The error term refers to the difference between the ideal line and the actual
   * rasterized line. By adjusting the error term, we can determine when to
   * increment the y-coordinate as we move along the x-axis (or vice versa),
   * ensuring that we stay as close to the ideal line as possible.
   *
   * @see https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
   *
   * @param { Object } from - The starting location with col and row properties.
   * @param { Object } to - The target location with col and row properties.
   * @param { number } range - The maximum range for line of sight.
   * @param { Function } solidsFn - A function that takes( col, row ) and returns true if the tile is solid.
   * @returns { boolean } True if there is line of sight, false otherwise.
   */
  hasLineOfSight: (fromId, toId, range = 5, solidsFn = mapper.collision.isFree) => {
    const from = b8.ECS.getComponent(fromId, "Loc");
    const to = b8.ECS.getComponent(toId, "Loc");
    const dist = b8.Math.dist2d(from.col, from.row, to.col, to.row);
    if (dist > range) return false;
    if (dist <= 1) return true;
    return true;
    let x0 = from.col;
    let y0 = from.row;
    let x1 = to.col;
    let y1 = to.row;
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let whileCount = 0;
    while (true) {
      whileCount++;
      const tileSize = b8.CONFIG.CHR_WIDTH;
      b8.drawRect(x0 * tileSize, y0 * tileSize, tileSize, tileSize, 2);
      if (!(x0 === from.col && y0 === from.row)) {
        if (solidsFn(x0, y0)) {
          return false;
        }
      }
      if (x0 === x1 && y0 === y1) return true;
      const e2 = err * 2;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
  },
  /**
   * Can the attacker attack the target based on adjacency and facing direction?
   *
   * @param {Object} attacker - The attacker entity with Loc and Direction components.
   * @param {Object} target - The target entity with Loc component.
   * @returns {boolean} True if the attacker can attack the target, false otherwise.
   */
  canAttack: (attacker, target) => {
    const attackerLoc = b8.ECS.getComponent(attacker, "Loc");
    const targetLoc = b8.ECS.getComponent(target, "Loc");
    if (!attackerLoc || !targetLoc) return false;
    if (!mapper.ai.isAdjacent(attackerLoc, targetLoc)) return false;
    return true;
  },
  /**
   * Perform A* pathfinding from start to goal and set the PathIntent component.
   *
   * @param {number} id - The entity ID of the character to move.
   * @param {Object} start - The starting location with col and row properties.
   * @param {Object} goal - The target location with col and row properties.
   * @returns {void}
   */
  doAstar: (start, goal) => {
    return b8.AStar.pathfind(
      start,
      goal,
      mapper.collision.isFree,
      mapper.getMapWidth(),
      mapper.getMapHeight()
    );
  },
  /**
   * Find the nearest loot item to the enemy within a specified range.
   *
   * @param {Object} enemyLoc - The location of the enemy with col and row properties.
   * @param {Array} items - An array of item entities with Loc components.
   * @param {number} maxRange - The maximum range to consider for loot.
   * @returns {Object|null} The nearest loot item entity or null if none found.
   */
  findNearestLoot: (enemyLoc, items, maxRange) => {
    let best = null;
    let bestDist = Infinity;
    items.forEach(
      (item) => {
        const d = b8.Math.distManhattan(enemyLoc, item.Loc);
        if (d <= maxRange && d < bestDist) {
          best = item;
          bestDist = d;
        }
      }
    );
    return best;
  },
  /**
   * Find a random nearby tile within a given radius that satisfies the walkable condition.
   *
   * @param {Object} from - The starting location with col and row properties.
   * @param {number} radius - The radius within which to search for a tile.
   * @returns {Object|null} A location object with col and row properties or null if none found.
   */
  randomNearbyTile: (from, radius) => {
    const tries = 10;
    for (let i = 0; i < tries; i++) {
      const col = from.col + b8.Random.int(-radius, radius);
      const row = from.row + b8.Random.int(-radius, radius);
      if (mapper.collision.isWalkable(col, row) && mapper.collision.isSafe(col, row)) {
        return { col, row };
      }
    }
    for (let i = 0; i < tries; i++) {
      const col = from.col + b8.Random.int(-radius, radius);
      const row = from.row + b8.Random.int(-radius, radius);
      if (mapper.collision.isWalkable(col, row)) return { col, row };
    }
    return false;
  },
  /**
   * Find the index of the nearest tile in a path to a given location.
   *
   * @param {Object} loc The location with col and row properties.
   * @param {Array} tiles An array of tile locations with col and row properties.
   * @returns {number} The index of the nearest tile in the path.
   */
  nearestPathIndex: (loc, tiles) => {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < tiles.length; i++) {
      const d = b8.Math.distManhattan(loc, { col: tiles[i].col, row: tiles[i].row });
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  },
  /**
   * Check if a location is on a given path of tiles.
   *
   * @param {Object} loc The location with col and row properties.
   * @param {Array} tiles An array of tile locations with col and row properties.
   * @param {number} maxDist The maximum distance to consider as "on the path".
   * @returns {Object} An object with onPath (boolean) and index (number) properties.
   */
  isOnPath: (loc, tiles, maxDist = 0) => {
    for (let i = 0; i < tiles.length; i++) {
      if (b8.Math.distManhattan(loc, { col: tiles[i].x, row: tiles[i].y }) <= maxDist) {
        return { near: true, index: i, onPath: true };
      }
    }
    return { onPath: false, index: -1 };
  },
  think: (id) => {
    const ai = b8.ECS.getComponent(id, "AI");
    if (b8.ECS.hasComponent(id, "OnFire")) {
      return mapper.ai.MODE.FLEE;
    }
    if (mapper.ai.canAttack(id, mapper.player)) {
      return mapper.ai.MODE.ATTACK;
    }
    const canSeePlayer = mapper.ai.hasLineOfSight(id, mapper.player);
    if (canSeePlayer) {
      return mapper.ai.MODE.CHASE;
    }
    if (ai.path && ai.path.length > 0) {
      return mapper.ai.MODE.PATROL;
    }
    return mapper.ai.MODE.WANDER;
  },
  toXY: (loc) => ({ x: loc.col, y: loc.row }),
  toLoc: (xy) => ({ col: xy.x, row: xy.y })
};
mapper.camera = {
  /**
   * Get the top-left tile coordinates of the screen the player is currently on.
   *
   * @param {number} pCol - The player's column position.
   * @param {number} pRow - The player's row position.
   * @returns {Object} An object with col, row, w, and h properties representing the screen's top-left tile and dimensions.
   */
  getScreenPosition: function(pCol, pRow) {
    if (!mapper.isValidMapId(mapper.currentMapId)) {
      b8.Utilities.error("No current map set.");
      return { col: 0, row: 0 };
    }
    const currentMap = mapper.getCurrentMap();
    const screenWidth = currentMap.screenWidth;
    const screenHeight = currentMap.screenHeight;
    const screenX = Math.floor(pCol / screenWidth) * screenWidth;
    const screenY = Math.floor(pRow / screenHeight) * screenHeight;
    return { col: screenX, row: screenY, w: screenWidth, h: screenHeight };
  },
  /**
   * Get the on-screen tile coordinates for a given map tile.
   *
   * @param {number} col - The map tile's column position.
   * @param {number} row - The map tile's row position.
   * @returns {Object} An object with col and row properties representing the tile's on-screen position.
   */
  getTilePosition: function(col, row) {
    const loc = b8.ECS.getComponent(mapper.player, "Loc");
    if (!loc) return { col: 0, row: 0 };
    const pos = mapper.camera.getScreenPosition(loc.col, loc.row);
    let tileCol = col - pos.col;
    let tileRow = row - pos.row;
    if (tileCol < 0) tileCol = -100;
    if (tileRow < 0) tileRow = -100;
    if (tileCol >= pos.w) tileCol = -100;
    if (tileRow >= pos.h) tileRow = -100;
    return {
      col: tileCol,
      row: tileRow
    };
  }
};
mapper.collision = {
  /**
   * Check if there is a solid object at (col,row).
   *
   * @param {number} col
   * @param {number} row
   * @returns {boolean}
   */
  isSolid: (col, row) => {
    return b8.ECS.entitiesAt(col, row).some((id) => b8.ECS.hasComponent(id, "Solid"));
  },
  /**
   * Check if (col,row) is safe (no hazards like fire).
   *
   * @param {number} col
   * @param {number} row
   * @returns {boolean}
   */
  isSafe: (col, row) => {
    return !b8.ECS.entitiesAt(col, row).some((id) => b8.ECS.hasComponent(id, "Fire"));
  },
  /**
   * Check if (col,row) is free (walkable and no solid object).
   *
   * @param {number} col
   * @param {number} row
   * @returns {boolean}
   */
  isFree: (col, row) => {
    return mapper.collision.isWalkable(col, row) && !mapper.collision.isSolid(col, row);
  },
  /**
   * Check if (col,row) is walkable (not a wall or closed door).
   *
   * @param {number} col
   * @param {number} row
   * @returns {boolean}
   */
  isWalkable: function(col, row) {
    const currentMap = mapper.getCurrentMap();
    if (col < 0 || row < 0 || col >= currentMap.mapWidth || row >= currentMap.mapHeight) {
      return false;
    }
    let mapCell = currentMap.mapData[row][col];
    if (true === mapCell[3]) return false;
    return true;
  }
};
mapper.helpers = {
  /**
   * Capitalize the first letter of each word in a string.
   *
   * @param {string} str Input string
   * @returns {string} Capitalized string
   */
  capitalizeWords: (str) => {
    return str.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
  },
  /**
   * Process chat text, replacing tokens with dynamic values.
   *
   * @param {string} str Input string
   * @returns {string} Processed string
   */
  processChatText: (str) => {
    str = str.replace(/\[levelName\]/g, b8.data.levelName ?? "Unknown");
    str = str.replace(/\[playerName\]/g, b8.data.playerName ?? "Player");
    str = str.replace(/\[totalCoins\]/g, b8.data.totalCoins ?? "0");
    return str;
  },
  /**
   * Get all map objects of a given type.
   *
   * @param {string} type The object type to search for.
   * @returns {Object[]} Array of matching objects.
   */
  getObjectsByType: (type) => {
    const objects = [];
    for (let l = 0; l < mapper.maps.length; l++) {
      const map = mapper.maps[l];
      for (const obj of map.objects) {
        if (obj.type.startsWith(type)) objects.push(obj);
      }
    }
    return objects;
  }
};
mapper.load = function(mapData) {
  b8.ECS.reset();
  mapper.maps = [];
  mapper.settings = {};
  mapper.currentMapId = null;
  b8.Utilities.checkObject("mapData", mapData);
  if (mapData.version === 1) mapData = mapper.upgradeMapDataV1toV2(mapData);
  mapper.settings = { ...mapData.settings };
  b8.Utilities.checkObject("mapper.settings", mapper.settings);
  mapData.levels.forEach(
    (level, index) => {
      const mapDataString = level.mapData.join("\n");
      b8.Utilities.checkString(`mapDataString for level ${index}`, mapDataString);
      const mapArray = b8.Tilemap.convertFromText(mapDataString);
      const map = b8.Tilemap.createFromArray(mapArray, mapData.tiles);
      const objects = (level.objects || []).map(
        (obj) => ({ ...obj, mapId: index })
      );
      mapper.maps.push(
        {
          "screenWidth": mapData.screenWidth,
          "screenHeight": mapData.screenHeight,
          "screenCountX": level.screenCountX,
          "screenCountY": level.screenCountY,
          "objects": objects,
          "mapWidth": map[0].length,
          "mapHeight": map.length,
          "mapData": map
        }
      );
    }
  );
  if (mapper.settings.gameName) {
    b8.CONFIG.NAME = mapper.settings.gameName;
  }
  mapper.player = mapper.types.player.spawn();
  mapper.lastPosition = {
    col: 0,
    row: 0,
    map: 0
  };
  mapper.setCurrentMap(0);
  let coinCount = 0;
  for (const level of mapper.maps) {
    coinCount += level.objects.filter((obj) => obj.type === "coin").length;
  }
  b8.data.totalCoins = coinCount;
  b8.ECS.addSystem("ai", mapper.systems.ai);
  b8.ECS.addSystem("action-cooldown", mapper.systems.actionCooldown);
  b8.ECS.addSystem("characterAnimation", mapper.systems.characterAnimation);
  b8.ECS.addSystem("pathFollower", mapper.systems.pathFollower);
  b8.ECS.addSystem("sprite", mapper.systems.sprite);
  b8.ECS.addSystem("pickup", mapper.systems.pickup);
  b8.ECS.addSystem("vfx", mapper.systems.vfx);
  b8.ECS.addSystem("health", mapper.systems.health);
  b8.ECS.addSystem("bomb", mapper.systems.bomb);
  b8.ECS.addSystem("fire", mapper.systems.fire);
  b8.ECS.addSystem("fireSmall", mapper.systems.fireSmall);
  b8.ECS.addSystem("flammable", mapper.systems.flammable);
  if (mapper.settings.bgm) b8.Music.play(mapper.settings.bgm);
  if (mapper.settings.splash && mapper.settings.splash.length > 10 && b8.Tilemap.validateTilemap(mapper.settings.splash)) {
    mapper.bg.splash = b8.Tilemap.load(mapper.settings.splash);
  }
};
mapper.upgradeMapDataV1toV2 = function(mapData) {
  const level = {
    mapData: [...mapData.map],
    objects: [...mapData.objects],
    screenCountX: mapData.screenCountX,
    screenCountY: mapData.screenCountY
  };
  mapData.levels = [level];
  mapData.version = 2;
  delete mapData.map;
  delete mapData.objects;
  delete mapData.screenCountX;
  delete mapData.screenCountY;
  return mapData;
};
mapper.setCurrentMap = function(mapId, forceLoad = false) {
  b8.Utilities.checkInt("mapId", mapId);
  if (mapId < 0 || mapId >= mapper.maps.length) {
    b8.Utilities.fatal(`Map ID "${mapId}" is out of bounds.`);
    return;
  }
  if (mapId === mapper.currentMapId && !forceLoad) return;
  mapper.currentMapId = mapId;
  let currentMap = mapper.maps[mapId];
  if (!currentMap.objects) currentMap.objects = [];
  const allEntities = b8.ECS.getAllEntities();
  for (const entityId of allEntities) {
    const typeComp = b8.ECS.getComponent(entityId, "Type");
    if (typeComp?.name === "player") continue;
    b8.ECS.removeEntity(entityId);
  }
  for (const obj of currentMap.objects) {
    const handler = mapper.types[obj.type];
    if (handler?.spawn) handler.spawn(obj.x, obj.y, obj.props);
  }
  mapper.maps[mapper.currentMapId].objects = mapper.maps[mapper.currentMapId].objects.filter(
    (obj) => obj.type !== "start"
  );
};
mapper.menu = {
  /**
   * Get the instructions text.
   *
   * @returns {string} The instructions text.
   */
  getInstructions: function() {
    if (mapper.hasInstructions()) {
      return mapper.settings.instructions;
    }
    return "";
  },
  /**
   * Check if there are instructions available.
   *
   * @returns {boolean} True if instructions are available, false otherwise.
   */
  hasInstructions: function() {
    return !!mapper.settings.instructions;
  },
  /**
   * Get the credits text.
   *
   * @returns {string} The credits text.
   */
  getCredits: function() {
    if (mapper.hasCredits()) {
      return mapper.settings.credits;
    }
    return "";
  },
  /**
   * Check if there are credits available.
   *
   * @returns {boolean} True if credits are available, false otherwise.
   */
  hasCredits: function() {
    return !!mapper.settings.credits;
  },
  /**
   * Draw the splash screen.
   *
   * @returns {void}
   */
  drawSplash: function() {
    if (mapper.bg.splash) {
      b8.Tilemap.draw(mapper.bg.splash);
      b8.locate(b8.CONFIG.SCREEN_COLS - 1, b8.CONFIG.SCREEN_ROWS - 1);
      b8.color(15, 0);
      b8.printChar(88);
    }
  },
  /**
   * Check if there is a splash screen available.
   *
   * @returns {boolean} True if a splash screen is available, false otherwise.
   */
  hasSplash: function() {
    return !!mapper.bg.splash;
  }
};
mapper.pathFollower = {
  DIRS: {
    U: { dx: 0, dy: -1 },
    D: { dx: 0, dy: 1 },
    L: { dx: -1, dy: 0 },
    R: { dx: 1, dy: 0 },
    FU: { dx: 0, dy: -1 },
    FD: { dx: 0, dy: 1 },
    FL: { dx: -1, dy: 0 },
    FR: { dx: 1, dy: 0 }
  },
  VEC_TO_DIR: null,
  animationMap: {
    U: "move-up",
    D: "move-down",
    L: "move-left",
    R: "move-right",
    FU: "idle-up",
    FD: "idle-down",
    FL: "idle-left",
    FR: "idle-right"
  },
  animationInverse: {
    U: "D",
    D: "U",
    L: "R",
    R: "L",
    FU: "FD",
    FD: "FU",
    FL: "FR",
    FR: "FL"
  },
  /**
   * Initialize the path follower module.
   *
   * @returns {void}
   */
  init: function() {
    mapper.pathFollower.VEC_TO_DIR = Object.fromEntries(
      Object.entries(mapper.pathFollower.DIRS).map(([dir, v]) => [`${v.dx},${v.dy}`, dir])
    );
    console.log(mapper.pathFollower.VEC_TO_DIR);
  },
  /**
   * Advance the path index based on the current mode.
   *
   * @param {Object} pf - The PathFollower component.
   * @returns {void}
   */
  advancePathIndex: function(pf) {
    const last = pf.steps.length - 1;
    switch (pf.mode) {
      case b8.Path.AnimationMode.ONCE:
        if (pf.index < last) pf.index++;
        break;
      case b8.Path.AnimationMode.LOOP:
        pf.index = (pf.index + 1) % pf.steps.length;
        break;
      case b8.Path.AnimationMode.PINGPONG:
      default:
        if (pf.index === 0) pf.dirStep = 1;
        else if (pf.index === last) pf.dirStep = -1;
        pf.index += pf.dirStep;
        break;
    }
  },
  /**
   * Get the facing direction string from a vector.
   *
   * @param {Object} vec - The direction vector with `dx` and `dy`.
   * @returns {string|undefined} The direction string (e.g., 'U', 'D', 'L', 'R') or undefined if not found.
   */
  getFaceDirection: function(vec) {
    return mapper.pathFollower.VEC_TO_DIR[`${vec.dx},${vec.dy}`];
  }
};
mapper.pathFollower.init();
mapper.sceneGame = {
  UI: null,
  moveDelay: 0.15,
  /**
   * Initialize the game scene.
   *
   * @returns {void}
   */
  init: function() {
    mapper.sceneGame.UI = b8.Tilemap.load(mapper.CONFIG.gameUI);
  },
  /**
   * Update the game scene.
   *
   * @param {number} dt Delta time in seconds since last frame.
   * @returns {void}
   */
  update: function(dt) {
    mapper.update(dt);
    mapper.sceneGame.moveDelay -= dt;
    if (mapper.sceneGame.moveDelay > 0) return;
    const loc = b8.ECS.getComponent(mapper.player, "Loc");
    let dx = 0, dy = 0, keyPressed = false;
    if (b8.key("ArrowUp")) {
      dy = -1;
      keyPressed = true;
    } else if (b8.key("ArrowDown")) {
      dy = 1;
      keyPressed = true;
    } else if (b8.key("ArrowLeft")) {
      dx = -1;
      keyPressed = true;
    } else if (b8.key("ArrowRight")) {
      dx = 1;
      keyPressed = true;
    }
    if (b8.key("ButtonA")) {
      mapper.doAttack(mapper.player, "ButtonA");
      keyPressed = true;
    }
    if (b8.key("ButtonB")) {
      mapper.doAction(mapper.player, "ButtonB");
      keyPressed = true;
    }
    if (keyPressed) mapper.updateMoveDelay();
    if (dx !== 0 || dy !== 0) {
      let newCol = loc.col + dx;
      let newRow = loc.row + dy;
      mapper.setPlayerWalkAnimation(mapper.player, dx, dy);
      if (!mapper.collision.isWalkable(newCol, newRow) || mapper.doCollision(loc.col, loc.row, newCol, newRow, dx, dy)) {
        newCol = loc.col;
        newRow = loc.row;
      }
      b8.ECS.setComponent(mapper.player, "Direction", { dx, dy });
      b8.ECS.setLoc(mapper.player, newCol, newRow);
    }
  },
  /**
   * Render the game scene.
   *
   * @returns {void}
   */
  render: function() {
    b8.cls(0);
    b8.locate(mapper.CONFIG.mapOffsetX, mapper.CONFIG.mapOffsetY);
    mapper.drawScreen();
    mapper.render(mapper.CONFIG.mapOffsetX, mapper.CONFIG.mapOffsetY);
    b8.locate(0, b8.CONFIG.SCREEN_ROWS - mapper.sceneGame.UI.length);
    b8.Tilemap.draw(mapper.sceneGame.UI);
    b8.locate(2, b8.CONFIG.SCREEN_ROWS - 2);
    b8.color(parseInt(mapper.settings.coinColor) || 10, 0);
    b8.printChar(parseInt(mapper.settings.coin) || 266);
    b8.color(15, 0);
    b8.print(" " + parseInt(b8.Inventory.getCount("coin")).toString().padStart(4, "0"));
    const health = b8.ECS.getComponent(mapper.player, "Health");
    const max = health.max;
    const hp = Math.floor(health.value);
    for (let i = 0; i < Math.floor(max / 2); i++) {
      const x = 2 + i;
      const y = b8.CONFIG.SCREEN_ROWS - 3;
      b8.locate(x, y);
      if (hp >= i * 2 + 2) {
        b8.color(8, 0);
        b8.printChar(415);
      } else if (hp === i * 2 + 1) {
        b8.color(8, 0);
        b8.printChar(416);
      } else {
        b8.color(6, 0);
        b8.printChar(417);
      }
    }
    const keys = b8.Inventory.filter(/^key/);
    keys.forEach(
      (item, index) => {
        const color = parseInt(item.id.split("-")[1]) || 15;
        b8.locate(10 + index, b8.CONFIG.SCREEN_ROWS - 2);
        b8.color(color, -1);
        b8.printChar(255);
      }
    );
    b8.color(15, -1);
    b8.locate(11, b8.CONFIG.SCREEN_ROWS - 4);
    b8.print(" Hit");
    b8.locate(15, b8.CONFIG.SCREEN_ROWS - 4);
    b8.print(mapper.helpers.capitalizeWords(" " + mapper.promptAhead(mapper.player, "ButtonB")));
    return;
  }
};
mapper.sceneGameOver = {
  /**
   * Initialize the menu scene.
   *
   * @returns {void}
   */
  init: function() {
    mapper.sceneGameOver.main();
  },
  /**
   * Draw the main menu.
   *
   * @returns {void}
   */
  main: async () => {
    b8.cls(6);
    b8.locate(0, 5);
    b8.color(10, 6);
    b8.printCentered("GAME OVER\n\n");
    let menuChoices = ["Continue", "Main Menu"];
    let choice = await b8.Async.menu(
      menuChoices,
      {
        border: false,
        padding: 0,
        centerH: true
      }
    );
    const selected = menuChoices[choice];
    if ("Continue" === selected) {
      mapper.continue();
      b8.Scene.set("game");
      return;
    }
    if ("Main Menu" === selected) {
      b8.Scene.set("menu");
      return;
    }
    setTimeout(mapper.sceneGameOver.main, 10);
  }
};
mapper.sceneMenu = {
  /**
   * Initialize the menu scene.
   *
   * @returns {void}
   */
  init: function() {
    if (!mapper.menu.hasSplash()) {
      b8.Scene.set("game");
      return;
    }
    mapper.sceneMenu.main();
  },
  /**
   * Draw the main menu.
   *
   * @returns {void}
   */
  main: async () => {
    b8.locate(0, 0);
    mapper.menu.drawSplash();
    b8.locate(5, 18);
    b8.color(0, 10);
    let menuChoices = ["Start Game"];
    if (mapper.menu.hasInstructions()) menuChoices.push("Instructions");
    if (mapper.menu.hasCredits()) menuChoices.push("Credits");
    let choice = await b8.Async.menu(
      menuChoices,
      {
        border: false,
        padding: 0,
        centerH: true
      }
    );
    const selected = menuChoices[choice];
    if ("Start Game" === selected) {
      mapper.reset();
      b8.Scene.set("game");
      return;
    }
    if ("Instructions" === selected) {
      b8.locate(2, 2);
      b8.color(15, 13);
      const instructions = b8.wrapText(
        mapper.menu.getInstructions(),
        b8.CONFIG.SCREEN_COLS - 6
      );
      await b8.Async.dialog(instructions, ["OK"]);
    }
    if ("Credits" === selected) {
      b8.locate(2, 2);
      b8.color(15, 13);
      const credits = b8.wrapText(
        mapper.menu.getCredits(),
        b8.CONFIG.SCREEN_COLS - 6
      );
      await b8.Async.dialog(credits, ["OK"]);
    }
    setTimeout(mapper.sceneMenu.main, 10);
  }
};
mapper.systems.actionCooldown = function(dt) {
  const ids = b8.ECS.query("ActionCooldown");
  for (const id of ids) {
    const ac = b8.ECS.getComponent(id, "ActionCooldown");
    ac.time -= dt;
    if (ac.time < 0) ac.time = 0;
  }
};
mapper.ai.updateTimer = 0;
mapper.systems.ai = function(dt) {
  mapper.ai.updateTimer += dt;
  if (mapper.ai.updateTimer < mapper.CONFIG.aiUpdateDelay) return;
  mapper.ai.updateTimer = 0;
  const ids = b8.ECS.query("AI", "Loc");
  for (const id of ids) {
    const mode = mapper.ai.think(id);
    const ai = b8.ECS.getComponent(id, "AI");
    if (mode !== ai.mode) {
      ai.mode = mode;
      b8.ECS.setComponent(id, "AI", ai);
    }
    const directions = ["U", "D", "L", "R"];
    const Loc = b8.ECS.getComponent(id, "Loc");
    if (mapper.ai.MODE.WANDER === mode) {
      const direction = b8.Random.pick(directions);
      const distance = b8.Random.int(2, 8);
      const pauseDuration = b8.Random.int(8, 24);
      const pathCode = `${direction}${distance}P${pauseDuration}`;
      const steps = b8.Path.parseCode(
        pathCode,
        Loc.col,
        Loc.row,
        direction
      );
      mapper.types.enemy.setPath(id, steps, b8.Path.AnimationMode.ONCE);
    }
    if (mapper.ai.MODE.PATROL === mode) {
      const pf = b8.ECS.getComponent(id, "PathFollower");
      if (pf?.steps && pf.steps.length > 0) continue;
      const ai2 = b8.ECS.getComponent(id, "AI");
      if (ai2.path && ai2.path.length > 0) {
        const Loc2 = b8.ECS.getComponent(id, "Loc");
        const nearestPathIndex = mapper.ai.nearestPathIndex(Loc2, ai2.path);
        const nearestPathTile = ai2.path[nearestPathIndex];
        if (nearestPathTile.col === Loc2.col && nearestPathTile.row === Loc2.row) {
          mapper.types.enemy.setPath(id, ai2.path, null, nearestPathIndex);
        } else {
          const path = mapper.ai.doAstar(Loc2, nearestPathTile);
          if (path) mapper.types.enemy.setPath(id, path, b8.Path.AnimationMode.ONCE);
        }
      }
    }
    if (mapper.ai.MODE.CHASE === mode) {
      const tileGoal = b8.ECS.getComponent(mapper.player, "Loc");
      if (tileGoal) {
        const path = mapper.ai.doAstar(Loc, tileGoal);
        if (path) {
          mapper.repeatLastValue(path, 12);
          mapper.types.enemy.setPath(id, path, b8.Path.AnimationMode.ONCE);
        }
      }
    }
    if (mapper.ai.MODE.ATTACK === mode) {
      console.log(`Think ATTACK mode (${id})`);
      mapper.doAttack(id, "ButtonA");
    }
    if (mapper.ai.MODE.FLEE === mode) {
      const tile = mapper.ai.randomNearbyTile(Loc, 4);
      if (tile) {
        const path = mapper.ai.doAstar(Loc, tile);
        if (path) mapper.types.enemy.setPath(id, path, b8.Path.AnimationMode.ONCE);
      }
    }
    if (mapper.ai.MODE.LOOT === mode) {
      console.log(`Think LOOT mode (${id})`);
    }
    if (mapper.ai.MODE.IDLE === mode) {
      console.log(`Think IDLE mode (${id})`);
    }
  }
};
mapper.systems.bomb = async function(dt) {
  const bombs = b8.ECS.query("Bomb");
  const color = mapper.types.bomb.color;
  const flickerColor = mapper.types.bomb.flickerColor;
  for (const id of bombs) {
    const bomb = b8.ECS.getComponent(id, "Bomb");
    if (bomb.fuseTime === false) continue;
    bomb.fuseTime -= dt;
    const sprite = b8.ECS.getComponent(id, "Sprite");
    if (bomb.fuseTime > 5) {
      sprite.fg = color;
    } else if (bomb.fuseTime > 2.5) {
      sprite.fg = Math.floor(bomb.fuseTime * 2) % 2 === 0 ? color : flickerColor;
    } else if (bomb.fuseTime > 1) {
      sprite.fg = Math.floor(bomb.fuseTime * 4) % 2 === 0 ? color : flickerColor;
    } else if (bomb.fuseTime > 0) {
      sprite.fg = Math.floor(bomb.fuseTime * 10) % 2 === 0 ? color : flickerColor;
    }
    if (bomb.fuseTime <= 0) {
      const bombLoc = b8.ECS.getComponent(id, "Loc");
      mapper.types.vfx.spawn(bombLoc.col, bombLoc.row, { id: "explosion", fg: 9 });
      await mapper.types.bomb.explode(id);
      b8.ECS.removeEntity(id);
      b8.Renderer.shakeScreen();
      b8.Sfx.play("weapon/explode/013");
    }
  }
  ;
};
mapper.systems.characterAnimation = function(dt) {
  const anims = b8.ECS.query("CharacterAnimation");
  if (!anims) return;
  for (const id of anims) {
    const anim = b8.ECS.getComponent(id, "CharacterAnimation");
    if (!anim) continue;
    if (anim.duration > 0) {
      anim.duration -= dt;
      if (anim.duration <= 0) {
        let defaultAnimation = anim.default || "";
        const direction = b8.ECS.getComponent(id, "Direction");
        if (direction) {
          const directionNames = {
            "0,1": "",
            "0,-1": "-up",
            "1,0": "-right",
            "-1,0": "-left"
          };
          const directionName = directionNames[`${direction.dx},${direction.dy}`] || "";
          defaultAnimation = defaultAnimation + directionName;
        }
        anim.name = defaultAnimation;
      }
    }
  }
};
mapper.systems.fireSmall = async function(dt) {
  const damagePerSecond = mapper.types.fireSmall.damagePerSecond;
  const smallFires = b8.ECS.query("FireSmall");
  smallFires.forEach(
    (entityId) => {
      const smallFire = b8.ECS.getComponent(entityId, "FireSmall");
      const loc = b8.ECS.getComponent(entityId, "Loc");
      const parentLoc = b8.ECS.getComponent(smallFire.parent, "Loc");
      if (parentLoc) {
        loc.col = parentLoc.col;
        loc.row = parentLoc.row;
      }
      const parentHealth = b8.ECS.getComponent(smallFire.parent, "Health");
      if (parentHealth) {
        parentHealth.value -= damagePerSecond * dt;
        if (parentHealth.value < 0) smallFire.duration = 0;
      }
      smallFire.duration -= dt;
      if (smallFire.duration <= 0) {
        b8.ECS.removeEntity(entityId);
        b8.ECS.removeComponent(smallFire.parent, "OnFire");
        if (parentHealth) parentHealth.value = Math.floor(parentHealth.value);
      }
    }
  );
};
mapper.systems.fire = async function(dt) {
  const fires = b8.ECS.query("Fire", "Loc");
  fires.forEach(
    (fireId) => {
      const fire = b8.ECS.getComponent(fireId, "Fire");
      const loc = b8.ECS.getComponent(fireId, "Loc");
      if (fire.duration !== Infinity) {
        fire.duration -= dt;
        if (fire.duration <= 0) {
          b8.ECS.removeEntity(fireId);
          mapper.types.vfx.spawn(
            loc.col,
            loc.row,
            { id: "shrink", fg: 9 }
          );
          return;
        }
      }
      const entitiesAtLocation = b8.ECS.entitiesAt(loc.col, loc.row);
      entitiesAtLocation.forEach(
        (entityId) => {
          if (entityId === fireId) return;
          if (b8.ECS.hasComponent(entityId, "Health")) {
            if (!b8.ECS.hasComponent(entityId, "OnFire")) {
              mapper.types.fireSmall.spawn(
                loc.col,
                loc.row,
                {
                  parent: entityId,
                  duration: 3
                }
              );
              b8.ECS.addComponent(entityId, "OnFire");
            }
          }
          mapper.doHandler(entityId, "burnHandler");
        }
      );
      const nearbyEntities = mapper.entitiesNextTo(fireId);
      nearbyEntities.forEach(
        (entityId) => {
          if (entityId === fireId) return;
          const flammable = b8.ECS.getComponent(entityId, "Flammable");
          if (flammable) {
            flammable.temperature = (flammable.temperature || 0) + 70 * dt;
          }
          mapper.doHandler(entityId, "burnHandler");
        }
      );
    }
  );
};
mapper.systems.flammable = async function(dt) {
  const flammables = b8.ECS.query("Flammable");
  flammables.forEach(
    (entityId) => {
      const flammable = b8.ECS.getComponent(entityId, "Flammable");
      if (flammable.temperature >= 100) {
        const location = b8.ECS.getComponent(entityId, "Loc");
        mapper.types.fire.spawn(
          location.col,
          location.row
        );
        b8.ECS.removeEntity(entityId);
        return;
      }
      flammable.temperature = Math.max(0, (flammable.temperature || 0) - 10 * dt);
    }
  );
};
mapper.systems.health = async function(dt) {
  const entities = b8.ECS.query("Health");
  entities.forEach(
    async (entityId) => {
      const health = b8.ECS.getComponent(entityId, "Health");
      health.cooldownTimer = Math.max(0, (health.cooldownTimer || 0) - dt);
      if (health.cooldownTimer > 0) return;
      if (health.value <= 0) {
        const loc = b8.ECS.getComponent(entityId, "Loc");
        if (loc) {
          mapper.types.vfx.spawn(
            loc.col,
            loc.row,
            { id: "skull", fg: 2, bg: 0, offsetTime: 200 }
          );
        }
        if (entityId !== mapper.player) {
          b8.ECS.removeEntity(entityId);
        } else {
          await b8.Async.wait(1);
          b8.Scene.set("gameover");
        }
      }
    }
  );
};
mapper.systems.pathFollower = async function(dt) {
  const ids = b8.ECS.query("Loc", "PathFollower");
  for (const id of ids) {
    const pf = b8.ECS.getComponent(id, "PathFollower");
    const Loc = b8.ECS.getComponent(id, "Loc");
    if (!pf || !pf.steps.length) continue;
    pf.timer -= dt;
    if (pf.timer > 0) continue;
    pf.timer = mapper.CONFIG.moveDelay * 2;
    const step = pf.steps[pf.index];
    const isPauseStep = Loc.col === step.col && Loc.row === step.row;
    let canMove = isPauseStep;
    if (step.dir && step.dir[0] === "F") canMove = true;
    if (!isPauseStep && mapper.collision.isFree(step.col, step.row)) canMove = true;
    if (!canMove) continue;
    const directionVector = {
      dx: step.col - Loc.col,
      dy: step.row - Loc.row
    };
    b8.ECS.setComponent(id, "Direction", directionVector);
    b8.ECS.setLoc(id, step.col, step.row);
    if (!step.dir) step.dir = mapper.pathFollower.getFaceDirection(directionVector);
    mapper.pathFollower.advancePathIndex(pf);
    const anim = b8.ECS.getComponent(id, "CharacterAnimation");
    anim.duration = 0.5;
    if (mapper.pathFollower.animationMap[step.dir]) {
      let dir = step.dir;
      if (pf.dirStep === -1) dir = mapper.pathFollower.animationInverse[step.dir] || step.dir;
      anim.name = mapper.pathFollower.animationMap[dir];
    }
    if (pf.mode === b8.Path.AnimationMode.ONCE && pf.index >= pf.steps.length - 1) {
      b8.ECS.removeComponent(id, "PathFollower");
    }
  }
};
mapper.systems.pickup = function() {
  const playerId = mapper.player;
  const pLoc = b8.ECS.getComponent(playerId, "Loc");
  const pickupIds = b8.ECS.query("Pickup", "Loc");
  pickupIds.forEach(
    (id) => {
      const loc = b8.ECS.getComponent(id, "Loc");
      if (loc.col !== pLoc.col || loc.row !== pLoc.row) return;
      const pickup = b8.ECS.getComponent(id, "Pickup");
      mapper.giveRewards(
        playerId,
        [{ type: pickup.type, props: pickup.props }]
      );
      if (pickup.consume) {
        b8.ECS.removeEntity(id);
        mapper.removeObjectAt(loc.col, loc.row, pickup.type);
      }
    }
  );
};
mapper.systems.tryPortal = async function(col, row) {
  const id = b8.ECS.entitiesAt(col, row);
  if (!id) return false;
  for (const entityId of id) {
    const portal = b8.ECS.getComponent(entityId, "Portal");
    return mapper.systems.handlePortal(portal);
  }
  return false;
};
mapper.systems.handlePortal = async function(portal) {
  if (!portal) return false;
  if ("" === portal.target) return false;
  const doorways = mapper.helpers.getObjectsByType("door");
  const targetDoorway = doorways.find(
    (door) => {
      return door.props.name === portal.target;
    }
  );
  if (targetDoorway) {
    await b8.Async.wait(0.1);
    mapper.setCurrentMap(targetDoorway.mapId);
    mapper.lastPosition = { col: targetDoorway.x, row: targetDoorway.y, map: targetDoorway.mapId };
    b8.ECS.setLoc(mapper.player, targetDoorway.x, targetDoorway.y);
  }
  return false;
};
mapper.systems.tryPushing = (col, row, dx, dy) => {
  const hitX = col + dx;
  const hitY = row + dy;
  for (const id of b8.ECS.entitiesAt(hitX, hitY)) {
    if (!b8.ECS.hasComponent(id, "Solid")) continue;
    if (!b8.ECS.hasComponent(id, "Pushable")) continue;
    const loc = b8.ECS.getComponent(id, "Loc");
    const newCol = loc.col + dx;
    const newRow = loc.row + dy;
    const blocked = !mapper.collision.isWalkable(newCol, newRow) || b8.ECS.entitiesAt(newCol, newRow).some((e) => b8.ECS.hasComponent(e, "Solid"));
    if (!blocked) {
      b8.ECS.setLoc(id, newCol, newRow);
      b8.Sfx.play("fx/action/drag");
      return false;
    }
    return true;
  }
  return false;
};
mapper.systems.tryPulling = (col, row, dx, dy, playerId) => {
  const hitCol = col + dx;
  const hitRow = row + dy;
  for (const id of b8.ECS.entitiesAt(hitCol, hitRow)) {
    if (!b8.ECS.hasComponent(id, "Solid")) continue;
    if (!b8.ECS.hasComponent(id, "Pushable")) continue;
    const backCol = col - dx;
    const backRow = row - dy;
    if (!mapper.collision.isWalkable(backCol, backRow) || b8.ECS.entitiesAt(backCol, backRow).some((e) => b8.ECS.hasComponent(e, "Solid"))) {
      return false;
    }
    b8.ECS.setLoc(id, col, row);
    b8.ECS.setLoc(playerId, backCol, backRow);
    mapper.setPlayerWalkAnimation(playerId, dx, dy);
    b8.Sfx.play("fx/action/drag");
    return true;
  }
  return false;
};
mapper.systems.sprite = function(dt) {
  const ids = b8.ECS.query("Sprite");
  for (const id of ids) {
    const spr = b8.ECS.getComponent(id, "Sprite");
    if (spr.nudgeCol) {
      spr.nudgeCol = spr.nudgeCol * 0.75;
    }
    if (spr.nudgeRow) {
      spr.nudgeRow = spr.nudgeRow * 0.75;
    }
  }
};
mapper.systems.vfx = async function(dt) {
  const list = b8.ECS.query("Vfx", "Sprite");
  for (const id of list) {
    const sprite = b8.ECS.getComponent(id, "Sprite");
    if (b8.Vfx.shouldLoop(sprite.id, sprite.startTime)) continue;
    b8.ECS.removeEntity(id);
  }
};
mapper.types.skeleton = {
  spawn: function(col, row, props = {}) {
    return b8.ECS.create(
      {}
    );
  },
  pickupHandler: function(playerId, pickup) {
  },
  triggerHandler: function(playerId, id) {
  },
  onCharacterCollision: function(id, newCol, newRow, dx, dy) {
  },
  burnHandler: function(id, fire) {
  }
};
mapper.types.bomb = {
  color: 8,
  flickerColor: 15,
  spawn: function(col, row, props = {}) {
    return b8.ECS.create(
      {
        Type: { name: "bomb" },
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
          ButtonB: "pull",
          ButtonA: "ignite"
        },
        Bomb: {
          fuseTime: false,
          radius: parseInt(props.radius) || 1,
          damage: 2
        }
      }
    );
  },
  /**
   * Handle bomb explosion.
   *
   * @param {number} bombId - The entity ID of the bomb.
   * @returns {Promise<void>} Resolves when the explosion is complete.
   */
  explode: async function(bombId) {
    const bombLoc = b8.ECS.getComponent(bombId, "Loc");
    const bombComp = b8.ECS.getComponent(bombId, "Bomb");
    for (let dx = -bombComp.radius; dx <= bombComp.radius; dx++) {
      for (let dy = -bombComp.radius; dy <= bombComp.radius; dy++) {
        const row = bombLoc.row + dy;
        const col = bombLoc.col + dx;
        if (!mapper.collision.isWalkable(col, row)) continue;
        mapper.types.fire.spawn(col, row);
      }
    }
  },
  burnHandler: function(id) {
    const bomb = b8.ECS.getComponent(id, "Bomb");
    if (bomb.fuseTime !== false) return;
    bomb.fuseTime = 2;
  }
};
mapper.types.chestOpen = {
  spawn: function(col, row, props = {}) {
    const entitySettings = {
      Type: { name: "chest" },
      Loc: { col, row },
      Sprite: {
        tile: 271,
        fg: props.fg || 15,
        bg: props.bg || 0,
        depth: 10
      },
      Solid: {}
    };
    if (props.message) {
      entitySettings.Message = { message: props.message };
      entitySettings.Action = {
        ButtonA: "read",
        ButtonB: "read"
      };
    }
    return b8.ECS.create(entitySettings);
  }
};
mapper.types.chest = {
  items: {
    0: "Empty",
    1: "Key",
    2: "Coin",
    3: "10 Coins",
    4: "50 Coins",
    5: "Half Heart",
    6: "Heart",
    7: "Full Heart"
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
    7: "You found a full heart!"
    // 4: "You found a bomb!",
    // 5: "You found 5 bombs!",
  },
  spawn: function(col, row, props = {}) {
    let items = [];
    let foregroundColor = props.fg || 15;
    let containsType = "";
    if (mapper.types.chest.items[props.contains]) {
      containsType = mapper.types.chest.items[props.contains];
    }
    if (containsType === "Key") {
      items.push(
        {
          type: "key",
          props: { name: `key-${foregroundColor}` }
        }
      );
    }
    if (containsType.endsWith("Coins")) {
      items.push(
        {
          type: "coin",
          props: { amount: parseInt(containsType.split(" ")[0], 10) }
        }
      );
    }
    if (containsType === "Coin") {
      items.push(
        {
          type: "coin",
          props: { amount: 1 }
        }
      );
    }
    if (containsType === "Half Heart") {
      items.push(
        {
          type: "health",
          props: { amount: 1 }
        }
      );
    }
    if (containsType === "Heart") {
      items.push(
        {
          type: "health",
          props: { amount: 2 }
        }
      );
    }
    if (containsType === "Full Heart") {
      items.push(
        {
          type: "health",
          props: { amount: 9999 }
        }
      );
    }
    return b8.ECS.create(
      {
        Type: { name: "chest" },
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
          newType: "chestOpen",
          message: mapper.types.chest.messages[props.contains] || "The chest is empty."
        },
        Message: { message: props.message || "" },
        Reward: { items },
        Action: {
          ButtonA: "open",
          ButtonB: "open"
        }
      }
    );
  }
};
mapper.types.coin = {
  /**
   * Spawn a coin entity.
   *
   * @param {number} col - The column to spawn the coin at.
   * @param {number} row - The row to spawn the coin at.
   * @param {Object} props - Additional properties for the coin.
   * @returns {number} The entity ID of the spawned coin.
   */
  spawn: function(col, row, props = {}) {
    return mapper.types.pickup.spawn(
      col,
      row,
      {
        type: "coin",
        Sprite: {
          tile: parseInt(mapper.settings.coin) || 266,
          fg: mapper.settings.coinColor || 14,
          bg: props.bg || 0
        }
      }
    );
  },
  /**
   * Handle the player picking up the coin.
   *
   * @param {number} playerId - The entity ID of the player.
   * @param {Object} pickup - The Pickup component of the coin.
   * @returns {void}
   */
  pickupHandler: function(playerId, pickup) {
    b8.Inventory.add("coin", pickup?.props?.amount || 1);
    b8.Sfx.play("game/coin/002");
  }
};
mapper.types.crate = {
  spawn: function(col, row, props = {}) {
    return b8.ECS.create(
      {
        Type: { name: "crate" },
        Loc: { col, row },
        Sprite: {
          tile: 352,
          fg: props.fg || 15,
          bg: props.bg || 0,
          depth: 10
        },
        Solid: {},
        Pushable: {},
        Action: { ButtonB: "pull" },
        Flammable: {
          temperature: 20
        }
      }
    );
  }
};
mapper.types.doorOpen = {
  spawn: function(col, row, props = {}) {
    const doorProps = {
      Type: { name: "door" },
      Loc: { col, row },
      Sprite: {
        tile: 216,
        fg: props.fg || 14,
        bg: props.bg || 0
      },
      Portal: {
        name: props.name || null,
        target: props.leadsTo || ""
      }
    };
    return b8.ECS.create(doorProps);
  },
  onCharacterCollision: function(id, newCol, newRow, dx, dy) {
    mapper.systems.tryPortal(newCol, newRow);
    return false;
  }
};
mapper.types.doorStairs = {
  spawn: function(col, row, props = {}) {
    const icon = props.icon || 197;
    const stairsProps = {
      Type: { name: "doorStairs" },
      Loc: { col, row },
      Sprite: {
        tile: icon,
        fg: props.fg || 14,
        bg: props.bg || 0
      },
      Portal: {
        name: props.name || null,
        target: props.leadsTo || ""
      }
    };
    return b8.ECS.create(stairsProps);
  },
  onCharacterCollision: function(id, newCol, newRow, dx, dy) {
    mapper.systems.tryPortal(newCol, newRow);
    return false;
  }
};
mapper.types.door = {
  TILE_DOOR_OPEN: 216,
  TILE_DOOR_DEFAULT: 219,
  FLAMMABLE_DOOR_TILES: [221],
  spawn: function(col, row, props = {}) {
    const icon = parseInt(props.icon) || mapper.types.door.TILE_DOOR_DEFAULT;
    const doorProps = {
      Type: { name: "door" },
      Loc: { col, row },
      Sprite: {
        tile: icon,
        fg: props.fg || 14,
        bg: props.bg || 0
      },
      Portal: {
        name: props.name || null,
        target: props.leadsTo || ""
      }
    };
    if (icon !== mapper.types.door.TILE_DOOR_OPEN) {
      doorProps.Solid = {};
    }
    if (mapper.types.door.FLAMMABLE_DOOR_TILES.includes(icon)) {
      doorProps.Flammable = {
        temperature: 0
      };
    }
    return b8.ECS.create(doorProps);
  },
  onCharacterCollision: function(id, newCol, newRow, dx, dy) {
    if (!b8.ECS.hasComponent(id, "Solid")) {
      mapper.systems.tryPortal(newCol, newRow);
      return false;
    }
    const sprite = b8.ECS.getComponent(id, "Sprite");
    const keyName = `key-${sprite.fg ?? "default"}`;
    if (b8.Inventory.has(keyName)) {
      mapper.types.door.openDoor(id, sprite);
      return true;
    }
    return true;
  },
  /**
   * Open the door by changing its sprite and removing solid component.
   *
   * @param {number} id - The entity ID of the door.
   * @param {Object} sprite - The Sprite component of the door.
   * @returns {void}
   */
  openDoor: function(id, sprite) {
    sprite.tile = mapper.types.door.TILE_DOOR_OPEN;
    b8.ECS.removeComponent(id, "Solid");
    b8.ECS.removeComponent(id, "Flammable");
    b8.Sfx.play("ui/click/004");
    const loc = b8.ECS.getComponent(id, "Loc");
    mapper.changeObjectTypeAt(
      loc.col,
      loc.row,
      "door",
      "doorOpen"
    );
  },
  /**
   * Handle burning of door entities.
   *
   * @param {number} id - The entity ID of the door.
   * @returns {boolean} False to prevent removal of the door entity.
   */
  burnHandler: function(id) {
    const sprite = b8.ECS.getComponent(id, "Sprite");
    if (sprite.tile === mapper.types.door.TILE_DOOR_OPEN) return;
    mapper.types.door.openDoor(id, sprite);
    const loc = b8.ECS.getComponent(id, "Loc");
    mapper.types.fire.spawn(
      loc.col,
      loc.row
    );
    return false;
  }
};
mapper.types.enemy = {
  // Properties [ health, attack, color ]
  difficulties: {
    "Easy": [3, 1, 11],
    "Medium": [5, 2, 9],
    "Hard": [8, 3, 8]
  },
  spawn: function(col, row, props = {}) {
    const initialDirection = "D";
    const difficulty = props.health || "Easy";
    const [health, attack, color] = mapper.types.enemy.difficulties[difficulty] || mapper.types.enemy.difficulties["Easy"];
    const characterProperties = {
      Type: { name: "enemy" },
      Loc: { col, row },
      Direction: { dx: 0, dy: 1 },
      // initial 'D'
      Sprite: {
        type: "actor",
        tile: parseInt(props.actor) || 6,
        fg: color || 15,
        bg: 0,
        depth: 50
      },
      Solid: {},
      AI: {
        mode: mapper.ai.MODE.NONE,
        // current intent: patrol|chase|attack|flee|loot|idle
        startLoc: { col, row },
        // starting location for patrols
        targetId: mapper.player,
        // entity id (player, item, etc)
        props: {
          canLoot: false,
          canDrop: false,
          viewRange: 5
        }
      },
      CharacterAnimation: {
        name: "idle",
        default: "idle",
        duration: 0
      },
      Health: {
        value: health || 3,
        max: health || 3,
        cooldown: mapper.CONFIG.healthCooldown || 1
      },
      Attack: {
        value: attack || 1
      },
      AttackTarget: {},
      Action: { ButtonA: "attack" }
    };
    let steps = [];
    if (props.path && b8.Path.validPathSyntax(props.path)) {
      steps = b8.Path.parseCode(
        props.path,
        col,
        // startCol
        row,
        // startRow
        initialDirection
        // initialDir
      );
      characterProperties.AI.path = steps;
    }
    ;
    const id = b8.ECS.create(characterProperties);
    return id;
  },
  setPath: function(id, steps, animationMode = null, index = 0) {
    if (!animationMode || animationMode === null) {
      const Loc = b8.ECS.getComponent(id, "Loc");
      animationMode = b8.Path.AnimationMode.PINGPONG;
      const lastStep = steps.length - 1;
      if (steps[lastStep].col === Loc.col && steps[lastStep].row === Loc.row) {
        animationMode = b8.Path.AnimationMode.LOOP;
      }
    }
    b8.ECS.setComponent(
      id,
      "PathFollower",
      {
        steps,
        index,
        mode: animationMode,
        dirStep: 1,
        timer: 0,
        startDir: "D"
      }
    );
  }
};
mapper.types.fireSmall = {
  damagePerSecond: 0.75,
  spawn: function(col, row, props = {}) {
    if (!props.parent) return;
    return b8.ECS.create(
      {
        Type: { name: "fire-small" },
        Loc: { col, row },
        Sprite: {
          type: "vfx-outline",
          id: "fire-small",
          offsetY: -4,
          startTime: b8.Core.getNow(),
          fg: mapper.types.fire.color,
          bg: 0,
          depth: 100
        },
        FireSmall: {
          duration: props.duration || 3,
          parent: props.parent
        }
      }
    );
  }
};
mapper.types.fire = {
  damagePerSecond: 3,
  color: 10,
  spawn: function(col, row, props = {}) {
    if (mapper.hasEntityAt(col, row, "fire")) return null;
    let duration = parseInt(props.duration);
    if (duration === 0) {
      duration = Infinity;
    } else {
      duration = isNaN(duration) ? 5 : duration;
      duration += b8.Random.range(0, 2);
    }
    return b8.ECS.create(
      {
        Type: { name: "fire" },
        Loc: { col, row },
        Sprite: {
          type: "vfx",
          id: "fire",
          startTime: b8.Core.getNow() + b8.Random.int(0, 400),
          fg: mapper.types.fire.color,
          bg: 0
        },
        Fire: {
          duration
        }
      }
    );
  }
};
mapper.types.healthFull = {
  spawn: function(col, row, props = {}) {
    return mapper.types.pickup.spawn(
      col,
      row,
      {
        type: "health",
        // Set this health pickup to a large amount,
        // It will fully heal the player.
        // The value will be capped at max health in the handler.
        props: { amount: 1e3 },
        Sprite: {
          tile: 414,
          fg: 10,
          bg: 0
        }
      }
    );
  }
  // pickupHandler()
  // Handled by mapper.types.health.pickupHandler
};
mapper.types.healthHalf = {
  spawn: function(col, row, props = {}) {
    return mapper.types.pickup.spawn(
      col,
      row,
      {
        type: "health",
        props: { amount: 1 },
        Sprite: {
          tile: 416,
          fg: 8,
          bg: 0
        }
      }
    );
  }
  // pickupHandler()
  // Handled by mapper.types.health.pickupHandler
};
mapper.types.health = {
  spawn: function(col, row, props = {}) {
    return mapper.types.pickup.spawn(
      col,
      row,
      {
        type: "health",
        props: { amount: 2 },
        Sprite: {
          tile: 415,
          fg: 8,
          bg: 0
        }
      }
    );
  },
  /**
   * Handle the player picking up the health pickup.
   *
   * @param {number} playerId - The entity ID of the player.
   * @param {Object} pickup - The Pickup component of the health item.
   * @returns {void}
   */
  pickupHandler: function(playerId, pickup) {
    const health = b8.ECS.getComponent(playerId, "Health");
    health.value = Math.min(health.max, health.value + (pickup.props.amount || 1));
  }
};
mapper.types.key = {
  /**
   * Spawn a key entity at the specified location.
   *
   * @param {number} col - The column to spawn the key at.
   * @param {number} row - The row to spawn the key at.
   * @param {Object} props - Additional properties for the key (e.g., fg, bg colors).
   * @returns {number} The entity ID of the spawned key.
   */
  spawn: function(col, row, props = {}) {
    const color = props.fg || 14;
    return mapper.types.pickup.spawn(
      col,
      row,
      {
        type: "key",
        props: { name: `key-${color}` },
        Sprite: {
          tile: 255,
          fg: props.fg || 14,
          bg: props.bg || 0
        }
      }
    );
  },
  /**
   * Handle the player picking up the key.
   *
   * @param {number} playerId - The entity ID of the player.
   * @param {Object} pickup - The Pickup component of the key.
   * @returns {void}
   */
  pickupHandler: function(playerId, pickup) {
    b8.Inventory.add(pickup.props.name);
    b8.Sfx.play("tone/bloop/006");
  }
};
mapper.types.pickup = {
  spawn: function(col, row, props = {}) {
    if (!props.type) return;
    return b8.ECS.create(
      {
        Type: { name: "pickup" },
        Loc: { col, row },
        Sprite: {
          tile: props.Sprite.tile ?? 415,
          fg: props.Sprite.fg ?? 8,
          bg: props.Sprite.bg ?? 0
        },
        Pickup: {
          // 'health', 'coin', 'key', etc
          type: props.type,
          // remove after pickup
          consume: props.consume ?? true,
          // Custom attributes for handler function
          props: props.props || {}
        }
      }
    );
  }
};
mapper.types.player = {
  spawn: function(col = 0, row = 0, props = {}) {
    const player = b8.ECS.create(
      {
        Type: { name: "player" },
        Loc: { row: row || 0, col: col || 0 },
        Direction: { dx: 0, dy: 1 },
        Sprite: {
          type: "actor",
          tile: parseInt(mapper.settings.character) || 6,
          fg: parseInt(mapper.settings.characterColor) || 10,
          bg: 0,
          depth: 100
        },
        Solid: {},
        CharacterAnimation: {
          name: "idle",
          default: "idle",
          duration: 0
        },
        Health: {
          cooldown: mapper.CONFIG.healthCooldown || 1,
          value: 6,
          max: 12
        },
        Attack: {
          value: 1
        },
        AttackTarget: {},
        Action: { ButtonA: "attack" }
      }
    );
    return player;
  }
};
mapper.types.signpost = {
  spawn: function(col, row, props = {}) {
    return b8.ECS.create(
      {
        Type: { name: "signpost" },
        Loc: { col, row },
        Sprite: {
          tile: props.icon || 252,
          fg: props.fg || 15,
          bg: props.bg || 0
        },
        Solid: {},
        Message: { message: props.message || "" },
        Action: {
          ButtonA: "trigger",
          ButtonB: "read"
        }
      }
    );
  },
  /**
   * Handle the signpost being triggered (Button A).
   *
   * @param {number} id - The entity ID of the signpost.
   * @returns {void}
   */
  triggerHandler: function(playerId, id) {
    const sprite = b8.ECS.getComponent(id, "Sprite");
    if (sprite.tile !== 252) return;
    sprite.tile = 270;
    if (!b8.ECS.hasComponent(id, "Message")) return;
    const message = b8.ECS.getComponent(id, "Message");
    b8.ECS.addComponent(id, "Action", { ButtonA: "read", ButtonB: "read" });
    message.message = "... " + message.message.slice(Math.floor(message.message.length / 2));
  }
};
mapper.types.start = {
  spawn: function(col, row, props = {}) {
    mapper.lastPosition = {
      col,
      row,
      map: mapper.currentMapId
    };
    b8.ECS.setLoc(mapper.player, col, row);
  }
};
mapper.types.vfx = {
  spawn: function(col, row, props = {}) {
    if (!props.id) return {};
    return b8.ECS.create(
      {
        Type: { name: "vfx" },
        Loc: { col, row },
        Vfx: {},
        Sprite: {
          type: props.type || "vfx",
          id: props.id,
          startTime: b8.Core.getNow() + (props.offsetTime || 0),
          fg: parseInt(props.fg) || 15,
          bg: parseInt(props.bg) || 0,
          nudgeCol: parseInt(props.nudgeCol) || 0,
          nudgeRow: parseInt(props.nudgeRow) || 0,
          depth: 101
        }
      }
    );
  }
};
//# sourceMappingURL=plugin.mapper.js.map
