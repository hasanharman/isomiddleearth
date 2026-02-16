export const TEXTURE_PLACES = [
  { id: "shire", label: "Shire", path: "/textures/shire.png" },
  { id: "gondor", label: "Gondor", path: "/textures/gondor.png" },
  { id: "mordor", label: "Mordor", path: "/textures/mordor.png" },
  { id: "lothlorien", label: "Lothlorien", path: "/textures/lothlorien.png" },
  { id: "rohan", label: "Rohan", path: "/textures/rohan.png" },
  { id: "moria", label: "Moria", path: "/textures/moria.png" },
  { id: "rivendell", label: "Rivendell", path: "/textures/rivendell.png" },
] as const;

export type TexturePlaceId = (typeof TEXTURE_PLACES)[number]["id"];

export const DEFAULT_TEXTURE_PLACE: TexturePlaceId = "shire";

export const getTexturePath = (id: string) =>
  TEXTURE_PLACES.find((place) => place.id === id)?.path ??
  `/textures/${id}.png`;
