"use client";

import TilePicker from "@/components/tile-picker";
import CharacterPicker from "@/components/character-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import { Castle02Icon, UniversalAccessIcon } from "@hugeicons/core-free-icons";

export default function AssetPicker() {
  return (
    <div className="shrink-0 border-t bg-background">
      <Tabs defaultValue="buildings" className="gap-0">
        <div className="border-b px-2 py-2 sm:px-3">
          <TabsList>
            <TabsTrigger value="buildings">
              <HugeiconsIcon icon={Castle02Icon} />{" "}
              <span className="font-light text-xs">Buildings</span>
            </TabsTrigger>
            <TabsTrigger value="characters">
              <HugeiconsIcon icon={UniversalAccessIcon} />{" "}
              <span className="font-light text-xs">Characters</span>
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="buildings" className="h-48">
          <TilePicker />
        </TabsContent>
        <TabsContent value="characters" className="h-48">
          <CharacterPicker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
