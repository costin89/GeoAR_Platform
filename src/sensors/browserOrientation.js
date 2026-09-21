/**
 * Liest die rohe, vom Browser bereits fusionierte Geräteausrichtung
 * (alpha/beta/gamma aus `deviceorientation`) nur als Referenzwert. Dient
 * ausschließlich dem Debug-Overlay, um die eigene Sensorfusion (spätere
 * Phase) mit der Browser-eigenen Lösung zu vergleichen. Kein anderes
 * Modul darf sich auf diese Werte verlassen.
 */

/**
 * @typedef {{
 *   alphaDeg: number|null,
 *   betaDeg: number|null,
 *   gammaDeg: number|null,
 *   absolute: boolean
 * }} BrowserOrientationSample
 */

/**
 * Startet das Auslesen der browsereigenen Geräteausrichtung.
 * @param {(sample: BrowserOrientationSample) => void} onUpdate Wird bei
 *   jedem `deviceorientation`-Ereignis aufgerufen.
 * @returns {() => void} Stoppt das Auslesen.
 */
export function startBrowserOrientationWatch(onUpdate) {
  function handleEvent(event) {
    onUpdate({
      alphaDeg: event.alpha,
      betaDeg: event.beta,
      gammaDeg: event.gamma,
      absolute: Boolean(event.absolute),
    });
  }
  window.addEventListener("deviceorientation", handleEvent);
  return () => window.removeEventListener("deviceorientation", handleEvent);
}
