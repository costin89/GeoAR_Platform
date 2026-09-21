import { test, assertClose, assertEqual } from "../runner.js";
import { createGeoAnchor, createGeoAnchors } from "../../src/scene/geoAnchor.js";

const origin = { latDeg: 52.52, lonDeg: 13.405, heightM: 0 };

test("createGeoAnchor: Anchor am Ursprung selbst liegt bei (0,0,0)", () => {
  const place = { id: "origin", name: "Ursprung", latDeg: origin.latDeg, lonDeg: origin.lonDeg, heightM: 0 };
  const anchor = createGeoAnchor(place, origin);
  assertEqual(anchor.id, "origin");
  assertEqual(anchor.name, "Ursprung");
  assertClose(anchor.scenePosition[0], 0, 1e-6);
  assertClose(anchor.scenePosition[1], 0, 1e-6);
  assertClose(anchor.scenePosition[2], 0, 1e-6);
});

test("createGeoAnchors: wandelt eine Liste von Places um", () => {
  const places = [
    { id: "a", name: "A", latDeg: origin.latDeg, lonDeg: origin.lonDeg, heightM: 0 },
    { id: "b", name: "B", latDeg: origin.latDeg, lonDeg: origin.lonDeg + 0.001, heightM: 0 },
  ];
  const anchors = createGeoAnchors(places, origin);
  assertEqual(anchors.length, 2);
  assertEqual(anchors[0].id, "a");
  assertEqual(anchors[1].id, "b");
  // Anchor "b" liegt östlich -> positive x-Koordinate in der Szene.
  assertClose(anchors[0].scenePosition[0], 0, 1e-6);
  assertEqual(anchors[1].scenePosition[0] > 0, true);
});
