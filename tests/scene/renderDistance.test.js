import { test, assertClose } from "../runner.js";
import { computeRenderPosition } from "../../src/scene/renderDistance.js";
import { create as vec3Create, dot, length } from "../../src/math/vec3.js";
import { radToDeg } from "../../src/math/angle.js";

function angleBetweenDeg(a, b) {
  const cosAngle = dot(a, b) / (length(a) * length(b));
  return radToDeg(Math.acos(Math.min(1, Math.max(-1, cosAngle))));
}

test("computeRenderPosition: Anker innerhalb der Distanz bleibt unverändert", () => {
  const camera = [0, 0, 0];
  const anchor = [100, 0, -200];
  const out = vec3Create();
  const { position, distanceM } = computeRenderPosition(out, camera, anchor, 1000);
  assertClose(position[0], 100, 1e-9);
  assertClose(position[2], -200, 1e-9);
  assertClose(distanceM, Math.sqrt(100 * 100 + 200 * 200), 1e-6);
});

test("computeRenderPosition: Punkt 446 km Richtung Nordost wird auf 1000 m Distanz gestaucht, Richtung bleibt exakt", () => {
  const camera = [0, 0, 0];
  const distanceRealM = 446000;
  const dirLen = Math.sqrt(2);
  // Nordost in Szenen-Koordinaten: +x (Ost), -z (Nord).
  const anchor = [distanceRealM / dirLen, 0, -(distanceRealM / dirLen)];
  const out = vec3Create();
  const { position, distanceM } = computeRenderPosition(out, camera, anchor, 1000);

  assertClose(length(position), 1000, 1e-6);
  assertClose(distanceM, distanceRealM, 1);
  assertClose(angleBetweenDeg(position, anchor), 0, 0.01);
});

test("computeRenderPosition: Richtung bleibt auch bei Kamera fernab vom Ursprung exakt erhalten", () => {
  const camera = [50, 0, 50];
  const anchor = [50 + 300000, 0, 50 - 300000];
  const out = vec3Create();
  const { position } = computeRenderPosition(out, camera, anchor, 1000);

  const offsetResult = [position[0] - camera[0], position[1] - camera[1], position[2] - camera[2]];
  const offsetOriginal = [anchor[0] - camera[0], anchor[1] - camera[1], anchor[2] - camera[2]];

  assertClose(length(offsetResult), 1000, 1e-6);
  assertClose(angleBetweenDeg(offsetResult, offsetOriginal), 0, 0.01);
});

test("computeRenderPosition: Anker genau an der Grenze bleibt unverändert", () => {
  const camera = [0, 0, 0];
  const anchor = [1000, 0, 0];
  const out = vec3Create();
  const { position, distanceM } = computeRenderPosition(out, camera, anchor, 1000);
  assertClose(position[0], 1000, 1e-9);
  assertClose(distanceM, 1000, 1e-9);
});
