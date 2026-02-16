"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
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
  if (!Number.isInteger(row) || row < 0 || row > 5) return false;
  if (!Number.isInteger(col) || col < 0 || col > 11) return false;
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

export default function CollectionLoader() {
  const searchParams = useSearchParams();
  const collectionId = searchParams.get("collection");
  const loadSnapshot = useMapStore((state) => state.loadSnapshot);
  const loadedCollectionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!collectionId) return;
    if (loadedCollectionRef.current === collectionId) return;

    const controller = new AbortController();

    fetch(`/api/collections/${collectionId}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("not found");
        }
        const payload = (await res.json()) as unknown;
        if (!isSnapshot(payload)) {
          throw new Error("invalid payload");
        }
        loadSnapshot({
          map: payload.map as TileCoord[][],
          gridSize: payload.gridSize,
          location: payload.location as TexturePlaceId,
        });
        loadedCollectionRef.current = collectionId;
      })
      .catch(() => {
        // Silent fail keeps the editor usable even if URL is invalid.
      });

    return () => controller.abort();
  }, [collectionId, loadSnapshot]);

  return null;
}
