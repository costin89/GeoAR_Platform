/**
 * Validiert ein rohes glTF-JSON-Dokument (aus einer .gltf-Datei oder dem
 * JSON-Chunk einer .glb-Datei) und normalisiert fehlende optionale
 * Arrays auf leere Arrays, damit der Rest der Loader-Pipeline nicht an
 * jeder Stelle auf `undefined` prüfen muss. Reine Funktion, kein I/O.
 */

const SUPPORTED_MAJOR_VERSION = "2";

/**
 * @typedef {{
 *   asset: object, scene: number, scenes: object[], nodes: object[],
 *   meshes: object[], accessors: object[], bufferViews: object[],
 *   buffers: object[], materials: object[]
 * }} GltfDocument
 */

/**
 * Validiert und normalisiert ein rohes glTF-JSON-Dokument.
 * @param {object} json Rohes, geparstes glTF-JSON.
 * @returns {GltfDocument} Normalisiertes Dokument mit garantierten
 *   Array-Feldern.
 * @throws {Error} Wenn `asset.version` fehlt oder keine 2.x-Version ist.
 */
export function validateGltfDocument(json) {
  const version = json.asset && json.asset.version;
  if (!version || !version.startsWith(SUPPORTED_MAJOR_VERSION)) {
    throw new Error(`Nicht unterstützte glTF-Version: ${version ?? "unbekannt"} (erwartet: 2.x).`);
  }
  return {
    asset: json.asset,
    scene: json.scene ?? 0,
    scenes: json.scenes ?? [],
    nodes: json.nodes ?? [],
    meshes: json.meshes ?? [],
    accessors: json.accessors ?? [],
    bufferViews: json.bufferViews ?? [],
    buffers: json.buffers ?? [],
    materials: json.materials ?? [],
  };
}
