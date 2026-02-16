<div align="center">
  <img src="https://raw.githubusercontent.com/hasanharman/isomiddleearth/main/public/logo.png" alt="Iso Middle Earth Logo" width="180" />
  <h1>Iso Middle Earth</h1>
  <p><strong>An isometric Middle-earth builder — craft your own realm, tile by tile.</strong></p>

  <p>
    <a href="#features">Features</a> •
    <a href="#demo">Demo</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#usage">Usage</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#contributing">Contributing</a> •
    <a href="#sponsor">Sponsor</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/pnpm-latest-F69220?logo=pnpm&logoColor=white" alt="pnpm" />
    <img src="https://img.shields.io/github/license/hasanharman/isomiddleearth" alt="License" />
  </p>
</div>

---

## Demo

<!-- Replace with your own screenshot or GIF -->
![Iso Middle Earth Preview](https://raw.githubusercontent.com/hasanharman/isomiddleearth/main/public/logo.png)

> 🌐 **Live:** [isomiddleearth.vercel.app](https://isomiddleearth.vercel.app/)

---

## Features

| Feature | Description |
|---|---|
| 🗺️ **Isometric Canvas** | Place tiles on a beautiful isometric grid with hover preview |
| 📐 **Adjustable Grid Size** | Resize from 3×3 up to 20×20 via a slider |
| 🎨 **72 Themed Tiles** | 6 groups — Terrain, Water & Bridges, Trees & Vegetation, Dwellings, Buildings, Decorations |
| 💾 **Save & Load** | Persist your builds to localStorage via Zustand — name, save, and restore anytime |
| 📸 **Export as PNG** | One-click download of your creation as a clean PNG image |
| 🖱️ **Click & Drag** | Paint tiles by holding the mouse — right-click to erase |
| 🧩 **Grouped Tile Picker** | Bottom toolbar with labeled groups, horizontal scroll, and tooltips |

---

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) 18+
* [pnpm](https://pnpm.io/) 9+

### Installation

```bash
# Clone the repo
git clone https://github.com/hasanharman/isomiddleearth.git
cd isomiddleearth

# Install dependencies
pnpm install

# Start dev server
pnpm dev
