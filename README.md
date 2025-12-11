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

## To run against a stable worker name (unminified)
This is useful when you want to set a breakpoint within the 
worker code, and have it persist across page reloads. In the
normal path, maplibre uses Blob urls to construct its
workers, which are not stable. To work around this,
we can use their CSP build, which allows us to specify
a stable worker path.


1. Set worker name at the top of your `<repro>.js` file

    ```javascript
    import { Map, setWorkerUrl } from "maplibre-gl";
    import { MAPLIBRE_CSP_WORKER_DEV_FILENAME } from "../../constants/consts";

    setWorkerUrl(MAPLIBRE_CSP_WORKER_DEV_FILENAME);
    ```

2. Change your local maplibre `package.json` to

    ```json
    "main": "dist/maplibre-gl-csp-dev.js",
    ```
