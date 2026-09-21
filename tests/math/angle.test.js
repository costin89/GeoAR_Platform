import { test, assertClose } from "../runner.js";
import {
  degToRad,
  radToDeg,
  normalizeDeg,
  normalizeRad,
  shortestAngleDiffDeg,
} from "../../src/math/angle.js";

test("degToRad/radToDeg sind zueinander invers", () => {
  assertClose(radToDeg(degToRad(90)), 90, 1e-9);
  assertClose(degToRad(radToDeg(1.2345)), 1.2345, 1e-9);
});

test("normalizeDeg bringt Werte auf [0, 360)", () => {
  assertClose(normalizeDeg(370), 10, 1e-9);
  assertClose(normalizeDeg(-10), 350, 1e-9);
  assertClose(normalizeDeg(0), 0, 1e-9);
});

test("normalizeRad bringt Werte auf [0, 2π)", () => {
  assertClose(normalizeRad(2 * Math.PI + 0.5), 0.5, 1e-9);
  assertClose(normalizeRad(-0.5), 2 * Math.PI - 0.5, 1e-9);
});

test("shortestAngleDiffDeg(359, 1) = 2", () => {
  assertClose(shortestAngleDiffDeg(359, 1), 2, 1e-9);
});

test("shortestAngleDiffDeg(1, 359) = -2", () => {
  assertClose(shortestAngleDiffDeg(1, 359), -2, 1e-9);
});
