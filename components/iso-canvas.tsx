"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMapStore } from "@/lib/store";
import { SPRITE_TILE_H, SPRITE_TILE_W } from "@/lib/tiles";

export default function IsoCanvas() {
  const bgRef = useRef<HTMLCanvasElement>(null);
  const fgRef = useRef<HTMLCanvasElement>(null);
  const textureRef = useRef<HTMLImageElement | null>(null);
  const isPlacingRef = useRef(false);

  const { map, gridSize, activeTool, setTile, clearTile } = useMapStore();

  const tileWidth = 128;
  const tileHeight = 64;

  const canvasWidth = (gridSize + 1) * tileWidth;
  const canvasHeight = gridSize * tileHeight + SPRITE_TILE_H;

  const originX = canvasWidth / 2;
  const originY = tileHeight * 2;

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
    ) => {
      if (!textureRef.current) return;
      ctx.save();
      ctx.translate(
        originX + (y - x) * (tileWidth / 2),
        originY + (x + y) * (tileHeight / 2),
      );
      const sx = col * SPRITE_TILE_W;
      const sy = row * SPRITE_TILE_H;
      ctx.drawImage(
        textureRef.current,
        sx,
        sy,
        SPRITE_TILE_W,
        SPRITE_TILE_H,
        -SPRITE_TILE_W / 2,
        -130, // ← was: -SPRITE_TILE_H + tileHeight (-166)
        SPRITE_TILE_W,
        SPRITE_TILE_H,
      );
      ctx.restore();
    },
    [originX, originY, tileWidth, tileHeight],
  );

  const drawMap = useCallback(() => {
    const bg = bgRef.current?.getContext("2d");
    if (!bg || !textureRef.current) return;
    bg.clearRect(0, 0, canvasWidth, canvasHeight);
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        drawImageTile(bg, i, j, map[i][j][0], map[i][j][1]);
      }
    }
  }, [map, gridSize, canvasWidth, canvasHeight, drawImageTile]);

  // Load texture
  useEffect(() => {
    const img = new Image();
    img.src = "/textures/shire.png"; // ← Remove "public" prefix
    img.onload = () => {
      textureRef.current = img;
      drawMap();
    };
    img.onerror = () => {
      console.error(
        "Failed to load shire.png — make sure it exists at public/textures/shire.png",
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw on map/grid changes
  useEffect(() => {
    if (textureRef.current) drawMap();
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
      id="iso-canvas-wrapper"
      className="relative flex-1 overflow-auto flex items-center justify-center bg-muted/30"
    >
      <div
        className="relative"
        style={{ width: canvasWidth, height: canvasHeight }}
      >
        <canvas
          ref={bgRef}
          width={canvasWidth}
          height={canvasHeight}
          className="absolute inset-0"
        />
        <canvas
          ref={fgRef}
          width={canvasWidth}
          height={canvasHeight}
          className="absolute inset-0"
          onMouseDown={handleClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
}
