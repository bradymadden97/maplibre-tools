import { Map } from "maplibre-gl";

// To run repro:
// 1. Start proxy source server, see instructions in `vector-tile-etag-proxy.ts`
// 4. Run the client using instructions in README
const SOURCE_URL = `http://localhost:3000/tiles/contours/tiles.json`;

(async function () {
  const map = new Map({
    center: [-122.447303, 37.753574],
    container: "map",
    style: `https://tiles.openfreemap.org/styles/bright`,
    zoom: 13,
  });
  globalThis.map = map;
  map.showTileBoundaries = true;

  map.on("load", async () => {
    map.addSource("contours", {
      type: "vector",
      url: SOURCE_URL,
    });
    map.addLayer({
      id: "terrain-data",
      type: "line",
      source: "contours",
      "source-layer": "contour",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#ff69b4",
        "line-width": 1,
      },
    });
  });
})();
