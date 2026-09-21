/**
 * Rendert die Statusliste für die vier Rechte (Kamera, Standort,
 * Orientierung, Bewegung) sowie die erkannte Plattform in ein
 * Container-Element.
 */

const LABELS = {
  camera: "Kamera",
  location: "Standort",
  orientation: "Orientierung (Kompass)",
  motion: "Bewegung (Gyro/Accelerometer)",
};

const STATE_LABELS = {
  unknown: "unbekannt",
  granted: "erlaubt",
  denied: "abgelehnt",
  unavailable: "nicht verfügbar",
};

/**
 * Baut die Statusliste im übergebenen Container komplett neu auf.
 * @param {HTMLElement} container Zielelement (z. B. ein `<ul>`) für die
 *   Statuszeilen.
 * @param {{camera: string, location: string, orientation: string,
 *   motion: string}} permissions Aktueller Rechte-Zustand je Recht.
 * @param {{platform: string, browser: string}} platformInfo Erkannte
 *   Plattform und Browser (aus src/platform/detect.js).
 * @returns {void}
 */
export function renderPermissionStatus(container, permissions, platformInfo) {
  container.innerHTML = "";

  const platformItem = document.createElement("li");
  platformItem.className = "status-item status-item--platform";
  platformItem.textContent = `Plattform: ${platformInfo.platform} (${platformInfo.browser})`;
  container.appendChild(platformItem);

  for (const key of Object.keys(LABELS)) {
    const state = permissions[key] ?? "unknown";
    const item = document.createElement("li");
    item.className = `status-item status-item--${state}`;
    item.textContent = `${LABELS[key]}: ${STATE_LABELS[state] ?? state}`;
    container.appendChild(item);
  }
}
