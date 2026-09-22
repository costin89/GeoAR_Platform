import { test, assertClose, assertTrue } from "../../runner.js";
import { perspective } from "../../../src/math/projection/perspective.js";
import { lookAt, multiply, create as mat4Create } from "../../../src/math/mat4.js";
import { worldToScreen } from "../../../src/math/projection/worldToScreen.js";
import { degToRad } from "../../../src/math/angle.js";
import {
  CAMERA_FOV_Y_DEG,
  CAMERA_NEAR_M,
  CAMERA_FAR_M,
  ANCHOR_MAX_RENDER_DISTANCE_M,
} from "../../../src/core/config.js";

function buildViewProj() {
  const view = lookAt(mat4Create(), [0, 0, 0], [0, 0, -1], [0, 1, 0]);
  const proj = perspective(mat4Create(), degToRad(60), 1, 0.1, 100);
  return multiply(mat4Create(), proj, view);
}

function buildRealisticViewProj() {
  const view = lookAt(mat4Create(), [0, 0, 0], [0, 0, -1], [0, 1, 0]);
  const proj = perspective(
    mat4Create(),
    degToRad(CAMERA_FOV_Y_DEG),
    1,
    CAMERA_NEAR_M,
    CAMERA_FAR_M
  );
  return multiply(mat4Create(), proj, view);
}

test("worldToScreen: Punkt direkt vor der Kamera landet in der Bildmitte", () => {
  const viewProj = buildViewProj();
  const out = { x: 0, y: 0, depth: 0, visible: false };
  worldToScreen(out, [0, 0, -5], viewProj, 800, 600);
  assertClose(out.x, 400, 1e-3);
  assertClose(out.y, 300, 1e-3);
  assertTrue(out.visible, "Punkt sollte sichtbar sein");
});

test("worldToScreen: Punkt hinter der Kamera ist visible=false", () => {
  const viewProj = buildViewProj();
  const out = { x: 0, y: 0, depth: 0, visible: true };
  worldToScreen(out, [0, 0, 5], viewProj, 800, 600);
  assertTrue(!out.visible, "Punkt hinter der Kamera sollte nicht sichtbar sein");
});

test("worldToScreen: Punkt bei 1000 m (ANCHOR_MAX_RENDER_DISTANCE_M) ist mit der echten Kamera-Konfiguration sichtbar und mittig", () => {
  const viewProj = buildRealisticViewProj();
  const out = { x: 0, y: 0, depth: 0, visible: false };
  worldToScreen(out, [0, 0, -ANCHOR_MAX_RENDER_DISTANCE_M], viewProj, 800, 600);
  assertClose(out.x, 400, 1e-2);
  assertClose(out.y, 300, 1e-2);
  assertTrue(
    out.visible,
    "Punkt bei 1000m sollte innerhalb der echten Far-Plane (CAMERA_FAR_M) sichtbar sein"
  );
});
