/**
 * Fordert Zugriff auf Orientierungs- (Kompass) und Bewegungssensoren
 * (Gyroskop/Accelerometer) an. Auf iOS 13+ Safari MUSS diese Funktion
 * synchron im Klick-Handler eines Start-Buttons aufgerufen werden, bevor
 * irgendein anderer await (z. B. Kamera oder Standort) passiert – sonst
 * verliert Safari die Nutzergeste und die Anfrage schlägt fehl.
 */

/**
 * @typedef {"unknown"|"granted"|"denied"|"unavailable"} PermissionState
 */

function needsExplicitRequest(EventCtor) {
  return typeof EventCtor?.requestPermission === "function";
}

function impliedState(EventCtor) {
  return EventCtor ? "granted" : "unavailable";
}

function normalizeResult(result) {
  if (result === "granted" || result === "denied") return result;
  return "unavailable";
}

/**
 * Fragt Orientierungs- und Bewegungssensor-Zugriff an. Startet auf iOS die
 * beiden `requestPermission()`-Aufrufe synchron und parallel per
 * `Promise.all`. Auf Android/Desktop ist keine explizite Anfrage nötig;
 * der Zugriff gilt als gewährt, sobald die jeweilige API existiert.
 * @returns {Promise<{orientation: PermissionState, motion: PermissionState}>}
 *   Zustand für Kompass (orientation) und Gyro/Accelerometer (motion).
 */
export function requestMotionPermissions() {
  const orientationRequest = needsExplicitRequest(window.DeviceOrientationEvent)
    ? window.DeviceOrientationEvent.requestPermission()
    : Promise.resolve(impliedState(window.DeviceOrientationEvent));

  const motionRequest = needsExplicitRequest(window.DeviceMotionEvent)
    ? window.DeviceMotionEvent.requestPermission()
    : Promise.resolve(impliedState(window.DeviceMotionEvent));

  return Promise.all([orientationRequest, motionRequest]).then(
    ([orientationResult, motionResult]) => ({
      orientation: normalizeResult(orientationResult),
      motion: normalizeResult(motionResult),
    })
  );
}
