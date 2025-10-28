import { Map } from "maplibre-gl";

const SOURCE = "";
const map = new Map({
  container: "map",
  style: `https://tiles.openfreemap.org/styles/bright`,
  center: [-86.158, 39.7691],
  zoom: 2,
});
globalThis.map = map;

map.on("load", async () => {
  // Add some more fake properties to each to highlight slow read path
  const data = await fetch(SOURCE).then((r) => r.json());
  for (const feature of data.features) {
    for (let i = 0; i < 25; i++) {
      feature.properties[`fake-${i}`] = "" + Math.random() + Math.random();
    }
  }

  // Add geojson source
  map.addSource("airports", { data, promoteId: "pk", type: "geojson" });

  // Add icon layer
  map.addLayer({
    id: "airport-icons",
    type: "symbol",
    source: "airports",
    layout: {
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
      "icon-image": "airport",
      "icon-size": 1,
    },
  });

  // Add feature-state-dependent layer
  map.addLayer({
    id: "airport-circle",
    type: "circle",
    source: "airports",
    paint: {
      "circle-color": "rgba(0,0,0,0)",
      "circle-radius": 16,
      "circle-stroke-color": "#ff9800",
      "circle-stroke-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1,
        0,
      ],
      "circle-stroke-width": 2,
    },
  });

  // Mark and unmark every airport to populate a large feature state
  for (const i of data.features) {
    map.setFeatureState(
      { source: "airports", id: i.properties.pk },
      { hover: true }
    );
    map.removeFeatureState({ source: "airports", id: i.properties.pk });
  }

  // Initially load tiles at each level
  await zoomAndWaitForLoad(map, 5, 1000);
  await zoomAndWaitForLoad(map, 6, 500);
  await zoomAndWaitForLoad(map, 7, 500);

  // Loop and exhibit slow behavior
  let i = 0;
  while (i < 10) {
    await zoomAndWaitForLoad(map, 6, 500);
    await zoomAndWaitForLoad(map, 5, 500);
    await zoomAndWaitForLoad(map, 6, 500);
    await zoomAndWaitForLoad(map, 7, 500);
    i++;
  }
});

async function zoomAndWaitForLoad(map, level, duration) {
  map.zoomTo(level, { duration });
  do {
    await new Promise((r) => setTimeout(r, duration));
  } while (!map.areTilesLoaded());
}
