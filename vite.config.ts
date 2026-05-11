import * as fs from "fs";
import path from "path";
import { defineConfig, type Plugin } from "vite";

// Load .env.local (no extra dependencies)
const envLocalPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envLocalPath)) {
  for (const line of fs.readFileSync(envLocalPath, "utf8").split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] ??= match[2].trim();
  }
}

const useLocalMaplibre = !!process.env.MAPLIBRE_LOCAL;
const localMaplibreRepo = process.env.LOCAL_MAPLIBRE;
const maplibreDist = useLocalMaplibre && localMaplibreRepo
  ? path.resolve(__dirname, localMaplibreRepo, "dist")
  : null;
const cspWorkerFilename = process.env.MAPLIBRE_CSP_WORKER_DEV_FILENAME || "maplibre-gl-csp-worker-dev.js";

const serveMaplibreWorkerPlugin = (): Plugin => ({
  name: "serve-maplibre-worker",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === `/${cspWorkerFilename}`) {
        const workerPath = maplibreDist
          ? path.join(maplibreDist, cspWorkerFilename)
          : path.join(path.dirname(require.resolve("maplibre-gl")), cspWorkerFilename);
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
    __MAPLIBRE_CSP_WORKER_FILENAME__: JSON.stringify(cspWorkerFilename),
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
