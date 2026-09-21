/**
 * Zeichnet einen einfachen Kreis-Marker an einer Bildschirmposition.
 */

/**
 * Zeichnet einen Marker.
 * @param {CanvasRenderingContext2D} ctx Zeichenkontext.
 * @param {number} x Bildschirm-X in Pixeln.
 * @param {number} y Bildschirm-Y in Pixeln.
 * @returns {void}
 */
export function drawMarker(ctx, x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(77, 163, 255, 0.9)";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "white";
  ctx.stroke();
}
