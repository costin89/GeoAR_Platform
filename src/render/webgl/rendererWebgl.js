/**
 * WebGL2-3D-Renderer: zeichnet jeden Geo-Anchor als einfachen 3D-Pin
 * (Kegel). Implementiert dasselbe Renderer-Interface wie
 * canvas2d/renderer2d.js (`render(scene)`) und kennt nur die Scene
 * (Pose + Anchors), keine Sensoren.
 */

import { createWebgl2Context } from "./context.js";
import { createProgram } from "./shader.js";
import { createConeMarkerGeometry } from "./geometry.js";
import { createMeshRenderer } from "./meshRenderer.js";
import { computeViewProjMatrix } from "../renderer.js";
import { fromTranslation, create as mat4Create } from "../../math/mat4.js";
import { create as vec3Create } from "../../math/vec3.js";
import { computeRenderPosition } from "../../scene/renderDistance.js";
import { ANCHOR_MAX_RENDER_DISTANCE_M } from "../../core/config.js";

const VERTEX_SHADER_SOURCE = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewProjMatrix;

out vec3 vNormal;

void main() {
  vNormal = aNormal;
  gl_Position = uViewProjMatrix * uModelMatrix * vec4(aPosition, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;

in vec3 vNormal;
out vec4 fragColor;

void main() {
  // Einfaches Richtungslicht von schräg oben plus etwas Umgebungslicht –
  // reicht, um die 3D-Form erkennbar zu machen, ohne echtes PBR (Phase 7).
  vec3 lightDir = normalize(vec3(0.4, 1.0, 0.3));
  float diffuse = max(dot(normalize(vNormal), lightDir), 0.0);
  vec3 baseColor = vec3(0.30, 0.64, 1.0);
  vec3 color = baseColor * (0.35 + 0.65 * diffuse);
  fragColor = vec4(color, 0.95);
}
`;

/**
 * Erzeugt einen WebGL2-3D-Renderer für das übergebene Canvas-Element.
 * @param {HTMLCanvasElement} canvas Ziel-Canvas.
 * @returns {import("../renderer.js").Renderer} Renderer mit
 *   `render(scene)`.
 * @throws {Error} Wenn WebGL2 nicht unterstützt wird oder die Shader
 *   nicht kompilieren.
 */
export function createRendererWebgl(canvas) {
  const gl = createWebgl2Context(canvas);
  const program = createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);

  const modelMatrixLocation = gl.getUniformLocation(program, "uModelMatrix");
  const viewProjMatrixLocation = gl.getUniformLocation(program, "uViewProjMatrix");

  const geometry = createConeMarkerGeometry(0.6, 2, 12);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

  gl.bindVertexArray(null);

  // Phase 7: Anchors mit geladenem glTF-Model (src/scene/modelAnchor.js)
  // werden über einen eigenständigen Mesh-Renderer gezeichnet statt über
  // den Kegel-Marker; die Uploads werden pro Model gecacht, damit ein
  // Model nicht jeden Frame neu in GPU-Buffer geschrieben wird.
  const meshRenderer = createMeshRenderer(gl);
  const uploadedModelCache = new WeakMap();

  function getMeshHandles(model) {
    let handles = uploadedModelCache.get(model);
    if (!handles) {
      handles = meshRenderer.uploadModel(model);
      uploadedModelCache.set(model, handles);
    }
    return handles;
  }

  const viewProj = mat4Create();
  const modelMatrix = mat4Create();
  const renderPosition = vec3Create();

  function render(scene) {
    const width = canvas.width;
    const height = canvas.height;
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (scene.anchors.length === 0) return;

    gl.enable(gl.DEPTH_TEST);
    // Backface-Culling bewusst aus: die Kegel-Geometrie hat keine streng
    // konsistente Windungsreihenfolge, und bei wenigen Dutzend Dreiecken
    // pro Marker kostet das Weglassen praktisch nichts.
    gl.disable(gl.CULL_FACE);

    computeViewProjMatrix(viewProj, scene.pose, width, height);

    // Jeder Anchor mit `model` wechselt Programm/VAO auf den
    // Mesh-Renderer; für den nächsten Kegel-Anchor müssen Programm/VAO
    // deshalb pro Iteration neu gesetzt werden (kein Zustand über
    // Anchor-Grenzen hinweg angenommen).
    for (const anchor of scene.anchors) {
      const { position } = computeRenderPosition(
        renderPosition,
        scene.pose.position,
        anchor.scenePosition,
        ANCHOR_MAX_RENDER_DISTANCE_M
      );
      fromTranslation(modelMatrix, position);

      if (anchor.model) {
        meshRenderer.drawModel(getMeshHandles(anchor.model), modelMatrix, viewProj);
        continue;
      }

      gl.useProgram(program);
      gl.uniformMatrix4fv(viewProjMatrixLocation, false, viewProj);
      gl.bindVertexArray(vao);
      gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
      gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);
    }

    gl.bindVertexArray(null);
  }

  return { render };
}
