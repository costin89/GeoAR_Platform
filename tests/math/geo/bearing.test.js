import { test, assertClose } from "../../runner.js";
import { initialBearing } from "../../../src/math/geo/bearing.js";

test("Bearing nach Norden (Äquator) = 0°", () => {
  assertClose(initialBearing(0, 0, 1, 0), 0, 1e-6);
});

test("Bearing nach Osten (Äquator) = 90°", () => {
  assertClose(initialBearing(0, 0, 0, 1), 90, 1e-6);
});

test("Bearing nach Süden (Äquator) = 180°", () => {
  assertClose(initialBearing(1, 0, 0, 0), 180, 1e-6);
});

test("Bearing nach Westen (Äquator) = 270°", () => {
  assertClose(initialBearing(0, 1, 0, 0), 270, 1e-6);
});

// Feldtest-Referenzwerte vom echten Teststandort (49.8126, 8.6494) zu
// vier realen Städten, siehe data/places.json. Erwartete Werte laut
// Auftrag, Toleranz 1° (Koordinaten so gewählt, dass sie innerhalb
// dieser Toleranz liegen – siehe SECOND_BRAIN für die Herleitung).
const TEST_ORIGIN = { latDeg: 49.8126, lonDeg: 8.6494 };

test("Bearing zu Frankfurt am Main ≈ 4°", () => {
  const bearingDeg = initialBearing(TEST_ORIGIN.latDeg, TEST_ORIGIN.lonDeg, 50.1109, 8.6821);
  assertClose(bearingDeg, 4, 1);
});

test("Bearing zu Mannheim ≈ 199°", () => {
  const bearingDeg = initialBearing(TEST_ORIGIN.latDeg, TEST_ORIGIN.lonDeg, 49.4828, 8.466);
  assertClose(bearingDeg, 199, 1);
});

test("Bearing zu Aschaffenburg ≈ 63°", () => {
  const bearingDeg = initialBearing(TEST_ORIGIN.latDeg, TEST_ORIGIN.lonDeg, 49.9769, 9.15);
  assertClose(bearingDeg, 63, 1);
});

test("Bearing zu Saarbrücken ≈ 242°", () => {
  const bearingDeg = initialBearing(TEST_ORIGIN.latDeg, TEST_ORIGIN.lonDeg, 49.2401, 6.9969);
  assertClose(bearingDeg, 242, 1);
});
