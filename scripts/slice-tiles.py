#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

try:
    from PIL import Image
except Exception as error:  # pragma: no cover - runtime guard
    print(f"✗ Pillow is required: {error}", file=sys.stderr)
    print("  Install with: python3 -m pip install Pillow", file=sys.stderr)
    sys.exit(1)


TILE_WIDTH = 130
TILE_HEIGHT = 230
SHEET_COLUMNS = 12
SHEET_ROWS = 6
TILE_FILE_RE = re.compile(r"^r(?P<row>\d+)-c(?P<col>\d+)\.png$")


@dataclass(frozen=True)
class Config:
    input_dir: Path | None
    output_dir: Path
    realms: list[str] | None
    clean: bool


def parse_args() -> Config:
    parser = argparse.ArgumentParser(
        description=(
            "Tile-only workflow: build manifest from public/tiles. "
            "Optional: also slice 12x6 sheets when --input-dir is provided."
        )
    )
    parser.add_argument(
        "--input-dir",
        default=None,
        help="Optional directory containing <realm>.png sheets to slice first.",
    )
    parser.add_argument(
        "--output-dir",
        default="public/tiles",
        help="Output directory containing per-tile realm folders.",
    )
    parser.add_argument(
        "--realms",
        default=None,
        help="Comma-separated realm IDs to process (default: infer from input/output).",
    )
    parser.add_argument("--clean", action="store_true", help="Delete output directory before processing.")

    args = parser.parse_args()
    realms = None
    if args.realms:
        realms = [item.strip() for item in args.realms.split(",") if item.strip()]
    return Config(
        input_dir=Path(args.input_dir).resolve() if args.input_dir else None,
        output_dir=Path(args.output_dir).resolve(),
        realms=realms,
        clean=args.clean,
    )


def to_posix_relative(root: Path, target: Path) -> str:
    try:
        return target.relative_to(root).as_posix()
    except ValueError:
        return target.as_posix()


def list_sheet_realms(input_dir: Path) -> list[str]:
    return sorted(path.stem for path in input_dir.glob("*.png") if path.is_file())


def list_tile_realms(output_dir: Path) -> list[str]:
    if not output_dir.is_dir():
        return []
    return sorted(path.name for path in output_dir.iterdir() if path.is_dir())


def slice_sheet(sheet_path: Path, realm_dir: Path) -> tuple[int, int]:
    with Image.open(sheet_path) as image:
        image = image.convert("RGBA")
        width, height = image.size
        for row in range(SHEET_ROWS):
            for col in range(SHEET_COLUMNS):
                left = col * TILE_WIDTH
                top = row * TILE_HEIGHT
                right = left + TILE_WIDTH
                bottom = top + TILE_HEIGHT
                tile = image.crop((left, top, right, bottom))
                tile.save(realm_dir / f"r{row}-c{col}.png")
    return width, height


def collect_realm_tiles(root: Path, realm_dir: Path) -> list[dict[str, object]]:
    tiles: list[dict[str, object]] = []
    for file_path in sorted(realm_dir.glob("r*-c*.png")):
        match = TILE_FILE_RE.match(file_path.name)
        if not match:
            continue
        row = int(match.group("row"))
        col = int(match.group("col"))
        tiles.append({"row": row, "col": col, "path": to_posix_relative(root, file_path)})
    tiles.sort(key=lambda tile: (int(tile["row"]), int(tile["col"])))
    return tiles


def summarize_rows(tiles: list[dict[str, object]]) -> list[dict[str, object]]:
    row_to_cols: dict[int, list[int]] = {}
    for tile in tiles:
        row = int(tile["row"])
        col = int(tile["col"])
        row_to_cols.setdefault(row, []).append(col)

    summary: list[dict[str, object]] = []
    for row in sorted(row_to_cols):
        unique_cols = sorted(set(row_to_cols[row]))
        summary.append({"row": row, "count": len(unique_cols), "cols": unique_cols})
    return summary


def main() -> int:
    root = Path.cwd().resolve()
    config = parse_args()

    if config.clean and config.output_dir.exists():
        shutil.rmtree(config.output_dir)

    config.output_dir.mkdir(parents=True, exist_ok=True)

    sheet_realms: list[str] = []
    if config.input_dir:
        if not config.input_dir.is_dir():
            print(
                f"✗ Input directory does not exist: {to_posix_relative(root, config.input_dir)}",
                file=sys.stderr,
            )
            return 1
        sheet_realms = list_sheet_realms(config.input_dir)
        if not sheet_realms:
            print(
                f"✗ No .png sheets found in {to_posix_relative(root, config.input_dir)}.",
                file=sys.stderr,
            )
            return 1

    available_realms = sorted(set(sheet_realms + list_tile_realms(config.output_dir)))
    if not available_realms:
        print(
            f"✗ No tile realms found in {to_posix_relative(root, config.output_dir)}.",
            file=sys.stderr,
        )
        return 1

    selected_realms = config.realms if config.realms is not None else available_realms
    unknown_realms = [realm for realm in selected_realms if realm not in available_realms]
    if unknown_realms:
        print(
            f"✗ Unknown realm(s): {', '.join(unknown_realms)}. "
            f"Available realms: {', '.join(available_realms)}.",
            file=sys.stderr,
        )
        return 1

    if config.input_dir:
        expected_width = TILE_WIDTH * SHEET_COLUMNS
        expected_height = TILE_HEIGHT * SHEET_ROWS
        for realm in selected_realms:
            sheet_path = config.input_dir / f"{realm}.png"
            if not sheet_path.exists():
                continue
            realm_dir = config.output_dir / realm
            realm_dir.mkdir(parents=True, exist_ok=True)
            width, height = slice_sheet(sheet_path, realm_dir)
            if width != expected_width or height != expected_height:
                print(
                    f"✗ Sheet size mismatch for {realm}. "
                    f"Expected {expected_width}x{expected_height}, got {width}x{height}.",
                    file=sys.stderr,
                )
                return 1
            print(f"✓ Sliced {realm} from sheet")

    manifest: dict[str, object] = {
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "tile": {
            "width": TILE_WIDTH,
            "height": TILE_HEIGHT,
            "sheetColumns": SHEET_COLUMNS,
            "sheetRows": SHEET_ROWS,
        },
        "realms": [],
    }

    for realm in selected_realms:
        realm_dir = config.output_dir / realm
        if not realm_dir.is_dir():
            print(
                f"✗ Missing realm tile directory: {to_posix_relative(root, realm_dir)}",
                file=sys.stderr,
            )
            return 1

        tiles = collect_realm_tiles(root, realm_dir)
        if not tiles:
            print(
                f"✗ No tile files found for realm: {realm}",
                file=sys.stderr,
            )
            return 1

        row_summary = summarize_rows(tiles)
        max_row = max((int(tile["row"]) for tile in tiles), default=0)
        max_col = max((int(tile["col"]) for tile in tiles), default=0)

        realm_item = {
            "id": realm,
            "tileCount": len(tiles),
            "maxRow": max_row,
            "maxCol": max_col,
            "rows": row_summary,
            "tiles": tiles,
        }
        cast_realms = manifest["realms"]
        assert isinstance(cast_realms, list)
        cast_realms.append(realm_item)
        print(f"✓ Indexed {realm}: {len(tiles)} tile(s)")

    manifest_path = config.output_dir / "manifest.json"
    manifest_path.write_text(f"{json.dumps(manifest, indent=2)}\n", encoding="utf-8")
    print(f"✓ Wrote manifest: {to_posix_relative(root, manifest_path)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
