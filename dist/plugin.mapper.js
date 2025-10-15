const mapper = {
  // All loaded maps.
  maps: [],
  // Currently active map.
  currentMap: null,
  // Map of entity types to their handlers.
  types: {},
  systems: {},
  actions: {},
  settings: {},
  bg: {},
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
    mapper.load(mapData);
    b8.Scene.add("menu", mapper.sceneMenu);
    b8.Scene.add("game", mapper.sceneGame);
    b8.Scene.set("menu");
  },
  /**
   * Load a map into the game.
   *
   * @param {Object} mapData - The map data object containing map layout, tiles, objects, and settings.
   * @param {string} mapName - The name to assign to the loaded map.
   * @param {boolean} setCurrentMap - Whether to set this map as the current active map.
   * @returns {void}
   */
  load: function(mapData, mapName = "world", setCurrentMap = true) {
    b8.Utilities.checkObject("mapData", mapData);
    b8.ECS.reset();
    mapper.maps = [];
    mapper.currentMap = null;
    const mapDataString = mapData.map.join("\n");
    b8.Utilities.checkString("mapDataString", mapDataString);
    mapper.settings = { ...mapData.settings };
    b8.Utilities.checkObject("mapper.settings", mapper.settings);
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
        CharacterAnimation: {
          name: "idle",
          default: "idle",
          duration: 0
        }
      }
    );
    const maze = b8.Tilemap.convertFromText(mapDataString);
    const map = b8.Tilemap.createFromArray(maze, mapData.tiles);
    mapper.maps.push(
      {
        "name": mapName,
        "screenWidth": mapData.screenWidth,
        "screenHeight": mapData.screenHeight,
        "screenCountX": mapData.screenCountX,
        "screenCountY": mapData.screenCountY,
        "mapWidth": map[0].length,
        "mapHeight": map.length,
        "map": map
      }
    );
    if (setCurrentMap) {
      mapper.setCurrentMap(mapName);
    }
    for (const obj of mapData.objects) {
      const handler = mapper.types[obj.type];
      if (handler?.spawn) {
        shouldAdd = handler.spawn(obj.x, obj.y, obj.props);
      }
    }
    const start = mapData.objects.find((obj) => obj.type === "start");
    if (!start) {
      b8.Utilities.fatal("Map data must include a 'start' object.");
    }
    const coinCount = mapData.objects.filter((obj) => obj.type === "coin").length;
    b8.data.totalCoins = coinCount;
    b8.ECS.addSystem("characterAnimation", mapper.systems.characterAnimation);
    if (mapper.settings.bgm) {
      b8.Music.play(world.settings.bgm);
    }
    if (mapper.settings.splash && mapper.settings.splash.length > 10 && b8.Tilemap.validateTilemap(mapper.settings.splash)) {
      mapper.bg.splash = b8.Tilemap.load(mapper.settings.splash);
    }
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
    if (!mapper.currentMap) {
      b8.Utilities.error("No current map set.");
      return;
    }
    const screenPosition = mapper.camera.getScreenPosition(actor.col, actor.row);
    const actorX = actor.col - screenPosition.col;
    const actorY = actor.row - screenPosition.row;
    b8.locate(actorX + offsetX, actorY + offsetY);
    b8.color(actor.fg, actor.bg);
    b8.drawActor(actor.id, actor.animation);
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
      if ("actor" === spr.type) {
        b8.drawActor(parseInt(spr.tile), anim.name);
      } else {
        b8.printChar(parseInt(spr.tile));
      }
    }
  },
  /**
   * Draw the visible portion of the current map to the screen.
   *
   * @returns {void}
   */
  drawScreen: function() {
    if (!mapper.currentMap) {
      b8.Utilities.error("No current map set.");
      return;
    }
    const loc = b8.ECS.getComponent(mapper.player, "Loc");
    const screenPosition = mapper.camera.getScreenPosition(loc.col, loc.row);
    const currentMap = mapper.currentMap;
    b8.Tilemap.draw(
      currentMap.map,
      screenPosition.col,
      screenPosition.row,
      screenPosition.w,
      screenPosition.h
    );
  },
  /**
   * Set the current active map by name.
   *
   * @param {string} mapName - The name of the map to set as current.
   * @returns {void}
   */
  setCurrentMap: function(mapName) {
    let currentMap = mapper.maps.find((map) => map.name === mapName);
    if (!currentMap) {
      console.error(`Map "${mapName}" not found.`);
      return;
    }
    mapper.currentMap = currentMap;
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
    const action = mapper.promptAhead(playerId);
    console.log("do action ", action);
    if (action && mapper.actions[action]) {
      mapper.actions[action](playerId);
    }
  }
};
mapper.CONFIG = {
  // Time in seconds for player movement delay.
  moveDelay: 0.15,
  /**
   * Offset to apply when drawing the map and actors.
   * This is to account for any borders or UI elements.
   */
  mapOffsetX: 1,
  mapOffsetY: 1,
  // UI graphics.
  gameUI: `hpgYhRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGJUHAACghRiVBwAAoIUYlQcAAKCFGJUKAACgmBiFGBwHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFDAYHAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGB0HBgCghRgZBwgAoIUYIAgHAKCFGCsHBgCghRkBXAoAAKCYGIUYKwYHAKCFEgAHAKCFAAgAAKCFAAgAAKCFAAgAAKCFAwEAAKCFAAgAAKCFAA8AAKCFEwAHAKCFAQcGAKCFGQG0CgcAoIUBBwYAoIUBBwYAoIUBBwYAoIUZAbUKBwCghQEHBgCghQEHBgCghQEHBgCghQEHBgCghREGBwCghQAAAACghRMABwCghRgrBwYAoIUZAV4KAACgmBiFGCsGBwCghQEABwCghRkBnwgAAKCFGQGfCAAAoIUZAZ8IAACghRkBnwgAAKCFGQGfCAAAoIUZAZ8IAACghQEABwCghRg9AAEAoIUYPQABAKCFGD0AAQCghRg9AAEAoIUYPQABAKCFGD0AAQCghRg9AAEAoIUYPQABAKCFGD4AAQCghQEHBgCghRgrBwYAoIUAAAAAoIUAAAAAoIUYKwcGAKCFGQFdCgAAoJgYhRgrBgcAoIUBAAcAoIUBAAEAoIUADgAAoIUADwAAoIUADwAAoIUADwAAoIUADwAAoIUAAQAAoIUABQEAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUYUAABAKCFAAYHAKCFGCsHBgCghQAAAACghRglAAcAoIUYKwcGAKCFGQFeCgAAoJgYhRguBwYAoIUBAAEAoIUAAQAAoIUAAQAAoIUAAQAAoIUAAQAAoIURAQAAoIURAQAAoIUBAAEAoIUYYQABAKCFGGEAAQCghRhhAAEAoIUYYQABAKCFGGEAAQCghRhhAAEAoIURBgEAoIURBgEAoIUYYgABAKCFEQYHAKCFGC8HBgCghRgZBgcAoIUYGQYHAKCFGDEHBgCghRkBXQoAAKA=`
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
    b8.color(sprite.fg ?? 15, sprite.bg ?? 5);
    const message = mapper.helpers.processChatText(obj.message || "");
    await b8.Async.dialogTypewriter(message, ["OK"], 20);
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
    if (!mapper.currentMap) {
      b8.Utilities.error("No current map set.");
      return { col: 0, row: 0 };
    }
    const currentMap = mapper.currentMap;
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
    if (col < 0 || row < 0 || col >= mapper.currentMap.mapWidth || row >= mapper.currentMap.mapHeight) {
      return false;
    }
    let mapCell = mapper.currentMap.map[row][col];
    if (true === mapCell[3]) {
      return false;
    }
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
  }
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
      console.log("Drawing b8 logo");
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
  /**
   * Initialize the game scene.
   *
   * @returns {void}
   */
  init: function() {
    console.log(mapper.CONFIG);
    mapper.sceneGame.UI = b8.Tilemap.load(mapper.CONFIG.gameUI);
  },
  /**
   * Update the game scene.
   *
   * @param {number} dt Delta time in seconds since last frame.
   * @returns {void}
   */
  update: function(dt) {
    mapper.CONFIG.moveDelay -= dt;
    if (mapper.CONFIG.moveDelay > 0) return;
    const loc = b8.ECS.getComponent(mapper.player, "Loc");
    const anim = b8.ECS.getComponent(mapper.player, "CharacterAnimation");
    if (mapper.CONFIG.moveDelay > 0) return;
    let dx = 0, dy = 0;
    if (b8.keyp("ArrowUp")) {
      dy = -1;
    } else if (b8.keyp("ArrowDown")) {
      dy = 1;
    } else if (b8.keyp("ArrowLeft")) {
      dx = -1;
    } else if (b8.keyp("ArrowRight")) {
      dx = 1;
    }
    if (b8.keyp("ButtonB")) mapper.doAction(mapper.player);
    if (dx !== 0 || dy !== 0) {
      let newCol = loc.col + dx;
      let newRow = loc.row + dy;
      if (dy > 0) anim.name = "move-down";
      if (dy < 0) anim.name = "move-up";
      if (dx > 0) anim.name = "move-right";
      if (dx < 0) anim.name = "move-left";
      anim.duration = 0.3;
      if (!mapper.collision.isWalkable(newCol, newRow) || mapper.doCollision(loc.col, loc.row, newCol, newRow, dx, dy)) {
        newCol = loc.col;
        newRow = loc.row;
      }
      b8.ECS.set(mapper.player, "Direction", { dx, dy });
      b8.ECS.setLoc(mapper.player, newCol, newRow);
      mapper.CONFIG.moveDelay = 0.15;
    }
    mapper.update(dt);
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
mapper.systems.tryPortal = async function(col, row) {
  const id = b8.ECS.entitiesAt(col, row);
  console.log("Checking for portal at", col, row, id);
  if (!id) return false;
  for (const entityId of id) {
    const portal = b8.ECS.getComponent(entityId, "Portal");
    return mapper.systems.handlePortal(portal);
  }
};
mapper.systems.handlePortal = async function(portal) {
  if (!portal) return false;
  if (portal.target === "") return false;
  const doorways = b8.ECS.query("Portal");
  const targetDoorway = doorways.find(
    (id) => {
      const targetPortal = b8.ECS.getComponent(id, "Portal");
      return targetPortal.name === portal.target;
    }
  );
  if (targetDoorway) {
    const targetLoc = b8.ECS.getComponent(targetDoorway, "Loc");
    if (targetLoc) {
      await b8.Async.wait(0.1);
      b8.ECS.setLoc(mapper.player, targetLoc.col, targetLoc.row);
    }
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
    b8.Sfx.play("fx/action/drag");
    return true;
  }
  return false;
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
mapper.types.skeleton = {
  init: function(obj) {
  },
  onCharacterCollision: async function(obj, newCol, newRow, dx, dy) {
  },
  update: function(obj) {
  },
  render: function(obj, offsetX2 = 0, offsetY2 = 0) {
  }
};
mapper.types.coin = {
  spawn: function(col, row, props) {
    return b8.ECS.create(
      {
        Type: { name: "coin" },
        Loc: { col, row },
        Sprite: {
          tile: parseInt(mapper.settings.coin) || 266,
          fg: props.fg || 14,
          bg: props.bg || 0
        }
      }
    );
  },
  onCharacterCollision: function(id) {
    b8.ECS.removeEntity(id);
    b8.Inventory.add("coin");
    b8.Sfx.play("game/coin/002");
    return false;
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
mapper.types.key = {
  spawn: function(col, row, props) {
    return b8.ECS.create(
      {
        Type: { name: "key" },
        Loc: { col, row },
        Sprite: {
          tile: 255,
          fg: props.fg || 14,
          bg: props.bg || 0
        }
      }
    );
  },
  onCharacterCollision: function(id, newCol, newRow, dx, dy) {
    const keyName = `key-${b8.ECS.getComponent(id, "Sprite").fg ?? "default"}`;
    b8.Inventory.add(keyName);
    b8.ECS.removeEntity(id);
    b8.Sfx.play("tone/bloop/006");
    return false;
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
//# sourceMappingURL=plugin.mapper.js.map
