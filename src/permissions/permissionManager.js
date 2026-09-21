/**
 * Orchestriert die Anfrage aller vier Rechte (Orientierung, Bewegung,
 * Kamera, Standort) in der auf iOS erforderlichen Reihenfolge. Gibt neben
 * den Berechtigungsstatus auch die dabei bereits beschafften Ressourcen
 * (Kamera-Stream, erste Position) zurück, damit src/sensors/* sie
 * weiterverwenden kann, ohne Kamera/Standort ein zweites Mal anzufragen.
 */

import { requestMotionPermissions } from "./motionPermission.js";
import { requestCameraPermission } from "./cameraPermission.js";
import { requestLocationPermission } from "./locationPermission.js";

/**
 * @typedef {"unknown"|"granted"|"denied"|"unavailable"} PermissionState
 * @typedef {{camera: PermissionState, location: PermissionState,
 *   orientation: PermissionState, motion: PermissionState}} PermissionSnapshot
 * @typedef {{cameraStream: MediaStream|null,
 *   initialPosition: GeolocationPosition|null}} PermissionResources
 * @typedef {{permissions: PermissionSnapshot,
 *   resources: PermissionResources}} PermissionResult
 */

/**
 * Erzeugt den initialen Zustand aller Rechte (jeweils "unknown").
 * @returns {PermissionSnapshot} Initialer Rechte-Zustand.
 */
export function createInitialPermissionState() {
  return {
    camera: "unknown",
    location: "unknown",
    orientation: "unknown",
    motion: "unknown",
  };
}

/**
 * Fragt alle Rechte an. Muss direkt und synchron aus einem Klick-Handler
 * heraus aufgerufen werden (Nutzergeste): Orientierung/Bewegung starten
 * dadurch synchron, bevor Kamera und Standort per await folgen.
 * @param {(snapshot: PermissionSnapshot) => void} [onUpdate] Wird nach
 *   jedem einzelnen Rechte-Ergebnis mit dem aktuellen Gesamtzustand
 *   aufgerufen.
 * @returns {Promise<PermissionResult>} Endzustand aller Rechte plus die
 *   dabei beschafften Ressourcen (Kamera-Stream, erste Position).
 */
export async function requestAllPermissions(onUpdate) {
  const state = createInitialPermissionState();
  const resources = { cameraStream: null, initialPosition: null };
  const notify = () => onUpdate?.({ ...state });

  const motionPromise = requestMotionPermissions();

  const { orientation, motion } = await motionPromise;
  state.orientation = orientation;
  state.motion = motion;
  notify();

  const cameraResult = await requestCameraPermission();
  state.camera = cameraResult.state;
  resources.cameraStream = cameraResult.stream;
  notify();

  const locationResult = await requestLocationPermission();
  state.location = locationResult.state;
  resources.initialPosition = locationResult.position;
  notify();

  return { permissions: state, resources };
}
