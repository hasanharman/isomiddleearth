"use client";

import { useMemo } from "react";
import { useMapStore } from "@/lib/store";
import {
  CHARACTERS,
  CHARACTER_REALMS,
  getCharacterPath,
} from "@/lib/characters";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MIXED_TEXTURE_PLACE_ID, TEXTURE_PLACES } from "@/lib/textures";

export default function CharacterPicker() {
  const { activeCharacterTool, setActiveCharacterTool, location } = useMapStore();
  const locationLabel =
    location === MIXED_TEXTURE_PLACE_ID
      ? "Mixed"
      : (TEXTURE_PLACES.find((place) => place.id === location)?.label ?? "Shire");

  const groupedCharacters = useMemo(
    () =>
      CHARACTER_REALMS.map((realm) => ({
        ...realm,
        characters: CHARACTERS.filter((character) => character.realm === realm.id),
      })).filter((realm) => realm.characters.length > 0),
    [],
  );

  return (
    <ScrollArea className="h-full w-full bg-background/80">
      <div className="flex flex-col gap-2 p-2 sm:p-3">
        <span className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
          {locationLabel}
        </span>
        <div className="flex gap-3 sm:gap-4">
        <TooltipProvider delayDuration={200}>
          {groupedCharacters.map((realm) => (
            <div key={realm.id} className="flex flex-col gap-1">
              <span className="px-1 text-[11px] font-semibold text-muted-foreground whitespace-nowrap sm:text-xs">
                {realm.label}
              </span>
              <div className="flex gap-1">
                {realm.characters.map((character) => {
                  const isActive = activeCharacterTool === character.id;
                  return (
                    <Tooltip key={character.id}>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            "block h-[96px] w-[54px] shrink-0 overflow-hidden rounded-md border-2 transition-colors sm:h-[115px] sm:w-[65px]",
                            isActive
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-transparent hover:border-muted-foreground/30",
                          )}
                          style={{
                            backgroundImage: `url('${getCharacterPath(character.id)}')`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                            backgroundSize: "cover",
                          }}
                          onClick={() => setActiveCharacterTool(character.id)}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{character.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </TooltipProvider>
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
