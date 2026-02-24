"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMapStore } from "@/lib/store";
import { SPRITE_TILE_H, SPRITE_TILE_W, TILE_GROUPS } from "@/lib/tiles";
import {
  getTilePath,
  MIXED_TEXTURE_PLACE_ID,
  TEXTURE_PLACES,
} from "@/lib/textures";

export default function IsoCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const fgRef = useRef<HTMLCanvasElement>(null);
  const tileCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const isPlacingRef = useRef(false);
  const [displayScale, setDisplayScale] = useState(1);

  const { map, gridSize, activeTool, setTile, clearTile, location } =
    useMapStore();

  const tileWidth = 128;
  const tileHeight = 64;

  const canvasWidth = (gridSize + 1) * tileWidth;
  const canvasHeight = gridSize * tileHeight + SPRITE_TILE_H;

  const originX = canvasWidth / 2;
  const originY = tileHeight * 2;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const updateScale = () => {
      const availableWidth = Math.max(wrapper.clientWidth - 16, 1);
      const availableHeight = Math.max(wrapper.clientHeight - 16, 1);
      const widthScale = availableWidth / canvasWidth;
      const heightScale = availableHeight / canvasHeight;
      const nextScale = Math.min(1, widthScale, heightScale);
      setDisplayScale(Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [canvasWidth, canvasHeight]);

  const getPosition = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const scaleX = e.currentTarget.width / rect.width;
      const scaleY = e.currentTarget.height / rect.height;
      const offsetX = (e.clientX - rect.left) * scaleX;
      const offsetY = (e.clientY - rect.top) * scaleY;

      // Convert to the coordinate system relative to the origin
      const relX = offsetX - originX;
      const relY = offsetY - originY;

      // Inverse of the isometric projection
      const _x = relX / tileWidth;
      const _y = relY / tileHeight;

      const x = Math.floor(_y - _x);
      const y = Math.floor(_x + _y);
      return { x, y };
    },
    [originX, originY, tileWidth, tileHeight],
  );

  const drawImageTile = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      row: number,
      col: number,
      tileRealm?: string,
    ) => {
      const realmId =
        location === MIXED_TEXTURE_PLACE_ID ? tileRealm ?? TEXTURE_PLACES[0].id : location;
      const tilePath = getTilePath(realmId, row, col);
      const baseTilePath = getTilePath(realmId, 0, 0);
      const tileImage =
        tileCacheRef.current.get(tilePath) ?? tileCacheRef.current.get(baseTilePath);
      if (!tileImage) return;
      ctx.save();
      ctx.translate(
        originX + (y - x) * (tileWidth / 2),
        originY + (x + y) * (tileHeight / 2),
      );
      ctx.drawImage(
        tileImage,
        -SPRITE_TILE_W / 2,
        -130,
        SPRITE_TILE_W,
        SPRITE_TILE_H,
      );
      ctx.restore();
    },
    [location, originX, originY, tileWidth, tileHeight],
  );

  const drawMap = useCallback(() => {
    const bg = bgRef.current?.getContext("2d");
    if (!bg) return;
    bg.clearRect(0, 0, canvasWidth, canvasHeight);
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        drawImageTile(bg, i, j, map[i][j][0], map[i][j][1], map[i][j][2]);
      }
    }
  }, [map, gridSize, canvasWidth, canvasHeight, drawImageTile]);

  const getTileCoordinates = useCallback(() => {
    const coordKeys = new Set<string>();

    // Always preload each realm's base tile as a fallback.
    coordKeys.add("0:0");

    for (const group of TILE_GROUPS) {
      for (const tile of group.tiles) {
        if (tile.label !== "Empty") {
          coordKeys.add(`${group.row}:${tile.col}`);
        }
      }
    }

    for (const mapRow of map) {
      for (const [row, col] of mapRow) {
        if (Number.isInteger(row) && row >= 0 && Number.isInteger(col) && col >= 0) {
          coordKeys.add(`${row}:${col}`);
        }
      }
    }

    return Array.from(coordKeys, (coordKey) => {
      const [row, col] = coordKey.split(":").map(Number);
      return { row, col };
    });
  }, [map]);

  // Load all tile assets used by the current realm mode.
  useEffect(() => {
    let cancelled = false;
    const loadTile = (path: string) =>
      new Promise<void>((resolve, reject) => {
        if (tileCacheRef.current.has(path)) {
          resolve();
          return;
        }
        const img = new Image();
        img.src = path;
        img.onload = () => {
          tileCacheRef.current.set(path, img);
          resolve();
        };
        img.onerror = () => reject(new Error(path));
      });

    const realmIds =
      location === MIXED_TEXTURE_PLACE_ID
        ? TEXTURE_PLACES.map((place) => place.id)
        : [location];

    const tileCoords = getTileCoordinates();
    const tilePaths = Array.from(
      new Set(
        realmIds.flatMap((realmId) =>
          tileCoords.map(({ row, col }) => getTilePath(realmId, row, col)),
        ),
      ),
    );

    Promise.allSettled(tilePaths.map((path) => loadTile(path))).then((results) => {
      if (cancelled) return;
      const failed = results.filter((result) => result.status === "rejected");
      if (failed.length > 0) {
        console.error(
          `Failed to load ${failed.length} tile asset(s) for location: ${location}`,
        );
      }
      drawMap();
    });

    return () => {
      cancelled = true;
    };
  }, [location, getTileCoordinates, drawMap]);

  // Redraw on map/grid changes
  useEffect(() => {
    drawMap();
  }, [map, gridSize, drawMap]);

  const drawHover = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return;
    ctx.save();
    ctx.translate(
      originX + (y - x) * (tileWidth / 2),
      originY + (x + y) * (tileHeight / 2),
    );
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(tileWidth / 2, tileHeight / 2);
    ctx.lineTo(0, tileHeight);
    ctx.lineTo(-tileWidth / 2, tileHeight / 2);
    ctx.closePath();
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fill();
    ctx.restore();
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPosition(e);
    if (pos.x >= 0 && pos.x < gridSize && pos.y >= 0 && pos.y < gridSize) {
      if (e.button === 2) {
        clearTile(pos.x, pos.y);
      } else {
        setTile(pos.x, pos.y, activeTool);
      }
      isPlacingRef.current = true;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cf = fgRef.current?.getContext("2d");
    if (!cf) return;
    const pos = getPosition(e);

    if (isPlacingRef.current) {
      if (pos.x >= 0 && pos.x < gridSize && pos.y >= 0 && pos.y < gridSize) {
        if (e.buttons === 2) {
          clearTile(pos.x, pos.y);
        } else if (e.buttons === 1) {
          setTile(pos.x, pos.y, activeTool);
        }
      }
    }

    drawHover(cf, pos.x, pos.y);
  };

  const handleMouseUp = () => {
    isPlacingRef.current = false;
  };

  return (
    <div
      ref={wrapperRef}
      id="iso-canvas-wrapper"
      className="relative flex flex-1 items-center justify-center overflow-hidden bg-muted/30 p-2"
    >
      <div
        className="relative"
        style={{
          width: Math.round(canvasWidth * displayScale),
          height: Math.round(canvasHeight * displayScale),
        }}
      >
        <canvas
          ref={bgRef}
          width={canvasWidth}
          height={canvasHeight}
          className="absolute inset-0 h-full w-full touch-none"
        />
        <canvas
          ref={fgRef}
          width={canvasWidth}
          height={canvasHeight}
          className="absolute inset-0 h-full w-full touch-none"
          onMouseDown={handleClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
}
