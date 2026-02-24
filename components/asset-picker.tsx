"use client";

import TilePicker from "@/components/tile-picker";
import CharacterPicker from "@/components/character-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AssetPicker() {
  return (
    <div className="shrink-0 border-t bg-background">
      <Tabs defaultValue="buildings" className="gap-0">
        <div className="border-b px-2 py-2 sm:px-3">
          <TabsList>
            <TabsTrigger value="buildings">Buildings</TabsTrigger>
            <TabsTrigger value="characters">Characters</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="buildings" className="h-[190px]">
          <TilePicker />
        </TabsContent>
        <TabsContent value="characters" className="h-[190px]">
          <CharacterPicker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
