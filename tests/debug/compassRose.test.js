import { test, assertClose, assertEqual } from "../runner.js";
import { createCompassRoseAnchors } from "../../src/debug/compassRose.js";

test("createCompassRoseAnchors: vier Anchors in Reihenfolge N/O/S/W", () => {
  const anchors = createCompassRoseAnchors(100);
  assertEqual(anchors.length, 4);
  assertEqual(anchors[0].name, "N");
  assertEqual(anchors[1].name, "O");
  assertEqual(anchors[2].name, "S");
  assertEqual(anchors[3].name, "W");
});

test("createCompassRoseAnchors: Positionen entsprechen der Szenen-Konvention (x=Ost, z=-Nord)", () => {
  const [north, east, south, west] = createCompassRoseAnchors(100);
  assertClose(north.scenePosition[0], 0, 1e-9);
  assertClose(north.scenePosition[2], -100, 1e-9);
  assertClose(east.scenePosition[0], 100, 1e-9);
  assertClose(east.scenePosition[2], 0, 1e-9);
  assertClose(south.scenePosition[0], 0, 1e-9);
  assertClose(south.scenePosition[2], 100, 1e-9);
  assertClose(west.scenePosition[0], -100, 1e-9);
  assertClose(west.scenePosition[2], 0, 1e-9);
});

test("createCompassRoseAnchors: benutzerdefinierte Distanz wird übernommen", () => {
  const [north] = createCompassRoseAnchors(50);
  assertClose(north.scenePosition[2], -50, 1e-9);
});

test("createCompassRoseAnchors: alle Anchors liegen auf Bodenhöhe y=0", () => {
  for (const anchor of createCompassRoseAnchors()) {
    assertClose(anchor.scenePosition[1], 0, 1e-9);
  }
});
