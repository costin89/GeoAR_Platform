/**
 * 4×4-Matrizen für 3D-Transformationen. Column-major (WebGL-Konvention),
 * gespeichert als Float32Array(16). Alle Funktionen sind pur und
 * schreiben ihr Ergebnis in den übergebenen `out`-Parameter; a/out bzw.
 * b/out dürfen dieselbe Matrix sein (Aliasing wird intern abgefangen).
 */

/**
 * Erzeugt eine neue Identitätsmatrix.
 * @returns {Float32Array} Neue 4×4-Matrix (Identität).
 */
export function create() {
  return identity(new Float32Array(16));
}

/**
 * Setzt eine Matrix auf die Identität.
 * @param {Float32Array} out Zielmatrix.
 * @returns {Float32Array} out.
 */
export function identity(out) {
  out.fill(0);
  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}

/**
 * Multipliziert zwei Matrizen: out = a * b.
 * @param {Float32Array} out Zielmatrix.
 * @param {Float32Array} a Linker Faktor.
 * @param {Float32Array} b Rechter Faktor.
 * @returns {Float32Array} out.
 */
export function multiply(out, a, b) {
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  for (let col = 0; col < 4; col++) {
    const b0 = b[col * 4 + 0];
    const b1 = b[col * 4 + 1];
    const b2 = b[col * 4 + 2];
    const b3 = b[col * 4 + 3];
    out[col * 4 + 0] = a00 * b0 + a10 * b1 + a20 * b2 + a30 * b3;
    out[col * 4 + 1] = a01 * b0 + a11 * b1 + a21 * b2 + a31 * b3;
    out[col * 4 + 2] = a02 * b0 + a12 * b1 + a22 * b2 + a32 * b3;
    out[col * 4 + 3] = a03 * b0 + a13 * b1 + a23 * b2 + a33 * b3;
  }
  return out;
}

/**
 * Invertiert eine 4×4-Matrix (Kofaktor-Verfahren über 2×2-Minoren).
 * @param {Float32Array} out Zielmatrix.
 * @param {Float32Array} a Ausgangsmatrix.
 * @returns {Float32Array|null} out, oder null falls die Matrix singulär
 *   ist (Determinante 0).
 */
export function invert(out, a) {
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  const b00 = a00 * a11 - a01 * a10;
  const b01 = a00 * a12 - a02 * a10;
  const b02 = a00 * a13 - a03 * a10;
  const b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11;
  const b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30;
  const b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30;
  const b09 = a21 * a32 - a22 * a31;
  const b10 = a21 * a33 - a23 * a31;
  const b11 = a22 * a33 - a23 * a32;

  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (det === 0) return null;
  det = 1 / det;

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

  return out;
}

/**
 * Transponiert eine 4×4-Matrix.
 * @param {Float32Array} out Zielmatrix.
 * @param {Float32Array} a Ausgangsmatrix.
 * @returns {Float32Array} out.
 */
export function transpose(out, a) {
  const a01 = a[1], a02 = a[2], a03 = a[3];
  const a12 = a[6], a13 = a[7];
  const a23 = a[11];

  out[1] = a[4];
  out[2] = a[8];
  out[3] = a[12];
  out[4] = a01;
  out[6] = a[9];
  out[7] = a[13];
  out[8] = a02;
  out[9] = a12;
  out[11] = a[14];
  out[12] = a03;
  out[13] = a13;
  out[14] = a23;
  out[0] = a[0];
  out[5] = a[5];
  out[10] = a[10];
  out[15] = a[15];
  return out;
}

/**
 * Erzeugt eine reine Translationsmatrix.
 * @param {Float32Array} out Zielmatrix.
 * @param {number[]} v Verschiebung (Länge 3).
 * @returns {Float32Array} out.
 */
export function fromTranslation(out, v) {
  identity(out);
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  return out;
}

/**
 * Erzeugt eine reine Rotationsmatrix aus einem Quaternion.
 * @param {Float32Array} out Zielmatrix.
 * @param {number[]} q Rotations-Quaternion [x, y, z, w].
 * @returns {Float32Array} out.
 */
export function fromQuat(out, q) {
  const x = q[0], y = q[1], z = q[2], w = q[3];
  const x2 = x + x, y2 = y + y, z2 = z + z;
  const xx = x * x2, xy = x * y2, xz = x * z2;
  const yy = y * y2, yz = y * z2, zz = z * z2;
  const wx = w * x2, wy = w * y2, wz = w * z2;

  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;

  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;

  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;

  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

/**
 * Erzeugt eine kombinierte Rotations-/Translationsmatrix (erst Rotation,
 * dann Translation).
 * @param {Float32Array} out Zielmatrix.
 * @param {number[]} q Rotations-Quaternion [x, y, z, w].
 * @param {number[]} v Verschiebung (Länge 3).
 * @returns {Float32Array} out.
 */
export function fromRotationTranslation(out, q, v) {
  fromQuat(out, q);
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  return out;
}

/**
 * Erzeugt eine kombinierte Skalierungs-/Rotations-/Translationsmatrix
 * (erst Skalierung, dann Rotation, dann Translation) aus glTF-artigen
 * Node-TRS-Werten.
 * @param {Float32Array} out Zielmatrix.
 * @param {number[]} q Rotations-Quaternion [x, y, z, w].
 * @param {number[]} v Verschiebung (Länge 3).
 * @param {number[]} s Skalierung pro Achse (Länge 3).
 * @returns {Float32Array} out.
 */
export function fromRotationTranslationScale(out, q, v, s) {
  fromQuat(out, q);
  out[0] *= s[0]; out[1] *= s[0]; out[2] *= s[0];
  out[4] *= s[1]; out[5] *= s[1]; out[6] *= s[1];
  out[8] *= s[2]; out[9] *= s[2]; out[10] *= s[2];
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  return out;
}

/**
 * Erzeugt eine rechtshändige View-Matrix (Kamera bei `eye`, blickt auf
 * `center`, `up` als Referenz für "oben").
 * @param {Float32Array} out Zielmatrix.
 * @param {number[]} eye Kameraposition (Länge 3).
 * @param {number[]} center Blickziel (Länge 3).
 * @param {number[]} up Oben-Referenzvektor (Länge 3).
 * @returns {Float32Array} out.
 */
export function lookAt(out, eye, center, up) {
  const eyex = eye[0], eyey = eye[1], eyez = eye[2];
  const upx = up[0], upy = up[1], upz = up[2];

  let z0 = eyex - center[0];
  let z1 = eyey - center[1];
  let z2 = eyez - center[2];
  let len = Math.hypot(z0, z1, z2);
  if (len === 0) {
    z2 = 1;
  } else {
    len = 1 / len;
    z0 *= len;
    z1 *= len;
    z2 *= len;
  }

  let x0 = upy * z2 - upz * z1;
  let x1 = upz * z0 - upx * z2;
  let x2 = upx * z1 - upy * z0;
  len = Math.hypot(x0, x1, x2);
  if (len === 0) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  const y0 = z1 * x2 - z2 * x1;
  const y1 = z2 * x0 - z0 * x2;
  const y2 = z0 * x1 - z1 * x0;

  out[0] = x0; out[1] = y0; out[2] = z0; out[3] = 0;
  out[4] = x1; out[5] = y1; out[6] = z1; out[7] = 0;
  out[8] = x2; out[9] = y2; out[10] = z2; out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;
  return out;
}
