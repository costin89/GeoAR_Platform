import { test, assertEqual, assertTrue } from "../../runner.js";
import { validateGltfDocument } from "../../../src/loaders/gltf/gltfParser.js";

test("validateGltfDocument: akzeptiert Version 2.0 und normalisiert fehlende Arrays", () => {
  const doc = validateGltfDocument({ asset: { version: "2.0" } });
  assertEqual(doc.scene, 0);
  assertTrue(Array.isArray(doc.scenes));
  assertTrue(Array.isArray(doc.nodes));
  assertTrue(Array.isArray(doc.meshes));
  assertTrue(Array.isArray(doc.accessors));
  assertTrue(Array.isArray(doc.bufferViews));
  assertTrue(Array.isArray(doc.buffers));
  assertTrue(Array.isArray(doc.materials));
  assertEqual(doc.scenes.length, 0);
});

test("validateGltfDocument: übernimmt vorhandene scene/Arrays unverändert", () => {
  const raw = { asset: { version: "2.0" }, scene: 1, nodes: [{ mesh: 0 }] };
  const doc = validateGltfDocument(raw);
  assertEqual(doc.scene, 1);
  assertEqual(doc.nodes.length, 1);
});

test("validateGltfDocument: wirft bei fehlender asset.version", () => {
  let threw = false;
  try {
    validateGltfDocument({});
  } catch {
    threw = true;
  }
  assertTrue(threw, "sollte bei fehlender version werfen");
});

test("validateGltfDocument: wirft bei nicht unterstützter Hauptversion (1.0)", () => {
  let threw = false;
  try {
    validateGltfDocument({ asset: { version: "1.0" } });
  } catch {
    threw = true;
  }
  assertTrue(threw, "sollte bei glTF 1.0 werfen");
});
