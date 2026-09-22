/**
 * Großkreis-Distanz zwischen zwei geografischen Punkten (Haversine-
 * Formel), unter Annahme einer Kugel mit mittlerem Erdradius.
 */

import { EARTH_MEAN_RADIUS_M } from "./constants.js";
import { degToRad } from "../angle.js";

/**
 * Berechnet die Großkreis-Distanz zwischen zwei Punkten.
 * @param {number} lat1Deg Breitengrad Punkt 1, in Grad.
 * @param {number} lon1Deg Längengrad Punkt 1, in Grad.
 * @param {number} lat2Deg Breitengrad Punkt 2, in Grad.
 * @param {number} lon2Deg Längengrad Punkt 2, in Grad.
 * @returns {number} Distanz in Metern.
 */
export function haversineDistance(lat1Deg, lon1Deg, lat2Deg, lon2Deg) {
  const lat1 = degToRad(lat1Deg);
  const lat2 = degToRad(lat2Deg);
  const dLat = degToRad(lat2Deg - lat1Deg);
  const dLon = degToRad(lon2Deg - lon1Deg);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return EARTH_MEAN_RADIUS_M * c;
}
