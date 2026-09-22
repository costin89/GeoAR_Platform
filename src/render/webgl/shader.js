/**
 * Kompiliert und linkt WebGL2-Shader-Programme, mit verständlichen
 * Fehlermeldungen bei Compile-/Link-Fehlern statt stillem Fehlschlagen.
 */

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader-Compile-Fehler: ${info}`);
  }
  return shader;
}

/**
 * Kompiliert und linkt ein Vertex-/Fragment-Shader-Paar zu einem
 * Programm.
 * @param {WebGL2RenderingContext} gl WebGL2-Context.
 * @param {string} vertexSource GLSL-Quellcode des Vertex-Shaders.
 * @param {string} fragmentSource GLSL-Quellcode des Fragment-Shaders.
 * @returns {WebGLProgram} Gelinktes Programm.
 * @throws {Error} Bei Compile- oder Link-Fehler (inkl. Info-Log).
 */
export function createProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Shader-Link-Fehler: ${info}`);
  }
  return program;
}
