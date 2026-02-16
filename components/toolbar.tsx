"use client";

import { useState } from "react";
import {
  Coffee,
  Download,
  Github,
  Grid3X3,
  Heart,
  Save,
  Trash2,
  Twitter,
  X,
} from "lucide-react";
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
import { bilboSwashCaps } from "@/app/fonts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { TEXTURE_PLACES, type TexturePlaceId } from "@/lib/textures";

export default function Toolbar() {
  const {
    gridSize,
    setGridSize,
    savedStates,
    saveState,
    loadState,
    deleteState,
    initMap,
    location,
    setLocation,
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
    link.download = `isoshire-${Date.now()}.png`;
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
      <div className="flex items-center gap-2 mr-4">
        <img src="/logo.png" alt="Isoshire" className="w-10 object-contain" />
        <h1 className={`text-3xl font-bold ${bilboSwashCaps.className}`}>
          Iso Middle Earth
        </h1>
      </div>

      {/* Grid Size */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label={`Grid size ${gridSize} by ${gridSize}`}
          >
            <Grid3X3 className="h-4 w-4" />
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
      <Select
        value={location}
        onValueChange={(value) => setLocation(value as TexturePlaceId)}
      >
        <SelectTrigger aria-label="Choose location">
          <SelectValue placeholder="Choose location" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectGroup>
            <SelectLabel>Realms</SelectLabel>
            {TEXTURE_PLACES.map((place) => (
              <SelectItem key={place.id} value={place.id}>
                {place.label}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Other</SelectLabel>
            <SelectItem value="mixed">Mixed</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Clear */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => initMap()}
        aria-label="Clear map"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* Export */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleExport}
        aria-label="Export PNG"
      >
        <Download className="h-4 w-4" />
      </Button>

      {/* Save / Load */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Save and load states"
          >
            <Save className="h-4 w-4" />
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
              <Button size="sm" onClick={handleSave} aria-label="Save state">
                <Save className="h-4 w-4" />
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
                      aria-label={`Delete ${s.name}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" asChild aria-label="X @strad3r">
          <a href="https://x.com/strad3r" target="_blank" rel="noreferrer">
            <Twitter className="h-4 w-4" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          asChild
          aria-label="GitHub repository"
        >
          <a
            href="https://github.com/hasanharman/isoshire"
            target="_blank"
            rel="noreferrer"
          >
            <Github className="h-4 w-4" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          asChild
          aria-label="GitHub Sponsors"
        >
          <a
            href="https://github.com/sponsors/hasanharman"
            target="_blank"
            rel="noreferrer"
          >
            <Heart className="h-4 w-4" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          asChild
          aria-label="Buy me a coffee"
        >
          <a
            href="https://buymeacoffee.com/hasanharman"
            target="_blank"
            rel="noreferrer"
          >
            <Coffee className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
