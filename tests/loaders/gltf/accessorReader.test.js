import { test, assertEqual, assertClose, assertTrue } from "../../runner.js";
import { readAccessor } from "../../../src/loaders/gltf/accessorReader.js";

function makeDoc(overrides) {
  return {
    accessors: [],
    bufferViews: [],
    buffers: [],
    ...overrides,
  };
}

test("readAccessor: dicht gepackte VEC3-Floats (Positionen)", () => {
  const buffer = new ArrayBuffer(24); // 2 * vec3 * 4 Bytes
  const view = new DataView(buffer);
  const values = [1, 2, 3, -1, -2, -3];
  values.forEach((v, i) => view.setFloat32(i * 4, v, true));

  const doc = makeDoc({
    accessors: [{ bufferView: 0, componentType: 5126, count: 2, type: "VEC3" }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 24 }],
  });

  const out = readAccessor(doc, [buffer], 0);
  assertEqual(out.length, 6);
  for (let i = 0; i < 6; i++) assertClose(out[i], values[i], 1e-9);
});

test("readAccessor: SCALAR Uint16-Indizes", () => {
  const buffer = new ArrayBuffer(6);
  const view = new DataView(buffer);
  [10, 20, 30].forEach((v, i) => view.setUint16(i * 2, v, true));

  const doc = makeDoc({
    accessors: [{ bufferView: 0, componentType: 5123, count: 3, type: "SCALAR" }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 6 }],
  });

  const out = readAccessor(doc, [buffer], 0);
  assertEqual(out.length, 3);
  assertEqual(out[0], 10);
  assertEqual(out[1], 20);
  assertEqual(out[2], 30);
  assertTrue(out instanceof Uint16Array, "Uint16-Accessor sollte ein Uint16Array liefern");
});

test("readAccessor: berücksichtigt bufferView.byteOffset + accessor.byteOffset", () => {
  const buffer = new ArrayBuffer(20);
  const view = new DataView(buffer);
  // 2 Bytes Müll, dann bufferView (byteOffset=2), darin nochmal
  // accessor.byteOffset=4 (ein ungenutzter Float), dann der echte Wert.
  view.setFloat32(2 + 4, 42, true);

  const doc = makeDoc({
    accessors: [{ bufferView: 0, byteOffset: 4, componentType: 5126, count: 1, type: "SCALAR" }],
    bufferViews: [{ buffer: 0, byteOffset: 2, byteLength: 8 }],
  });

  const out = readAccessor(doc, [buffer], 0);
  assertClose(out[0], 42, 1e-9);
});

test("readAccessor: interleaviertes bufferView mit byteStride", () => {
  // 2 Elemente, je 16 Bytes Stride: vec3-Position (12 Bytes) + 4 Bytes
  // (z.B. eine andere Attribut-Komponente), nur die Position wird
  // gelesen.
  const buffer = new ArrayBuffer(32);
  const view = new DataView(buffer);
  view.setFloat32(0, 1, true);
  view.setFloat32(4, 2, true);
  view.setFloat32(8, 3, true);
  // Bytes 12-15: Füllwert, wird ignoriert.
  view.setFloat32(16, 4, true);
  view.setFloat32(20, 5, true);
  view.setFloat32(24, 6, true);

  const doc = makeDoc({
    accessors: [{ bufferView: 0, componentType: 5126, count: 2, type: "VEC3" }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 32, byteStride: 16 }],
  });

  const out = readAccessor(doc, [buffer], 0);
  assertEqual(out.length, 6);
  assertClose(out[0], 1, 1e-9);
  assertClose(out[1], 2, 1e-9);
  assertClose(out[2], 3, 1e-9);
  assertClose(out[3], 4, 1e-9);
  assertClose(out[4], 5, 1e-9);
  assertClose(out[5], 6, 1e-9);
});

test("readAccessor: Accessor ohne bufferView liefert mit Nullen gefülltes Array", () => {
  const doc = makeDoc({
    accessors: [{ componentType: 5126, count: 3, type: "VEC3" }],
  });
  const out = readAccessor(doc, [], 0);
  assertEqual(out.length, 9);
  for (const v of out) assertEqual(v, 0);
});

test("readAccessor: wirft bei nicht unterstütztem Accessor-Typ", () => {
  const doc = makeDoc({
    accessors: [{ bufferView: 0, componentType: 9999, count: 1, type: "VEC3" }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 12 }],
  });
  let threw = false;
  try {
    readAccessor(doc, [new ArrayBuffer(12)], 0);
  } catch {
    threw = true;
  }
  assertTrue(threw, "sollte bei unbekanntem componentType werfen");
});
