/**
 * Lebenszeichen-Check für Sensor-Watcher: manche Browser/Geräte melden
 * eine Permission als „granted“, liefern aber nie echte Sensor-Events
 * (Beispiel: Desktop-Safari meldet Orientierung/Bewegung als erlaubt,
 * hat aber keine entsprechende Hardware). Dieser Wrapper erkennt das,
 * indem er misst, ob innerhalb eines Timeouts mindestens ein Sample
 * ankommt.
 */

/**
 * @typedef {"pending"|"alive"|"unavailable"} SensorHealthState
 */

/**
 * Startet einen Sensor-Watcher (eine der `start*Watch`-Funktionen aus
 * src/sensors/*) und überwacht, ob innerhalb von `timeoutMs` mindestens
 * ein Sample ankommt.
 * @param {(onUpdate: (sample: any) => void) => (() => void)} startWatch
 *   Sensor-Start-Funktion mit der üblichen Signatur (onUpdate) → stop.
 * @param {(sample: any) => void} onSample Wird für jedes Sample
 *   aufgerufen, sobald der Sensor als "alive" gilt.
 * @param {(healthState: SensorHealthState) => void} onHealthChange Wird
 *   sofort mit "pending", beim ersten Sample mit "alive" und – falls
 *   kein Sample innerhalb des Timeouts ankommt – mit "unavailable"
 *   aufgerufen.
 * @param {number} [timeoutMs] Wartezeit auf das erste Sample in
 *   Millisekunden. Standard 2000.
 * @returns {() => void} Stoppt den Watcher und einen noch laufenden
 *   Timeout-Timer.
 */
export function watchSensorHealth(startWatch, onSample, onHealthChange, timeoutMs = 2000) {
  let receivedSample = false;
  onHealthChange("pending");

  const timeoutId = setTimeout(() => {
    if (!receivedSample) onHealthChange("unavailable");
  }, timeoutMs);

  const stopWatch = startWatch((sample) => {
    if (!receivedSample) {
      receivedSample = true;
      clearTimeout(timeoutId);
      onHealthChange("alive");
    }
    onSample(sample);
  });

  return () => {
    clearTimeout(timeoutId);
    stopWatch();
  };
}
