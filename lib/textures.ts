export const TEXTURE_PLACES = [
  { id: "shire", label: "Shire" },
  { id: "gondor", label: "Gondor" },
  { id: "mordor", label: "Mordor" },
  { id: "lothlorien", label: "Lothlorien" },
  { id: "rohan", label: "Rohan" },
  { id: "moria", label: "Moria" },
  { id: "rivendell", label: "Rivendell" },
] as const;

export type RealmTexturePlaceId = (typeof TEXTURE_PLACES)[number]["id"];
export const MIXED_TEXTURE_PLACE_ID = "mixed" as const;
export type TexturePlaceId = RealmTexturePlaceId | typeof MIXED_TEXTURE_PLACE_ID;

export const DEFAULT_TEXTURE_PLACE: TexturePlaceId = "shire";

const getRealmTexture = (id: string) =>
  TEXTURE_PLACES.find((place) => place.id === id);

const getRealmId = (id: string) => getRealmTexture(id)?.id ?? TEXTURE_PLACES[0].id;

export const getTilePath = (realmId: string, row: number, col: number) =>
  `/tiles/${getRealmId(realmId)}/r${row}-c${col}.png`;
