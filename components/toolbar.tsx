"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Coffee, Github, Heart, Twitter } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GridTableIcon,
  Delete01Icon,
  Undo02Icon,
  Download01Icon,
  FloppyDiskIcon,
  AdventureIcon,
  CodeIcon,
} from "@hugeicons/core-free-icons";
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
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import type { TileCoord, SavedState } from "@/lib/store";

const REALMS = new Set<string>([
  "shire",
  "gondor",
  "mordor",
  "lothlorien",
  "rohan",
  "moria",
  "rivendell",
]);
const LOCATIONS = new Set<string>([...REALMS, "mixed"]);

type ExportMapPayload = {
  schemaVersion: 1;
  id: string;
  name: string;
  author: {
    name: string;
    github: string;
  };
  createdAt: string;
  location: TexturePlaceId;
  gridSize: number;
  map: TileCoord[][];
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64) || "map";

const cloneTileMap = (map: TileCoord[][]) =>
  map.map((row) => row.map((tile) => [...tile] as TileCoord));

const isTileCoord = (value: unknown): value is TileCoord => {
  if (!Array.isArray(value) || (value.length !== 2 && value.length !== 3)) {
    return false;
  }
  const [row, col, realm] = value;
  if (!Number.isInteger(row) || row < 0 || row > 5) return false;
  if (!Number.isInteger(col) || col < 0 || col > 11) return false;
  if (
    realm !== undefined &&
    (typeof realm !== "string" || !REALMS.has(realm))
  ) {
    return false;
  }
  return true;
};

const isTileMap = (value: unknown): value is TileCoord[][] => {
  if (!Array.isArray(value)) return false;
  return value.every(
    (row) =>
      Array.isArray(row) &&
      row.every((tile) => {
        return isTileCoord(tile);
      }),
  );
};

const parseImportedSnapshot = (
  value: unknown,
): {
  map: TileCoord[][];
  gridSize: number;
  location: TexturePlaceId;
} | null => {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;

  if (!Number.isInteger(record.gridSize)) return null;
  const gridSize = record.gridSize as number;
  if (gridSize < 3 || gridSize > 20) return null;
  if (!isTileMap(record.map)) return null;
  if (record.map.length !== gridSize) return null;
  if (!record.map.every((row) => row.length === gridSize)) return null;

  const location = record.location;
  if (typeof location !== "string" || !LOCATIONS.has(location)) return null;

  return {
    map: cloneTileMap(record.map),
    gridSize,
    location: location as TexturePlaceId,
  };
};

export default function Toolbar() {
  const {
    gridSize,
    map,
    setGridSize,
    savedStates,
    saveState,
    loadState,
    loadSnapshot,
    deleteState,
    initMap,
    location,
    setLocation,
    undo,
    canUndo,
  } = useMapStore();

  const [saveName, setSaveName] = useState("");
  const [pendingSize, setPendingSize] = useState(gridSize);
  const [jsonNotice, setJsonNotice] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);

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
    if (!saveName.trim()) return;
    saveState(saveName.trim());
    setSaveName("");
  };

  const buildExportPayload = (
    name: string,
    stateMap: TileCoord[][],
    stateGridSize: number,
    stateLocation: TexturePlaceId,
  ): ExportMapPayload => ({
    schemaVersion: 1,
    id: toSlug(name),
    name,
    author: {
      name: "Anonymous",
      github: "your-github-username",
    },
    createdAt: new Date().toISOString(),
    location: stateLocation,
    gridSize: stateGridSize,
    map: cloneTileMap(stateMap),
  });

  const downloadJson = (payload: ExportMapPayload, fileName: string) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCurrentJson = () => {
    const payload = buildExportPayload(
      saveName.trim() || "untitled-map",
      map,
      gridSize,
      location,
    );
    downloadJson(payload, `${payload.id}.json`);
    setJsonError(null);
    setJsonNotice("Exported current map as JSON.");
  };

  const handleExportSavedJson = (savedState: SavedState) => {
    const payload = buildExportPayload(
      savedState.name,
      savedState.map,
      savedState.gridSize,
      savedState.location ?? "shire",
    );
    downloadJson(payload, `${payload.id}.json`);
    setJsonError(null);
    setJsonNotice(`Exported ${savedState.name} as JSON.`);
  };

  const handleImportJsonClick = () => {
    importInputRef.current?.click();
  };

  const handleImportJsonFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const snapshot = parseImportedSnapshot(parsed);
      if (!snapshot) {
        setJsonNotice(null);
        setJsonError("Invalid JSON map format.");
        return;
      }

      loadSnapshot(snapshot);
      setJsonError(null);
      setJsonNotice(`Loaded JSON map from ${file.name}.`);
    } catch {
      setJsonNotice(null);
      setJsonError("Failed to read JSON file.");
    }
  };

  const handleResizeConfirm = () => {
    setGridSize(pendingSize);
  };

  const handleClearMap = () => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("collection")) {
      url.searchParams.delete("collection");
      window.history.replaceState(window.history.state, "", url.toString());
    }
    initMap();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;

      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        const isTypingTarget =
          target.isContentEditable || tag === "INPUT" || tag === "TEXTAREA";
        if (isTypingTarget) return;
      }

      if (!canUndo) return;
      e.preventDefault();
      undo();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, canUndo]);

  return (
    <div className="flex items-center gap-2 border-b bg-background px-4 py-2">
      <Link href="/" className="flex items-center gap-2 mr-4">
        <img src="/logo.png" alt="Isoshire" className="w-10 object-contain" />
        <h1 className={`text-3xl font-bold ${bilboSwashCaps.className}`}>
          Iso Middle Earth
        </h1>
      </Link>

      {/* Grid Size */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label={`Grid size ${gridSize} by ${gridSize}`}
          >
            <HugeiconsIcon icon={GridTableIcon} />
            {/* <Grid3X3 className="size-4" /> */}
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
        <SelectTrigger
          aria-label="Choose location"
          className="border-zinc-300 bg-linear-to-t from-muted to-background shadow-xs shadow-zinc-950/10 hover:to-muted dark:from-muted/50 dark:border-border duration-200"
        >
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
        onClick={handleClearMap}
        aria-label="Clear map"
      >
        <HugeiconsIcon icon={Delete01Icon} />
      </Button>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={undo}
              disabled={!canUndo}
              aria-label="Undo"
              className="gap-2"
            >
              <HugeiconsIcon icon={Undo02Icon} />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <span>+</span>
              <Kbd>Z</Kbd>
            </KbdGroup>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Export */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleExport}
        aria-label="Export PNG"
      >
        <HugeiconsIcon icon={Download01Icon} className="h-4 w-4" />
      </Button>

      {/* Save / Load */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Save and load states"
          >
            <HugeiconsIcon icon={FloppyDiskIcon} className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save & Load States</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImportJsonFile}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={handleExportCurrentJson}
              >
                <HugeiconsIcon icon={CodeIcon} className="h-4 w-4" />
                Export current JSON
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={handleImportJsonClick}
              >
                <HugeiconsIcon icon={CodeIcon} className="h-4 w-4" />
                Load JSON
              </Button>
            </div>
            {jsonNotice ? (
              <p className="text-xs text-muted-foreground">{jsonNotice}</p>
            ) : null}
            {jsonError ? (
              <p className="text-xs text-destructive">{jsonError}</p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Button variant="outline" size="icon" asChild aria-label="Collections">
        <Link href="/collections">
          <HugeiconsIcon icon={AdventureIcon} />
        </Link>
      </Button>

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
