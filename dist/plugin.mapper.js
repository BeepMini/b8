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
  // The player entity ID.
  player: null,
  // Cooldown timer for actions such as key presses.
  actionCooldown: 0,
  /**
   * Initialize and start the game with the provided map data.
   *
   * @param {Object} mapData - The map data object containing map layout, tiles, objects, and settings.
   * @returns {void}
   */
  play: function(mapData) {
    b8.Utilities.checkObject("mapData", mapData);
    mapper.load(mapData);
    b8.Scene.add("menu", mapper.sceneMenu);
    b8.Scene.add("game", mapper.sceneGame);
    b8.Scene.set("menu");
  },
  /**
   * Update the game state.
   *
   * @param {number} dt - The delta time since the last update call.
   * @returns {void}
   */
  update: function(dt) {
    b8.ECS.run(dt);
    mapper.actionCooldown -= dt;
    if (mapper.actionCooldown < 0) mapper.actionCooldown = 0;
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
  delayKeyPress: function() {
    mapper.actionCooldown = mapper.CONFIG.keyPressDelay;
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
      b8.locate(pos.col + offsetX2, pos.row + offsetY2);
      b8.color(spr.fg ?? 15, spr.bg ?? 0);
      switch (spr.type) {
        case "actor":
          let nudgeCol = 0;
          let nudgeRow = 0;
          if (spr.nudgeCol) nudgeCol = spr.nudgeCol;
          if (spr.nudgeRow) nudgeRow = spr.nudgeRow;
          b8.drawActor(parseInt(spr.tile), anim.name, nudgeCol, nudgeRow);
          break;
        case "vfx":
          b8.Vfx.draw(spr.id, spr.startTime);
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
   * @returns {string} The action verb associated with the entity, or an empty string if none exists.
   */
  getVerbForEntity: (id) => {
    const a = b8.ECS.getComponent(id, "Action");
    return a?.verb ?? "";
  },
  /**
   * Get the currently active map.
   *
   * @returns {Object} The current map object.
   */
  getCurrentMap: () => {
    return mapper.maps[mapper.currentMapId];
  },
  /**
   * Get the action verb for the entity directly in front of the player.
   *
   * @param {number} playerId - The player entity ID.
   * @returns {string} The action verb of the entity ahead, or an empty string if none exists.
   */
  promptAhead: (playerId) => {
    const ids = mapper.entitiesAhead(playerId);
    for (const id of ids) {
      const verb = mapper.getVerbForEntity(id);
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
   * @returns {void}
   */
  doAction: (playerId) => {
    if (mapper.actionCooldown > 0) return;
    const action = mapper.promptAhead(playerId);
    if (action && mapper.actions[action]) {
      mapper.actions[action](playerId);
    }
  },
  /**
   * Perform an attack action for the specified player.
   *
   * @param {number} playerId - The entity ID of the player.
   * @returns {void}
   */
  doAttack: (playerId) => {
    const ahead = mapper.ahead(playerId);
    console.log("doAttack");
    const ids = mapper.entitiesAhead(playerId);
    for (const targetId of ids) {
      if (targetId === playerId) continue;
      if (b8.ECS.hasComponent(targetId, "AttackTarget")) {
        const targetHealth = b8.ECS.getComponent(targetId, "Health");
        const playerAttack = b8.ECS.getComponent(playerId, "Attack") || { value: 1 };
        targetHealth.value -= playerAttack.value;
        if (targetHealth.value <= 0) {
          b8.ECS.removeEntity(targetId);
          mapper.types.vfx.spawn(
            ahead.x,
            ahead.y,
            { id: "skull", fg: 2, bg: 0 }
          );
          return;
        }
        break;
      }
    }
    mapper.types.vfx.spawn(
      ahead.x,
      ahead.y,
      { id: "swipe", fg: 15, bg: 0 }
    );
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
   * Change the type of an object at the given coordinates in the current map.
   *
   * @param {number} col - The column coordinate of the object to change.
   * @param {number} row - The row coordinate of the object to change.
   * @param {string} type - The current type of the object to change.
   * @param {string} newType - The new type to set for the object.
   * @returns {void}
   */
  changeObjectTypeAt: function(col, row, type, newType) {
    console.log("changeObjectTypeAt", col, row, type, newType);
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
  }
};
mapper.CONFIG = {
  // Time in seconds for player movement delay.
  moveDelay: 0.2,
  // Key press delay.
  keyPressDelay: 0.25,
  /**
   * Offset to apply when drawing the map and actors.
   * This is to account for any borders or UI elements.
   */
  mapOffsetX: 1,
  mapOffsetY: 1,
  // UI graphics.
  gameUI: `hpgYhRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGJUHAACghRiVBwAAoIUYlQcAAKCFGJUKAACgmBiFGBwHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFDAYHAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGB0HBgCghRgZBwgAoIUYIAgHAKCFGCsHBgCghRkBXAoAAKCYGIUYKwYHAKCFEgAHAKCFAAgAAKCFAAgAAKCFAAgAAKCFAwEAAKCFAAgAAKCFAA8AAKCFEwAHAKCFAQcGAKCFGQG0CgcAoIUBBwYAoIUBBwYAoIUBBwYAoIUZAbUKBwCghQEHBgCghQEHBgCghQEHBgCghQEHBgCghREGBwCghQAAAACghRMABwCghRgrBwYAoIUZAV4KAACgmBiFGCsGBwCghQEABwCghRkBnwgAAKCFGQGfCAAAoIUZAZ8IAACghRkBnwgAAKCFGQGfCAAAoIUZAZ8IAACghQEABwCghRg9AAEAoIUYPQABAKCFGD0AAQCghRg9AAEAoIUYPQABAKCFGD0AAQCghRg9AAEAoIUYPQABAKCFGD4AAQCghQEHBgCghRgrBwYAoIUAAAAAoIUAAAAAoIUYKwcGAKCFGQFdCgAAoJgYhRgrBgcAoIUBAAcAoIUBAAEAoIUADgAAoIUADwAAoIUADwAAoIUADwAAoIUADwAAoIUAAQAAoIUABQEAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUYUAABAKCFAAYHAKCFGCsHBgCghQAAAACghRglAAcAoIUYKwcGAKCFGQFeCgAAoJgYhRguBwYAoIUBAAEAoIUAAQAAoIUAAQAAoIUAAQAAoIUAAQAAoIURAQAAoIURAQAAoIUBAAEAoIUYYQABAKCFGGEAAQCghRhhAAEAoIUYYQABAKCFGGEAAQCghRhhAAEAoIURBgEAoIURBgEAoIUYYgABAKCFEQYHAKCFGC8HBgCghRgZBgcAoIUYGQYHAKCFGDEHBgCghRkBXQoAAKA=`
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
    const rewards = b8.ECS.getComponent(id, "Reward");
    mapper.giveRewards(playerId, rewards?.items || []);
    b8.ECS.removeComponent(id, "Reward");
    b8.ECS.removeComponent(id, "Action");
    b8.ECS.removeComponent(id, "Openable");
    const messageComponent = b8.ECS.getComponent(id, "Message");
    if (messageComponent?.message?.length > 0) {
      b8.ECS.addComponent(id, "Action", { verb: "read" });
    }
    mapper.delayKeyPress();
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
    mapper.delayKeyPress();
    return;
  }
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
   */
  isSolidAt: (col, row) => {
    return b8.ECS.entitiesAt(col, row).some((id) => b8.ECS.hasComponent(id, "Solid"));
  },
  /**
   * Check if (col,row) is free (walkable and no solid object).
   *
   * @param {number} col
   * @param {number} row
   * @returns {boolean}
   */
  isFree: (col, row) => {
    return mapper.collision.isWalkable(col, row) && !mapper.collision.isSolidAt(col, row);
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
      const maze = b8.Tilemap.convertFromText(mapDataString);
      const map = b8.Tilemap.createFromArray(maze, mapData.tiles);
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
  mapper.player = b8.ECS.create(
    {
      Type: { name: "player" },
      Loc: { row: 0, col: 0 },
      Direction: { dx: 0, dy: 0 },
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
        value: 2,
        max: 12
      },
      Attack: {
        value: 1
      }
    }
  );
  mapper.setCurrentMap(0);
  let coinCount = 0;
  for (const level of mapper.maps) {
    coinCount += level.objects.filter((obj) => obj.type === "coin").length;
  }
  b8.data.totalCoins = coinCount;
  b8.ECS.addSystem("characterAnimation", mapper.systems.characterAnimation);
  b8.ECS.addSystem("pathFollower", mapper.systems.pathFollower);
  b8.ECS.addSystem("sprite", mapper.systems.sprite);
  b8.ECS.addSystem("bumpAttack", mapper.systems.bumpAttack);
  b8.ECS.addSystem("pickup", mapper.systems.pickup);
  b8.ECS.addSystem("vfx", mapper.systems.vfx);
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
mapper.setCurrentMap = function(mapId) {
  b8.Utilities.checkInt("mapId", mapId);
  if (mapId < 0 || mapId >= mapper.maps.length) {
    b8.Utilities.fatal(`Map ID "${mapId}" is out of bounds.`);
    return;
  }
  if (mapId === mapper.currentMapId) return;
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
  mapper.currentMapId = mapId;
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
    if (b8.key("ButtonB")) {
      mapper.doAction(mapper.player);
      keyPressed = true;
    }
    if (b8.key("ButtonA")) {
      mapper.doAttack(mapper.player);
      keyPressed = true;
    }
    if (keyPressed) mapper.sceneGame.moveDelay = mapper.CONFIG.moveDelay;
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
    b8.color(mapper.settings.coinColor, 0);
    b8.printChar(mapper.settings.coin || 266);
    b8.color(15, 0);
    b8.print(" " + parseInt(b8.Inventory.getCount("coin")).toString().padStart(4, "0"));
    const health = b8.ECS.getComponent(mapper.player, "Health");
    const max = health.max;
    const hp = health.value;
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
    b8.print(" ");
    b8.locate(15, b8.CONFIG.SCREEN_ROWS - 4);
    b8.print(mapper.helpers.capitalizeWords(" " + mapper.promptAhead(mapper.player)));
    return;
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
mapper.systems.bumpAttack = function(dt) {
  const ids = b8.ECS.query("BumpAttack");
  for (const id of ids) {
    const bump = b8.ECS.getComponent(id, "BumpAttack");
    const targetId = bump.targetId;
    if (!b8.ECS.hasComponent(targetId, "Health")) {
      b8.ECS.removeComponent(id, "BumpAttack");
      continue;
    }
    const targetHealth = b8.ECS.getComponent(targetId, "Health");
    const attackerAttack = b8.ECS.getComponent(id, "Attack") || { value: 1 };
    targetHealth.value -= attackerAttack.value;
    if (targetHealth.value <= 0) {
      b8.ECS.removeEntity(targetId);
    }
    b8.ECS.removeComponent(id, "BumpAttack");
  }
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
mapper.systems.pathFollower = async function(dt) {
  const animationMap = {
    "U": "move-up",
    "D": "move-down",
    "L": "move-left",
    "R": "move-right",
    "FU": "idle-up",
    "FD": "idle-down",
    "FL": "idle-left",
    "FR": "idle-right"
  };
  const animationInverse = {
    "U": "D",
    "D": "U",
    "L": "R",
    "R": "L",
    "FU": "FD",
    "FD": "FU",
    "FL": "FR",
    "FR": "FL"
  };
  const ids = b8.ECS.query("Loc", "PathFollower");
  for (const id of ids) {
    const pf = b8.ECS.getComponent(id, "PathFollower");
    if (!pf) continue;
    if (!pf.steps.length) continue;
    pf.timer -= dt;
    if (pf.timer > 0) continue;
    pf.timer = mapper.CONFIG.moveDelay * 2;
    const step = pf.steps[pf.index];
    let canMove = false;
    if (step.dir && step.dir[0] === "F") canMove = true;
    if (mapper.collision.isWalkable(step.x, step.y) && !mapper.collision.isSolidAt(step.x, step.y)) {
      canMove = true;
    }
    if (!canMove) continue;
    b8.ECS.setLoc(id, step.x, step.y);
    _advancePathIndex(pf);
    const anim = b8.ECS.getComponent(id, "CharacterAnimation");
    anim.duration = 0.5;
    if (animationMap[step.dir]) {
      let direction = step.dir;
      if (pf.dirStep === -1) {
        direction = animationInverse[step.dir] || step.dir;
      }
      anim.name = animationMap[direction];
    }
  }
  function _advancePathIndex(pf) {
    const last = pf.steps.length - 1;
    switch (pf.mode) {
      // Advance index until the last step, then stop.
      case "once":
        if (pf.index < last) pf.index++;
        break;
      // Advance index and loop back to start after last step.
      case "loop":
        pf.index = (pf.index + 1) % pf.steps.length;
        break;
      // Advance index back and forth between first and last step.
      case "pingpong":
      default:
        if (pf.index === 0) {
          pf.dirStep = 1;
        } else if (pf.index === last) {
          pf.dirStep = -1;
        }
        pf.index += pf.dirStep;
        break;
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
mapper.systems.teleportSystem = async function(dt) {
  const list = b8.ECS.query("Teleport");
  for (const [id, teleport] of list) {
    const doorways = b8.ECS.query("Portal");
    const targetDoorway = doorways.find(
      ([targetId]) => {
        const targetPortal = b8.ECS.getComponent(targetId, "Portal");
        return targetPortal?.name === teleport.target;
      }
    );
    if (targetDoorway) {
      const targetLoc = b8.ECS.getComponent(targetDoorway[0], "Loc");
      if (targetLoc) {
        await b8.Async.wait(0.1);
        b8.ECS.setLoc(id, targetLoc.col, targetLoc.row);
      }
    }
    b8.ECS.removeComponent(id, "Teleport");
  }
};
mapper.systems.vfx = async function(dt) {
  const list = b8.ECS.query("Vfx", "Sprite");
  for (const id of list) {
    const sprite = b8.ECS.getComponent(id, "Sprite");
    const animation = b8.Vfx.get(sprite.id);
    if (animation) {
      if (b8.Animation.shouldLoop(animation, sprite.startTime)) continue;
    }
    b8.ECS.removeEntity(id);
  }
};
mapper.types.skeleton = {};
mapper.types.chestOpen = {
  spawn: function(col, row, props) {
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
      entitySettings.Message = { text: props.message };
      entitySettings.Action = { verb: "read" };
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
  spawn: function(col, row, props) {
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
          newType: "chestOpen"
        },
        Message: { message: props.message || "" },
        Reward: { items },
        Action: {
          verb: "open"
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
  spawn: function(col, row, props) {
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
  spawn: function(col, row, props) {
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
        Action: { verb: "pull" }
      }
    );
  }
};
mapper.types.doorOpen = {
  spawn: function(col, row, props) {
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
  spawn: function(col, row, props) {
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
  spawn: function(col, row, props) {
    const icon = props.icon || mapper.types.door.TILE_DOOR_DEFAULT;
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
      b8.ECS.removeComponent(id, "Solid");
      sprite.tile = mapper.types.door.TILE_DOOR_OPEN;
      b8.Sfx.play("ui/click/004");
      return true;
    }
    return true;
  }
};
mapper.types.enemy = {
  // Properties [ health, attack, color ]
  difficulties: {
    "Easy": [3, 1, 11],
    "Medium": [5, 2, 9],
    "Hard": [8, 3, 8]
  },
  spawn: function(col, row, props) {
    const initialDirection = "D";
    const difficulty = props.health || "Easy";
    const [health, attack, color] = mapper.types.enemy.difficulties[difficulty] || mapper.types.enemy.difficulties["Easy"];
    const characterProperties = {
      Type: { name: "enemy" },
      Loc: { col, row },
      Sprite: {
        type: "actor",
        tile: parseInt(props.actor) || 6,
        fg: color || 15,
        bg: 0,
        depth: 50
      },
      Solid: {},
      CharacterAnimation: {
        name: "idle",
        default: "idle",
        duration: 0
      },
      AttackTarget: {},
      Health: {
        value: health || 3,
        max: health || 3
      },
      Attack: {
        value: attack || 1
      }
    };
    if (props.path && b8.Path.validPathSyntax(props.path)) {
      let mode = props.mode || "pingpong";
      const steps = b8.Path.parseCode(
        props.path,
        col,
        // startCol
        row,
        // startRow
        initialDirection
        // initialDir
      );
      const lastStep = steps.length - 1;
      if (steps[lastStep].x === col && steps[lastStep].y === row) {
        mode = "loop";
      }
      characterProperties.PathFollower = {
        steps,
        index: 0,
        mode,
        dirStep: 1,
        // for pingpong direction: 1 or -1
        timer: 0,
        // accumulates dt
        startDir: props.startDir || initialDirection
      };
    }
    ;
    return b8.ECS.create(characterProperties);
  }
};
mapper.types.healthFull = {
  spawn: function(col, row, props) {
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
  spawn: function(col, row, props) {
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
  spawn: function(col, row, props) {
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
  spawn: function(col, row, props) {
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
mapper.types.signpost = {
  spawn: function(col, row, props) {
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
        Action: { verb: "read" }
      }
    );
  }
};
mapper.types.start = {
  spawn: function(col, row, props) {
    b8.ECS.setLoc(mapper.player, col, row);
  }
};
mapper.types.vfx = {
  spawn: function(col, row, props) {
    if (!props.id) return {};
    return b8.ECS.create(
      {
        Type: { name: "vfx" },
        Loc: { col, row },
        Vfx: {},
        Sprite: {
          type: "vfx",
          id: props.id,
          startTime: b8.Core.getNow(),
          fg: props.fg || 15,
          bg: props.bg || 0,
          depth: 50
        }
      }
    );
  }
};
//# sourceMappingURL=plugin.mapper.js.map
