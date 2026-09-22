/**
 * Einfacher Tiefpassfilter (exponentiell gleitender Mittelwert) für
 * skalare Sensorwerte. Reduziert hochfrequentes Rauschen, z. B. in
 * rohen Beschleunigungswerten.
 */

/**
 * Erzeugt einen Tiefpassfilter.
 * @param {number} alpha Glättungsfaktor im Bereich (0, 1]. Kleiner Wert
 *   = stärkere Glättung (trägere Reaktion), 1 = keine Glättung (Wert
 *   folgt sofort dem Eingang).
 * @returns {{
 *   update: (newValue: number) => number,
 *   reset: (value?: number|null) => void,
 *   value: () => number|null
 * }} Filter-Schnittstelle. `value()` ist `null`, bis der erste
 *   `update()`-Aufruf erfolgt ist.
 */
export function createLowpassFilter(alpha) {
  let current = null;

  function update(newValue) {
    current = current === null ? newValue : current + alpha * (newValue - current);
    return current;
  }

  function reset(value = null) {
    current = value;
  }

  function value() {
    return current;
  }

  return { update, reset, value };
}
