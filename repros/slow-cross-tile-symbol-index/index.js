import { Map } from "maplibre-gl";

const SOURCE = `https://raw.githubusercontent.com/bradymadden97/maplibre-tools/40e55bed355ca96895290b92c7e333f0a252221a/sources/state-capitals.geojson`;

function randomPointGenerator(lng, lat, radius) {
  return {
    type: "Point",
    coordinates: [
      lng + Math.random() * radius * (Math.random() > 0.5 ? -1 : 1),
      lat + Math.random() * radius * (Math.random() > 0.5 ? -1 : 1),
    ],
  };
}

(async function () {
  const style = await fetch(`https://tiles.openfreemap.org/styles/bright`)
    .then((r) => r.json())
    .then(({ layers, ...r }) => ({
      layers: layers.filter(
        (layer) =>
          !(
            layer.layout &&
            Object.keys(layer.layout).some(
              (key) => key.startsWith("text") || key.startsWith("icon")
            )
          )
      ),
      ...r,
    }));

  const map = new Map({
    container: "map",
    style,
    center: [-84.06868028061949, 36.41989560644305],
    zoom: 2,
    fadeDuration: 1_000,
  });
  globalThis.map = map;
  map.showTileBoundaries = true;

  map.on("load", async () => {
    const data = {
      type: "FeatureCollection",
      features: [],
    };
    for (let i = 0; i < 10_000; i++) {
      data.features.push({
        type: "Feature",
        properties: {
          label: i,
        },
        geometry: randomPointGenerator(-84, 36, 3.5),
      });
    }

    // Add geojson source
    map.addSource("capitals", {
      data,
      type: "geojson",
    });

    map.addLayer({
      id: "capital-icons",
      type: "symbol",
      source: "capitals",
      layout: {
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
        "icon-image": "museum",
        "icon-size": 1,
        "text-field": ["get", "label"],
        "text-font": ["Noto Sans Regular"],
        "text-offset": [0, 1.5],
        "text-size": 10,
      },
    });
  });

  await new Promise((r) => setTimeout(r, 2_000));
  zoomAndWaitForLoad(map, 6, 400);
  await new Promise((r) => setTimeout(r, 2_000));
  zoomAndWaitForLoad(map, 2, 400);

  // Add a click event listener to the map to get point
  map.on("click", (e) => {
    console.log("Map clicked at:", e.lngLat.lng, e.lngLat.lat);
  });
})();

async function zoomAndWaitForLoad(map, level, duration) {
  map.zoomTo(level, { duration });
  do {
    await new Promise((r) => setTimeout(r, duration));
  } while (!map.areTilesLoaded());
}
