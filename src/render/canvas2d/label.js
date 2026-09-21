/**
 * Zeichnet ein Text-Label mit Hintergrund-Box unterhalb einer
 * Bildschirmposition (z. B. unter einem Marker).
 */

/**
 * Zeichnet ein Label.
 * @param {CanvasRenderingContext2D} ctx Zeichenkontext.
 * @param {number} x Bildschirm-X in Pixeln (mittiger Ankerpunkt).
 * @param {number} y Bildschirm-Y in Pixeln (oberer Rand des Labels).
 * @param {string} text Anzeigetext.
 * @returns {void}
 */
export function drawLabel(ctx, x, y, text) {
  const paddingX = 6;
  const boxHeight = 20;
  const boxY = y + 12;

  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const boxWidth = ctx.measureText(text).width + paddingX * 2;
  const boxX = x - boxWidth / 2;

  ctx.fillStyle = "rgba(16, 20, 26, 0.8)";
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  ctx.fillStyle = "white";
  ctx.fillText(text, x, boxY + boxHeight / 2);
}
