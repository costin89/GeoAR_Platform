import { test, assertClose } from "../../runner.js";
import { haversineDistance } from "../../../src/math/geo/haversine.js";

test("1° Breitengrad-Differenz ≈ 111195 m", () => {
  const d = haversineDistance(0, 0, 1, 0);
  assertClose(d, 111195, 1);
});

test("Distanz eines Punktes zu sich selbst ist 0", () => {
  const d = haversineDistance(52.52, 13.405, 52.52, 13.405);
  assertClose(d, 0, 1e-6);
});

// Feldtest-Referenzwerte vom echten Teststandort (49.8126, 8.6494) zu
// vier realen Städten, siehe data/places.json. Erwartete Werte laut
// Auftrag, Toleranz 1 km.
const TEST_ORIGIN = { latDeg: 49.8126, lonDeg: 8.6494 };

test("Distanz zu Frankfurt am Main ≈ 33 km", () => {
  const distanceM = haversineDistance(TEST_ORIGIN.latDeg, TEST_ORIGIN.lonDeg, 50.1109, 8.6821);
  assertClose(distanceM / 1000, 33, 1);
});

test("Distanz zu Mannheim ≈ 39 km", () => {
  const distanceM = haversineDistance(TEST_ORIGIN.latDeg, TEST_ORIGIN.lonDeg, 49.4828, 8.466);
  assertClose(distanceM / 1000, 39, 1);
});

test("Distanz zu Aschaffenburg ≈ 40 km", () => {
  const distanceM = haversineDistance(TEST_ORIGIN.latDeg, TEST_ORIGIN.lonDeg, 49.9769, 9.15);
  assertClose(distanceM / 1000, 40, 1);
});

test("Distanz zu Saarbrücken ≈ 135 km", () => {
  const distanceM = haversineDistance(TEST_ORIGIN.latDeg, TEST_ORIGIN.lonDeg, 49.2401, 6.9969);
  assertClose(distanceM / 1000, 135, 1);
});
