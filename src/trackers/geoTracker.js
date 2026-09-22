/**
 * Wandelt Standort-, Kompass- und Neigungs-Sensordaten in eine
 * fortlaufend aktualisierte Pose im Szenen-Koordinatensystem um. Der
 * Ursprung der Szene ist die erste empfangene Position (deren
 * Szenen-Position ist per Definition (0,0,0)).
 */

import { geodeticToScene } from "../math/geo/enu.js";
import { degToRad } from "../math/angle.js";
import { fromEulerYXZ } from "../math/quat.js";
import { createPose, setPose } from "./pose.js";

/**
 * @typedef {{latDeg: number, lonDeg: number, heightM: number}} GeoOrigin
 */

/**
 * Erzeugt einen Geo-Tracker, der Standort-, Kompass- und Neigungs-
 * Updates zu einer fortlaufend aktualisierten Pose zusammenführt.
 * @returns {{
 *   updateLocation: (sample: {latitudeDeg: number, longitudeDeg: number}) => void,
 *   updateHeading: (headingDeg: number) => void,
 *   updateTilt: (pitchDeg: number, rollDeg: number) => void,
 *   getPose: () => import("./pose.js").Pose,
 *   getOrigin: () => GeoOrigin|null,
 *   hasOrigin: () => boolean
 * }} Geo-Tracker-Schnittstelle.
 */
export function createGeoTracker() {
  const pose = createPose();
  let origin = null;
  let headingDeg = 0;
  let pitchDeg = 0;
  let rollDeg = 0;

  function recomputeOrientation() {
    // Kompass: 0°=Nord, 90°=Ost, im Uhrzeigersinn (CLAUDE.md-Konvention).
    // Szene: Kamera ohne Rotation blickt nach -z = Norden. Eine Y-Achsen-
    // Rotation um -headingRad bildet das korrekt ab (per Handrechnung
    // UND numerischer Prüfung mit rotateVec3 verifiziert: heading=90°
    // (Ost) → lokal-vorwärts (0,0,-1) rotiert zu Welt (1,0,0) = Ost).
    // Pitch/Roll: fromEulerYXZ erwartet Pitch um die lokale X-Achse und
    // Roll um die lokale Z-Achse – ebenfalls numerisch mit rotateVec3
    // geprüft (positiver Pitch kippt die Vorwärtsrichtung nach +y =
    // "nach oben schauen").
    const yawRad = degToRad(-headingDeg);
    const pitchRad = degToRad(pitchDeg);
    const rollRad = degToRad(rollDeg);
    fromEulerYXZ(pose.orientation, yawRad, pitchRad, rollRad);
    setPose(pose, pose.position, pose.orientation);
  }

  function updateLocation(sample) {
    if (!origin) {
      origin = { latDeg: sample.latitudeDeg, lonDeg: sample.longitudeDeg, heightM: 0 };
    }
    const scenePosition = geodeticToScene(
      [0, 0, 0],
      sample.latitudeDeg,
      sample.longitudeDeg,
      0,
      origin
    );
    setPose(pose, scenePosition, pose.orientation);
  }

  function updateHeading(newHeadingDeg) {
    headingDeg = newHeadingDeg;
    recomputeOrientation();
  }

  /**
   * Setzt die Neigung (Pitch/Roll), i. d. R. aus
   * src/filters/complementary.js. Pitch/Roll bleiben ohne Aufruf bei 0
   * (Kamera "waagerecht") – Phase 4 lief bewusst ohne diese Werte.
   * @param {number} newPitchDeg Neigung um die lokale X-Achse, in Grad.
   * @param {number} newRollDeg Neigung um die lokale Z-Achse, in Grad.
   * @returns {void}
   */
  function updateTilt(newPitchDeg, newRollDeg) {
    pitchDeg = newPitchDeg;
    rollDeg = newRollDeg;
    recomputeOrientation();
  }

  function getPose() {
    return pose;
  }

  function getOrigin() {
    return origin;
  }

  function hasOrigin() {
    return origin !== null;
  }

  return { updateLocation, updateHeading, updateTilt, getPose, getOrigin, hasOrigin };
}
