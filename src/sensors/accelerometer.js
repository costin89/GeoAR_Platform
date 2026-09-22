/**
 * Beschleunigungsdaten aus dem `devicemotion`-Ereignis. Bleibt bewusst
 * getrennt von src/sensors/gyroscope.js, obwohl beide aus demselben
 * Browser-Ereignis stammen (eine Datei = eine Verantwortung).
 *
 * Liefert bevorzugt `accelerationIncludingGravity`: die spätere
 * Sensorfusion braucht die Erdanziehung als Referenzvektor, um Neigung
 * (Pitch/Roll) zu bestimmen. Reine `acceleration` (ohne Gravitation) ist
 * dafür ungeeignet und dient hier nur als Fallback, falls ein Gerät
 * ausschließlich diese liefert.
 *
 * Plattform-Konvention (siehe auch CLAUDE.md): ALLE Plattformen liefern
 * über dieses Modul dieselbe Vorzeichen-Konvention – Gerät aufrecht im
 * Hochformat (AR-Haltung, Rückkamera zeigt horizontal nach vorn) ≈
 * (0, +9.8, 0) m/s². iOS Safari liefert `accelerationIncludingGravity`
 * jedoch mit umgekehrtem Vorzeichen gegenüber Android/Chrome (auf iOS
 * liest ein aufrecht gehaltenes Gerät roh ≈ (0, -9.8, 0)) – das wird
 * hier per Plattform-Erkennung automatisch korrigiert.
 */

import { detectPlatform } from "../platform/detect.js";

/**
 * @typedef {{
 *   xMetersPerSecSq: number,
 *   yMetersPerSecSq: number,
 *   zMetersPerSecSq: number,
 *   includesGravity: boolean,
 *   normalized: boolean
 * }} AccelerometerSample
 */

/**
 * Normalisiert einen rohen Beschleunigungsvektor plattformübergreifend
 * auf dieselbe Vorzeichen-Konvention (siehe Datei-Kommentar). Als reine
 * Funktion exportiert, damit sie unabhängig von echten Sensor-Events
 * testbar ist.
 * @param {number} x Roher X-Wert, in m/s².
 * @param {number} y Roher Y-Wert, in m/s².
 * @param {number} z Roher Z-Wert, in m/s².
 * @param {"ios"|"android"|"desktop"|"unknown"} platform Erkannte
 *   Plattform (aus src/platform/detect.js).
 * @returns {{x: number, y: number, z: number, normalized: boolean}}
 *   Normalisierte Werte plus Flag, ob eine Korrektur angewendet wurde.
 */
export function normalizeAccelerationForPlatform(x, y, z, platform) {
  const signFlip = platform === "ios" ? -1 : 1;
  return {
    x: signFlip * x,
    y: signFlip * y,
    z: signFlip * z,
    normalized: signFlip === -1,
  };
}

const currentPlatform = detectPlatform();

/**
 * Startet das Auslesen der Beschleunigung. Bevorzugt
 * `accelerationIncludingGravity`; fällt auf `acceleration` (ohne
 * Erdanziehung) zurück, falls das Gerät nur diese liefert. Normalisiert
 * das Vorzeichen plattformübergreifend (siehe Datei-Kommentar).
 * @param {(sample: AccelerometerSample) => void} onUpdate Wird bei jedem
 *   `devicemotion`-Ereignis mit gültigen Werten aufgerufen.
 * @returns {() => void} Stoppt das Auslesen.
 */
export function startAccelerometerWatch(onUpdate) {
  function handleEvent(event) {
    const withGravity = event.accelerationIncludingGravity;
    const withoutGravity = event.acceleration;
    const usesGravity = Boolean(withGravity) && withGravity.x !== null;
    const source = usesGravity ? withGravity : withoutGravity;
    if (!source || source.x === null) return;
    const normalized = normalizeAccelerationForPlatform(
      source.x ?? 0,
      source.y ?? 0,
      source.z ?? 0,
      currentPlatform
    );
    onUpdate({
      xMetersPerSecSq: normalized.x,
      yMetersPerSecSq: normalized.y,
      zMetersPerSecSq: normalized.z,
      includesGravity: usesGravity,
      normalized: normalized.normalized,
    });
  }
  window.addEventListener("devicemotion", handleEvent);
  return () => window.removeEventListener("devicemotion", handleEvent);
}
