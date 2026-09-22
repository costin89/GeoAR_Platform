/**
 * Liest einen glTF-Accessor (indirekt über dessen BufferView) aus einer
 * Liste bereits aufgelöster ArrayBuffer in ein dicht gepacktes,
 * typisiertes Array. Reine Funktion (kein I/O) – die Buffer müssen
 * vorher über bufferLoader.js aufgelöst worden sein. Liest komponenten-
 * weise über DataView statt über eine direkte TypedArray-Sicht auf den
 * Puffer, damit auch nicht auf die Komponentengröße ausgerichtete
 * byteOffset/byteStride-Werte (laut Spec erlaubt) korrekt funktionieren.
 */

const OUTPUT_CTOR_BY_COMPONENT_TYPE = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array,
};

const COMPONENT_BYTE_SIZE = {
  5120: 1,
  5121: 1,
  5122: 2,
  5123: 2,
  5125: 4,
  5126: 4,
};

const COMPONENT_READER_BY_TYPE = {
  5120: (view, offset) => view.getInt8(offset),
  5121: (view, offset) => view.getUint8(offset),
  5122: (view, offset) => view.getInt16(offset, true),
  5123: (view, offset) => view.getUint16(offset, true),
  5125: (view, offset) => view.getUint32(offset, true),
  5126: (view, offset) => view.getFloat32(offset, true),
};

const COMPONENT_COUNT_BY_TYPE = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16,
};

/**
 * Liest die Werte eines Accessors als dicht gepacktes typisiertes Array.
 * @param {import("./gltfParser.js").GltfDocument} doc Normalisiertes
 *   glTF-Dokument.
 * @param {ArrayBuffer[]} buffers Aufgelöste Buffer (siehe
 *   bufferLoader.js), in der Reihenfolge von `doc.buffers`.
 * @param {number} accessorIndex Index in `doc.accessors`.
 * @returns {Float32Array|Int8Array|Uint8Array|Int16Array|Uint16Array|Uint32Array}
 *   Dicht gepacktes Array mit `count * Komponentenanzahl` Werten. Ein
 *   Accessor ohne `bufferView` liefert ein mit Nullen gefülltes Array
 *   (laut Spec z. B. für sparse Accessoren zulässig; volle
 *   Sparse-Unterstützung ist nicht Teil dieser Phase).
 * @throws {Error} Bei nicht unterstütztem `type`/`componentType`.
 */
export function readAccessor(doc, buffers, accessorIndex) {
  const accessor = doc.accessors[accessorIndex];
  const componentCount = COMPONENT_COUNT_BY_TYPE[accessor.type];
  const OutputCtor = OUTPUT_CTOR_BY_COMPONENT_TYPE[accessor.componentType];
  const readComponent = COMPONENT_READER_BY_TYPE[accessor.componentType];
  if (!componentCount || !OutputCtor || !readComponent) {
    throw new Error(`Nicht unterstützter Accessor-Typ: ${accessor.type}/${accessor.componentType}`);
  }

  const count = accessor.count;
  const out = new OutputCtor(count * componentCount);
  if (accessor.bufferView === undefined) {
    return out;
  }

  const bufferView = doc.bufferViews[accessor.bufferView];
  const buffer = buffers[bufferView.buffer];
  const view = new DataView(buffer);
  const componentByteSize = COMPONENT_BYTE_SIZE[accessor.componentType];
  const elementByteLength = componentCount * componentByteSize;
  const byteStride = bufferView.byteStride || elementByteLength;
  const baseByteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);

  for (let i = 0; i < count; i++) {
    const elementOffset = baseByteOffset + i * byteStride;
    for (let c = 0; c < componentCount; c++) {
      out[i * componentCount + c] = readComponent(view, elementOffset + c * componentByteSize);
    }
  }
  return out;
}
