/**
 * Winkel-Hilfsfunktionen. Innerhalb von src/math wird ausschließlich mit
 * Radiant gerechnet; Grad ist nur an den Rändern (Sensoren, UI) erlaubt.
 */

/**
 * Wandelt Grad in Radiant um.
 * @param {number} deg Winkel in Grad.
 * @returns {number} Winkel in Radiant.
 */
export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Wandelt Radiant in Grad um.
 * @param {number} rad Winkel in Radiant.
 * @returns {number} Winkel in Grad.
 */
export function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}

/**
 * Normalisiert einen Winkel in Grad auf den Bereich [0, 360).
 * @param {number} deg Winkel in Grad (beliebig, auch negativ oder >360).
 * @returns {number} Winkel in Grad, im Bereich [0, 360).
 */
export function normalizeDeg(deg) {
  return ((deg % 360) + 360) % 360;
}

/**
 * Normalisiert einen Winkel in Radiant auf den Bereich [0, 2π).
 * @param {number} rad Winkel in Radiant (beliebig).
 * @returns {number} Winkel in Radiant, im Bereich [0, 2π).
 */
export function normalizeRad(rad) {
  const twoPi = 2 * Math.PI;
  return ((rad % twoPi) + twoPi) % twoPi;
}

/**
 * Kürzeste Winkeldifferenz in Grad von `fromDeg` nach `toDeg`, im Bereich
 * (-180, 180]. Beispiel: shortestAngleDiffDeg(359, 1) = 2 (nicht -358).
 * @param {number} fromDeg Ausgangswinkel in Grad.
 * @param {number} toDeg Zielwinkel in Grad.
 * @returns {number} Kürzeste Differenz in Grad, positiv = im
 *   Uhrzeigersinn von fromDeg nach toDeg.
 */
export function shortestAngleDiffDeg(fromDeg, toDeg) {
  const diff = normalizeDeg(toDeg - fromDeg);
  return diff > 180 ? diff - 360 : diff;
}
