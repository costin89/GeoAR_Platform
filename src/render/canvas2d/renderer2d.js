/**
 * 2D-Canvas-Renderer: zeichnet Marker/Labels für sichtbare Geo-Anchors
 * und Pfeile am Bildschirmrand für Anchors außerhalb des Sichtfelds.
 * Kennt nur die Szene (Pose + Anchors), keine Sensoren.
 */

import { computeViewProjMatrix } from "../renderer.js";
import { worldToScreen } from "../../math/projection/worldToScreen.js";
import { create as mat4Create } from "../../math/mat4.js";
import { create as vec3Create } from "../../math/vec3.js";
import { computeRenderPosition } from "../../scene/renderDistance.js";
import { ANCHOR_MAX_RENDER_DISTANCE_M } from "../../core/config.js";
import { drawMarker } from "./marker.js";
import { drawLabel } from "./label.js";
import { drawEdgeArrow } from "./edgeArrow.js";

function formatAnchorLabel(name, distanceM) {
  const distanceText =
    distanceM >= 1000 ? `${(distanceM / 1000).toFixed(1)} km` : `${Math.round(distanceM)} m`;
  return `${name} – ${distanceText}`;
}

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
  const renderPosition = vec3Create();

  function render(scene) {
    // Fix 4: canvas.width/height sind die (per devicePixelRatio
    // vergrößerte) Backing-Store-Auflösung (siehe app.js#resizeArCanvases).
    // Für die Projektionsmathe und alle Zeichenaufrufe wird weiterhin in
    // CSS-Pixel-Einheiten gerechnet; `setTransform` skaliert das direkt
    // auf die Backing-Store-Pixel, ohne dass marker.js/label.js/
    // edgeArrow.js etwas von dpr wissen müssen.
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    if (scene.anchors.length === 0) return;

    computeViewProjMatrix(viewProj, scene.pose, width, height);

    for (const anchor of scene.anchors) {
      const { position, distanceM } = computeRenderPosition(
        renderPosition,
        scene.pose.position,
        anchor.scenePosition,
        ANCHOR_MAX_RENDER_DISTANCE_M
      );
      worldToScreen(screenPoint, position, viewProj, width, height);
      const label = formatAnchorLabel(anchor.name, distanceM);
      if (screenPoint.visible) {
        drawMarker(ctx, screenPoint.x, screenPoint.y);
        drawLabel(ctx, screenPoint.x, screenPoint.y, label);
      } else {
        drawEdgeArrow(ctx, screenPoint.x, screenPoint.y, width, height, label);
      }
    }
  }

  return { render };
}
