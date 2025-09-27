/*!
 * beep8.js - A Retro Game Library
 *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 * ░░░░       ░░        ░        ░       ░░░     ░░░░░        ░░      ░░░░░
 * ▒▒▒▒  ▒▒▒▒  ▒  ▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒  ▒▒▒▒  ▒  ▒▒▒  ▒▒▒▒▒▒▒▒▒▒  ▒  ▒▒▒▒▒▒▒▒▒▒
 * ▓▓▓▓       ▓▓      ▓▓▓      ▓▓▓       ▓▓▓     ▓▓▓▓▓▓▓▓▓▓▓  ▓▓      ▓▓▓▓▓
 * ████  ████  █  ███████  ███████  ███████  ███  ████  ████  ███████  ████
 * ████       ██        █        █  ████████     ██  ██      ███      █████
 * ████████████████████████████████████████████████████████████████████████
 *
 * beep8.js is a retro game library designed to bring
 * the charm and simplicity of classic games to modern
 * web development. A fork of qx82, beep8.js retains
 * the original's elegance while enhancing its features
 * for today's developers.
 *
 * ---
 *
 * Website: https://beep8.com
 * Games: https://beepmini.com
 * Github: https://github.com/BinaryMoon/beep8
 * BlueSky: https://bsky.app/profile/binarymoon.bsky.social
 *
 * ---
 *
 * MIT License
 *
 * Copyright (c) 2024 - 2025 BinaryMoon
 *
 * Permission is hereby granted, free of charge, to any
 * person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the
 * Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall
 * be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
const beep8 = {};
(function(beep82) {
  beep82.CONFIG = {
    // Enable debug?
    DEBUG: true,
    // The name of the project.
    NAME: "beep8 Project",
    // The version of the project.
    VERSION: "1.0.0-dev",
    // Canvas settings
    CANVAS_SETTINGS: {
      // The ID to assign to the beep8 canvas.
      CANVAS_ID: "beep8-canvas",
      // If set, these CSS classes will be added to the beep8 canvas.
      // This is an array of strings, each of which is a class name (without the "."),
      // for example: [ "foo", "bar", "qux" ]
      CANVAS_CLASSES: [],
      // If null then the canvas will be appended to the body.
      // If this is not null, then this is the element under which to create the rendering canvas.
      // This can be the ID of an HTML element, or an HTMLElement reference.
      CONTAINER: null
    },
    // Sound effects settings
    SFX: {
      // Key presses whilst using an input dialog.
      TYPING: "ui/click/003",
      MENU_UP: "tone/beep/002",
      MENU_DOWN: "tone/beep/001",
      MENU_SELECT: "tone/beep/003"
    },
    // The font files.
    // The font files must be PNG files, with the characters in a grid.
    FONT_DEFAULT: "../assets/font-default-thin.png",
    FONT_TILES: "../assets/font-tiles.png",
    FONT_ACTORS: "../assets/font-actors.png",
    // The characters in the font file.
    // These are for the default font(s). If you use a different list you
    // will need to upate the font file to match.
    CHRS: `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*+=-<>_#&@%^~$\xA3\u20AC\xA5\xA2!?:;'"/\\()[]{}.,\xA9\xAE\u2122\u2022\u2026| `,
    // Character size. The characters file's width must be
    // 12 * CHR_WIDTH and the height must be 12 * CHR_HEIGHT.
    CHR_WIDTH: 12,
    CHR_HEIGHT: 12,
    // Screen width and height in characters.
    SCREEN_ROWS: 25,
    SCREEN_COLS: 20,
    // EXPERIMENTAL
    // This is an experimental feature and is subject to change at any time.
    // The number of colors to use.
    // 1 = each tile is 2 colors (foreground and background).
    // 2 = each tile could be multiple colours. A background colour, and
    // shades of a foreground colour based upon the greyscale colours used
    // in the tiles.
    // Make sure to change the tiles image as well if you change this.
    SCREEN_COLORS: 1,
    // Disable to turn off CRT effect.
    CRT_ENABLE: true,
    // Enable/ Disable vignette effect.
    // This is a boolean value.
    CRT_VIGNETTE: true,
    // Color palette.
    // Colors count from 0.
    // The first color is the background color.
    // This can be as many colors as you want, but each color requires us to
    // store a scaled copy of the characters image in memory, so more colors
    // = more memory.
    // You can redefine the colors at runtime with beep8.redefineColors([]).
    COLORS: [
      "#0A0C1F",
      // 0. Very dark blue - almost black. The darkest colour.
      "#263264",
      // 1. Dark blue
      "#A0ABB6",
      // 2. Mid grey
      "#B2EFEB",
      // 3. Light blue
      "#3FB0F1",
      // 4. Mid blue
      "#3548A3",
      // 5. Blue
      "#420241",
      // 6. Dark red/ purple
      "#6A3E49",
      // 7. Brown
      "#C22D44",
      // 8. Red
      "#E08355",
      // 9. Orange
      "#FFC763",
      // 10. Yellow
      "#A7D171",
      // 11. Light green
      "#30AB62",
      // 12. Green
      "#1E7F82",
      // 13. Dark Green
      "#FF76D7",
      // 14. Pink
      "#F4F4F4"
      // 15. White
    ],
    // The passkey for the game.
    // This is used when generating passcodes for levels.
    // It should be unique for each game so that passcodes are different for each game.
    // You can generate a passcode for a level with beep8.Passcode.getCode( levelId ).
    // The passcode will be a 4-character code.
    PASSKEY: "beep8IsAwesome",
    // If this is not null, then we will display a virtual joystick if the user
    // is on a mobile device.
    TOUCH_VJOY: true,
    // Cursor config:
    CURSOR: {
      // Blink interval in milliseconds.
      BLINK_INTERVAL: 400
    },
    // If set, then special escape sequences can be used when printing (to set colors, etc).
    // These are the sequences that starts and end an escape sequence. See the documentation for
    // beep8.print() for more info on escape sequences.
    // If you don't want this, comment out these line, or set them to null.
    PRINT_ESCAPE_START: "{{",
    PRINT_ESCAPE_END: "}}",
    // The first character to use for the border in printBox & menus.
    // The number is the index of the top left corner of a border pattern in the font file.
    // The method will use the 4 corners, and the top horizontal and left vertical sides.
    BORDER_CHAR: 54
  };
})(beep8);
(function(beep82) {
  beep82.init = function(callback, options = {}) {
    beep82.Utilities.checkFunction("callback", callback);
    beep82.Utilities.checkObject("options", options);
    if (options !== null) {
      beep82.CONFIG = beep82.Utilities.deepMerge(beep82.CONFIG, options);
    }
    return beep82.Core.init(callback);
  };
  beep82.frame = function(renderHandler = null, updateHandler = null, fps = 30) {
    beep82.Core.preflight("beep8.frame");
    if (renderHandler !== null) {
      beep82.Utilities.checkFunction("render handler", renderHandler);
    }
    if (updateHandler !== null) {
      beep82.Utilities.checkFunction("update handler", updateHandler);
    }
    beep82.Utilities.checkNumber("fps", fps);
    return beep82.Core.setFrameHandlers(renderHandler, updateHandler, fps);
  };
  beep82.render = function() {
    beep82.Core.preflight("beep8.render");
    return beep82.Renderer.render();
  };
  beep82.color = function(fg, bg = void 0) {
    beep82.Core.preflight("beep8.color");
    beep82.Utilities.checkNumber("fg", fg);
    if (bg !== void 0) {
      beep82.Utilities.checkNumber("bg", bg);
    }
    beep82.Core.setColor(fg, bg);
  };
  beep82.getFgColor = function() {
    beep82.Core.preflight("getFgColor");
    return beep82.Core.drawState.fgColor;
  };
  beep82.getBgColor = function() {
    beep82.Core.preflight("beep8.getBgColor");
    return beep82.Core.drawState.bgColor;
  };
  beep82.cls = function(bg = void 0) {
    beep82.Core.preflight("beep8.Core.cls");
    if (bg !== void 0) beep82.Utilities.checkNumber("bg", bg);
    beep82.Core.cls(bg);
  };
  beep82.locate = function(col, row) {
    beep82.Core.preflight("beep8.locate");
    beep82.Utilities.checkNumber("col", col);
    if (row !== void 0) {
      beep82.Utilities.checkNumber("row", row);
    }
    beep82.Core.setCursorLocation(col, row);
  };
  beep82.col = function() {
    beep82.Core.preflight("col");
    return beep82.Core.drawState.cursorCol;
  };
  beep82.row = function() {
    beep82.Core.preflight("row");
    return beep82.Core.drawState.cursorRow;
  };
  beep82.cursor = function(visible) {
    beep82.Core.preflight("cursor");
    beep82.Utilities.checkBoolean("visible", visible);
    beep82.CursorRenderer.setCursorVisible(visible);
  };
  beep82.print = function(text, maxWidth = -1, fontName = null) {
    beep82.Core.preflight("beep8.text");
    beep82.Utilities.checkString("text", text);
    beep82.Utilities.checkNumber("maxWidth", maxWidth);
    let font = fontName;
    if (null !== font) {
      beep82.Utilities.checkString("fontName", fontName);
      font = beep82.TextRenderer.getFontByName(fontName);
    }
    beep82.TextRenderer.print(text, font, maxWidth);
  };
  beep82.printCentered = function(text, width = beep82.CONFIG.SCREEN_COLS, fontName = null) {
    beep82.Core.preflight("beep8.printCentered");
    beep82.Utilities.checkString("text", text);
    beep82.Utilities.checkNumber("width", width);
    let font = fontName;
    if (null !== font) {
      beep82.Utilities.checkString("fontName", fontName);
      font = beep82.TextRenderer.getFontByName(fontName);
    }
    beep82.TextRenderer.printCentered(text, width, font);
  };
  beep82.printRight = function(text, width = beep82.CONFIG.SCREEN_COLS, fontName = null) {
    beep82.Core.preflight("beep8.printRight");
    beep82.Utilities.checkString("text", text);
    beep82.Utilities.checkNumber("width", width);
    let font = fontName;
    if (null !== font) {
      beep82.Utilities.checkString("fontName", fontName);
      font = beep82.TextRenderer.getFontByName(fontName);
    }
    beep82.TextRenderer.printRight(text, width, font);
  };
  beep82.drawText = function(x, y, text, fontName = null) {
    beep82.Core.preflight("beep8.drawText");
    beep82.Utilities.checkNumber("x", x);
    beep82.Utilities.checkNumber("y", y);
    beep82.Utilities.checkString("text", text);
    if (fontName) {
      beep82.Utilities.checkString("fontName", fontName);
    }
    beep82.TextRenderer.drawText(x, y, text, fontName);
  };
  beep82.measure = function(text) {
    beep82.Core.preflight("measure");
    beep82.Utilities.checkString("text", text);
    return beep82.TextRenderer.measure(text);
  };
  beep82.printChar = function(charCode, numTimes = 1, fontName = null) {
    beep82.Core.preflight("beep8.printChar");
    charCode = beep82.convChar(charCode);
    beep82.Utilities.checkInt("charCode", charCode);
    beep82.Utilities.checkInt("numTimes", numTimes);
    if (numTimes < 0) {
      beep82.Utilities.fatal("[beep8.printChar] numTimes must be a positive integer");
    }
    if (0 === numTimes) {
      return;
    }
    let font = fontName;
    if (null !== font) {
      beep82.Utilities.checkString("fontName", fontName);
      font = beep82.TextRenderer.getFontByName(fontName);
    }
    beep82.TextRenderer.printChar(charCode, numTimes, font);
  };
  beep82.printRect = function(widthCols, heightRows, charCode = 8) {
    beep82.Core.preflight("beep8.printRect");
    charCode = beep82.convChar(charCode);
    beep82.Utilities.checkNumber("widthCols", widthCols);
    beep82.Utilities.checkNumber("heightRows", heightRows);
    beep82.Utilities.checkNumber("charCode", charCode);
    beep82.TextRenderer.printRect(widthCols, heightRows, charCode);
  };
  beep82.printBox = function(widthCols, heightRows, fill = true, borderChar = beep82.CONFIG.BORDER_CHAR) {
    beep82.Core.preflight("beep8.printBox");
    borderChar = beep82.convChar(borderChar);
    beep82.Utilities.checkNumber("widthCols", widthCols);
    beep82.Utilities.checkNumber("heightRows", heightRows);
    beep82.Utilities.checkBoolean("fill", fill);
    beep82.Utilities.checkNumber("borderChar", borderChar);
    beep82.TextRenderer.printBox(widthCols, heightRows, fill, borderChar);
  };
  beep82.drawImage = function(x, y, image) {
    beep82.Utilities.checkInstanceOf("image", image, HTMLImageElement);
    beep82.Utilities.checkNumber("x", x);
    beep82.Utilities.checkNumber("y", y);
    beep82.Core.drawImage(image, x, y);
  };
  beep82.drawImageRect = function(x, y, image, srcX, srcY, width, height) {
    beep82.Utilities.checkInstanceOf("image", image, HTMLImageElement);
    beep82.Utilities.checkNumber("x", x);
    beep82.Utilities.checkNumber("y", y);
    beep82.Utilities.checkNumber("srcX", srcX);
    beep82.Utilities.checkNumber("srcY", srcY);
    beep82.Utilities.checkNumber("width", width);
    beep82.Utilities.checkNumber("height", height);
    beep82.Core.drawImage(image, x, y, srcX, srcY, width, height);
  };
  beep82.drawRect = function(x, y, width, height, lineWidth = 1) {
    beep82.Utilities.checkNumber("x", x);
    beep82.Utilities.checkNumber("y", y);
    beep82.Utilities.checkNumber("width", width);
    beep82.Utilities.checkNumber("height", height);
    beep82.Utilities.checkNumber("lineWidth", lineWidth);
    beep82.Core.drawRect(x, y, width, height, lineWidth);
  };
  beep82.fillRect = function(x, y, width, height) {
    beep82.Utilities.checkNumber("x", x);
    beep82.Utilities.checkNumber("y", y);
    beep82.Utilities.checkNumber("width", width);
    beep82.Utilities.checkNumber("height", height);
    beep82.Core.fillRect(x, y, width, height);
  };
  beep82.playSound = function(sfx, volume = 1, loop = false) {
    beep82.Utilities.checkInstanceOf("sfx", sfx, HTMLAudioElement);
    sfx.currentTime = 0;
    sfx.volume = volume;
    sfx.loop = loop;
    sfx.play();
  };
  beep82.spr = function(ch, x, y) {
    ch = beep82.convChar(ch);
    beep82.Utilities.checkNumber("ch", ch);
    beep82.Utilities.checkNumber("x", x);
    beep82.Utilities.checkNumber("y", y);
    beep82.TextRenderer.spr(ch, x, y);
  };
  beep82.drawActor = function(ch, animation) {
    ch = beep82.convChar(ch);
    beep82.Utilities.checkInt("ch", ch);
    beep82.Utilities.checkString("animation", animation);
    beep82.Actors.draw(ch, animation);
  };
  beep82.sprActor = function(ch, animation, x, y, startTime = null) {
    ch = beep82.convChar(ch);
    beep82.Utilities.checkInt("ch", ch);
    beep82.Utilities.checkString("animation", animation);
    beep82.Utilities.checkNumber("x", x);
    beep82.Utilities.checkNumber("y", y);
    if (startTime !== null) beep82.Utilities.checkNumber("startTime", startTime);
    return beep82.Actors.spr(ch, animation, x, y, startTime);
  };
  beep82.key = function(keyName) {
    beep82.Core.preflight("beep8.key");
    beep82.Utilities.checkString("keyName", keyName);
    return beep82.Input.keyHeld(keyName);
  };
  beep82.keyp = function(keyName) {
    beep82.Core.preflight("beep8.keyp");
    beep82.Utilities.checkString("keyName", keyName);
    return beep82.Input.keyJustPressed(keyName);
  };
  beep82.playSong = function(song) {
    beep82.Utilities.checkString("song", song);
    beep82.Sound.playSong(song);
  };
  beep82.playSfx = function(sfx) {
    beep82.Utilities.checkString("sfx", sfx);
    beep82.Sfx.play(sfx);
  };
  beep82.redefineColors = function(colors) {
    beep82.Core.preflight("beep8.redefineColors");
    beep82.Utilities.checkArray("colors", colors);
    beep82.Core.defineColors(colors);
  };
  beep82.setFont = function(fontName) {
    beep82.Core.preflight("beep8.setFont");
    fontName = fontName || "default-thin";
    beep82.Utilities.checkString("fontName", fontName);
    beep82.TextRenderer.setFont(fontName);
  };
  beep82.getFont = function() {
    beep82.Core.preflight("beep8.getFont");
    beep82.TextRenderer.getFont();
  };
  beep82.getFontByName = function(fontName) {
    beep82.Utilities.checkString("fontName", fontName);
    return beep82.TextRenderer.getFontByName(fontName);
  };
  beep82.setTileFont = function(fontName) {
    beep82.Core.preflight("beep8.setTileFont");
    fontName = fontName || "tiles";
    beep82.Utilities.checkString("fontName", fontName);
    beep82.TextRenderer.setTileFont(fontName);
  };
  beep82.convChar = function(charCode) {
    if (typeof charCode === "string" && charCode.length > 0) {
      return charCode.charCodeAt(0);
    }
    return charCode;
  };
  beep82.stopSound = function(sfx) {
    beep82.Utilities.checkInstanceOf("sfx", sfx, HTMLAudioElement);
    sfx.currentTime = 0;
    sfx.pause();
  };
  beep82.getContext = function() {
    return beep82.Core.getContext();
  };
  beep82.saveScreen = function() {
    return beep82.Core.saveScreen();
  };
  beep82.screenShake = function(duration) {
    beep82.Utilities.checkNumber("duration", duration);
    return beep82.Renderer.shakeScreen(duration);
  };
  beep82.restoreScreen = function(screenData) {
    return beep82.Core.restoreScreen(screenData);
  };
  beep82.wrapText = function(text, maxWidth) {
    beep82.Utilities.checkString("text", text);
    beep82.Utilities.checkNumber("maxWidth", maxWidth);
    return beep82.TextRenderer.wrapText(text, maxWidth);
  };
  beep82.addScene = function(name, update = {}) {
    beep82.Scene.add(name, update);
  };
  beep82.switchScene = function(name) {
    beep82.Scene.set(name);
  };
  beep82.getScene = function() {
    return beep82.Scene.get();
  };
  beep82.speak = function(text, options = {}) {
    if (!window.speechSynthesis) return;
    beep82.Utilities.checkString("text", text);
    beep82.Utilities.checkObject("options", options);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = options.pitch ?? 1;
    utterance.rate = options.rate ?? 1;
    utterance.volume = options.volume ?? 1;
    speechSynthesis.speak(utterance);
  };
})(beep8);
(function(beep82) {
  beep82._asyncActive = false;
  beep82.Async = beep82.Async || {};
  beep82.Async = new Proxy(
    beep82.Async,
    {
      get(target, prop, receiver) {
        const orig = Reflect.get(target, prop, receiver);
        if (typeof orig === "function") {
          return async function(...args) {
            let doWrap = !beep82._asyncActive;
            if (doWrap) {
              beep82._asyncActive = true;
              beep82.Scene.pause();
            }
            try {
              beep82.Core.preflight(`beep8.Async.${prop}`);
              const result = await orig.apply(this, args);
              return result;
            } finally {
              if (doWrap) {
                beep82.Scene.resume();
                beep82._asyncActive = false;
              }
            }
          };
        }
        return orig;
      }
    }
  );
  beep82.Async.key = async function() {
    return await beep82.Input.readKeyAsync();
  };
  beep82.Async.pointer = async function() {
    return await beep82.Input.readPointerAsync();
  };
  beep82.Async.readLine = async function(prompt2 = "Enter text:", initString = "", maxLen = -1, maxWidth = -1) {
    beep82.Utilities.checkString("initString", initString);
    beep82.Utilities.checkString("prompt", prompt2);
    beep82.Utilities.checkNumber("maxLen", maxLen);
    beep82.Utilities.checkNumber("maxWidth", maxWidth);
    return await beep82.Input.readLine(prompt2, initString, maxLen, maxWidth);
  };
  beep82.Async.menu = async function(choices, options = {}) {
    beep82.Utilities.checkArray("choices", choices);
    beep82.Utilities.checkObject("options", options);
    return await beep82.Menu.display(choices, options);
  };
  beep82.Async.dialog = async function(prompt2, choices = ["OK"], options = {}) {
    beep82.Utilities.checkString("prompt", prompt2);
    beep82.Utilities.checkArray("choices", choices);
    return beep82.Async.menu(choices, { prompt: prompt2, center: true, ...options });
  };
  beep82.Async.dialogTypewriter = async function(prompt2, choices = ["OK"], wrapWidth = -1, delay = 0.05, options = {}) {
    beep82.Utilities.checkString("prompt", prompt2);
    beep82.Utilities.checkArray("choices", choices);
    beep82.Utilities.checkNumber("delay", delay);
    if (wrapWidth > 0) {
      prompt2 = beep82.TextRenderer.wrapText(prompt2, wrapWidth);
    }
    return await beep82.Async.menu(choices, { prompt: prompt2, typewriter: true, center: true, ...options });
  };
  beep82.Async.typewriter = async function(text, wrapWidth = -1, delay = 0.035, fontName = null) {
    beep82.Utilities.checkString("text", text);
    beep82.Utilities.checkNumber("wrapWidth", wrapWidth);
    beep82.Utilities.checkNumber("delay", delay);
    let font = fontName;
    if (null !== font) {
      beep82.Utilities.checkString("fontName", fontName);
      font = beep82.TextRenderer.getFontByName(fontName);
    }
    await beep82.TextRenderer.printTypewriter(text, wrapWidth, delay, font);
  };
  beep82.Async.loadImage = async function(url) {
    beep82.Utilities.checkString("url", url);
    return await beep82.Core.loadImage(url);
  };
  beep82.Async.loadSound = async function(url) {
    return new Promise(
      (resolve) => {
        const audio = new Audio();
        audio.oncanplaythrough = () => resolve(audio);
        audio.src = url;
        audio.load();
      }
    );
  };
  beep82.Async.loadFont = async function(fontImageFile, tileSizeWidthMultiplier = 1, tileSizeHeightMultiplier = 1) {
    beep82.Utilities.checkString("fontImageFile", fontImageFile);
    beep82.Utilities.checkNumber("tileSizeWidthMultiplier", tileSizeWidthMultiplier);
    beep82.Utilities.checkNumber("tileSizeHeightMultiplier", tileSizeHeightMultiplier);
    const fontName = "FONT@" + beep82.Utilities.makeUrlPretty(fontImageFile);
    await beep82.TextRenderer.loadFontAsync(fontName, fontImageFile, tileSizeWidthMultiplier, tileSizeHeightMultiplier);
    return fontName;
  };
  beep82.Async.wait = async function(seconds) {
    beep82.Utilities.checkNumber("seconds", seconds);
    beep82.Renderer.render();
    return await new Promise((resolve) => setTimeout(resolve, Math.round(seconds * 1e3)));
  };
  beep82.Async.waitForContinue = async function() {
    while (true) {
      const key = await beep82.Async.key();
      if (key.includes("Enter") || key.includes("ButtonA") || key.includes(" ")) break;
    }
  };
})(beep8);
(function(beep82) {
  beep82.Hooks = {};
  const actions = {};
  const filters = {};
  function _add(store, hookName, callback, priority = 10) {
    if (!store[hookName]) store[hookName] = [];
    store[hookName].push({ callback, priority });
    store[hookName].sort((a, b) => a.priority - b.priority);
  }
  beep82.Hooks.addAction = function(hookName, callback, priority = 10) {
    _add(actions, hookName, callback, priority);
  };
  beep82.Hooks.doAction = function(hookName, ...args) {
    if (!actions[hookName]) return;
    for (const { callback } of actions[hookName]) {
      callback(...args);
    }
  };
  beep82.Hooks.addFilter = function(hookName, callback, priority = 10) {
    _add(filters, hookName, callback, priority);
  };
  beep82.Hooks.applyFilters = function(hookName, value, ...args) {
    if (!filters[hookName]) return value;
    let result = value;
    for (const { callback } of filters[hookName]) {
      result = callback(result, ...args);
    }
    return result;
  };
  beep82.Hooks.removeAction = function(hookName, callback) {
    actions[hookName] = (actions[hookName] || []).filter((h) => h.callback !== callback);
  };
  beep82.Hooks.removeFilter = function(hookName, callback) {
    filters[hookName] = (filters[hookName] || []).filter((h) => h.callback !== callback);
  };
})(beep8);
(function(beep82) {
  beep82.Joystick = {};
  let repeatIntervals = null;
  const VJOY_HTML = `
<div class="vjoy-options">
	<button id='vjoy-button-ter' class='vjoy-button'>Start</button>
	<button id='vjoy-button-screenshot' class='vjoy-button'>Snap</button>
</div>
<div class="vjoy-controls">
	<div class="vjoy-dpad">
	<button id='vjoy-button-up' class='vjoy-button'><span>U</span></button>
	<button id='vjoy-button-right' class='vjoy-button'><span>R</span></button>
	<button id='vjoy-button-left' class='vjoy-button'><span>L</span></button>
	<button id='vjoy-button-down' class='vjoy-button'><span>D</span></button>
	</div>
	<div class="vjoy-buttons">
	<button id='vjoy-button-pri' class='vjoy-button'><span>A</span></button>
	<button id='vjoy-button-sec' class='vjoy-button'><span>B</span></button>
	</div>
</div>`;
  const VJOY_CSS = `
:root {
	--b8-vjoy-button-color: #333;
	--b8-vjoy-button-size: 14vw;
	--b8-vjoy-button-dpad-size: calc(var(--b8-vjoy-button-size) * 2);
	--b8-console-radius: 2rem;
	--b8-border-radius: calc(var(--b8-vjoy-button-dpad-size) / 5);
}

.vjoy-container,
.vjoy-container * {
	box-sizing: border-box;
	user-select: none;
	-webkit-user-select: none;
	-webkit-touch-callout: none;
	touch-action: none;
}

.vjoy-container {
	position: relative;
	width: 100%;
	padding: 8vw 4vw 8vw 6vw;
	background: deeppink;
	border-radius: 0 0 var(--b8-console-radius) var(--b8-console-radius);
}

.vjoy-options {
	border-radius: 5rem;
	position: absolute;
	display: flex;
	gap: 2vw;
	align-items: center;
	padding: 2vw;
	border-radius: 2rem;
	background: inherit;
	top: -4vw;
	left: 50%;
	transform: translateX(-50%);
}

.vjoy-controls {
	display: flex;
	gap: 5vw;
	justify-content: space-between;
	align-items: center;
}

.vjoy-dpad {
	aspect-ratio: 1;
	max-width: 10rem;
	width: var(--b8-vjoy-button-dpad-size);
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr 1fr;
	flex-wrap: wrap;
	transform: rotate(45deg);
	border-radius: var(--b8-border-radius);
	background:black;
	gap: 1px;
	border: 2px solid black;
}

.vjoy-dpad button {
	width: 100%;
	height: 100%;
	position: relative;
}
.vjoy-dpad button span {
	transform: rotate(-45deg);
}
.vjoy-dpad button:after {
	position: absolute;
	content: '';
	display: block;
	width: 100%;
	height: 100%;
	background: rgba(0,0,0,0);
	transform: rotate(-45deg);
}

#vjoy-button-up {
	border-radius: var(--b8-border-radius) 0 0 0;
}
#vjoy-button-down {
	border-radius: 0 0 var(--b8-border-radius) 0;
}
#vjoy-button-left {
	border-radius: 0 0 0 var(--b8-border-radius);
}
#vjoy-button-right {
	border-radius: 0 var(--b8-border-radius) 0 0;
}

#vjoy-button-up:after {
	transform: rotate(-45deg) translateY(-30%) scale(1.1);
}
#vjoy-button-down:after {
	transform: rotate(-45deg) translateY(30%) scale(1.1);
}
#vjoy-button-left:after {
	transform: rotate(-45deg) translateX(-30%) scale(1.1);
}
#vjoy-button-right:after {
	transform: rotate(-45deg) translateX(30%) scale(1.1);
}

.vjoy-buttons {
	display: flex;
	gap: 2vw;
	transform: rotate(-45deg);
	border: 0.8vw solid rgba(0,0,0,0.2);
	border-radius: calc( var(--b8-border-radius) + 1vw );
	padding: 1vw;
}

.vjoy-buttons button {
	width: var(--b8-vjoy-button-size);
	max-width: 5rem;
	max-height: 5rem;
	height: var(--b8-vjoy-button-size);
	border-radius: var(--b8-border-radius);
	touch-action: none;
	border: 2px solid black;
	position: relative;
}

.vjoy-buttons button:after {
	position: absolute;
	content: '';
	display: block;
	width: 100%;
	height: 100%;
	background: rgba(0,0,0,0);
	transform: scale(1.2);
}

.vjoy-buttons button span {
	transform: rotate(45deg);
}

.vjoy-button {
	background: var(--b8-vjoy-button-color) !important;
	border: none;
	font-family: arial, sans-serif;
	font-size: 12px;
	font-weight: 600;
	color: #aaa !important;
	user-select: none;
	touch-callout: none;
	-webkit-user-select: none;
	-webkit-touch-callout: none;
	text-shadow: 0 -2px 0 black;
	padding: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	letter-spacing: 0.1em;
	text-transform: uppercase;
}

.vjoy-button:hover,
.vjoy-button:focus,
.vjoy-button:active {
	background: black;
	outline: none;
}

#vjoy-button-screenshot,
#vjoy-button-ter {
	width: calc(var(--b8-vjoy-button-size) * 1.4);
	padding: 1vw;
	border-radius: 1rem;
}
`;
  beep82.Joystick.setup = function() {
    beep82.Utilities.log("Setting up virtual joystick...");
    const styleEl = document.createElement("style");
    styleEl.setAttribute("type", "text/css");
    styleEl.innerText = VJOY_CSS;
    document.body.appendChild(styleEl);
    const container = document.createElement("div");
    container.className = "vjoy-container";
    container.innerHTML = VJOY_HTML;
    beep82.Core.getBeepContainerEl().appendChild(container);
    setTimeout(beep82.Joystick.continueSetup, 10);
  };
  beep82.Joystick.continueSetup = function() {
    beep82.Joystick.setUpButton("vjoy-button-up", "ArrowUp");
    beep82.Joystick.setUpButton("vjoy-button-down", "ArrowDown");
    beep82.Joystick.setUpButton("vjoy-button-left", "ArrowLeft");
    beep82.Joystick.setUpButton("vjoy-button-right", "ArrowRight");
    beep82.Joystick.setUpButton("vjoy-button-pri", "ButtonA");
    beep82.Joystick.setUpButton("vjoy-button-sec", "ButtonB");
    beep82.Joystick.setUpButton("vjoy-button-ter", "Enter");
    beep82.Joystick.setUpButton("vjoy-button-screenshot", "0");
    document.body.addEventListener("touchstart", (e) => e.preventDefault());
  };
  beep82.Joystick.setUpButton = function(buttonId, buttonKeyName) {
    const button = beep82.Utilities.assert(
      document.getElementById(buttonId),
      "Could not find button ID " + buttonId
    );
    if (buttonKeyName === null) {
      button.style.display = "none";
      return;
    }
    ["pointerdown", "pointerstart"].forEach((eventName) => {
      button.addEventListener(
        eventName,
        (e) => {
          e.preventDefault();
          beep82.Joystick.handleButtonEvent(buttonKeyName, true, e);
        },
        { passive: false }
      );
    });
    ["pointerout", "pointerup", "pointerleave"].forEach((eventName) => {
      button.addEventListener(
        eventName,
        (e) => beep82.Joystick.handleButtonEvent(buttonKeyName, false, e)
      );
    });
    button.addEventListener(
      "pointermove",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );
    button.addEventListener(
      "contextmenu",
      (e) => e.preventDefault()
    );
  };
  beep82.Joystick.handleButtonEvent = function(buttonKeyName, down, evt) {
    evt.key = buttonKeyName;
    if (!repeatIntervals) {
      repeatIntervals = {};
    }
    if (down) {
      beep82.Input.onKeyDown(evt);
      if (!repeatIntervals[buttonKeyName]) {
        repeatIntervals[buttonKeyName] = {};
        repeatIntervals[buttonKeyName].initialTimeout = setTimeout(
          function() {
            repeatIntervals[buttonKeyName].interval = setInterval(
              function() {
                beep82.Input.onKeyDown(evt);
              },
              150
            );
          },
          150
        );
      }
    } else {
      if (repeatIntervals[buttonKeyName]) {
        if (repeatIntervals[buttonKeyName].initialTimeout) {
          clearTimeout(repeatIntervals[buttonKeyName].initialTimeout);
        }
        if (repeatIntervals[buttonKeyName].interval) {
          clearInterval(repeatIntervals[buttonKeyName].interval);
        }
        delete repeatIntervals[buttonKeyName];
      }
      beep82.Input.onKeyUp(evt);
    }
    evt.preventDefault();
  };
})(beep8);
(function(beep82) {
  beep82.Utilities = {};
  beep82.Utilities.fatal = function(error) {
    beep82.Utilities.error("Fatal error: " + error);
    try {
      beep82.Core.handleCrash(error);
    } catch (e) {
      beep82.Utilities.error("Error in beep8.Core.handleCrash: " + e + " while handling error " + error);
    }
    throw new Error(error);
  };
  beep82.Utilities.assert = function(cond, msg) {
    if (!cond) {
      beep82.Utilities.fatal(msg || "Assertion Failed");
    }
    return cond;
  };
  beep82.Utilities.assertDebug = function(cond, msg) {
    if (!cond) {
      if (beep82.CONFIG.DEBUG) {
        warn("DEBUG ASSERT failed: " + msg);
      } else {
        beep82.Utilities.fatal(msg);
      }
    }
    return cond;
  };
  beep82.Utilities.assertEquals = function(expected, actual, what) {
    if (expected !== actual) {
      beep82.Utilities.fatal(`${what}: expected ${expected} but got ${actual}`);
    }
    return actual;
  };
  beep82.Utilities.checkType = function(varName, varValue, varType) {
    beep82.Utilities.assert(varName, "checkType: varName must be provided.");
    beep82.Utilities.assert(varType, "checkType: varType must be provided.");
    beep82.Utilities.assert(
      typeof varValue === varType,
      `${varName} should be of type ${varType} but was ${typeof varValue}: ${varValue}`
    );
    return varValue;
  };
  beep82.Utilities.checkNumber = function(varName, varValue, optMin = void 0, optMax = void 0) {
    beep82.Utilities.checkType(varName, varValue, "number");
    if (isNaN(varValue)) {
      beep82.Utilities.fatal(`${varName} should be a number but is NaN`);
    }
    if (!isFinite(varValue)) {
      beep82.Utilities.fatal(`${varName} should be a number but is infinite: ${varValue}`);
    }
    if (optMin !== void 0) {
      beep82.Utilities.assert(varValue >= optMin, `${varName} should be >= ${optMin} but is ${varValue}`);
    }
    if (optMax !== void 0) {
      beep82.Utilities.assert(varValue <= optMax, `${varName} should be <= ${optMax} but is ${varValue}`);
    }
    return varValue;
  };
  beep82.Utilities.checkInt = function(varName, varValue, optMin, optMax) {
    beep82.Utilities.checkNumber(varName, varValue, optMin, optMax);
    if (varValue !== Math.round(varValue)) {
      beep82.Utilities.fatal(`${varName} should be an integer but is ${varValue}`);
    }
    return varValue;
  };
  beep82.Utilities.checkString = function(varName, varValue) {
    return beep82.Utilities.checkType(varName, varValue, "string");
  };
  beep82.Utilities.checkBoolean = function(varName, varValue) {
    return beep82.Utilities.checkType(varName, varValue, "boolean");
  };
  beep82.Utilities.checkFunction = function(varName, varValue) {
    if (varValue === null) {
      beep82.Utilities.fatal(`${varName} should be a function, but was null`);
    }
    return beep82.Utilities.checkType(varName, varValue, "function");
  };
  beep82.Utilities.checkObject = function(varName, varValue) {
    if (varValue === null) {
      beep82.Utilities.fatal(`${varName} should be an object, but was null`);
    }
    return beep82.Utilities.checkType(varName, varValue, "object");
  };
  beep82.Utilities.checkInstanceOf = function(varName, varValue, expectedClass) {
    beep82.Utilities.assert(
      varValue instanceof expectedClass,
      `${varName} should be an instance of ${expectedClass.name} but was not, it's: ${varValue}`
    );
    return varValue;
  };
  beep82.Utilities.checkIsSet = function(varName, varValue) {
    beep82.Utilities.assert(
      varValue !== void 0 && varValue !== null,
      `${varName} should be set but was: ${varValue}`
    );
    return varValue;
  };
  beep82.Utilities.checkArray = function(varName, varValue) {
    beep82.Utilities.assert(Array.isArray(varValue), `${varName} should be an array, but was: ${varValue}`);
    return varValue;
  };
  beep82.Utilities.log = function(msg) {
    if (beep82.CONFIG.DEBUG) {
      console.log(msg);
    }
  };
  beep82.Utilities.warn = function(msg) {
    console.warn(msg);
  };
  beep82.Utilities.error = function(msg) {
    console.error(msg);
  };
  beep82.Utilities.loadImageAsync = async function(src) {
    return new Promise(
      (resolver) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolver(img);
      }
    );
  };
  beep82.Utilities.makeColorTransparent = async function(img, color = [255, 0, 255], range = 5) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (Math.abs(r - color[0]) <= range && Math.abs(g - color[1]) <= range && Math.abs(b - color[2]) <= range) {
        data[i + 3] = 0;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };
  beep82.Utilities.loadFileAsync = function(url) {
    return new Promise(
      (resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener(
          "load",
          () => {
            if (xhr.status < 200 || xhr.status > 299) {
              reject("HTTP request finished with status " + xhr.status);
            } else {
              resolve(xhr.responseText);
            }
          }
        );
        xhr.addEventListener("error", (e) => reject(e));
        xhr.open("GET", url);
        xhr.send();
      }
    );
  };
  beep82.Utilities.clamp = function(x, lo, hi) {
    return Math.min(Math.max(x, lo), hi);
  };
  beep82.Utilities.hexToRgb = function(hex) {
    hex = hex.replace("#", "");
    const bigint = parseInt(hex, 16);
    return {
      r: bigint >> 16 & 255,
      // Extract red
      g: bigint >> 8 & 255,
      // Extract green
      b: bigint & 255
      // Extract blue
    };
  };
  beep82.Utilities.intersectIntervals = function(as, ae, bs, be, result = null) {
    beep82.Utilities.checkNumber("as", as);
    beep82.Utilities.checkNumber("ae", ae);
    beep82.Utilities.checkNumber("bs", bs);
    beep82.Utilities.checkNumber("be", be);
    if (result) {
      beep82.Utilities.checkObject("result", result);
    }
    const start = Math.max(as, bs);
    const end = Math.min(ae, be);
    if (end >= start) {
      if (result) {
        result.start = start;
        result.end = end;
      }
      return true;
    }
    return false;
  };
  beep82.Utilities.intersectRects = function(r1, r2, dx1 = 0, dy1 = 0, dx2 = 0, dy2 = 0, result = null) {
    beep82.Utilities.checkObject("r1", r1);
    beep82.Utilities.checkObject("r2", r2);
    beep82.Utilities.checkNumber("r1.x", r1.x);
    beep82.Utilities.checkNumber("r1.y", r1.y);
    beep82.Utilities.checkNumber("r1.w", r1.w);
    beep82.Utilities.checkNumber("r1.h", r1.h);
    beep82.Utilities.checkNumber("r2.x", r2.x);
    beep82.Utilities.checkNumber("r2.y", r2.y);
    beep82.Utilities.checkNumber("r2.w", r2.w);
    beep82.Utilities.checkNumber("r2.h", r2.h);
    beep82.Utilities.checkNumber("dx1", dx1);
    beep82.Utilities.checkNumber("dx2", dx2);
    beep82.Utilities.checkNumber("dy1", dy1);
    beep82.Utilities.checkNumber("dy2", dy2);
    if (result) {
      checkObject("result", result);
    }
    const xint = intersectRects_xint;
    const yint = intersectRects_yint;
    if (!beep82.Utilities.intersectIntervals(
      r1.x + dx1,
      r1.x + dx1 + r1.w - 1,
      r2.x + dx2,
      r2.x + dx2 + r2.w - 1,
      xint
    )) {
      return false;
    }
    if (!beep82.Utilities.intersectIntervals(
      r1.y + dy1,
      r1.y + dy1 + r1.h - 1,
      r2.y + dy2,
      r2.y + dy2 + r2.h - 1,
      yint
    )) {
      return false;
    }
    if (result) {
      result.x = xint.start;
      result.w = xint.end - xint.start + 1;
      result.y = yint.start;
      result.h = yint.end - yint.start + 1;
    }
    return true;
  };
  const intersectRects_xint = {};
  const intersectRects_yint = {};
  beep82.Utilities.makeUrlPretty = function(uglyStr) {
    beep82.Utilities.checkString("uglyStr", uglyStr);
    let str = uglyStr;
    str = str.toLowerCase();
    str = str.replace(/[\s/]+/g, "-");
    str = str.replace(/[^a-z0-9\-]+/g, "");
    str = str.replace(/-+/g, "-");
    str = str.replace(/^-+|-+$/g, "");
    return str;
  };
  beep82.Utilities.deepMerge = function(...objects) {
    const isObject = (obj) => obj && typeof obj === "object";
    return objects.reduce(
      (prev, obj) => {
        Object.keys(obj).forEach(
          (key) => {
            const existingValue = prev[key];
            const newValue = obj[key];
            if (Array.isArray(existingValue) && Array.isArray(newValue)) {
              prev[key] = existingValue.concat(...newValue);
            } else if (isObject(existingValue) && isObject(newValue)) {
              prev[key] = beep82.Utilities.deepMerge(existingValue, newValue);
            } else {
              prev[key] = newValue;
            }
          }
        );
        return prev;
      },
      {}
    );
  };
  beep82.Utilities.deepMergeByIndex = function(...objects) {
    const isObject = (obj) => obj && typeof obj === "object";
    return objects.reduce(
      (prev, obj) => {
        Object.keys(obj).forEach(
          (key) => {
            const existingValue = prev[key];
            const newValue = obj[key];
            if (Array.isArray(existingValue) && Array.isArray(newValue)) {
              prev[key] = mergeArraysByIndex(existingValue, newValue);
            } else if (isObject(existingValue) && isObject(newValue)) {
              prev[key] = beep82.Utilities.deepMergeByIndex(existingValue, newValue);
            } else {
              prev[key] = newValue;
            }
          }
        );
        return prev;
      },
      {}
    );
  };
  beep82.Utilities.padWithZeros = function(number, length) {
    beep82.Utilities.checkNumber("number", number);
    beep82.Utilities.checkInt("length", length);
    if (number < 0) {
      beep82.Utilities.fatal("padWithZeros does not support negative numbers");
    }
    return number.toString().padStart(length, "0");
  };
  beep82.Utilities.event = function(eventName, detail = {}, target = document) {
    beep82.Utilities.checkString("eventName", eventName);
    beep82.Utilities.checkObject("detail", detail);
    beep82.Utilities.checkObject("target", target);
    eventName = `beep8.${eventName}`;
    const event = new CustomEvent(eventName, { detail });
    target.dispatchEvent(event);
  };
  beep82.Utilities.repeatArray = function(array, times) {
    beep82.Utilities.checkArray("array", array);
    beep82.Utilities.checkInt("times", times, 0);
    return Array(times).fill().flatMap(() => array);
  };
  beep82.Utilities.downloadFile = function(filename = "", src = "") {
    beep82.Utilities.checkString("filename", filename);
    beep82.Utilities.checkString("src", src);
    const element = document.createElement("a");
    element.setAttribute("href", src);
    element.setAttribute("download", filename);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  beep82.Utilities.encodeData = function(data) {
    const cborString = CBOR.encode(data);
    const encodedString = btoa(String.fromCharCode.apply(null, new Uint8Array(cborString)));
    return encodedString;
  };
  beep82.Utilities.decodeData = function(data) {
    const binaryString = atob(data);
    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }
    const arrayBuffer = byteArray.buffer;
    return CBOR.decode(arrayBuffer);
  };
  function mergeArraysByIndex(Arr1, Arr2) {
    for (let i = 0; i < Arr2.length; i++) {
      Arr1[i] = Arr2[i];
    }
    return Arr1;
  }
})(beep8);
(function(beep82) {
  beep82.Tilemap = {};
  beep82.Tilemap.MAP_CHAR = 0;
  beep82.Tilemap.MAP_FG = 1;
  beep82.Tilemap.MAP_BG = 2;
  beep82.Tilemap.MAP_COLLISION = 3;
  beep82.Tilemap.MAP_DATA = 4;
  const wallTiles = {
    "solid": {
      0: 1,
      // wall_isolated.
      1: 1,
      // wall_end_bottom.
      2: 1,
      // wall_end_left.
      3: 36,
      // wall_corner_bottomLeft.
      4: 1,
      // wall_end_top.
      5: 1,
      // wall_vertical.
      6: 18,
      // wall_corner_topLeft.
      7: 1,
      // wall_t_right.
      8: 1,
      // wall_end_right.
      9: 37,
      // wall_corner_bottomRight.
      10: 1,
      // wall_horizontal.
      11: 1,
      // wall_t_bottom.
      12: 19,
      // wall_corner_topRight.
      13: 1,
      // wall_t_left.
      14: 1,
      // wall_t_top.
      15: 1
      // wall_cross.
    },
    "rounded": {
      0: 1,
      // wall_isolated.
      1: 42,
      // wall_end_bottom.
      2: 23,
      // wall_end_left.
      3: 36,
      // wall_corner_bottomLeft.
      4: 41,
      // wall_end_top.
      5: 1,
      // wall_vertical.
      6: 18,
      // wall_corner_topLeft.
      7: 1,
      // wall_t_right.
      8: 24,
      // wall_end_right.
      9: 37,
      // wall_corner_bottomRight.
      10: 1,
      // wall_horizontal.
      11: 1,
      // wall_t_bottom.
      12: 19,
      // wall_corner_topRight.
      13: 1,
      // wall_t_left.
      14: 1,
      // wall_t_top.
      15: 1
      // wall_cross.
    },
    "half": {
      0: 128,
      // wall_isolated.
      1: 75,
      // wall_end_bottom.
      2: 58,
      // wall_end_left.
      3: 93,
      // wall_corner_bottomLeft.
      4: 75,
      // wall_end_top.
      5: 75,
      // wall_vertical.
      6: 57,
      // wall_corner_topLeft.
      7: 129,
      // wall_t_right.
      8: 58,
      // wall_end_right.
      9: 95,
      // wall_corner_bottomRight.
      10: 58,
      // wall_horizontal.
      11: 111,
      // wall_t_bottom.
      12: 59,
      // wall_corner_topRight.
      13: 130,
      // wall_t_left.
      14: 112,
      // wall_t_top.
      15: 113
      // wall_cross.
    },
    "half_rounded": {
      0: 128,
      // wall_isolated.
      1: 148,
      // wall_end_bottom.
      2: 166,
      // wall_end_left.
      3: 93,
      // wall_corner_bottomLeft.
      4: 149,
      // wall_end_top.
      5: 75,
      // wall_vertical.
      6: 57,
      // wall_corner_topLeft.
      7: 129,
      // wall_t_right.
      8: 167,
      // wall_end_right.
      9: 95,
      // wall_corner_bottomRight.
      10: 58,
      // wall_horizontal.
      11: 111,
      // wall_t_bottom.
      12: 59,
      // wall_corner_topRight.
      13: 130,
      // wall_t_left.
      14: 112,
      // wall_t_top.
      15: 113
      // wall_cross.
    },
    "pipe": {
      0: 128,
      // wall_isolated.
      1: 148,
      // wall_end_bottom.
      2: 166,
      // wall_end_left.
      3: 93,
      // wall_corner_bottomLeft.
      4: 149,
      // wall_end_top.
      5: [75, 77],
      // wall_vertical.
      6: 57,
      // wall_corner_topLeft.
      7: 129,
      // wall_t_right.
      8: 167,
      // wall_end_right.
      9: 95,
      // wall_corner_bottomRight.
      10: [58, 94],
      // wall_horizontal.
      11: 111,
      // wall_t_bottom.
      12: 59,
      // wall_corner_topRight.
      13: 130,
      // wall_t_left.
      14: 112,
      // wall_t_top.
      15: [113, 131, 76]
      // wall_cross.
    },
    "thin": {
      0: 110,
      // wall_isolated.
      1: 173,
      // wall_end_bottom.
      2: 172,
      // wall_end_left.
      3: 164,
      // wall_corner_bottomLeft.
      4: 154,
      // wall_end_top.
      5: 72,
      // wall_vertical.
      6: 146,
      // wall_corner_topLeft.
      7: 126,
      // wall_t_right.
      8: 155,
      // wall_end_right.
      9: 165,
      // wall_corner_bottomRight.
      10: 55,
      // wall_horizontal.
      11: 108,
      // wall_t_bottom.
      12: 147,
      // wall_corner_topRight.
      13: 127,
      // wall_t_left.
      14: 109,
      // wall_t_top.
      15: 73
      // wall_cross.
    }
  };
  beep82.Tilemap.save = function(tilemap) {
    beep82.Utilities.checkArray("tilemap", tilemap);
    return beep82.Utilities.encodeData(tilemap);
  };
  beep82.Tilemap.load = function(data) {
    beep82.Utilities.checkString("data", data);
    return beep82.Utilities.decodeData(data);
  };
  beep82.Tilemap.draw = function(tilemap, tileXOffset = 0, tileYOffset = 0, width = null, height = null) {
    beep82.Utilities.checkArray("tilemap", tilemap);
    if (!width) {
      width = tilemap[0].length;
    }
    if (!height) {
      height = tilemap.length;
    }
    beep82.Utilities.checkInt("width", width);
    beep82.Utilities.checkInt("height", height);
    const startRow = beep82.Core.drawState.cursorRow;
    const startCol = beep82.Core.drawState.cursorCol;
    for (let y = tileYOffset; y < tileYOffset + height; y++) {
      const lx = 0 + startCol;
      const ly = y - tileYOffset + startRow;
      beep82.locate(lx, ly);
      for (let x = tileXOffset; x < tileXOffset + width; x++) {
        if (!tilemap[y] || tilemap[y][x] == null) continue;
        const tile = tilemap[y][x];
        if (tile && tile.length >= 3) {
          beep82.color(
            tile[beep82.Tilemap.MAP_FG],
            tile[beep82.Tilemap.MAP_BG]
          );
          beep82.printChar(tile[beep82.Tilemap.MAP_CHAR]);
        }
      }
    }
  };
  beep82.Tilemap.createEmptyTilemap = function(width, height) {
    let layout = [];
    for (let y = 0; y < height; y++) {
      layout[y] = [];
      for (let x = 0; x < width; x++) {
        layout[y][x] = beep82.Tilemap.getDefaultTile();
      }
    }
    return layout;
  };
  beep82.Tilemap.shift = function(tilemap, dx, dy) {
    beep82.Utilities.checkArray("tilemap", tilemap);
    beep82.Utilities.checkNumber("dx", dx);
    beep82.Utilities.checkNumber("dy", dy);
    const width = tilemap[0].length;
    const height = tilemap.length;
    const newTilemap = beep82.Tilemap.createEmptyTilemap(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const newX = (x + dx + width) % width;
        const newY = (y + dy + height) % height;
        newTilemap[newY][newX] = [...tilemap[y][x]];
      }
    }
    return newTilemap;
  };
  beep82.Tilemap.resize = function(tilemap, width, height) {
    beep82.Utilities.checkArray("tilemap", tilemap);
    beep82.Utilities.checkNumber("width", width);
    beep82.Utilities.checkNumber("height", height);
    const newTilemap = beep82.Tilemap.createEmptyTilemap(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (tilemap[y] && tilemap[y][x]) {
          newTilemap[y][x] = [...tilemap[y][x]];
        }
      }
    }
    return newTilemap;
  };
  beep82.Tilemap.getDefaultTile = function() {
    return [
      0,
      // Tile
      15,
      // Fg
      0,
      // Bg
      0,
      // Collision
      {}
      // Data
    ];
  };
  beep82.Tilemap.convertFromText = function(mapText) {
    beep82.Utilities.checkString("text", mapText);
    const lines = mapText.split("\n");
    const filteredLines = lines.filter((line) => line.trim() !== "");
    if (filteredLines.length === 0) beep82.Utilities.fatal("No valid lines found in the map text.");
    const map = filteredLines.map((row) => row.split(""));
    return map;
  };
  beep82.Tilemap.validateTilemap = function(mapText) {
    beep82.Utilities.checkString("text", mapText);
    const map = beep82.Tilemap.load(mapText);
    if (!Array.isArray(map) || !Array.isArray(map[0])) {
      return false;
    }
    if (!Array.isArray(map[0][0]) || map[0][0].length <= 3) {
      return false;
    }
    return true;
  };
  beep82.Tilemap.createFromArray = function(grid, tilePattern, defaultTilePattern = null) {
    beep82.Utilities.checkArray("grid", grid);
    beep82.Utilities.checkObject("tilePattern", tilePattern);
    if (defaultTilePattern !== null) {
      beep82.Utilities.checkObject("defaultTilePattern", defaultTilePattern);
    }
    if (null === defaultTilePattern) {
      defaultTilePattern = beep82.Tilemap.getDefaultTile();
    }
    const tilemap = [];
    for (let y = 0; y < grid.length; y++) {
      tilemap[y] = [];
      for (let x = 0; x < grid[y].length; x++) {
        tilemap[y][x] = [...defaultTilePattern];
        if (!tilePattern[grid[y][x]]) {
          continue;
        }
        const tile = tilePattern[grid[y][x]];
        let tileId = tile.t;
        if (typeof tileId === "string" && tileId.startsWith("wall_")) {
          tileId = beep82.Tilemap.wallTile(x, y, grid, tileId);
        }
        if (Array.isArray(tileId)) {
          tileId = beep82.Random.pickWeighted(tileId);
        }
        let fg = tile.fg || 15;
        if (Array.isArray(fg)) {
          fg = beep82.Random.pickWeighted(fg);
        }
        let bg = tile.bg || 0;
        if (Array.isArray(bg)) {
          bg = beep82.Random.pickWeighted(bg);
        }
        tilemap[y][x] = [
          tileId,
          fg,
          bg,
          tile.coll || 0,
          tile.data || {}
        ];
      }
    }
    return tilemap;
  };
  beep82.Tilemap.wallTile = function(col, row, grid, name = null) {
    beep82.Utilities.checkNumber("col", col);
    beep82.Utilities.checkNumber("row", row);
    beep82.Utilities.checkArray("grid", grid);
    beep82.Utilities.checkString("name", name);
    if (null === name) {
      beep82.Utilities.fatal("Wall tile name not given: " + name);
    }
    const tileType = name.substring(5);
    if (!wallTiles[tileType]) {
      beep82.Utilities.fatal("Wall tile type not found: " + tileType);
    }
    const mask = computeBitmask(grid, col, row);
    return wallTiles[tileType][mask];
  };
  function computeBitmask(grid, col, row) {
    let bitmask = 0;
    const tileId = grid[row][col];
    if (row > 0 && grid[row - 1][col] === tileId) bitmask += 1;
    if (col < grid[row].length - 1 && grid[row][col + 1] === tileId) bitmask += 2;
    if (row < grid.length - 1 && grid[row + 1][col] === tileId) bitmask += 4;
    if (col > 0 && grid[row][col - 1] === tileId) bitmask += 8;
    return bitmask;
  }
})(beep8);
(function(beep82) {
  beep82.TextRenderer = {};
  const charMap = [];
  beep82.TextRenderer.fonts_ = {};
  beep82.TextRenderer.curFont_ = null;
  beep82.TextRenderer.curTiles_ = null;
  beep82.TextRenderer.prepareCharMap = function() {
    let charString = [...beep82.CONFIG.CHRS];
    for (let i = 0; i < charString.length; i++) {
      charMap.push(charString[i].charCodeAt(0));
    }
  };
  beep82.TextRenderer.initAsync = async function() {
    beep82.Utilities.log("beep8.TextRenderer init.");
    beep82.TextRenderer.curFont_ = await beep82.TextRenderer.loadFontAsync("default-thin", beep82.CONFIG.FONT_DEFAULT, 0.5, 1);
    beep82.TextRenderer.curTiles_ = await beep82.TextRenderer.loadFontAsync("tiles", beep82.CONFIG.FONT_TILES);
    beep82.TextRenderer.curActors_ = await beep82.TextRenderer.loadFontAsync("actors", beep82.CONFIG.FONT_ACTORS);
    beep82.TextRenderer.prepareCharMap();
  };
  beep82.TextRenderer.loadFontAsync = async function(fontName, fontImageFile, tileSizeWidthMultiplier = 1, tileSizeHeightMultiplier = 1) {
    beep82.Utilities.checkString("fontName", fontName);
    beep82.Utilities.checkString("fontImageFile", fontImageFile);
    const font = new beep82.TextRendererFont(fontName, fontImageFile, tileSizeWidthMultiplier, tileSizeHeightMultiplier);
    await font.initAsync();
    beep82.TextRenderer.fonts_[fontName] = font;
    return font;
  };
  beep82.TextRenderer.setFont = function(fontName) {
    const font = beep82.TextRenderer.getFontByName(fontName);
    if (font) {
      beep82.TextRenderer.curFont_ = font;
    }
  };
  beep82.TextRenderer.getFont = function() {
    return beep82.TextRenderer.curFont_;
  };
  beep82.TextRenderer.setTileFont = function(fontName) {
    const font = beep82.TextRenderer.getFontByName(fontName);
    if (font) {
      beep82.TextRenderer.curTiles_ = font;
    }
  };
  beep82.TextRenderer.getFontByName = function(fontName) {
    beep82.Utilities.checkString("fontName", fontName);
    const font = beep82.TextRenderer.fonts_[fontName];
    if (!font) {
      beep82.Utilities.fatal(`setFont(): font not found: ${fontName}`);
      return;
    }
    return font;
  };
  beep82.TextRenderer.print = function(text, font = null, maxWidth = -1) {
    beep82.TextRenderer.printFont_ = font || beep82.TextRenderer.curFont_;
    beep82.Utilities.checkString("text", text);
    beep82.Utilities.checkNumber("maxWidth", maxWidth);
    if (font !== null) beep82.Utilities.checkObject("font", font);
    text = beep82.TextRenderer.wrapText(text, maxWidth, font);
    let col = beep82.Core.drawState.cursorCol;
    let row = beep82.Core.drawState.cursorRow;
    beep82.TextRenderer.origFgColor_ = beep82.Core.drawState.fgColor;
    beep82.TextRenderer.origBgColor_ = beep82.Core.drawState.bgColor;
    beep82.TextRenderer.origFont_ = beep82.TextRenderer.printFont_;
    const colInc = beep82.TextRenderer.printFont_.getCharColCount();
    const rowInc = beep82.TextRenderer.printFont_.getCharRowCount();
    const initialCol = col;
    for (let i = 0; i < text.length; i++) {
      i = processEscapeSeq_(text, i);
      const ch = text.charCodeAt(i);
      if (ch === 10) {
        col = initialCol;
        row += rowInc;
      } else {
        const chIndex = charMap.indexOf(ch);
        if (chIndex >= 0) {
          put_(
            chIndex,
            col,
            row,
            beep82.Core.drawState.fgColor,
            beep82.Core.drawState.bgColor,
            beep82.TextRenderer.printFont_
          );
          col += colInc;
        }
      }
    }
    beep82.Core.drawState.cursorCol = col;
    beep82.Core.drawState.cursorRow = row;
    beep82.Core.drawState.fgColor = beep82.TextRenderer.origFgColor_;
    beep82.Core.drawState.bgColor = beep82.TextRenderer.origBgColor_;
    beep82.Renderer.markDirty();
  };
  beep82.TextRenderer.printTypewriter = async function(text, maxWidth = -1, delay = 0.05, font = null) {
    beep82.Utilities.checkString("text", text);
    beep82.Utilities.checkNumber("maxWidth", maxWidth);
    beep82.Utilities.checkNumber("delay", delay);
    const startCol = beep82.col();
    const startRow = beep82.row();
    text = beep82.TextRenderer.wrapText(text, maxWidth);
    for (let i = 0; i <= text.length; i++) {
      if (beep82.CONFIG.PRINT_ESCAPE_START && text.substring(i, i + beep82.CONFIG.PRINT_ESCAPE_START.length) === beep82.CONFIG.PRINT_ESCAPE_START) {
        const endPos = text.indexOf(beep82.CONFIG.PRINT_ESCAPE_END, i + beep82.CONFIG.PRINT_ESCAPE_START.length);
        if (endPos >= 0) {
          i = endPos + beep82.CONFIG.PRINT_ESCAPE_END.length;
        }
      }
      const c2 = text.charCodeAt(i);
      beep82.Core.setCursorLocation(startCol, startRow);
      beep82.TextRenderer.print(text.substring(0, i), font);
      if (c2 !== 32) {
        await beep82.Async.wait(delay);
      }
    }
  };
  beep82.TextRenderer.printCentered = function(text, width, font = null) {
    beep82.TextRenderer.printFont_ = font || beep82.TextRenderer.curFont_;
    beep82.Utilities.checkString("text", text);
    beep82.Utilities.checkNumber("width", width);
    if (!text) {
      return;
    }
    const col = beep82.Core.drawState.cursorCol;
    const rowInc = beep82.TextRenderer.printFont_.getCharRowCount();
    text = text.split("\n");
    if (text[text.length - 1] === "") text.pop();
    for (let i = 0; i < text.length; i++) {
      const textWidth = beep82.TextRenderer.measure(text[i]).cols;
      const tempCol = col + (width - textWidth) / 2;
      beep82.Core.drawState.cursorCol = tempCol;
      beep82.TextRenderer.print(text[i], font, width);
      beep82.Core.drawState.cursorRow += rowInc;
    }
    beep82.Core.drawState.cursorCol = col;
  };
  beep82.TextRenderer.printRight = function(text, width, font = null) {
    beep82.TextRenderer.printFont_ = font || beep82.TextRenderer.curFont_;
    beep82.Utilities.checkString("text", text);
    beep82.Utilities.checkNumber("width", width);
    if (!text) {
      return;
    }
    const col = beep82.Core.drawState.cursorCol;
    const rowInc = beep82.TextRenderer.printFont_.getCharRowCount();
    text = beep82.TextRenderer.wrapText(text, width);
    text = text.split("\n");
    if (text[text.length - 1] === "") text.pop();
    for (let i = 0; i < text.length; i++) {
      let textWidth = beep82.TextRenderer.measure(text[i]).cols;
      const tempCol = col + width - textWidth;
      beep82.Core.drawState.cursorCol = tempCol;
      beep82.TextRenderer.print(text[i], font, width);
      beep82.Core.drawState.cursorRow += rowInc;
    }
    beep82.Core.drawState.cursorCol = col;
  };
  beep82.TextRenderer.printChar = function(ch, n, font = null) {
    if (n === void 0 || isNaN(n)) {
      n = 1;
    }
    beep82.Utilities.checkNumber("ch", ch);
    beep82.Utilities.checkNumber("n", n);
    if (beep82.Core.drawState.cursorCol < 0 || beep82.Core.drawState.cursorRow < 0 || beep82.Core.drawState.cursorCol >= beep82.CONFIG.SCREEN_COLS || beep82.Core.drawState.cursorRow >= beep82.CONFIG.SCREEN_ROWS) {
      return;
    }
    while (n-- > 0) {
      put_(
        ch,
        beep82.Core.drawState.cursorCol,
        beep82.Core.drawState.cursorRow,
        beep82.Core.drawState.fgColor,
        beep82.Core.drawState.bgColor,
        font
      );
      beep82.Core.drawState.cursorCol++;
    }
    beep82.Renderer.markDirty();
  };
  beep82.TextRenderer.spr = function(ch, x, y, font = null, direction = 0) {
    beep82.Utilities.checkNumber("ch", ch);
    beep82.Utilities.checkNumber("x", x);
    beep82.Utilities.checkNumber("y", y);
    beep82.Utilities.checkInt("direction", direction);
    if (font !== null) beep82.Utilities.checkObject("font", font);
    putxy_(
      ch,
      x,
      y,
      beep82.Core.drawState.fgColor,
      beep82.Core.drawState.bgColor,
      font,
      direction
    );
  };
  beep82.TextRenderer.drawText = function(x, y, text, fontName) {
    beep82.Utilities.checkNumber("x", x);
    beep82.Utilities.checkNumber("y", y);
    beep82.Utilities.checkString("text", text);
    if (fontName) {
      beep82.Utilities.checkString("fontName", fontName);
    }
    const x0 = x;
    const font = fontName ? beep82.TextRenderer.fonts_[fontName] || beep82.TextRenderer.curFont_ : beep82.TextRenderer.curFont_;
    if (!font) {
      beep82.Utilities.warn(`Requested font '${fontName}' not found: not drawing text.`);
      return;
    }
    for (let i = 0; i < text.length; i++) {
      const ch = text.charCodeAt(i);
      if (ch === 10) {
        x = x0;
        y += font.getCharHeight();
      } else {
        putxy_(
          ch,
          x,
          y,
          beep82.Core.drawState.fgColor,
          beep82.Core.drawState.bgColor,
          font
        );
        x += font.getCharWidth();
      }
    }
  };
  beep82.TextRenderer.measure = function(text, font = null) {
    beep82.Utilities.checkString("text", text);
    font = font || beep82.TextRenderer.curFont_;
    if ("" === text) {
      return { cols: 0, rows: 0 };
    }
    let rows = 1;
    let thisLineWidth = 0;
    let cols = 0;
    for (let i = 0; i < text.length; i++) {
      i = processEscapeSeq_(text, i, true);
      const ch = text.charCodeAt(i);
      if (ch === 10) {
        rows++;
        thisLineWidth = 0;
      } else {
        ++thisLineWidth;
        cols = Math.max(cols, thisLineWidth);
      }
    }
    cols = cols * font.getCharColCount();
    rows = rows * font.getCharRowCount();
    return { cols, rows };
  };
  beep82.TextRenderer.printRect = function(width, height, ch) {
    beep82.Utilities.checkNumber("width", width);
    beep82.Utilities.checkNumber("height", height);
    beep82.Utilities.checkNumber("ch", ch);
    const startCol = beep82.Core.drawState.cursorCol;
    const startRow = beep82.Core.drawState.cursorRow;
    for (let i = 0; i < height; i++) {
      beep82.Core.drawState.cursorCol = startCol;
      beep82.Core.drawState.cursorRow = startRow + i;
      beep82.TextRenderer.printChar(ch, width);
    }
    beep82.Core.drawState.cursorCol = startCol;
    beep82.Core.drawState.cursorRow = startRow;
  };
  beep82.TextRenderer.printBox = function(width, height, fill = true, borderChar = beep82.CONFIG.BORDER_CHAR) {
    beep82.Utilities.checkNumber("width", width);
    beep82.Utilities.checkNumber("height", height);
    beep82.Utilities.checkBoolean("fill", fill);
    beep82.Utilities.checkNumber("borderChar", borderChar);
    const colCount = beep82.TextRenderer.curTiles_.getColCount();
    const borders = {
      NW: borderChar,
      NE: borderChar + 2,
      SW: borderChar + colCount + colCount,
      SE: borderChar + colCount + colCount + 2,
      V: borderChar + colCount,
      H: borderChar + 1
    };
    beep82.TextRenderer.drawBox(width, height, fill, borders);
  };
  beep82.TextRenderer.drawBox = function(width, height, fill = true, borders = {}) {
    const startCol = beep82.Core.drawState.cursorCol;
    const startRow = beep82.Core.drawState.cursorRow;
    for (let i = 0; i < height; i++) {
      beep82.Core.drawState.cursorCol = startCol;
      beep82.Core.drawState.cursorRow = startRow + i;
      if (i === 0) {
        beep82.TextRenderer.printChar(borders.NW);
        beep82.TextRenderer.printChar(borders.H, width - 2);
        beep82.TextRenderer.printChar(borders.NE);
      } else if (i === height - 1) {
        beep82.TextRenderer.printChar(borders.SW);
        beep82.TextRenderer.printChar(borders.H, width - 2);
        beep82.TextRenderer.printChar(borders.SE);
      } else {
        beep82.TextRenderer.printChar(borders.V);
        beep82.Core.drawState.cursorCol = startCol + width - 1;
        beep82.TextRenderer.printChar(borders.V);
      }
    }
    if (fill && width > 2 && height > 2) {
      beep82.Core.drawState.cursorCol = startCol + 1;
      beep82.Core.drawState.cursorRow = startRow + 1;
      beep82.TextRenderer.printRect(width - 2, height - 2, 0);
    }
    beep82.Core.drawState.cursorCol = startCol;
    beep82.Core.drawState.cursorRow = startRow;
  };
  beep82.TextRenderer.wrapText = function(text, maxWidth, font = null) {
    font = font || beep82.TextRenderer.curFont_;
    if (maxWidth <= 0) return text;
    const lines = text.split("\n");
    const wrappedLines = [];
    for (const line of lines) {
      const words = line.split(" ");
      let wrappedLine = "";
      for (const word of words) {
        const lineWidth = beep82.TextRenderer.measure((wrappedLine + word).trim()).cols;
        if (lineWidth > maxWidth) {
          wrappedLines.push(wrappedLine.trim());
          wrappedLine = "";
        }
        wrappedLine += word + " ";
      }
      wrappedLines.push(wrappedLine.trim());
    }
    return wrappedLines.join("\n");
  };
  const put_ = function(ch, col, row, fgColor, bgColor, font = null, direction = 0) {
    const x = Math.round(col * beep82.CONFIG.CHR_WIDTH);
    const y = Math.round(row * beep82.CONFIG.CHR_HEIGHT);
    putxy_(ch, x, y, fgColor, bgColor, font, direction);
  };
  const putxy_ = function(ch, x, y, fgColor, bgColor, font = null, direction = 0) {
    font = font || beep82.TextRenderer.curTiles_;
    const colCount = font.getColCount();
    const chrW = font.getCharWidth();
    const chrH = font.getCharHeight();
    const fontRow = Math.floor(ch / colCount);
    const fontCol = ch % colCount;
    x = Math.round(x);
    y = Math.round(y);
    if (bgColor >= 0) {
      beep82.Core.offCtx.fillStyle = beep82.Core.getColorHex(bgColor);
      beep82.Core.offCtx.fillRect(x, y, chrW, chrH);
    }
    if (beep82.CONFIG.SCREEN_COLORS === 1 && bgColor === fgColor) {
      return;
    }
    if (direction > 0) {
      beep82.Core.offCtx.save();
      const flipH = (direction & 1) !== 0;
      const flipV = (direction & 2) !== 0;
      const translateX = flipH ? chrW : 0;
      const translateY = flipV ? chrH : 0;
      beep82.Core.offCtx.translate(x + translateX, y + translateY);
      const scaleX = flipH ? -1 : 1;
      const scaleY = flipV ? -1 : 1;
      beep82.Core.offCtx.scale(scaleX, scaleY);
      x = 0;
      y = 0;
    }
    const color = beep82.Utilities.clamp(fgColor, 0, beep82.CONFIG.COLORS.length - 1);
    const img = font.getImageForColor(color);
    beep82.Core.offCtx.drawImage(
      img,
      fontCol * chrW,
      fontRow * chrH,
      chrW,
      chrH,
      x,
      y,
      chrW,
      chrH
    );
    if (direction > 0) {
      beep82.Core.offCtx.restore();
    }
    beep82.Renderer.markDirty();
  };
  const processEscapeSeq_ = function(text, startPos, pretend = false) {
    const startSeq = beep82.CONFIG.PRINT_ESCAPE_START;
    const endSeq = beep82.CONFIG.PRINT_ESCAPE_END;
    if (!startSeq || !endSeq) {
      return startPos;
    }
    if (text.substring(startPos, startPos + startSeq.length) != startSeq) {
      return startPos;
    }
    const endPos = text.indexOf(endSeq, startPos + startSeq.length);
    if (!pretend) {
      const command = text.substring(startPos + startSeq.length, endPos);
      runEscapeCommand_(command);
    }
    return endPos + endSeq.length;
  };
  const runEscapeCommand_ = function(command) {
    if (command.indexOf(",") > 0) {
      const parts = command.split(",");
      for (const part of parts) runEscapeCommand_(part);
      return;
    }
    command = command.trim();
    if (command === "") {
      return;
    }
    const verb = command[0].toLowerCase();
    const arg = command.substring(1);
    const argNum = 1 * arg;
    switch (verb) {
      // Set foreground color.
      case "f":
      case "c":
        beep82.Core.drawState.fgColor = arg !== "" ? argNum : beep82.TextRenderer.origFgColor_;
        break;
      // Set background color.
      case "b":
        beep82.Core.drawState.bgColor = arg !== "" ? argNum : beep82.TextRenderer.origBgColor_;
        break;
      // Change font.
      case "t":
        beep82.TextRenderer.printFont_ = beep82.TextRenderer.getFontByName(arg);
        break;
      // Reset state.
      case "z":
        beep82.Core.drawState.fgColor = beep82.TextRenderer.origFgColor_;
        beep82.Core.drawState.bgColor = beep82.TextRenderer.origBgColor_;
        beep82.TextRenderer.printFont_ = beep82.TextRenderer.origFont_ || beep82.TextRenderer.fonts_["default"];
        break;
      default:
        beep82.Utilities.warn("Unknown beep8 print escape command: " + command);
    }
  };
  beep82.TextRenderer.regenColors = function() {
    Object.values(beep82.TextRenderer.fonts_).forEach((f) => f.regenColors());
  };
})(beep8);
(function(beep82) {
  beep82.Textmode = {};
  beep82.Textmode.load = async function(data) {
    return beep82.Tilemap.load(data);
  };
  beep82.Textmode.draw = async function(tilemap, tileXOffset = 0, tileYOffset = 0, width = null, height = null) {
    return beep82.Tilemap.draw(tilemap, tileXOffset, tileYOffset, width, height);
  };
})(beep8);
(function(beep82) {
  beep82.TextRendererFont = class {
    /**
     * Constructs a font. NOTE: after construction, you must call await initAsync() to
     * initialize the font.
     *
     * @param {string} fontName - The name of the font.
     * @param {string} fontImageFile - The URL of the image file for the font.
     * @param {number} [tileWidthMultiplier=1] - The tile width multiplier for the font.
     * @param {number} [tileHeightMultiplier=1] - The tile height multiplier for the font.
     */
    constructor(fontName, fontImageFile, tileWidthMultiplier = 1, tileHeightMultiplier = 1) {
      beep82.Utilities.checkString("fontName", fontName);
      beep82.Utilities.checkString("fontImageFile", fontImageFile);
      this.fontName_ = fontName;
      this.fontImageFile_ = fontImageFile;
      this.origImg_ = null;
      this.chrImages_ = [];
      this.imageWidth_ = 0;
      this.imageHeight_ = 0;
      this.colCount_ = 0;
      this.rowCount_ = 0;
      this.charWidth_ = 0;
      this.charHeight_ = 0;
      this.charColCount_ = 0;
      this.charRowCount_ = 0;
      this.tileWidthMultiplier_ = tileWidthMultiplier;
      this.tileHeightMultiplier_ = tileHeightMultiplier;
    }
    /**
     * Sets up this font from the given character image file. It's assumed to contain the
     * glyphs arranged in a 16x16 grid, so we will deduce the character size by dividing the
     * width and height by 16.
     *
     * @returns {Promise<void>}
     */
    async initAsync() {
      this.origImg_ = await beep82.Utilities.loadImageAsync(this.fontImageFile_);
      const imageCharWidth = beep82.CONFIG.CHR_WIDTH * this.tileWidthMultiplier_;
      const imageCharHeight = beep82.CONFIG.CHR_HEIGHT * this.tileHeightMultiplier_;
      beep82.Utilities.assert(
        this.origImg_.width % imageCharWidth === 0 && this.origImg_.height % imageCharHeight === 0,
        `Font ${this.fontName_}: image ${this.fontImageFile_} has dimensions ${this.origImg_.width}x${this.origImg_.height}.`
      );
      this.origImg_ = await beep82.Utilities.makeColorTransparent(this.origImg_);
      this.charWidth_ = imageCharWidth;
      this.charHeight_ = imageCharHeight;
      this.imageWidth_ = this.origImg_.width;
      this.imageHeight_ = this.origImg_.height;
      this.colCount_ = this.imageWidth_ / this.charWidth_;
      this.rowCount_ = this.imageHeight_ / this.charHeight_;
      this.charColCount_ = this.tileWidthMultiplier_;
      this.charRowCount_ = this.tileHeightMultiplier_;
      await this.regenColors();
    }
    /**
     * Returns the character width of the font.
     *
     * @returns {number} The width of each character in pixels.
     */
    getCharWidth() {
      return this.charWidth_;
    }
    /**
     * Returns the character height of the font.
     *
     * @returns {number} The height of each character in pixels.
     */
    getCharHeight() {
      return this.charHeight_;
    }
    /**
     * Returns the character width of the font.
     *
     * @returns {number} The width of each character in pixels.
     */
    getCharColCount() {
      return this.charColCount_;
    }
    /**
     * Returns the character height of the font.
     *
     * @returns {number} The height of each character in pixels.
     */
    getCharRowCount() {
      return this.charRowCount_;
    }
    /**
     * Returns the number of rows in the font image.
     *
     * @returns {number} The number of rows in the font image.
     */
    getRowCount() {
      return this.rowCount_;
    }
    /**
     * Returns the number of columns in the font image.
     *
     * @returns {number} The number of columns in the font image.
     */
    getColCount() {
      return this.colCount_;
    }
    /**
     * Returns the image for a given color number.
     *
     * @param {number} colorNumber - The color number.
     * @returns {HTMLImageElement} The image for the specified color.
     */
    getImageForColor(colorNumber) {
      return this.chrImages_[colorNumber];
    }
    /**
     * Regenerates the color text images.
     *
     * @returns {Promise<void>}
     */
    async regenColors() {
      this.chrImages_ = [];
      for (let c2 = 0; c2 < beep82.CONFIG.COLORS.length; c2++) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = this.origImg_.width;
        tempCanvas.height = this.origImg_.height;
        const ctx = tempCanvas.getContext("2d");
        ctx.clearRect(0, 0, this.origImg_.width, this.origImg_.height);
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(this.origImg_, 0, 0, this.origImg_.width, this.origImg_.height);
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = beep82.CONFIG.COLORS[c2];
        ctx.fillRect(0, 0, this.origImg_.width, this.origImg_.height);
        if (beep82.CONFIG.SCREEN_COLORS === 2) {
          ctx.globalCompositeOperation = "multiply";
          ctx.drawImage(this.origImg_, 0, 0, this.origImg_.width, this.origImg_.height);
        }
        this.chrImages_.push(tempCanvas);
      }
    }
  };
})(beep8);
(function(beep82) {
  beep82.State = beep82.State || {};
  let STORAGE_KEY = "";
  document.addEventListener(
    "beep8.initComplete",
    function() {
      STORAGE_KEY = `beep8.${beep82.Utilities.makeUrlPretty(beep82.CONFIG.NAME)}.state`;
    },
    { once: true }
  );
  function createProxy(target) {
    return new Proxy(
      target,
      {
        /**
         * Get trap for the Proxy.
         * Intercepts property access on the state object.
         *
         * @param {Object} obj - The original object being proxied.
         * @param {string} prop - The property being accessed.
         * @returns {*} - The value of the accessed property.
         */
        get(obj, prop) {
          const value = obj[prop];
          if (typeof value === "object" && value !== null) {
            return createProxy(value);
          }
          return value;
        },
        /**
         * Set trap for the Proxy.
         * Intercepts property updates on the state object.
         *
         * @param {Object} obj - The original object being proxied.
         * @param {string} prop - The property being updated.
         * @param {*} value - The new value to assign to the property.
         * @returns {boolean} - Returns true to indicate the operation was successful.
         */
        set(obj, prop, value) {
          obj[prop] = value;
          beep82.Utilities.event("stateChange", { prop, value });
          return true;
        }
      }
    );
  }
  beep82.State.save = function(key = STORAGE_KEY) {
    const encoded = beep82.Utilities.encodeData(
      {
        time: Date.now(),
        data: beep82.data
      }
    );
    localStorage.setItem(key, encoded);
    beep82.State.lastSave = Date.now();
  };
  beep82.State.load = function(key = STORAGE_KEY) {
    const b64 = localStorage.getItem(key);
    if (!b64) {
      beep82.Utilities.log("No state found for the given key.");
      return;
    }
    const rawState = beep82.Utilities.decodeData(b64);
    if (rawState.data) {
      beep82.data = createProxy(rawState.data);
    }
    if (rawState.time) {
      beep82.State.lastSave = rawState.time;
    }
  };
  beep82.State.init = function(defaults) {
    if (!beep82.data) {
      beep82.data = createProxy({});
    }
    if (localStorage.getItem(STORAGE_KEY)) {
      beep82.State.load();
    }
    beep82.data = beep82.Utilities.deepMergeByIndex(defaults, beep82.data);
    beep82.Utilities.log("State initialized:", beep82.data);
  };
  beep82.State.clear = function(key = STORAGE_KEY) {
    beep82.Utilities.log("Clearing state...");
    localStorage.removeItem(key);
    beep82.data = createProxy({});
  };
  beep82.data = createProxy({});
})(beep8);
(function(beep82) {
  beep82.Sfx = {};
  beep82.Sfx.library = {
    "fx/action/drag": [, 0, 293.6648, 0.1, , , 4, 6, 32, , , , , 1, 1.4, 0.1, , 0.7, 0.1],
    "fx/break/001": [2.1, , 339, 0.02, 0.07, 0.09, 4, 0.2, -7, , , , 0.05, 1, , 0.1, 0.16, 0.45, 0.02, 0.03],
    "fx/break/002": [1.5, , 157, 0.16, , 0, , 0.35, -24, 28, , , , 0.1, , 0.6, , 0.19, 0.01],
    "fx/break/003": [2, , 180, 0.05, 0.03, 0.04, , 2.42, 0.6, , , , , , , , 0.15, 0.39, 0.04],
    "fx/fight/dodge": [1.2, 0.3, 150, 0.05, , 0.05, , , -1, , , , , 4, , , , , 0.02],
    "fx/fight/hit": [5, , 185, , , , 3, 1.6, -7, , , , , , , 0.2, 0.19, 0.1, , 0.38, 985],
    "fx/robot/001": [1.13, , 172, 0.04, 0.18, 0.09, , 0.06, -38, -2.6, -99, , , , 35, , 0.08],
    "fx/robot/002": [1.42, , 61, 0.01, 0.02, 0, 1, 0.21, , , 816, 0.01, 0.05, , -40, , 0.05, 0.71, 0.11],
    "fx/robot/003": [0.9, , 164, 0.04, 0.03, 0.14, , 0.8, 46, 66, , , , , , , , 0.71, 0.08, , 217],
    "fx/robot/004": [, 0.02, 1638, , 0.05, 0.17, 1, , , , 490, 0.09, , , , 0.1, 0.05, 0.5, 0.03],
    "fx/sci-fi/radioactive": [1, 0, 130, 0.02, 0.9, 0.39, 2, 0.8, , , , , 0.13, 0.2, , 0.1, , 0.93, 0.06, 0.28],
    "fx/sci-fi/robot": [1, 0, 847, 0.02, 0.3, 0.9, 1, 1.67, , , -294, 0.04, 0.13, , , , 0.1],
    "fx/sci-fi/teleport": [1, , 85, 0.08, 0.1, 0.01, 1, 4, , -11, 1, 0.07, , 0.1, 101, , 0.05, 0.68, 0.4, 0.12, 1],
    "fx/sci-fi/warp": [3, 0, 713, 0.16, 0.09, 0.24, , 0.6, -29, -16, , , 0.09, 0.5, , , 0.23, 0.75, 0.15, 0.48],
    "fx/sci-fi/beam": [1, 0, 662, 0.82, 0.11, 0.33, 1, 0, , -0.2, , , , 1.2, , 0.26, 0.01],
    "fx/sci-fi/hover": [2, 0, 262.63, 0.1, 0.12, 0.3, 0, 2.4, -0.1, 0, 0, 0, 0.24, 0, 0, 0.1, 0.05, 0.98, 0.07, 0.17, 0],
    "fx/thud/001": [1.5, , 90, , 0.01, 0.03, 4, , , , , , , 9, 50, 0.2, , 0.2, 0.01],
    "fx/thud/002": [1, , 129, 0.01, , 0.15, , , , , , , , 5],
    "fx/machine/buzz": [1, 0, 130.8128, 0.1, 0.1, 0.34, 3, 1.88, , , , , , , , 0.1, , 0.5, 0.04],
    "fx/machine/hum": [1, 0, 63, , 1, , 1, 1.5, , , , , , , , 3.69, 0.08],
    "fx/machine/humm": [1, , 110, 0.03, 0.25, 0.15, 2, 1.32, , , , , 0.07, , -0.1, , 0.11, 0.77],
    "fx/machine/warp": [2, , 128, , 0.12, 0.26, , 4.7, , -1, -62, 0.06, 0.07, , 52, , , 0.66, 0.08],
    "fx/noise/001": [1.27, , 390, 0.01, 0.04, 0.02, 4, 0.71, 4.8, , , , , , , , 0.01, 0.6, 0.06],
    "fx/noise/002": [0.4, , 60, , 0.01, 0, 4, 0.55, 62, 89, -88, 0.06, , , 173, 0.6, , , 0.05],
    "fx/noise/003": [0.2, , 523.2511, 0.1, 3, 3, 4, 0, , , 2250, , 0.04, , 10, 0.01, , 0.82, 1, , 30],
    "fx/random/tone": [2, 0.8, 999, , , , 1, 2, , , , , 1, , , 0.1, 0.2],
    "fx/swoosh/001": [1, , 1500, 0.02, , 0.02, 4, 0.68, 5, , , , 0.01, 0.7, 136, , , , , 0.11],
    "fx/swoosh/002": [1.2, , 585, , 0.02, 0.16, 4, 0.25, , , , , , , , , , 0.55, 0.03],
    "fx/swoosh/003": [0.2, , 836, 0.11, , 0, 4, 0.91, 13, , , , 0.09, 0.1, -39, , , 0.06, 0.07],
    "fx/swoosh/004": [1.2, , 9220, 0.01, , , , 5, , , , , , 9],
    "fx/swoosh/005": [1.5, 0, 150, 0.05, , 0.05, , 1.3, , , , , , 3],
    "fx/swoosh/006": [2, , 12, , , 8e-3, , 1.2, 23, -7, , , 0.05, 0.4, , , 0.15, 0.82, 0.03, 0.28],
    "fx/vehicle/engine": [1.2, 0, 25, 0.05, 0.3, 0.5, 3, 9, -0.01, , , , , , 13, 0.1, 0.2],
    "fx/vehicle/carhorn": [1.8, 0, 250, 0.02, 0.02, 0.2, 2, 2, , , , , 0.02, , , 0.02, 0.01, , , 0.1],
    "fx/vehicle/horn": [2, , 688, 0.02, 0.01, 7e-3, 1, 2.6, , , , , 0.01, , 85, , 0.01, 0.85, 0.03, 0.11, -818],
    "fx/vehicle/truckhorn": [1.5, , 1376, 0.02, 0.01, 7e-3, 1, 2.6, , , , , 0.01, , 85, , 0.01, 0.85, 0.8, 0.11, -818],
    "fx/vehicle/siren": [1.3, 0, 960, , 1, 0.01, , 0.8, -0.01, , -190, 0.5, , 0.05, , , 1],
    "fx/vehicle/submarine": [1.2, 0, 1975, 0.08, 0.56, 0.02, , , -0.4, , -322, 0.56, 0.41, , , , 0.25],
    "fx/vehicle/rocket": [1.5, 0, 941, 0.8, , 0.8, 4, 0.74, -222, , , , , 0.8, , 1],
    "game/coin/001": [1.2, 0, 1675, , 0.06, 0.24, 1, 1.82, , , 837, 0.06],
    "game/coin/002": [1.2, 0, 523.2511, 0.01, 0.06, 0.3, 1, 1.82, , , 837, 0.06],
    "game/coin/003": [0.6, 0, 1874, , 0.01, 0.25, 2, 0.76, , , 622, 0.1],
    "game/coin/004": [1, 0, 277, 0.03, 0.04, 0.06, 1, 1.8, 1, , 140, 0.06, 0.04, , , 0.1, , 0.99, 0.03],
    "game/collect/001": [1.1, 0, 450, , 0.01, 0.13, , 2.7, , -9.5, 500, 0.08, , , , , , 0.89],
    "game/collect/002": [1.05, , 10, 0.08, 0.07, 0.24, 2, 1.03, , , -374, 0.04, 0.09, , , , , 0.72, 0.15, 0.18],
    "game/die/001": [1.5, 0, 537, 0.02, 0.02, 0.22, 1, 1.59, -6.98, 4.97],
    "game/die/002": [1, , 321, 0.01, 0.06, 0.06, 1, 3.8, , -49, , , , 0.3, , , , 0.79, 0.09],
    "game/die/003": [1, 0, 344, 0.01, 0.02, 0.28, 1, 1.4, , , 50, , , , 0.3, 0.2, 0.15, 0.6, 0.06],
    "game/die/004": [0.5, 0, 43, 0.01, , 1, 2, , , , , , , , , 0.02, 0.01],
    "game/jump/001": [1, 0.1, 75, 0.03, 0.08, 0.17, 1, 1.88, 7.83, , , , , 0.4],
    "game/jump/002": [1.2, , 311, 0.03, 0.05, 0.05, , 2.2, , 9, , , 0.02, , 2.7, , , 0.97, 0.05, , 101],
    "game/jump/003": [1.5, , 65, 0.04, 0.1, 0.13, 1, 1.5, , -31, , , , 0.3, , , , 0.99, 0.03],
    "game/jump/004": [, 0, 500, , 0.01, 0.13, , 0.2, 1.7, , -400],
    "game/jump/005": [1, , 341, , 0.14, 0.23, 1, 1.01, 0.9, , -132, 0.03, , 0.1, , 0.1, , 0.52, 0.22],
    "game/jump/006": [0.7, , 1496, 0.09, 0.09, 0.01, 3, 0.14, , , -870, , , , 3.2, 0.2, , 0.31, 0.02],
    "game/powerup/001": [, , 188, 0.03, 0.09, 0.12, 1, 2.4, , 95, , , , , , , , 0.63, 0.08],
    "game/powerup/002": [0.8, 0, 413, 0.03, 0.05, 0.05, , 1.8, , 19, 177, 0.05, , , , , , 0.83, 0.02],
    "game/powerup/003": [0.5, , 643, , 0.1, 0.12, 1, 0.1, , 99, , , , , , , , 0.6, 0.02, , -732],
    "game/powerup/004": [1.18, , 143, 0.05, 0.08, 0.06, , 0.09, 25, 4.1, , , , , , , 0.01, 0.52, 0.09],
    "game/powerup/005": [1, , 18, 0.01, 0.01, 0.21, 1, 0.49, 9.9, , , , , , , , 0.04, 0.95, 0.02],
    "game/powerup/006": [0.5, , 426, 0.01, , 0.05, , 2.54, 49, , 9, 0.1, , , , , , 0.46, 0.15],
    "game/powerup/007": [1, , 158, 0.09, 0.18, 0.03, , 2.53, 11, -58, 63, 0.02, 0.01, 0.5, , , , 0.16],
    "game/powerup/008": [1.2, 0, 539, 0, 0.04, 0.29, 1, 1.92, , , 567, 0.02, 0.02, , , , 0.04],
    "instrument/bass/001": [2, 0, 65, 0.01, 0.08, 0.2, , 2.6, , , , , , 0.1, , , , 0.61, 0.02, , -1686],
    "instrument/bass/002": [2, 0, 73, 0.01, 0.08, 0.2, , 2.6, , , , , , 0.1, , , , 0.61, 0.02, , -1686],
    "instrument/bass/003": [2, 0, 82, 0.01, 0.08, 0.2, , 2.6, , , , , , 0.1, , , , 0.61, 0.02, , -1686],
    "instrument/bass/004": [2, 0, 87, 0.01, 0.08, 0.2, , 2.6, , , , , , 0.1, , , , 0.61, 0.02, , -1686],
    "instrument/bass/005": [2, 0, 97, 0.01, 0.08, 0.2, , 2.6, , , , , , 0.1, , , , 0.61, 0.02, , -1686],
    "instrument/bass/006": [2, 0, 110, 0.01, 0.08, 0.2, , 2.6, , , , , , 0.1, , , , 0.61, 0.02, , -1686],
    "instrument/bass/007": [2, 0, 123, 0.01, 0.08, 0.2, , 2.6, , , , , , 0.1, , , , 0.61, 0.02, , -1686],
    "instrument/bass/008": [2, 0, 130, 0.01, 0.08, 0.2, , 2.6, , , , , , 0.1, , , , 0.61, 0.02, , -1686],
    "instrument/drum/001": [1.5, 0, 86, , , , , 0.7, , , , 0.5, , 6.7, 1, 0.05],
    "instrument/drum/002": [0.7, 0, 270, , , 0.12, 3, 1.65, -2, , , , , 4.5, , 0.02],
    "tone/beep/001": [2, 0, 130, , 0.1, , 1, 1.5, , , , , , , , 0.1, 0.01],
    "tone/beep/002": [2, 0, 146, , 0.1, , 1, 1.5, , , , , , , , 0.1, 0.01],
    "tone/beep/003": [2, 0, 164, , 0.1, , 1, 1.5, , , , , , , , 0.1, 0.01],
    "tone/beep/004": [2, 0, 174, , 0.1, , 1, 1.5, , , , , , , , 0.1, 0.01],
    "tone/beep/005": [2, 0, 195, , 0.1, , 1, 1.5, , , , , , , , 0.1, 0.01],
    "tone/beep/006": [2, 0, 220, , 0.1, , 1, 1.5, , , , , , , , 0.1, 0.01],
    "tone/beep/007": [2, 0, 246, , 0.1, , 1, 1.5, , , , , , , , 0.1, 0.01],
    "tone/beep/008": [2, 0, 261, , 0.1, , 1, 1.5, , , , , , , , 0.1, 0.01],
    "tone/bell/001": [2, 0, 999, , , , , 1.5, , 0.3, -99, 0.1, 1.63, , , 0.11, 0.22],
    "tone/bell/002": [, 0, 1600, 0.13, 0.52, 0.61, 1, 1.1, , , , , , 0.1, , 0.14],
    "tone/bell/random": [2, 0.1, 999, , , , , 1.5, , 0.3, -99, 0.1, 1.63, , , 0.11, 0.22],
    "tone/blip/001": [5, 0, 130, 0.02, 0.03, 0.02, , 2.8, , , , , , , , , , 0.7, 0.02],
    "tone/blip/002": [3, 0, 146, 0.02, 0.03, 0.02, , 2.8, , , , , , , , , , 0.7, 0.02],
    "tone/blip/003": [3, 0, 164, 0.02, 0.03, 0.02, , 2.8, , , , , , , , , , 0.7, 0.02],
    "tone/blip/004": [3, 0, 174, 0.02, 0.03, 0.02, , 2.8, , , , , , , , , , 0.7, 0.02],
    "tone/blip/005": [3, 0, 195, 0.02, 0.03, 0.02, , 2.8, , , , , , , , , , 0.7, 0.02],
    "tone/blip/006": [3, 0, 220, 0.02, 0.03, 0.02, , 2.8, , , , , , , , , , 0.7, 0.02],
    "tone/blip/007": [3, 0, 246, 0.02, 0.03, 0.02, , 2.8, , , , , , , , , , 0.7, 0.02],
    "tone/blip/008": [3, 0, 261, 0.02, 0.03, 0.02, , 2.8, , , , , , , , , , 0.7, 0.02],
    "tone/bloop/001": [1, , 110, 0.02, , 0.09, 1, 0.61, , , 556, 0.12, , , , 0.3, , , 0.02],
    "tone/bloop/002": [1, 0, 521.25, , 0.02, 0.03, 2, 0, , 0.1, 700, 0.01, , , 1, 0.1],
    "tone/bloop/003": [1.12, , 73, , 0.02, 0.11, 2, 1.18, , -0.1, , , , , , 0.3, , 0.55, 0.05, 0.23],
    "tone/bloop/004": [0.5, , 1368, 0.09, , 0, , 1.11, -76, 9.1, -490, , , , , , , 0.56],
    "tone/bloop/005": [2.03, , 413, , , 0.24, 2, 0.12, , , , , 0.11, , 317, 0.1, 0.13, , , 0.01],
    "tone/bloop/006": [, 0, , 0.01, 0.02, 0.09, , 0.6, 17, -3, , , 0.1, , , , , 0.76, 0.08],
    "tone/bloop/007": [0.3, , 10, 0.06, , 0, 2, 2.3, , , 621, , , , , , , , 0.21, 0.26],
    "tone/bloop/008": [1.5, 0.05, 24, 0.01, 0.02, 0.01, 1, 3.9, -33, 0, 0, 0, 0, 0, 355, 0, 0, 0.65, 0, 0, 0],
    "tone/bloop/009": [2, 0.05, 226, 0, 0.08, 0.13, 0, 3.1, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.02, 0.76, 0.04, 0, 105],
    "tone/bloop/010": [4, 0, 224, 0.02, 0.02, 0.08, 1, 1.7, -13.9, , , , , , 6.7],
    "tone/bloop/011": [1, , 283, 0.02, , 0.11, , 0.38, , , , , 0.07, , , 0.1, 0.08, 0.63, 0.02],
    "tone/bloop/012": [1, 0, 288, 0.05, 0.01, , , 2, -10, , , , , , , , , 0.5, 0.1],
    "tone/bloop/013": [2, 0, 700, 0.01, , 0, , , , , , , , , , , , 0.1, 0.01],
    "tone/bloop/014": [2.21, , 107, 0.02, 0.04, 0.07, , 2.22, 2, 0.9, , , , 0.4, , 0.5, 0.15, 0.42, 0.04],
    "tone/bloop/015": [0.6, 0, 2200, , , 0.04, 3, 2, , , 800, 0.02, , 4.8, , 0.01, 0.1],
    "tone/jingle/001": [1.4, , 183, 0.07, 0.13, 0.34, , 3.3, , , 35, 0.06, 0.07, , , , 0.13, 0.95, 0.27, 0.11],
    "tone/jingle/002": [0.8, , 208, 0.02, 0.21, 0.13, 3, 0.2, , , 40, 0.06, 0.1, , , , , 0.91, 0.2, 0.27],
    "tone/jingle/003": [0.9, , 56, 0.15, 0.46, 0.08, , 1.6, -2, , -137, 0.01, 0.06, , , , 0.09, 0.77, 0.37, 0.13],
    "tone/jingle/004": [0.6, , 269, 0.03, 0.17, 0.41, , 0.2, , 1, 239, 0.08, 0.04, , , , , 0.72, 0.19, 0.43, -720],
    "tone/jingle/005": [1.3, 0, 130.81, 0.32, 0.35, 0.5, 3, 5.2, 0, 1, 50, 0, 0.14, 0, 0, 0, 0, 0.37, 0.04, 0.24, 0],
    "tone/jingle/006": [1, , 525, 0.18, 0.28, 0.17, 1, 1.24, 8.3, -9.7, -151, 0.03, 0.06, , , , , 0.93, 0.02, 0.14],
    "tone/jingle/007": [0.6, , 934, 0.12, 0.38, 0.93, 1, 0.27, , 0.4, -434, 0.08, 0.2, 0.1, , 0.1, 0.17, 0.55, 1, 0.46],
    "tone/jingle/008": [1.4, 0, 20, 0.04, , 0.6, , 1.31, , , -990, 0.06, 0.17, , , 0.04, 0.07],
    "tone/jingle/009": [1.2, 0, 80, 0.3, 0.4, 0.7, 2, 0.1, -0.73, 3.42, -430, 0.09, 0.17, , , , 0.19],
    "tone/jingle/010": [0.5, , 392, 0.06, 0.22, 0.5, 1, 1.85, -0.1, -0.9, 61, 0.05, 0.07, , , 0.1, , 0.96, 0.12],
    "tone/jingle/011": [0.5, , 146, 0.04, 0.23, 0.46, , 0.56, , -3.7, 658, 0.02, 0.15, 0.1, , , , 0.82, 0.13, 0.2],
    "tone/jingle/012": [1, , 284, 0.08, 0.2, 0.25, 1, 3, , , 50, 0.09, 0.06, , , , , 0.6, 0.28, 0.03, -1391],
    "tone/jingle/013": [1.5, , 430, 0.02, 0.12, 0.5, , 0.89, , -3.6, -133, 0.07, 0.13, , , 0.1, , 0.83, 0.23, 0.26],
    "tone/jingle/014": [0.4, , 22, 0.08, 0.22, 0.02, 1, 0.52, -4.2, -9.8, , , 0.14, , -18, 0.2, , , 0.05],
    "tone/jingle/015": [, , 193, 0.04, 0.27, 0.42, 1, 1.71, 2.8, 4.9, , , 0.1, 0.2, , 0.1, , 0.55, 0.27, 0.47],
    "tone/jingle/016": [1.1, , 250, 0.07, 0.24, 0.26, , 2, , 164, 211, 0.07, 0.08, , , 0.1, , 0.75, 0.12, 0.09, 115],
    "tone/jingle/017": [, , 103, 0.04, 0.11, 0.43, 1, 0.77, , , 57, 0.19, 0.05, , , 0.1, , 0.68, 0.24],
    "ui/click/001": [1.5, 0, 900, , 0.01, 0, 1, , -10, , -31, 0.02, , , , , , 1.2, , 0.16, -1448],
    "ui/click/002": [2.5, , 783, , 0.03, 0.02, 1, 2, , , 940, 0.03, , , , , 0.2, 0.6, , 0.06],
    "ui/click/003": [1.5, 0.01, 300, , , 0.02, 3, 0.22, , , -9, 0.2, , , , , , 0.5],
    "ui/click/004": [1, 0, 685, 0.01, 0.03, 0.17, 1, 1.4, , , , , , , , , , 0.63, 0.01, , 420],
    "ui/click/005": [6, , 205, , 0.02, 0, , 1.03, , , , , , , , , 0.12, 0.32],
    "weapon/explode/001": [1.5, 0, 333, 0.01, 0, 0.9, 4, 1.9, , , , , , 0.5, , 0.6],
    "weapon/explode/002": [1.1, 0, 418, 0, 0.02, 0.2, 4, 1.15, -8.5, , , , , 0.7, , 0.1],
    "weapon/explode/003": [1.2, 0, 82, 0.02, , 0.2, 4, 4, , , , , , 0.8, , 0.2, , 0.8, 0.09],
    "weapon/explode/004": [2, 0.2, 72, 0.01, 0.01, 0.2, 4, , , , , , , 1, , 0.5, 0.1, 0.5, 0.02],
    "weapon/explode/005": [2, , 1e3, 0.02, , 0.2, 1, 3, 0.1, , , , , 1, -30, 0.5, , 0.5],
    "weapon/explode/006": [1, , 485, 0.02, 0.2, 0.2, 4, 0.11, -3, 0.1, , , 0.05, 1.1, , 0.4, , 0.57, 0.5],
    "weapon/explode/007": [0.8, , 372, 0.02, 0.02, 0.5, 4, 2.29, 0.2, , , , , 0.6, , 0.6, , 0.7, 0.04, 0.19],
    "weapon/explode/008": [1.05, , 591, 0.03, 0.13, 0.51, 4, 3.02, 0.6, 0.1, , , 0.04, 1.6, , 1, , 0.46, 0.13],
    "weapon/explode/009": [1.99, , 770, 0.03, 0.19, 0.35, , 0.26, , , , , , 2, -50, 0.1, 0.27, 0.48, 0.06],
    "weapon/explode/010": [1.5, , 98, 0.08, 0.18, 0.02, 2, 2.47, 36, 0.5, , , 0.04, 0.1, , 0.9, 0.44, , 0.04],
    "weapon/explode/011": [1, , 400, , 0.03, 0.21, 3, 0.85, 0.5, , , , , 1.8, , 0.5, , 0.97, 0.05],
    "weapon/explode/012": [1, , 485, 0.02, 0.07, 0.03, 4, 0.11, -3, 0.1, , , 0.05, 1.1, , 0.4, , 0.57, 0.09],
    "weapon/explode/013": [, , 30, 0.09, 0.12, 0.35, 4, 3, 4, , , , , 1.3, , 0.6, , 0.36, 0.21],
    "weapon/lazer/001": [1.5, 0, 515, 0.05, 0.07, 0.09, 1, 2.8, , , 302, 0.06, 0.1, , 3.5, 0.1, 0.08, 0.75, 0.04],
    "weapon/lazer/002": [, 0, 925, 0.04, 0.3, 0.6, 1, 0.3, , 6.27, -184, 0.09, 0.17],
    "weapon/lazer/003": [1, , 375, 0.01, 0.06, , 2, 2.3, 18, -10, , , , , 18, , , 0.56, 0.14],
    "weapon/lazer/004": [0.5, , 2e3, , 0.05, 0, , 1.11, -17, , 197, 0.01, , 0.2, , , , , 0.16],
    "weapon/lazer/005": [0.9, , 752, 0.03, 0.01, 0.02, , 1.4, , , -10, 0.01, , , 3.4, , , 0.68, 0.03, , 106],
    "weapon/lazer/006": [1.9, , 221, 0.01, 0.05, 0.06, 1, 3.9, -2, , 116, 0.05, , , , , , 0.65, 0.02, , 452],
    "weapon/lazer/007": [1, , 659, 0.01, 0.04, , 1, 0.4, , -75, 179, 0.06, , , 0.2, , , 0.57],
    "world/footstep/001": [1.1, 0.05, 157, 0.03, 0.04, 0.04, 4, 4.9, 78, -13, 0, 0, 0.07, 0, 0, 0, 0, 0.91, 0.02, 0.33, 0],
    "world/footstep/002": [0.1, 1, 300, 0.05, 0.1, 0.05, 4, 0.2, -100, , -50, 0.07, , 0.5, , 0.4, , , , 0.05],
    "world/footstep/003": [3, , 5, , 0.06, 0.01, 2, 2.25, -19, -79, 409, 0.01, , , 6.6, , 0.2, 0.57, , 0.8],
    "world/nature/frog": [0.5, , 160, 0.03, 0.03, 0.02, , 1.52, -23, 93, 662, 0.02, , , , 0.1, , , 0.07, 0.01],
    "world/nature/dolphin": [0.5, 0, 448, 0.01, 0.1, 0.3, 3, 0.39, -0.5, , , , , , 0.2, 0.1, 0.08],
    "world/nature/whale": [1.2, 0, 1306, 0.8, 0.08, 0.02, 1, , , , , , 0.48, , -0.1, 0.11, 0.25],
    "world/nature/mouse": [1.2, 0, 1e3, 0.02, , 0.01, 2, , 18, , 475, 0.01, 0.01],
    "world/nature/small-dog": [1, , 759, 0.01, , 0.01, 1, 0.97, 15, , , , , , 3.1, , , 0.76, 0.04],
    "world/nature/tweet": [0.7, , 1305, , , 0.03, 1, 0.75, , 23, 694, 0.01, , , 3.9, , , , 0.01],
    "world/water/splash": [2, , 94, 0.07, 0.1, 0.33, 4, 0.6, 1, , , , , 0.1, 1, 0.1, 0.1, 0.45, 0.15],
    "world/water/wave": [1, 0, 40, 0.5, , 1.5, , 11, , , , , , 199],
    "world/water/pop": [1, 0, 103, , 0.02, 0.06, , 1.24, -18, 4.4, , , , 0.7, , 0.1, , 0.95, 0.03],
    "world/weather/thunder": [1.2, 0, 471, , 0.09, 0.47, 4, 1.06, -6.7, , , , , 0.9, 61, 0.1, , 0.82, 0.09, 0.13]
  };
  beep82.Sfx.play = function(sfx = "") {
    if (!sfx) return;
    beep82.Utilities.checkString("sfx", sfx);
    if (!beep82.Sfx.library[sfx]) {
      beep82.Utilities.fatal(`SFX ${sfx} not found.`);
    }
    beep82.Sfx.playFromArray(beep82.Sfx.library[sfx]);
  };
  beep82.Sfx.playFromArray = function(sfxArray = []) {
    beep82.Utilities.checkArray("sfxArray", sfxArray);
    zzfx(...sfxArray);
  };
  beep82.Sfx.add = function(sfxName, sfxArray) {
    beep82.Utilities.checkString("sfxName", sfxName);
    beep82.Utilities.checkArray("sfxArray", sfxArray);
    beep82.Sfx.library[sfxName] = sfxArray;
  };
  beep82.Sfx.get = function() {
    return Object.keys(beep82.Sfx.library);
  };
})(beep8);
(function(beep82) {
  beep82.Scene = {};
  let activeScene = null;
  const sceneList = {};
  beep82.Scene.add = function(name, gameObject = null, frameRate = 30) {
    beep82.Utilities.checkString("name", name);
    if (gameObject !== null) {
      beep82.Utilities.checkObject("gameObject", gameObject);
    }
    beep82.Utilities.checkInt("frameRate", frameRate);
    const init = gameObject.init || null;
    const update = gameObject.update || null;
    const render = gameObject.render || null;
    sceneList[name] = { init, update, render, frameRate };
  };
  beep82.Scene.set = function(name) {
    beep82.Utilities.checkString("name", name);
    if (!sceneList[name]) {
      beep82.Utilities.fatal(`Scene "${name}" does not exist.`);
    }
    beep82.Core.stopFrame();
    activeScene = name;
    if (beep82.Input && typeof beep82.Input.onEndFrame === "function") {
      beep82.Input.onEndFrame();
    }
    const currentScene = sceneList[name];
    if (currentScene.init) {
      currentScene.init();
    }
    if (currentScene.update || currentScene.render) {
      beep82.frame(currentScene.render, currentScene.update, currentScene.frameRate);
    }
  };
  beep82.Scene.pause = function() {
    beep82.frame(null);
  };
  beep82.Scene.resume = function() {
    if (!activeScene) {
      return;
    }
    const currentScene = sceneList[activeScene];
    if (currentScene.update || currentScene.render) {
      beep82.frame(
        currentScene.render || (() => {
        }),
        currentScene.update || (() => {
        }),
        currentScene.frameRate || 30
      );
    }
  };
  beep82.Scene.get = function() {
    return activeScene;
  };
  beep82.Scene.getAll = function() {
    return sceneList;
  };
})(beep8);
(function(beep82) {
  beep82.Renderer = {};
  let dirty = false;
  let screenshakeDuration = 0;
  let vignetteGradient = null;
  let scanPattern = null;
  const initCrt = () => {
    if (!beep82.Core.realCtx) {
      setTimeout(initCrt, 10);
      return;
    }
    vignetteGradient = beep82.Core.realCtx.createRadialGradient(
      beep82.Core.realCanvas.width / 2,
      beep82.Core.realCanvas.height / 2,
      Math.max(beep82.Core.realCanvas.width, beep82.Core.realCanvas.height) * 0.4,
      beep82.Core.realCanvas.width / 2,
      beep82.Core.realCanvas.height / 2,
      Math.max(beep82.Core.realCanvas.width, beep82.Core.realCanvas.height) * 0.9
    );
    vignetteGradient.addColorStop(0, "rgba(255,255,255,0)");
    vignetteGradient.addColorStop(0.7, "rgba(0,0,0,0.5)");
    vignetteGradient.addColorStop(1, "rgba(0,0,0,1)");
    const pat = new OffscreenCanvas(1, 2);
    const patCtx = pat.getContext("2d");
    patCtx.fillStyle = "rgba(0,0,0,0.15)";
    patCtx.fillRect(0, 1, 1, 1);
    patCtx.fillStyle = "rgba(255,255,255,0.0)";
    patCtx.fillRect(0, 0, 1, 1);
    scanPattern = beep82.Core.realCtx.createPattern(pat, "repeat");
  };
  document.addEventListener("beep8.initComplete", initCrt);
  beep82.Renderer.render = function() {
    if (beep82.Core.crashed) return;
    beep82.Core.realCtx.imageSmoothingEnabled = false;
    let x = 0;
    let y = 0;
    if (screenshakeDuration > 0) {
      let amount = screenshakeDuration * beep82.CONFIG.CHR_WIDTH;
      x = Math.round(Math.random() * amount - amount / 2);
      y = Math.round(Math.random() * amount - amount / 2);
      x = beep82.Utilities.clamp(x, -6, 6);
      y = beep82.Utilities.clamp(y, -6, 6);
      screenshakeDuration -= beep82.Core.deltaTime;
    }
    beep82.Core.realCtx.globalCompositeOperation = "source-over";
    beep82.Core.realCtx.clearRect(
      0,
      0,
      beep82.Core.realCanvas.width,
      beep82.Core.realCanvas.height
    );
    beep82.Core.realCtx.drawImage(
      beep82.Core.offCanvas,
      x,
      y,
      beep82.Core.realCanvas.width,
      beep82.Core.realCanvas.height
    );
    dirty = false;
    beep82.CursorRenderer.draw(beep82.Core.realCtx);
    applyScanlines();
    applyVignette();
  };
  const applyVignette = () => {
    if (!vignetteGradient) return;
    if (!beep82.CONFIG.CRT_ENABLE) return;
    beep82.Core.realCtx.save();
    beep82.Core.realCtx.globalCompositeOperation = "multiply";
    beep82.Core.realCtx.fillStyle = vignetteGradient;
    beep82.Core.realCtx.fillRect(0, 0, beep82.Core.realCanvas.width, beep82.Core.realCanvas.height);
    beep82.Core.realCtx.restore();
  };
  const applyScanlines = () => {
    if (!scanPattern) return;
    if (!beep82.CONFIG.CRT_ENABLE) return;
    beep82.Core.realCtx.save();
    beep82.Core.realCtx.globalCompositeOperation = "soft-light";
    beep82.Core.realCtx.fillStyle = scanPattern;
    beep82.Core.realCtx.fillRect(0, 0, beep82.Core.realCanvas.width, beep82.Core.realCanvas.height);
    beep82.Core.realCtx.restore();
  };
  beep82.Renderer.shakeScreen = function(durationSeconds = 0.25) {
    beep82.Utilities.checkNumber("duration", durationSeconds);
    if (durationSeconds <= 0) {
      beep82.Utilities.warn(`Screenshake duration must be positive. Currently: ${durationSeconds}`);
      return false;
    }
    screenshakeDuration = durationSeconds;
    return true;
  };
  beep82.Renderer.markDirty = function() {
    if (dirty) {
      return;
    }
    dirty = true;
    setTimeout(beep82.Renderer.render, 1);
  };
})(beep8);
(function(beep82) {
  beep82.Random = {};
  let randomSeed = null;
  beep82.Random.setSeed = function(seed = null) {
    if (seed === null) {
      seed = Date.now();
    }
    if (typeof seed === "string") {
      seed = seed.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    }
    seed ^= seed << 13;
    seed ^= seed >> 17;
    seed ^= seed << 5;
    seed >>>= 0;
    randomSeed = seed;
    for (let i = 0; i < 10; i++) {
      beep82.Random.num();
    }
  };
  beep82.Random.getSeed = function() {
    return randomSeed;
  };
  beep82.Random.num = function() {
    const a = 1664525;
    const c2 = 1013904223;
    const m = 4294967296;
    randomSeed = (randomSeed * a + c2) % m;
    return randomSeed / m;
  };
  beep82.Random.range = function(min, max) {
    beep82.Utilities.checkNumber("min", min);
    beep82.Utilities.checkNumber("max", max);
    return min + beep82.Random.num() * (max - min);
  };
  beep82.Random.int = function(min, max) {
    beep82.Utilities.checkInt("min", min);
    beep82.Utilities.checkInt("max", max);
    if (max <= min) {
      const tmp = max;
      max = min;
      min = tmp;
    }
    const randomValue = beep82.Random.range(min, max);
    return Math.round(randomValue);
  };
  beep82.Random.pick = function(array) {
    beep82.Utilities.checkArray("array", array);
    const index = beep82.Random.int(0, array.length - 1);
    return array[index];
  };
  const weightedArrayCache = /* @__PURE__ */ new Map();
  beep82.Random.pickWeighted = function(array, decayFactor = 0.2) {
    beep82.Utilities.checkArray("array", array);
    const cacheKey = JSON.stringify(array) + `|${decayFactor}`;
    let weightedArray = weightedArrayCache.get(cacheKey);
    if (!weightedArray) {
      weightedArray = beep82.Random.weightedArray(array, decayFactor);
      weightedArrayCache.set(cacheKey, weightedArray);
    }
    return beep82.Random.pick(weightedArray);
  };
  beep82.Random.shuffleArray = function(array) {
    beep82.Utilities.checkArray("array", array);
    array = array.slice();
    for (let i = 0; i < array.length; i++) {
      const j = beep82.Random.int(0, array.length - 1);
      const tmp = array[i];
      array[i] = array[j];
      array[j] = tmp;
    }
    return array;
  };
  beep82.Random.chance = function(probability) {
    beep82.Utilities.checkNumber("probability", probability);
    return beep82.Random.num() <= probability / 100;
  };
  beep82.Random.weightedArray = function(array, decayFactor = 0.2) {
    beep82.Utilities.checkArray("array", array);
    const weightedArray = [];
    for (let i = 0; i < array.length; i++) {
      const count = Math.pow(decayFactor, i) * 10;
      for (let j = 0; j < count; j++) {
        weightedArray.push(array[i]);
      }
    }
    return weightedArray;
  };
  beep82.Random.coord2D = function(x, y, seed) {
    let h = 2166136261 ^ seed;
    h = Math.imul(h ^ x, 16777619);
    h = Math.imul(h ^ y, 16777619);
    h ^= h >>> 13;
    h = Math.imul(h, 2246822507);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
  beep82.Random.smooth2D = function(x, y, seed = 0, freq = 1) {
    x *= freq;
    y *= freq;
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const v00 = beep82.Random.coord2D(ix, iy, seed);
    const v10 = beep82.Random.coord2D(ix + 1, iy, seed);
    const v01 = beep82.Random.coord2D(ix, iy + 1, seed);
    const v11 = beep82.Random.coord2D(ix + 1, iy + 1, seed);
    const u = beep82.Math.fade(fx);
    const v = beep82.Math.fade(fy);
    const i1 = beep82.Math.lerp(v00, v10, u);
    const i2 = beep82.Math.lerp(v01, v11, u);
    return beep82.Math.lerp(i1, i2, v);
  };
  beep82.Random.setSeed();
})(beep8);
(function(beep82) {
  beep82.Passcodes = {};
  beep82.Passcodes.codeLength = 4;
  beep82.Passcodes.getCode = function(id) {
    beep82.Utilities.checkIsSet("id", id);
    const combined = id + beep82.CONFIG.PASSKEY;
    let hash = hashString(combined);
    hash = hash.replace(/[^a-zA-Z]/g, "");
    hash = hash.toUpperCase();
    return hash.substring(0, beep82.Passcodes.codeLength);
  };
  beep82.Passcodes.checkCode = function(id, code) {
    beep82.Utilities.checkIsSet("id", id);
    beep82.Utilities.checkString("code", code);
    const generatedCode = beep82.Passcodes.getCode(id);
    return generatedCode === code;
  };
  beep82.Passcodes.getId = function(code) {
    beep82.Utilities.checkString("code", code);
    code = code.toUpperCase();
    for (c = 1; c < 999; c++) {
      if (beep82.Passcodes.checkCode(c, code)) {
        return c;
      }
    }
    return null;
  };
  beep82.Passcodes.input = async function() {
    const message = "Enter code:";
    const width = message.length + 2 + 2;
    const height = 6;
    let xPosition = Math.round((beep82.CONFIG.SCREEN_COLS - width) / 2);
    let yPosition = Math.round((beep82.CONFIG.SCREEN_ROWS - height) / 2);
    beep82.Core.setCursorLocation(xPosition, yPosition);
    beep82.TextRenderer.printBox(width, height);
    beep82.Core.setCursorLocation(xPosition + 2, yPosition + 2);
    const passcode = await beep82.Async.readLine(message, "", beep82.Passcodes.codeLength);
    const value = beep82.Passcodes.getId(passcode);
    return value;
  };
  function hashString(input) {
    input = btoa(input);
    let hash = 0;
    let result = "";
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash = hash & hash;
    }
    for (let j = 0; j < 5; j++) {
      hash = (hash << 5) - hash + beep82.CONFIG.PASSKEY.charCodeAt(j % beep82.CONFIG.PASSKEY.length);
      result += Math.abs(hash).toString(36);
    }
    return result;
  }
})(beep8);
(function(beep82) {
  beep82.Particles = {};
  let particles_ = [];
  beep82.Particles.add = function(x, y, props) {
    beep82.Utilities.checkNumber("x", x);
    beep82.Utilities.checkNumber("y", y);
    beep82.Utilities.checkObject("props", props);
    const defaults = {
      x,
      y,
      vx: 0,
      vy: 0,
      life: 1,
      size: 1,
      color: 15,
      gravity: 0
    };
    const newParticle = Object.assign({}, defaults, props);
    if (Array.isArray(newParticle.color)) {
      newParticle.color = beep82.Random.pick(newParticle.color);
    }
    if (Array.isArray(newParticle.size)) {
      newParticle.size = beep82.Random.pick(newParticle.size);
    }
    particles_.push(newParticle);
  };
  beep82.Particles.createExplosion = function(x, y, count = 10, props = {}) {
    beep82.Utilities.checkNumber("x", x);
    beep82.Utilities.checkNumber("y", y);
    beep82.Utilities.checkNumber("count", count);
    beep82.Utilities.checkObject("props", props);
    const defaults = {
      size: 1,
      color: beep82.Core.drawState.fgColor,
      life: 2,
      speed: 25,
      gravity: 0
    };
    const newExplosion = Object.assign({}, defaults, props);
    for (let i = 0; i < count; i++) {
      const angle = beep82.Random.range(0, Math.PI * 2);
      const speed = beep82.Random.range(newExplosion.speed / 2, newExplosion.speed);
      beep82.Particles.add(
        x,
        y,
        {
          size: newExplosion.size,
          color: newExplosion.color,
          life: newExplosion.life,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          g: newExplosion.gravity
        }
      );
    }
  };
  beep82.Particles.update = function(dt) {
    for (let i = particles_.length - 1; i >= 0; i--) {
      const p = particles_[i];
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        particles_.splice(i, 1);
      }
    }
  };
  beep82.Particles.render = function() {
    for (let i = 0; i < particles_.length; i++) {
      const p = particles_[i];
      const center = p.size / 2;
      beep82.Core.offCtx.fillStyle = beep82.Core.getColorHex(p.color);
      beep82.Core.offCtx.fillRect(Math.round(p.x - center), Math.round(p.y - center), Math.round(p.size), Math.round(p.size));
    }
  };
  beep82.Particles.clearAll = function() {
    particles_ = [];
  };
  beep82.Particles.getParticles = function() {
    return [...particles_];
  };
  beep82.Particles.setParticles = function(particles) {
    beep82.Utilities.checkArray("particles", particles);
    particles_ = particles;
  };
})(beep8);
(function(beep82) {
  let timeHidden = 0;
  let isHidden = false;
  function sleep() {
    if (isHidden) return;
    isHidden = true;
    timeHidden = Date.now();
    beep82.Utilities.event("pageVisibility.sleep");
  }
  ;
  function wake() {
    if (!isHidden) return;
    isHidden = false;
    if (timeHidden === 0) return;
    const timeAsleep = Date.now() - timeHidden;
    beep82.Utilities.log("Time asleep:", (timeAsleep / 1e3).toFixed(3));
    beep82.Utilities.event("pageVisibility.wake", { time: timeAsleep });
    timeHidden = 0;
  }
  document.addEventListener(
    "visibilitychange",
    function() {
      if (document.hidden) {
        sleep();
      } else {
        wake();
      }
    }
  );
  window.addEventListener("blur", () => sleep());
  window.addEventListener("focus", () => wake());
})(beep8);
(function(beep82) {
  beep82.Music = {};
  function times(n, fn) {
    var result = [];
    for (var i = 0; i < n; i++) {
      result.push(fn(i));
    }
    return result;
  }
  const p1Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  function noteToMidi(note) {
    var regex = /^([A-Ga-g])([#b]?)(\d)$/;
    var match = note.match(regex);
    if (!match) return null;
    var letter = match[1].toUpperCase();
    var accidental = match[2];
    var octave = parseInt(match[3], 10);
    var semitones = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[letter];
    if (accidental === "#") {
      semitones += 1;
    } else if (accidental === "b") {
      semitones -= 1;
    }
    return (octave + 1) * 12 + semitones;
  }
  function noteToP1(note) {
    let midi = noteToMidi(note);
    if (midi === null) return "?";
    midi = beep82.Utilities.clamp(midi, 36, 87);
    return p1Alphabet.charAt(midi - 36);
  }
  function compressNotes(arr) {
    if (arr.length === 0) return "";
    var result = arr[0];
    for (var i = 1; i < arr.length; i++) {
      if (arr[i] === arr[i - 1] && arr[i] !== " " && arr[i] !== "|") {
        result += "-";
      } else {
        result += arr[i];
      }
    }
    return result;
  }
  function createRandomPattern(len, freq, interval, loop) {
    var pattern = times(
      len,
      function() {
        return false;
      }
    );
    for (var i = 0; i < loop; i++) {
      if (interval > len) break;
      pattern = reversePattern(pattern, interval, freq);
      interval *= 2;
    }
    return pattern;
  }
  function reversePattern(pattern, interval, freq) {
    var pt = times(
      interval,
      function() {
        return false;
      }
    );
    for (var i = 0; i < freq; i++) {
      pt[beep82.Random.int(0, interval - 1)] = true;
    }
    return pattern.map(
      function(p, i2) {
        return pt[i2 % interval] ? !p : p;
      }
    );
  }
  const chords = [
    ["I", "IIIm", "VIm"],
    ["IV", "IIm"],
    ["V", "VIIm"]
  ];
  const nextChordsIndex = [
    [0, 1, 2],
    [1, 2, 0],
    [2, 0]
  ];
  const chordMap = {
    I: ["C4", "E4", "G4", "B4"],
    IIIm: ["E4", "G4", "B4", "D5"],
    VIm: ["A3", "C4", "E4", "G4"],
    IV: ["F4", "A4", "C5", "E5"],
    IIm: ["D4", "F4", "A4", "C5"],
    V: ["G3", "B3", "D4", "F4"],
    VIIm: ["B3", "D4", "F4", "A4"]
  };
  const keyShift = {
    C: 0,
    D: 2,
    Eb: 3,
    F: 5,
    G: 7,
    A: 9,
    Bb: 10
  };
  const instrumentOptions = [0, 1, 2, 3, 4, 5];
  const drumOptions = [6, 7];
  function getChordNotes(key, roman) {
    const base = chordMap[roman] || chordMap.I;
    const shift = keyShift[key] || 0;
    return base.map(
      function(note) {
        return transpose(note, shift);
      }
    );
  }
  function transpose(note, shift) {
    var midi = noteToMidi(note);
    if (midi === null) {
      return note;
    }
    midi += shift;
    var octave = Math.floor(midi / 12) - 1;
    var index = midi % 12;
    var noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    return noteNames[index] + octave;
  }
  function generateChordProgression(len) {
    var keys = ["C", "D", "Eb", "F", "G", "A", "Bb"];
    var key = beep82.Random.pick(keys);
    var chordChangeInterval = 4;
    var currentRoman = null;
    var chordsIndex = 0;
    var progression = [];
    for (var i = 0; i < len; i++) {
      if (i % chordChangeInterval === 0) {
        if (i === 0) {
          chordsIndex = beep82.Random.int(0, chords.length - 1);
          currentRoman = beep82.Random.pick(chords[chordsIndex]);
        } else if (beep82.Random.num() < 0.8 - i / chordChangeInterval % 2 * 0.5) {
          chordsIndex = beep82.Random.pick(nextChordsIndex[chordsIndex]);
          currentRoman = beep82.Random.pick(chords[chordsIndex]);
        }
        var currentChord = getChordNotes(key, currentRoman);
      }
      progression.push(currentChord);
    }
    return progression;
  }
  function generateMelodyNote(noteCount, chordProgressionNotes) {
    var notes = [beep82.Random.pick(instrumentOptions), "|"];
    var pattern = createRandomPattern(noteCount, 4, 8, 3);
    var octaveOffset = beep82.Random.int(-1, 1);
    for (var i = 0; i < noteCount; i++) {
      if (beep82.Random.chance(10)) {
        octaveOffset += beep82.Random.int(-1, 1);
      }
      if (!pattern[i]) {
        notes.push(" ");
        continue;
      }
      var chordNotes = chordProgressionNotes[i];
      var ns = chordNotes[beep82.Random.int(0, chordNotes.length - 1)];
      var baseOctave = parseInt(ns.slice(-1), 10);
      var newOctave = beep82.Utilities.clamp(baseOctave + octaveOffset, 3, 6);
      var noteName = ns.slice(0, -1).toUpperCase();
      var finalNote = noteName + newOctave;
      var p1Note = noteToP1(finalNote);
      notes.push(p1Note);
    }
    notes.push("|");
    return compressNotes(notes);
  }
  function generateChordNote(noteCount, chordProgressionNotes) {
    const notes = [beep82.Random.pick(instrumentOptions), "|"];
    var isArpeggio = beep82.Random.chance(30);
    var arpeggioInterval = beep82.Random.pick([4, 8, 16]);
    var arpeggioPattern = times(
      arpeggioInterval,
      function() {
        return beep82.Random.int(0, 3);
      }
    );
    var interval = beep82.Random.pick([2, 4, 8]);
    var pattern = isArpeggio ? times(
      noteCount,
      function() {
        return true;
      }
    ) : createRandomPattern(noteCount, beep82.Random.pick([1, 1, interval / 2]), interval, 2);
    var baseOctave = beep82.Random.int(-1, 1);
    var isReciprocatingOctave = beep82.Random.chance(isArpeggio ? 30 : 80);
    var octaveOffset = 0;
    for (var i = 0; i < noteCount; i++) {
      if (isReciprocatingOctave && i % interval === 0) {
        octaveOffset = (octaveOffset + 1) % 2;
      }
      if (!pattern[i]) {
        notes.push(" ");
        continue;
      }
      var chordNotes = chordProgressionNotes[i];
      var noteIndex = isArpeggio ? arpeggioPattern[i % arpeggioInterval] : 0;
      var ns = chordNotes[noteIndex];
      var baseOct = parseInt(ns.slice(-1), 10);
      var newOct = beep82.Utilities.clamp(baseOct + baseOctave + octaveOffset, 3, 6);
      var noteName = ns.slice(0, -1).toUpperCase();
      var finalNote = noteName + newOct;
      var p1Note = noteToP1(finalNote);
      notes.push(p1Note);
    }
    notes.push("|");
    return compressNotes(notes);
  }
  function generateDrumNote(noteCount) {
    const notes = [beep82.Random.pick(drumOptions), "|"];
    const pattern = createRandomPattern(
      noteCount,
      beep82.Random.int(1, 3),
      beep82.Random.pick([4, 8]),
      3
    );
    var drumHit = noteToP1("C4");
    for (var i = 0; i < noteCount; i++) {
      notes.push(pattern[i] ? drumHit : " ");
    }
    notes.push("|");
    return compressNotes(notes);
  }
  beep82.Music.generate = function(options) {
    if (options && options.seed) {
      beep82.Random.setSeed(options.seed);
    }
    const defaultOptions = {
      seed: beep82.Random.int(1e4, 99999),
      noteCount: beep82.Random.pick([16, 32, 48, 64]),
      channelCount: beep82.Random.int(2, 5),
      drumPartRatio: 0.3,
      tempo: beep82.Random.pick([70, 100, 140, 170, 200, 240, 280]),
      // Default tempo (BPM).
      hold: beep82.Random.pick([40, 50, 60, 60, 70, 70, 70, 80, 80, 80, 80, 90, 90, 90, 100, 110, 120, 130, 140, 150])
      // Default hold duration.
    };
    const opts = Object.assign({}, defaultOptions, options);
    beep82.Music.currentSongProperties = opts;
    beep82.Random.setSeed(opts.seed);
    var chordProgressionNotes = generateChordProgression(opts.noteCount);
    var parts = times(
      opts.channelCount,
      function() {
        var isDrum = beep82.Random.num() < opts.drumPartRatio;
        if (isDrum) {
          return generateDrumNote(opts.noteCount);
        } else {
          if (beep82.Random.num() < 0.5) {
            return generateMelodyNote(opts.noteCount, chordProgressionNotes);
          } else {
            return generateChordNote(opts.noteCount, chordProgressionNotes);
          }
        }
      }
    );
    if (opts.tempo !== null) {
      var tempoStr = String(opts.tempo);
      if (opts.hold !== null) {
        tempoStr += "." + String(opts.hold);
      }
      parts[0] = tempoStr + "\n" + parts[0];
    }
    return parts.join("\n");
  };
  let currentSong = null;
  beep82.Music.play = function(song) {
    p1(song);
    if (song) {
      currentSong = song;
    }
  };
  beep82.Music.stop = function(clearCurrentSong = true) {
    beep82.Utilities.checkBoolean("clearCurrentSong", clearCurrentSong);
    if (clearCurrentSong) currentSong = null;
    beep82.Music.play("");
  };
  beep82.Music.pause = function() {
    if (beep82.Music.isPlaying()) {
      beep82.Music.stop(false);
    }
  };
  beep82.Music.resume = function() {
    if (currentSong && !beep82.Music.isPlaying()) {
      beep82.Music.play(currentSong);
    }
  };
  beep82.Music.setVolume = function(volume) {
    beep82.Utilities.checkNumber("volume", volume);
    p1.setVolume(volume);
  };
  beep82.Music.setTempo = function(tempo) {
    beep82.Utilities.checkInt("tempo", tempo);
    if (tempo < 50) {
      tempo = 50;
    }
    p1.setTempo(tempo);
  };
  beep82.Music.isPlaying = function() {
    return p1.isPlaying();
  };
  document.addEventListener("beep8.pageVisibility.wake", beep82.Music.resume);
  document.addEventListener("beep8.pageVisibility.sleep", beep82.Music.pause);
})(beep8);
(function(beep82) {
  beep82.Menu = {};
  beep82.Menu.display = async function(choices, options) {
    options = options || {};
    beep82.Utilities.checkArray("choices", choices);
    beep82.Utilities.checkObject("options", options);
    options = Object.assign(
      {
        title: "",
        prompt: "",
        selBgColor: beep82.Core.drawState.fgColor,
        selFgColor: beep82.Core.drawState.bgColor,
        border: true,
        borderChar: beep82.CONFIG.BORDER_CHAR,
        center: false,
        centerH: false,
        centerV: false,
        padding: 1,
        selIndex: 0,
        typewriter: false
      },
      options
    );
    let startCol = beep82.Core.drawState.cursorCol;
    let startRow = beep82.Core.drawState.cursorRow;
    const promptSize = beep82.TextRenderer.measure(options.prompt);
    const prompt01 = options.prompt ? 1 : 0;
    const border01 = options.borderChar ? 1 : 0;
    let choicesCols = 0;
    const choicesRows = choices.length;
    choices.forEach(
      (choice) => {
        choicesCols = Math.ceil(Math.max(choicesCols, beep82.TextRenderer.measure(choice).cols));
      }
    );
    let totalCols = Math.ceil(Math.max(promptSize.cols, choicesCols)) + 2 * options.padding + 2 * border01;
    totalCols = Math.min(totalCols, beep82.CONFIG.SCREEN_COLS);
    const totalRows = prompt01 * (promptSize.rows + 1) + choicesRows + 2 * options.padding + 2 * border01;
    if (options.centerH || options.center) {
      startCol = Math.round((beep82.CONFIG.SCREEN_COLS - totalCols) / 2);
    }
    if (options.centerV || options.center) {
      startRow = Math.round((beep82.CONFIG.SCREEN_ROWS - totalRows) / 2);
    }
    beep82.Core.drawState.cursorCol = startCol;
    beep82.Core.drawState.cursorRow = startRow;
    if (options.border) {
      beep82.TextRenderer.printBox(totalCols, totalRows, true, options.borderChar);
      if (options.title) {
        const t = " " + options.title + " ";
        beep82.Core.drawState.cursorCol = startCol + Math.round((totalCols - t.length) / 2);
        beep82.TextRenderer.print(t);
      }
    }
    if (options.prompt) {
      beep82.Core.drawState.cursorCol = promptSize.cols <= totalCols ? startCol + border01 + options.padding : startCol + Math.round((totalCols - promptSize.cols) / 2);
      beep82.Core.drawState.cursorRow = startRow + border01 + options.padding;
      if (options.typewriter) {
        await beep82.Async.typewriter(options.prompt);
      } else {
        beep82.TextRenderer.print(options.prompt);
      }
    }
    let selIndex = options.selIndex;
    while (true) {
      beep82.Core.drawState.cursorRow = startRow + border01 + options.padding + prompt01 * (promptSize.rows + 1);
      beep82.Core.drawState.cursorCol = promptSize.cols <= choicesCols ? startCol + border01 + options.padding : startCol + Math.round((totalCols - choicesCols) / 2);
      printChoices(choices, selIndex, options);
      const k = await beep82.Input.readKeyAsync();
      if (k.includes("ArrowUp")) {
        selIndex = selIndex > 0 ? selIndex - 1 : choices.length - 1;
        if (choices.length > 1) beep82.Sfx.play(beep82.CONFIG.SFX.MENU_UP);
      } else if (k.includes("ArrowDown")) {
        selIndex = (selIndex + 1) % choices.length;
        if (choices.length > 1) beep82.Sfx.play(beep82.CONFIG.SFX.MENU_DOWN);
      } else if (k.includes("Enter") || k.includes("ButtonA") || k.includes("ButtonB") || k.includes(" ")) {
        beep82.Sfx.play(beep82.CONFIG.SFX.MENU_SELECT);
        return selIndex;
      }
    }
  };
  const printChoices = function(choices, selIndex, options) {
    const origBg = beep82.Core.drawState.bgColor;
    const origFg = beep82.Core.drawState.fgColor;
    for (let i = 0; i < choices.length; i++) {
      const isSel = i === selIndex;
      beep82.Core.setColor(isSel ? options.selFgColor : origFg, isSel ? options.selBgColor : origBg);
      beep82.TextRenderer.print(choices[i] + "\n");
    }
    beep82.Core.setColor(origFg, origBg);
  };
})(beep8);
(function(beep82) {
  beep82.Math = {};
  beep82.Math.dist2D = function(x0, y0, x1, y1) {
    beep82.Utilities.checkNumber("x0", x0);
    beep82.Utilities.checkNumber("y0", y0);
    beep82.Utilities.checkNumber("x1", x1);
    beep82.Utilities.checkNumber("y1", y1);
    const dx = x0 - x1;
    const dy = y0 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  };
  beep82.Math.lerp = function(a, b, t) {
    return a + (b - a) * t;
  };
  beep82.Math.fade = function(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  };
  beep82.Math.smoothstep = function(t) {
    return t * t * (3 - 2 * t);
  };
  function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
})(beep8);
(function(beep82) {
  beep82.Inventory = {};
  document.addEventListener(
    "beep8.initComplete",
    () => {
      beep82.Inventory.reset();
    },
    { once: true }
  );
  beep82.Inventory.reset = function() {
    beep82.data.inventory = {
      counts: {},
      flags: {}
    };
  };
  beep82.Inventory.getCount = function(id) {
    return beep82.data.inventory.counts[id] ?? 0;
  };
  beep82.Inventory.add = function(id, amount = 1, max = Infinity) {
    const current = beep82.Inventory.getCount(id);
    beep82.data.inventory.counts[id] = Math.min(current + amount, max);
  };
  beep82.Inventory.remove = function(id, amount = 1) {
    const current = beep82.Inventory.getCount(id);
    beep82.data.inventory.counts[id] = Math.max(current - amount, 0);
  };
  beep82.Inventory.has = function(id, amount = 1) {
    return beep82.Inventory.getCount(id) >= amount;
  };
  beep82.Inventory.setFlag = function(flag, value = true) {
    beep82.data.inventory.flags[flag] = value;
  };
  beep82.Inventory.getFlag = function(flag) {
    beep82.Utilities.checkString("flag", flag);
    return !!beep82.data.inventory.flags[flag];
  };
  beep82.Inventory.filter = function(match) {
    const out = [];
    const counts = beep82.data.inventory.counts;
    const isRegex = match instanceof RegExp;
    if (!isRegex) beep82.Utilities.checkString("match", match);
    for (const id in counts) {
      if (!Object.hasOwn(counts, id)) continue;
      const count = counts[id];
      if (count <= 0) continue;
      if (isRegex && match.test(id) || // If `match` is a regex, test the ID
      !isRegex && id.includes(match)) {
        out.push({ id, count });
      }
    }
    return out;
  };
})(beep8);
(function(beep82) {
  beep82.Intro = {};
  beep82.Intro.loading = async function() {
    const prefix = "8> ";
    beep82.color(0, 4);
    beep82.cls();
    beep82.locate(1, 1);
    beep82.print(prefix + "beep8 Loading...\n");
    await beep82.Async.wait(0.4);
  };
  beep82.Intro.splash = async function() {
    const titleScreen = beep82.Tilemap.load(`mBqYHoMBBACDAAMEgwADBIMBBACDAQQAgxh6AwSDGJkDBIMBBACDAQQAgwEEAIMDAwSDAwMEgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAAA8AAA8AmB6DAQQAgwADBIMAAwSDAAMEgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwMDBIMDAwSDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAAQEgwAEBIMABAQADwAADwCYHoMBBACDGJIDBIMYNwMEgxhbAwSDGDcDBIMYNwMEgxg3AwSDGQEEAwSDGDcDBIMYNwMEgxg3AwSDGDcDBIMYNwMEgxg3AwSDGDcDBIMZARYDBIMYNwMEgxg4AwSDAQQAgwEEAIMBBACDAAQEgwMDBIMBBAAADwAADwCYHoMPBQSDGEgDBIMCDwSDAQ8AgxMPBIMBBACDGQGIDwSDGQGHDwSDGQGJDwSDGE4FBIMZAVMPBIMZAVQPBIMZAVUPBIMYTgUEgwEPBIMBDwCDEw8EgxhKAwSDAQQAgwEEAIMBBACDDwUEgwEEAIMBBAAADwAADwCYHoMBBACDGEgDBIMBDwCDGHIFBIMBDwCDGE4FBIMZAZkPBIMYcgUEgxg9BQSDGK8FBIMZAVMPBIMYcgUEgxg9BQSDGK8FBIMLDwSDGHIFBIMLDwSDGEgDBIMBBACDAQQAgwEEAIMABASDAQQAgw8FBAAPAAAPAJgegwEEAIMYSgMEgwEPAIMBDwCDFwQPgwEEAIMZAZ0PBIMBDwSDGE4FBIMBBACDGQFUDwSDGQFTDwSDGE4BBIMBBACDAQ8EgwEPAIMYJQ8FgxhuDwSDGG4PBIMYlw8EgwAPBIMABASDAQQAgwEEAAAPAAAPAJgegwEEAIMYSAMEgwkPBIMYcgUEgwEPAIMYTgEEgxkBnQ8EgxhyBQSDGK8FBIMBBACDGQFTDwSDGHIFBIMYrwUEgwEEAIMBDwSDGHIFBIMYPQUEgxhIAwSDAQQAgwEEAIMBBACDAAQEgwAEBIMABAQADwAADwCYHoMBBACDGEgDBIMYTw8EgwEPAIMYJQ8FgxhOBQSDGQGaDwSDEgoPgxgcBQqDGBkFCoMYHQUKgxMKD4MYHQUPgxhOBQSDBg8EgxhOBQSDDwMEgxhIAwSDDgUEgwEEAIMBBACDAQQAgwEEAIMBBAAADwAADwCYHoMBBACDGFoDBIMYNwMEgxg3AwSDGDcDBIMYNwMEgxg3AwSDAQoEgxgrCgWDGDcDBIMYKwQKgwEKBIMYKwUEgxg3AwSDGFsDBIMYNwMEgxg3AwSDGKUDBIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAAAPAAAPAJgegwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMYJAoEgxguBQqDGBkKBIMYLwQKgxglCgWDGCsBBIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAAA8AAA8AmB6DAQQAgxgpAwSDAQQAgwEEAIMBBACDAQQAgwEEAIMSCgSDGBwFCoMYGQEKgxgdBQqDEwoFgxgiBQSDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAAAPAAAPAJgegxiXDwODGJcPA4MYGAMEgwEEAIMBBACDAQQAgw0FBIMLBAqDGCsKBYMABASDGCsECoMBCgSDGDIFBIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMDAwSDAwMEgwEEAIMBBACDAQQAAA8AAA8AmB6DAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgxgkCgSDGC4FCoMYGQoEgxgvBAqDGCUKBYMYKwUEgwAFCoMYHQEEgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAAA8AAA8AmB6DAQQAgwEEAIMBBACDAQQAgwEEAIMACgSDAAoEgwAKBIMYLgUEgxgZBAWDGBkEAYMYGQQFgxgvBQSDGC4FBIMYLwUEgwEEAIMBBACDAQQAgwEEAIMYrAMEgxg3AwSDGDcDBIMYWwMEgxg3AwQADwAADwCYHoMYNwMEgxg3AwSDGJsDBIMBBACDAQQAgwEEAIMBBACDAQQEgwEEBIMBBASDAQQEgwEEBIMBBACDAQQAgwEEAIMBBACDGQHlAwSDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAAA8AAA8AmB6DAQQAgwEEAIMBBACDAQQAgwEEAIMYbgMEgxhuAwSDGG4DBIMYbgMEgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAAA8AAA8AmB6DAA8EgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwADBIMYegMEgxiZAwSDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMAAwSDAAMEgwADBAAPAAAPAJgegxgcCgSDGB0KBIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgxgpAwSDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAAA8AAA8AmB6DGC4KBIMYLwoEgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgxgpAwSDGCkDBIMBBACDAQQAgwEEAIMBBACDAQQAgxcDBIMBAwSDGBgDBIMAAwSDAQQAgxh0AwSDGIYDBIMABQSDAQQAAA8AAA8AmB6DAQQAgwEEAIMBBACDAA8EgwEEAIMBBACDAQQAgxcDBIMCAwSDAQMEgxgYAwSDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDAAMEgwADBIMYdAMEgxkBbAUEgwEEAIMZAUYFBIMBBAAADwAADwCYHoMWAwSDGCgDBIMBBACDAQQAgxh0AwSDEAMEgwEEAIMBBACDAQQAgwEEAIMBBACDAQQAgwEEAIMBBACDFgMEgxgoAwSDGHQDBIMYhgMEgxkBbAUEgwAFBIMABQWDAQUEgwEFBIMBBQQADwAADwCYHoMYKAUDgwAFA4MYKAMEgxh0AwSDAQQAgwEEAIMNBQSDAQQAgwEEAIMYdAMEgxiGAwSDFgMEgxgoAwSDFgMEgwEDBIMBAwSDEAMEgxi0BQSDAAEFgwMBBYMABQWDAQUEgwEFBIMBBQQADwAADwCYHoMBBQSDGCgFA4MABQODGCgDBIMYuAUEgwEEAIMBBACDGIYDBIMYdAMEgxi4BQSDDwMEgwsDBIMBAwSDAQMEgxkBagUDgwEDBIMYnAUDgwADBYMAAQWDAQUEgwAFBYMPAQWDAQUEgwEFBAAPAAAPAJgegwMBBYMBBQSDAQUEgwEFBIMBBQSDAQUEgwEFBIMBBQSDAQUEgwEFBIMBBQSDAQUEgwEFBIMBBQSDAQUEgwEFBIMBBQSDAQUEgw8BBYMRAQWDDwEFgwMFAYMBBQSDAQUEAA8AAA8AloMRAQWDEQEFgwMBBYMDAQWDAwEFgwMBBYMADwWDAwEFgwMBBYMADwWDAA8FgwAPBYMDAQWDAA8FgwAPBYMADwWDDwEFgwsBBYMRAQWDCwEFgxhYBQGDAA8BloMADwGDEAEFgwAPBYMADwWDAA8FgwAPBYMADwWDAQEFgxABBYMADwWDAA8FgwAPBYMADwWDAA8FgwkBBYMADwWDAA8FgwQBBYMADwGDAA8BgwAPAYMABQE=`);
    beep82.locate(0, 0);
    beep82.Tilemap.draw(titleScreen);
    let message = "Click to start";
    if (beep82.Core.isTouchDevice()) message = "Tap to start";
    beep82.color(4, 5);
    beep82.locate(0, beep82.CONFIG.SCREEN_ROWS - 2);
    beep82.printCentered(message, beep82.CONFIG.SCREEN_COLS);
    await beep82.Input.readPointerAsync();
    beep82.color(15, 0);
    beep82.cls();
  };
})(beep8);
(function(beep82) {
  beep82.Input = {};
  let keysHeld_ = null;
  let keysJustPressed_ = null;
  beep82.Input.init = function() {
    keysHeld_ = /* @__PURE__ */ new Set();
    keysJustPressed_ = /* @__PURE__ */ new Set();
    window.addEventListener("keydown", (e) => beep82.Input.onKeyDown(e));
    window.addEventListener("keyup", (e) => beep82.Input.onKeyUp(e));
    window.addEventListener("pointerdown", (e) => beep82.Input.onPointerDown(e));
  };
  beep82.Input.keyHeld = function(keyName) {
    return keysHeld_.has(keyName.toUpperCase());
  };
  beep82.Input.keyJustPressed = function(keyName) {
    return keysJustPressed_.has(keyName.toUpperCase());
  };
  beep82.Input.onEndFrame = function() {
    keysJustPressed_.clear();
  };
  beep82.Input.onKeyDown = function(e) {
    const key = e.key;
    const keys = beep82.Input.getKeys(key);
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(key)) {
      e.preventDefault();
    }
    for (const k of keys) {
      keysJustPressed_.add(k.toUpperCase());
      keysHeld_.add(k.toUpperCase());
    }
    if (beep82.Core.hasPendingAsync("beep8.Async.key")) {
      beep82.Core.resolveAsync("beep8.Async.key", keys);
    }
  };
  beep82.Input.onPointerDown = function(e) {
    if (beep82.Core.hasPendingAsync("beep8.Async.pointer")) {
      beep82.Core.resolveAsync("beep8.Async.pointer", { x: e.clientX, y: e.clientY });
    }
  };
  beep82.Input.onKeyUp = function(e) {
    if (!e.key) return;
    const key = e.key.toUpperCase();
    const keys = beep82.Input.getKeys(key);
    for (const k of keys) {
      keysHeld_.delete(k.toUpperCase());
    }
  };
  beep82.Input.readKeyAsync = function() {
    return new Promise(
      (resolve, reject) => {
        beep82.Core.startAsync("beep8.Async.key", resolve, reject);
      }
    );
  };
  beep82.Input.readPointerAsync = function() {
    return new Promise(
      (resolve, reject) => {
        beep82.Core.startAsync("beep8.Async.pointer", resolve, reject);
      }
    );
  };
  beep82.Input.getKeys = function(key) {
    let keys = [key];
    switch (key.toUpperCase()) {
      case "W":
        keys.push("ArrowUp");
        break;
      case "A":
        keys.push("ArrowLeft");
        break;
      case "S":
        keys.push("ArrowDown");
        break;
      case "D":
        keys.push("ArrowRight");
        break;
      case "Enter":
        keys.push("Escape");
        break;
      case "Z":
      case "N":
        keys.push("ButtonA");
        break;
      case "X":
      case "M":
        keys.push("ButtonB");
        break;
    }
    return keys;
  };
  beep82.Input.readLine = async function(prompt2 = "Enter text:", initString = "", maxLen = 100, maxWidth = -1) {
    if (prompt2 && prompt2.length > 0) {
      beep82.print(prompt2 + "\n> ");
    }
    if (beep82.Core.isMobile()) {
      const textInput = await readPrompt(prompt2, initString, maxLen, maxWidth);
      beep82.print(textInput + "\n");
      await beep82.Async.wait(0.2);
      return textInput;
    }
    const startCol = beep82.Core.drawState.cursorCol;
    const startRow = beep82.Core.drawState.cursorRow;
    let curCol = startCol;
    let curRow = startRow;
    let curStrings = [initString];
    let curPos = 0;
    const cursorWasVisible = beep82.Core.drawState.cursorVisible;
    beep82.CursorRenderer.setCursorVisible(true);
    while (true) {
      beep82.Core.setCursorLocation(curCol, curRow);
      beep82.TextRenderer.print(curStrings[curPos] || "");
      const keys = await beep82.Input.readKeyAsync();
      for (const key of keys) {
        if (key === "Backspace") {
          if (curStrings[curPos].length === 0) {
            if (curPos === 0) {
              continue;
            }
            curPos--;
            curRow--;
          }
          curStrings[curPos] = curStrings[curPos].length > 0 ? curStrings[curPos].substring(0, curStrings[curPos].length - 1) : curStrings[curPos];
          beep82.Core.setCursorLocation(curCol + beep82.TextRenderer.measure(curStrings[curPos]).cols, curRow);
          beep82.TextRenderer.print(" ");
          beep82.Sfx.play(beep82.CONFIG.SFX.TYPING);
        } else if (key === "Enter") {
          beep82.CursorRenderer.setCursorVisible(cursorWasVisible);
          beep82.Sfx.play(beep82.CONFIG.SFX.TYPING);
          return curStrings.join("");
        } else if (key.length === 1) {
          if (curStrings.join("").length < maxLen || maxLen === -1) {
            curStrings[curPos] += key;
            if (maxWidth !== -1 && curStrings[curPos].length >= maxWidth) {
              beep82.TextRenderer.print(curStrings[curPos].charAt(curStrings[curPos].length - 1));
              curCol = startCol;
              curPos++;
              curStrings[curPos] = "";
              curRow++;
            }
          }
          beep82.Sfx.play(beep82.CONFIG.SFX.TYPING);
        }
      }
    }
  };
  const readPrompt = async function(promptString = "Enter text:", initString = "", maxLen = 100, maxWidth = -1) {
    let valid = false;
    let textInput = "";
    const allowedChars = beep82.CONFIG.CHRS;
    do {
      await beep82.Async.wait(0.333);
      textInput = prompt(promptString, initString);
      textInput = textInput.trim();
      textInput = textInput.split("").filter((char) => allowedChars.includes(char)).join("");
      if (maxLen !== -1) {
        textInput = textInput.substring(0, maxLen);
      }
      valid = textInput.length > 0;
    } while (valid === false);
    return textInput;
  };
})(beep8);
(function(beep82) {
  "use strict";
  beep82.ECS = {};
  let nextId = 0;
  let components = /* @__PURE__ */ new Map();
  let grid = [];
  let systems = /* @__PURE__ */ new Map();
  function makeEntity() {
    return nextId++;
  }
  function bucket(name) {
    if (!components.has(name)) components.set(name, /* @__PURE__ */ new Map());
    return components.get(name);
  }
  beep82.ECS.entitiesAt = function(col, row) {
    return grid[row]?.[col] ?? [];
  };
  beep82.ECS.addSystem = function(name, fn, order = 0) {
    beep82.Utilities.checkFunction("fn", fn);
    beep82.Utilities.checkString("name", name);
    beep82.Utilities.checkInt("order", order);
    if (systems.has(name)) beep82.Utilities.warn(`ECS: overwriting existing system "${name}"`);
    systems.set(name, { fn, order });
  };
  beep82.ECS.addSystemOnce = function(fn, name, order = 0) {
    beep82.Utilities.checkFunction("fn", fn);
    beep82.Utilities.checkString("name", name);
    beep82.Utilities.checkInt("order", order);
    if (systems.has(name)) return;
    beep82.ECS.addSystem(fn, name, order);
  };
  beep82.ECS.removeSystem = function(name) {
    systems.delete(name);
  };
  beep82.ECS.run = function(dt, filter = () => true) {
    [...systems.entries()].sort((a, b) => a[1].order - b[1].order).forEach(
      ([name, { fn }]) => {
        if (filter(name)) fn(dt);
      }
    );
  };
  beep82.ECS.add = function(id, name = null, data = {}) {
    beep82.Utilities.checkInt("id", id);
    beep82.Utilities.checkString("name", name);
    beep82.Utilities.checkObject("data", data);
    bucket(name).set(id, data);
    if ("Loc" === name) beep82.ECS.setLoc(id, data.col, data.row);
  };
  beep82.ECS.set = function(id, name, data) {
    beep82.ECS.add(id, name, data);
  };
  beep82.ECS.setLoc = function(id, col, row) {
    beep82.Utilities.checkInt("id", id);
    beep82.Utilities.checkInt("col", col);
    beep82.Utilities.checkInt("row", row);
    const loc = this.getComponent(id, "Loc");
    const oldRow = grid[loc.row];
    if (oldRow) {
      const cell = oldRow[loc.col];
      if (cell) {
        const i = cell.indexOf(id);
        if (i !== -1) cell.splice(i, 1);
      }
    }
    loc.col = col;
    loc.row = row;
    if (!grid[row]) grid[row] = [];
    if (!grid[row][col]) grid[row][col] = [];
    grid[row][col].push(id);
  };
  beep82.ECS.getComponents = function(name) {
    beep82.Utilities.checkString("name", name);
    return components.get(name) ?? /* @__PURE__ */ new Map();
  };
  beep82.ECS.getEntity = function(id) {
    beep82.Utilities.checkInt("id", id);
    const out = /* @__PURE__ */ new Map();
    for (const [name, map] of components) {
      if (map.has(id)) out.set(name, map.get(id));
    }
    return out;
  };
  beep82.ECS.getComponent = function(id, name) {
    beep82.Utilities.checkInt("id", id);
    beep82.Utilities.checkString("name", name);
    return components.get(name)?.get(id);
  };
  beep82.ECS.hasComponent = function(id, name) {
    beep82.Utilities.checkInt("id", id);
    beep82.Utilities.checkString("name", name);
    return components.get(name)?.has(id) ?? false;
  };
  beep82.ECS.removeComponent = function(id, name) {
    beep82.Utilities.checkInt("id", id);
    beep82.Utilities.checkString("name", name);
    components.get(name)?.delete(id);
    if ("Loc" === name) {
      const loc = this.getComponent(id, "Loc");
      if (loc) {
        const cell = grid[loc.row]?.[loc.col];
        if (cell) cell.splice(cell.indexOf(id), 1);
      }
    }
  };
  beep82.ECS.removeEntity = function(id) {
    const loc = this.getComponent(id, "Loc");
    if (loc) {
      const cell = grid[loc.row]?.[loc.col];
      if (cell) cell.splice(cell.indexOf(id), 1);
    }
    for (const store of components.values()) store.delete(id);
  };
  beep82.ECS.create = function(bundle) {
    beep82.Utilities.checkObject("bundle", bundle);
    const id = makeEntity();
    for (const [name, data] of Object.entries(bundle)) {
      beep82.ECS.add(id, name, data);
    }
    return id;
  };
  beep82.ECS.query = function(...names) {
    if (names.length === 0) return [];
    const base = components.get(names[0]);
    if (!base) return [];
    return [...base.keys()].filter(
      (id) => names.every((n) => components.get(n)?.has(id))
    );
  };
  beep82.ECS.countByType = function(typeName) {
    const typeMap = this.get("Type");
    if (!typeMap) return 0;
    let count = 0;
    for (const comp of typeMap.values()) {
      if (comp.name === typeName) count++;
    }
    return count;
  };
  beep82.ECS.reset = function() {
    components = /* @__PURE__ */ new Map();
    systems = /* @__PURE__ */ new Map();
    grid = [];
    nextId = 0;
  };
})(beep8);
(function(beep82) {
  beep82.CursorRenderer = {};
  let blinkCycle_ = 0;
  let toggleBlinkHandle_ = null;
  beep82.CursorRenderer.setCursorVisible = function(visible) {
    beep82.Utilities.checkBoolean("visible", visible);
    if (beep82.Core.drawState.cursorVisible === visible) return;
    beep82.Core.drawState.cursorVisible = visible;
    blinkCycle_ = 0;
    beep82.Renderer.render();
    if (toggleBlinkHandle_ !== null) {
      clearInterval(toggleBlinkHandle_);
      toggleBlinkHandle_ = null;
    }
    if (visible) {
      toggleBlinkHandle_ = setInterval(
        () => advanceBlink_(),
        beep82.CONFIG.CURSOR.BLINK_INTERVAL
      );
    }
  };
  beep82.CursorRenderer.draw = function(targetCtx) {
    beep82.Utilities.checkInstanceOf("targetCtx", targetCtx, CanvasRenderingContext2D);
    if (!beep82.Core.drawState.cursorVisible || blinkCycle_ <= 0) return;
    const font = beep82.TextRenderer.getFont();
    const realX = beep82.Core.drawState.cursorCol * beep82.CONFIG.CHR_WIDTH;
    const realY = beep82.Core.drawState.cursorRow * beep82.CONFIG.CHR_HEIGHT;
    targetCtx.fillStyle = beep82.Core.getColorHex(beep82.Core.drawState.fgColor);
    targetCtx.fillRect(
      realX + 1,
      realY + 1,
      font.charWidth_ - 2,
      font.charHeight_ - 2
    );
  };
  function advanceBlink_() {
    blinkCycle_ = (blinkCycle_ + 1) % 2;
    beep82.Renderer.render();
  }
})(beep8);
(function(beep82) {
  beep82.Core = {};
  beep82.Core.realCanvas = null;
  beep82.Core.realCtx = null;
  beep82.Core.offCanvas = null;
  beep82.Core.offCtx = null;
  beep82.Core.container = null;
  beep82.Core.startTime = 0;
  beep82.Core.deltaTime = 0;
  beep82.Core.crashed = false;
  beep82.Core.crashing = false;
  beep82.Core.drawState = {
    fgColor: 7,
    bgColor: 0,
    // -1 means transparent
    cursorCol: 0,
    cursorRow: 0,
    cursorVisible: false
    // Don't change this directly, use cursorRenderer.setCursorVisible()
  };
  let lastFrameTime = null;
  let initDone = false;
  let updateHandler = null;
  let renderHandler = null;
  let targetDt = 0;
  let timeToNextFrame = 0;
  let pendingAsync = null;
  beep82.Core.init = function(callback, options = {}) {
    beep82.Utilities.checkFunction("callback", callback);
    if (options) {
      beep82.Utilities.checkObject("options", options);
    }
    beep82.CONFIG = {
      ...beep82.CONFIG,
      ...options
    };
    beep82.Hooks.doAction("beforeInit");
    beep82.Core.initScreenshot();
    beep82.Core.asyncInit(callback);
    beep82.Core.startTime = beep82.Core.getNow();
    beep82.Hooks.doAction("afterInit");
    beep82.Utilities.event("initComplete");
  };
  beep82.Core.initialized = function() {
    return initDone;
  };
  beep82.Core.asyncInit = async function(callback = null) {
    beep82.Utilities.log("beep8 System initializing");
    beep82.CONFIG.SCREEN_WIDTH = beep82.CONFIG.SCREEN_COLS * beep82.CONFIG.CHR_WIDTH;
    beep82.CONFIG.SCREEN_HEIGHT = beep82.CONFIG.SCREEN_ROWS * beep82.CONFIG.CHR_HEIGHT;
    beep82.Core.realCanvas = document.createElement("canvas");
    if (beep82.CONFIG.CANVAS_SETTINGS && beep82.CONFIG.CANVAS_SETTINGS.CANVAS_ID) {
      beep82.Core.realCanvas.setAttribute("id", beep82.CONFIG.CANVAS_SETTINGS.CANVAS_ID);
    }
    if (beep82.CONFIG.CANVAS_SETTINGS && beep82.CONFIG.CANVAS_SETTINGS.CANVAS_CLASSES) {
      for (const className of beep82.CONFIG.CANVAS_SETTINGS.CANVAS_CLASSES) {
        beep82.Core.realCanvas.classList.add(className);
      }
    }
    beep82.Core.realCanvas.style.touchAction = "none";
    beep82.Core.realCanvas.style.userSelect = "none";
    beep82.Core.realCanvas.style.imageRendering = "pixelated";
    beep82.Core.realCanvas.addEventListener("touchstart", (e) => e.preventDefault());
    beep82.Core.container = document.createElement("div");
    beep82.Core.container.setAttribute("style", "");
    beep82.Core.container.id = "beep8";
    beep82.Core.container.style.display = "block";
    beep82.Core.container.style.lineHeight = "0";
    beep82.Core.container.style.position = "relative";
    beep82.Core.container.appendChild(beep82.Core.realCanvas);
    beep82.Core.getBeepContainerEl().appendChild(beep82.Core.container);
    beep82.Core.offCanvas = new OffscreenCanvas(beep82.CONFIG.SCREEN_WIDTH, beep82.CONFIG.SCREEN_HEIGHT);
    beep82.Core.offCtx = beep82.Core.offCanvas.getContext(
      "2d",
      {
        alpha: false,
        colorSpace: "srgb",
        desynchronized: true
      }
    );
    beep82.Core.offCtx.imageSmoothingEnabled = false;
    await beep82.TextRenderer.initAsync();
    beep82.Input.init();
    beep82.Core.updateLayout(false);
    window.addEventListener(
      "resize",
      () => beep82.Core.updateLayout(true)
    );
    if (beep82.Core.isMobile()) {
      beep82.Joystick.setup();
    }
    initDone = true;
    beep82.Utilities.log("beep8 System initialized");
    await beep82.Intro.loading();
    await beep82.Intro.splash();
    if (callback) {
      await callback();
    }
  };
  beep82.Core.getBeepContainerEl = function() {
    let container = document.body;
    if (beep82.CONFIG.CANVAS_SETTINGS && beep82.CONFIG.CANVAS_SETTINGS.CONTAINER) {
      const containerSpec = beep82.CONFIG.CANVAS_SETTINGS.CONTAINER;
      if (typeof containerSpec === "string") {
        container = document.getElementById(containerSpec.replace("#", ""));
        if (!container) {
          beep82.Utilities.fatal("beep8: Could not find container element with ID: " + containerSpec);
        }
      } else if (containerSpec instanceof HTMLElement) {
        container = containerSpec;
      } else {
        beep82.Utilities.error("beep8: beep8.CONFIG.CANVAS_SETTINGS.CONTAINER must be either an ID of an HTMLElement.");
        container = document.body;
      }
    }
    return container;
  };
  beep82.Core.preflight = function(apiMethod) {
    if (beep82.Core.crashed) {
      throw new Error(`Can't call API method ${apiMethod}() because the engine has crashed.`);
    }
    if (!initDone) {
      beep82.Utilities.fatal(
        `Can't call API method ${apiMethod}(): API not initialized. Call initAsync() wait until it finishes before calling API methods.`
      );
    }
    if (pendingAsync) {
      beep82.Utilities.fatal(
        `Can't call API method ${apiMethod}() because there is a pending async call to ${pendingAsync.name}() that hasn't finished running yet. Are you missing an 'await' keyword to wait for the async method? Use 'await ${pendingAsync.name}()',not just '${pendingAsync.name}()'`
      );
    }
  };
  beep82.Core.startAsync = function(asyncMethodName, resolve, reject) {
    if (pendingAsync) {
      throw new Error(
        "Internal bug: startAsync called while pendingAsync is not null. Missing preflight() call?"
      );
    }
    pendingAsync = {
      name: asyncMethodName,
      resolve,
      reject
    };
    beep82.Renderer.render();
  };
  beep82.Core.hasPendingAsync = function(asyncMethodName = null) {
    if (null === asyncMethodName) {
      return !!pendingAsync;
    }
    return pendingAsync && pendingAsync.name === asyncMethodName;
  };
  beep82.Core.endAsyncImpl = function(asyncMethodName, isError, result) {
    if (!pendingAsync) {
      throw new Error(`Internal bug: endAsync(${asyncMethodName}) called with no pendingAsync`);
    }
    if (pendingAsync.name !== asyncMethodName) {
      throw new Error(
        `Internal bug: endAsync(${asyncMethodName}) called but pendingAsync.name is ${pendingAsync.name}`
      );
    }
    const fun = isError ? pendingAsync.reject : pendingAsync.resolve;
    pendingAsync = null;
    fun(result);
  };
  beep82.Core.resolveAsync = function(asyncMethodName, result) {
    beep82.Core.endAsyncImpl(asyncMethodName, false, result);
  };
  beep82.Core.failAsync = function(asyncMethodName, error) {
    beep82.Core.endAsyncImpl(asyncMethodName, true, error);
  };
  let running = false;
  let animationFrameId = null;
  beep82.Core.setFrameHandlers = function(renderCallback = null, updateCallback = null, targetFps = 30) {
    updateHandler = updateCallback || (() => {
    });
    renderHandler = renderCallback || (() => {
    });
    targetDt = 1 / targetFps;
    timeToNextFrame = 0;
    lastFrameTime = beep82.Core.getNow();
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    running = true;
    animationFrameId = window.requestAnimationFrame(beep82.Core.doFrame);
  };
  beep82.Core.doFrame = async function() {
    if (!running) return;
    const now = beep82.Core.getNow();
    let delta = (now - lastFrameTime) / 1e3;
    lastFrameTime = now;
    beep82.Core.deltaTime = delta;
    delta = Math.min(delta, 0.05);
    timeToNextFrame += delta;
    let numUpdates = Math.floor(timeToNextFrame / targetDt);
    const MAX_UPDATES = 10;
    if (numUpdates > MAX_UPDATES) {
      numUpdates = MAX_UPDATES;
      timeToNextFrame = 0;
    }
    for (let i = 0; i < numUpdates; i++) {
      if (updateHandler) {
        updateHandler(targetDt);
      }
      if (beep82.Input && typeof beep82.Input.onEndFrame === "function") {
        beep82.Input.onEndFrame();
      }
      beep82.Particles.update(targetDt);
    }
    timeToNextFrame %= targetDt;
    if (renderHandler) {
      renderHandler();
    }
    beep82.Renderer.render();
    animationFrameId = window.requestAnimationFrame(beep82.Core.doFrame);
  };
  beep82.Core.stopFrame = function() {
    running = false;
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };
  beep82.Core.cls = function(bgColor = void 0) {
    bgColor = bgColor || beep82.Core.drawState.bgColor;
    beep82.Utilities.checkNumber("bgColor", bgColor);
    beep82.Core.offCtx.fillStyle = beep82.Core.getColorHex(bgColor);
    beep82.Core.offCtx.fillRect(0, 0, beep82.Core.offCanvas.width, beep82.Core.offCanvas.height);
    beep82.Core.setCursorLocation(0, 0);
    beep82.Renderer.markDirty();
  };
  beep82.Core.defineColors = function(colors) {
    beep82.Utilities.checkArray("colors", colors);
    beep82.CONFIG.COLORS = colors.slice();
    beep82.TextRenderer.regenColors();
  };
  beep82.Core.setColor = function(fg, bg = void 0) {
    beep82.Utilities.checkNumber("fg", fg);
    beep82.Core.drawState.fgColor = Math.round(fg);
    if (bg !== void 0) {
      beep82.Utilities.checkNumber("bg", bg);
      beep82.Core.drawState.bgColor = Math.round(bg);
    }
  };
  beep82.Core.setCursorLocation = function(col, row) {
    beep82.Utilities.checkNumber("col", col);
    beep82.Core.drawState.cursorCol = Math.round(col * 2) / 2;
    if (row !== void 0) {
      beep82.Utilities.checkNumber("row", row);
      beep82.Core.drawState.cursorRow = Math.round(row * 2) / 2;
    }
  };
  beep82.Core.nextCursorLocation = function() {
    let currentCursorCol = beep82.Core.drawState.cursorCol;
    let currentCursorRow = beep82.Core.drawState.cursorRow;
    beep82.Core.setCursorLocation(currentCursorCol + 1, currentCursorRow);
  };
  beep82.Core.getColorHex = function(c2) {
    if (typeof c2 !== "number") {
      return "#f0f";
    }
    if (c2 < 0) {
      return "#000";
    }
    c2 = beep82.Utilities.clamp(Math.round(c2), 0, beep82.CONFIG.COLORS.length - 1);
    return beep82.CONFIG.COLORS[c2];
  };
  beep82.Core.getNow = function() {
    if (window.performance && window.performance.now) {
      return window.performance.now();
    }
    return (/* @__PURE__ */ new Date()).getTime();
  };
  beep82.Core.drawImage = function(img, x, y, srcX, srcY, width, height) {
    beep82.Utilities.checkInstanceOf("img", img, HTMLImageElement);
    beep82.Utilities.checkNumber("x", x);
    beep82.Utilities.checkNumber("y", y);
    if (srcX !== void 0) beep82.Utilities.checkNumber("srcX", srcX);
    if (srcY !== void 0) beep82.Utilities.checkNumber("srcY", srcY);
    if (width !== void 0) beep82.Utilities.checkNumber("width", width);
    if (height !== void 0) beep82.Utilities.checkNumber("height", height);
    if (srcX !== void 0 && srcY !== void 0 && width !== void 0 && height !== void 0) {
      beep82.Core.offCtx.drawImage(img, srcX, srcY, width, height, x, y, width, height);
    } else {
      beep82.Core.offCtx.drawImage(img, x, y);
    }
  };
  beep82.Core.loadImage = async function(url) {
    beep82.Utilities.log("load image", url);
    return new Promise(
      (resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const lookupTable = generateColorLookupTable(beep82.CONFIG.COLORS);
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const closestColor = findClosestColorUsingLookup(r, g, b, lookupTable);
            const { r: pr, g: pg, b: pb } = closestColor;
            data[i] = pr;
            data[i + 1] = pg;
            data[i + 2] = pb;
          }
          ctx.putImageData(imageData, 0, 0);
          const modifiedImg = new Image();
          modifiedImg.onload = () => resolve(modifiedImg);
          modifiedImg.src = canvas.toDataURL();
        };
        img.src = url;
      }
    );
  };
  beep82.Core.drawRect = function(x, y, width, height, lineWidth = 1) {
    beep82.Utilities.checkNumber("x", x);
    beep82.Utilities.checkNumber("y", y);
    beep82.Utilities.checkNumber("width", width);
    beep82.Utilities.checkNumber("height", height);
    beep82.Utilities.checkNumber("lineWidth", lineWidth);
    const oldStrokeStyle = beep82.Core.offCtx.strokeStyle;
    const oldLineWidth = beep82.Core.offCtx.lineWidth;
    beep82.Core.offCtx.strokeStyle = beep82.Core.getColorHex(beep82.Core.drawState.fgColor);
    beep82.Core.offCtx.lineWidth = lineWidth;
    beep82.Core.offCtx.strokeRect(
      Math.round(x),
      Math.round(y),
      Math.round(width),
      Math.round(height)
    );
    beep82.Core.offCtx.strokeStyle = oldStrokeStyle;
    beep82.Core.offCtx.lineWidth = oldLineWidth;
  };
  beep82.Core.fillRect = function(x, y, width, height) {
    beep82.Utilities.checkNumber("x", x);
    beep82.Utilities.checkNumber("y", y);
    beep82.Utilities.checkNumber("width", width);
    beep82.Utilities.checkNumber("height", height);
    beep82.Core.offCtx.fillStyle = beep82.Core.getColorHex(beep82.Core.drawState.fgColor);
    beep82.Core.offCtx.fillRect(
      Math.round(x) + 0.5,
      Math.round(y) + 0.5,
      Math.round(width) - 1,
      Math.round(height) - 1
    );
  };
  beep82.Core.initScreenshot = function() {
    if (beep82.Core.initialized()) {
      return;
    }
    const takeScreenshot = (e) => {
      if (e.key === "0") {
        beep82.Core.downloadScreenshot();
      }
    };
    document.addEventListener("pointerup", takeScreenshot);
    document.addEventListener("keyup", takeScreenshot);
  };
  beep82.Core.saveScreen = function() {
    return beep82.Core.offCtx.getImageData(
      0,
      0,
      beep82.Core.offCanvas.width,
      beep82.Core.offCanvas.height
    );
  };
  beep82.Core.downloadScreenshot = function() {
    const dataUrl = beep82.Core.getHighResDataURL(beep82.Core.realCanvas);
    beep82.Utilities.downloadFile("beep8-screenshot.png", dataUrl);
  };
  beep82.Core.getHighResDataURL = function(canvas, scale = 4, mimeType = "image/png", quality = 1) {
    const offscreenCanvas = new OffscreenCanvas(canvas.width * scale, canvas.height * scale);
    const offscreenCtx = offscreenCanvas.getContext("2d");
    offscreenCtx.imageSmoothingEnabled = false;
    offscreenCtx.scale(scale, scale);
    offscreenCtx.drawImage(canvas, 0, 0);
    return offscreenCanvas.toDataURL(mimeType, quality);
  };
  beep82.Core.restoreScreen = function(screenData) {
    beep82.Utilities.checkInstanceOf("screenData", screenData, ImageData);
    beep82.Core.offCtx.putImageData(screenData, 0, 0);
  };
  beep82.Core.updateLayout = function(renderNow) {
    beep82.Core.updateLayout2d();
    if (renderNow) {
      beep82.Renderer.render();
    }
  };
  beep82.Core.updateLayout2d = function() {
    beep82.Core.realCtx = beep82.Core.realCanvas.getContext(
      "2d",
      {
        alpha: false,
        desynchronized: true
      }
    );
    beep82.Core.realCtx.imageSmoothingEnabled = false;
    beep82.Core.realCtx.imageSmoothingQuality = "pixelated";
    beep82.CONFIG.SCREEN_EL_WIDTH = beep82.CONFIG.SCREEN_WIDTH;
    beep82.CONFIG.SCREEN_EL_HEIGHT = beep82.CONFIG.SCREEN_HEIGHT;
    beep82.CONFIG.SCREEN_REAL_WIDTH = beep82.CONFIG.SCREEN_WIDTH;
    beep82.CONFIG.SCREEN_REAL_HEIGHT = beep82.CONFIG.SCREEN_HEIGHT;
    beep82.Core.realCanvas.style.width = "100%";
    beep82.Core.realCanvas.style.height = "100%";
    beep82.Core.realCanvas.style.filter = "blur(0.5px)";
    beep82.Core.realCanvas.width = beep82.CONFIG.SCREEN_REAL_WIDTH;
    beep82.Core.realCanvas.height = beep82.CONFIG.SCREEN_REAL_HEIGHT;
    beep82.Core.container.style.aspectRatio = `${beep82.CONFIG.SCREEN_COLS} / ${beep82.CONFIG.SCREEN_ROWS}`;
  };
  beep82.Core.handleCrash = function(errorMessage = "Fatal error") {
    if (beep82.Core.crashed || beep82.Core.crashing) return;
    beep82.Core.crashing = true;
    beep82.Core.setColor(beep82.CONFIG.COLORS.length - 1, 0);
    beep82.Core.cls();
    beep82.Core.setCursorLocation(1, 1);
    beep82.TextRenderer.print("*** CRASH ***:\n" + errorMessage, null, beep82.CONFIG.SCREEN_COLS - 2);
    beep82.Renderer.render();
    beep82.Core.crashing = false;
    beep82.Core.crashed = true;
  };
  beep82.Core.isTouchDevice = function() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  };
  beep82.Core.isMobile = function() {
    return beep82.Core.isIOS() || beep82.Core.isAndroid() || beep82.Core.isTouchDevice();
  };
  beep82.Core.isIOS = function() {
    return /(ipad|ipod|iphone)/i.test(navigator.userAgent);
  };
  beep82.Core.isAndroid = function() {
    return /android/i.test(navigator.userAgent);
  };
  function findClosestColorUsingLookup(r, g, b, lookupTable, bucketSize = 4) {
    const roundedR = Math.floor(r / bucketSize) * bucketSize;
    const roundedG = Math.floor(g / bucketSize) * bucketSize;
    const roundedB = Math.floor(b / bucketSize) * bucketSize;
    const key = `${roundedR},${roundedG},${roundedB}`;
    return lookupTable[key];
  }
  const colorLookupTable = {};
  function generateColorLookupTable(palette, bucketSize = 4) {
    if (Object.keys(colorLookupTable).length !== 0) {
      return colorLookupTable;
    }
    const rgbPalette = palette.map((color) => beep82.Utilities.hexToRgb(color));
    for (let r = 0; r < 256; r += bucketSize) {
      for (let g = 0; g < 256; g += bucketSize) {
        for (let b = 0; b < 256; b += bucketSize) {
          const key = `${r},${g},${b}`;
          colorLookupTable[key] = findClosestColor(r, g, b, rgbPalette);
        }
      }
    }
    return colorLookupTable;
  }
  function findClosestColor(r, g, b, palette) {
    let closestColor = null;
    let closestDistance = Infinity;
    for (const color of palette) {
      const distance = Math.pow(color.r - r, 2) + Math.pow(color.g - g, 2) + Math.pow(color.b - b, 2);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestColor = color;
      }
    }
    return closestColor;
  }
})(beep8);
(function(beep82) {
  beep82.Collision = {};
  beep82.COLLISION = {};
  beep82.COLLISION.NONE = 0;
  beep82.COLLISION.N = 1;
  beep82.COLLISION.E = 2;
  beep82.COLLISION.S = 4;
  beep82.COLLISION.W = 8;
  beep82.COLLISION.NE = beep82.COLLISION.N + beep82.COLLISION.E;
  beep82.COLLISION.NS = beep82.COLLISION.N + beep82.COLLISION.S;
  beep82.COLLISION.NW = beep82.COLLISION.N + beep82.COLLISION.W;
  beep82.COLLISION.SE = beep82.COLLISION.S + beep82.COLLISION.E;
  beep82.COLLISION.SW = beep82.COLLISION.S + beep82.COLLISION.W;
  beep82.COLLISION.WE = beep82.COLLISION.W + beep82.COLLISION.E;
  beep82.COLLISION.WNE = beep82.COLLISION.W + beep82.COLLISION.N + beep82.COLLISION.E;
  beep82.COLLISION.WES = beep82.COLLISION.W + beep82.COLLISION.E + beep82.COLLISION.S;
  beep82.COLLISION.NES = beep82.COLLISION.N + beep82.COLLISION.E + beep82.COLLISION.S;
  beep82.COLLISION.ALL = beep82.COLLISION.N + beep82.COLLISION.E + beep82.COLLISION.S + beep82.COLLISION.W;
})(beep8);
(function(beep82) {
  beep82.Cart = {};
  const MAGIC_STR = "BEEP8";
  const MAGIC = new TextEncoder().encode(MAGIC_STR);
  const VERSION = 1;
  beep82.Cart.save = async function(canvas, data, filename = "cart.png") {
    beep82.Utilities.checkInstanceOf("canvas", canvas, HTMLCanvasElement);
    beep82.Utilities.checkString("data", data);
    beep82.Utilities.checkString("filename", filename);
    const pngBlob = await new Promise((res) => canvas.toBlob(res, "image/png"));
    const cartBlob = await _appendTrailer(pngBlob, data);
    saveAs(cartBlob, filename);
  };
  beep82.Cart.load = async function(pngBlobOrUrl) {
    const buffer = await (typeof pngBlobOrUrl === "string" ? (await fetch(pngBlobOrUrl)).arrayBuffer() : pngBlobOrUrl.arrayBuffer());
    const bytes = new Uint8Array(buffer);
    const offset = _findMagicFromEnd(bytes, MAGIC_STR);
    if (offset < 0) beep82.Utilities.fatal("Error Loading Cart: No BEEP8 trailer found");
    const version = bytes[offset + 5];
    if (version !== VERSION) beep82.Utilities.fatal(`Error Loading Cart: Unsupported version ${version}`);
    const payloadLength = _readU32BE(bytes, offset + 6);
    const payloadStart = offset + 10;
    const payloadEnd = payloadStart + payloadLength;
    if (payloadEnd + 4 > bytes.length) {
      beep82.Utilities.fatal("Error Loading Cart: Trailer length out of range");
    }
    const payload = bytes.subarray(payloadStart, payloadEnd);
    const expectedCrc = _readU32BE(bytes, payloadEnd);
    if (_crc32(payload) !== expectedCrc) {
      beep82.Utilities.fatal("Error Loading Cart: Bad payload CRC");
    }
    return JSON.parse(new TextDecoder().decode(payload));
  };
  async function _appendTrailer(pngBlob, dataObj) {
    const payload = new TextEncoder().encode(JSON.stringify(dataObj));
    const headerSize = MAGIC.length + 1 + 4 + payload.length + 4;
    const header = new Uint8Array(headerSize);
    let offset = 0;
    header.set(MAGIC, offset);
    offset += MAGIC.length;
    header[offset++] = VERSION;
    _writeU32BE(header, offset, payload.length);
    offset += 4;
    header.set(payload, offset);
    offset += payload.length;
    _writeU32BE(header, offset, _crc32(payload));
    offset += 4;
    const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
    return new Blob([pngBytes, header], { type: "image/png" });
  }
  function _findMagicFromEnd(bytes, magicStr) {
    const magic = new TextEncoder().encode(magicStr);
    for (let i = bytes.length - magic.length; i >= 0; i--) {
      let found = true;
      for (let j = 0; j < magic.length; j++) {
        if (bytes[i + j] !== magic[j]) {
          found = false;
          break;
        }
      }
      if (found) return i;
    }
    return -1;
  }
  function _readU32BE(byteArray, offset) {
    const byte1 = byteArray[offset];
    const byte2 = byteArray[offset + 1];
    const byte3 = byteArray[offset + 2];
    const byte4 = byteArray[offset + 3];
    return (byte1 << 24 | byte2 << 16 | byte3 << 8 | byte4) >>> 0;
  }
  function _writeU32BE(byteArray, offset, value) {
    byteArray[offset] = value >>> 24 & 255;
    byteArray[offset + 1] = value >>> 16 & 255;
    byteArray[offset + 2] = value >>> 8 & 255;
    byteArray[offset + 3] = value & 255;
  }
  function _crc32(byteArray) {
    let crc = ~0 >>> 0;
    for (let i = 0; i < byteArray.length; i++) {
      crc ^= byteArray[i];
      for (let bit = 0; bit < 8; bit++) {
        if (crc & 1) {
          crc = crc >>> 1 ^ 3988292384;
        } else {
          crc >>>= 1;
        }
      }
    }
    return ~crc >>> 0;
  }
})(beep8);
(function(beep82) {
  beep82.Actors = {};
  beep82.Actors.animations = {
    "idle": {
      frames: [0],
      fps: 1
    },
    "idle-right": {
      frames: [1],
      fps: 1
    },
    "idle-left": {
      frames: [-1],
      fps: 1
    },
    "idle-up": {
      frames: [4],
      fps: 1
    },
    "move-right": {
      frames: [1, 2],
      fps: 4,
      loop: true
    },
    "move-left": {
      frames: [-1, -2],
      fps: 4,
      loop: true
    },
    "move-up": {
      frames: [5, -5],
      fps: 4,
      loop: true
    },
    "move-down": {
      frames: [3, -3],
      fps: 4,
      loop: true
    },
    "jump-right": {
      frames: [5],
      fps: 1,
      loop: false
    },
    "jump-left": {
      frames: [-5],
      fps: 1,
      loop: false
    },
    "spin-left": {
      frames: [0, 1, 4, -1],
      fps: 4,
      loop: true
    },
    "spin-right": {
      frames: [0, -1, 4, 1],
      fps: 4,
      loop: true
    }
  };
  const drawActor = function(ch, animation, x, y, direction) {
    const font = beep82.TextRenderer.curActors_;
    const chrIndex = ch * font.getColCount() + Math.abs(animationFrame(animation));
    beep82.TextRenderer.spr(
      chrIndex,
      x,
      y,
      font,
      direction || 0
    );
  };
  beep82.Actors.draw = function(ch, animation) {
    beep82.Utilities.checkInt("ch", ch);
    beep82.Utilities.checkString("animation", animation);
    const frame = animationFrame(animation);
    const direction = frame >= 0 ? 0 : 1;
    drawActor(
      ch,
      animation,
      beep82.Core.drawState.cursorCol * beep82.CONFIG.CHR_WIDTH,
      beep82.Core.drawState.cursorRow * beep82.CONFIG.CHR_HEIGHT,
      direction || 0
    );
  };
  beep82.Actors.spr = function(ch, animation, x, y, startTime = null) {
    beep82.Utilities.checkInt("ch", ch);
    beep82.Utilities.checkString("animation", animation);
    beep82.Utilities.checkNumber("x", x);
    beep82.Utilities.checkNumber("y", y);
    if (startTime !== null) beep82.Utilities.checkNumber("startTime", startTime);
    const frame = animationFrame(animation, startTime);
    const anim = beep82.Actors.animations[animation];
    const direction = frame >= 0 ? 0 : 1;
    if (!shouldLoopAnimation(anim, startTime)) {
      return false;
    }
    drawActor(ch, animation, x, y, direction || 0);
    return true;
  };
  const animationFrame = function(animation, startTime = null) {
    if (beep82.Actors.animations[animation] === void 0) {
      beep82.Utilities.fatal("Invalid animation: " + animation);
    }
    if (startTime === null) {
      startTime = beep82.Core.startTime;
    }
    const anim = beep82.Actors.animations[animation];
    let frame = 0;
    if (anim.frames.length === 1) {
      frame = anim.frames[0];
    }
    if (anim.frames.length > 1) {
      const totalTime = beep82.Core.getNow() - startTime;
      const frameCount = anim.frames.length;
      const frameDuration = 1 / anim.fps;
      const frameIndex = Math.floor(totalTime / 1e3 / frameDuration % frameCount);
      frame = anim.frames[frameIndex];
    }
    return frame;
  };
  const shouldLoopAnimation = function(anim, startTime) {
    if (startTime === null || anim.loop === true) {
      return true;
    }
    const animationLength = anim.frames.length * (1e3 / anim.fps);
    if (beep82.Core.getNow() - startTime >= animationLength) {
      return false;
    }
    return true;
  };
})(beep8);
"use strict";
const zzfx = (...z) => zzfxP(zzfxG(...z));
const zzfxV = 0.3;
const zzfxR = 44100;
const zzfxX = new AudioContext();
const zzfxP = (...samples) => {
  let buffer = zzfxX.createBuffer(samples.length, samples[0].length, zzfxR), source = zzfxX.createBufferSource();
  samples.map((d, i) => buffer.getChannelData(i).set(d));
  source.buffer = buffer;
  source.connect(zzfxX.destination);
  source.start();
  return source;
};
const zzfxG = (
  // generate samples
  (volume = 1, randomness = 0.05, frequency = 220, attack = 0, sustain = 0, release = 0.1, shape = 0, shapeCurve = 1, slide = 0, deltaSlide = 0, pitchJump = 0, pitchJumpTime = 0, repeatTime = 0, noise = 0, modulation = 0, bitCrush = 0, delay = 0, sustainVolume = 1, decay = 0, tremolo = 0, filter = 0) => {
    let PI2 = Math.PI * 2, sign = (v) => v < 0 ? -1 : 1, startSlide = slide *= 500 * PI2 / zzfxR / zzfxR, startFrequency = frequency *= (1 + randomness * 2 * Math.random() - randomness) * PI2 / zzfxR, b = [], t = 0, tm = 0, i = 0, j = 1, r = 0, c2 = 0, s = 0, f, length, quality = 2, w = PI2 * Math.abs(filter) * 2 / zzfxR, cos = Math.cos(w), alpha = Math.sin(w) / 2 / quality, a0 = 1 + alpha, a1 = -2 * cos / a0, a2 = (1 - alpha) / a0, b0 = (1 + sign(filter) * cos) / 2 / a0, b1 = -(sign(filter) + cos) / a0, b2 = b0, x2 = 0, x1 = 0, y2 = 0, y1 = 0;
    attack = attack * zzfxR + 9;
    decay *= zzfxR;
    sustain *= zzfxR;
    release *= zzfxR;
    delay *= zzfxR;
    deltaSlide *= 500 * PI2 / zzfxR ** 3;
    modulation *= PI2 / zzfxR;
    pitchJump *= PI2 / zzfxR;
    pitchJumpTime *= zzfxR;
    repeatTime = repeatTime * zzfxR | 0;
    volume *= zzfxV;
    for (length = attack + decay + sustain + release + delay | 0; i < length; b[i++] = s * volume) {
      if (!(++c2 % (bitCrush * 100 | 0))) {
        s = shape ? shape > 1 ? shape > 2 ? shape > 3 ? (
          // wave shape
          Math.sin(t ** 3)
        ) : (
          // 4 noise
          Math.max(Math.min(Math.tan(t), 1), -1)
        ) : (
          // 3 tan
          1 - (2 * t / PI2 % 2 + 2) % 2
        ) : (
          // 2 saw
          1 - 4 * Math.abs(Math.round(t / PI2) - t / PI2)
        ) : (
          // 1 triangle
          Math.sin(t)
        );
        s = (repeatTime ? 1 - tremolo + tremolo * Math.sin(PI2 * i / repeatTime) : 1) * sign(s) * Math.abs(s) ** shapeCurve * // curve
        (i < attack ? i / attack : (
          // attack
          i < attack + decay ? (
            // decay
            1 - (i - attack) / decay * (1 - sustainVolume)
          ) : (
            // decay falloff
            i < attack + decay + sustain ? (
              // sustain
              sustainVolume
            ) : (
              // sustain volume
              i < length - delay ? (
                // release
                (length - i - delay) / release * // release falloff
                sustainVolume
              ) : (
                // release volume
                0
              )
            )
          )
        ));
        s = delay ? s / 2 + (delay > i ? 0 : (
          // delay
          (i < length - delay ? 1 : (length - i) / delay) * // release delay
          b[i - delay | 0] / 2 / volume
        )) : s;
        if (filter)
          s = y1 = b2 * x2 + b1 * (x2 = x1) + b0 * (x1 = s) - a2 * y2 - a1 * (y2 = y1);
      }
      f = (frequency += slide += deltaSlide) * // frequency
      Math.cos(modulation * tm++);
      t += f + f * noise * Math.sin(i ** 5);
      if (j && ++j > pitchJumpTime) {
        frequency += pitchJump;
        startFrequency += pitchJump;
        j = 0;
      }
      if (repeatTime && !(++r % repeatTime)) {
        frequency = startFrequency;
        slide = startSlide;
        j = j || 1;
      }
    }
    return b;
  }
);
(function() {
  const audioCtx = new AudioContext();
  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 1;
  masterGain.connect(audioCtx.destination);
  let noteBuffers = {};
  let schedulerInterval = null;
  let schedules = [];
  let schedulePointers = [];
  let playbackStartTime = 0;
  let tempo = 125;
  const lookaheadTime = 0.5;
  const schedulerIntervalMs = 50;
  const volumeMultiplier = 0.1;
  let unlocked = false;
  const sineComponent = (x, offset) => Math.sin(x * 6.28 + offset);
  const pianoWaveform = (x) => {
    return sineComponent(x, Math.pow(sineComponent(x, 0), 2) + sineComponent(x, 0.25) * 0.75 + sineComponent(x, 0.5) * 0.1) * volumeMultiplier;
  };
  const piano2WaveForm = (x) => {
    return Math.sin(x * 6.28) * Math.sin(x * 3.14) * volumeMultiplier;
  };
  const sineWaveform = (x) => {
    return Math.sin(2 * Math.PI * x) * volumeMultiplier;
  };
  const squareWaveform = (x) => {
    return (Math.sin(2 * Math.PI * x) >= 0 ? 1 : -1) * volumeMultiplier;
  };
  const sawtoothWaveform = (x) => {
    let t = x - Math.floor(x);
    return (2 * t - 1) * volumeMultiplier;
  };
  const triangleWaveform = (x) => {
    let t = x - Math.floor(x);
    return (2 * Math.abs(2 * t - 1) - 1) * volumeMultiplier;
  };
  const drumWaveform = (x) => {
    return (Math.random() * 2 - 1) * Math.exp(-x / 10) * volumeMultiplier;
  };
  const softDrumWaveform = (x) => {
    return (Math.sin(x * 2) + 0.3 * (Math.random() - 0.5)) * Math.exp(-x / 15) * volumeMultiplier * 2;
  };
  const instrumentMapping = [
    pianoWaveform,
    piano2WaveForm,
    sineWaveform,
    sawtoothWaveform,
    squareWaveform,
    triangleWaveform,
    drumWaveform,
    softDrumWaveform
  ];
  function p12(params) {
    if (Array.isArray(params)) {
      params = params[0];
    }
    if (!params || params.trim() === "") {
      p12.stop();
      return;
    }
    if (noteBuffers.length > 200) {
      console.warn("Beep8.Music: Note buffers exceeded limit, clearing old buffers.");
      noteBuffers = {};
    }
    tempo = 125;
    let baseNoteDuration = 0.5;
    schedules = [];
    const rawLines = params.split("\n").map((line) => line.trim());
    let noteInterval = tempo / 1e3;
    const trackLineRegex = /^([0-9])\|(.*)\|$/;
    rawLines.forEach((line) => {
      if (!line) return;
      if (line.startsWith("[") && line.endsWith("]") || /^\d+(\.\d+)?$/.test(line)) {
        const timing = line.replace(/[\[\]]/g, "").split(".");
        tempo = parseFloat(timing[0]) || tempo;
        baseNoteDuration = (parseFloat(timing[1]) || 50) / 100;
        noteInterval = tempo / 1e3;
        return;
      }
      if (!trackLineRegex.test(line)) {
        console.error("Track lines must be in the format 'instrument|track data|': " + line);
        return;
      }
      const match = line.match(trackLineRegex);
      const instrumentId = parseInt(match[1], 10);
      const instrumentFn = instrumentMapping[instrumentId] || instrumentMapping[0];
      const trackData = match[2].trim();
      let events = [];
      for (let i = 0; i < trackData.length; i++) {
        const char = trackData[i];
        let dashCount = 1;
        while (i + dashCount < trackData.length && trackData[i + dashCount] === "-") {
          dashCount++;
        }
        let eventTime = i * noteInterval;
        if (char === " ") {
          events.push({ startTime: eventTime, noteBuffer: null });
          i += dashCount - 1;
          continue;
        }
        let noteValue = char.charCodeAt(0);
        noteValue -= noteValue > 90 ? 71 : 65;
        let noteDuration = dashCount * baseNoteDuration * (tempo / 125);
        let noteBuffer = createNoteBuffer(noteValue, noteDuration, 44100, instrumentFn);
        events.push({ startTime: eventTime, noteBuffer });
        i += dashCount - 1;
      }
      schedules.push(events);
    });
    schedulePointers = schedules.map(() => 0);
    playbackStartTime = audioCtx.currentTime + 0.1;
    p12.stop();
    schedulerInterval = setInterval(schedulerFunction, schedulerIntervalMs);
  }
  function schedulerFunction() {
    const currentTime = audioCtx.currentTime;
    const noteInterval = tempo / 1e3;
    const effectiveLookahead = Math.max(lookaheadTime, noteInterval);
    schedules.forEach((events, trackIndex) => {
      let pointer = schedulePointers[trackIndex];
      const trackLength = events.length;
      if (trackLength === 0) return;
      const step = pointer % trackLength;
      const loopCount = Math.floor(pointer / trackLength);
      const eventTime = playbackStartTime + step * noteInterval + loopCount * trackLength * noteInterval;
      if (eventTime < currentTime + effectiveLookahead) {
        const event = events[step];
        if (event.noteBuffer) {
          playNoteBuffer(event.noteBuffer, audioCtx, eventTime);
        }
        schedulePointers[trackIndex]++;
      }
    });
    if (!p12.loop) {
      const done = schedules.every((events, i) => schedulePointers[i] >= events.length);
      if (done) {
        p12.stop();
      }
    }
  }
  p12.stop = function() {
    if (schedulerInterval !== null) {
      clearInterval(schedulerInterval);
      schedulerInterval = null;
    }
    playingSources.forEach((source) => source.stop());
    playingSources = [];
  };
  p12.isPlaying = function() {
    return schedulerInterval !== null;
  };
  p12.setTempo = function(newTempo) {
    if (newTempo < 50) newTempo = 50;
    const oldNoteInterval = tempo / 1e3;
    const newNoteInterval = newTempo / 1e3;
    const elapsed = audioCtx.currentTime - playbackStartTime;
    const currentIndex = elapsed / oldNoteInterval;
    playbackStartTime = audioCtx.currentTime - currentIndex * newNoteInterval;
    tempo = newTempo;
  };
  p12.setVolume = function(value) {
    masterGain.gain.value = Math.min(1, Math.max(0, value));
  };
  p12.clearCache = function() {
    noteBuffers = {};
  };
  p12.loop = true;
  const createNoteBuffer = (note, durationSeconds, sampleRate, instrumentFn) => {
    const key = note + "-" + durationSeconds + "-" + instrumentFn.name;
    let buffer = noteBuffers[key];
    if (note >= 0 && !buffer) {
      const frequencyFactor = 65.406 * Math.pow(1.06, note) / sampleRate;
      const totalSamples = Math.floor(sampleRate * durationSeconds);
      const attackSamples = 88;
      const decaySamples = sampleRate * (durationSeconds - 2e-3);
      buffer = noteBuffers[key] = audioCtx.createBuffer(1, totalSamples, sampleRate);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < totalSamples; i++) {
        let amplitude;
        if (i < attackSamples) {
          amplitude = i / (attackSamples + 0.2);
        } else {
          amplitude = Math.pow(
            1 - (i - attackSamples) / decaySamples,
            Math.pow(Math.log(1e4 * frequencyFactor) / 2, 2)
          );
        }
        channelData[i] = amplitude * instrumentFn(i * frequencyFactor);
      }
      if (!unlocked) {
        playNoteBuffer(buffer, audioCtx, audioCtx.currentTime, true);
        unlocked = true;
      }
    }
    return buffer;
  };
  let playingSources = [];
  const playNoteBuffer = (buffer, context, when, stopImmediately = false) => {
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(masterGain);
    source.start(when);
    playingSources.push(source);
    if (stopImmediately) {
      source.stop();
    }
    source.onended = () => {
      const index = playingSources.indexOf(source);
      if (index !== -1) {
        playingSources.splice(index, 1);
      }
    };
  };
  window.p1 = p12;
})();
(function(global, undefined2) {
  "use strict";
  var POW_2_24 = Math.pow(2, -24), POW_2_32 = Math.pow(2, 32), POW_2_53 = Math.pow(2, 53);
  function encode(value) {
    var data = new ArrayBuffer(256);
    var dataView = new DataView(data);
    var lastLength;
    var offset = 0;
    function ensureSpace(length) {
      var newByteLength = data.byteLength;
      var requiredLength = offset + length;
      while (newByteLength < requiredLength)
        newByteLength *= 2;
      if (newByteLength !== data.byteLength) {
        var oldDataView = dataView;
        data = new ArrayBuffer(newByteLength);
        dataView = new DataView(data);
        var uint32count = offset + 3 >> 2;
        for (var i2 = 0; i2 < uint32count; ++i2)
          dataView.setUint32(i2 * 4, oldDataView.getUint32(i2 * 4));
      }
      lastLength = length;
      return dataView;
    }
    function write() {
      offset += lastLength;
    }
    function writeFloat64(value2) {
      write(ensureSpace(8).setFloat64(offset, value2));
    }
    function writeUint8(value2) {
      write(ensureSpace(1).setUint8(offset, value2));
    }
    function writeUint8Array(value2) {
      var dataView2 = ensureSpace(value2.length);
      for (var i2 = 0; i2 < value2.length; ++i2)
        dataView2.setUint8(offset + i2, value2[i2]);
      write();
    }
    function writeUint16(value2) {
      write(ensureSpace(2).setUint16(offset, value2));
    }
    function writeUint32(value2) {
      write(ensureSpace(4).setUint32(offset, value2));
    }
    function writeUint64(value2) {
      var low = value2 % POW_2_32;
      var high = (value2 - low) / POW_2_32;
      var dataView2 = ensureSpace(8);
      dataView2.setUint32(offset, high);
      dataView2.setUint32(offset + 4, low);
      write();
    }
    function writeTypeAndLength(type, length) {
      if (length < 24) {
        writeUint8(type << 5 | length);
      } else if (length < 256) {
        writeUint8(type << 5 | 24);
        writeUint8(length);
      } else if (length < 65536) {
        writeUint8(type << 5 | 25);
        writeUint16(length);
      } else if (length < 4294967296) {
        writeUint8(type << 5 | 26);
        writeUint32(length);
      } else {
        writeUint8(type << 5 | 27);
        writeUint64(length);
      }
    }
    function encodeItem(value2) {
      var i2;
      if (value2 === false)
        return writeUint8(244);
      if (value2 === true)
        return writeUint8(245);
      if (value2 === null)
        return writeUint8(246);
      if (value2 === undefined2)
        return writeUint8(247);
      switch (typeof value2) {
        case "number":
          if (Math.floor(value2) === value2) {
            if (0 <= value2 && value2 <= POW_2_53)
              return writeTypeAndLength(0, value2);
            if (-POW_2_53 <= value2 && value2 < 0)
              return writeTypeAndLength(1, -(value2 + 1));
          }
          writeUint8(251);
          return writeFloat64(value2);
        case "string":
          var utf8data = [];
          for (i2 = 0; i2 < value2.length; ++i2) {
            var charCode = value2.charCodeAt(i2);
            if (charCode < 128) {
              utf8data.push(charCode);
            } else if (charCode < 2048) {
              utf8data.push(192 | charCode >> 6);
              utf8data.push(128 | charCode & 63);
            } else if (charCode < 55296) {
              utf8data.push(224 | charCode >> 12);
              utf8data.push(128 | charCode >> 6 & 63);
              utf8data.push(128 | charCode & 63);
            } else {
              charCode = (charCode & 1023) << 10;
              charCode |= value2.charCodeAt(++i2) & 1023;
              charCode += 65536;
              utf8data.push(240 | charCode >> 18);
              utf8data.push(128 | charCode >> 12 & 63);
              utf8data.push(128 | charCode >> 6 & 63);
              utf8data.push(128 | charCode & 63);
            }
          }
          writeTypeAndLength(3, utf8data.length);
          return writeUint8Array(utf8data);
        default:
          var length;
          if (Array.isArray(value2)) {
            length = value2.length;
            writeTypeAndLength(4, length);
            for (i2 = 0; i2 < length; ++i2)
              encodeItem(value2[i2]);
          } else if (value2 instanceof Uint8Array) {
            writeTypeAndLength(2, value2.length);
            writeUint8Array(value2);
          } else {
            var keys = Object.keys(value2);
            length = keys.length;
            writeTypeAndLength(5, length);
            for (i2 = 0; i2 < length; ++i2) {
              var key = keys[i2];
              encodeItem(key);
              encodeItem(value2[key]);
            }
          }
      }
    }
    encodeItem(value);
    if ("slice" in data)
      return data.slice(0, offset);
    var ret = new ArrayBuffer(offset);
    var retView = new DataView(ret);
    for (var i = 0; i < offset; ++i)
      retView.setUint8(i, dataView.getUint8(i));
    return ret;
  }
  function decode(data, tagger, simpleValue) {
    var dataView = new DataView(data);
    var offset = 0;
    if (typeof tagger !== "function")
      tagger = function(value) {
        return value;
      };
    if (typeof simpleValue !== "function")
      simpleValue = function() {
        return undefined2;
      };
    function read(value, length) {
      offset += length;
      return value;
    }
    function readArrayBuffer(length) {
      return read(new Uint8Array(data, offset, length), length);
    }
    function readFloat16() {
      var tempArrayBuffer = new ArrayBuffer(4);
      var tempDataView = new DataView(tempArrayBuffer);
      var value = readUint16();
      var sign = value & 32768;
      var exponent = value & 31744;
      var fraction = value & 1023;
      if (exponent === 31744)
        exponent = 255 << 10;
      else if (exponent !== 0)
        exponent += 127 - 15 << 10;
      else if (fraction !== 0)
        return fraction * POW_2_24;
      tempDataView.setUint32(0, sign << 16 | exponent << 13 | fraction << 13);
      return tempDataView.getFloat32(0);
    }
    function readFloat32() {
      return read(dataView.getFloat32(offset), 4);
    }
    function readFloat64() {
      return read(dataView.getFloat64(offset), 8);
    }
    function readUint8() {
      return read(dataView.getUint8(offset), 1);
    }
    function readUint16() {
      return read(dataView.getUint16(offset), 2);
    }
    function readUint32() {
      return read(dataView.getUint32(offset), 4);
    }
    function readUint64() {
      return readUint32() * POW_2_32 + readUint32();
    }
    function readBreak() {
      if (dataView.getUint8(offset) !== 255)
        return false;
      offset += 1;
      return true;
    }
    function readLength(additionalInformation) {
      if (additionalInformation < 24)
        return additionalInformation;
      if (additionalInformation === 24)
        return readUint8();
      if (additionalInformation === 25)
        return readUint16();
      if (additionalInformation === 26)
        return readUint32();
      if (additionalInformation === 27)
        return readUint64();
      if (additionalInformation === 31)
        return -1;
      throw "Invalid length encoding";
    }
    function readIndefiniteStringLength(majorType) {
      var initialByte = readUint8();
      if (initialByte === 255)
        return -1;
      var length = readLength(initialByte & 31);
      if (length < 0 || initialByte >> 5 !== majorType)
        throw "Invalid indefinite length element";
      return length;
    }
    function appendUtf16data(utf16data, length) {
      for (var i = 0; i < length; ++i) {
        var value = readUint8();
        if (value & 128) {
          if (value < 224) {
            value = (value & 31) << 6 | readUint8() & 63;
            length -= 1;
          } else if (value < 240) {
            value = (value & 15) << 12 | (readUint8() & 63) << 6 | readUint8() & 63;
            length -= 2;
          } else {
            value = (value & 15) << 18 | (readUint8() & 63) << 12 | (readUint8() & 63) << 6 | readUint8() & 63;
            length -= 3;
          }
        }
        if (value < 65536) {
          utf16data.push(value);
        } else {
          value -= 65536;
          utf16data.push(55296 | value >> 10);
          utf16data.push(56320 | value & 1023);
        }
      }
    }
    function decodeItem() {
      var initialByte = readUint8();
      var majorType = initialByte >> 5;
      var additionalInformation = initialByte & 31;
      var i;
      var length;
      if (majorType === 7) {
        switch (additionalInformation) {
          case 25:
            return readFloat16();
          case 26:
            return readFloat32();
          case 27:
            return readFloat64();
        }
      }
      length = readLength(additionalInformation);
      if (length < 0 && (majorType < 2 || 6 < majorType))
        throw "Invalid length";
      switch (majorType) {
        case 0:
          return length;
        case 1:
          return -1 - length;
        case 2:
          if (length < 0) {
            var elements = [];
            var fullArrayLength = 0;
            while ((length = readIndefiniteStringLength(majorType)) >= 0) {
              fullArrayLength += length;
              elements.push(readArrayBuffer(length));
            }
            var fullArray = new Uint8Array(fullArrayLength);
            var fullArrayOffset = 0;
            for (i = 0; i < elements.length; ++i) {
              fullArray.set(elements[i], fullArrayOffset);
              fullArrayOffset += elements[i].length;
            }
            return fullArray;
          }
          return readArrayBuffer(length);
        case 3:
          var utf16data = [];
          if (length < 0) {
            while ((length = readIndefiniteStringLength(majorType)) >= 0)
              appendUtf16data(utf16data, length);
          } else
            appendUtf16data(utf16data, length);
          return String.fromCharCode.apply(null, utf16data);
        case 4:
          var retArray;
          if (length < 0) {
            retArray = [];
            while (!readBreak())
              retArray.push(decodeItem());
          } else {
            retArray = new Array(length);
            for (i = 0; i < length; ++i)
              retArray[i] = decodeItem();
          }
          return retArray;
        case 5:
          var retObject = {};
          for (i = 0; i < length || length < 0 && !readBreak(); ++i) {
            var key = decodeItem();
            retObject[key] = decodeItem();
          }
          return retObject;
        case 6:
          return tagger(decodeItem(), length);
        case 7:
          switch (length) {
            case 20:
              return false;
            case 21:
              return true;
            case 22:
              return null;
            case 23:
              return undefined2;
            default:
              return simpleValue(length);
          }
      }
    }
    var ret = decodeItem();
    if (offset !== data.byteLength)
      throw "Remaining bytes";
    return ret;
  }
  var obj = { encode, decode };
  if (typeof define === "function" && define.amd)
    define("cbor/cbor", obj);
  else if (!global.CBOR)
    global.CBOR = obj;
})(this);
//# sourceMappingURL=beep8.js.map
