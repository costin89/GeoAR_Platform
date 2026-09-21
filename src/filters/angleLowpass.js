/**
 * Tiefpassfilter für Winkel in Grad. Anders als lowpass.js
 * wrap-around-sicher: mittelt z. B. 359° und 1° Richtung 0°/360°, nicht
 * naiv linear Richtung 180° (was bei einer einfachen Mittelung
 * passieren würde).
 */

import { shortestAngleDiffDeg, normalizeDeg } from "../math/angle.js";

/**
 * Erzeugt einen Tiefpassfilter für Winkel in Grad.
 * @param {number} alpha Glättungsfaktor im Bereich (0, 1]. Kleiner Wert
 *   = stärkere Glättung, 1 = keine Glättung.
 * @returns {{
 *   update: (newValueDeg: number) => number,
 *   reset: (valueDeg?: number|null) => void,
 *   value: () => number|null
 * }} Filter-Schnittstelle. `value()` ist im Bereich [0, 360) oder
 *   `null`, bis der erste `update()`-Aufruf erfolgt ist.
 */
export function createAngleLowpassFilter(alpha) {
  let current = null;

  function update(newValueDeg) {
    if (current === null) {
      current = normalizeDeg(newValueDeg);
    } else {
      const diff = shortestAngleDiffDeg(current, newValueDeg);
      current = normalizeDeg(current + alpha * diff);
    }
    return current;
  }

  function reset(valueDeg = null) {
    current = valueDeg === null ? null : normalizeDeg(valueDeg);
  }

  function value() {
    return current;
  }

  return { update, reset, value };
}
