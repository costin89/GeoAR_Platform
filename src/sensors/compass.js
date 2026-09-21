/**
 * Fortlaufende Kompass-Peilung (magnetische Ausrichtung). iOS liefert
 * `webkitCompassHeading` direkt über `deviceorientation`; Android/Chrome
 * liefert eine absolute Ausrichtung über `deviceorientationabsolute`
 * (Alpha-Winkel). Eine Korrektur um die Bildschirmrotation erfolgt hier
 * bewusst NICHT – das übernimmt später die Sensorfusion in
 * src/filters/src/trackers.
 *
 * Liefert auch relative (nicht-Nordreferenzierte) Alpha-Werte, falls
 * weder `webkitCompassHeading` noch ein absolutes Ereignis verfügbar
 * sind – markiert sie aber im Sample als `absolute: false`. Relative
 * Werte sind für Geo-AR unbrauchbar (kein Bezug zu Norden), zeigen im
 * Debug-Overlay aber wenigstens, dass überhaupt Orientierungs-Events
 * ankommen.
 */

/**
 * @typedef {{
 *   headingDeg: number,
 *   accuracyDeg: number|null,
 *   source: "ios-webkit"|"alpha",
 *   absolute: boolean
 * }} CompassSample
 */

/**
 * Startet die Kompass-Peilung. Registriert sowohl `deviceorientation` als
 * auch, falls verfügbar, `deviceorientationabsolute`, und wertet pro
 * Ereignis nur die jeweils verlässliche Quelle aus.
 * @param {(sample: CompassSample) => void} onUpdate Wird bei jeder
 *   verwertbaren Peilung aufgerufen.
 * @returns {() => void} Stoppt die Kompass-Peilung.
 */
export function startCompassWatch(onUpdate) {
  const eventNames = "ondeviceorientationabsolute" in window
    ? ["deviceorientationabsolute", "deviceorientation"]
    : ["deviceorientation"];

  function handleEvent(event) {
    const sample = toCompassSample(event);
    if (sample) onUpdate(sample);
  }

  for (const name of eventNames) window.addEventListener(name, handleEvent);
  return () => {
    for (const name of eventNames) window.removeEventListener(name, handleEvent);
  };
}

function toCompassSample(event) {
  if (typeof event.webkitCompassHeading === "number") {
    return {
      headingDeg: event.webkitCompassHeading,
      accuracyDeg: event.webkitCompassAccuracy ?? null,
      source: "ios-webkit",
      absolute: true,
    };
  }
  if (typeof event.alpha === "number") {
    const isAbsolute = event.absolute === true;
    return {
      // Die Nord-Umrechnung ist nur für absolute Alpha-Werte sinnvoll;
      // bei relativen Werten gibt es keinen Bezug zu Norden.
      headingDeg: isAbsolute ? (360 - event.alpha) % 360 : event.alpha,
      accuracyDeg: null,
      source: "alpha",
      absolute: isAbsolute,
    };
  }
  return null;
}
