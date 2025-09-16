# Beep8 Retro Game Engine

[Beep8](https://beep8.com/) is a tiny JavaScript game engine for creating retro-style games in the browser.
It’s inspired by 8-bit computers of the 1980s, but built with modern web tech.

Beep8 is not an emulator or a locked-down fantasy console. It’s a lightweight JavaScript library that gives you the tools of a retro engine while keeping the freedom of the open web.

✅ Open source
✅ Runs in any browser
✅ Simple API
✅ No external plugins or assets required

---

## Features

* **Built-in music** – generate chiptune tracks directly in the browser.
* **Sound effects** – 100+ zzfx sounds included, plus the ability to design your own.
* **Tilemaps** – define maps in JSON or ASCII formats, or use the [map editor](https://beep8.com/tools/beep8-map-editor/).
* **Fonts & graphics** – retro textmode fonts and tiles included, or create your own with the [textmode art editor](https://beep8.com/tools/beep8-textmode-editor/).
* **Input handling** – unified keyboard + touch controls.
* **Utilities** – inventory, menus, passcodes, ECS, particles, and more.

See the [full feature list](https://beep8.com/) and try the [examples](https://beep8.com/examples/).

---

## Getting Started

Download the files in `dist` and `assets` - these are all you need to run Beep8.

```html
<script src="dist/beep8.js"></script>
<script>
	beep8.init();
	// your game code here
</script>
```

To develop Beep8 locally:

```bash
npm install
npm run dev   # builds dist/beep8.js and watches for changes
npm run build # builds everything for release
```

---

## Documentation

Full documentation, examples, and tools are available at:
👉 [Comprehensive Docs](https://beep8.com/docs/)
👉 [Code Examples](https://beep8.com/examples/)
👉 [Textmode Art Editor](https://beep8.com/tools/beep8-textmode-editor/)
👉 [Map Maker](https://beep8.com/tools/beep8-map-editor/)
👉 [Example Games](https://beepmini.com/games/)

---

## Inspired by QX82

Beep8 is a fork of the [QX82](https://github.com/btco/qx82) engine by btco.
For more background, check out the [QX82 site](https://btco.github.io/qx82).

---

## License

Beep8 is free and open source, released under the [MIT License](LICENSE).
