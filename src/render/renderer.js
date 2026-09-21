/**
 * Gemeinsames Interface und geteilte Kamera-Mathe für 2D- und
 * 3D-Renderer. Kennt nur die Pose (Position + Ausrichtung), keine
 * Sensoren.
 */

import { fromRotationTranslation, invert, multiply, create as mat4Create } from "../math/mat4.js";
import { perspective as buildPerspective } from "../math/projection/perspective.js";
import { degToRad } from "../math/angle.js";
import { CAMERA_FOV_Y_DEG, CAMERA_NEAR_M, CAMERA_FAR_M } from "../core/config.js";

/**
 * @typedef {{render: (scene: import("../scene/scene.js").Scene) => void}} Renderer
 *   Jeder Renderer (2D wie 3D) implementiert `render(scene)` und liest
 *   dabei nur `scene.pose` und `scene.anchors`.
 */

/**
 * Berechnet die kombinierte View-Projektions-Matrix aus einer Pose und
 * der Viewport-Größe. Wird von jedem Renderer genutzt, damit die
 * Kamera-Mathe nicht mehrfach implementiert wird.
 * @param {Float32Array} out Zielmatrix (4×4, column-major).
 * @param {import("../trackers/pose.js").Pose} pose Aktuelle Kamera-Pose.
 * @param {number} widthPx Breite des Viewports in Pixeln.
 * @param {number} heightPx Höhe des Viewports in Pixeln.
 * @returns {Float32Array} out.
 */
export function computeViewProjMatrix(out, pose, widthPx, heightPx) {
  const cameraWorld = fromRotationTranslation(mat4Create(), pose.orientation, pose.position);
  const view = invert(mat4Create(), cameraWorld) ?? mat4Create();
  const aspect = widthPx / Math.max(heightPx, 1);
  const proj = buildPerspective(
    mat4Create(),
    degToRad(CAMERA_FOV_Y_DEG),
    aspect,
    CAMERA_NEAR_M,
    CAMERA_FAR_M
  );
  return multiply(out, proj, view);
}
