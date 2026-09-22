/**
 * Hält die aktuelle Kamera-Pose sowie die Liste der aktiven Geo-Anchors
 * der Szene. Reine Datenhaltung – kennt weder Sensoren noch den
 * Renderer (Datenfluss-Regel: Tracker → Scene → Renderer).
 */

/**
 * @typedef {{id: string, name: string, scenePosition: number[],
 *   model?: import("../loaders/gltf/gltfLoader.js").Model}} SceneAnchor
 * @typedef {{pose: import("../trackers/pose.js").Pose, anchors: SceneAnchor[]}} Scene
 */

/**
 * Erzeugt eine Szene mit der übergebenen Pose und leerer Anchor-Liste.
 * @param {import("../trackers/pose.js").Pose} pose Kamera-Pose (i. d. R.
 *   aus einem Tracker, z. B. src/trackers/geoTracker.js).
 * @returns {Scene} Neue Szene.
 */
export function createScene(pose) {
  return { pose, anchors: [] };
}

/**
 * Ersetzt die Anchor-Liste einer Szene.
 * @param {Scene} scene Zielszene.
 * @param {SceneAnchor[]} anchors Neue Anchor-Liste.
 * @returns {void}
 */
export function setSceneAnchors(scene, anchors) {
  scene.anchors = anchors;
}
