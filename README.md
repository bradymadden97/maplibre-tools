# maplibre-tools

## To run a reproduction

```bash
pnpm i
pnpm dev:repro <repro-dir-name> # e.g. `slow-zoom-on-large-feature-state`
```

## To run a reproduction against a local maplibre

1. Update `package.json` to point at your local maplibre:

    ```json
    "dependencies": {
        "maplibre-gl": "file:../../maplibre/maplibre-gl-js"
    }
    ```

2. You'll need to restart `pnpm dev:repro ...` after every change to maplibre,
as we don't yet support hot reloading of node modules.
