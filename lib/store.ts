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

interface HistorySnapshot {
  map: TileCoord[][];
  gridSize: number;
  location: TexturePlaceId;
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
  undo: () => void;
  canUndo: boolean;
  history: HistorySnapshot[];

  // Active tool
  activeTool: TileCoord;
  setActiveTool: (tool: TileCoord) => void;

  // Save states
  savedStates: SavedState[];
  saveState: (name: string) => void;
  loadState: (id: string) => void;
  loadSnapshot: (snapshot: {
    map: TileCoord[][];
    gridSize: number;
    location?: TexturePlaceId;
  }) => void;
  deleteState: (id: string) => void;
}

const createEmptyMap = (size: number): TileCoord[][] =>
  Array.from({ length: size }, () =>
    Array.from({ length: size }, (): TileCoord => [0, 0]),
  );

const cloneMap = (map: TileCoord[][]): TileCoord[][] =>
  map.map((row) => row.map((tile) => [...tile] as TileCoord));

const pushHistory = (
  history: HistorySnapshot[],
  snapshot: HistorySnapshot,
): HistorySnapshot[] => [...history, snapshot].slice(-100);

export const useMapStore = create<MapStore>()(
  persist(
    (set, get) => ({
      gridSize: 7,
      location: DEFAULT_TEXTURE_PLACE,
      setLocation: (location) => set({ location }),
      setGridSize: (size: number) => {
        const { map, gridSize, location, history } = get();
        set({
          map: createEmptyMap(size),
          gridSize: size,
          history: pushHistory(history, {
            map: cloneMap(map),
            gridSize,
            location,
          }),
          canUndo: true,
        });
      },

      map: createEmptyMap(7),
      history: [],
      canUndo: false,
      initMap: (size?: number) => {
        const s = size ?? get().gridSize;
        const { map, gridSize, location, history } = get();
        set({
          map: createEmptyMap(s),
          gridSize: s,
          history: pushHistory(history, {
            map: cloneMap(map),
            gridSize,
            location,
          }),
          canUndo: true,
        });
      },

      setTile: (x, y, tile) => {
        const { map: currentMap, gridSize, location, history } = get();
        const current = currentMap[x][y];
        if (
          current[0] === tile[0] &&
          current[1] === tile[1] &&
          current[2] === tile[2]
        ) {
          return;
        }
        const map = cloneMap(currentMap);
        map[x][y] = [tile[0], tile[1], tile[2]];
        set({
          map,
          history: pushHistory(history, {
            map: cloneMap(currentMap),
            gridSize,
            location,
          }),
          canUndo: true,
        });
      },

      clearTile: (x, y) => {
        const { map: currentMap, gridSize, location, history } = get();
        const current = currentMap[x][y];
        if (current[0] === 0 && current[1] === 0 && current[2] === undefined) {
          return;
        }
        const map = cloneMap(currentMap);
        map[x][y] = [0, 0];
        set({
          map,
          history: pushHistory(history, {
            map: cloneMap(currentMap),
            gridSize,
            location,
          }),
          canUndo: true,
        });
      },

      undo: () => {
        const { history } = get();
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        const nextHistory = history.slice(0, -1);
        set({
          map: cloneMap(previous.map),
          gridSize: previous.gridSize,
          location: previous.location,
          history: nextHistory,
          canUndo: nextHistory.length > 0,
        });
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
        const { savedStates, map, gridSize, location, history } = get();
        const state = savedStates.find((s) => s.id === id);
        if (state) {
          set({
            map: cloneMap(state.map),
            gridSize: state.gridSize,
            location: state.location ?? DEFAULT_TEXTURE_PLACE,
            history: pushHistory(history, {
              map: cloneMap(map),
              gridSize,
              location,
            }),
            canUndo: true,
          });
        }
      },
      loadSnapshot: ({ map: nextMap, gridSize: nextGridSize, location: nextLocation }) => {
        const { map, gridSize, location, history } = get();
        set({
          map: cloneMap(nextMap),
          gridSize: nextGridSize,
          location: nextLocation ?? DEFAULT_TEXTURE_PLACE,
          history: pushHistory(history, {
            map: cloneMap(map),
            gridSize,
            location,
          }),
          canUndo: true,
        });
      },

      deleteState: (id: string) => {
        set({ savedStates: get().savedStates.filter((s) => s.id !== id) });
      },
    }),
    {
      name: "isoshire-storage",
      partialize: (state) => ({
        location: state.location,
        gridSize: state.gridSize,
        map: state.map,
        activeTool: state.activeTool,
        savedStates: state.savedStates,
      }),
    },
  ),
);
