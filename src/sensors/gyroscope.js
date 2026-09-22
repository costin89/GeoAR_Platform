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
 * Normalisiert `event.interval`: laut Spezifikation in Millisekunden,
 * manche Browser/Versionen liefern es aber fälschlich in Sekunden
 * (z. B. 0.016 statt 16). Werte < 1 werden daher als Sekunden
 * interpretiert und in Millisekunden umgerechnet.
 * @param {number} rawInterval Roher `event.interval`-Wert.
 * @returns {number} Intervall in Millisekunden.
 */
export function normalizeIntervalMs(rawInterval) {
  if (!rawInterval) return 0;
  return rawInterval < 1 ? rawInterval * 1000 : rawInterval;
}

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
      intervalMs: normalizeIntervalMs(event.interval ?? 0),
    });
  }
  window.addEventListener("devicemotion", handleEvent);
  return () => window.removeEventListener("devicemotion", handleEvent);
}
