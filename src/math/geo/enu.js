/**
 * Exakte Umrechnung von geodätischen WGS84-Koordinaten in lokale
 * ENU-Koordinaten (East-North-Up) über ECEF, und weiter ins
 * Szenen-Koordinatensystem (x = Ost, y = Oben, z = -Nord). Eigener
 * Algorithmus, keine Bibliothek.
 *
 * GPS-Höhe ist notorisch unzuverlässig (oft ±10–50 m Fehler); bis eine
 * bessere Quelle existiert, wird sie vorerst meist mit 0 übergeben. Die
 * Kamerahöhe über dem Boden kommt separat aus src/core/config.js.
 */

import { WGS84_A, WGS84_E2 } from "./constants.js";
import { degToRad } from "../angle.js";

/**
 * Wandelt geodätische Koordinaten (WGS84) in ECEF-Koordinaten (Erdmitte
 * als Ursprung) um.
 * @param {number[]} out Zielvektor (Länge 3), ECEF in Metern.
 * @param {number} latDeg Breitengrad, in Grad.
 * @param {number} lonDeg Längengrad, in Grad.
 * @param {number} heightM Höhe über dem Ellipsoid, in Metern.
 * @returns {number[]} out.
 */
export function geodeticToEcef(out, latDeg, lonDeg, heightM) {
  const lat = degToRad(latDeg);
  const lon = degToRad(lonDeg);
  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);

  const primeVerticalRadius = WGS84_A / Math.sqrt(1 - WGS84_E2 * sinLat * sinLat);

  out[0] = (primeVerticalRadius + heightM) * cosLat * Math.cos(lon);
  out[1] = (primeVerticalRadius + heightM) * cosLat * Math.sin(lon);
  out[2] = (primeVerticalRadius * (1 - WGS84_E2) + heightM) * sinLat;
  return out;
}

/**
 * Wandelt einen ECEF-Punkt in lokale ENU-Koordinaten (East-North-Up) um,
 * bezogen auf einen geodätischen Ursprungspunkt.
 * @param {number[]} out Zielvektor (Länge 3), ENU in Metern
 *   [East, North, Up].
 * @param {number[]} ecef ECEF-Punkt (Länge 3), in Metern.
 * @param {number} originLatDeg Breitengrad des Ursprungs, in Grad.
 * @param {number} originLonDeg Längengrad des Ursprungs, in Grad.
 * @param {number} originHeightM Höhe des Ursprungs, in Metern.
 * @returns {number[]} out.
 */
export function ecefToEnu(out, ecef, originLatDeg, originLonDeg, originHeightM) {
  const originEcef = geodeticToEcef([0, 0, 0], originLatDeg, originLonDeg, originHeightM);
  const dx = ecef[0] - originEcef[0];
  const dy = ecef[1] - originEcef[1];
  const dz = ecef[2] - originEcef[2];

  const lat = degToRad(originLatDeg);
  const lon = degToRad(originLonDeg);
  const sinLat = Math.sin(lat), cosLat = Math.cos(lat);
  const sinLon = Math.sin(lon), cosLon = Math.cos(lon);

  out[0] = -sinLon * dx + cosLon * dy;
  out[1] = -sinLat * cosLon * dx - sinLat * sinLon * dy + cosLat * dz;
  out[2] = cosLat * cosLon * dx + cosLat * sinLon * dy + sinLat * dz;
  return out;
}

/**
 * Wandelt geodätische Koordinaten direkt in Szenen-Koordinaten um
 * (x = Ost, y = Oben, z = -Nord), bezogen auf einen Ursprungspunkt.
 * Kombiniert geodeticToEcef + ecefToEnu und mappt ENU auf die
 * Szenen-Achsen.
 * @param {number[]} out Zielvektor (Länge 3), Szenen-Koordinaten in
 *   Metern.
 * @param {number} latDeg Breitengrad des Punkts, in Grad.
 * @param {number} lonDeg Längengrad des Punkts, in Grad.
 * @param {number} heightM Höhe des Punkts, in Metern (GPS-Höhe ist
 *   unzuverlässig – vorerst i. d. R. 0 übergeben).
 * @param {{latDeg: number, lonDeg: number, heightM: number}} origin
 *   Ursprungspunkt der Szene.
 * @returns {number[]} out.
 */
export function geodeticToScene(out, latDeg, lonDeg, heightM, origin) {
  const ecef = geodeticToEcef([0, 0, 0], latDeg, lonDeg, heightM);
  const enu = ecefToEnu([0, 0, 0], ecef, origin.latDeg, origin.lonDeg, origin.heightM);

  out[0] = enu[0]; // Ost
  out[1] = enu[2]; // Oben
  out[2] = -enu[1]; // -Nord
  return out;
}
