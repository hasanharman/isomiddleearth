import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_TEXTURE_PLACE,
  type RealmTexturePlaceId,
  type TexturePlaceId,
} from "@/lib/textures";

export type TileCoord = [number, number, RealmTexturePlaceId?]; // [row, col, realm?]

export interface SavedState {
  id: string;
  name: string;
  map: TileCoord[][];
  gridSize: number;
  location?: TexturePlaceId;
  createdAt: number;
}

interface MapStore {
  // Active texture location
  location: TexturePlaceId;
  setLocation: (location: TexturePlaceId) => void;

  // Grid
  gridSize: number;
  setGridSize: (size: number) => void;

  // Map data
  map: TileCoord[][];
  initMap: (size?: number) => void;
  setTile: (x: number, y: number, tile: TileCoord) => void;
  clearTile: (x: number, y: number) => void;

  // Active tool
  activeTool: TileCoord;
  setActiveTool: (tool: TileCoord) => void;

  // Save states
  savedStates: SavedState[];
  saveState: (name: string) => void;
  loadState: (id: string) => void;
  deleteState: (id: string) => void;
}

const createEmptyMap = (size: number): TileCoord[][] =>
  Array.from({ length: size }, () =>
    Array.from({ length: size }, (): TileCoord => [0, 0]),
  );

export const useMapStore = create<MapStore>()(
  persist(
    (set, get) => ({
      gridSize: 7,
      location: DEFAULT_TEXTURE_PLACE,
      setLocation: (location) => set({ location }),
      setGridSize: (size: number) => {
        set({ gridSize: size });
        get().initMap(size);
      },

      map: createEmptyMap(7),
      initMap: (size?: number) => {
        const s = size ?? get().gridSize;
        set({ map: createEmptyMap(s), gridSize: s });
      },

      setTile: (x, y, tile) => {
        const map = get().map.map((row) => [...row]);
        map[x][y] = [tile[0], tile[1], tile[2]];
        set({ map });
      },

      clearTile: (x, y) => {
        const map = get().map.map((row) => [...row]);
        map[x][y] = [0, 0];
        set({ map });
      },

      activeTool: [0, 0],
      setActiveTool: (tool) => set({ activeTool: tool }),

      savedStates: [],

      saveState: (name: string) => {
        const { map, gridSize, savedStates, location } = get();
        const newSave: SavedState = {
          id: crypto.randomUUID(),
          name,
          map: map.map((row) => row.map((t) => [...t] as TileCoord)),
          gridSize,
          location,
          createdAt: Date.now(),
        };
        set({ savedStates: [...savedStates, newSave] });
      },

      loadState: (id: string) => {
        const state = get().savedStates.find((s) => s.id === id);
        if (state) {
          set({
            map: state.map.map((row) => row.map((t) => [...t] as TileCoord)),
            gridSize: state.gridSize,
            location: state.location ?? DEFAULT_TEXTURE_PLACE,
          });
        }
      },

      deleteState: (id: string) => {
        set({ savedStates: get().savedStates.filter((s) => s.id !== id) });
      },
    }),
    {
      name: "isoshire-storage",
    },
  ),
);
