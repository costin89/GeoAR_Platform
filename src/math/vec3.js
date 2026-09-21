/**
 * 3D-Vektor-Mathe. Alle Funktionen sind pur und schreiben ihr Ergebnis in
 * den übergebenen `out`-Parameter (kein Objekt-Garbage im Render-Loop).
 * Vektoren sind einfache Arrays der Länge 3: [x, y, z].
 */

/**
 * Erzeugt einen neuen Nullvektor.
 * @returns {number[]} Neuer Vektor [0, 0, 0].
 */
export function create() {
  return [0, 0, 0];
}

/**
 * Setzt die Komponenten eines Vektors.
 * @param {number[]} out Zielvektor.
 * @param {number} x X-Komponente.
 * @param {number} y Y-Komponente.
 * @param {number} z Z-Komponente.
 * @returns {number[]} out.
 */
export function set(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}

/**
 * Kopiert einen Vektor.
 * @param {number[]} out Zielvektor.
 * @param {number[]} a Quellvektor.
 * @returns {number[]} out.
 */
export function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}

/**
 * Addiert zwei Vektoren: out = a + b.
 * @param {number[]} out Zielvektor.
 * @param {number[]} a Erster Summand.
 * @param {number[]} b Zweiter Summand.
 * @returns {number[]} out.
 */
export function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}

/**
 * Subtrahiert zwei Vektoren: out = a - b.
 * @param {number[]} out Zielvektor.
 * @param {number[]} a Minuend.
 * @param {number[]} b Subtrahend.
 * @returns {number[]} out.
 */
export function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}

/**
 * Skaliert einen Vektor: out = a * s.
 * @param {number[]} out Zielvektor.
 * @param {number[]} a Ausgangsvektor.
 * @param {number} s Skalar.
 * @returns {number[]} out.
 */
export function scale(out, a, s) {
  out[0] = a[0] * s;
  out[1] = a[1] * s;
  out[2] = a[2] * s;
  return out;
}

/**
 * Skalarprodukt zweier Vektoren.
 * @param {number[]} a Erster Vektor.
 * @param {number[]} b Zweiter Vektor.
 * @returns {number} a · b.
 */
export function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Kreuzprodukt zweier Vektoren: out = a × b.
 * @param {number[]} out Zielvektor.
 * @param {number[]} a Erster Vektor.
 * @param {number[]} b Zweiter Vektor.
 * @returns {number[]} out.
 */
export function cross(out, a, b) {
  const ax = a[0], ay = a[1], az = a[2];
  const bx = b[0], by = b[1], bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}

/**
 * Länge (Betrag) eines Vektors.
 * @param {number[]} a Vektor.
 * @returns {number} |a|.
 */
export function length(a) {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
}

/**
 * Normalisiert einen Vektor auf Länge 1. Bei einem Nullvektor bleibt out
 * ein Nullvektor (keine Division durch 0).
 * @param {number[]} out Zielvektor.
 * @param {number[]} a Ausgangsvektor.
 * @returns {number[]} out.
 */
export function normalize(out, a) {
  const len = length(a);
  if (len === 0) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
  }
  return scale(out, a, 1 / len);
}

/**
 * Euklidischer Abstand zwischen zwei Punkten.
 * @param {number[]} a Erster Punkt.
 * @param {number[]} b Zweiter Punkt.
 * @returns {number} |a - b|.
 */
export function distance(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Lineare Interpolation zwischen zwei Vektoren.
 * @param {number[]} out Zielvektor.
 * @param {number[]} a Startvektor (t=0).
 * @param {number[]} b Endvektor (t=1).
 * @param {number} t Interpolationsfaktor, üblich im Bereich 0..1.
 * @returns {number[]} out.
 */
export function lerp(out, a, b, t) {
  out[0] = a[0] + (b[0] - a[0]) * t;
  out[1] = a[1] + (b[1] - a[1]) * t;
  out[2] = a[2] + (b[2] - a[2]) * t;
  return out;
}
