/**
 * Zeichnet geladene glTF-Modelle (src/loaders/gltf/gltfLoader.js) in
 * WebGL2: lädt jedes Mesh einmalig in GPU-Buffer hoch (`uploadModel`)
 * und zeichnet es danach beliebig oft mit variabler Platzierungsmatrix
 * (`drawModel`). Eigenständig von rendererWebgl.js (Kegel-Marker),
 * damit beide unabhängig weiterentwickelt werden können – rendererWebgl
 * ruft diesen Renderer nur für Anchors mit `model` auf.
 *
 * Beleuchtung: einfaches Richtungslicht wie beim Kegel-Marker, noch kein
 * PBR (folgt in einem späteren Phase-7-Schritt). Normalen werden nur
 * mit dem 3×3-Anteil der Modellmatrix transformiert – bei gleichmäßiger
 * Skalierung (kein "Squash"/"Stretch") korrekt, sonst eine bewusste
 * Vereinfachung.
 */

import { createProgram } from "./shader.js";
import { create as mat4Create, multiply } from "../../math/mat4.js";

const VERTEX_SHADER_SOURCE = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewProjMatrix;

out vec3 vNormal;

void main() {
  vNormal = mat3(uModelMatrix) * aNormal;
  gl_Position = uViewProjMatrix * uModelMatrix * vec4(aPosition, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;

uniform vec4 uBaseColorFactor;

in vec3 vNormal;
out vec4 fragColor;

void main() {
  vec3 lightDir = normalize(vec3(0.4, 1.0, 0.3));
  float diffuse = max(dot(normalize(vNormal), lightDir), 0.0);
  vec3 color = uBaseColorFactor.rgb * (0.35 + 0.65 * diffuse);
  fragColor = vec4(color, uBaseColorFactor.a);
}
`;

const DEFAULT_BASE_COLOR_FACTOR = [0.7, 0.7, 0.7, 1];

function getBaseColorFactor(materials, materialIndex) {
  if (materialIndex === null || materialIndex === undefined) return DEFAULT_BASE_COLOR_FACTOR;
  const material = materials?.[materialIndex];
  return material?.pbrMetallicRoughness?.baseColorFactor ?? DEFAULT_BASE_COLOR_FACTOR;
}

/**
 * @typedef {{
 *   vao: WebGLVertexArrayObject, indexCount: number, indexType: number,
 *   modelMatrix: Float32Array, baseColorFactor: number[]
 * }} MeshHandle
 */

/**
 * Erzeugt einen Mesh-Renderer für den übergebenen WebGL2-Context.
 * @param {WebGL2RenderingContext} gl WebGL2-Context.
 * @returns {{
 *   uploadModel: (model: import("../../loaders/gltf/gltfLoader.js").Model) => MeshHandle[],
 *   drawModel: (handles: MeshHandle[], placementMatrix: Float32Array, viewProj: Float32Array) => void
 * }} `uploadModel` erzeugt GPU-Buffer für alle Meshes eines Models
 *   (einmalig, danach cachen); `drawModel` zeichnet diese Handles mit
 *   einer zusätzlichen Platzierungsmatrix (z. B. Anchor-Position).
 * @throws {Error} Wenn die Shader nicht kompilieren.
 */
export function createMeshRenderer(gl) {
  const program = createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
  const modelMatrixLocation = gl.getUniformLocation(program, "uModelMatrix");
  const viewProjMatrixLocation = gl.getUniformLocation(program, "uViewProjMatrix");
  const baseColorFactorLocation = gl.getUniformLocation(program, "uBaseColorFactor");
  const combinedMatrix = mat4Create();

  function uploadModel(model) {
    return model.meshes.map((mesh) => {
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

      if (mesh.normals) {
        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.normals, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
      }

      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

      gl.bindVertexArray(null);

      return {
        vao,
        indexCount: mesh.indices.length,
        indexType: mesh.indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT,
        modelMatrix: mesh.modelMatrix,
        baseColorFactor: getBaseColorFactor(model.materials, mesh.materialIndex),
      };
    });
  }

  function drawModel(handles, placementMatrix, viewProj) {
    gl.useProgram(program);
    gl.uniformMatrix4fv(viewProjMatrixLocation, false, viewProj);
    for (const handle of handles) {
      multiply(combinedMatrix, placementMatrix, handle.modelMatrix);
      gl.uniformMatrix4fv(modelMatrixLocation, false, combinedMatrix);
      gl.uniform4fv(baseColorFactorLocation, handle.baseColorFactor);
      gl.bindVertexArray(handle.vao);
      gl.drawElements(gl.TRIANGLES, handle.indexCount, handle.indexType, 0);
    }
    gl.bindVertexArray(null);
  }

  return { uploadModel, drawModel };
}
