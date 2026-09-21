/**
 * Bildschirm-Rotationswinkel (0/90/180/270). Wird später gebraucht, um die
 * Kompass-Peilung und Sensor-Rohdaten auf die tatsächliche
 * Bildschirmausrichtung zu beziehen (Hochformat vs. Querformat).
 */

/**
 * Liefert den aktuellen Bildschirm-Rotationswinkel in Grad.
 * @returns {number} 0, 90, 180 oder 270 Grad.
 */
export function getScreenOrientationAngle() {
  if (screen.orientation && typeof screen.orientation.angle === "number") {
    return screen.orientation.angle;
  }
  return window.orientation ?? 0;
}

/**
 * Beobachtet Änderungen des Bildschirm-Rotationswinkels.
 * @param {(angleDeg: number) => void} onUpdate Wird sofort mit dem
 *   aktuellen Winkel sowie bei jeder Änderung aufgerufen.
 * @returns {() => void} Beendet die Beobachtung.
 */
export function startScreenOrientationWatch(onUpdate) {
  function handleChange() {
    onUpdate(getScreenOrientationAngle());
  }

  const usesOrientationApi = Boolean(screen.orientation);
  const target = usesOrientationApi ? screen.orientation : window;
  const eventName = usesOrientationApi ? "change" : "orientationchange";

  target.addEventListener(eventName, handleChange);
  handleChange();

  return () => target.removeEventListener(eventName, handleChange);
}
