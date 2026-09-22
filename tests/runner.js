/**
 * Minimaler Test-Runner ohne Framework. Sammelt Testergebnisse; alle
 * Test-Dateien importieren `test`/`assert*` von hier, wodurch die
 * Ergebnisse in einem gemeinsamen Modul-Singleton landen. tests/index.html
 * liest sie über `getResults()` aus und rendert sie.
 */

const results = [];
const pendingAsyncTests = [];

/**
 * Registriert und führt einen Test sofort aus.
 * @param {string} name Beschreibender Testname.
 * @param {() => void} fn Testfunktion; wirft bei Fehlschlag eine
 *   Exception.
 * @returns {void}
 */
export function test(name, fn) {
  try {
    fn();
    results.push({ name, passed: true, error: null });
  } catch (error) {
    results.push({ name, passed: false, error: error.message });
  }
}

/**
 * Registriert einen asynchronen Test (z. B. mit `fetch`, wie die
 * glTF-Loader-Tests). Anders als `test()` läuft die Prüfung nicht
 * synchron beim Import der Testdatei – Aufrufer müssen vor dem Auswerten
 * von `getResults()` `waitForAsyncTests()` abwarten (siehe
 * tests/index.html).
 * @param {string} name Beschreibender Testname.
 * @param {() => Promise<void>} fn Asynchrone Testfunktion; wirft bzw.
 *   rejected bei Fehlschlag.
 * @returns {void}
 */
export function testAsync(name, fn) {
  const promise = fn()
    .then(() => {
      results.push({ name, passed: true, error: null });
    })
    .catch((error) => {
      results.push({ name, passed: false, error: error.message });
    });
  pendingAsyncTests.push(promise);
}

/**
 * Wartet, bis alle bisher registrierten `testAsync`-Tests abgeschlossen
 * sind.
 * @returns {Promise<void>}
 */
export async function waitForAsyncTests() {
  await Promise.all(pendingAsyncTests);
}

/**
 * Prüft exakte Gleichheit (===), wirft sonst mit Fehlermeldung.
 * @param {*} actual Tatsächlicher Wert.
 * @param {*} expected Erwarteter Wert.
 * @param {string} [message] Optionale Zusatzmeldung.
 * @returns {void}
 */
export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message ?? "assertEqual"}: erwartet ${expected}, erhalten ${actual}`);
  }
}

/**
 * Prüft, ob zwei Zahlen innerhalb einer Toleranz übereinstimmen.
 * @param {number} actual Tatsächlicher Wert.
 * @param {number} expected Erwarteter Wert.
 * @param {number} epsilon Maximal erlaubte Abweichung.
 * @param {string} [message] Optionale Zusatzmeldung.
 * @returns {void}
 */
export function assertClose(actual, expected, epsilon, message) {
  if (Math.abs(actual - expected) > epsilon) {
    throw new Error(
      `${message ?? "assertClose"}: erwartet ${expected} (±${epsilon}), erhalten ${actual}`
    );
  }
}

/**
 * Prüft, ob eine Bedingung wahr ist.
 * @param {boolean} condition Bedingung.
 * @param {string} [message] Fehlermeldung, falls die Bedingung false ist.
 * @returns {void}
 */
export function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(message ?? "assertTrue: Bedingung war false");
  }
}

/**
 * Liefert alle bisher gesammelten Testergebnisse.
 * @returns {{name: string, passed: boolean, error: string|null}[]}
 *   Ergebnisliste in Ausführungsreihenfolge.
 */
export function getResults() {
  return results;
}
