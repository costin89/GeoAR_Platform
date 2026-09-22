/**
 * Entpackt den Binär-Container einer .glb-Datei (glTF Binary) in den
 * JSON-Chunk und den optionalen BIN-Chunk. Reine Funktion, kein I/O –
 * der eigentliche Datei-Download passiert in gltfLoader.js.
 */

const GLB_MAGIC = 0x46546c67; // ASCII "glTF", little-endian gelesen
const SUPPORTED_GLB_VERSION = 2;
const CHUNK_TYPE_JSON = 0x4e4f534a; // ASCII "JSON"
const CHUNK_TYPE_BIN = 0x004e4942; // ASCII "BIN\0"

/**
 * Prüft, ob ein ArrayBuffer mit der .glb-Magic-Zahl beginnt (schnelle
 * Unterscheidung .glb vs. Text-.gltf, ohne den ganzen Inhalt zu parsen).
 * @param {ArrayBuffer} arrayBuffer Zu prüfender Puffer.
 * @returns {boolean} true, wenn die ersten 4 Bytes "glTF" (Binär) sind.
 */
export function isGlbMagic(arrayBuffer) {
  if (arrayBuffer.byteLength < 4) return false;
  return new DataView(arrayBuffer).getUint32(0, true) === GLB_MAGIC;
}

/**
 * Parst einen .glb-Binärpuffer in JSON-Dokument + Binär-Chunk.
 * @param {ArrayBuffer} arrayBuffer Vollständiger Inhalt einer .glb-Datei.
 * @returns {{json: object, binaryChunk: (ArrayBuffer|null)}} Geparstes
 *   glTF-JSON und der optionale BIN-Chunk (null, falls keiner vorhanden
 *   ist – dann müssen alle buffers[].uri gesetzt sein).
 * @throws {Error} Bei falschem Magic-Byte, nicht unterstützter Version
 *   oder fehlendem JSON-Chunk.
 */
export function parseGlb(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  if (view.getUint32(0, true) !== GLB_MAGIC) {
    throw new Error("Keine gültige .glb-Datei (falsches Magic-Byte).");
  }
  const version = view.getUint32(4, true);
  if (version !== SUPPORTED_GLB_VERSION) {
    throw new Error(`Nicht unterstützte glTF-Binärversion: ${version} (erwartet: ${SUPPORTED_GLB_VERSION}).`);
  }
  const totalLength = view.getUint32(8, true);

  let json = null;
  let binaryChunk = null;
  let offset = 12;

  while (offset < totalLength) {
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    const chunkStart = offset + 8;

    if (chunkType === CHUNK_TYPE_JSON) {
      const jsonBytes = new Uint8Array(arrayBuffer, chunkStart, chunkLength);
      json = JSON.parse(new TextDecoder().decode(jsonBytes));
    } else if (chunkType === CHUNK_TYPE_BIN) {
      binaryChunk = arrayBuffer.slice(chunkStart, chunkStart + chunkLength);
    }
    // Unbekannte Chunk-Typen laut Spec ignorieren, nicht abbrechen.

    offset = chunkStart + chunkLength;
  }

  if (!json) {
    throw new Error(".glb-Datei enthält keinen JSON-Chunk.");
  }
  return { json, binaryChunk };
}
