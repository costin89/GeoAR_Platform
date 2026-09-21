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
 */

/**
 * @typedef {{
 *   xMetersPerSecSq: number,
 *   yMetersPerSecSq: number,
 *   zMetersPerSecSq: number,
 *   includesGravity: boolean
 * }} AccelerometerSample
 */

/**
 * Startet das Auslesen der Beschleunigung. Bevorzugt
 * `accelerationIncludingGravity`; fällt auf `acceleration` (ohne
 * Erdanziehung) zurück, falls das Gerät nur diese liefert.
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
    onUpdate({
      xMetersPerSecSq: source.x ?? 0,
      yMetersPerSecSq: source.y ?? 0,
      zMetersPerSecSq: source.z ?? 0,
      includesGravity: usesGravity,
    });
  }
  window.addEventListener("devicemotion", handleEvent);
  return () => window.removeEventListener("devicemotion", handleEvent);
}
