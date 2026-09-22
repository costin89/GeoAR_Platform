/**
 * Zeichnet einen Pfeil am Bildschirmrand, der auf einen Anchor
 * außerhalb des sichtbaren Bereichs zeigt.
 */

/**
 * Zeichnet einen Rand-Pfeil in Richtung eines nicht sichtbaren Anchors.
 * @param {CanvasRenderingContext2D} ctx Zeichenkontext.
 * @param {number} x Unbegrenzte Bildschirm-X-Koordinate des Anchors
 *   (kann außerhalb von 0..widthPx liegen, siehe worldToScreen.js).
 * @param {number} y Unbegrenzte Bildschirm-Y-Koordinate des Anchors.
 * @param {number} widthPx Breite des Viewports in Pixeln.
 * @param {number} heightPx Höhe des Viewports in Pixeln.
 * @param {string} text Anzeigetext (Name des Anchors).
 * @returns {void}
 */
export function drawEdgeArrow(ctx, x, y, widthPx, heightPx, text) {
  const margin = 32;
  const centerX = widthPx / 2;
  const centerY = heightPx / 2;

  const angle = Math.atan2(y - centerY, x - centerX);
  const halfW = widthPx / 2 - margin;
  const halfH = heightPx / 2 - margin;
  const scale = Math.min(
    Math.abs(halfW / Math.cos(angle)) || Infinity,
    Math.abs(halfH / Math.sin(angle)) || Infinity
  );

  const edgeX = centerX + Math.cos(angle) * scale;
  const edgeY = centerY + Math.sin(angle) * scale;

  ctx.save();
  ctx.translate(edgeX, edgeY);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(-8, 8);
  ctx.lineTo(-8, -8);
  ctx.closePath();
  ctx.fillStyle = "rgba(255, 196, 77, 0.9)";
  ctx.fill();
  ctx.restore();

  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.fillText(text, edgeX, edgeY + (Math.sin(angle) >= 0 ? 24 : -16));
}
