# maplibre-tools

## To run a reproduction

```bash
pnpm i
pnpm dev:repro <repro-dir-name> # e.g. `addimage-oom`
```

## To run against a local maplibre build

```bash
pnpm dev:repro:local <repro-dir-name>
```

This sets `MAPLIBRE_LOCAL=1` which aliases `maplibre-gl` imports to your local dev build at `../../maplibre/maplibre-gl-js/dist/maplibre-gl-dev.mjs`.

Your repro must handle the worker URL when using the local build:

```javascript
import { Map, setWorkerUrl } from "maplibre-gl";

if (__MAPLIBRE_LOCAL__) {
  setWorkerUrl("/maplibre-gl-worker-dev.mjs");
}
```

Rebuild maplibre (`npm run build-dev`) and restart the repro server after changes.
