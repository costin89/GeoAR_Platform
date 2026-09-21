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
