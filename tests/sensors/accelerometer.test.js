import { test, assertClose, assertEqual } from "../runner.js";
import { normalizeAccelerationForPlatform } from "../../src/sensors/accelerometer.js";

test("normalizeAccelerationForPlatform: Android/Desktop bleibt unverändert", () => {
  const result = normalizeAccelerationForPlatform(1, -9.8, 2, "android");
  assertClose(result.x, 1, 1e-9);
  assertClose(result.y, -9.8, 1e-9);
  assertClose(result.z, 2, 1e-9);
  assertEqual(result.normalized, false);
});

test("normalizeAccelerationForPlatform: iOS wird vorzeichenkorrigiert", () => {
  const result = normalizeAccelerationForPlatform(1, -9.8, 2, "ios");
  assertClose(result.x, -1, 1e-9);
  assertClose(result.y, 9.8, 1e-9);
  assertClose(result.z, -2, 1e-9);
  assertEqual(result.normalized, true);
});

test("normalizeAccelerationForPlatform: iOS aufrecht (roh (0,-9.8,0)) ergibt normalisiert (0,+9.8,0)", () => {
  const result = normalizeAccelerationForPlatform(0, -9.8, 0, "ios");
  assertClose(result.x, 0, 1e-9);
  assertClose(result.y, 9.8, 1e-9);
  assertClose(result.z, 0, 1e-9);
});

test("normalizeAccelerationForPlatform: Android aufrecht (roh (0,+9.8,0)) bleibt (0,+9.8,0)", () => {
  const result = normalizeAccelerationForPlatform(0, 9.8, 0, "android");
  assertClose(result.y, 9.8, 1e-9);
});
