/**
 * Projiziert einen Weltpunkt (Szenen-Koordinaten) auf Bildschirm-Pixel
 * mithilfe einer kombinierten View-Projektions-Matrix.
 */

/**
 * @typedef {{x: number, y: number, depth: number, visible: boolean}} ScreenPoint
 */

/**
 * Projiziert einen 3D-Weltpunkt auf Bildschirm-Koordinaten.
 * @param {ScreenPoint} out Zielobjekt (wird mutiert und zurückgegeben).
 * @param {number[]} point Weltpunkt (Länge 3, Szenen-Koordinaten).
 * @param {Float32Array} viewProjMatrix Kombinierte View-Projektions-
 *   Matrix (4×4, column-major).
 * @param {number} widthPx Breite des Ziel-Viewports in Pixeln.
 * @param {number} heightPx Höhe des Ziel-Viewports in Pixeln.
 * @returns {ScreenPoint} out. `visible` ist false, wenn der Punkt hinter
 *   der Kamera liegt (w <= 0) oder außerhalb des sichtbaren Bereichs
 *   projiziert. Für Punkte hinter der Kamera wird x/y trotzdem aus der
 *   (vorzeichen-gespiegelten) Richtung berechnet, statt sinnlose Werte zu
 *   liefern – wird später von edgeArrow.js für eine Pfeilrichtung
 *   gebraucht.
 */
export function worldToScreen(out, point, viewProjMatrix, widthPx, heightPx) {
  const m = viewProjMatrix;
  const x = point[0], y = point[1], z = point[2];

  const clipX = m[0] * x + m[4] * y + m[8] * z + m[12];
  const clipY = m[1] * x + m[5] * y + m[9] * z + m[13];
  const clipW = m[3] * x + m[7] * y + m[11] * z + m[15];

  const behindCamera = clipW <= 0;
  const safeW = behindCamera ? -clipW : clipW;
  const ndcX = clipX / safeW;
  const ndcY = clipY / safeW;

  out.x = ((ndcX + 1) / 2) * widthPx;
  out.y = ((1 - ndcY) / 2) * heightPx;
  out.depth = clipW;

  const withinScreen = ndcX >= -1 && ndcX <= 1 && ndcY >= -1 && ndcY <= 1;
  out.visible = !behindCamera && withinScreen;

  return out;
}
