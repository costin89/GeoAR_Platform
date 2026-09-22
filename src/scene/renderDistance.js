/**
 * Berechnet eine für die Darstellung geeignete Position für Anchors, die
 * weiter als eine maximale Darstellungsdistanz von der Kamera entfernt
 * sind. Die Richtung (Kamera → Anker) bleibt exakt erhalten, nur die
 * Tiefe wird auf die maximale Distanz gestaucht. Die tatsächliche
 * Distanz wird zusätzlich zurückgegeben, damit sie z. B. im Label
 * angezeigt werden kann ("Brandenburger Tor – 446 km").
 *
 * Notwendig, weil sehr weit entfernte Anker (mehrere hundert Kilometer)
 * bei der bewusst kleinen Far-Clipping-Ebene (`CAMERA_FAR_M` in
 * core/config.js) außerhalb des vorgesehenen Tiefenbereichs der
 * Projektionsmatrix liegen und wegen ihrer großen Szenen-Koordinaten
 * (mehrere hunderttausend Meter) zu numerischen Ungenauigkeiten führen
 * können. Die Far-Plane wird bewusst NICHT auf mehrere hundert
 * Kilometer erhöht – das würde die Tiefenpräzision für nahe Objekte
 * ruinieren. Von beiden Renderern (canvas2d und webgl) nutzbar.
 */

import { subtract, length, scale, add, create as vec3Create } from "../math/vec3.js";

/**
 * @typedef {{position: number[], distanceM: number}} RenderPositionResult
 */

/**
 * Berechnet die Darstellungsposition eines Anchors relativ zur Kamera.
 * Liegt der Anchor innerhalb von `maxDistanceM`, wird die tatsächliche
 * Position unverändert übernommen. Andernfalls wird die Position
 * entlang der Richtung Kamera→Anker exakt auf `maxDistanceM`
 * herangezogen.
 * @param {number[]} out Zielvektor (Länge 3) für die Darstellungsposition.
 * @param {number[]} cameraPosition Kameraposition in Szenen-Koordinaten.
 * @param {number[]} anchorPosition Tatsächliche Anchor-Position in
 *   Szenen-Koordinaten.
 * @param {number} maxDistanceM Maximale Darstellungsdistanz, in Metern.
 * @returns {RenderPositionResult} `position` (= out) und die
 *   tatsächliche Distanz Kamera→Anker in Metern.
 */
export function computeRenderPosition(out, cameraPosition, anchorPosition, maxDistanceM) {
  const offset = subtract(vec3Create(), anchorPosition, cameraPosition);
  const distanceM = length(offset);

  if (distanceM <= maxDistanceM || distanceM === 0) {
    out[0] = anchorPosition[0];
    out[1] = anchorPosition[1];
    out[2] = anchorPosition[2];
    return { position: out, distanceM };
  }

  scale(offset, offset, maxDistanceM / distanceM);
  add(out, cameraPosition, offset);
  return { position: out, distanceM };
}
