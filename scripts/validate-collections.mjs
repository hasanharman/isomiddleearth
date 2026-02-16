#!/usr/bin/env node

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const MAPS_DIR = path.join(ROOT, "collections", "maps");

const REALMS = new Set([
  "shire",
  "gondor",
  "mordor",
  "lothlorien",
  "rohan",
  "moria",
  "rivendell",
]);
const LOCATIONS = new Set([...REALMS, "mixed"]);

const fail = (message) => {
  console.error(`✗ ${message}`);
  process.exitCode = 1;
};

const isPlainObject = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isIsoDate = (value) => {
  if (typeof value !== "string") return false;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return false;
  return new Date(timestamp).toISOString() === value;
};

const validateTile = (tile, filePath, rowIndex, colIndex, location) => {
  if (!Array.isArray(tile) || (tile.length !== 2 && tile.length !== 3)) {
    fail(`${filePath}: map[${rowIndex}][${colIndex}] must be [row,col] or [row,col,realm].`);
    return;
  }

  const [row, col, realm] = tile;
  if (!Number.isInteger(row) || row < 0 || row > 5) {
    fail(`${filePath}: map[${rowIndex}][${colIndex}][0] must be integer 0..5.`);
  }
  if (!Number.isInteger(col) || col < 0 || col > 11) {
    fail(`${filePath}: map[${rowIndex}][${colIndex}][1] must be integer 0..11.`);
  }

  if (realm !== undefined && !REALMS.has(realm)) {
    fail(`${filePath}: map[${rowIndex}][${colIndex}][2] has invalid realm '${realm}'.`);
  }

  if (location !== "mixed" && realm !== undefined) {
    fail(`${filePath}: non-mixed location must not include per-tile realm values.`);
  }
};

const validateMapFile = (filePath, data, seenIds) => {
  const required = [
    "schemaVersion",
    "id",
    "name",
    "author",
    "createdAt",
    "gridSize",
    "location",
    "map",
  ];

  if (!isPlainObject(data)) {
    fail(`${filePath}: JSON root must be an object.`);
    return;
  }

  for (const key of required) {
    if (!(key in data)) {
      fail(`${filePath}: missing required field '${key}'.`);
    }
  }

  if (data.schemaVersion !== 1) {
    fail(`${filePath}: schemaVersion must be 1.`);
  }

  if (typeof data.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.id)) {
    fail(`${filePath}: id must be kebab-case (a-z, 0-9, hyphens).`);
  }

  if (seenIds.has(data.id)) {
    fail(`${filePath}: duplicate id '${data.id}'.`);
  }
  seenIds.add(data.id);

  const expectedFilename = `${data.id}.json`;
  const actualFilename = path.basename(filePath);
  if (expectedFilename !== actualFilename) {
    fail(`${filePath}: filename must match id (${expectedFilename}).`);
  }

  if (typeof data.name !== "string" || data.name.trim().length === 0) {
    fail(`${filePath}: name must be a non-empty string.`);
  }

  if (!isPlainObject(data.author)) {
    fail(`${filePath}: author must be an object.`);
  } else {
    if (typeof data.author.name !== "string" || data.author.name.trim().length === 0) {
      fail(`${filePath}: author.name must be a non-empty string.`);
    }
    if (
      typeof data.author.github !== "string" ||
      !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(data.author.github)
    ) {
      fail(`${filePath}: author.github must be a valid GitHub username.`);
    }
  }

  if (!isIsoDate(data.createdAt)) {
    fail(`${filePath}: createdAt must be an ISO-8601 UTC timestamp.`);
  }

  if (!Number.isInteger(data.gridSize) || data.gridSize < 3 || data.gridSize > 20) {
    fail(`${filePath}: gridSize must be an integer from 3 to 20.`);
  }

  if (!LOCATIONS.has(data.location)) {
    fail(`${filePath}: location must be one of ${Array.from(LOCATIONS).join(", ")}.`);
  }

  if (!Array.isArray(data.map) || data.map.length !== data.gridSize) {
    fail(`${filePath}: map must be an array with ${data.gridSize} rows.`);
    return;
  }

  for (let rowIndex = 0; rowIndex < data.map.length; rowIndex += 1) {
    const row = data.map[rowIndex];
    if (!Array.isArray(row) || row.length !== data.gridSize) {
      fail(`${filePath}: map row ${rowIndex} must have ${data.gridSize} tiles.`);
      continue;
    }

    for (let colIndex = 0; colIndex < row.length; colIndex += 1) {
      validateTile(row[colIndex], filePath, rowIndex, colIndex, data.location);
    }
  }
};

const readMapFiles = async () => {
  const dirStats = await stat(MAPS_DIR).catch(() => null);
  if (!dirStats || !dirStats.isDirectory()) {
    fail(`Missing directory: ${path.relative(ROOT, MAPS_DIR)}`);
    return [];
  }

  const entries = await readdir(MAPS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(MAPS_DIR, entry.name));
};

const main = async () => {
  const files = await readMapFiles();
  if (files.length === 0) {
    console.log("No collection maps found. Nothing to validate.");
    return;
  }

  const seenIds = new Set();

  for (const filePath of files) {
    const relativePath = path.relative(ROOT, filePath);
    const raw = await readFile(filePath, "utf8");

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      fail(`${relativePath}: invalid JSON.`);
      continue;
    }

    validateMapFile(relativePath, parsed, seenIds);
  }

  if (process.exitCode && process.exitCode !== 0) {
    return;
  }

  console.log(`✓ Validated ${files.length} collection map file(s).`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
