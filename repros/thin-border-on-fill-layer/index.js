import { Map, setWorkerUrl } from "maplibre-gl";
import { MAPLIBRE_CSP_WORKER_DEV_FILENAME } from "../../constants/consts";

setWorkerUrl(MAPLIBRE_CSP_WORKER_DEV_FILENAME);

(async function () {
  const style = await fetch(`https://tiles.openfreemap.org/styles/dark`)
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
    data.features.push({
      type: "Feature",
      id: "x",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-81.10110944118937, 42.37803348895085],
            [-81.10110944118937, 38.37803348895085],
            [-76.10110944118937, 38.37803348895085],
            [-76.10110944118937, 42.37803348895085],
            [-81.10110944118937, 42.37803348895085],
          ],
        ],
      },
      properties: {
        iconRadius: 21,
        iconRotate: 0,
        iconScale: 1,
        iconSize: 1,
        iconOffset: [0, 0],
        labelOffset: [0, 1],
        labelColor: "#000000",
        labelTextSize: 16,
        textAnchor: "top",
        isHiddenAtCurrentTime: false,
        isNotInteractable: false,
        title: "",
        fillColor: "#FFFFFF",
        fillOpacity: 0.5019607843137255,
        strokeColor: "rgba(0,0,0,0)",
        strokeOpacity: 1,
        strokeWidth: 0,
        isHidden: false,
        partId: "",
      },
    });
    data.features.push({
      type: "Feature",
      id: "J",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-76.10110944118937, 42.37803348895085],
            [-76.10110944118937, 38.37803348895085],
            [-71.10110944118937, 38.37803348895085],
            [-71.10110944118937, 42.37803348895085],
            [-76.10110944118937, 42.37803348895085],
          ],
        ],
      },
      properties: {
        iconRadius: 21,
        iconRotate: 0,
        iconScale: 1,
        iconSize: 1,
        iconOffset: [0, 0],
        labelOffset: [0, 1],
        labelColor: "#000000",
        labelTextSize: 16,
        textAnchor: "top",
        isHiddenAtCurrentTime: false,
        isNotInteractable: false,
        title: "",
        fillColor: "#FFFFFF",
        fillOpacity: 0.5019607843137255,
        strokeColor: "rgba(0,0,0,0)",
        strokeOpacity: 1,
        strokeWidth: 0,
        isHidden: false,
        partId: "",
      },
    });

    // Add geojson source
    map.addSource("geojson_0", {
      data,
      type: "geojson",
    });

    map.addLayer({
      id: "geojson_0-fill",
      type: "fill",
      source: "geojson_0",
      metadata: {
        selectable: true,
        hoverable: true,
      },
      paint: {
        "fill-color": [
          "coalesce",
          ["get", "fillColor"],
          ["literal", "#2D72D2"],
        ],
        "fill-opacity": ["number", ["get", "fillOpacity"], 0],
        "fill-outline-color": "rgba(185, 54, 54, 1)",
      },
    });
  });
})();
