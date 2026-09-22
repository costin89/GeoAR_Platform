/**
 * WebGL2-Kontext-Erzeugung mit klarer Fehlermeldung, falls WebGL2 nicht
 * unterstützt wird.
 */

/**
 * Erstellt einen WebGL2-Rendering-Context für ein Canvas-Element.
 * @param {HTMLCanvasElement} canvas Ziel-Canvas.
 * @returns {WebGL2RenderingContext} Der WebGL2-Context.
 * @throws {Error} Wenn der Browser/das Gerät kein WebGL2 unterstützt.
 */
export function createWebgl2Context(canvas) {
  const gl = canvas.getContext("webgl2", { alpha: true, antialias: true });
  if (!gl) {
    throw new Error("WebGL2 wird von diesem Browser/Gerät nicht unterstützt.");
  }
  return gl;
}
