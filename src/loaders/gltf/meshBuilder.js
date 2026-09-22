/**
 * Baut aus einem glTF-Mesh (Referenz per Index) die rohen Vertex-Daten
 * pro Primitive: Positionen, Normalen (falls vorhanden) und Indizes.
 * Fehlende Indizes werden zu einer sequenziellen 0..n-1-Liste ergänzt
 * (glTF erlaubt Primitives ohne `indices`). Reine Funktion (kein I/O),
 * baut auf accessorReader.js auf.
 */

import { readAccessor } from "./accessorReader.js";

/**
 * @typedef {{
 *   positions: Float32Array, normals: (Float32Array|null),
 *   indices: (Uint16Array|Uint32Array), materialIndex: (number|null)
 * }} MeshPrimitive
 */

/**
 * Baut die Primitives eines Meshes.
 * @param {import("./gltfParser.js").GltfDocument} doc Normalisiertes
 *   glTF-Dokument.
 * @param {ArrayBuffer[]} buffers Aufgelöste Buffer (siehe
 *   bufferLoader.js).
 * @param {number} meshIndex Index in `doc.meshes`.
 * @returns {MeshPrimitive[]} Eine Vertex-Daten-Gruppe pro Primitive.
 */
export function buildMeshPrimitives(doc, buffers, meshIndex) {
  const mesh = doc.meshes[meshIndex];
  return mesh.primitives.map((primitive) => {
    const positions = readAccessor(doc, buffers, primitive.attributes.POSITION);
    const normals =
      primitive.attributes.NORMAL !== undefined
        ? readAccessor(doc, buffers, primitive.attributes.NORMAL)
        : null;
    const indices =
      primitive.indices !== undefined
        ? readAccessor(doc, buffers, primitive.indices)
        : Uint32Array.from({ length: positions.length / 3 }, (_, i) => i);

    return {
      positions,
      normals,
      indices,
      materialIndex: primitive.material ?? null,
    };
  });
}
