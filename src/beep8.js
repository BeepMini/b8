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

/**
 * An example project structure.
 *
 * const playGame = {
 *   init: () => { }
 *   update: async ( dt ) => { }
 *   render: () => { }
 * }
 *
 * window.addEventListener( "load", () => {
 *   beep8.init( async () => {
 *     // A function to run after everything loads.
 *     beep8.Scene.add( 'game', playGame, 30 );
 *     beep8.Scene.set( 'game' );
 *   } );
 * } );
 */

/**
 * Things to note:
 *
 * By default tiles are 12×12 pixels.
 * Coordinates (x, y) are pixels from the top-left.
 * Text grid uses (col, row) in 12×12 tile units.
 * All text widths (maxWidth, widthCols, heightRows) are in columns/rows, not pixels.
 * Time: dt and durations are in seconds. Core.getNow() returns seconds.
 * Fonts: fontName is the name passed to TextRenderer.loadFontAsync.
 * Public API is beep8.* and beep8.Async.*; arguments are validated.
 * Actors have animations; tiles do not.
 * ECS locations and queries use tile coordinates (col, row).
 * setTile origin: locate(col,row) offsets draw*, and print* by tile origin.
 * Actor ids go from 1 to 20. Animations include idle, move-left, move-right, move-up, move-down.
 * Useful tile ids 0 = blank, 1 = solid, 330 = wall, 206 = water, 268 = fire, 182 = tree, 352 = crate, 256 = gem.
 * Handy color ids: 0 = black, 5=blue, 8=red, 10=yellow, 12=green, 15 = white.
 * A and B buttons are mapped to ButtonA and ButtonB keys (eg keydown('ButtonA')).
 * Prefer the ECS over global variables where possible/ sensible.
 * ECS ids are ints returned from beep8.ECS.create.
 */

const beep8 = {};

