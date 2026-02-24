<div align="center">
  <img src="public/logo.png" alt="Iso Middle Earth Logo" width="180" />
  <h1>Iso Middle Earth</h1>
  <p><strong>An isometric Middle-earth builder for crafting maps across multiple realms, tile by tile.</strong></p>

  <p>
    <a href="#features">Features</a> •
    <a href="#demo">Demo</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#usage">Usage</a> •
    <a href="#json-format">JSON Format</a> •
    <a href="#collections">Collections</a> •
    <a href="#tech-stack">Tech Stack</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm&logoColor=white" alt="pnpm" />
    <img src="https://img.shields.io/github/license/hasanharman/isomiddleearth" alt="License" />
  </p>
</div>

## Demo

![Iso Middle Earth Preview](public/demo.png)

Live: [isomiddleearth.vercel.app](https://isomiddleearth.vercel.app/)

## Features

- Isometric canvas with hover preview
- 7 realms: `shire`, `gondor`, `mordor`, `lothlorien`, `rohan`, `moria`, `rivendell`
- `mixed` mode for cross-realm builds
- Adjustable grid size from `3x3` to `20x20`
- 6 grouped tile categories: Terrain, Water & Bridges, Trees & Vegetation, Dwellings, Buildings, Decorations
- Asset picker tabs for `Buildings` and `Characters`
- Character overlays (currently includes 8 Hobbit sprites)
- Paint with click/drag, right-click to clear
- Undo support (`Cmd/Ctrl + Z`)
- PNG export
- JSON export/import from the toolbar
- Community collections browser at `/collections` with pagination
- Deep-link loading with `/?collection=<id>`
- Persisted local state via Zustand (`localStorage`)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 9+

### Installation

```bash
git clone https://github.com/hasanharman/isomiddleearth.git
cd isomiddleearth
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Pick a realm (or `Mixed`) from the top location selector.
2. Choose an asset tab in the bottom bar:
   - `Buildings` to place terrain/building tiles
   - `Characters` to place character overlays
3. Click or drag to paint.
4. Right-click to clear (character clears first if present on that tile).
5. Use toolbar actions for undo, grid resize, PNG export, and JSON export/import.

## JSON Format

Toolbar JSON import/export expects this shape:

```json
{
  "schemaVersion": 1,
  "id": "my-map",
  "name": "My Map",
  "author": {
    "name": "Anonymous",
    "github": "your-github-username"
  },
  "createdAt": "2026-02-24T00:00:00.000Z",
  "location": "mixed",
  "gridSize": 7,
  "map": [
    [[0, 0, "shire"], [2, 4, "gondor"]],
    [[1, 6, "mordor"], [3, 2, "rivendell"]]
  ]
}
```

Notes:
- `map` tiles can be `[row, col]` or `[row, col, realm]`
- `row` and `col` are non-negative integers
- `gridSize` must be between `3` and `20`
- current JSON import/export is tile-map based (character overlays are not part of this format yet)

## Tile and Character Assets

- Tile source: `public/tiles/<realm>/r<row>-c<col>.png`
- Character source: `public/characters/<character-realm>/<character-id>.png`
- Sprite canvas size: `130x230`
- Isometric tile footprint on canvas: `128x64`

You can add new tile coordinates with any non-negative `row`/`col`; runtime falls back to `r0-c0` if a specific tile image is missing.

## Collections

Community maps live in `collections/maps` and are listed at `/collections`.

- API endpoint: `GET /api/collections/:id`
- Schema: `collections/schema/map.schema.json`
- Docs: `collections/README.md`
- Validation script:

```bash
pnpm validate:collections
```

To load a collection directly in the editor:

- `/?collection=<map-id>`

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Zustand
- Tailwind CSS
- Radix UI / shadcn components

## Contributing

Issues and pull requests are welcome: [hasanharman/isomiddleearth](https://github.com/hasanharman/isomiddleearth)
