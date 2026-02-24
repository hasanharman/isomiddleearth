"use client";

import { useEffect, useRef } from "react";
import { useMapStore } from "@/lib/store";
import type { TileCoord } from "@/lib/store";
import type { TexturePlaceId } from "@/lib/textures";

type CollectionSnapshot = {
  map: unknown;
  gridSize: unknown;
  location: unknown;
};

const REALMS = new Set<string>([
  "shire",
  "gondor",
  "mordor",
  "lothlorien",
  "rohan",
  "moria",
  "rivendell",
]);
const LOCATIONS = new Set<string>([...REALMS, "mixed"]);

const isTile = (value: unknown): value is [number, number, string?] => {
  if (!Array.isArray(value) || (value.length !== 2 && value.length !== 3)) {
    return false;
  }
  const [row, col, realm] = value;
  if (!Number.isInteger(row) || row < 0) return false;
  if (!Number.isInteger(col) || col < 0) return false;
  if (realm !== undefined && (typeof realm !== "string" || !REALMS.has(realm))) {
    return false;
  }
  return true;
};

const isSnapshot = (
  value: unknown,
): value is { map: [number, number, string?][][]; gridSize: number; location: string } => {
  if (!value || typeof value !== "object") return false;
  const record = value as CollectionSnapshot;

  if (!Number.isInteger(record.gridSize)) return false;
  const gridSize = record.gridSize as number;
  if (gridSize < 3 || gridSize > 20) return false;
  if (typeof record.location !== "string" || !LOCATIONS.has(record.location)) return false;
  if (!Array.isArray(record.map) || record.map.length !== gridSize) return false;

  for (const row of record.map) {
    if (!Array.isArray(row) || row.length !== gridSize) return false;
    for (const tile of row) {
      if (!isTile(tile)) return false;
    }
  }

  return true;
};

export type CollectionLoaderSnapshot = {
  id: string;
  map: TileCoord[][];
  gridSize: number;
  location: TexturePlaceId;
};

export default function CollectionLoader({
  snapshot,
}: {
  snapshot?: CollectionLoaderSnapshot | null;
}) {
  const loadSnapshot = useMapStore((state) => state.loadSnapshot);
  const loadedCollectionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!snapshot) {
      loadedCollectionRef.current = null;
      return;
    }
    if (loadedCollectionRef.current === snapshot.id) return;
    if (!isSnapshot(snapshot)) return;

    loadSnapshot({
      map: snapshot.map,
      gridSize: snapshot.gridSize,
      location: snapshot.location,
    });
    loadedCollectionRef.current = snapshot.id;
  }, [snapshot, loadSnapshot]);

  return null;
}
