import { Map } from "maplibre-gl";

(async function () {
  const style = await fetch(`https://tiles.openfreemap.org/styles/bright`).then(
    (r) => r.json()
  );

  const map = new Map({
    container: "map",
    style,
    center: [-84.06868028061949, 36.41989560644305],
    zoom: 2,
    fadeDuration: 1_000,
  });
  globalThis.map = map;
  map.showTileBoundaries = true;

  var id = 1;
  function generateData() {
    id++;
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id,
          properties: {
            textProperty: "text",
            undefinedProperty: undefined,
          },
          geometry: {
            type: "Point",
            coordinates: [
              -84 + Math.random() * 3 * (Math.random() > 0.5 ? 1 : -1),
              36 + Math.random() * 3 * (Math.random() > 0.5 ? 1 : -1),
            ],
          },
        },
      ],
    };
  }

  map.on("load", async () => {
    // Add geojson source
    map.addSource("source", {
      data: generateData(),
      type: "geojson",
    });

    map.addLayer({
      id: "icons",
      type: "symbol",
      source: "source",
      layout: {
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
        "icon-image": "star",
        "icon-size": 1.15,
      },
    });

    map.addLayer({
      id: "circle",
      type: "circle",
      source: "source",
      paint: {
        "circle-color": "rgba(0,0,0,0)",
        "circle-radius": 16,
        "circle-stroke-color": "#ff9800",
        "circle-stroke-opacity": [
          "case",
          ["boolean", ["feature-state", "selected"], false],
          1,
          0,
        ],
        "circle-stroke-width": 2,
      },
    });
  });

  map.on("click", (e) => {
    map.removeFeatureState({ source: "source" });

    const features = map
      .queryRenderedFeatures(e.point)
      .filter(({ source }) => source === "source");
    if (features.length > 0) {
      features.forEach((feature) => {
        map.setFeatureState(
          { source: "source", id: feature.id },
          { selected: true }
        );
      });
    }

    map.getSource("source").updateData({
      add: generateData().features,
    });
  });
})();
