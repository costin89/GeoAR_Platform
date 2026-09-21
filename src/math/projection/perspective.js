/**
 * Perspektiv-Projektionsmatrix (WebGL-Konvention, column-major,
 * rechtshändiger Blickraum, NDC-Tiefe von -1 bei Near bis 1 bei Far).
 */

/**
 * Schreibt eine Perspektiv-Projektionsmatrix nach `out`.
 * @param {Float32Array} out Zielmatrix (4×4, column-major).
 * @param {number} fovYRad Vertikaler Sichtwinkel, in Radiant.
 * @param {number} aspect Seitenverhältnis (Breite / Höhe).
 * @param {number} near Abstand der Near-Clipping-Ebene, in Metern.
 * @param {number} far Abstand der Far-Clipping-Ebene, in Metern.
 * @returns {Float32Array} out.
 */
export function perspective(out, fovYRad, aspect, near, far) {
  const f = 1 / Math.tan(fovYRad / 2);
  out.fill(0);
  out[0] = f / aspect;
  out[5] = f;
  out[11] = -1;

  if (Number.isFinite(far)) {
    const rangeInv = 1 / (near - far);
    out[10] = (far + near) * rangeInv;
    out[14] = 2 * far * near * rangeInv;
  } else {
    // far = Infinity: Grenzwert der Projektion für unendlich entfernte
    // Far-Ebene.
    out[10] = -1;
    out[14] = -2 * near;
  }
  return out;
}
