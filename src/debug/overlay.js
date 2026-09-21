/**
 * Einfaches Debug-Overlay: zeigt beliebig viele benannte Zeilen mit
 * Live-Werten an. Kennt keine Sensoren – app.js entscheidet, welche Werte
 * angezeigt werden.
 */

/**
 * @typedef {{
 *   setRow: (key: string, label: string, value: string) => void,
 *   removeRow: (key: string) => void
 * }} DebugOverlay
 */

/**
 * Erzeugt ein Debug-Overlay im übergebenen Container.
 * @param {HTMLElement} container Zielelement für die Debug-Zeilen.
 * @returns {DebugOverlay} Schnittstelle zum Setzen/Entfernen von Zeilen.
 */
export function createDebugOverlay(container) {
  container.classList.add("debug-overlay");
  const rows = new Map();

  function setRow(key, label, value) {
    let row = rows.get(key);
    if (!row) {
      row = document.createElement("div");
      row.className = "debug-overlay__row";
      container.appendChild(row);
      rows.set(key, row);
    }
    row.textContent = `${label}: ${value}`;
  }

  function removeRow(key) {
    const row = rows.get(key);
    if (!row) return;
    row.remove();
    rows.delete(key);
  }

  return { setRow, removeRow };
}
