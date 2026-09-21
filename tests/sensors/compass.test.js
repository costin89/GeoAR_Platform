import { test, assertClose } from "../runner.js";
import { correctHeadingForScreenRotation } from "../../src/sensors/compass.js";

test("correctHeadingForScreenRotation: ios-webkit bleibt unverändert (bereits korrigiert)", () => {
  const sample = { headingDeg: 123, accuracyDeg: null, source: "ios-webkit", absolute: true };
  assertClose(correctHeadingForScreenRotation(sample, 90), 123, 1e-9);
});

test("correctHeadingForScreenRotation: alpha-Quelle wird um den Bildschirmwinkel korrigiert", () => {
  const sample = { headingDeg: 100, accuracyDeg: null, source: "alpha", absolute: true };
  assertClose(correctHeadingForScreenRotation(sample, 0), 100, 1e-9);
  assertClose(correctHeadingForScreenRotation(sample, 90), 10, 1e-9);
});

test("correctHeadingForScreenRotation: Ergebnis bleibt im Bereich [0, 360)", () => {
  const sample = { headingDeg: 10, accuracyDeg: null, source: "alpha", absolute: true };
  assertClose(correctHeadingForScreenRotation(sample, 90), 280, 1e-9);
});
