import { setWorkerUrl } from "maplibre-gl";

if (__MAPLIBRE_LOCAL__) {
  setWorkerUrl("/maplibre-gl-worker-dev.mjs");
}

export * from "maplibre-gl";
