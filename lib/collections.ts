import { promises as fs } from "node:fs";
import path from "node:path";
import type { TileCoord } from "@/lib/store";
import { DEFAULT_TEXTURE_PLACE, type TexturePlaceId } from "@/lib/textures";

export interface CollectionMap {
  schemaVersion: 1;
  id: string;
  name: string;
  description?: string;
  author: {
    name: string;
    github: string;
  };
  createdAt: string;
  location: TexturePlaceId;
  gridSize: number;
  tags?: string[];
  map: TileCoord[][];
}

const MAPS_DIR = path.join(process.cwd(), "collections", "maps");
const isSafeMapId = (id: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);

const isValidTile = (tile: unknown): tile is TileCoord => {
  if (!Array.isArray(tile) || (tile.length !== 2 && tile.length !== 3)) {
    return false;
  }

  const [row, col, realm] = tile;
  if (!Number.isInteger(row) || row < 0) return false;
  if (!Number.isInteger(col) || col < 0) return false;
  if (
    realm !== undefined &&
    realm !== "shire" &&
    realm !== "gondor" &&
    realm !== "mordor" &&
    realm !== "lothlorien" &&
    realm !== "rohan" &&
    realm !== "moria" &&
    realm !== "rivendell"
  ) {
    return false;
  }

  return true;
};

const isValidMap = (input: unknown): input is TileCoord[][] => {
  if (!Array.isArray(input)) return false;
  for (const row of input) {
    if (!Array.isArray(row)) return false;
    for (const tile of row) {
      if (!isValidTile(tile)) return false;
    }
  }
  return true;
};

const toCollectionMap = (input: unknown): CollectionMap | null => {
  if (!input || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;

  if (record.schemaVersion !== 1) return null;
  if (typeof record.id !== "string") return null;
  if (typeof record.name !== "string") return null;
  if (typeof record.createdAt !== "string") return null;
  if (!Number.isInteger(record.gridSize)) return null;

  const location =
    typeof record.location === "string" ? record.location : DEFAULT_TEXTURE_PLACE;
  const allowedLocations = new Set([
    "shire",
    "gondor",
    "mordor",
    "lothlorien",
    "rohan",
    "moria",
    "rivendell",
    "mixed",
  ]);
  if (!allowedLocations.has(location)) return null;

  const author = record.author;
  if (!author || typeof author !== "object") return null;
  const authorRec = author as Record<string, unknown>;
  if (typeof authorRec.name !== "string" || typeof authorRec.github !== "string") {
    return null;
  }

  if (!isValidMap(record.map)) return null;
  const gridSize = record.gridSize as number;

  return {
    schemaVersion: 1,
    id: record.id,
    name: record.name,
    description:
      typeof record.description === "string" ? record.description : undefined,
    author: {
      name: authorRec.name,
      github: authorRec.github,
    },
    createdAt: record.createdAt,
    gridSize,
    location: location as TexturePlaceId,
    tags:
      Array.isArray(record.tags) && record.tags.every((tag) => typeof tag === "string")
        ? (record.tags as string[])
        : undefined,
    map: record.map,
  };
};

export async function getCollectionMaps(): Promise<CollectionMap[]> {
  const entries = await fs.readdir(MAPS_DIR, { withFileTypes: true }).catch(() => []);

  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const maps = await Promise.all(
    files.map(async (fileName) => {
      const filePath = path.join(MAPS_DIR, fileName);
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      return toCollectionMap(parsed);
    }),
  );

  return maps.filter((m): m is CollectionMap => Boolean(m));
}

export async function getCollectionMapById(
  id: string,
): Promise<CollectionMap | null> {
  if (!isSafeMapId(id)) return null;

  try {
    const directPath = path.join(MAPS_DIR, `${id}.json`);
    const directRaw = await fs.readFile(directPath, "utf8").catch(() => null);
    if (directRaw) {
      const parsed = JSON.parse(directRaw) as unknown;
      const directMap = toCollectionMap(parsed);
      if (directMap) return directMap;
    }

    const entries = await fs.readdir(MAPS_DIR, { withFileTypes: true });
    const jsonFiles = entries.filter(
      (entry) => entry.isFile() && entry.name.endsWith(".json"),
    );

    for (const entry of jsonFiles) {
      const filePath = path.join(MAPS_DIR, entry.name);
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      const map = toCollectionMap(parsed);
      if (map && map.id === id) {
        return map;
      }
    }

    return null;
  } catch {
    return null;
  }
}
