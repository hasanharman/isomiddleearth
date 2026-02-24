import type { RealmTexturePlaceId } from "@/lib/textures";

export type CharacterRealmId = "hobbits" | "elves" | "dwarves" | "men" | "orcs";

export type CharacterDefinition = {
  id: string;
  label: string;
  realm: CharacterRealmId;
  path: string;
  // Optional map realm affinity if you want to scope random placement by map location.
  allowedMapRealms?: RealmTexturePlaceId[];
};

export const CHARACTER_REALMS: { id: CharacterRealmId; label: string }[] = [
  { id: "hobbits", label: "Hobbits" },
  { id: "elves", label: "Elves" },
  { id: "dwarves", label: "Dwarves" },
  { id: "men", label: "Men" },
  { id: "orcs", label: "Orcs" },
];

export const CHARACTERS: CharacterDefinition[] = [
  {
    id: "hobbit-1",
    label: "Hobbit 1",
    realm: "hobbits",
    path: "/characters/hobbits/hobbit-1.png",
  },
  {
    id: "hobbit-2",
    label: "Hobbit 2",
    realm: "hobbits",
    path: "/characters/hobbits/hobbit-2.png",
  },
  {
    id: "hobbit-3",
    label: "Hobbit 3",
    realm: "hobbits",
    path: "/characters/hobbits/hobbit-3.png",
  },
  {
    id: "hobbit-4",
    label: "Hobbit 4",
    realm: "hobbits",
    path: "/characters/hobbits/hobbit-4.png",
  },
  {
    id: "hobbit-5",
    label: "Hobbit 5",
    realm: "hobbits",
    path: "/characters/hobbits/hobbit-5.png",
  },
  {
    id: "hobbit-6",
    label: "Hobbit 6",
    realm: "hobbits",
    path: "/characters/hobbits/hobbit-6.png",
  },
  {
    id: "hobbit-7",
    label: "Hobbit 7",
    realm: "hobbits",
    path: "/characters/hobbits/hobbit-7.png",
  },
  {
    id: "hobbit-8",
    label: "Hobbit 8",
    realm: "hobbits",
    path: "/characters/hobbits/hobbit-8.png",
  },
];

const characterById = new Map(CHARACTERS.map((character) => [character.id, character]));

export const isCharacterId = (value: unknown): value is CharacterDefinition["id"] =>
  typeof value === "string" && characterById.has(value);

export const getCharacterPath = (id: string) => characterById.get(id)?.path;
