import { test, testAsync, assertEqual, assertTrue } from "../../runner.js";
import { parseGlb, isGlbMagic } from "../../../src/loaders/gltf/glbParser.js";

test("isGlbMagic: erkennt gültiges .glb-Magic-Byte", () => {
  const buffer = new ArrayBuffer(4);
  new DataView(buffer).setUint32(0, 0x46546c67, true);
  assertTrue(isGlbMagic(buffer));
});

test("isGlbMagic: lehnt falsches Magic-Byte ab", () => {
  const buffer = new ArrayBuffer(4);
  new DataView(buffer).setUint32(0, 0x7b0a2020, true); // sieht aus wie Text-JSON
  assertTrue(!isGlbMagic(buffer));
});

test("isGlbMagic: zu kurzer Puffer ist kein Magic-Byte", () => {
  assertTrue(!isGlbMagic(new ArrayBuffer(2)));
});

test("parseGlb: wirft bei falschem Magic-Byte", () => {
  let threw = false;
  try {
    parseGlb(new ArrayBuffer(12));
  } catch {
    threw = true;
  }
  assertTrue(threw, "parseGlb sollte bei ungültigem Magic-Byte werfen");
});

testAsync("parseGlb: cube.glb liefert JSON-Chunk + BIN-Chunk mit erwarteter Größe", async () => {
  const response = await fetch("./fixtures/gltf/cube.glb");
  const arrayBuffer = await response.arrayBuffer();
  assertTrue(isGlbMagic(arrayBuffer), "cube.glb sollte gültiges GLB-Magic-Byte haben");

  const { json, binaryChunk } = parseGlb(arrayBuffer);
  assertEqual(json.asset.version, "2.0");
  assertEqual(json.meshes[0].primitives[0].attributes.POSITION, 0);
  assertTrue(binaryChunk !== null, "cube.glb sollte einen BIN-Chunk enthalten");
  assertEqual(binaryChunk.byteLength, 648);
});
