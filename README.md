# ABCD Editor

> **A**pple, **B**anana, **C**at, **D**og — a lightweight, offline game level editor.

ABCD Editor is a single-file, zero-install web app for designing 2D tile-based game levels. It runs entirely in your browser — no server, no build step, no internet required. Perfect for iPad on long flights.

## Features

- **32×32 pixel tile grid** — click to place, click again to erase
- **Custom materials** — add your own materials with name, physics type, and color
- **Physics types** — Static, Rigidbody, Trigger, Kinematic, None
- **Multi-level projects** — manage multiple levels like slides in PowerPoint
- **Level thumbnails** — visual preview of each level
- **Duplicate / rename / delete** levels
- **Adjustable canvas size** — any width/height, auto-snapped to 32px grid
- **Offline-first** — one HTML file, no dependencies, no network needed
- **Touch-friendly** — works great on iPad with finger or Apple Pencil
- **Save as text** — copy/paste JSON to save and load projects (`.abcd` format)

## Quick Start

1. Download `dist/abcd-editor.html`
2. Open it in any modern browser (Safari, Chrome, Firefox, Edge)
3. Start designing levels!

### On iPad

1. Transfer `abcd-editor.html` to your iPad (AirDrop, email, Files app, etc.)
2. Open it in Safari or a compatible HTML viewer app
3. Optional: tap Share → "Add to Home Screen" for a fullscreen app-like experience

## Usage

### Placing Blocks

1. Select a material from the left sidebar
2. Click or tap on the grid to place a block
3. Click or tap an existing block to erase it
4. Drag to paint multiple blocks at once

### Adding Materials

1. Enter a material name (e.g., "wood")
2. Choose a physics type
3. Pick a color from presets or enter a hex code
4. Click "Add Material"

### Managing Levels

- **+ Add** — create a new empty level
- **Dup** — duplicate the current level
- **×** — delete a level (at least one must remain)
- Click a level thumbnail to switch to it
- Click the level name to rename it

### Saving & Loading

- **Save** — copies the entire project as JSON text. Paste it into a note or text file to save.
- **Load** — paste previously saved `.abcd` JSON text to restore a project.

## File Format (`.abcd`)

Projects are saved as JSON with this structure:

```json
{
  "version": 3,
  "name": "ABCD Project",
  "pixelSize": 32,
  "selectedMaterial": "stone",
  "currentLevelId": "level_1",
  "materials": [
    { "id": "stone", "name": "stone", "color": "#7f8c8d", "physics": "static" },
    { "id": "lava", "name": "lava", "color": "#e74c3c", "physics": "trigger" },
    { "id": "spawn", "name": "spawn", "color": "#2ecc71", "physics": "none" }
  ],
  "levels": [
    {
      "id": "level_1",
      "name": "Level 1",
      "width": 640,
      "height": 640,
      "grid": [
        [null, null, "stone", ...],
        ...
      ]
    }
  ]
}
```

The `grid` is a 2D array where each cell is either `null` (empty) or a material ID string.

## Default Materials

| Material | Physics  | Color     |
|----------|----------|-----------|
| stone    | static   | #7f8c8d   |
| lava     | trigger  | #e74c3c   |
| spawn    | none     | #2ecc71   |

## Development

The project is organized as:

```
abcd-editor/
├── dist/
│   └── abcd-editor.html    # Single-file build (ready to use)
├── src/
│   ├── index.html          # HTML structure
│   ├── css/
│   │   └── style.css       # Styles
│   └── js/
│       ├── materials.js    # Material registry
│       ├── grid.js         # Grid rendering & interaction
│       ├── levels.js       # Multi-level management
│       ├── storage.js      # Save/load (JSON format)
│       └── app.js          # UI controller
└── README.md
```

To build the single-file version, concatenate all source files into one HTML file. The `dist/abcd-editor.html` is the pre-built single-file version.

## License

MIT
