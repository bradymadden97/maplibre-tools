import * as fs from "fs";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import { MAPLIBRE_CSP_WORKER_DEV_FILENAME } from "./constants/consts";

const resolveMaplibreCspWorkerPlugin = (): Plugin => ({
  name: "resolve-maplibre-csp-worker-plugin",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === `/${MAPLIBRE_CSP_WORKER_DEV_FILENAME}`) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(
          fs.readFileSync(
            path.join(
              path.dirname(require.resolve("maplibre-gl")),
              MAPLIBRE_CSP_WORKER_DEV_FILENAME
            )
          )
        );
        return;
      }
      next();
    });
  },
});

export default defineConfig({
  plugins: [resolveMaplibreCspWorkerPlugin()],
});
