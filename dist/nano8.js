(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CONFIG = void 0;
var CONFIG = exports.CONFIG = {
  // Enable debug?
  DEBUG: true,
  // Canvas settings
  CANVAS_SETTINGS: {
    // The ID to assign to the nano8 canvas.
    CANVAS_ID: "nano8-canvas",
    // If set, these CSS classes will be added to the nano8 canvas.
    // This is an array of strings, each of which is a class name (without the "."),
    // for example: [ "foo", "bar", "qux" ]
    CANVAS_CLASSES: [],
    // If this is true, then we will automatically position the canvas using absolute positioning
    // to ensure it's centered on the viewport and it's the right size.
    // If this is false, then you are responsible for positioning the canvas to your liking.
    AUTO_POSITION: true,
    // If this is true, we will resize the canvas automatically to match the screen. If false,
    // you're responsible for sizing the canvas to your liking.
    // NOTE: If you are using 2D mode (THREE_SETTINGS is null) and have AUTO_SIZE set to false,
    // you probably want to specify a fixed scale in SCREEN_SCALE rather than "auto", so you
    // have control over how large the canvas will be.
    AUTO_SIZE: true,
    // If this is not null, then this is the element under which to create the rendering canvas.
    // This can be the ID of an HTML element, or an HTMLElement reference.
    CONTAINER: null
  },
  // Background color to fill the space not used by the screen.
  // For best results this should be the same as the page's background.
  BG_COLOR: "#000",
  // Characters file
  CHR_FILE: "assets/chr.png",
  // Character size. The characters file's width must be
  // 16 * CHR_WIDTH and the height must be 16 * CHR_HEIGHT.
  CHR_WIDTH: 8,
  CHR_HEIGHT: 8,
  // Screen width and height in characters.
  SCREEN_ROWS: 24,
  SCREEN_COLS: 32,
  // Pixel scale (magnification). Can be "auto" or an int >= 1.
  // If this is "auto", we'll automatically compute this to be the maximum possible size
  // for the current screen size.
  // NOTE: This setting is only used for 2D style (if THREE_SETTINGS is null).
  SCREEN_SCALE: "auto",
  // Maximum fraction of the screen to occupy with the canvas.
  // NOTE: This setting is only used for 2D style (if THREE_SETTINGS is null).
  MAX_SCREEN_FRACTION: 0.95,
  // If set, this is the opacity of the "scan lines" effect.
  // If 0 or not set, don't show scan lines.
  SCAN_LINES_OPACITY: 0.1,
  // Color palette. This can be as many colors as you want, but each color requires us to
  // store a scaled copy of the characters image in memory, so more colors = more memory.
  // You can redefine the colors at runtime with nano8.redefineColors.
  COLORS: ["#000", "#00A", "#A00", "#A0A", "#0A0", "#0AA", "#AA0", "#DDD", "#666", "#00F", "#F00", "#F0F", "#0F0", "#0FF", "#FF0", "#FFF"],
  // If this is not null, then we will display a virtual joystick if the user
  // is on a mobile device.
  TOUCH_VJOY: true,
  // Cursor config:
  CURSOR: {
    // Cursor width, as a fraction of the character width (0 to 1)
    WIDTH_F: 0.8,
    // Cursor height, as a fraction of the character height (0 to 1)
    HEIGHT_F: 0.8,
    // Blink interval in millis.
    BLINK_INTERVAL: 400,
    // Cursor offset (as fraction of, respectively, char width and height). Tweak these if
    // you want to adjust the positioning of the cursor.
    OFFSET_V: 0.1,
    OFFSET_H: 0
  },
  // If set, then special escape sequences can be used when printing (to set colors, etc).
  // These are the sequences that starts and end an escape sequence. See the documentation for
  // nano8.print() for more info on escape sequences.
  // If you don't want this, comment out these line, or set them to null.
  PRINT_ESCAPE_START: "{{",
  PRINT_ESCAPE_END: "}}"
};

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CursorRenderer = void 0;
var main = _interopRequireWildcard(require("./main.js"));
var _config = require("../config.js");
var qut = _interopRequireWildcard(require("../qut.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var CursorRenderer = exports.CursorRenderer = /*#__PURE__*/function () {
  function CursorRenderer() {
    _classCallCheck(this, CursorRenderer);
    this.blinkCycle_ = 0;
    this.toggleBlinkHandle_ = null;
  }

  /**
   * Sets the visibility of the cursor.
   *
   * @param {boolean} visible - Whether the cursor should be visible
   * @throws {TypeError} If visible is not a boolean
   * @returns {void}
   */
  return _createClass(CursorRenderer, [{
    key: "setCursorVisible",
    value: function setCursorVisible(visible) {
      var _this = this;
      qut.checkBoolean("visible", visible);

      // If the cursor is already in the desired state, do nothing.
      if (main.drawState.cursorVisible === visible) return;
      main.drawState.cursorVisible = visible;
      this.blinkCycle_ = 0;
      main.render();
      if (this.toggleBlinkHandle_ !== null) {
        clearInterval(this.toggleBlinkHandle_);
        this.toggleBlinkHandle_ = null;
      }
      if (visible) {
        this.toggleBlinkHandle_ = setInterval(function () {
          return _this.advanceBlink_();
        }, _config.CONFIG.CURSOR.BLINK_INTERVAL);
      }
    }

    /**
     * Advances the cursor blink cycle.
     *
     * @private
     */
  }, {
    key: "advanceBlink_",
    value: function advanceBlink_() {
      this.blinkCycle_ = (this.blinkCycle_ + 1) % 2;
      main.render();
    }

    /**
     * Draws the cursor.
     *
     * @param {CanvasRenderingContext2D} targetCtx - The context to draw the cursor on
     * @param {number} canvasWidth - The width of the canvas
     * @param {number} canvasHeight - The height of the canvas
     * @throws {TypeError} If targetCtx is not a CanvasRenderingContext2D
     * @throws {TypeError} If canvasWidth is not a number
     * @throws {TypeError} If canvasHeight is not a number
     * @returns {void}
     */
  }, {
    key: "drawCursor",
    value: function drawCursor(targetCtx, canvasWidth, canvasHeight) {
      qut.checkInstanceOf("targetCtx", targetCtx, CanvasRenderingContext2D);
      qut.checkNumber("canvasWidth", canvasWidth);
      qut.checkNumber("canvasHeight", canvasHeight);

      // If the cursor is not visible or it is not time to blink, do nothing.
      if (!main.drawState.cursorVisible || this.blinkCycle_ <= 0) return;
      var ratio = canvasWidth / main.canvas.width;

      // Calculate the real position of the cursor.
      var realX = Math.round((main.drawState.cursorCol + 0.5 - _config.CONFIG.CURSOR.WIDTH_F / 2 + _config.CONFIG.CURSOR.OFFSET_H) * _config.CONFIG.CHR_WIDTH * ratio);
      var realY = Math.round((main.drawState.cursorRow + 1 - _config.CONFIG.CURSOR.HEIGHT_F - _config.CONFIG.CURSOR.OFFSET_V) * _config.CONFIG.CHR_HEIGHT * ratio);

      // Draw the cursor.
      targetCtx.fillStyle = main.getColorHex(main.drawState.fgColor);
      targetCtx.fillRect(realX, realY, Math.round(_config.CONFIG.CURSOR.WIDTH_F * _config.CONFIG.CHR_WIDTH * ratio), Math.round(_config.CONFIG.CURSOR.HEIGHT_F * _config.CONFIG.CHR_HEIGHT * ratio));
    }
  }]);
}();

},{"../config.js":1,"../qut.js":11,"./main.js":4}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InputSys = void 0;
var main = _interopRequireWildcard(require("./main.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var InputSys = exports.InputSys = /*#__PURE__*/function () {
  function InputSys() {
    var _this = this;
    _classCallCheck(this, InputSys);
    // Keys currently held down (array of strings).
    this.keysHeld_ = new Set();
    // Keys that were just pressed on this frame.
    this.keysJustPressed_ = new Set();
    window.addEventListener("keydown", function (e) {
      return _this.onKeyDown(e);
    });
    window.addEventListener("keyup", function (e) {
      return _this.onKeyUp(e);
    });
  }

  /**
   * Returns whether a key is currently held down.
   *
   * @param {string} keyName - The name of the key to check
   * @returns {boolean} Whether the key is currently held down
   */
  return _createClass(InputSys, [{
    key: "keyHeld",
    value: function keyHeld(keyName) {
      return this.keysHeld_.has(keyName.toUpperCase());
    }

    /**
     * Returns whether a key was just pressed on this frame.
     *
     * @param {string} keyName - The name of the key to check
     * @returns {boolean} Whether the key was just pressed
     */
  }, {
    key: "keyJustPressed",
    value: function keyJustPressed(keyName) {
      return this.keysJustPressed_.has(keyName.toUpperCase());
    }

    /**
     * Called at the end of each frame to clear the list of keys that were just pressed.
     * @returns {void}
     */
  }, {
    key: "onEndFrame",
    value: function onEndFrame() {
      this.keysJustPressed_.clear();
    }

    /**
     * Handles a keydown event.
     *
     * @param {KeyboardEvent} e - The event object
     * @returns {void}
     */
  }, {
    key: "onKeyDown",
    value: function onKeyDown(e) {
      this.keysJustPressed_.add(e.key.toUpperCase());
      this.keysHeld_.add(e.key.toUpperCase());
      if (main.hasPendingAsync("nano8a.key")) {
        main.resolveAsync("nano8a.key", e.key);
      }
    }

    /**
     * Handles a keyup event.
     *
     * @param {KeyboardEvent} e - The event object
     * @returns {void}
     */
  }, {
    key: "onKeyUp",
    value: function onKeyUp(e) {
      this.keysHeld_["delete"](e.key.toUpperCase());
    }

    /**
     * Reads a key asynchronously.
     *
     * @returns {Promise<string>} A promise that resolves to the key that was pressed
     */
  }, {
    key: "readKeyAsync",
    value: function readKeyAsync() {
      return new Promise(function (resolve, reject) {
        main.startAsync("nano8a.key", resolve, reject);
      });
    }

    /**
     * Reads a line of text asynchronously.
     *
     * @param {string} initString - The initial string to display
     * @param {number} maxLen - The maximum length of the string to read
     * @param {number} [maxWidth=-1] - The maximum width of the line
     * @returns {Promise<string>} A promise that resolves to the string that was read
     */
  }, {
    key: "readLine",
    value: (function () {
      var _readLine = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(initString, maxLen) {
        var maxWidth,
          startCol,
          startRow,
          curCol,
          curRow,
          curStrings,
          curPos,
          cursorWasVisible,
          key,
          _args = arguments;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              maxWidth = _args.length > 2 && _args[2] !== undefined ? _args[2] : -1;
              startCol = main.drawState.cursorCol;
              startRow = main.drawState.cursorRow;
              curCol = startCol;
              curRow = startRow;
              curStrings = [initString];
              curPos = 0;
              cursorWasVisible = main.drawState.cursorVisible;
              main.cursorRenderer.setCursorVisible(true);

              // Loop until the user presses Enter.
            case 9:
              if (!true) {
                _context.next = 35;
                break;
              }
              main.setCursorLocation(curCol, curRow);
              main.textRenderer.print(curStrings[curPos] || "");
              _context.next = 14;
              return this.readKeyAsync();
            case 14:
              key = _context.sent;
              if (!(key === "Backspace")) {
                _context.next = 26;
                break;
              }
              if (!(curStrings[curPos].length === 0)) {
                _context.next = 21;
                break;
              }
              if (!(curPos === 0)) {
                _context.next = 19;
                break;
              }
              return _context.abrupt("continue", 9);
            case 19:
              curPos--;
              curRow--;
            case 21:
              curStrings[curPos] = curStrings[curPos].length > 0 ? curStrings[curPos].substring(0, curStrings[curPos].length - 1) : curStrings[curPos];
              // Erase the character.
              main.setCursorLocation(curCol + curStrings[curPos].length, curRow);
              main.textRenderer.print(" ");
              _context.next = 33;
              break;
            case 26:
              if (!(key === "Enter")) {
                _context.next = 32;
                break;
              }
              // Submit line of text.

              // Move cursor to start of next line.
              main.setCursorLocation(1, curRow + 1);
              // Restore previous cursor state.
              main.cursorRenderer.setCursorVisible(cursorWasVisible);
              return _context.abrupt("return", curStrings.join(""));
            case 32:
              if (key.length === 1) {
                // Add character to string.

                if (curStrings.join("").length < maxLen || maxLen === -1) {
                  curStrings[curPos] += key;
                  if (maxWidth !== -1 && curStrings[curPos].length >= maxWidth) {
                    main.textRenderer.print(curStrings[curPos].charAt(curStrings[curPos].length - 1));
                    curCol = startCol;
                    curPos++;
                    curStrings[curPos] = "";
                    curRow++;
                  }
                }
              }
            case 33:
              _context.next = 9;
              break;
            case 35:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function readLine(_x, _x2) {
        return _readLine.apply(this, arguments);
      }
      return readLine;
    }())
  }]);
}();

},{"./main.js":4}],4:[function(require,module,exports){
"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.canvas = void 0;
exports.cls = cls;
exports.cursorRenderer = exports.ctx = void 0;
exports.defineColors = defineColors;
exports.deltaTime = void 0;
exports.drawImage = drawImage;
exports.drawRect = drawRect;
exports.drawState = void 0;
exports.failAsync = failAsync;
exports.fillRect = fillRect;
exports.getColorHex = getColorHex;
exports.getContext = getContext;
exports.getNow = getNow;
exports.handleCrash = handleCrash;
exports.hasPendingAsync = hasPendingAsync;
exports.init = init;
exports.inputSys = void 0;
exports.markDirty = markDirty;
exports.preflight = preflight;
exports.realCtx = exports.realCanvas = void 0;
exports.render = render;
exports.resolveAsync = resolveAsync;
exports.restoreScreen = restoreScreen;
exports.saveScreen = saveScreen;
exports.setColor = setColor;
exports.setCursorLocation = setCursorLocation;
exports.setFrameHandler = setFrameHandler;
exports.startAsync = startAsync;
exports.textRenderer = void 0;
var _config = require("../config.js");
var _textrenderer = require("./textrenderer.js");
var _input = require("./input.js");
var _cursorrenderer = require("./cursorrenderer.js");
var qut = _interopRequireWildcard(require("../qut.js"));
var vjoy = _interopRequireWildcard(require("./vjoy.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var textRenderer = exports.textRenderer = null;
var inputSys = exports.inputSys = null;
var cursorRenderer = exports.cursorRenderer = null;
var realCanvas = exports.realCanvas = null;
var realCtx = exports.realCtx = null;
var canvas = exports.canvas = null;
var ctx = exports.ctx = null;
var lastFrameTime = null;
var crashed = false;
var deltaTime = exports.deltaTime = 0; // Time elapsed since last frame.

var drawState = exports.drawState = {
  fgColor: 7,
  bgColor: 0,
  // -1 means transparent

  cursorCol: 0,
  cursorRow: 0,
  cursorVisible: false // Don't change this directly, use cursorRenderer.setCursorVisible()
};

// If set, initialization has successfully concluded.
var initDone = false;
// If set, this is the callback to call on every animation frame.
var frameHandler = null;
// If frameHandler is set, this is the target interval at which to call it.
// This is the reciprocal of the FPS, so if FPS is 30, this will be 1/30.
var frameHandlerTargetInterval = null;
// If true, there's an animation frame pending run (it was requested but not run yet).
var animFrameRequested = false;
// Time remaining in seconds to call the next frame handler.
var timeToNextFrame = 0;

// HTML element for the "scan lines" effect, if created.
var scanLinesEl = null;

// If this is not null, then there is currently an async API call in progress,
// which means other API calls can't be called. If not null, this is an object with:
// {
//   name: the name of the async function that was called.
//   resolve: the promise resolve function to call.
//   reject: the reject function to call if there is an error.
// }
var pendingAsync = null;

// If this is true, then the screen is "dirty" and needs to render.
var dirty = false;
function init(callback) {
  qut.checkFunction("callback", callback);
  asyncInit(callback);
}
function asyncInit(_x) {
  return _asyncInit.apply(this, arguments);
}
function _asyncInit() {
  _asyncInit = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(callback) {
    var _iterator, _step, className, container, containerSpec;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          qut.log("Sys init.");

          // Computed values: width and height of screen in virtual pixels.
          _config.CONFIG.SCREEN_WIDTH = _config.CONFIG.SCREEN_COLS * _config.CONFIG.CHR_WIDTH;
          _config.CONFIG.SCREEN_HEIGHT = _config.CONFIG.SCREEN_ROWS * _config.CONFIG.CHR_HEIGHT;

          // Set up the real canvas (the one that really exists onscreen).
          exports.realCanvas = realCanvas = document.createElement("canvas");
          if (_config.CONFIG.CANVAS_SETTINGS && _config.CONFIG.CANVAS_SETTINGS.CANVAS_ID) {
            realCanvas.setAttribute("id", _config.CONFIG.CANVAS_SETTINGS.CANVAS_ID);
          }
          if (_config.CONFIG.CANVAS_SETTINGS && _config.CONFIG.CANVAS_SETTINGS.CANVAS_CLASSES) {
            _iterator = _createForOfIteratorHelper(_config.CONFIG.CANVAS_SETTINGS.CANVAS_CLASSES);
            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                className = _step.value;
                realCanvas.classList.add(className);
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }
          }

          // Prevent default touch behavior on touch devices.
          realCanvas.addEventListener("touchstart", function (e) {
            return e.preventDefault();
          });

          // Figure out where to add the canvas.
          container = document.body;
          if (_config.CONFIG.CANVAS_SETTINGS && _config.CONFIG.CANVAS_SETTINGS.CONTAINER) {
            // Ok, where do you want your canvas?
            containerSpec = _config.CONFIG.CANVAS_SETTINGS.CONTAINER;
            if (typeof containerSpec === "string") {
              // This is the ID of an HTML element, so go get it.
              container = document.getElementById(containerSpec);
              if (!container) {
                console.error("nano8: Could not find container element with ID: " + containerSpec);
                container = document.body;
              }
            } else if (containerSpec instanceof HTMLElement) {
              // This is directly an HTMLElement instance, so use that.
              container = containerSpec;
            } else {
              // No idea what this is.
              console.error("nano8: CONFIG.CANVAS_SETTINGS.CONTAINER must be either an ID of an HTMLElement.");
              container = document.body;
            }
          }

          // Put the canvas in the container.
          container.appendChild(realCanvas);

          // Set up the virtual canvas (the one we render to). This canvas isn't part of the document
          // (it's not added to document.body), it only exists off-screen.
          exports.canvas = canvas = document.createElement("canvas");
          canvas.width = _config.CONFIG.SCREEN_WIDTH;
          canvas.height = _config.CONFIG.SCREEN_HEIGHT;
          canvas.style.width = _config.CONFIG.SCREEN_WIDTH + "px";
          canvas.style.height = _config.CONFIG.SCREEN_HEIGHT + "px";
          exports.ctx = ctx = canvas.getContext("2d");
          ctx.imageSmoothingEnabled = false;

          // Initialize subsystems
          exports.textRenderer = textRenderer = new _textrenderer.TextRenderer();
          exports.inputSys = inputSys = new _input.InputSys();
          exports.cursorRenderer = cursorRenderer = new _cursorrenderer.CursorRenderer();
          _context.next = 22;
          return textRenderer.initAsync();
        case 22:
          // Update the positioning and size of the canvas.
          updateLayout(false);
          window.addEventListener("resize", function () {
            return updateLayout(true);
          });

          // Set up the input system on mobile devices.
          if (isMobile()) {
            vjoy.setup();
          }
          initDone = true;

          // Work around an init bug where text would initially not render
          // on Firefox. I'm not entirely sure I understand why, but this seems
          // to fix it (perhaps waiting 1 frame gives the canvas time to initialize).
          _context.next = 28;
          return new Promise(function (resolve) {
            return setTimeout(resolve, 1);
          });
        case 28:
          _context.next = 30;
          return callback();
        case 30:
          render();
        case 31:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _asyncInit.apply(this, arguments);
}
function getContext() {
  return ctx;
}

// Checks that the given API method can be called right now.
function preflight(apiMethod) {
  if (crashed) {
    throw new Error("Can't call API method ".concat(apiMethod, "() because the engine has crashed."));
  }
  if (!initDone) {
    qut.fatal("Can't call API method ".concat(apiMethod, "(): API not initialized. ") + "Call initAsync() wait until it finishes before calling API methods.");
  }
  if (pendingAsync) {
    qut.fatal("Can't call API method ".concat(apiMethod, "() because there is a pending async ") + "call to ".concat(pendingAsync.name, "() that hasn't finished running yet. Are you missing ") + "an 'await' keyword to wait for the async method? Use 'await ".concat(pendingAsync.name, "()',") + "not just '".concat(pendingAsync.name, "()'"));
  }
}
function startAsync(asyncMethodName, resolve, reject) {
  if (pendingAsync) {
    throw new Error("Internal bug: startAsync called while pendingAsync is not null. " + "Missing preflight() call?");
  }
  pendingAsync = {
    name: asyncMethodName,
    resolve: resolve,
    reject: reject
  };
  this.render();
}
function hasPendingAsync(asyncMethodName) {
  return pendingAsync && pendingAsync.name === asyncMethodName;
}
function endAsyncImpl(asyncMethodName, isError, result) {
  if (!pendingAsync) {
    throw new Error("Internal bug: endAsync(".concat(asyncMethodName, ") called with no pendingAsync"));
  }
  if (pendingAsync.name !== asyncMethodName) {
    throw new Error("Internal bug: endAsync(".concat(asyncMethodName, ") called but pendingAsync.name ") + "is ".concat(pendingAsync.name));
  }
  var fun = isError ? pendingAsync.reject : pendingAsync.resolve;
  pendingAsync = null;
  fun(result);
}
function resolveAsync(asyncMethodName, result) {
  endAsyncImpl(asyncMethodName, false, result);
}
function failAsync(asyncMethodName, error) {
  endAsyncImpl(asyncMethodName, true, error);
}
function setFrameHandler(callback, targetFps) {
  frameHandler = callback;
  frameHandlerTargetInterval = 1.0 / (targetFps || 30);
  timeToNextFrame = 0;
  // If we didn't already, request an animation frame.
  if (!animFrameRequested) {
    window.requestAnimationFrame(doFrame);
  }
}
function render() {
  if (crashed) return;
  realCtx.imageSmoothingEnabled = false;
  realCtx.clearRect(0, 0, realCanvas.width, realCanvas.height);
  realCtx.drawImage(canvas, 0, 0, realCanvas.width, realCanvas.height);
  dirty = false;
  cursorRenderer.drawCursor(realCtx, realCanvas.width, realCanvas.height);
}

// Marks the screen as dirty and renders it at the next available opportunity.
function markDirty() {
  if (dirty) return;
  dirty = true;
  // Render at the next available opportunity. Note that we never schedule more than one
  // of these calls because we only schedule when dirty was false and becomes true.
  setTimeout(render, 1);
}
function cls() {
  ctx.fillStyle = getColorHex(drawState.bgColor);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  this.setCursorLocation(0, 0);
  markDirty();
}
function defineColors(colors) {
  qut.checkArray("colors", colors);
  _config.CONFIG.COLORS = colors.slice();
  textRenderer.regenColors();
}
function setColor(fg, bg) {
  qut.checkNumber("fg", fg);
  drawState.fgColor = Math.round(fg);
  if (bg !== undefined) {
    qut.checkNumber("bg", bg);
    drawState.bgColor = Math.round(bg);
  }
}
function setCursorLocation(col, row) {
  qut.checkNumber("col", col);
  if (row !== undefined) qut.checkNumber("row", row);
  drawState.cursorCol = Math.round(col);
  if (row !== undefined) drawState.cursorRow = Math.round(row);
}
function getColorHex(c) {
  if (typeof c !== "number") return "#f0f";
  if (c < 0) return "#000";
  c = qut.clamp(Math.round(c), 0, _config.CONFIG.COLORS.length - 1);
  return _config.CONFIG.COLORS[c];
}
function getNow() {
  return window.performance.now ? window.performance.now() : new Date().getTime();
}
function drawImage(img, x, y, srcX, srcY, width, height) {
  qut.checkInstanceOf("img", img, HTMLImageElement);
  qut.checkNumber("x", x);
  qut.checkNumber("y", y);
  if (srcX !== undefined) qut.checkNumber("srcX", srcX);
  if (srcY !== undefined) qut.checkNumber("srcY", srcY);
  if (width !== undefined) qut.checkNumber("width", width);
  if (height !== undefined) qut.checkNumber("height", height);
  if (srcX !== undefined && srcY !== undefined && width !== undefined && height !== undefined) {
    ctx.drawImage(img, srcX, srcY, width, height, x, y, width, height);
  } else {
    ctx.drawImage(img, x, y);
  }
}
function drawRect(x, y, width, height) {
  qut.checkNumber("x", x);
  qut.checkNumber("y", y);
  qut.checkNumber("width", width);
  qut.checkNumber("height", height);
  var oldStrokeStyle = ctx.strokeStyle;
  ctx.strokeStyle = getColorHex(drawState.fgColor);
  // Must add 0.5 to x and y so we draw in the "middle"
  // of the pixel. Weird canvas floating-point coords.
  ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(width) - 1, Math.round(height) - 1);
  ctx.strokeStyle = oldStrokeStyle;
}
function fillRect(x, y, width, height) {
  qut.checkNumber("x", x);
  qut.checkNumber("y", y);
  qut.checkNumber("width", width);
  qut.checkNumber("height", height);
  ctx.fillStyle = getColorHex(drawState.fgColor);
  // Must add 0.5 to x and y so we draw in the "middle"
  // of the pixel. Weird canvas floating-point coords.
  ctx.fillRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(width) - 1, Math.round(height) - 1);
}
function saveScreen() {
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}
function restoreScreen(screenData) {
  qut.checkInstanceOf("screenData", screenData, ImageData);
  ctx.putImageData(screenData, 0, 0);
}
function doFrame() {
  return _doFrame.apply(this, arguments);
}
function _doFrame() {
  _doFrame = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
    var now, numFramesDone;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          animFrameRequested = false;
          now = getNow();
          exports.deltaTime = deltaTime = lastFrameTime !== null ? 0.001 * (now - lastFrameTime) : 1 / 60.0;
          exports.deltaTime = deltaTime = Math.min(deltaTime, 0.05);
          lastFrameTime = now;
          timeToNextFrame += deltaTime;
          numFramesDone = 0;
        case 7:
          if (!(frameHandler && numFramesDone < 4 && timeToNextFrame > frameHandlerTargetInterval)) {
            _context2.next = 15;
            break;
          }
          _context2.next = 10;
          return frameHandler();
        case 10:
          inputSys.onEndFrame();
          timeToNextFrame -= frameHandlerTargetInterval;
          ++numFramesDone;
          _context2.next = 7;
          break;
        case 15:
          render();

          // If we still have a frame handler, request the next animation frame.
          if (frameHandler) {
            animFrameRequested = true;
            window.requestAnimationFrame(doFrame);
          }
        case 17:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _doFrame.apply(this, arguments);
}
function updateLayout(renderNow) {
  updateLayout2d();
  if (renderNow) render();
}
function updateLayout2d() {
  var autoSize = !_config.CONFIG.CANVAS_SETTINGS || _config.CONFIG.CANVAS_SETTINGS.AUTO_SIZE;
  var autoPos = !_config.CONFIG.CANVAS_SETTINGS || _config.CONFIG.CANVAS_SETTINGS.AUTO_POSITION;

  // Does the user want the canvas scale factor to be computed automatically?
  var useAutoScale = typeof _config.CONFIG.SCREEN_SCALE !== 'number';
  // Computed canvas scale factor.
  var scale;
  if (useAutoScale) {
    var frac = _config.CONFIG.MAX_SCREEN_FRACTION || 0.8;
    // Depending on whether or not auto-sizing is on, the available size will be either the
    // full screen size, or the actual current size.
    var availableSize = autoSize ? {
      width: frac * window.innerWidth,
      height: frac * window.innerHeight
    } : realCanvas.getBoundingClientRect();
    // Find the biggest scale factor for which the canvas will still fit on the available size.
    scale = Math.floor(Math.min(availableSize.width / _config.CONFIG.SCREEN_WIDTH, availableSize.height / _config.CONFIG.SCREEN_HEIGHT));
    // That's the scale factor, but clamp it between 1 and 5 for sanity.
    scale = Math.min(Math.max(scale, 1), 5);
    qut.log("Auto-scale: available size ".concat(availableSize.width, " x ").concat(availableSize.height, ", scale ").concat(scale, ", dpr ").concat(window.devicePixelRatio));
  } else {
    // Fixed scale.
    scale = _config.CONFIG.SCREEN_SCALE;
  }

  // Width and height of screen as displayed in HTML.
  _config.CONFIG.SCREEN_EL_WIDTH = _config.CONFIG.SCREEN_WIDTH * scale;
  _config.CONFIG.SCREEN_EL_HEIGHT = _config.CONFIG.SCREEN_HEIGHT * scale;
  // Real width and height of screen.
  _config.CONFIG.SCREEN_REAL_WIDTH = _config.CONFIG.SCREEN_WIDTH * scale;
  _config.CONFIG.SCREEN_REAL_HEIGHT = _config.CONFIG.SCREEN_HEIGHT * scale;
  if (autoSize) {
    // Set its size based on what we computed above.
    realCanvas.style.width = _config.CONFIG.SCREEN_EL_WIDTH + "px";
    realCanvas.style.height = _config.CONFIG.SCREEN_EL_HEIGHT + "px";
    realCanvas.width = _config.CONFIG.SCREEN_REAL_WIDTH;
    realCanvas.height = _config.CONFIG.SCREEN_REAL_HEIGHT;
  } else {
    // Set its resolution to match its actual size.
    var actualSize = realCanvas.getBoundingClientRect();
    realCanvas.width = actualSize.width;
    realCanvas.height = actualSize.height;
  }
  exports.realCtx = realCtx = realCanvas.getContext("2d");
  realCtx.imageSmoothingEnabled = false;
  if (autoPos) {
    realCanvas.style.position = "absolute";
    realCanvas.style.left = Math.round((window.innerWidth - realCanvas.width) / 2) + "px";
    realCanvas.style.top = Math.round((window.innerHeight - realCanvas.height) / 2) + "px";
  }
  var scanLinesOp = _config.CONFIG.SCAN_LINES_OPACITY || 0;
  if (scanLinesOp > 0) {
    if (autoPos && autoSize) {
      if (!scanLinesEl) {
        scanLinesEl = document.createElement("div");
        document.body.appendChild(scanLinesEl);
      }
      scanLinesEl.style.background = "linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 1) 50%), " + "linear-gradient(90deg, rgba(255, 0, 0, .6), rgba(0, 255, 0, .2), rgba(0, 0, 255, .6))";
      scanLinesEl.style.backgroundSize = "100% 4px, 3px 100%";
      scanLinesEl.style.opacity = scanLinesOp;
      scanLinesEl.style.position = "absolute";
      scanLinesEl.style.left = realCanvas.style.left;
      scanLinesEl.style.top = realCanvas.style.top;
      scanLinesEl.style.width = realCanvas.style.width;
      scanLinesEl.style.height = realCanvas.style.height;
      scanLinesEl.style.zIndex = 1;
    } else {
      console.error("nano8: 2D scanlines effect only works if CONFIG.CANVAS_SETTINGS.AUTO_POS and AUTO_SIZE are both on.");
    }
  }
}
var crashing = false;
function handleCrash() {
  var errorMessage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Fatal error";
  if (crashed || crashing) return;
  crashing = true;
  setColor(_config.CONFIG.COLORS.length - 1, 0);
  cls();
  drawState.cursorCol = drawState.cursorRow = 1;
  textRenderer.print("*** CRASH ***:\n" + errorMessage);
  render();
  crashing = false;
  crashed = true;
}
function isMobile() {
  return isIOS() || isAndroid();
}
function isIOS() {
  return /(ipad|ipod|iphone)/i.test(navigator.userAgent);
}
function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

},{"../config.js":1,"../qut.js":11,"./cursorrenderer.js":2,"./input.js":3,"./textrenderer.js":6,"./vjoy.js":7}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.menu = menu;
var qut = _interopRequireWildcard(require("../qut.js"));
var main = _interopRequireWildcard(require("./main.js"));
var _config = require("../config.js");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// For documentation, see the menu() function in nano8a.js.
function menu(_x, _x2) {
  return _menu.apply(this, arguments);
}
function _menu() {
  _menu = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(choices, options) {
    var startCol, startRow, promptSize, prompt01, border01, choicesCols, choicesRows, totalCols, totalRows, t, selIndex, k;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          options = options || {};
          qut.checkArray("choices", choices);
          qut.checkObject("options", options);
          options = Object.assign({
            title: "",
            prompt: "",
            selBgColor: main.drawState.fgColor,
            // reverse video as default sel color
            selFgColor: main.drawState.bgColor,
            bgChar: 32,
            borderChar: 0x80,
            center: false,
            centerH: false,
            centerV: false,
            padding: 1,
            selIndex: 0,
            cancelable: false
          }, options);
          startCol = main.drawState.cursorCol;
          startRow = main.drawState.cursorRow;
          promptSize = main.textRenderer.measure(options.prompt);
          prompt01 = options.prompt ? 1 : 0;
          border01 = options.borderChar ? 1 : 0;
          choicesCols = 0;
          choicesRows = choices.length;
          choices.forEach(function (choice) {
            return choicesCols = Math.max(choicesCols, choice.length);
          });
          totalCols = Math.max(promptSize.cols, choicesCols) + 2 * options.padding + 2 * border01;
          totalRows = prompt01 * (promptSize.rows + 1) + choicesRows + 2 * options.padding + 2 * border01;
          if (options.centerH || options.center) {
            startCol = Math.round((_config.CONFIG.SCREEN_COLS - totalCols) / 2);
          }
          if (options.centerV || options.center) {
            startRow = Math.round((_config.CONFIG.SCREEN_ROWS - totalRows) / 2);
          }
          main.drawState.cursorCol = startCol;
          main.drawState.cursorRow = startRow;

          // Print the background.
          main.textRenderer.printRect(totalCols, totalRows, options.bgChar);

          // Print the border.
          if (options.borderChar) {
            main.textRenderer.printBox(totalCols, totalRows, false, options.borderChar);
            // Print title at the top of the border.
            if (options.title) {
              t = " " + options.title + " ";
              main.drawState.cursorCol = startCol + Math.round((totalCols - t.length) / 2);
              main.textRenderer.print(t);
            }
          }
          if (options.prompt) {
            main.drawState.cursorCol = promptSize.cols <= totalCols ? startCol + border01 + options.padding : startCol + Math.round((totalCols - promptSize.cols) / 2);
            main.drawState.cursorRow = startRow + border01 + options.padding;
            main.textRenderer.print(options.prompt);
          }

          // TODO: save the screen image before showing the menu and restore it later.
          selIndex = options.selIndex;
        case 22:
          if (!true) {
            _context.next = 45;
            break;
          }
          // Draw choices.
          main.drawState.cursorRow = startRow + border01 + options.padding + prompt01 * (promptSize.rows + 1);
          main.drawState.cursorCol = promptSize.cols <= choicesCols ? startCol + border01 + options.padding : startCol + Math.round((totalCols - choicesCols) / 2);
          printChoices(choices, selIndex, options);
          _context.next = 28;
          return main.inputSys.readKeyAsync();
        case 28:
          k = _context.sent;
          if (!(k === "ArrowUp")) {
            _context.next = 33;
            break;
          }
          selIndex = selIndex > 0 ? selIndex - 1 : choices.length - 1;
          _context.next = 43;
          break;
        case 33:
          if (!(k === "ArrowDown")) {
            _context.next = 37;
            break;
          }
          selIndex = (selIndex + 1) % choices.length;
          _context.next = 43;
          break;
        case 37:
          if (!(k === "Enter" || k === "ButtonA")) {
            _context.next = 41;
            break;
          }
          return _context.abrupt("return", selIndex);
        case 41:
          if (!((k === "Escape" || k === "ButtonB") && options.cancelable)) {
            _context.next = 43;
            break;
          }
          return _context.abrupt("return", -1);
        case 43:
          _context.next = 22;
          break;
        case 45:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _menu.apply(this, arguments);
}
function printChoices(choices, selIndex, options) {
  var origBg = main.drawState.bgColor;
  var origFg = main.drawState.fgColor;
  for (var i = 0; i < choices.length; i++) {
    var isSel = i === selIndex;
    main.setColor(isSel ? options.selFgColor : origFg, isSel ? options.selBgColor : origBg);
    main.textRenderer.print(choices[i] + "\n");
  }
  main.setColor(origFg, origBg);
}

},{"../config.js":1,"../qut.js":11,"./main.js":4}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextRendererFont = exports.TextRenderer = void 0;
var _config = require("../config.js");
var qut = _interopRequireWildcard(require("../qut.js"));
var main = _interopRequireWildcard(require("./main.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// Represents an individual font that can be used with TextRenderer.
var TextRendererFont = exports.TextRendererFont = /*#__PURE__*/function () {
  // Constructs a font. NOTE: after construction, you must call await initAsync() to
  // initialize the font.
  function TextRendererFont(fontName, fontImageFile) {
    _classCallCheck(this, TextRendererFont);
    qut.checkString("fontName", fontName);
    qut.checkString("fontImageFile", fontImageFile);
    // Name of the font.
    this.fontName_ = fontName;
    // URL of the image file for the font.
    this.fontImageFile_ = fontImageFile;
    // Original text image, in case we need to regenerate the color images.
    this.origImg_ = null;
    // One image for each color.
    this.chrImages_ = [];
    // Width and height of each character, in pixels.
    this.charWidth_ = 0;
    this.charHeight_ = 0;

    // When we are printing something, we store a backup of the drawing context's
    // original foreground and background colors, in case we change it during printing
    // as a result of escape sequences.
    this.origFgColor_ = 0;
    this.origBgColor_ = 0;
  }
  return _createClass(TextRendererFont, [{
    key: "getCharWidth",
    value: function getCharWidth() {
      return this.charWidth_;
    }
  }, {
    key: "getCharHeight",
    value: function getCharHeight() {
      return this.charHeight_;
    }
  }, {
    key: "getImageForColor",
    value: function getImageForColor(colorNumber) {
      return this.chrImages_[colorNumber];
    }

    // Sets up this font from the given character image file. It's assumed to contain the
    // glyps arranged in a 16x16 grid, so we will deduce the character size by dividing the
    // width and height by 16.
  }, {
    key: "initAsync",
    value: function () {
      var _initAsync = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              qut.log("Building font ".concat(this.fontName_, " from image ").concat(this.fontImageFile_));
              _context.next = 3;
              return qut.loadImageAsync(this.fontImageFile_);
            case 3:
              this.origImg_ = _context.sent;
              qut.assert(this.origImg_.width % 16 === 0 && this.origImg_.height % 16 === 0, "Font ".concat(this.fontName_, ": image ").concat(this.fontImageFile_, " has dimensions ") + "".concat(this.origImg_.width, "x").concat(this.origImg_.height, ". It must ") + "have dimensions that are multiples of 16 (16x16 grid of characters).");
              this.charWidth_ = Math.floor(this.origImg_.width / 16);
              this.charHeight_ = Math.floor(this.origImg_.height / 16);
              this.regenColors();
            case 8:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function initAsync() {
        return _initAsync.apply(this, arguments);
      }
      return initAsync;
    }() // Regenerates the color text images.
  }, {
    key: "regenColors",
    value: function regenColors() {
      var tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.origImg_.width;
      tempCanvas.height = this.origImg_.height;
      var ctx = tempCanvas.getContext('2d');
      this.chrImages_ = [];
      for (var c = 0; c < _config.CONFIG.COLORS.length; c++) {
        qut.log("Initializing font ".concat(this.fontName_, ", color ").concat(c, " = ").concat(_config.CONFIG.COLORS[c]));

        // Draw the font image to the temp canvas (white over transparent background).
        ctx.clearRect(0, 0, this.origImg_.width, this.origImg_.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(this.origImg_, 0, 0, this.origImg_.width, this.origImg_.height);

        // Now draw a filled rect with the desired color using the 'source-in' pixel
        // operation, which will tint the white pixels to that color. I think.
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = _config.CONFIG.COLORS[c];
        ctx.fillRect(0, 0, this.origImg_.width, this.origImg_.height);

        // Now extract the canvas contents as an image.
        var thisImg = new Image();
        thisImg.src = tempCanvas.toDataURL();
        this.chrImages_.push(thisImg);
      }
    }
  }]);
}();
var TextRenderer = exports.TextRenderer = /*#__PURE__*/function () {
  function TextRenderer() {
    _classCallCheck(this, TextRenderer);
    // TextRendererFont for each font, keyed by font name. The default font is called "default".
    this.fonts_ = {};

    // Current font. This is never null after initialization. This is a reference
    // to a TextRendererFont object. For a font to be set as current, it must have a
    // character width and height that are INTEGER MULTIPLES of CONFIG.CHR_WIDTH and
    // CONFIG.CHR_HEIGHT, respectively, to ensure the row/column system continues to work.
    this.curFont_ = null;
  }
  return _createClass(TextRenderer, [{
    key: "initAsync",
    value: function () {
      var _initAsync2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        var defaultFont, actualCharWidth, actualCharHeight;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              qut.log("TextRenderer init.");
              defaultFont = new TextRendererFont("default", _config.CONFIG.CHR_FILE);
              _context2.next = 4;
              return defaultFont.initAsync();
            case 4:
              actualCharWidth = defaultFont.getCharWidth();
              actualCharHeight = defaultFont.getCharHeight();
              qut.assert(actualCharWidth === defaultFont.getCharWidth() && actualCharHeight === defaultFont.getCharHeight(), "The character image ".concat(_config.CONFIG.CHR_FILE, " should be a 16x16 grid of characters with ") + "dimensions 16 * CONFIG.CHR_WIDTH, 16 * CONFIG.CHR_HEIGHT = " + "".concat(16 * _config.CONFIG.CHR_WIDTH, " x ").concat(16 * _config.CONFIG.CHR_HEIGHT));
              this.fonts_["default"] = defaultFont;
              this.curFont_ = defaultFont;
            case 9:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function initAsync() {
        return _initAsync2.apply(this, arguments);
      }
      return initAsync;
    }()
  }, {
    key: "loadFontAsync",
    value: function () {
      var _loadFontAsync = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(fontName, fontImageFile) {
        var font;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              qut.checkString("fontName", fontName);
              qut.checkString("fontImageFile", fontImageFile);
              font = new TextRendererFont(fontName, fontImageFile);
              _context3.next = 5;
              return font.initAsync();
            case 5:
              this.fonts_[fontName] = font;
            case 6:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function loadFontAsync(_x, _x2) {
        return _loadFontAsync.apply(this, arguments);
      }
      return loadFontAsync;
    }()
  }, {
    key: "setFont",
    value: function setFont(fontName) {
      qut.checkString("fontName", fontName);
      var font = this.fonts_[fontName];
      if (!font) {
        qut.fatal("setFont(): font not found: ".concat(fontName));
        return;
      }
      var cw = font.getCharWidth();
      var ch = font.getCharHeight();
      if (cw % _config.CONFIG.CHR_WIDTH !== 0 || ch % _config.CONFIG.CHR_HEIGHT !== 0) {
        qut.fatal("setFont(): font ".concat(fontName, " has character size ").concat(cw, "x").concat(ch, ", ") + "which is not an integer multiple of CONFIG.CHR_WIDTH x CONFIG.CHR_HEIGHT = " + "".concat(_config.CONFIG.CHR_WIDTH, "x").concat(_config.CONFIG.CHR_HEIGHT, ", so it can't be set as the ") + "current font due to the row,column system. However, you can still use it " + "directly with drawText() by passing it as a parameter to that function.");
        return;
      }
      this.curFont_ = font;
    }
  }, {
    key: "print",
    value: function print(text) {
      qut.checkString("text", text);
      var col = main.drawState.cursorCol;
      var row = main.drawState.cursorRow;

      // Store a backup of foreground/background colors, in case we change them during
      // the print operation as a result of escape sequences.
      this.origFgColor_ = main.drawState.fgColor;
      this.origBgColor_ = main.drawState.bgColor;

      // Note: We know (because this is enforced in setFont) that the current font's character size
      // is a multiple of CONFIG.CHR_WIDTH x CONFIG.CHR_HEIGHT.
      var colInc = Math.floor(this.curFont_.getCharWidth() / _config.CONFIG.CHR_WIDTH);
      var rowInc = Math.floor(this.curFont_.getCharHeight() / _config.CONFIG.CHR_HEIGHT);
      var initialCol = col;
      for (var i = 0; i < text.length; i++) {
        i = this.processEscapeSeq_(text, i);
        var ch = text.charCodeAt(i);
        if (ch === 10) {
          col = initialCol;
          row += rowInc;
        } else {
          this.put_(ch, col, row, main.drawState.fgColor, main.drawState.bgColor);
          col += colInc;
        }
      }
      main.drawState.cursorCol = col;
      main.drawState.cursorRow = row;
      main.drawState.fgColor = this.origFgColor_;
      main.drawState.bgColor = this.origBgColor_;
      main.markDirty();
    }
  }, {
    key: "printCentered",
    value: function printCentered(text, width) {
      qut.checkString("text", text);
      qut.checkNumber("width", width);
      text = text.split("\n")[0];
      if (!text) return;
      var textWidth = this.measure(text).cols;
      var col = Math.floor(main.drawState.cursorCol + (width - textWidth) / 2);
      main.drawState.cursorCol = col;
      this.print(text);
    }
  }, {
    key: "printChar",
    value: function printChar(ch, n) {
      if (n === undefined || isNaN(n)) n = 1;
      qut.checkNumber("ch", ch);
      qut.checkNumber("n", n);
      while (n-- > 0) {
        this.put_(ch, main.drawState.cursorCol, main.drawState.cursorRow, main.drawState.fgColor, main.drawState.bgColor);
        main.drawState.cursorCol++;
      }
      main.markDirty();
    }

    // Prints a character as a "sprite" at a raw x, y position.
  }, {
    key: "spr",
    value: function spr(ch, x, y) {
      qut.checkNumber("ch", ch);
      qut.checkNumber("x", x);
      qut.checkNumber("y", y);
      this.putxy_(ch, x, y, main.drawState.fgColor, main.drawState.bgColor);
    }

    // Draws text at the given pixel coordinates, with no cursor movement.
  }, {
    key: "drawText",
    value: function drawText(x, y, text, fontName) {
      qut.checkNumber("x", x);
      qut.checkNumber("y", y);
      qut.checkString("text", text);
      if (fontName) qut.checkString("fontName", fontName);
      var x0 = x;
      var font = fontName ? this.fonts_[fontName] || this.curFont_ : this.curFont_;
      if (!font) {
        qut.warn("Requested font '".concat(fontName, "' not found: not drawing text."));
        return;
      }
      for (var i = 0; i < text.length; i++) {
        var ch = text.charCodeAt(i);
        if (ch === 10) {
          x = x0;
          y += font.getCharHeight();
        } else {
          this.putxy_(ch, x, y, main.drawState.fgColor, main.drawState.bgColor, font);
          x += font.getCharWidth();
        }
      }
    }

    // Returns {cols, rows}.
  }, {
    key: "measure",
    value: function measure(text) {
      qut.checkString("text", text);
      if (text === "") return {
        cols: 0,
        rows: 0
      }; // Special case

      var rows = 1;
      var thisLineWidth = 0;
      var cols = 0;
      for (var i = 0; i < text.length; i++) {
        i = this.processEscapeSeq_(text, i, true);
        var ch = text.charCodeAt(i);
        if (ch === 10) {
          rows++;
          thisLineWidth = 0;
        } else {
          ++thisLineWidth;
          cols = Math.max(cols, thisLineWidth);
        }
      }
      return {
        cols: cols,
        rows: rows
      };
    }
  }, {
    key: "printRect",
    value: function printRect(width, height, ch) {
      qut.checkNumber("width", width);
      qut.checkNumber("height", height);
      qut.checkNumber("ch", ch);
      var startCol = main.drawState.cursorCol;
      var startRow = main.drawState.cursorRow;
      for (var i = 0; i < height; i++) {
        main.drawState.cursorCol = startCol;
        main.drawState.cursorRow = startRow + i;
        this.printChar(ch, width);
      }
      main.drawState.cursorCol = startCol;
      main.drawState.cursorRow = startRow;
    }
  }, {
    key: "printBox",
    value: function printBox(width, height, fill, borderCh) {
      var borderNW = borderCh;
      var borderNE = borderCh + 1;
      var borderSW = borderCh + 2;
      var borderSE = borderCh + 3;
      var borderV = borderCh + 4;
      var borderH = borderCh + 5;
      qut.checkNumber("width", width);
      qut.checkNumber("height", height);
      qut.checkBoolean("fill", fill);
      qut.checkNumber("borderCh", borderCh);
      var startCol = main.drawState.cursorCol;
      var startRow = main.drawState.cursorRow;
      for (var i = 0; i < height; i++) {
        main.drawState.cursorCol = startCol;
        main.drawState.cursorRow = startRow + i;
        if (i === 0) {
          // Top border
          this.printChar(borderNW);
          this.printChar(borderH, width - 2);
          this.printChar(borderNE);
        } else if (i === height - 1) {
          // Bottom border.
          this.printChar(borderSW);
          this.printChar(borderH, width - 2);
          this.printChar(borderSE);
        } else {
          // Middle.
          this.printChar(borderV);
          main.drawState.cursorCol = startCol + width - 1;
          this.printChar(borderV);
        }
      }
      if (fill && width > 2 && height > 2) {
        main.drawState.cursorCol = startCol + 1;
        main.drawState.cursorRow = startRow + 1;
        this.printRect(width - 2, height - 2, 32);
      }
      main.drawState.cursorCol = startCol;
      main.drawState.cursorRow = startRow;
    }
  }, {
    key: "put_",
    value: function put_(ch, col, row, fgColor, bgColor) {
      var chrW = _config.CONFIG.CHR_WIDTH;
      var chrH = _config.CONFIG.CHR_HEIGHT;
      var x = Math.round(col * chrW);
      var y = Math.round(row * chrH);
      this.putxy_(ch, x, y, fgColor, bgColor);
    }
  }, {
    key: "putxy_",
    value: function putxy_(ch, x, y, fgColor, bgColor) {
      var font = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
      font = font || this.curFont_;
      var chrW = font.getCharWidth();
      var chrH = font.getCharHeight();
      var fontRow = Math.floor(ch / 16);
      var fontCol = ch % 16;
      x = Math.round(x);
      y = Math.round(y);
      if (bgColor >= 0) {
        main.ctx.fillStyle = main.getColorHex(bgColor);
        main.ctx.fillRect(x, y, chrW, chrH);
      }
      var color = qut.clamp(fgColor, 0, _config.CONFIG.COLORS.length - 1);
      var img = font.getImageForColor(color);
      main.ctx.drawImage(img, fontCol * chrW, fontRow * chrH, chrW, chrH, x, y, chrW, chrH);
      main.markDirty();
    }

    // Tries to run an escape sequence that starts at text[pos].
    // Returns the position after the escape sequence ends.
    // If pretend is true, then this will only parse but not run it.
  }, {
    key: "processEscapeSeq_",
    value: function processEscapeSeq_(text, startPos) {
      var pretend = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      // Shorthand.
      var startSeq = _config.CONFIG.PRINT_ESCAPE_START;
      var endSeq = _config.CONFIG.PRINT_ESCAPE_END;

      // If no escape sequences are configured in CONFIG, stop.
      if (!startSeq || !endSeq) return startPos;

      // Check that the start sequence is there.
      if (text.substring(startPos, startPos + startSeq.length) != startSeq) {
        return startPos;
      }

      // Where does it end?
      var endPos = text.indexOf(endSeq, startPos + startSeq.length);
      if (!pretend) {
        // Get the contents of the sequence.
        var command = text.substring(startPos + startSeq.length, endPos);
        this.runEscapeCommand_(command);
      }
      return endPos + endSeq.length;
    }
  }, {
    key: "runEscapeCommand_",
    value: function runEscapeCommand_(command) {
      // If it contains colons, it's a compound command.
      if (command.indexOf(',') > 0) {
        var parts = command.split(',');
        var _iterator = _createForOfIteratorHelper(parts),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var part = _step.value;
            this.runEscapeCommand_(part);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        return;
      }
      command = command.trim();
      if (command === "") return;

      // The first character is the command's verb. The rest is the argument.
      var verb = command[0].toLowerCase();
      var arg = command.substring(1);
      var argNum = 1 * arg;
      switch (verb) {
        case "f":
        case "c":
          // Set foreground color.
          main.drawState.fgColor = arg !== "" ? argNum : this.origFgColor_;
          break;
        case "b":
          // Set background color.
          main.drawState.bgColor = arg !== "" ? argNum : this.origBgColor_;
          break;
        case "z":
          // Reset state.
          main.drawState.fgColor = this.origFgColor_;
          main.drawState.bgColor = this.origBgColor_;
          break;
        default:
          console.warn("Unknown nano8 print escape command: " + command);
      }
    }
  }, {
    key: "regenColors",
    value: function regenColors() {
      // Tell all the fonts to regenerate their glyph images.
      Object.values(this.fonts_).forEach(function (f) {
        return f.regenColors();
      });
    }
  }]);
}();

},{"../config.js":1,"../qut.js":11,"./main.js":4}],7:[function(require,module,exports){
"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setup = setup;
var qut = _interopRequireWildcard(require("../qut.js"));
var _main = require("./main.js");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
// import { CONFIG } from "../config.js";

var LEFT_VJOY_HTML = "\n\t<div id='vjoy-button-up' class='vjoy-button'></div>\n\t<div id='vjoy-button-down' class='vjoy-button'></div>\n\t<div id='vjoy-button-left' class='vjoy-button'></div>\n\t<div id='vjoy-button-right' class='vjoy-button'></div>\n";
var RIGHT_VJOY_HTML = "\n\t<div id='vjoy-button-pri' class='vjoy-button'>A</div>\n\t<div id='vjoy-button-sec' class='vjoy-button'>B</div>\n\t<div id='vjoy-button-ter' class='vjoy-button'>=</div>\n";
var VJOY_CSS = "\n\t* {\n\t\tuser-select: none;\n\t\t-webkit-user-select: none;\n\t\t-webkit-touch-callout: none;\n\t}\n\n\t#vjoy-scrim {\n\t\tposition: fixed;\n\t\tleft: 0;\n\t\tright: 0;\n\t\tbottom: 0;\n\t\ttop: 0;\n\t\tpointer-events: all;\n\t}\n\n\t#vjoy-container-left {\n\t\tbox-sizing: border-box;\n\t\tposition: fixed;\n\t\tbottom: 16px;\n\t\tleft: 16px;\n\t\twidth: 40vmin;\n\t\theight: 40vmin;\n\t\tuser-select: none;\n\t\ttouch-callout: none;\n\t\t-webkit-user-select: none;\n\t\t-webkit-touch-callout: none;\n\t}\n\n\t#vjoy-container-right {\n\t\tbox-sizing: border-box;\n\t\tposition: fixed;\n\t\tbottom: 16px;\n\t\tright: 16px;\n\t\twidth: 40vmin;\n\t\theight: 40vmin;\n\t\tuser-select: none;\n\t\ttouch-callout: none;\n\t\t-webkit-user-select: none;\n\t\t-webkit-touch-callout: none;\n\t}\n\n\t.vjoy-button {\n\t\tdisplay: flex;\n\t\tflex-direction: row;\n\t\talign-items: center;\n\t\tjustify-content: center;\n\t\tbackground: #444;\n\t\tborder: none;\n\t\tfont: bold 14px monospace;\n\t\tcolor: #888;\n\t\tuser-select: none;\n\t\ttouch-callout: none;\n\t\t-webkit-user-select: none;\n\t\t-webkit-touch-callout: none;\n\t}\n\t.vjoy-button:active {\n\t\tbackground: #888;\n\t}\n\n\t#vjoy-button-up {\n\t\tposition: absolute;\n\t\tleft: 30%;\n\t\ttop: 0px;\n\t\twidth: 40%;\n\t\theight: 45%;\n\t\tborder-radius: 0px 0px 50% 50%;\n\t}\n\n\t#vjoy-button-down {\n\t\tposition: absolute;\n\t\tleft: 30%;\n\t\tbottom: 0px;\n\t\twidth: 40%;\n\t\theight: 45%;\n\t\tborder-radius: 50% 50% 0px 0px;\n\t}\n\n\t#vjoy-button-left {\n\t\tposition: absolute;\n\t\tleft: 0px;\n\t\tbottom: 30%;\n\t\twidth: 45%;\n\t\theight: 40%;\n\t\tborder-radius: 0px 50% 50% 0px;\n\t}\n\n\t#vjoy-button-right {\n\t\tposition: absolute;\n\t\tright: 0px;\n\t\tbottom: 30%;\n\t\twidth: 45%;\n\t\theight: 40%;\n\t\tborder-radius: 50% 0px 0px 50%;\n\t}\n\n\t#vjoy-button-pri {\n\t\tposition: absolute;\n\t\tright: 0px;\n\t\ttop: 30%;\n\t\twidth: 50%;\n\t\theight: 50%;\n\t\tborder-radius: 50%;\n\t}\n\n\t#vjoy-button-sec {\n\t\tposition: absolute;\n\t\tleft: 0px;\n\t\ttop: 30%;\n\t\twidth: 50%;\n\t\theight: 50%;\n\t\tborder-radius: 50%;\n\t}\n\n\t#vjoy-button-ter {\n\t\tposition: fixed;\n\t\tright: 0px;\n\t\tbottom: 0px;\n\t\twidth: 10vw;\n\t\theight: 8vmin;\n\t\tborder-radius: 8px;\n\t\topacity: 0.5;\n\t}\n";

// Adds the virtual joystick to the screen and sets it up.
function setup() {
  qut.log("Setting up virtual joystick...");
  var styleEl = document.createElement("style");
  styleEl.setAttribute("type", "text/css");
  styleEl.innerText = VJOY_CSS;
  document.body.appendChild(styleEl);
  var scrim = document.createElement("div");
  scrim.setAttribute("id", "vjoy-scrim");
  scrim.addEventListener("touchstart", function (e) {
    return e.preventDefault();
  });
  document.body.appendChild(scrim);
  var leftContainer = document.createElement("div");
  leftContainer.setAttribute("id", "vjoy-container-left");
  leftContainer.innerHTML = LEFT_VJOY_HTML;
  document.body.appendChild(leftContainer);
  var rightContainer = document.createElement("div");
  rightContainer.setAttribute("id", "vjoy-container-right");
  rightContainer.innerHTML = RIGHT_VJOY_HTML;
  document.body.appendChild(rightContainer);
  setTimeout(continueSetup, 10);
}
function continueSetup() {
  setUpButton("vjoy-button-up", "ArrowUp");
  setUpButton("vjoy-button-down", "ArrowDown");
  setUpButton("vjoy-button-left", "ArrowLeft");
  setUpButton("vjoy-button-right", "ArrowRight");
  setUpButton("vjoy-button-pri", "ButtonA");
  setUpButton("vjoy-button-sec", "ButtonB");
  setUpButton("vjoy-button-ter", "Escape");

  // Prevent touches on the document body from doing what they usually do (opening
  // context menus, selecting stuff, etc).
  document.body.addEventListener("touchstart", function (e) {
    return e.preventDefault();
  });
}
function setUpButton(buttonId, buttonKeyName) {
  var button = qut.assert(document.getElementById(buttonId), "Could not find button ID " + buttonId);
  if (buttonKeyName === null) {
    // This means the user wants to hide the button.
    button.style.display = "none";
    return;
  }
  button.addEventListener("mousedown", function (e) {
    return handleButtonEvent(buttonKeyName, true, e);
  });
  button.addEventListener("touchstart", function (e) {
    return handleButtonEvent(buttonKeyName, true, e);
  });
  button.addEventListener("mouseup", function (e) {
    return handleButtonEvent(buttonKeyName, false, e);
  });
  button.addEventListener("touchend", function (e) {
    return handleButtonEvent(buttonKeyName, false, e);
  });
  button.addEventListener("contextmenu", function (e) {
    return e.preventDefault();
  });
}
function handleButtonEvent(buttonKeyName, down, evt) {
  if (down) {
    _main.inputSys.onKeyDown({
      key: buttonKeyName
    });
  } else {
    _main.inputSys.onKeyUp({
      key: buttonKeyName
    });
  }
  evt.preventDefault();
}

},{"../qut.js":11,"./main.js":4}],8:[function(require,module,exports){
"use strict";

require('./config.js');
require('./qut.js');
require('./nano8.js');
require('./nano8a.js');

},{"./config.js":1,"./nano8.js":9,"./nano8a.js":10,"./qut.js":11}],9:[function(require,module,exports){
"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cls = cls;
exports.col = col;
exports.color = color;
exports.cursor = cursor;
exports.drawImage = drawImage;
exports.drawImageRect = drawImageRect;
exports.drawRect = drawRect;
exports.drawText = drawText;
exports.fillRect = fillRect;
exports.frame = frame;
exports.getBgColor = getBgColor;
exports.getContext = getContext;
exports.getFgColor = getFgColor;
exports.init = init;
exports.key = key;
exports.keyp = keyp;
exports.locate = locate;
exports.measure = measure;
exports.playSound = playSound;
exports.print = print;
exports.printBox = printBox;
exports.printCentered = printCentered;
exports.printChar = printChar;
exports.printRect = printRect;
exports.redefineColors = redefineColors;
exports.render = render;
exports.restoreScreen = restoreScreen;
exports.row = row;
exports.saveScreen = saveScreen;
exports.setFont = setFont;
exports.spr = spr;
exports.stopSound = stopSound;
var main = _interopRequireWildcard(require("./internal/main.js"));
var qut = _interopRequireWildcard(require("./qut.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
/// MODULE: nano

/// Initializes the API. This must be called before other functions
/// and it must finish executing before other API functions are called.
/// Once the supplied callback is called, you can start using
/// nano8 functions.
/// callback: function
///   The callback to call when initialization is done.
function init(callback) {
  return main.init(callback);
}

// Sets the frame handler, that is, the function that will be called
// on every frame to render the screen.
// fps: the target frames per second. Recommended: 30.
function frame(handler) {
  var fps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 30;
  main.preflight("nano8.frame");
  if (handler !== null) qut.checkFunction("handler", handler);
  qut.checkNumber("fps", fps);
  return main.setFrameHandler(handler, fps);
}

/// Forces the screen to render right now. You only need this if you
/// are doing some kind of animation on your own and you want to
/// redraw the screen immediately to show the current state.
/// Otherwise the screen repaints automatically when waiting for
/// user input.
function render() {
  main.preflight("nano8.render");
  return main.render();
}

/// Sets the foreground and/or the background color.
/// fg: integer
///   The foreground color.
/// bg: integer (optional)
///   (optional) The foreground color (a number). If omitted, the current
///   background color will be kept.
function color(fg, bg) {
  main.preflight("nano8.color");
  qut.checkNumber("fg", fg);
  if (bg !== undefined) qut.checkNumber("bg", bg);
  main.setColor(fg, bg);
}

/// Returns the current foreground color.
function getFgColor() {
  main.preflight("getFgColor");
  return main.drawState.fgColor;
}

/// Returns the current background color.
/// Note that -1 means transparent.
function getBgColor() {
  main.preflight("getBgColor");
  return main.drawState.bgColor;
}

/// Clears the screen using the current background color.
function cls() {
  main.preflight("nano8.cls");
  main.cls();
}

/// Places the cursor at the given screen column and row.
/// col:
///   The column where the cursor is to be placed.
/// row:
///   (optional) The row where the cursor is to be placed. If omitted, remains
///   on the current row.
function locate(col, row) {
  main.preflight("nano8.locate");
  qut.checkNumber("col", col);
  if (row !== undefined) qut.checkNumber("row", row);
  main.setCursorLocation(col, row);
}

/// Returns the cursor's current column.
function col() {
  main.preflight("col");
  return main.drawState.cursorCol;
}

/// Returns the cursor's current row.
function row() {
  main.preflight("row");
  return main.drawState.cursorRow;
}

/// Shows or hides the cursor.
/// visible: boolean
///   If true, show the cursor. If false, hide the cursor.
function cursor(visible) {
  main.preflight("cursor");
  qut.checkBoolean("visible", visible);
  main.cursorRenderer.setCursorVisible(visible);
}

/// Prints text at the cursor position, using the current foreground and
/// background colors. This will advance the cursor position.
/// text: string
///   The text to print. This can contain embedded newlines and they will
///   behave as you expect: printing will continue at the next line.
///   If PRINT_ESCAPE_START and PRINT_ESCAPE_END are defined in CONFIG, then
///   you can also use escape sequences. For example {{c1}} sets the color to 1,
///   so your string can be "I like the color {{c1}}blue" and the word 'blue' would
///   be in blue. The sequence {{b2}} sets the background to 2 (red). The sequence
///   {{z}} resets the color to the default. See example-printing.html for an example.
function print(text) {
  main.preflight("nano8.text");
  qut.checkString("text", text);
  main.textRenderer.print(text);
}

/// Prints text centered horizontally in a field of the given width. If the text is
/// bigger than the width, it will overflow it.
/// text: string
///   The text to print.
/// width: number
///   The width of the field, in characters.
function printCentered(text, width) {
  main.preflight("nano8.printCentered");
  qut.checkString("text", text);
  qut.checkNumber("width", width);
  main.textRenderer.printCentered(text, width);
}

/// Draws text at an arbitrary pixel position on the screen, not following
/// the "row and column" system. This won't affect cursor position.
/// x: integer
///   The X coordinate of the top-left of the text.
/// y: integer
///   The Y coordinate of the top-left of the text.
/// text: string
///   The text to print. This can contain embedded newlines and they will
///   behave as you expect: printing will continue at the next line.
/// fontId: string
///   (optional) If specified, this is a font ID previously obtained with
///   nano8a.loadFont(), indicating the custom font to use to print the text.
///   If not specified, then we will use the current font as set with
///   nano8.setFont(), or the default font if that was never set.
function drawText(x, y, text) {
  var fontId = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  main.preflight("nano8.drawText");
  qut.checkNumber("x", x);
  qut.checkNumber("y", y);
  qut.checkString("text", text);
  if (fontId) qut.checkString("fontId", fontId);
  main.textRenderer.drawText(x, y, text, fontId);
}

/// Measures the size of the given text without printing it.
/// text: string
///   The text to measure.
/// return:
///   An object with {cols, rows} indicating how wide and how tall the text is,
///   expressed in rows and columns (not pixels).
function measure(text) {
  main.preflight("measure");
  qut.checkString("text", text);
  return main.textRenderer.measure(text);
}

/// Prints a character at the current cursor position using the current
/// foreground and background colors, advancing the cursor position.
/// charCode: integer | string
///   The character to print, as an integer (its ASCII code). This
///   can also be a one-character string for convenience, so 65
///   and "A" mean the same thing.
/// numTimes: integer, optional, default = 1
///   How many times to print the character. By default 1.
function printChar(charCode) {
  var numTimes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  main.preflight("nano8.printChar");
  charCode = convChar(charCode);
  qut.checkNumber("charCode", charCode);
  qut.checkNumber("numTimes", numTimes);
  main.textRenderer.printChar(charCode, numTimes);
}

/// Prints a rectangle of the given size with the given character,
/// with the current foreground and background colors,
/// starting at the current cursor position. Does not change cursor position.
/// widthCols: integer
///   Width of the rectangle in screen columns.
/// heightRows: integer
///   Height of the rectangle in screen rows.
/// charCode: integer | string (default = 32)
///   The character to print, as an integer (its ASCII code). This
///   can also be a one-character string for convenience, so 65
///   and "A" mean the same thing. By default this is 32 (space).
function printRect(widthCols, heightRows) {
  var charCode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 32;
  main.preflight("nano8.printRect");
  charCode = convChar(charCode);
  qut.checkNumber("widthCols", widthCols);
  qut.checkNumber("heightRows", heightRows);
  qut.checkNumber("charCode", charCode);
  main.textRenderer.printRect(widthCols, heightRows, charCode);
}

/// Prints a box of the given size starting at the cursor position, using
/// border-drawing characters. Does not change cursor position.
/// widthCols: integer
///   Width of the box in screen columns, including the border.
/// heightRows: integer
///   Height of the box in screen rows, including the border.
/// fill: boolean (default = true)
///   If true, will fill the interior of the box with spaces. Otherwise,
///   the interior of the box won't be printed, only the borders.
/// borderChar: integer (default = 0x80)
///   The first border-drawing character to use. Border-drawing characters
///   are assumed to start at the given character code and must be arranged
///   in this order: top-left, top-right, bottom-left, bottom-right,
///   vertical bar, horizontal bar. The default font has these characters
///   already in the right positions and order at char code 0x80.
function printBox(widthCols, heightRows) {
  var fill = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var borderChar = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0x80;
  main.preflight("nano8.printBox");
  borderChar = convChar(borderChar);
  qut.checkNumber("widthCols", widthCols);
  qut.checkNumber("heightRows", heightRows);
  qut.checkBoolean("fill", fill);
  qut.checkNumber("borderChar", borderChar);
  main.textRenderer.printBox(widthCols, heightRows, fill, borderChar);
}

/// Draws an image (previously loaded with nano8a.loadImage).
/// x: integer
///   The x coordinate (in pixels) of the point on the screen
///   where the top-left of the image will be drawn.
/// y: integer
///   The y coordinate (in pixels) of the point on the screen
///   where the top-left of the image will be drawn.
/// image: Image
///   The image to draw.
function drawImage(x, y, image) {
  qut.checkInstanceOf("image", image, HTMLImageElement);
  qut.checkNumber("x", x);
  qut.checkNumber("y", y);
  main.drawImage(image, x, y);
}

/// Draws a rectangular part of an image (previously loaded with nano8a.loadImage).
/// x: integer
///   The x coordinate (in pixels) of the point on the screen
///   where the top-left of the image will be drawn.
/// y: integer
///   The y coordinate (in pixels) of the point on the screen
///   where the top-left of the image will be drawn.
/// image: Image
///   The image to draw.
/// srcX: integer
///   The x coordinate (in pixels) of the top-left of the rectangle
///   to be drawn.
/// srcY: integer
///   The y coordinate (in pixels) of the top-left of the rectangle
///   to be drawn.
/// width: integer
///   The width in pixels of the rectangle to be drawn.
/// height: integer
///   The height in pixels of the rectangle to be drawn.
function drawImageRect(x, y, image, srcX, srcY, width, height) {
  qut.checkInstanceOf("image", image, HTMLImageElement);
  qut.checkNumber("x", x);
  qut.checkNumber("y", y);
  qut.checkNumber("srcX", srcX);
  qut.checkNumber("srcY", srcY);
  qut.checkNumber("width", width);
  qut.checkNumber("height", height);
  main.drawImage(image, x, y, srcX, srcY, width, height);
}

/// Draws a rectangle (border only). The rectangle is drawn using the
/// current foreground color.
///
/// x: integer
///   The x coordinate (in pixels) of the top-left corner of
///   the rectangle.
/// y: integer
///   The y coordinate (in pixels) of the top-left corner of
///   the rectangle.
/// width: integer
///   The width in pixels of the rectangle.
/// height: integer
///   The height in pixels of the rectangle.
function drawRect(x, y, width, height) {
  qut.checkNumber("x", x);
  qut.checkNumber("y", y);
  qut.checkNumber("width", width);
  qut.checkNumber("height", height);
  main.drawRect(x, y, width, height);
}

/// Draws a filled rectangle. The rectangle is drawn and filled
/// using the current foreground (not background!) color.
///
/// x: integer
///   The x coordinate (in pixels) of the top-left corner of
///   the rectangle.
/// y: integer
///   The y coordinate (in pixels) of the top-left corner of
///   the rectangle.
/// width: integer
///   The width in pixels of the rectangle.
/// height: integer
///   The height in pixels of the rectangle.
function fillRect(x, y, width, height) {
  qut.checkNumber("x", x);
  qut.checkNumber("y", y);
  qut.checkNumber("width", width);
  qut.checkNumber("height", height);
  main.fillRect(x, y, width, height);
}

/// Plays a sound (previously loaded with nano8a.playSound).
/// sfx: Sound
///   The sound to play.
/// volume: number (default = 1)
///   The volume to play the sound at.
/// loop: boolean (default = false)
///   Plays the sound in a loop (returns to the start after finishing)
function playSound(sfx) {
  var volume = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var loop = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  qut.checkInstanceOf("sfx", sfx, HTMLAudioElement);
  sfx.currentTime = 0;
  sfx.volume = volume;
  sfx.loop = loop;
  sfx.play();
}

/// Draws a sprite on the screen.
/// ch:
///   The character code of the sprite.
/// x:
///   The X position at which to draw (top-left).
/// y:
///   The Y position at which to draw (top-left).
function spr(ch, x, y) {
  ch = convChar(ch);
  qut.checkNumber("ch", ch);
  qut.checkNumber("x", x);
  qut.checkNumber("y", y);
  main.textRenderer.spr(ch, x, y);
}

/// Checks if the given key is currently pressed or not. This only works
/// if running in a frame handler (see the nano8.frame() function).
/// keyName: string
///   The name of the key like "A", "B", "C", "ArrowUp", etc.
///   This is just the Javascript key name as described
///   <a href="https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values">here</a>.
function key(keyName) {
  main.preflight("nano8.key");
  qut.checkString("keyName", keyName);
  return main.inputSys.keyHeld(keyName);
}

/// Checks if the given key was JUST pressed on this frame. This only works
/// if running in a frame handler (see the frame() function). When a key
/// is pressed, this function will return true for one frame, then will
/// become false afterwards even if the key is held.
/// keyName: string
///   The name of the key like "A", "B", "C", "ArrowUp", etc.
///   This is just the Javascript key name as described
///   <a href="https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values">here</a>.
function keyp(keyName) {
  main.preflight("nano8.keyp");
  qut.checkString("keyName", keyName);
  return main.inputSys.keyJustPressed(keyName);
}

/// Redefines the colors, that is, assigns new RGB values to each
/// of the integer colors. This won't change the image on the screen,
/// it only applies to newly drawn elements, so this can't be used for
/// palette animation of something that was already drawn.
/// WARNING: This is reasonably expensive, as all cached glyph images
/// must be regenerated. Don't call this often.
/// colors: array
///   An array of RGB values with the new color definitions, in the
///   same format as in the CONFIG object.
function redefineColors(colors) {
  main.preflight("nano8.redefineColors");
  qut.checkArray("colors", colors);
  main.defineColors(colors);
}

/// Sets the current font for text-based operations like nano8.print().
/// Note that the font passed must have been previously loaded with
/// nano8a.loadFont(). For use as a text font, the font's character dimensions
/// must be a multiple of CONFIG.CHR_WIDTH and CONFIG.CHR_HEIGHT, so for
/// example if you specified that your default character size is 8x8, then
/// fonts can be 8x8, 16x8, 16x16, 32x32, etc. But not 9x7 for example.
///
/// fontId: string
///   (optional) The font to set. To reset to the default font, pass null,
///   or omit the parameter.
function setFont(fontId) {
  main.preflight("nano8.setFont");
  fontId = fontId || "default";
  qut.checkString("fontId", fontId);
  main.textRenderer.setFont(fontId);
}
function convChar(charCode) {
  if (typeof charCode === "string" && charCode.length > 0) {
    return charCode.charCodeAt(0);
  }
  return charCode;
}

/// Stop a sound (previously loaded with nano8a.playSound).
/// sfx: Sound
///   The sound to stop playing.
function stopSound(sfx) {
  qut.checkInstanceOf("sfx", sfx, HTMLAudioElement);
  sfx.currentTime = 0;
  sfx.pause();
}

/// Returns the raw canvas 2D context so you can draw anything you want
/// to it. Note that this is the off-screen 2D context, so you are drawing
/// to a hidden surface and your beautiful artwork will only be visible
/// once the screen renders (either by calling nano8.render() explicitly,
/// or by calling a blocking function that causes an implicit render).
///
/// return:
///   The raw HTML 2D canvas context for your enjoyment. If you put the
///   context into an unusual state, please revert that state after you're
///   done, otherwise nano8 might get confused.
function getContext() {
  return main.getContext();
}

/// Saves the contents of the screen into an ImageData object and returns it.
/// You can later restore the screen's contents with nano8.restoreScreen.
/// An ImageData object is somewhat large, as it contains all the pixels on the screen.
/// This is no longer 1985, so you can keep several of these in memory, but
/// you shouldn't create them indiscriminately.
///
/// return:
///   An ImageData object with the screen's contents.
function saveScreen() {
  return main.saveScreen();
}

/// Restores the contents of the screen using an ImageData object obtained from a
/// previous call to nano8.saveScreen().
///
/// screenData: ImageData
///   The ImageData object obtained from a previous call to nano8.saveScreen().
function restoreScreen(screenData) {
  return main.restoreScreen(screenData);
}

},{"./internal/main.js":4,"./qut.js":11}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dialog = dialog;
exports.key = key;
exports.loadFont = loadFont;
exports.loadImage = loadImage;
exports.loadSound = loadSound;
exports.menu = menu;
exports.readLine = readLine;
exports.typewriter = typewriter;
exports.wait = wait;
var main = _interopRequireWildcard(require("./internal/main.js"));
var menuMod = _interopRequireWildcard(require("./internal/menu.js"));
var qut = _interopRequireWildcard(require("./qut.js"));
var nano8 = _interopRequireWildcard(require("./nano8.js"));
var _config = require("./config.js");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; } /// MODULE: nanoa
// ASYNC API FUNCTIONS
// These functions must be called with 'await'.
// For example:
//
//    const k = await nano8a.key();
//    console.log("The user pressed " + k);
/// Waits until the user presses a key and returns it.
/// return:
///   The name of the key that was pressed, like "A", "B",
///   "ArrowUp", etc.
///   This is just the Javascript key name as described
///   <a href="https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values">here</a>.
function key() {
  return _key.apply(this, arguments);
} /// Waits until the user inputs a line of text, then returns it.
/// initString: string (default = "")
///   The initial string presented for the user to edit.
/// maxLen: integer (default -1)
///   The maximum length of the string the user can type.
///   If this is -1, this means there is no limit.
/// maxWidth: integer (default = -1)
///   The maximum width of the input line, in characters.
///   When the user types more, the text will wrap to the next line.
///   If this is -1, this means it won't wrap at all.
function _key() {
  _key = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          main.preflight("nano8a.key");
          _context.next = 3;
          return main.inputSys.readKeyAsync();
        case 3:
          return _context.abrupt("return", _context.sent);
        case 4:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _key.apply(this, arguments);
}
function readLine() {
  return _readLine.apply(this, arguments);
} /// Shows a menu of choices and waits for the user to pick an option.
/// choices: array
///   An array of choices, for example ["Foo", "Bar", "Qux"]
/// options: Object (default = {})
///   Additional options, as a dictionary. These are the available options:
///   <ul>
///   * title: the title to show on the window
///   * prompt: the prompt to show. Can be multiple lines (use \n)
///   * selFgColor: foreground color of selected item
///   * selBgColor: background color of selected item
///   * bgChar: character to use for the background of the window
///   * borderChar: border character to use for the window
///   * centerH: if true, center the menu horizontally on the screen
///   * centerV: if true, center the menu vertically on the screen
///   * center: if true, equivalent to centerH and centerV
///   * padding: padding between window borders and contents, default 1.
///   * selIndex: initially selected index, default 0.
///   * cancelable: if true, the user can cancel the menu with ESC, in which
///   case the return value will be -1.
///   </ul>
/// return:
///   Returns the index of the item selected by the user, or -1 if the
///   menu was cancelable and the user cancelled it.
function _readLine() {
  _readLine = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
    var initString,
      maxLen,
      maxWidth,
      _args2 = arguments;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          initString = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : "";
          maxLen = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : -1;
          maxWidth = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : -1;
          main.preflight("readLine");
          qut.checkString("initString", initString);
          qut.checkNumber("maxLen", maxLen);
          _context2.next = 8;
          return main.inputSys.readLine(initString, maxLen, maxWidth);
        case 8:
          return _context2.abrupt("return", _context2.sent);
        case 9:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _readLine.apply(this, arguments);
}
function menu(_x) {
  return _menu.apply(this, arguments);
} /// Displays a dialog with the given prompt and choices.
/// This is a syntactical convenience to menu().
/// prompt: string
///   The text to show like "Error reticulating splines."
/// choices: array (default = ["OK"])
///   The choices to present to the user. If omitted, this will
///   just show "OK". You can use for example ["No","Yes"] if you
///   want the user to be able to choose one of those options to
///   confirm something.
function _menu() {
  _menu = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(choices) {
    var options,
      _args3 = arguments;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          options = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : {};
          main.preflight("menu");
          qut.checkArray("choices", choices);
          qut.checkObject("options", options);
          _context3.next = 6;
          return menuMod.menu(choices, options);
        case 6:
          return _context3.abrupt("return", _context3.sent);
        case 7:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return _menu.apply(this, arguments);
}
function dialog(_x2) {
  return _dialog.apply(this, arguments);
} /// Waits for a given number of seconds.
/// seconds: number
///   How long to wait for, in seconds.
function _dialog() {
  _dialog = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(prompt) {
    var choices,
      _args4 = arguments;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          choices = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : ["OK"];
          main.preflight("dialog");
          qut.checkString("prompt", prompt);
          qut.checkArray("choices", choices);
          return _context4.abrupt("return", menu(choices, {
            prompt: prompt,
            center: true
          }));
        case 5:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return _dialog.apply(this, arguments);
}
function wait(_x3) {
  return _wait.apply(this, arguments);
} /// Shows text slowly, character by character, as in a typewriter.
/// text: string
///   The text to print.
/// delay: number (default = 0.05)
///   How long to wait between characters, in seconds. Spaces don't
///   have delay.
function _wait() {
  _wait = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(seconds) {
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          main.preflight("wait");
          qut.checkNumber("seconds", seconds);
          nano8.render();
          _context5.next = 5;
          return new Promise(function (resolve) {
            return setTimeout(resolve, Math.round(seconds * 1000));
          });
        case 5:
        case "end":
          return _context5.stop();
      }
    }, _callee5);
  }));
  return _wait.apply(this, arguments);
}
function typewriter(_x4) {
  return _typewriter.apply(this, arguments);
} /// Loads an image from the given URL.
/// url: string
///   The URL from which to load the image. This can be a relative path
///   if the image is located on the same site. Can be a PNG or a JPG.
/// return:
///   An Image object that you can use with nano8.drawImage().
function _typewriter() {
  _typewriter = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(text) {
    var delay,
      startCol,
      startRow,
      i,
      endPos,
      c,
      _args6 = arguments;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          delay = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : 0.05;
          main.preflight("typewriter");
          qut.checkString("text", text);
          qut.checkNumber("delay", delay);
          startCol = nano8.col();
          startRow = nano8.row();
          i = 0;
        case 7:
          if (!(i <= text.length)) {
            _context6.next = 18;
            break;
          }
          // If this is the start of an escape sequence, skip to the end of it.
          if (_config.CONFIG.PRINT_ESCAPE_START && text.substring(i, i + _config.CONFIG.PRINT_ESCAPE_START.length) === _config.CONFIG.PRINT_ESCAPE_START) {
            endPos = text.indexOf(_config.CONFIG.PRINT_ESCAPE_END, i + _config.CONFIG.PRINT_ESCAPE_START.length);
            if (endPos >= 0) i = endPos + _config.CONFIG.PRINT_ESCAPE_END.length;
          }
          c = text.charCodeAt(i);
          nano8.locate(startCol, startRow);
          nano8.print(text.substring(0, i));
          if (!(c !== 32)) {
            _context6.next = 15;
            break;
          }
          _context6.next = 15;
          return wait(delay);
        case 15:
          i++;
          _context6.next = 7;
          break;
        case 18:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  }));
  return _typewriter.apply(this, arguments);
}
function loadImage(_x5) {
  return _loadImage.apply(this, arguments);
} /// Loads a sound file from the given URL.
/// url: string
///   The URL from which to load the sound. This can be a relative path
///   if the image is located on the same site. Can be a WAV or MP3.
/// return:
///   A Sound object that you can use with nano8.playSound().
function _loadImage() {
  _loadImage = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(url) {
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          main.preflight("loadImage");
          return _context7.abrupt("return", new Promise(function (resolver) {
            var img = new Image();
            img.onload = function () {
              return resolver(img);
            };
            img.src = url;
          }));
        case 2:
        case "end":
          return _context7.stop();
      }
    }, _callee7);
  }));
  return _loadImage.apply(this, arguments);
}
function loadSound(_x6) {
  return _loadSound.apply(this, arguments);
} /// Loads a font for later use in drawing text.
/// fontImageFile: string
///   The URL to an image file containing the font. This image file should be
///   a grid of the font's character laid out in a 16x16 grid. The character width
///   and height will be deduced from the image size by dividing the width and height
///   by 16, respectively. Therefore, the image's dimensions must both be a multiple of 16.
/// return:
///   A font ID that you can later use in functions that take a font like
///   nano8.setFont() and nano8.drawText().
function _loadSound() {
  _loadSound = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(url) {
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          main.preflight("loadSound");
          return _context8.abrupt("return", new Promise(function (resolver) {
            var audio = new Audio();
            audio.oncanplaythrough = function () {
              return resolver(audio);
            };
            audio.src = url;
            audio.load();
          }));
        case 2:
        case "end":
          return _context8.stop();
      }
    }, _callee8);
  }));
  return _loadSound.apply(this, arguments);
}
function loadFont(_x7) {
  return _loadFont.apply(this, arguments);
}
function _loadFont() {
  _loadFont = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(fontImageFile) {
    var fontName;
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          main.preflight("loadFont");
          qut.checkString("fontImageFile", fontImageFile);
          fontName = "FONT@" + fontImageFile;
          _context9.next = 5;
          return main.textRenderer.loadFontAsync(fontName, fontImageFile);
        case 5:
          return _context9.abrupt("return", fontName);
        case 6:
        case "end":
          return _context9.stop();
      }
    }, _callee9);
  }));
  return _loadFont.apply(this, arguments);
}

},{"./config.js":1,"./internal/main.js":4,"./internal/menu.js":5,"./nano8.js":9,"./qut.js":11}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assert = assert;
exports.assertDebug = assertDebug;
exports.assertEquals = assertEquals;
exports.checkArray = checkArray;
exports.checkBoolean = checkBoolean;
exports.checkFunction = checkFunction;
exports.checkInstanceOf = checkInstanceOf;
exports.checkNumber = checkNumber;
exports.checkObject = checkObject;
exports.checkString = checkString;
exports.checkType = checkType;
exports.clamp = clamp;
exports.dist2d = dist2d;
exports.error = void 0;
exports.fatal = fatal;
exports.intersectIntervals = intersectIntervals;
exports.intersectRects = intersectRects;
exports.loadFileAsync = loadFileAsync;
exports.loadImageAsync = loadImageAsync;
exports.log = void 0;
exports.randomInt = randomInt;
exports.randomPick = randomPick;
exports.shuffleArray = shuffleArray;
exports.warn = void 0;
var _config = require("./config.js");
var main = _interopRequireWildcard(require("./internal/main.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); } /// MODULE: qut
/// Shows a fatal error and throws an exception.
/// error: string
///   The error to show.
function fatal(error) {
  console.error("Fatal error: " + error);
  try {
    main.handleCrash(error);
  } catch (e) {
    console.error("Error in main.handleCrash: " + e + " while handling error " + error);
  }
  throw new Error("Error: " + error);
}

/// Asserts that the given condition is true, else shows a fatal error.
/// cond: boolean
///   The condition that you fervently hope will be true.
/// msg: string
///   The error message to show if the condition is false.
/// return:
///   For convenience, this function returns the 'cond' parameter.
function assert(cond, msg) {
  if (!cond) fatal(msg || "Assertion Failed");
  return cond;
}

/// Same as qut.assert() but only asserts if CONFIG.DEBUG is true.
/// cond: boolean
///   The condition that you fervently hope will be true.
/// msg: string
///   The error message to show if the condition is false.
function assertDebug(cond, msg) {
  if (!cond) {
    if (_config.CONFIG.DEBUG) {
      warn("DEBUG ASSERT failed: " + msg);
    } else {
      fatal(msg);
    }
  }
  return cond;
}

/// Asserts that two values are equal.
/// expected: any
///   What you expect the value to be.
/// actual: any
///   What the value actually is.
/// what: string
///   A description of what the value is, like "dragon's position",
///   "magician's spell state" or something like that.
function assertEquals(expected, actual, what) {
  if (expected !== actual) {
    fatal("".concat(what, ": expected ").concat(expected, " but got ").concat(actual));
  }
  return actual;
}

/// Checks the type of something and throws an exception if
/// it's in the incorrect type. You can also use the convenience
/// functions qut.checkNumber(), qut.checkString() etc as those
/// are more practical to use.
/// varName: string
///   The name of the variable, like "levelName" or something.
/// varValue: any
///   The value of the variable.
/// varType:
///   The expected type of the variable like "string".
function checkType(varName, varValue, varType) {
  assert(varName, "checkType: varName must be provided.");
  assert(varType, "checkType: varType must be provided.");
  assert(_typeof(varValue) === varType, "".concat(varName, " should be of type ").concat(varType, " but was ").concat(_typeof(varValue), ": ").concat(varValue));
  return varValue;
}

/// Checks that something you expect to be a number actually is a number,
/// and throws an exception otherwise. This also considers it an error
/// if the value is NaN.
/// varName: string
///   The name of the variable.
/// varValue: any
///   The value of the variable.
/// optMin: integer (optional)
///   If present, this is the minimum acceptable value for the variable.
/// optMax: integer (optional)
///   If present, this is the maximum acceptable value for the variable.
function checkNumber(varName, varValue, optMin, optMax) {
  checkType(varName, varValue, "number");
  if (isNaN(varValue)) {
    fatal("".concat(varName, " should be a number but is NaN"));
  }
  if (!isFinite(varValue)) {
    fatal("".concat(varName, " should be a number but is infinite: ").concat(varValue));
  }
  if (optMin !== undefined) {
    assert(varValue >= optMin, "".concat(varName, " should be >= ").concat(optMin, " but is ").concat(varValue));
  }
  if (optMax !== undefined) {
    assert(varValue <= optMax, "".concat(varName, " should be <= ").concat(optMax, " but is ").concat(varValue));
  }
  return varValue;
}

/// Checks that a variable is a string, throwing an exception otherwise.
/// varName: string
///   The name of the variable.
/// varValue: any
///   The value of the variable.
function checkString(varName, varValue) {
  return checkType(varName, varValue, "string");
}

/// Checks that a variable is a boolean, throwing an exception otherwise.
/// varName: string
///   The name of the variable.
/// varValue: any
///   The value of the variable.
function checkBoolean(varName, varValue) {
  return checkType(varName, varValue, "boolean");
}

/// Checks that a variable is a function, throwing an exception otherwise.
/// varName: string
///   The name of the variable.
/// varValue: any
///   The value of the variable.
function checkFunction(varName, varValue) {
  return checkType(varName, varValue, "function");
}

/// Checks that a variable is an object, throwing an exception otherwise.
/// Also throws an error if the value is null.
/// varName: string
///   The name of the variable.
/// varValue: any
///   The value of the variable.
function checkObject(varName, varValue) {
  if (varValue === null) {
    // null is an "object" but we don't want that.
    fatal("".concat(varName, " should be an object, but was null"));
  }
  return checkType(varName, varValue, "object");
}

/// Checks that a variable is an instance of a given class,
/// throwing an exception otherwise.
/// varName: string
///   The name of the variable.
/// varValue: any
///   The value of the variable.
/// expectedClass: type
///   The expected class. This is the actual class, not a string
///   with the class name.
function checkInstanceOf(varName, varValue, expectedClass) {
  assert(varValue instanceof expectedClass, "".concat(varName, " should be an instance of ").concat(expectedClass, " but was not, it's: ").concat(varValue));
  return varValue;
}

/// Checks that a variable is an array, throwing an exception otherwise.
/// varName: string
///   The name of the variable.
/// varValue: any
///   The value of the variable.
function checkArray(varName, varValue) {
  assert(Array.isArray(varValue), "".concat(varName, " should be an array, but was: ").concat(varValue));
  return varValue;
}

/// Prints a log to the Javascript console if CONFIG.DEBUG is true.
/// msg:
///   The message to print.
//DOC-PSEUDO-DECL:export function log(msg) {
var log = exports.log = _config.CONFIG.DEBUG ? console.log : function () {};

/// Prints a warning to the Javascript console.
/// msg:
///   The message to print.
//DOC-PSEUDO-DECL:export function warn(msg) {
var warn = exports.warn = console.warn;

/// Prints an error to the Javascript console.
/// msg:
///   The message to print.
//DOC-PSEUDO-DECL:export function error(msg) {
var error = exports.error = console.error;
function loadImageAsync(_x) {
  return _loadImageAsync.apply(this, arguments);
}
function _loadImageAsync() {
  _loadImageAsync = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(src) {
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          return _context.abrupt("return", new Promise(function (resolver) {
            var img = new Image();
            img.onload = function () {
              return resolver(img);
            };
            img.src = src;
          }));
        case 1:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _loadImageAsync.apply(this, arguments);
}
function loadFileAsync(url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.sta;
    xhr.addEventListener("load", function () {
      if (xhr.status < 200 || xhr.status > 299) {
        reject("HTTP request finished with status " + xhr.status);
      } else {
        resolve(xhr.responseText);
      }
    });
    xhr.addEventListener("error", function (e) {
      return reject(e);
    });
    xhr.open("GET", url);
    xhr.send();
  });
}

/// Clamps a number, ensuring it's between a minimum and a maximum.
/// x: number
///   The number to clamp.
/// lo: number
///   The minimum.
/// hi: number
///   The maximum.
/// return:
///   The clamped number.
function clamp(x, lo, hi) {
  return Math.min(Math.max(x, lo), hi);
}

/// Returns a random integer in the given closed interval.
/// lowInclusive: integer
///   The minimum (inclusive).
/// highInclusive: integer
///   The maximum (inclusive).
function randomInt(lowInclusive, highInclusive) {
  checkNumber("lowInclusive", lowInclusive);
  checkNumber("highInclusive", highInclusive);
  lowInclusive = Math.round(lowInclusive);
  highInclusive = Math.round(highInclusive);
  if (highInclusive <= lowInclusive) return lowInclusive;
  return clamp(Math.floor(Math.random() * (highInclusive - lowInclusive + 1)) + lowInclusive, lowInclusive, highInclusive);
}

/// Returns a randomly picked element of the given array.
/// array: array
///   The array to pick from.
/// return:
///   A randomly picked element of the given array, or null if
///   the array is empty.
function randomPick(array) {
  checkArray("array", array);
  return array.length > 0 ? array[randomInt(0, array.length - 1)] : null;
}

/// Shuffles an array, that is, randomly reorder the elements.
/// Does not modify the original array. Returns the shuffled array.
/// array: array
///   The array to shuffle.
/// return:
///   The shuffled array.
function shuffleArray(array) {
  checkArray("array", array);
  array = array.slice();
  for (var i = 0; i < array.length; i++) {
    var j = randomInt(0, array.length - 1);
    var tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
  return array;
}

/// Calculates a 2D distance between points (x0, y0) and (x1, y1).
function dist2d(x0, y0, x1, y1) {
  checkNumber("x0", x0);
  checkNumber("y0", y0);
  checkNumber("x1", x1);
  checkNumber("y1", y1);
  var dx = x0 - x1;
  var dy = y0 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/// Calculates the intersection between two integer number intervals
/// [as, ae] and [bs, be], both endpoints are inclusive.
/// as: number
///   The start of the first interval, inclusive.
/// ae: number
///   The end of the first interval, inclusive.
/// bs: number
///   The start of the second interval, inclusive.
/// be: number
///   The end of the second interval, inclusive.
/// result: Object (default = null)
///   If provided, this is used to return the intersection (see below).
/// return:
///   If there is an intersection, returns true. If there is no
///   intersection (the segments don't overlap), returns false.
///   If this returns true and a 'result' object was provided, then
///   result.start is set to the interval's start, and result.end
///   is set to the interval's end.
function intersectIntervals(as, ae, bs, be) {
  var result = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  checkNumber("as", as);
  checkNumber("ae", ae);
  checkNumber("bs", bs);
  checkNumber("be", be);
  if (result) checkObject("result", result);
  var start = Math.max(as, bs);
  var end = Math.min(ae, be);
  if (end >= start) {
    if (result) {
      result.start = start;
      result.end = end;
    }
    return true;
  }
  return false;
}

/// Calculates the intersection of two rectangles.
/// r1: Rectangle
///   A rectangle, an object with {x,y,w,h}.
/// r2: Rectangle
///   The other rectangle, an object with {x,y,w,h}.
/// dx1: number (default = 0)
///   The delta X to add to the first rectangle for the purposes of
///   the calculation.
/// dy1: number (default = 0)
///   The delta Y to add to the first rectangle for the purposes of
///   the calculation.
/// dx2: number (default = 0)
///   The delta X to add to the second rectangle for the purposes of
///   the calculation.
/// dy2: number (default = 0)
///   The delta Y to add to the second rectangle for the purposes of
///   the calculation.
/// result: object (default = null)
///   If provided, this is used to return the intersection information
///   (see below).
/// return:
///   Returns true if there is a non-empty intersection, false if there
///   isn't. If this returns true and the 'result' object was provided,
///   then sets result.x, result.y, result.w, result.h to represent
///   the intersection rectangle.
function intersectRects(r1, r2) {
  var dx1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var dy1 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var dx2 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  var dy2 = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
  var result = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
  checkObject("r1", r1);
  checkObject("r2", r2);
  checkNumber("r1.x", r1.x);
  checkNumber("r1.y", r1.y);
  checkNumber("r1.w", r1.w);
  checkNumber("r1.h", r1.h);
  checkNumber("r2.x", r2.x);
  checkNumber("r2.y", r2.y);
  checkNumber("r2.w", r2.w);
  checkNumber("r2.h", r2.h);
  checkNumber("dx1", dx1);
  checkNumber("dx2", dx2);
  checkNumber("dy1", dy1);
  checkNumber("dy2", dy2);
  if (result) checkObject("result", result);
  var xint = intersectRects_xint;
  var yint = intersectRects_yint;
  if (!intersectIntervals(r1.x + dx1, r1.x + dx1 + r1.w - 1, r2.x + dx2, r2.x + dx2 + r2.w - 1, xint)) return false;
  if (!intersectIntervals(r1.y + dy1, r1.y + dy1 + r1.h - 1, r2.y + dy2, r2.y + dy2 + r2.h - 1, yint)) return false;
  if (result) {
    result.x = xint.start;
    result.w = xint.end - xint.start + 1;
    result.y = yint.start;
    result.h = yint.end - yint.start + 1;
  }
  return true;
}
var intersectRects_xint = {};
var intersectRects_yint = {};

},{"./config.js":1,"./internal/main.js":4}]},{},[8]);
