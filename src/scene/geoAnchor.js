/**
 * Wandelt geografisch verankerte Orte (Places, z. B. aus
 * data/places.json) in Szenen-Anchors um, bezogen auf einen gemeinsamen
 * Ursprung.
 */

import { geodeticToScene } from "../math/geo/enu.js";

/**
 * @typedef {{id: string, name: string, latDeg: number, lonDeg: number,
 *   heightM: number}} Place
 */

/**
 * Wandelt einen Place in einen Szenen-Anchor um.
 * @param {Place} place Geografisch verankerter Ort.
 * @param {import("../trackers/geoTracker.js").GeoOrigin} origin
 *   Ursprungspunkt der Szene.
 * @returns {import("./scene.js").SceneAnchor} Szenen-Anchor mit
 *   berechneter scenePosition.
 */
export function createGeoAnchor(place, origin) {
  const scenePosition = geodeticToScene(
    [0, 0, 0],
    place.latDeg,
    place.lonDeg,
    place.heightM,
    origin
  );
  return { id: place.id, name: place.name, scenePosition };
}

/**
 * Wandelt eine Liste von Places in Szenen-Anchors um.
 * @param {Place[]} places Liste geografisch verankerter Orte.
 * @param {import("../trackers/geoTracker.js").GeoOrigin} origin
 *   Ursprungspunkt der Szene.
 * @returns {import("./scene.js").SceneAnchor[]} Liste von Szenen-Anchors.
 */
export function createGeoAnchors(places, origin) {
  return places.map((place) => createGeoAnchor(place, origin));
}
