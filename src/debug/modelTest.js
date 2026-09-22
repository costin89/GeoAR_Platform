/**
 * Lädt (einmalig, danach gecacht) ein selbst erzeugtes Test-glTF und
 * liefert einen Debug-Anchor damit, in fester Distanz nördlich vom
 * Szenen-Ursprung. Dient der Verifikation der glTF-Parsing-/Mesh-
 * Rendering-Pipeline (Phase 7) unabhängig von echten places.json-Daten
 * oder GPS-Fix – analog zu debug/compassRose.js.
 */

import { loadGltf } from "../loaders/gltf/gltfLoader.js";
import { createModelAnchor } from "../scene/modelAnchor.js";

const MODEL_TEST_URL = "./tests/fixtures/gltf/cube.gltf";
const MODEL_TEST_DISTANCE_M = 5;

let cachedModel = null;

/**
 * Lädt das Test-Model (beim ersten Aufruf) und liefert die Debug-Anchor-
 * Liste dafür.
 * @returns {Promise<import("../scene/scene.js").SceneAnchor[]>} Liste
 *   mit einem einzelnen Modell-Anchor.
 * @throws {Error} Wenn das Test-glTF nicht geladen werden kann.
 */
export async function loadModelTestAnchors() {
  if (!cachedModel) {
    cachedModel = await loadGltf(MODEL_TEST_URL);
  }
  return [
    createModelAnchor("model-test-cube", "Test-Würfel", [0, 0, -MODEL_TEST_DISTANCE_M], cachedModel),
  ];
}
