import * as fs from "fs";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import { MAPLIBRE_CSP_WORKER_DEV_FILENAME } from "./constants/consts";

const useLocalMaplibre = !!process.env.MAPLIBRE_LOCAL;
const maplibreDist = useLocalMaplibre
  ? path.resolve(__dirname, "../../maplibre/maplibre-gl-js/dist")
  : null;

const serveMaplibreWorkerPlugin = (): Plugin => ({
  name: "serve-maplibre-worker",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === `/${MAPLIBRE_CSP_WORKER_DEV_FILENAME}`) {
        const workerPath = maplibreDist
          ? path.join(maplibreDist, MAPLIBRE_CSP_WORKER_DEV_FILENAME)
          : path.join(path.dirname(require.resolve("maplibre-gl")), MAPLIBRE_CSP_WORKER_DEV_FILENAME);
        res.writeHead(200, { "Content-Type": "text/javascript" });
        res.end(fs.readFileSync(workerPath));
        return;
      }
      if (maplibreDist && req.url === "/maplibre-gl-worker-dev.mjs") {
        res.writeHead(200, { "Content-Type": "text/javascript" });
        res.end(fs.readFileSync(path.join(maplibreDist, "maplibre-gl-worker-dev.mjs")));
        return;
      }
      next();
    });
  },
});

export default defineConfig({
  define: {
    __MAPLIBRE_LOCAL__: JSON.stringify(useLocalMaplibre),
  },
  resolve: {
    alias: maplibreDist
      ? [{ find: /^maplibre-gl$/, replacement: path.join(maplibreDist, "maplibre-gl-dev.mjs") }]
      : [],
  },
  server: {
    fs: {
      strict: !useLocalMaplibre,
    },
  },
  plugins: [serveMaplibreWorkerPlugin()],
});
