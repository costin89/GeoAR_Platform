/**
 * Lädt eine .gltf- oder .glb-Datei komplett und baut daraus ein flaches
 * Modell: eine Liste von Meshes mit bereits mit der Node-Hierarchie
 * verrechneter Weltraum-Modellmatrix. Orchestriert glbParser.js,
 * gltfParser.js, bufferLoader.js und meshBuilder.js – einziges Modul,
 * das direkt per fetch() lädt.
 *
 * Umfang dieser Phase-7-Etappe ("Parsing + statisches Mesh"): Meshes mit
 * POSITION/NORMAL/Indices, TRS- oder Matrix-Node-Transforms,
 * Basisfarbe aus `material.pbrMetallicRoughness.baseColorFactor`.
 * NOCH NICHT unterstützt: Texturen, Skinning, Animationen, Morph
 * Targets (jeweils eigene, spätere Phase-7-Schritte). Nur die
 * Default-Scene (`doc.scene`) wird geladen.
 */

import { parseGlb, isGlbMagic } from "./glbParser.js";
import { validateGltfDocument } from "./gltfParser.js";
import { resolveBuffers } from "./bufferLoader.js";
import { buildMeshPrimitives } from "./meshBuilder.js";
import {
  create as mat4Create,
  multiply,
  fromRotationTranslationScale,
} from "../../math/mat4.js";

/**
 * @typedef {{
 *   positions: Float32Array, normals: (Float32Array|null),
 *   indices: (Uint16Array|Uint32Array), materialIndex: (number|null),
 *   modelMatrix: Float32Array
 * }} ModelMesh
 * @typedef {{meshes: ModelMesh[], materials: object[]}} Model
 */

function computeLocalMatrix(node) {
  if (node.matrix) return Float32Array.from(node.matrix);
  const translation = node.translation ?? [0, 0, 0];
  const rotation = node.rotation ?? [0, 0, 0, 1];
  const scale = node.scale ?? [1, 1, 1];
  return fromRotationTranslationScale(mat4Create(), rotation, translation, scale);
}

function collectMeshes(doc, buffers, nodeIndex, parentMatrix, out) {
  const node = doc.nodes[nodeIndex];
  const localMatrix = computeLocalMatrix(node);
  const worldMatrix = multiply(mat4Create(), parentMatrix, localMatrix);

  if (node.mesh !== undefined) {
    for (const primitive of buildMeshPrimitives(doc, buffers, node.mesh)) {
      out.push({ ...primitive, modelMatrix: worldMatrix });
    }
  }
  for (const childIndex of node.children ?? []) {
    collectMeshes(doc, buffers, childIndex, worldMatrix, out);
  }
}

/**
 * Lädt eine .gltf- oder .glb-Datei und baut daraus ein Model.
 * @param {string} url Pfad zur .gltf- oder .glb-Datei.
 * @returns {Promise<Model>} Geladenes Model (leere `meshes`-Liste, falls
 *   die Default-Scene keine Nodes mit Mesh enthält).
 * @throws {Error} Bei HTTP-Fehler, ungültiger .glb-Datei oder nicht
 *   unterstützter glTF-Version.
 */
export async function loadGltf(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`glTF-Datei nicht ladbar: ${url} (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const { json, binaryChunk } = isGlbMagic(arrayBuffer)
    ? parseGlb(arrayBuffer)
    : { json: JSON.parse(new TextDecoder().decode(arrayBuffer)), binaryChunk: null };

  const doc = validateGltfDocument(json);
  const baseUrl = url.slice(0, url.lastIndexOf("/") + 1);
  const buffers = await resolveBuffers(doc, { baseUrl, binaryChunk });

  const sceneDef = doc.scenes[doc.scene];
  const meshes = [];
  for (const nodeIndex of sceneDef?.nodes ?? []) {
    collectMeshes(doc, buffers, nodeIndex, mat4Create(), meshes);
  }
  return { meshes, materials: doc.materials };
}
