/**
 * Prüft, ob die Seite in einem sicheren Kontext läuft. Kamera, Standort und
 * Bewegungssensoren sind in den meisten Browsern nur über HTTPS oder
 * localhost verfügbar.
 */

/**
 * Prüft, ob der aktuelle Kontext sicher genug für Sensor-APIs ist.
 * @returns {boolean} true, wenn `window.isSecureContext` gesetzt ist oder
 *   die Seite über localhost/127.0.0.1 läuft.
 */
export function isSecureEnoughContext() {
  if (window.isSecureContext) return true;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

/**
 * Liefert eine verständliche Fehlermeldung, falls der Kontext unsicher ist.
 * @returns {string|null} Fehlermeldung auf Deutsch, oder null wenn der
 *   Kontext in Ordnung ist.
 */
export function getSecureContextError() {
  if (isSecureEnoughContext()) return null;
  return (
    "Diese Seite läuft nicht über HTTPS. Kamera, Standort und " +
    "Bewegungssensoren funktionieren nur über eine sichere Verbindung " +
    "(https:// oder localhost). Bitte über HTTPS öffnen."
  );
}
