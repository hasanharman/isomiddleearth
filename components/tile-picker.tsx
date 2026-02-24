"use client";

import { useMapStore } from "@/lib/store";
import { TILE_GROUPS } from "@/lib/tiles";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  getTilePath,
  MIXED_TEXTURE_PLACE_ID,
  TEXTURE_PLACES,
} from "@/lib/textures";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function TilePicker() {
  const { activeTool, setActiveTool, location } = useMapStore();
  const isMixed = location === MIXED_TEXTURE_PLACE_ID;
  const visibleRealms = isMixed
    ? TEXTURE_PLACES
    : TEXTURE_PLACES.filter((place) => place.id === location);

  return (
    <div className="shrink-0 border-t bg-background">
      <ScrollArea className="w-full">
        <div className="flex gap-3 p-2 sm:gap-4 sm:p-3">
          <TooltipProvider delayDuration={200}>
            {visibleRealms.map((realm, realmIndex) => (
              <div key={realm.id} className="flex gap-2 items-end">
                {realmIndex > 0 && (
                  <Separator orientation="vertical" className="h-24 sm:h-40" />
                )}
                <div className="flex flex-col gap-2">
                  {isMixed && (
                    <span className="hidden px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap sm:inline">
                      {realm.label}
                    </span>
                  )}
                  <div className="flex gap-2">
                    {TILE_GROUPS.map((group) => (
                      <div key={`${realm.id}-${group.name}`} className="flex flex-col gap-1">
                        <span className="px-1 text-[11px] font-semibold text-muted-foreground whitespace-nowrap sm:text-xs">
                          {group.name}
                        </span>
                        <div className="flex gap-1">
                          {group.tiles
                            .filter((t) => t.label !== "Empty")
                            .map((tile) => {
                              const isActive =
                                activeTool[0] === group.row &&
                                activeTool[1] === tile.col &&
                                (!isMixed || activeTool[2] === realm.id);
                              return (
                                <Tooltip key={`${realm.id}-${group.row}-${tile.col}`}>
                                  <TooltipTrigger asChild>
                                    <button
                                      className={cn(
                                        "block h-[96px] w-[54px] shrink-0 overflow-hidden rounded-md border-2 transition-colors sm:h-[115px] sm:w-[65px]",
                                        isActive
                                          ? "border-primary ring-2 ring-primary/30"
                                          : "border-transparent hover:border-muted-foreground/30",
                                      )}
                                      style={{
                                        backgroundImage: `url('${getTilePath(
                                          realm.id,
                                          group.row,
                                          tile.col,
                                        )}')`,
                                        backgroundRepeat: "no-repeat",
                                        backgroundPosition: "center",
                                        backgroundSize: "cover",
                                      }}
                                      onClick={() =>
                                        setActiveTool(
                                          isMixed
                                            ? [group.row, tile.col, realm.id]
                                            : [group.row, tile.col],
                                        )
                                      }
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p>
                                      {tile.label}
                                      {isMixed ? ` (${realm.label})` : ""}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </TooltipProvider>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
