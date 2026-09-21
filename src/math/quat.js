/**
 * Quaternion-Mathe für Rotationen. Quaternionen sind Arrays der Länge 4:
 * [x, y, z, w]. Alle Funktionen sind pur und schreiben ihr Ergebnis in
 * den übergebenen `out`-Parameter.
 */

/**
 * Erzeugt ein neues Identitäts-Quaternion [0, 0, 0, 1].
 * @returns {number[]} Neues Quaternion.
 */
export function create() {
  return [0, 0, 0, 1];
}

/**
 * Multipliziert zwei Quaternionen: out = a * b (bei Anwendung auf einen
 * Vektor wirkt zuerst b, dann a).
 * @param {number[]} out Ziel-Quaternion.
 * @param {number[]} a Erster Faktor.
 * @param {number[]} b Zweiter Faktor.
 * @returns {number[]} out.
 */
export function multiply(out, a, b) {
  const ax = a[0], ay = a[1], az = a[2], aw = a[3];
  const bx = b[0], by = b[1], bz = b[2], bw = b[3];
  out[0] = aw * bx + ax * bw + ay * bz - az * by;
  out[1] = aw * by - ax * bz + ay * bw + az * bx;
  out[2] = aw * bz + ax * by - ay * bx + az * bw;
  out[3] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}

/**
 * Normalisiert ein Quaternion auf Länge 1.
 * @param {number[]} out Ziel-Quaternion.
 * @param {number[]} a Ausgangs-Quaternion.
 * @returns {number[]} out.
 */
export function normalize(out, a) {
  const len = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3]);
  if (len === 0) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
  }
  const inv = 1 / len;
  out[0] = a[0] * inv;
  out[1] = a[1] * inv;
  out[2] = a[2] * inv;
  out[3] = a[3] * inv;
  return out;
}

/**
 * Konjugiert ein Quaternion (negiert den Vektorteil).
 * @param {number[]} out Ziel-Quaternion.
 * @param {number[]} a Ausgangs-Quaternion.
 * @returns {number[]} out.
 */
export function conjugate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  return out;
}

/**
 * Invertiert ein Quaternion. Für normalisierte (Einheits-)Quaternionen
 * identisch zu conjugate, aber auch für nicht normalisierte korrekt.
 * @param {number[]} out Ziel-Quaternion.
 * @param {number[]} a Ausgangs-Quaternion.
 * @returns {number[]} out.
 */
export function invert(out, a) {
  const lenSq = a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3];
  if (lenSq === 0) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
  }
  const invLenSq = 1 / lenSq;
  out[0] = -a[0] * invLenSq;
  out[1] = -a[1] * invLenSq;
  out[2] = -a[2] * invLenSq;
  out[3] = a[3] * invLenSq;
  return out;
}

/**
 * Erzeugt ein Rotations-Quaternion aus Achse und Winkel.
 * @param {number[]} out Ziel-Quaternion.
 * @param {number[]} axis Rotationsachse (sollte normalisiert sein).
 * @param {number} angleRad Rotationswinkel in Radiant.
 * @returns {number[]} out.
 */
export function fromAxisAngle(out, axis, angleRad) {
  const half = angleRad / 2;
  const s = Math.sin(half);
  out[0] = axis[0] * s;
  out[1] = axis[1] * s;
  out[2] = axis[2] * s;
  out[3] = Math.cos(half);
  return out;
}

/**
 * Erzeugt ein Rotations-Quaternion aus Euler-Winkeln in Y-X-Z-Reihenfolge
 * (Yaw um Y, dann Pitch um X, dann Roll um Z) – die übliche Reihenfolge
 * für Geräteausrichtung (Kompass-Yaw, Neigung, Verkantung).
 * @param {number[]} out Ziel-Quaternion.
 * @param {number} yawRad Rotation um die Y-Achse, in Radiant.
 * @param {number} pitchRad Rotation um die X-Achse, in Radiant.
 * @param {number} rollRad Rotation um die Z-Achse, in Radiant.
 * @returns {number[]} out.
 */
export function fromEulerYXZ(out, yawRad, pitchRad, rollRad) {
  const cy = Math.cos(yawRad / 2), sy = Math.sin(yawRad / 2);
  const cx = Math.cos(pitchRad / 2), sx = Math.sin(pitchRad / 2);
  const cz = Math.cos(rollRad / 2), sz = Math.sin(rollRad / 2);

  // q = qYaw * qPitch * qRoll (intrinsisch: erst Roll, dann Pitch, dann Yaw)
  out[0] = cy * sx * cz + sy * cx * sz;
  out[1] = sy * cx * cz - cy * sx * sz;
  out[2] = cy * cx * sz - sy * sx * cz;
  out[3] = cy * cx * cz + sy * sx * sz;
  return out;
}

/**
 * Sphärische lineare Interpolation zwischen zwei Einheits-Quaternionen.
 * @param {number[]} out Ziel-Quaternion.
 * @param {number[]} a Start-Quaternion (t=0).
 * @param {number[]} b End-Quaternion (t=1).
 * @param {number} t Interpolationsfaktor, üblich im Bereich 0..1.
 * @returns {number[]} out.
 */
export function slerp(out, a, b, t) {
  const ax = a[0], ay = a[1], az = a[2], aw = a[3];
  let bx = b[0], by = b[1], bz = b[2], bw = b[3];

  let cosom = ax * bx + ay * by + az * bz + aw * bw;
  if (cosom < 0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }

  let scaleA;
  let scaleB;
  if (1 - cosom > 1e-6) {
    const omega = Math.acos(cosom);
    const sinom = Math.sin(omega);
    scaleA = Math.sin((1 - t) * omega) / sinom;
    scaleB = Math.sin(t * omega) / sinom;
  } else {
    scaleA = 1 - t;
    scaleB = t;
  }

  out[0] = scaleA * ax + scaleB * bx;
  out[1] = scaleA * ay + scaleB * by;
  out[2] = scaleA * az + scaleB * bz;
  out[3] = scaleA * aw + scaleB * bw;
  return out;
}

/**
 * Rotiert einen Vektor mit einem Einheits-Quaternion: out = q * v * q⁻¹.
 * @param {number[]} out Ziel-Vektor (Länge 3).
 * @param {number[]} v Ausgangsvektor (Länge 3).
 * @param {number[]} q Rotations-Quaternion (sollte normalisiert sein).
 * @returns {number[]} out.
 */
export function rotateVec3(out, v, q) {
  const qx = q[0], qy = q[1], qz = q[2], qw = q[3];
  const vx = v[0], vy = v[1], vz = v[2];

  const tx = 2 * (qy * vz - qz * vy);
  const ty = 2 * (qz * vx - qx * vz);
  const tz = 2 * (qx * vy - qy * vx);

  out[0] = vx + qw * tx + (qy * tz - qz * ty);
  out[1] = vy + qw * ty + (qz * tx - qx * tz);
  out[2] = vz + qw * tz + (qx * ty - qy * tx);
  return out;
}
