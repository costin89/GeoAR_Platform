/**
 * Gyroskop-Daten (Drehraten) aus dem `devicemotion`-Ereignis. Bleibt
 * bewusst getrennt von src/sensors/accelerometer.js, obwohl beide aus
 * demselben Browser-Ereignis stammen (eine Datei = eine Verantwortung).
 */

/**
 * @typedef {{
 *   alphaDegPerSec: number,
 *   betaDegPerSec: number,
 *   gammaDegPerSec: number,
 *   intervalMs: number
 * }} GyroscopeSample
 */

/**
 * Startet das Auslesen der Drehraten.
 * @param {(sample: GyroscopeSample) => void} onUpdate Wird bei jedem
 *   `devicemotion`-Ereignis mit gültigen Drehraten aufgerufen.
 * @returns {() => void} Stoppt das Auslesen.
 */
export function startGyroscopeWatch(onUpdate) {
  function handleEvent(event) {
    const rate = event.rotationRate;
    if (!rate || rate.alpha === null) return;
    onUpdate({
      alphaDegPerSec: rate.alpha ?? 0,
      betaDegPerSec: rate.beta ?? 0,
      gammaDegPerSec: rate.gamma ?? 0,
      intervalMs: event.interval ?? 0,
    });
  }
  window.addEventListener("devicemotion", handleEvent);
  return () => window.removeEventListener("devicemotion", handleEvent);
}
