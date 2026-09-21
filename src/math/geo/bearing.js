/**
 * Initialer Kurs (Bearing) auf dem Großkreis von einem Startpunkt zu
 * einem Zielpunkt.
 */

import { degToRad, normalizeDeg, radToDeg } from "../angle.js";

/**
 * Berechnet den initialen Kurs von Punkt 1 zu Punkt 2.
 * @param {number} lat1Deg Breitengrad Startpunkt, in Grad.
 * @param {number} lon1Deg Längengrad Startpunkt, in Grad.
 * @param {number} lat2Deg Breitengrad Zielpunkt, in Grad.
 * @param {number} lon2Deg Längengrad Zielpunkt, in Grad.
 * @returns {number} Kurs in Grad, im Bereich [0, 360) (0 = Norden,
 *   90 = Osten, im Uhrzeigersinn).
 */
export function initialBearing(lat1Deg, lon1Deg, lat2Deg, lon2Deg) {
  const lat1 = degToRad(lat1Deg);
  const lat2 = degToRad(lat2Deg);
  const dLon = degToRad(lon2Deg - lon1Deg);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const bearingRad = Math.atan2(y, x);
  return normalizeDeg(radToDeg(bearingRad));
}
