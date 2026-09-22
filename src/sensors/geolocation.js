/**
 * Fortlaufende Standortverfolgung über `watchPosition`. Die einmalige
 * Berechtigungsprüfung übernimmt src/permissions/locationPermission.js
 * und liefert dabei bereits die erste Position – die wird hier optional
 * als Startwert übernommen, damit nicht auf den ersten `watchPosition`-
 * Callback gewartet werden muss.
 */

/**
 * @typedef {{
 *   latitudeDeg: number,
 *   longitudeDeg: number,
 *   altitudeMeters: number|null,
 *   accuracyMeters: number,
 *   headingDeg: number|null,
 *   speedMetersPerSec: number|null,
 *   timestampMs: number
 * }} GeolocationSample
 */

/**
 * Startet die fortlaufende Standortverfolgung.
 * @param {(sample: GeolocationSample) => void} onUpdate Wird bei jeder
 *   neuen Position aufgerufen.
 * @param {(error: GeolocationPositionError) => void} [onError] Wird bei
 *   Fehlern (z. B. Zeitüberschreitung) aufgerufen.
 * @param {GeolocationPosition} [initialPosition] Bereits vorhandene erste
 *   Position (z. B. aus dem Permission-Check), um nicht auf den ersten
 *   `watchPosition`-Callback warten zu müssen.
 * @returns {() => void} Stoppt die Standortverfolgung.
 */
export function startGeolocationWatch(onUpdate, onError, initialPosition) {
  if (initialPosition) onUpdate(toGeolocationSample(initialPosition));

  const watchId = navigator.geolocation.watchPosition(
    (position) => onUpdate(toGeolocationSample(position)),
    (error) => onError?.(error),
    { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
  );
  return () => navigator.geolocation.clearWatch(watchId);
}

function toGeolocationSample(position) {
  const coords = position.coords;
  return {
    latitudeDeg: coords.latitude,
    longitudeDeg: coords.longitude,
    altitudeMeters: coords.altitude,
    accuracyMeters: coords.accuracy,
    headingDeg: coords.heading,
    speedMetersPerSec: coords.speed,
    timestampMs: position.timestamp,
  };
}
