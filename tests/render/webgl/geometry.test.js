import { test, assertClose, assertEqual, assertTrue } from "../../runner.js";
import { createConeMarkerGeometry } from "../../../src/render/webgl/geometry.js";

test("createConeMarkerGeometry: liefert die erwartete Anzahl Vertices/Indizes", () => {
  const segments = 8;
  const geo = createConeMarkerGeometry(1, 2, segments);
  // Mantel: 3 Vertices pro Segment (Spitze+2 Basis, dupliziert für glatte
  // Normalen). Grundfläche: 1 Mittelpunkt + `segments` Randpunkte.
  const expectedVertexCount = segments * 3 + (1 + segments);
  assertEqual(geo.positions.length, expectedVertexCount * 3);
  assertEqual(geo.normals.length, expectedVertexCount * 3);
  // Dreiecke: `segments` Mantel + `segments` Grundfläche.
  assertEqual(geo.indices.length, segments * 2 * 3);
});

test("createConeMarkerGeometry: Spitze liegt bei y=height, x=z=0", () => {
  const geo = createConeMarkerGeometry(1, 2.5, 6);
  // Erster Vertex jedes Mantel-Dreiecks ist die Spitze (siehe Quellcode).
  assertClose(geo.positions[0], 0, 1e-9);
  assertClose(geo.positions[1], 2.5, 1e-9);
  assertClose(geo.positions[2], 0, 1e-9);
});

test("createConeMarkerGeometry: Grundflächen-Vertices liegen im Abstand `radius` von der Achse, bei y=0", () => {
  const radius = 1.5;
  const geo = createConeMarkerGeometry(radius, 2, 10);
  // Grundflächen-Randpunkte: 2. Vertex jedes Mantel-Dreiecks (Index 1 der
  // 3er-Gruppe), siehe base0 im Quellcode.
  for (let i = 0; i < 10; i++) {
    const base = (i * 3 + 1) * 3; // Vertex-Index 1 im i-ten Dreieck, *3 Floats
    const x = geo.positions[base];
    const y = geo.positions[base + 1];
    const z = geo.positions[base + 2];
    assertClose(y, 0, 1e-9);
    assertClose(Math.sqrt(x * x + z * z), radius, 1e-6);
  }
});

test("createConeMarkerGeometry: alle Normalen sind (näherungsweise) Einheitsvektoren", () => {
  const geo = createConeMarkerGeometry(1, 2, 8);
  for (let i = 0; i < geo.normals.length; i += 3) {
    const x = geo.normals[i];
    const y = geo.normals[i + 1];
    const z = geo.normals[i + 2];
    const len = Math.sqrt(x * x + y * y + z * z);
    assertClose(len, 1, 1e-6);
  }
});

test("createConeMarkerGeometry: funktioniert auch mit dem Minimum von 3 Segmenten", () => {
  const geo = createConeMarkerGeometry(1, 1, 3);
  assertTrue(geo.indices.length > 0, "sollte Dreiecke erzeugen");
  assertEqual(geo.indices.length, 3 * 2 * 3);
});
