import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CollectionMap } from "@/lib/collections";
import type { TileCoord } from "@/lib/store";

const actionButtonClass = cn(
  buttonVariants({ variant: "outline", size: "sm" }),
  "w-full justify-center text-xs",
);

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const tileColor = (tile: TileCoord, location: string) => {
  const realm = tile[2];
  if (realm) {
    if (realm === "shire") return "#83b36d";
    if (realm === "gondor") return "#9fb2c8";
    if (realm === "mordor") return "#75615a";
    if (realm === "lothlorien") return "#a2c472";
    if (realm === "rohan") return "#b9a563";
    if (realm === "moria") return "#6b717b";
    return "#9f8cc7";
  }

  if (location === "mordor") return "#6d5a52";
  if (location === "gondor") return "#93a9bf";
  if (location === "shire") return "#79ad67";
  if (location === "lothlorien") return "#95bf74";
  if (location === "rohan") return "#bba970";
  if (location === "moria") return "#6f7683";
  if (location === "rivendell") return "#9188c0";

  const intensity = tile[0] * 14 + tile[1] * 3;
  return `hsl(120 28% ${40 + (intensity % 35)}%)`;
};

export default function CollectionMapCard({ map }: { map: CollectionMap }) {
  return (
    <article className="rounded-xl border bg-card p-5 shadow-xs transition-colors hover:bg-card/80">
      <h2 className="text-lg font-medium">{map.name}</h2>
      <div className="mt-3 flex items-center gap-3">
        <Avatar size="lg">
          <AvatarImage
            src={`https://github.com/${map.author.github}.png?size=96`}
            alt={`${map.author.name} avatar`}
          />
          <AvatarFallback>{getInitials(map.author.name)}</AvatarFallback>
        </Avatar>
        <p className="text-sm text-muted-foreground">
          by {map.author.name} (@{map.author.github})
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            Realm glimpse
          </p>
          <div className="inline-flex rounded-lg border bg-muted/40 p-1">
            <div
              className="grid w-40 overflow-hidden rounded-md border border-black/5"
              style={{
                gridTemplateColumns: `repeat(${map.gridSize}, minmax(0, 1fr))`,
              }}
            >
              {map.map.flatMap((row, rowIndex) =>
                row.map((tile, colIndex) => (
                  <span
                    key={`${rowIndex}-${colIndex}`}
                    className="aspect-square border-[0.5px] border-black/10"
                    style={{ backgroundColor: tileColor(tile, map.location) }}
                  />
                )),
              )}
            </div>
          </div>
        </div>

        <div className="w-full space-y-3 sm:w-40">
          <p className="text-sm text-muted-foreground">
            {map.gridSize}x{map.gridSize} · {map.location}
          </p>
          <div className="space-y-2">
            <Link href={`/?collection=${map.id}`} className={actionButtonClass}>
              Open in builder
            </Link>
            <a
              href={`/api/collections/${map.id}`}
              download={`${map.id}.json`}
              className={actionButtonClass}
            >
              Download JSON
            </a>
          </div>
        </div>
      </div>

      {map.description ? <p className="mt-3 text-sm">{map.description}</p> : null}
    </article>
  );
}
