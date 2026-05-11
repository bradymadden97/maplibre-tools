import { Map as MapLibre } from "maplibre-gl";

const N = 10_000;
const status = document.getElementById("status");
function log(msg) {
  status.textContent += "\n" + msg;
}

// ── Track SI broadcasts ──
let siCount = 0;
let cloneMs = 0;
const origPM = Worker.prototype.postMessage;
Worker.prototype.postMessage = function (msg, xfer) {
  if (msg?.type === "SI") siCount++;
  const t0 = performance.now();
  const r = origPM.call(this, msg, xfer);
  cloneMs += performance.now() - t0;
  return r;
};

// ── ~280 char icon names ──
function iconName(i) {
  const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let s = "";
  for (let j = 0; j < 190; j++) s += c[(i * 7 + j * 13) % c.length];
  return `https://example.com/api/symbols/generic/${s}?size=40&i=${i}`;
}

// ── Ship icon base image (render SVG once, then tint with canvas compositing) ──
const SHIP_PATH = new Path2D(
  "M6.84.804 6.5 2.5h-3a1 1 0 0 0-1 1v4.893l-1.58.451a.99.99 0 0 0-.691 1.192c.46 1.82 1.163 4.356 1.701 5.571q-.327.018-.68.018a.625.625 0 0 0 0 1.25c2.583 0 4.268-.68 5.202-1.146.687.466 1.88 1.146 3.548 1.146 1.65 0 2.837-.666 3.528-1.132l.005.003c.244.131.6.3 1.07.468.938.335 2.321.661 4.147.661a.624.624 0 1 0 0-1.25q-.484 0-.922-.031a1 1 0 0 0 .184-.334l1.67-5.168a1 1 0 0 0-.677-1.27l-1.505-.43V3.5a1 1 0 0 0-1-1h-3L13.16.804A1 1 0 0 0 12.18 0H7.82a1 1 0 0 0-.98.804M5 7.679V5h3.75v1.607zm6.25-1.072V5H15v2.68zM6.205 16.95a.63.63 0 0 1 .658.042c.569.407 1.597 1.134 3.137 1.134s2.568-.727 3.137-1.134a.625.625 0 0 1 .724-.001l.007.005.045.029q.066.042.21.12a6.6 6.6 0 0 0 .9.392c.811.29 2.053.589 3.727.589a.624.624 0 1 1 0 1.25c-1.826 0-3.21-.326-4.148-.661a8 8 0 0 1-1.069-.468l-.005-.003c-.691.466-1.878 1.132-3.528 1.132-1.667 0-2.861-.68-3.548-1.146-.934.467-2.619 1.146-5.202 1.146a.625.625 0 1 1 0-1.25c2.66 0 4.23-.787 4.955-1.176",
);
const ICON_SIZE = 20;

// Render the ship path once as a white-on-transparent base image
function createBaseShip() {
  const c = document.createElement("canvas");
  c.width = ICON_SIZE;
  c.height = ICON_SIZE;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fill(SHIP_PATH, "evenodd");
  return c;
}

// Tint via canvas compositing — same fast approach as the original repro
function tintIcon(baseCanvas, tintCanvas, tintCtx, color) {
  tintCtx.clearRect(0, 0, ICON_SIZE, ICON_SIZE);
  tintCtx.drawImage(baseCanvas, 0, 0);
  tintCtx.globalCompositeOperation = "multiply";
  tintCtx.fillStyle = color;
  tintCtx.fillRect(0, 0, ICON_SIZE, ICON_SIZE);
  tintCtx.globalCompositeOperation = "destination-in";
  tintCtx.drawImage(baseCanvas, 0, 0);
  tintCtx.globalCompositeOperation = "source-over";
  return tintCtx.getImageData(0, 0, ICON_SIZE, ICON_SIZE);
}

function createPlaceholder() {
  const c = document.createElement("canvas");
  c.width = ICON_SIZE;
  c.height = ICON_SIZE;
  const ctx = c.getContext("2d");
  const path = new Path2D(
    "M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0M7.41 4.62c.65-.54 1.51-.82 2.56-.82.54 0 1.03.08 1.48.25.44.17.83.39 1.14.68.32.29.56.63.74 1.02.17.39.26.82.26 1.27s-.08.87-.24 1.23c-.16.37-.4.73-.71 1.11l-1.21 1.58c-.14.17-.28.33-.32.48-.05.15-.11.35-.11.6v.97H9v-2s.06-.58.24-.81l1.21-1.64c.25-.3.41-.56.51-.77s.14-.44.14-.67c0-.35-.11-.63-.32-.85s-.5-.33-.88-.33c-.37 0-.67.11-.89.33-.22.23-.37.54-.46.94-.03.12-.11.17-.23.16l-1.95-.29c-.12-.01-.16-.08-.14-.22.13-.93.52-1.67 1.18-2.22M9 14h2.02L11 16H9z",
  );
  ctx.fillStyle = "#888888";
  ctx.fill(path, "evenodd");
  return ctx.getImageData(0, 0, ICON_SIZE, ICON_SIZE);
}

// ── Clustered points around shipping lanes ──
const clusters = [
  { center: [-98, 38], spread: 15, weight: 0.2 }, // NA
  { center: [-60, -15], spread: 12, weight: 0.15 }, // SA
  { center: [15, 50], spread: 10, weight: 0.2 }, // EU
  { center: [30, 5], spread: 15, weight: 0.15 }, // AF
  { center: [100, 35], spread: 15, weight: 0.2 }, // Asia
  { center: [135, -25], spread: 8, weight: 0.1 }, // Oceania
];

function randomPoint() {
  let r = Math.random(),
    cum = 0;
  let c = clusters[clusters.length - 1];
  for (const cl of clusters) {
    cum += cl.weight;
    if (r <= cum) {
      c = cl;
      break;
    }
  }
  const lng = c.center[0] + (Math.random() - 0.5) * 2 * c.spread;
  const lat = Math.max(
    -85,
    Math.min(85, c.center[1] + (Math.random() - 0.5) * 2 * c.spread),
  );
  return [+lng.toFixed(6), +lat.toFixed(6)];
}

// ── Map ──
const map = new MapLibre({
  container: "map",
  style: "https://tiles.openfreemap.org/styles/bright",
  center: [0, 20],
  zoom: 1,
});

map.on("load", () => {
  // GeoJSON source with N points
  const features = [];
  for (let i = 0; i < N; i++) {
    const props = {
      fid: `v${i}`,
      iconImage: "__placeholder__",
    };

    // Push 100 properties onto the feature to make the loadData payload larger
    for (let p = 0; p < 100; p++) props[`prop_${p}`] = `value_${i}_${p}`;

    features.push({
      type: "Feature",
      id: `v${i}`,
      properties: props,
      geometry: { type: "Point", coordinates: randomPoint() },
    });
  }

  map.addImage("__placeholder__", createPlaceholder());

  map.addSource("vessels", {
    type: "geojson",
    data: { type: "FeatureCollection", features },
    promoteId: "fid",
  });

  map.addLayer({
    id: "vessel-icons",
    type: "symbol",
    source: "vessels",
    layout: {
      "icon-image": ["get", "iconImage"],
      "icon-allow-overlap": true,
    },
  });

  log(`Source added: ${N} features`);

  // ── Pre-tint all ship icons (fast canvas compositing, no async) ──
  const baseShip = createBaseShip();
  const tintCanvas = document.createElement("canvas");
  tintCanvas.width = ICON_SIZE;
  tintCanvas.height = ICON_SIZE;
  const tintCtx = tintCanvas.getContext("2d", { willReadFrequently: true });

  console.time("pre-tint icons");
  const iconImages = new Map();
  for (let i = 0; i < N; i++) {
    const color = `hsl(${(i * 37) % 360},70%,50%)`;
    iconImages.set(iconName(i), tintIcon(baseShip, tintCanvas, tintCtx, color));
  }
  console.timeEnd("pre-tint icons");
  log(`${iconImages.size} ship icons ready`);

  // ── Load/add icons in chunks ──
  const BURST = 250;
  const DELAY = 50;
  let idx = 0;
  const source = map.getSource("vessels");

  siCount = 0;
  cloneMs = 0;
  const t0 = performance.now();

  function burst() {
    const end = Math.min(idx + BURST, N);
    const upsert = [];

    for (let i = idx; i < end; i++) {
      const name = iconName(i);
      if (!map.hasImage(name)) map.addImage(name, iconImages.get(name));
      upsert.push({
        ...features[i],
        properties: { ...features[i].properties, iconImage: name },
      });
    }
    source.updateData({ add: upsert });
    idx = end;

    const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
    status.textContent = `Adding icons: ${idx}/${N}  (${elapsed}s, ${siCount} SI broadcasts, ${cloneMs.toFixed(0)}ms clone)`;

    if (idx < N) {
      setTimeout(burst, DELAY);
    } else {
      status.textContent = [
        `Done. ${N} icons added.`,
        `  setImages broadcasts: ${siCount}`,
        `  postMessage clone time: ${cloneMs.toFixed(0)}ms`,
      ].join("\n");
    }
  }

  // Small delay to let initial tiles load
  setTimeout(burst, 1000);
});
