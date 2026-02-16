# Community Collections

Community maps live in `collections/maps` and are submitted via GitHub pull request.

## File format

Each map must be a JSON file with this path pattern:

- `collections/maps/<id>.json`

Use the schema in `collections/schema/map.schema.json`.

### Required fields

- `schemaVersion`: currently `1`
- `id`: kebab-case unique ID (must match filename)
- `name`: display name
- `author.name`: contributor name
- `author.github`: GitHub username
- `createdAt`: ISO date, for example `2026-02-16T00:00:00.000Z`
- `location`: one of `shire`, `gondor`, `mordor`, `lothlorien`, `rohan`, `moria`, `rivendell`, `mixed`
- `gridSize`: integer from `3` to `20`
- `map`: matrix of tile coordinates

## Tile format

Each tile in the map matrix is one of:

- `[row, col]`
- `[row, col, realm]`

Ranges:

- `row`: `0..5`
- `col`: `0..11`
- `realm`: only for mixed mode, one of `shire`, `gondor`, `mordor`, `lothlorien`, `rohan`, `moria`, `rivendell`

## Validate locally

```bash
npm run validate:collections
```

The same validation runs automatically in pull requests.
