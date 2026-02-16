export const TEXTURE_PLACES = [
  { id: "shire", label: "Shire", path: "/textures/shire.png" },
  { id: "gondor", label: "Gondor", path: "/textures/gondor.png" },
  { id: "mordor", label: "Mordor", path: "/textures/mordor.png" },
  { id: "lothlorien", label: "Lothlorien", path: "/textures/lothlorien.png" },
  { id: "rohan", label: "Rohan", path: "/textures/rohan.png" },
  { id: "moria", label: "Moria", path: "/textures/moria.png" },
  { id: "rivendell", label: "Rivendell", path: "/textures/rivendell.png" },
] as const;

export type RealmTexturePlaceId = (typeof TEXTURE_PLACES)[number]["id"];
export const MIXED_TEXTURE_PLACE_ID = "mixed" as const;
export type TexturePlaceId = RealmTexturePlaceId | typeof MIXED_TEXTURE_PLACE_ID;

export const DEFAULT_TEXTURE_PLACE: TexturePlaceId = "shire";

const getRealmTexture = (id: string) =>
  TEXTURE_PLACES.find((place) => place.id === id);

export const getTexturePath = (id: string) =>
  getRealmTexture(id)?.path ?? TEXTURE_PLACES[0].path;
