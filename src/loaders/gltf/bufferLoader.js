/**
 * Löst die `buffers`-Liste eines glTF-Dokuments in tatsächliche
 * ArrayBuffer auf: externe Dateien (relativ zur .gltf-URL), eingebettete
 * Base64-Data-URIs, oder der Binär-Chunk einer .glb-Datei. Einziges
 * Modul der glTF-Loader-Pipeline mit Netzwerk-I/O außer gltfLoader.js
 * selbst.
 */

function decodeBase64DataUri(uri) {
  const commaIndex = uri.indexOf(",");
  const base64 = uri.slice(commaIndex + 1);
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Löst alle Buffer eines glTF-Dokuments auf.
 * @param {import("./gltfParser.js").GltfDocument} doc Normalisiertes
 *   glTF-Dokument.
 * @param {{baseUrl: string, binaryChunk: (ArrayBuffer|null)}} options
 *   `baseUrl` für relative externe URIs (mit abschließendem "/"),
 *   `binaryChunk` als Quelle für Buffer ohne `uri` (aus einer .glb-Datei).
 * @returns {Promise<ArrayBuffer[]>} Ein ArrayBuffer pro Eintrag in
 *   `doc.buffers`, in derselben Reihenfolge.
 * @throws {Error} Wenn ein Buffer ohne `uri` referenziert wird, aber
 *   kein GLB-Binär-Chunk vorhanden ist, oder ein externer Download
 *   fehlschlägt.
 */
export async function resolveBuffers(doc, { baseUrl, binaryChunk }) {
  const buffers = [];
  for (const bufferDef of doc.buffers) {
    if (!bufferDef.uri) {
      if (!binaryChunk) {
        throw new Error("glTF-Buffer ohne uri, aber kein GLB-Binär-Chunk vorhanden.");
      }
      buffers.push(binaryChunk);
    } else if (bufferDef.uri.startsWith("data:")) {
      buffers.push(decodeBase64DataUri(bufferDef.uri));
    } else {
      const response = await fetch(baseUrl + bufferDef.uri);
      if (!response.ok) {
        throw new Error(`Buffer-Datei nicht ladbar: ${bufferDef.uri} (${response.status})`);
      }
      buffers.push(await response.arrayBuffer());
    }
  }
  return buffers;
}
