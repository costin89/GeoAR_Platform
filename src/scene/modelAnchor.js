/**
 * Erzeugt einen Szenen-Anchor, der zusätzlich ein geladenes glTF-Modell
 * trägt (src/loaders/gltf/gltfLoader.js). Der 2D-Renderer ignoriert das
 * `model`-Feld und zeichnet wie gewohnt Marker+Label anhand von
 * `scenePosition`; der WebGL-Renderer zeichnet bei vorhandenem `model`
 * das Mesh statt des Kegel-Markers (siehe render/webgl/rendererWebgl.js).
 */

/**
 * @param {string} id Eindeutige Anchor-ID.
 * @param {string} name Anzeigename (für den 2D-Renderer).
 * @param {number[]} scenePosition Position im Szenen-Koordinatensystem.
 * @param {import("../loaders/gltf/gltfLoader.js").Model} model Geladenes
 *   glTF-Model.
 * @returns {import("./scene.js").SceneAnchor} Szenen-Anchor mit Modell.
 */
export function createModelAnchor(id, name, scenePosition, model) {
  return { id, name, scenePosition, model };
}
