/**
 * 2D-Canvas-Renderer: zeichnet Marker/Labels für sichtbare Geo-Anchors
 * und Pfeile am Bildschirmrand für Anchors außerhalb des Sichtfelds.
 * Kennt nur die Szene (Pose + Anchors), keine Sensoren.
 */

import { computeViewProjMatrix } from "../renderer.js";
import { worldToScreen } from "../../math/projection/worldToScreen.js";
import { create as mat4Create } from "../../math/mat4.js";
import { drawMarker } from "./marker.js";
import { drawLabel } from "./label.js";
import { drawEdgeArrow } from "./edgeArrow.js";

/**
 * Erzeugt einen 2D-Canvas-Renderer für das übergebene Canvas-Element.
 * @param {HTMLCanvasElement} canvas Ziel-Canvas (transparenter Overlay
 *   über der Kamera-Vorschau, `canvas.width`/`canvas.height` bestimmen
 *   den Viewport).
 * @returns {import("../renderer.js").Renderer} Renderer mit
 *   `render(scene)`.
 */
export function createRenderer2D(canvas) {
  const ctx = canvas.getContext("2d");
  const viewProj = mat4Create();
  const screenPoint = { x: 0, y: 0, depth: 0, visible: false };

  function render(scene) {
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (scene.anchors.length === 0) return;

    computeViewProjMatrix(viewProj, scene.pose, width, height);

    for (const anchor of scene.anchors) {
      worldToScreen(screenPoint, anchor.scenePosition, viewProj, width, height);
      if (screenPoint.visible) {
        drawMarker(ctx, screenPoint.x, screenPoint.y);
        drawLabel(ctx, screenPoint.x, screenPoint.y, anchor.name);
      } else {
        drawEdgeArrow(ctx, screenPoint.x, screenPoint.y, width, height, anchor.name);
      }
    }
  }

  return { render };
}
