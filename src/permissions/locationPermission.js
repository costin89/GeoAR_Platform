/**
 * Fordert einmalig den Standort an. Die zurückgegebene Position wird
 * NICHT verworfen, sondern an src/sensors/geolocation.js weitergegeben,
 * damit dort kein zweiter `getCurrentPosition`/`watchPosition`-Aufruf für
 * denselben ersten Fix nötig ist (Datenfluss: permissions → sensors).
 */

/**
 * @typedef {"unknown"|"granted"|"denied"|"unavailable"} PermissionState
 * @typedef {{state: PermissionState, position: GeolocationPosition|null}} LocationPermissionResult
 */

/**
 * Fordert die aktuelle Position einmalig an.
 * @returns {Promise<LocationPermissionResult>} Berechtigungsstatus und
 *   bei Erfolg die erste Position (sonst null).
 */
export function requestLocationPermission() {
  if (!("geolocation" in navigator)) return Promise.resolve({ state: "unavailable", position: null });

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ state: "granted", position }),
      (error) => {
        resolve({
          state: error.code === error.PERMISSION_DENIED ? "denied" : "unavailable",
          position: null,
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
