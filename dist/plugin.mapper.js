const mapper = {
  maps: [],
  currentMap: null,
  types: {},
  systems: {},
  actions: {},
  settings: {},
  bg: {},
  player: null,
  play: function(mapData) {
    beep8.Utilities.checkObject("mapData", mapData);
    mapper.load(mapData);
    beep8.Scene.add("menu", mapper.sceneMenu);
    beep8.Scene.add("game", mapper.sceneGame);
    beep8.Scene.set("menu");
  },
  load: function(mapData, mapName = "world", setCurrentMap = true) {
    beep8.Utilities.checkObject("mapData", mapData);
    const mapDataString = mapData.map.join("\n");
    beep8.Utilities.checkString("mapDataString", mapDataString);
    mapper.settings = { ...mapData.settings };
    beep8.Utilities.checkObject("mapper.settings", mapper.settings);
    console.log("settings", mapper.settings);
    mapper.player = beep8.ECS.create(
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
    const maze = beep8.Tilemap.convertFromText(mapDataString);
    const map = beep8.Tilemap.createFromArray(maze, mapData.tiles);
    console.log("map", map);
    console.log("maze", maze);
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
    beep8.ECS.addSystem("characterAnimation", mapper.systems.characterAnimation);
    if (mapper.settings.bgm) {
      beep8.Music.play(world.settings.bgm);
    }
    if (mapper.settings.splash && mapper.settings.splash.length > 10 && beep8.Tilemap.validateTilemap(mapper.settings.splash)) {
      mapper.bg.splash = beep8.Tilemap.load(mapper.settings.splash);
    }
  },
  update: function(dt) {
    beep8.ECS.run(dt);
  },
  drawActor: function(actor) {
    if (!mapper.currentMap) {
      beep8.Utilities.error("No current map set.");
      return;
    }
    const screenPosition = mapper.camera.getScreenPosition(actor.col, actor.row);
    const actorX = actor.col - screenPosition.col;
    const actorY = actor.row - screenPosition.row;
    beep8.locate(actorX + offsetX, actorY + offsetY);
    beep8.color(actor.fg, actor.bg);
    beep8.drawActor(actor.id, actor.animation);
  },
  render: function(offsetX2 = 0, offsetY2 = 0) {
    const list = [];
    for (const id of beep8.ECS.query("Sprite", "Loc")) {
      const spr = beep8.ECS.getComponent(id, "Sprite");
      const loc = beep8.ECS.getComponent(id, "Loc");
      const anim = beep8.ECS.getComponent(id, "CharacterAnimation");
      list.push({ spr, loc, anim });
    }
    if (list.length === 0) return;
    list.sort((a, b) => (a.spr.depth ?? 0) - (b.spr.depth ?? 0));
    for (const { spr, loc, anim } of list) {
      const pos = mapper.camera.getTilePosition(loc.col, loc.row);
      beep8.locate(pos.col + offsetX2, pos.row + offsetY2);
      beep8.color(spr.fg ?? 15, spr.bg ?? 0);
      if ("actor" === spr.type) {
        beep8.drawActor(parseInt(spr.tile), anim.name);
      } else {
        beep8.printChar(parseInt(spr.tile));
      }
    }
  },
  drawScreen: function() {
    if (!mapper.currentMap) {
      beep8.Utilities.error("No current map set.");
      return;
    }
    const loc = beep8.ECS.getComponent(mapper.player, "Loc");
    const screenPosition = mapper.camera.getScreenPosition(loc.col, loc.row);
    const currentMap = mapper.currentMap;
    beep8.Tilemap.draw(
      currentMap.map,
      screenPosition.col,
      screenPosition.row,
      screenPosition.w,
      screenPosition.h
    );
  },
  setCurrentMap: function(mapName) {
    let currentMap = mapper.maps.find((map) => map.name === mapName);
    if (!currentMap) {
      console.error(`Map "${mapName}" not found.`);
      return;
    }
    mapper.currentMap = currentMap;
  },
  setTile: function(x, y, tile) {
    if (!mapper.currentMap) {
      beep8.Utilities.error("No current map set.");
      return;
    }
    if (x < 0 || y < 0 || y >= mapper.currentMap.map.mapHeight || x >= mapper.currentMap.map.mapWidth) {
      beep8.Utilities.error("Mapper.setTile, coordinates out of bounds.");
      return;
    }
    mapper.currentMap.map[y][x] = tile;
  },
  getVerbForEntity: (id) => {
    const a = beep8.ECS.getComponent(id, "Action");
    return a?.verb ?? "";
  },
  promptAhead: (playerId) => {
    const ids = mapper.entitiesAhead(playerId);
    for (const id of ids) {
      const verb = mapper.getVerbForEntity(id);
      if (verb) return verb;
    }
    return "";
  },
  // Tile in front of the player
  ahead: (playerId) => {
    const loc = beep8.ECS.getComponent(playerId, "Loc");
    const dir = beep8.ECS.getComponent(playerId, "Direction");
    const x = loc.col + (dir.dx || 0);
    const y = loc.row + (dir.dy || 0);
    return { x, y };
  },
  // Entities on that tile
  entitiesAhead: (playerId) => {
    const { x, y } = mapper.ahead(playerId);
    return beep8.ECS.entitiesAt(x, y) ?? [];
  },
  doCollision: function(x, y, newCol, newRow, dx, dy) {
    if (mapper.systems.tryPushing(x, y, dx, dy)) return true;
    for (const id of beep8.ECS.entitiesAt(newCol, newRow)) {
      const typeComp = beep8.ECS.getComponent(id, "Type");
      const handler = typeComp ? mapper.types[typeComp.name] : null;
      if (handler?.onCharacterCollision) {
        const blocked = handler.onCharacterCollision(id, newCol, newRow, dx, dy);
        if (blocked) return true;
      }
      const isSolid = beep8.ECS.hasComponent(id, "Solid");
      if (isSolid) return true;
    }
    return false;
  },
  doAction: (playerId) => {
    const action = mapper.promptAhead(playerId);
    console.log("do action ", action);
    if (action && mapper.actions[action]) {
      mapper.actions[action](playerId);
    }
  }
};
mapper.CONFIG = {
  spikeInterval: 1,
  // Time in seconds for spikes to toggle state
  moveDelay: 0.15,
  // Time in seconds for player movement delay
  /**
   * Offset to apply when drawing the map and actors.
   * This is to account for any borders or UI elements.
   */
  mapOffsetX: 1,
  mapOffsetY: 1,
  gameUI: `hpgYhRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGJUHAACghRiVBwAAoIUYlQcAAKCFGJUKAACgmBiFGBwHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFDAYHAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGB0HBgCghRgZBwgAoIUYIAgHAKCFGCsHBgCghRkBXAoAAKCYGIUYKwYHAKCFEgAHAKCFAAgAAKCFAAgAAKCFAAgAAKCFAwEAAKCFAAgAAKCFAA8AAKCFEwAHAKCFAQcGAKCFGQG0CgcAoIUBBwYAoIUBBwYAoIUBBwYAoIUZAbUKBwCghQEHBgCghQEHBgCghQEHBgCghQEHBgCghREGBwCghQAAAACghRMABwCghRgrBwYAoIUZAV4KAACgmBiFGCsGBwCghQEABwCghRkBnwgAAKCFGQGfCAAAoIUZAZ8IAACghRkBnwgAAKCFGQGfCAAAoIUZAZ8IAACghQEABwCghRg9AAEAoIUYPQABAKCFGD0AAQCghRg9AAEAoIUYPQABAKCFGD0AAQCghRg9AAEAoIUYPQABAKCFGD4AAQCghQEHBgCghRgrBwYAoIUAAAAAoIUAAAAAoIUYKwcGAKCFGQFdCgAAoJgYhRgrBgcAoIUBAAcAoIUBAAEAoIUADgAAoIUADwAAoIUADwAAoIUADwAAoIUADwAAoIUAAQAAoIUABQEAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUYUAABAKCFAAYHAKCFGCsHBgCghQAAAACghRglAAcAoIUYKwcGAKCFGQFeCgAAoJgYhRguBwYAoIUBAAEAoIUAAQAAoIUAAQAAoIUAAQAAoIUAAQAAoIURAQAAoIURAQAAoIUBAAEAoIUYYQABAKCFGGEAAQCghRhhAAEAoIUYYQABAKCFGGEAAQCghRhhAAEAoIURBgEAoIURBgEAoIUYYgABAKCFEQYHAKCFGC8HBgCghRgZBgcAoIUYGQYHAKCFGDEHBgCghRkBXQoAAKA=`
};
mapper.actions.pull = function(playerId) {
  const loc = beep8.ECS.getComponent(playerId, "Loc");
  const dir = beep8.ECS.getComponent(playerId, "Direction");
  mapper.systems.tryPulling(loc.col, loc.row, dir.dx, dir.dy, playerId);
};
mapper.actions.read = async function(playerId) {
  const entities = mapper.entitiesAhead(playerId);
  for (const id of entities) {
    const obj = beep8.ECS.getComponent(id, "Message");
    const sprite = beep8.ECS.getComponent(id, "Sprite");
    if (!obj || !sprite) continue;
    beep8.color(sprite.fg ?? 15, sprite.bg ?? 5);
    await beep8.Async.dialogTypewriter(obj.message, ["OK"], 20);
  }
};
mapper.camera = {
  getScreenPosition: function(pCol, pRow) {
    if (!mapper.currentMap) {
      beep8.Utilities.error("No current map set.");
      return { col: 0, row: 0 };
    }
    const currentMap = mapper.currentMap;
    const screenWidth = currentMap.screenWidth;
    const screenHeight = currentMap.screenHeight;
    const screenX = Math.floor(pCol / screenWidth) * screenWidth;
    const screenY = Math.floor(pRow / screenHeight) * screenHeight;
    return { col: screenX, row: screenY, w: screenWidth, h: screenHeight };
  },
  getTilePosition: function(col, row) {
    const loc = beep8.ECS.getComponent(mapper.player, "Loc");
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
  isSolidAt: (col, row) => {
    return beep8.ECS.entitiesAt(col, row).some((id) => beep8.ECS.hasComponent(id, "Solid"));
  },
  isFree: (col, row) => {
    return mapper.collision.isWalkable(col, row) && !mapper.collision.isSolidAt(col, row);
  },
  // Returns true if (col,row) is inside the maze and not a wall or closed door.
  isWalkable: function(col, row) {
    if (col < 0 || row < 0 || col >= mapper.currentMap.map.mapHeight || row >= mapper.currentMap.map.mapWidth) {
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
  capitalizeWords: (str) => {
    return str.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
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
      beep8.Tilemap.draw(mapper.bg.splash);
      console.log("Drawing Beep8 logo");
      beep8.locate(beep8.CONFIG.SCREEN_COLS - 1, beep8.CONFIG.SCREEN_ROWS - 1);
      beep8.color(15, 0);
      beep8.printChar(88);
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
  init: function() {
    console.log(mapper.CONFIG);
    mapper.sceneGame.UI = beep8.Tilemap.load(mapper.CONFIG.gameUI);
  },
  update: function(dt) {
    mapper.CONFIG.moveDelay -= dt;
    if (mapper.CONFIG.moveDelay > 0) return;
    const loc = beep8.ECS.getComponent(mapper.player, "Loc");
    const anim = beep8.ECS.getComponent(mapper.player, "CharacterAnimation");
    if (mapper.CONFIG.moveDelay > 0) return;
    let dx = 0, dy = 0;
    if (beep8.keyp("ArrowUp")) {
      dy = -1;
    } else if (beep8.keyp("ArrowDown")) {
      dy = 1;
    } else if (beep8.keyp("ArrowLeft")) {
      dx = -1;
    } else if (beep8.keyp("ArrowRight")) {
      dx = 1;
    }
    if (beep8.keyp("ButtonB")) mapper.doAction(mapper.player);
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
      beep8.ECS.set(mapper.player, "Direction", { dx, dy });
      beep8.ECS.setLoc(mapper.player, newCol, newRow);
      mapper.CONFIG.moveDelay = 0.15;
    }
    mapper.update(dt);
  },
  render: function() {
    beep8.cls();
    beep8.locate(mapper.CONFIG.mapOffsetX, mapper.CONFIG.mapOffsetY);
    mapper.drawScreen();
    mapper.render(mapper.CONFIG.mapOffsetX, mapper.CONFIG.mapOffsetY);
    beep8.locate(0, beep8.CONFIG.SCREEN_ROWS - mapper.sceneGame.UI.length);
    beep8.Tilemap.draw(mapper.sceneGame.UI);
    beep8.locate(2, beep8.CONFIG.SCREEN_ROWS - 2);
    beep8.color(mapper.settings.coinColor, 0);
    beep8.printChar(mapper.settings.coin || 266);
    beep8.color(15, 0);
    beep8.print(" " + parseInt(beep8.Inventory.getCount("coin")).toString().padStart(4, "0"));
    const keys = beep8.Inventory.filter(/^key/);
    keys.forEach(
      (item, index) => {
        const color = parseInt(item.id.split("-")[1]) || 15;
        beep8.locate(10 + index, beep8.CONFIG.SCREEN_ROWS - 2);
        beep8.color(color, -1);
        beep8.printChar(255);
      }
    );
    beep8.color(15, -1);
    beep8.locate(11, beep8.CONFIG.SCREEN_ROWS - 4);
    beep8.print(" ");
    beep8.locate(15, beep8.CONFIG.SCREEN_ROWS - 4);
    beep8.print(mapper.helpers.capitalizeWords(" " + mapper.promptAhead(mapper.player)));
    return;
  }
};
mapper.sceneMenu = {
  init: function() {
    if (!mapper.menu.hasSplash()) return;
    mapper.sceneMenu.main();
  },
  main: async () => {
    beep8.locate(0, 0);
    mapper.menu.drawSplash();
    beep8.locate(5, 18);
    beep8.color(0, 10);
    let menuChoices = ["Start Game"];
    if (mapper.menu.hasInstructions()) menuChoices.push("Instructions");
    if (mapper.menu.hasCredits()) menuChoices.push("Credits");
    let choice = await beep8.Async.menu(
      menuChoices,
      {
        border: false,
        padding: 0,
        centerH: true
      }
    );
    const selected = menuChoices[choice];
    if ("Start Game" === selected) {
      beep8.Scene.set("game");
      return;
    }
    if ("Instructions" === selected) {
      beep8.locate(2, 2);
      beep8.color(15, 13);
      const instructions = beep8.wrapText(
        mapper.menu.getInstructions(),
        beep8.CONFIG.SCREEN_COLS - 6
      );
      await beep8.Async.dialog(instructions, ["OK"]);
    }
    if ("Credits" === selected) {
      beep8.locate(2, 2);
      beep8.color(15, 13);
      const credits = beep8.wrapText(
        mapper.menu.getCredits(),
        beep8.CONFIG.SCREEN_COLS - 6
      );
      await beep8.Async.dialog(credits, ["OK"]);
    }
    setTimeout(mapper.sceneMenu.main, 10);
  }
};
mapper.systems.characterAnimation = function(dt) {
  const anims = beep8.ECS.query("CharacterAnimation");
  if (!anims) return;
  for (const id of anims) {
    const anim = beep8.ECS.getComponent(id, "CharacterAnimation");
    if (!anim) continue;
    if (anim.duration > 0) {
      anim.duration -= dt;
      if (anim.duration <= 0) {
        let defaultAnimation = anim.default || "";
        const direction = beep8.ECS.getComponent(id, "Direction");
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
  const id = beep8.ECS.entitiesAt(col, row);
  console.log("Checking for portal at", col, row, id);
  if (!id) return false;
  for (const entityId of id) {
    const portal = beep8.ECS.getComponent(entityId, "Portal");
    return mapper.systems.handlePortal(portal);
  }
};
mapper.systems.handlePortal = async function(portal) {
  if (!portal) return false;
  if (portal.target === "") return false;
  const doorways = beep8.ECS.query("Portal");
  const targetDoorway = doorways.find(
    (id) => {
      const targetPortal = beep8.ECS.getComponent(id, "Portal");
      return targetPortal.name === portal.target;
    }
  );
  if (targetDoorway) {
    const targetLoc = beep8.ECS.getComponent(targetDoorway, "Loc");
    if (targetLoc) {
      await beep8.Async.wait(0.1);
      beep8.ECS.setLoc(mapper.player, targetLoc.col, targetLoc.row);
    }
  }
  return false;
};
mapper.systems.tryPushing = (col, row, dx, dy) => {
  const hitX = col + dx;
  const hitY = row + dy;
  for (const id of beep8.ECS.entitiesAt(hitX, hitY)) {
    if (!beep8.ECS.hasComponent(id, "Solid")) continue;
    if (!beep8.ECS.hasComponent(id, "Pushable")) continue;
    const loc = beep8.ECS.getComponent(id, "Loc");
    const newCol = loc.col + dx;
    const newRow = loc.row + dy;
    const blocked = !mapper.collision.isWalkable(newCol, newRow) || beep8.ECS.entitiesAt(newCol, newRow).some((e) => beep8.ECS.hasComponent(e, "Solid"));
    if (!blocked) {
      beep8.ECS.setLoc(id, newCol, newRow);
      beep8.Sfx.play("fx/action/drag");
      return false;
    }
    return true;
  }
  return false;
};
mapper.systems.tryPulling = (col, row, dx, dy, playerId) => {
  const hitCol = col + dx;
  const hitRow = row + dy;
  for (const id of beep8.ECS.entitiesAt(hitCol, hitRow)) {
    if (!beep8.ECS.hasComponent(id, "Solid")) continue;
    if (!beep8.ECS.hasComponent(id, "Pushable")) continue;
    const backCol = col - dx;
    const backRow = row - dy;
    if (!mapper.collision.isWalkable(backCol, backRow) || beep8.ECS.entitiesAt(backCol, backRow).some((e) => beep8.ECS.hasComponent(e, "Solid"))) {
      return false;
    }
    beep8.ECS.setLoc(id, col, row);
    beep8.ECS.setLoc(playerId, backCol, backRow);
    beep8.Sfx.play("fx/action/drag");
    return true;
  }
  return false;
};
mapper.systems.teleportSystem = async function(dt) {
  const list = beep8.ECS.query("Teleport");
  for (const [id, teleport] of list) {
    const doorways = beep8.ECS.query("Portal");
    const targetDoorway = doorways.find(
      ([targetId]) => {
        const targetPortal = beep8.ECS.getComponent(targetId, "Portal");
        return targetPortal?.name === teleport.target;
      }
    );
    if (targetDoorway) {
      const targetLoc = beep8.ECS.getComponent(targetDoorway[0], "Loc");
      if (targetLoc) {
        await beep8.Async.wait(0.1);
        beep8.ECS.setLoc(id, targetLoc.col, targetLoc.row);
      }
    }
    beep8.ECS.removeComponent(id, "Teleport");
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
    return beep8.ECS.create(
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
    beep8.ECS.removeEntity(id);
    beep8.Inventory.add("coin");
    beep8.Sfx.play("game/coin/002");
    return false;
  }
};
mapper.types.crate = {
  spawn: function(col, row, props) {
    return beep8.ECS.create(
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
    return beep8.ECS.create(doorProps);
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
    return beep8.ECS.create(stairsProps);
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
    return beep8.ECS.create(doorProps);
  },
  onCharacterCollision: function(id, newCol, newRow, dx, dy) {
    if (!beep8.ECS.hasComponent(id, "Solid")) {
      mapper.systems.tryPortal(newCol, newRow);
      return false;
    }
    const sprite = beep8.ECS.getComponent(id, "Sprite");
    const keyName = `key-${sprite.fg ?? "default"}`;
    if (beep8.Inventory.has(keyName)) {
      beep8.ECS.removeComponent(id, "Solid");
      sprite.tile = mapper.types.door.TILE_DOOR_OPEN;
      beep8.Sfx.play("ui/click/004");
      return true;
    }
    return true;
  }
};
mapper.types.key = {
  spawn: function(col, row, props) {
    return beep8.ECS.create(
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
    const keyName = `key-${beep8.ECS.getComponent(id, "Sprite").fg ?? "default"}`;
    beep8.Inventory.add(keyName);
    beep8.ECS.removeEntity(id);
    beep8.Sfx.play("tone/bloop/006");
    return false;
  }
};
mapper.types.signpost = {
  spawn: function(col, row, props) {
    return beep8.ECS.create(
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
    beep8.ECS.setLoc(mapper.player, col, row);
  }
};
//# sourceMappingURL=plugin.mapper.js.map
