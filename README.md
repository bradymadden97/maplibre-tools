# maplibre-tools

## To run a reproduction

```bash
pnpm i
pnpm dev:repro <repro-dir-name> # e.g. `addimage-oom`
```

## To run against a local maplibre build

1. Copy `.env.example` to `.env.local` and set `LOCAL_MAPLIBRE` to your local maplibre repo:

    ```
    LOCAL_MAPLIBRE=../../maplibre/maplibre-gl-js
    ```

2. Run with the `:local` variant:

    ```bash
    pnpm dev:repro:local <repro-dir-name>
    ```

Your repro must handle the worker URL when using the local build:

```javascript
import { Map, setWorkerUrl } from "maplibre-gl";

if (__MAPLIBRE_LOCAL__) {
  setWorkerUrl("/maplibre-gl-worker-dev.mjs");
}
```

Rebuild maplibre (`npm run build-dev`) and restart the repro server after changes.
