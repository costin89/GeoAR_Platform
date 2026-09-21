/**
 * Erzeugt Vertex-Daten für einen einfachen Kegel-Marker (Pin-Form), der
 * an einem Anchor-Punkt nach oben zeigt. Eigene, prozedurale
 * Geometrie-Erzeugung – kein Modell-Loader (kommt erst mit glTF in
 * Phase 7).
 */

/**
 * @typedef {{
 *   positions: Float32Array,
 *   normals: Float32Array,
 *   indices: Uint16Array
 * }} MarkerGeometry
 */

/**
 * Erzeugt die Geometrie eines nach oben zeigenden Kegels (Mantelfläche
 * + Grundfläche), mit dem Mittelpunkt der Grundfläche im Ursprung
 * (wird beim Zeichnen per Modellmatrix zum Anchor verschoben).
 * @param {number} radius Grundflächen-Radius, in Metern.
 * @param {number} height Höhe (Spitze über der Grundfläche), in Metern.
 * @param {number} segments Anzahl der Segmente rund um den Kegel
 *   (mind. 3; mehr = runder, aber mehr Dreiecke).
 * @returns {MarkerGeometry} Vertex-Positionen, -Normalen und Indizes.
 */
export function createConeMarkerGeometry(radius, height, segments) {
  const positions = [];
  const normals = [];
  const indices = [];

  const apex = [0, height, 0];
  // Mantel-Normalen zeigen schräg nach außen/oben (senkrecht zur
  // Kegel-Mantellinie), nicht rein horizontal.
  const slantLength = Math.sqrt(radius * radius + height * height);
  const nY = radius / slantLength;
  const nXZ = height / slantLength;

  for (let i = 0; i < segments; i++) {
    const angle0 = (i / segments) * Math.PI * 2;
    const angle1 = ((i + 1) / segments) * Math.PI * 2;

    const base0 = [Math.cos(angle0) * radius, 0, Math.sin(angle0) * radius];
    const base1 = [Math.cos(angle1) * radius, 0, Math.sin(angle1) * radius];
    const normal0 = [Math.cos(angle0) * nXZ, nY, Math.sin(angle0) * nXZ];
    const normal1 = [Math.cos(angle1) * nXZ, nY, Math.sin(angle1) * nXZ];
    const midAngle = (angle0 + angle1) / 2;
    const normalMid = [Math.cos(midAngle) * nXZ, nY, Math.sin(midAngle) * nXZ];

    const startIndex = positions.length / 3;
    positions.push(...apex, ...base0, ...base1);
    normals.push(...normalMid, ...normal0, ...normal1);
    indices.push(startIndex, startIndex + 1, startIndex + 2);
  }

  // Grundfläche als Dreiecksfächer um einen Mittelpunkt, Normale nach
  // unten.
  const baseCenterIndex = positions.length / 3;
  positions.push(0, 0, 0);
  normals.push(0, -1, 0);
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    positions.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    normals.push(0, -1, 0);
  }
  for (let i = 0; i < segments; i++) {
    const a = baseCenterIndex + 1 + i;
    const b = baseCenterIndex + 1 + ((i + 1) % segments);
    indices.push(baseCenterIndex, b, a);
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
  };
}
