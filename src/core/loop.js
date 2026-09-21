/**
 * requestAnimationFrame-basierter Render-/Update-Loop.
 */

/**
 * Startet einen fortlaufenden rAF-Loop.
 * @param {(deltaSeconds: number, nowMs: number) => void} callback Wird
 *   bei jedem Frame aufgerufen; `deltaSeconds` ist die vergangene Zeit
 *   seit dem letzten Frame.
 * @returns {() => void} Stoppt den Loop.
 */
export function startLoop(callback) {
  let handle;
  let lastTimeMs = performance.now();

  function tick(nowMs) {
    const deltaSeconds = (nowMs - lastTimeMs) / 1000;
    lastTimeMs = nowMs;
    callback(deltaSeconds, nowMs);
    handle = requestAnimationFrame(tick);
  }

  handle = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(handle);
}
