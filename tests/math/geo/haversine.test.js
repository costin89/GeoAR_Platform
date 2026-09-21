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
