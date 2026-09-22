/**
 * Pose: Position und Ausrichtung der Kamera im Szenen-Koordinatensystem.
 * Der Renderer kennt nur die Pose, keine Sensoren (siehe CLAUDE.md,
 * Datenfluss-Regel).
 */

import { create as vec3Create } from "../math/vec3.js";
import { create as quatCreate } from "../math/quat.js";

/**
 * @typedef {{position: number[], orientation: number[]}} Pose
 *   position: Länge 3 (Szenen-Koordinaten, Meter).
 *   orientation: Länge 4, Quaternion [x, y, z, w].
 */

/**
 * Erzeugt eine neue Pose am Ursprung ohne Rotation.
 * @returns {Pose} Neue Pose.
 */
export function createPose() {
  return {
    position: vec3Create(),
    orientation: quatCreate(),
  };
}

/**
 * Setzt Position und Ausrichtung einer Pose (kopiert die Werte, hält
 * aber dieselben Array-Referenzen in `out`).
 * @param {Pose} out Ziel-Pose.
 * @param {number[]} position Neue Position (Länge 3).
 * @param {number[]} orientation Neue Ausrichtung, Quaternion [x,y,z,w].
 * @returns {Pose} out.
 */
export function setPose(out, position, orientation) {
  out.position[0] = position[0];
  out.position[1] = position[1];
  out.position[2] = position[2];
  out.orientation[0] = orientation[0];
  out.orientation[1] = orientation[1];
  out.orientation[2] = orientation[2];
  out.orientation[3] = orientation[3];
  return out;
}
