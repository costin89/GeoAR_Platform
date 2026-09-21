/**
 * Fordert Kamerazugriff an. Bei Erfolg wird der Stream NICHT gestoppt,
 * sondern direkt zurückgegeben, damit src/sensors/camera.js ihn
 * weiterverwenden kann, ohne `getUserMedia` ein zweites Mal aufzurufen
 * (Datenfluss: permissions → sensors, nicht umgekehrt).
 */

/**
 * @typedef {"unknown"|"granted"|"denied"|"unavailable"} PermissionState
 * @typedef {{state: PermissionState, stream: MediaStream|null}} CameraPermissionResult
 */

/**
 * Fordert Kamerazugriff an (Rückkamera bevorzugt).
 * @returns {Promise<CameraPermissionResult>} Berechtigungsstatus und bei
 *   Erfolg der laufende Stream (sonst null).
 */
export async function requestCameraPermission() {
  if (!navigator.mediaDevices?.getUserMedia) return { state: "unavailable", stream: null };

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    return { state: "granted", stream };
  } catch (error) {
    const state =
      error.name === "NotAllowedError" || error.name === "SecurityError" ? "denied" : "unavailable";
    return { state, stream: null };
  }
}
