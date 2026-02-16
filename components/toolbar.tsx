"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useMapStore } from "@/lib/store";

export default function Toolbar() {
  const {
    gridSize,
    setGridSize,
    savedStates,
    saveState,
    loadState,
    deleteState,
    initMap,
  } = useMapStore();

  const [saveName, setSaveName] = useState("");
  const [pendingSize, setPendingSize] = useState(gridSize);

  const handleExport = async () => {
    const wrapper = document.getElementById("iso-canvas-wrapper");
    if (!wrapper) return;

    // Find the bg canvas specifically for a clean export
    const bgCanvas = wrapper.querySelector("canvas") as HTMLCanvasElement;
    if (!bgCanvas) return;

    const dataUrl = bgCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `isoshite-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleSave = () => {
    if (saveName.trim()) {
      saveState(saveName.trim());
      setSaveName("");
    }
  };

  const handleResizeConfirm = () => {
    setGridSize(pendingSize);
  };

  return (
    <div className="flex items-center gap-2 border-b bg-background px-4 py-2">
      <h1 className="text-lg font-bold mr-4">🏡 Isoshire</h1>

      {/* Grid Size */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Grid: {gridSize}×{gridSize}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Grid Size</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Size: {pendingSize}×{pendingSize}
            </p>
            <Slider
              min={3}
              max={20}
              step={1}
              value={[pendingSize]}
              onValueChange={([v]) => setPendingSize(v)}
            />
            <p className="text-xs text-destructive">
              ⚠️ Changing grid size will reset the current map.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={handleResizeConfirm}>Apply</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear */}
      <Button variant="outline" size="sm" onClick={() => initMap()}>
        Clear
      </Button>

      {/* Export */}
      <Button variant="outline" size="sm" onClick={handleExport}>
        Export PNG
      </Button>

      {/* Save / Load */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Save / Load
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save & Load States</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Save new */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Save name..."
                className="flex-1 border rounded-md px-3 py-1.5 text-sm bg-background"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-60 overflow-auto">
              {savedStates.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No saved states yet.
                </p>
              )}
              {savedStates.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between border rounded-md px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.gridSize}×{s.gridSize} ·{" "}
                      {new Date(s.createdAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <DialogClose asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => loadState(s.id)}
                      >
                        Load
                      </Button>
                    </DialogClose>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => deleteState(s.id)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
