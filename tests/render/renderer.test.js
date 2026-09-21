import { test, assertClose, assertTrue } from "../runner.js";
import { createPose } from "../../src/trackers/pose.js";
import { computeViewProjMatrix } from "../../src/render/renderer.js";
import { worldToScreen } from "../../src/math/projection/worldToScreen.js";
import { fromAxisAngle } from "../../src/math/quat.js";
import { degToRad } from "../../src/math/angle.js";
import { create as mat4Create } from "../../src/math/mat4.js";

test("computeViewProjMatrix: Punkt 5m nördlich (Heading 0°) landet in Bildmitte", () => {
  const pose = createPose();
  const viewProj = computeViewProjMatrix(mat4Create(), pose, 800, 600);
  const out = { x: 0, y: 0, depth: 0, visible: false };
  worldToScreen(out, [0, 0, -5], viewProj, 800, 600);
  assertClose(out.x, 400, 1e-2);
  assertClose(out.y, 300, 1e-2);
  assertTrue(out.visible, "Punkt sollte sichtbar sein");
});

test("computeViewProjMatrix: Punkt 5m östlich (Heading 90°) landet in Bildmitte", () => {
  const pose = createPose();
  fromAxisAngle(pose.orientation, [0, 1, 0], degToRad(-90));
  const viewProj = computeViewProjMatrix(mat4Create(), pose, 800, 600);
  const out = { x: 0, y: 0, depth: 0, visible: false };
  worldToScreen(out, [5, 0, 0], viewProj, 800, 600);
  assertClose(out.x, 400, 1e-2);
  assertClose(out.y, 300, 1e-2);
  assertTrue(out.visible, "Punkt sollte sichtbar sein");
});
