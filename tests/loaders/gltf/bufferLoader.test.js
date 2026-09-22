import { testAsync, assertEqual, assertTrue } from "../../runner.js";
import { resolveBuffers } from "../../../src/loaders/gltf/bufferLoader.js";

testAsync("resolveBuffers: dekodiert eingebettete Base64-Data-URI", async () => {
  // "AQIDBA==" == Bytes [1,2,3,4]
  const doc = { buffers: [{ uri: "data:application/octet-stream;base64,AQIDBA==" }] };
  const buffers = await resolveBuffers(doc, { baseUrl: "./", binaryChunk: null });
  const bytes = new Uint8Array(buffers[0]);
  assertEqual(bytes.length, 4);
  assertEqual(bytes[0], 1);
  assertEqual(bytes[3], 4);
});

testAsync("resolveBuffers: Buffer ohne uri ohne GLB-Binär-Chunk wirft", async () => {
  const doc = { buffers: [{ byteLength: 4 }] };
  let threw = false;
  try {
    await resolveBuffers(doc, { baseUrl: "./", binaryChunk: null });
  } catch {
    threw = true;
  }
  assertTrue(threw, "sollte ohne uri und ohne binaryChunk werfen");
});

testAsync("resolveBuffers: Buffer ohne uri nutzt den GLB-Binär-Chunk", async () => {
  const binaryChunk = new ArrayBuffer(8);
  const doc = { buffers: [{ byteLength: 8 }] };
  const buffers = await resolveBuffers(doc, { baseUrl: "./", binaryChunk });
  assertTrue(buffers[0] === binaryChunk, "sollte denselben Binär-Chunk zurückgeben");
});

testAsync("resolveBuffers: lädt externe .bin-Datei relativ zu baseUrl", async () => {
  const doc = { buffers: [{ uri: "cube.bin", byteLength: 648 }] };
  const buffers = await resolveBuffers(doc, { baseUrl: "./fixtures/gltf/", binaryChunk: null });
  assertEqual(buffers.length, 1);
  assertEqual(buffers[0].byteLength, 648);
});

testAsync("resolveBuffers: wirft mit verständlicher Meldung bei 404", async () => {
  const doc = { buffers: [{ uri: "does-not-exist.bin", byteLength: 1 }] };
  let threw = false;
  try {
    await resolveBuffers(doc, { baseUrl: "./fixtures/gltf/", binaryChunk: null });
  } catch (error) {
    threw = /does-not-exist\.bin/.test(error.message);
  }
  if (!threw) throw new Error("sollte bei 404 mit Dateinamen in der Meldung werfen");
});
