"use client";

import { useMapStore } from "@/lib/store";
import { TILE_GROUPS, SPRITE_TILE_W, SPRITE_TILE_H } from "@/lib/tiles";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getTexturePath } from "@/lib/textures";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function TilePicker() {
  const { activeTool, setActiveTool, location } = useMapStore();

  return (
    <div className="border-t bg-background">
      <ScrollArea className="w-full">
        <div className="flex gap-4 p-3">
          <TooltipProvider delayDuration={200}>
            {TILE_GROUPS.map((group, gi) => (
              <div key={group.name} className="flex gap-2 items-end">
                {gi > 0 && (
                  <Separator orientation="vertical" className="h-40" />
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-muted-foreground px-1 whitespace-nowrap">
                    {group.name}
                  </span>
                  <div className="flex gap-1">
                    {group.tiles
                      .filter((t) => t.label !== "Empty")
                      .map((tile) => {
                        const isActive =
                          activeTool[0] === group.row &&
                          activeTool[1] === tile.col;
                        return (
                          <Tooltip key={`${group.row}-${tile.col}`}>
                            <TooltipTrigger asChild>
                              <button
                                className={cn(
                                  "block border-2 rounded-md overflow-hidden transition-colors shrink-0",
                                  isActive
                                    ? "border-primary ring-2 ring-primary/30"
                                    : "border-transparent hover:border-muted-foreground/30",
                                )}
                                style={{
                                  width: 65,
                                  height: 115,
                                  backgroundImage: `url('${getTexturePath(location)}')`,
                                  backgroundRepeat: "no-repeat",
                                  backgroundPosition: `-${(tile.col * SPRITE_TILE_W) / 2 + 1}px -${(group.row * SPRITE_TILE_H) / 2}px`,
                                  backgroundSize: `${(SPRITE_TILE_W * 12) / 2}px ${(SPRITE_TILE_H * 5.9) / 2}px`,
                                }}
                                onClick={() =>
                                  setActiveTool([group.row, tile.col])
                                }
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>{tile.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
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
