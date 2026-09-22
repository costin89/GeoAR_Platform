import { test, assertClose } from "../runner.js";
import { normalizeIntervalMs } from "../../src/sensors/gyroscope.js";

test("normalizeIntervalMs: plausible Millisekunden-Werte bleiben unverändert", () => {
  assertClose(normalizeIntervalMs(16), 16, 1e-9);
  assertClose(normalizeIntervalMs(8.3), 8.3, 1e-9);
});

test("normalizeIntervalMs: Werte < 1 werden als Sekunden interpretiert und in ms umgerechnet", () => {
  assertClose(normalizeIntervalMs(0.016), 16, 1e-9);
  assertClose(normalizeIntervalMs(0.008), 8, 1e-9);
});

test("normalizeIntervalMs: 0/undefined ergibt 0", () => {
  assertClose(normalizeIntervalMs(0), 0, 1e-9);
});
