import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TileCoord = [number, number]; // [row, col]

export interface SavedState {
  id: string;
  name: string;
  map: TileCoord[][];
  gridSize: number;
  createdAt: number;
}

interface MapStore {
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
        map[x][y] = [...tile];
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
        const { map, gridSize, savedStates } = get();
        const newSave: SavedState = {
          id: crypto.randomUUID(),
          name,
          map: map.map((row) => row.map((t) => [...t] as TileCoord)),
          gridSize,
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
