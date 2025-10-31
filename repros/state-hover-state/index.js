import { Map } from "maplibre-gl";

const SOURCE = `https://maplibre.org/maplibre-gl-js/docs/assets/us_states.geojson`;
const map = new Map({
  container: "map",
  style: `https://tiles.openfreemap.org/styles/bright`,
  center: [-86.158, 39.7691],
  zoom: 2,
});
globalThis.map = map;
map.showTileBoundaries = true;
// //

map.on("load", async () => {
  const data = await fetch(SOURCE).then((r) => r.json());

  data.features = data.features.filter(
    (f) => f.properties.STATE_NAME === "Virginia"
  );

  // Add geojson source
  map.addSource("states", {
    data,
    promoteId: "STATE_NAME",
    type: "geojson",
    buffer: 1,
  });

  map.addLayer({
    id: "state-fills",
    type: "fill",
    source: "states",
    layout: {},
    paint: {
      "fill-color": "#627BC1",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1,
        0.5,
      ],
    },
  });

  map.addLayer({
    id: "state-borders",
    type: "line",
    source: "states",
    layout: {},
    paint: {
      "line-color": "#627BC1",
      "line-width": 2,
    },
  });

  // Mark and unmark every state to populate a large feature state
  for (const i of data.features) {
    map.setFeatureState(
      { source: "states", id: i.properties.STATE_NAME },
      { hover: true }
    );
    map.removeFeatureState({ source: "states", id: i.properties.STATE_NAME });
  }

  // Set up listeners
  let hoveredId = null;
  map.on("mousemove", "state-fills", (e) => {
    if (e.features.length > 0) {
      if (hoveredId && hoveredId !== e.features[0].id) {
        map.removeFeatureState({ source: "states", id: hoveredId });
      }
      hoveredId = e.features[0].id;
      map.setFeatureState({ source: "states", id: hoveredId }, { hover: true });
    }
  });

  map.on("mouseleave", "state-fills", () => {
    if (hoveredId) {
      map.removeFeatureState({ source: "states", id: hoveredId });
    }
    hoveredId = null;
  });
});
