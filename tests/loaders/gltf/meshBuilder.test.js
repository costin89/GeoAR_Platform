import { test, assertEqual, assertClose, assertTrue } from "../../runner.js";
import { buildMeshPrimitives } from "../../../src/loaders/gltf/meshBuilder.js";

function makeTriangleDoc() {
  // Ein Dreieck: 3 Positionen (VEC3 Float32), 3 Normalen, 3 Indizes.
  const positionsBuffer = new ArrayBuffer(36);
  const positionsView = new DataView(positionsBuffer);
  const positions = [0, 0, 0, 1, 0, 0, 0, 1, 0];
  positions.forEach((v, i) => positionsView.setFloat32(i * 4, v, true));

  const normalsBuffer = new ArrayBuffer(36);
  const normalsView = new DataView(normalsBuffer);
  for (let i = 0; i < 9; i += 3) normalsView.setFloat32((i + 2) * 4, 1, true); // (0,0,1) je Vertex

  const indicesBuffer = new ArrayBuffer(6);
  const indicesView = new DataView(indicesBuffer);
  [0, 1, 2].forEach((v, i) => indicesView.setUint16(i * 2, v, true));

  return {
    doc: {
      meshes: [
        {
          primitives: [
            {
              attributes: { POSITION: 0, NORMAL: 1 },
              indices: 2,
              material: 0,
            },
            {
              // Zweites Primitive ohne NORMAL und ohne indices.
              attributes: { POSITION: 0 },
            },
          ],
        },
      ],
      accessors: [
        { bufferView: 0, componentType: 5126, count: 3, type: "VEC3" },
        { bufferView: 1, componentType: 5126, count: 3, type: "VEC3" },
        { bufferView: 2, componentType: 5123, count: 3, type: "SCALAR" },
      ],
      bufferViews: [
        { buffer: 0, byteOffset: 0, byteLength: 36 },
        { buffer: 1, byteOffset: 0, byteLength: 36 },
        { buffer: 2, byteOffset: 0, byteLength: 6 },
      ],
    },
    buffers: [positionsBuffer, normalsBuffer, indicesBuffer],
  };
}

test("buildMeshPrimitives: liest Positionen/Normalen/Indizes/materialIndex", () => {
  const { doc, buffers } = makeTriangleDoc();
  const primitives = buildMeshPrimitives(doc, buffers, 0);
  assertEqual(primitives.length, 2);

  const [withNormals, withoutIndices] = primitives;
  assertEqual(withNormals.positions.length, 9);
  assertClose(withNormals.positions[3], 1, 1e-9);
  assertTrue(withNormals.normals !== null, "erstes Primitive hat NORMAL-Attribut");
  assertClose(withNormals.normals[2], 1, 1e-9);
  assertEqual(withNormals.indices.length, 3);
  assertEqual(withNormals.indices[1], 1);
  assertEqual(withNormals.materialIndex, 0);

  assertTrue(withoutIndices.normals === null, "zweites Primitive hat kein NORMAL-Attribut");
  assertEqual(withoutIndices.materialIndex, null);
});

test("buildMeshPrimitives: fehlende indices werden zu sequenzieller Liste ergänzt", () => {
  const { doc, buffers } = makeTriangleDoc();
  const primitives = buildMeshPrimitives(doc, buffers, 0);
  const withoutIndices = primitives[1];
  assertEqual(withoutIndices.indices.length, 3);
  assertEqual(withoutIndices.indices[0], 0);
  assertEqual(withoutIndices.indices[1], 1);
  assertEqual(withoutIndices.indices[2], 2);
});
