import { testAsync, assertEqual, assertClose } from "../../runner.js";
import { loadGltf } from "../../../src/loaders/gltf/gltfLoader.js";

function assertCubeModel(model) {
  assertEqual(model.meshes.length, 1);
  const mesh = model.meshes[0];
  assertEqual(mesh.positions.length, 24 * 3);
  assertEqual(mesh.normals.length, 24 * 3);
  assertEqual(mesh.indices.length, 36);
  assertEqual(mesh.materialIndex, 0);

  // Node hat keine translation/rotation/scale -> Modellmatrix ist die
  // Identität.
  const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  for (let i = 0; i < 16; i++) assertClose(mesh.modelMatrix[i], identity[i], 1e-9);

  const baseColorFactor = model.materials[0].pbrMetallicRoughness.baseColorFactor;
  assertClose(baseColorFactor[0], 0.9, 1e-6);
  assertClose(baseColorFactor[1], 0.5, 1e-6);
  assertClose(baseColorFactor[2], 0.2, 1e-6);
}

testAsync("loadGltf: lädt cube.gltf (externe .bin) korrekt", async () => {
  const model = await loadGltf("./fixtures/gltf/cube.gltf");
  assertCubeModel(model);
});

testAsync("loadGltf: lädt cube.glb (eingebetteter Binär-Chunk) korrekt", async () => {
  const model = await loadGltf("./fixtures/gltf/cube.glb");
  assertCubeModel(model);
});

testAsync("loadGltf: .gltf und .glb liefern identische Vertex-Daten", async () => {
  const [fromGltf, fromGlb] = await Promise.all([
    loadGltf("./fixtures/gltf/cube.gltf"),
    loadGltf("./fixtures/gltf/cube.glb"),
  ]);
  const a = fromGltf.meshes[0].positions;
  const b = fromGlb.meshes[0].positions;
  assertEqual(a.length, b.length);
  for (let i = 0; i < a.length; i++) assertClose(a[i], b[i], 1e-9);
});

testAsync("loadGltf: wirft mit verständlicher Meldung, wenn die Datei nicht existiert", async () => {
  let threw = false;
  try {
    await loadGltf("./fixtures/gltf/does-not-exist.gltf");
  } catch (error) {
    threw = /nicht ladbar/.test(error.message);
  }
  if (!threw) throw new Error("sollte bei 404 mit verständlicher Meldung werfen");
});
