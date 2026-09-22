/**
 * Komplementärfilter für Neigung (Pitch/Roll): kombiniert das Gyroskop
 * (schnell und reaktionsfreudig, driftet aber über Zeit) mit dem
 * Beschleunigungsmesser (driftfrei, aber verrauscht und nur bei
 * Ruhe/geringer Beschleunigung als "Schwerkraft-Kompass" verlässlich)
 * zu einer stabilen Schätzung.
 *
 * Achsen-Konvention (Gerät lokal, siehe CLAUDE.md-Szenen-Konvention und
 * src/math/quat.js#fromEulerYXZ): Pitch = Rotation um die lokale
 * X-Achse, Roll = Rotation um die lokale Z-Achse (nicht Y!). Das
 * Gyroskop liefert Drehraten benannt nach der historischen
 * DeviceOrientation-Konvention (alpha=Z, beta=X, gamma=Y) – "beta"
 * trifft zufällig unsere Pitch-Achse (X), aber "roll" (unsere Z-Achse)
 * entspricht dem Gyroskop-"alpha"-Kanal, NICHT "gamma". Aufrufer müssen
 * also `gyroSample.betaDegPerSec` als Pitch-Rate und
 * `gyroSample.alphaDegPerSec` als Roll-Rate übergeben (siehe
 * src/app.js). Vorzeichen sind nach der Rechtehand-Regel um die
 * jeweilige Achse hergeleitet und mit src/math/quat.js#fromEulerYXZ
 * kreuzgeprüft – auf einem echten Gerät noch nicht verifiziert.
 */

import { radToDeg, shortestAngleDiffDeg } from "../math/angle.js";
import { createLowpassFilter } from "./lowpass.js";

/**
 * Normalisiert einen Winkel in Grad in den Bereich (-180, 180] – hält
 * den intern gespeicherten Pitch/Roll-Zustand nach der Gyro-Integration
 * in einem sinnvollen Bereich, statt unbegrenzt zu wachsen.
 * @param {number} deg Winkel in Grad.
 * @returns {number} Winkel in Grad, im Bereich (-180, 180].
 */
function normalizeSignedDeg(deg) {
  return shortestAngleDiffDeg(0, deg);
}

/**
 * Berechnet Pitch/Roll aus einem (idealerweise vorgeglätteten)
 * Beschleunigungsvektor inkl. Gravitation, für die "AR-Haltung" (Handy
 * aufrecht, Rückkamera zeigt nach vorn) als Nulllage: dort liest der
 * Sensor ungefähr (x=0, y=+9.8, z=0).
 * @param {number} x Beschleunigung X, in m/s² (inkl. Gravitation).
 * @param {number} y Beschleunigung Y, in m/s² (inkl. Gravitation).
 * @param {number} z Beschleunigung Z, in m/s² (inkl. Gravitation).
 * @returns {{pitchDeg: number, rollDeg: number}} Aus der Gravitations-
 *   richtung abgeleitete Neigung.
 */
export function accelToTilt(x, y, z) {
  return {
    pitchDeg: radToDeg(Math.atan2(-z, y)),
    rollDeg: radToDeg(Math.atan2(x, y)),
  };
}

/**
 * Erzeugt einen Komplementärfilter für Pitch/Roll.
 * @param {object} [options]
 * @param {number} [options.gyroWeight] Gewichtung des Gyroskop-Anteils,
 *   Bereich (0,1). Näher an 1 = Gyro dominiert kurzfristig (reagiert
 *   sofort), Accelerometer korrigiert nur die langsame Drift. Standard
 *   0.98.
 * @param {number} [options.accelLowpassAlpha] Glättungsfaktor für die
 *   rohen Beschleunigungswerte vor der Tilt-Berechnung (reduziert
 *   Ruckeln durch kurze Bewegungsstöße). Standard 0.2.
 * @returns {{
 *   update: (pitchRateDegPerSec: number, rollRateDegPerSec: number, accelX: number, accelY: number, accelZ: number, dtSeconds: number) => {pitchDeg: number, rollDeg: number},
 *   reset: (pitchDeg?: number, rollDeg?: number) => void,
 *   value: () => {pitchDeg: number, rollDeg: number}
 * }} Filter-Schnittstelle.
 */
export function createComplementaryFilter({ gyroWeight = 0.98, accelLowpassAlpha = 0.2 } = {}) {
  let pitchDeg = 0;
  let rollDeg = 0;
  let initialized = false;

  const accelXFilter = createLowpassFilter(accelLowpassAlpha);
  const accelYFilter = createLowpassFilter(accelLowpassAlpha);
  const accelZFilter = createLowpassFilter(accelLowpassAlpha);

  function update(pitchRateDegPerSec, rollRateDegPerSec, accelX, accelY, accelZ, dtSeconds) {
    const smoothX = accelXFilter.update(accelX);
    const smoothY = accelYFilter.update(accelY);
    const smoothZ = accelZFilter.update(accelZ);
    const accelTilt = accelToTilt(smoothX, smoothY, smoothZ);

    if (!initialized) {
      pitchDeg = accelTilt.pitchDeg;
      rollDeg = accelTilt.rollDeg;
      initialized = true;
      return { pitchDeg, rollDeg };
    }

    const gyroPitchDeg = pitchDeg + pitchRateDegPerSec * dtSeconds;
    const gyroRollDeg = rollDeg + rollRateDegPerSec * dtSeconds;

    // Wrap-around-sicher mischen: kürzeste Winkeldifferenz statt
    // naiver linearer Mittelung. Eine lineare Mittelung von z. B. 179°
    // (Gyro) und -179° (Accel) würde fälschlich ~0° ergeben, obwohl
    // beide Werte nur 2° auseinanderliegen (über die ±180°-Grenze
    // hinweg) – das tatsächliche Ergebnis muss nahe ±180° bleiben.
    const pitchCorrectionDeg = shortestAngleDiffDeg(gyroPitchDeg, accelTilt.pitchDeg);
    const rollCorrectionDeg = shortestAngleDiffDeg(gyroRollDeg, accelTilt.rollDeg);

    pitchDeg = normalizeSignedDeg(gyroPitchDeg + (1 - gyroWeight) * pitchCorrectionDeg);
    rollDeg = normalizeSignedDeg(gyroRollDeg + (1 - gyroWeight) * rollCorrectionDeg);

    return { pitchDeg, rollDeg };
  }

  function reset(newPitchDeg = 0, newRollDeg = 0) {
    pitchDeg = newPitchDeg;
    rollDeg = newRollDeg;
    initialized = true;
    accelXFilter.reset();
    accelYFilter.reset();
    accelZFilter.reset();
  }

  function value() {
    return { pitchDeg, rollDeg };
  }

  return { update, reset, value };
}

