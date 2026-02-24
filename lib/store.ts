import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_TEXTURE_PLACE,
  type RealmTexturePlaceId,
  type TexturePlaceId,
} from "@/lib/textures";
import {
  isCharacterId,
} from "@/lib/characters";

export type TileCoord = [number, number, RealmTexturePlaceId?]; // [row, col, realm?]
export type CharacterId = string;
export type CharacterCell = CharacterId | null;
export type CharacterTool = CharacterId | null;

export interface SavedState {
  id: string;
  name: string;
  map: TileCoord[][];
  characterMap?: CharacterCell[][];
  gridSize: number;
  location?: TexturePlaceId;
  createdAt: number;
}

interface HistorySnapshot {
  map: TileCoord[][];
  characterMap: CharacterCell[][];
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
  characterMap: CharacterCell[][];
  initMap: (size?: number) => void;
  setTile: (x: number, y: number, tile: TileCoord) => void;
  clearTile: (x: number, y: number) => void;
  setCharacter: (x: number, y: number, characterId: CharacterId) => void;
  clearCharacter: (x: number, y: number) => void;
  clearAt: (x: number, y: number) => void;
  undo: () => void;
  canUndo: boolean;
  history: HistorySnapshot[];

  // Active tool
  activeTool: TileCoord;
  setActiveTool: (tool: TileCoord) => void;
  activeCharacterTool: CharacterTool;
  setActiveCharacterTool: (tool: CharacterTool) => void;

  // Save states
  savedStates: SavedState[];
  saveState: (name: string) => void;
  loadState: (id: string) => void;
  loadSnapshot: (snapshot: {
    map: TileCoord[][];
    characterMap?: CharacterCell[][];
    gridSize: number;
    location?: TexturePlaceId;
  }) => void;
  deleteState: (id: string) => void;
}

const createEmptyMap = (size: number): TileCoord[][] =>
  Array.from({ length: size }, () =>
    Array.from({ length: size }, (): TileCoord => [0, 0]),
  );

const createEmptyCharacterMap = (size: number): CharacterCell[][] =>
  Array.from({ length: size }, () =>
    Array.from({ length: size }, (): CharacterCell => null),
  );

const cloneMap = (map: TileCoord[][]): TileCoord[][] =>
  map.map((row) => row.map((tile) => [...tile] as TileCoord));

const cloneCharacterMap = (map: CharacterCell[][]): CharacterCell[][] =>
  map.map((row) => row.map((value) => value));

const normalizeCharacterMap = (
  map: CharacterCell[][] | undefined,
  size: number,
): CharacterCell[][] => {
  if (!Array.isArray(map) || map.length !== size) {
    return createEmptyCharacterMap(size);
  }

  const normalized = createEmptyCharacterMap(size);
  for (let row = 0; row < size; row += 1) {
    const sourceRow = map[row];
    if (!Array.isArray(sourceRow) || sourceRow.length !== size) continue;
    for (let col = 0; col < size; col += 1) {
      const value = sourceRow[col];
      if (typeof value === "string" && isCharacterId(value)) {
        normalized[row][col] = value;
      }
    }
  }

  return normalized;
};

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
        const { map, characterMap, gridSize, location, history } = get();
        set({
          map: createEmptyMap(size),
          characterMap: createEmptyCharacterMap(size),
          gridSize: size,
          history: pushHistory(history, {
            map: cloneMap(map),
            characterMap: cloneCharacterMap(characterMap),
            gridSize,
            location,
          }),
          canUndo: true,
        });
      },

      map: createEmptyMap(7),
      characterMap: createEmptyCharacterMap(7),
      history: [],
      canUndo: false,
      initMap: (size?: number) => {
        const s = size ?? get().gridSize;
        const { map, characterMap, gridSize, location, history } = get();
        set({
          map: createEmptyMap(s),
          characterMap: createEmptyCharacterMap(s),
          gridSize: s,
          history: pushHistory(history, {
            map: cloneMap(map),
            characterMap: cloneCharacterMap(characterMap),
            gridSize,
            location,
          }),
          canUndo: true,
        });
      },

      setTile: (x, y, tile) => {
        const {
          map: currentMap,
          characterMap: currentCharacterMap,
          gridSize,
          location,
          history,
        } = get();
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
            characterMap: cloneCharacterMap(currentCharacterMap),
            gridSize,
            location,
          }),
          canUndo: true,
        });
      },

      clearTile: (x, y) => {
        const {
          map: currentMap,
          characterMap: currentCharacterMap,
          gridSize,
          location,
          history,
        } = get();
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
            characterMap: cloneCharacterMap(currentCharacterMap),
            gridSize,
            location,
          }),
          canUndo: true,
        });
      },

      setCharacter: (x, y, characterId) => {
        const { characterMap: currentCharacterMap, map, gridSize, location, history } = get();
        if (currentCharacterMap[x][y] === characterId) return;

        const characterMap = cloneCharacterMap(currentCharacterMap);
        characterMap[x][y] = characterId;
        set({
          characterMap,
          history: pushHistory(history, {
            map: cloneMap(map),
            characterMap: cloneCharacterMap(currentCharacterMap),
            gridSize,
            location,
          }),
          canUndo: true,
        });
      },

      clearCharacter: (x, y) => {
        const { characterMap: currentCharacterMap, map, gridSize, location, history } = get();
        if (currentCharacterMap[x][y] === null) return;

        const characterMap = cloneCharacterMap(currentCharacterMap);
        characterMap[x][y] = null;
        set({
          characterMap,
          history: pushHistory(history, {
            map: cloneMap(map),
            characterMap: cloneCharacterMap(currentCharacterMap),
            gridSize,
            location,
          }),
          canUndo: true,
        });
      },

      clearAt: (x, y) => {
        const { characterMap } = get();
        if (characterMap[x][y] !== null) {
          get().clearCharacter(x, y);
          return;
        }
        get().clearTile(x, y);
      },

      undo: () => {
        const { history } = get();
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        const nextHistory = history.slice(0, -1);
        set({
          map: cloneMap(previous.map),
          characterMap: cloneCharacterMap(previous.characterMap),
          gridSize: previous.gridSize,
          location: previous.location,
          history: nextHistory,
          canUndo: nextHistory.length > 0,
        });
      },

      activeTool: [0, 0],
      setActiveTool: (tool) => set({ activeTool: tool }),
      activeCharacterTool: null,
      setActiveCharacterTool: (tool) => {
        if (tool === null || (typeof tool === "string" && isCharacterId(tool))) {
          set({ activeCharacterTool: tool });
        }
      },

      savedStates: [],

      saveState: (name: string) => {
        const { map, characterMap, gridSize, savedStates, location } = get();
        const newSave: SavedState = {
          id: crypto.randomUUID(),
          name,
          map: map.map((row) => row.map((t) => [...t] as TileCoord)),
          characterMap: cloneCharacterMap(characterMap),
          gridSize,
          location,
          createdAt: Date.now(),
        };
        set({ savedStates: [...savedStates, newSave] });
      },

      loadState: (id: string) => {
        const { savedStates, map, characterMap, gridSize, location, history } = get();
        const state = savedStates.find((s) => s.id === id);
        if (state) {
          const nextCharacterMap = normalizeCharacterMap(
            state.characterMap,
            state.gridSize,
          );
          set({
            map: cloneMap(state.map),
            characterMap: nextCharacterMap,
            gridSize: state.gridSize,
            location: state.location ?? DEFAULT_TEXTURE_PLACE,
            history: pushHistory(history, {
              map: cloneMap(map),
              characterMap: cloneCharacterMap(characterMap),
              gridSize,
              location,
            }),
            canUndo: true,
          });
        }
      },
      loadSnapshot: ({
        map: nextMap,
        characterMap: nextCharacterMap,
        gridSize: nextGridSize,
        location: nextLocation,
      }) => {
        const { map, characterMap, gridSize, location, history } = get();
        set({
          map: cloneMap(nextMap),
          characterMap: normalizeCharacterMap(nextCharacterMap, nextGridSize),
          gridSize: nextGridSize,
          location: nextLocation ?? DEFAULT_TEXTURE_PLACE,
          history: pushHistory(history, {
            map: cloneMap(map),
            characterMap: cloneCharacterMap(characterMap),
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
        characterMap: state.characterMap,
        activeTool: state.activeTool,
        activeCharacterTool: state.activeCharacterTool,
        savedStates: state.savedStates,
      }),
    },
  ),
);
