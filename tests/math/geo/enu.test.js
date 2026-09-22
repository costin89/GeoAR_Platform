import { test, assertClose } from "../../runner.js";
import { geodeticToScene } from "../../../src/math/geo/enu.js";
import { haversineDistance } from "../../../src/math/geo/haversine.js";
import { degToRad, radToDeg } from "../../../src/math/angle.js";

const origin = { latDeg: 52.52, lonDeg: 13.405, heightM: 0 };

// Empirische WGS84-Formeln (Meter pro Breiten-/Längengrad, Genauigkeit
// im Millimeterbereich). Nur für den Test benutzt, um Vergleichswerte zu
// erzeugen, die unabhängig vom enu.js-Code selbst sind.
function metersPerDegreeLat(latDeg) {
  const lat = degToRad(latDeg);
  return (
    111132.92 -
    559.82 * Math.cos(2 * lat) +
    1.175 * Math.cos(4 * lat) -
    0.0023 * Math.cos(6 * lat)
  );
}

function metersPerDegreeLon(latDeg) {
  const lat = degToRad(latDeg);
  return 111412.84 * Math.cos(lat) - 93.5 * Math.cos(3 * lat) + 0.118 * Math.cos(5 * lat);
}

test("100 m nördlich des Ursprungs ≈ Szene (0, 0, -100)", () => {
  const dLat = 100 / metersPerDegreeLat(origin.latDeg);
  const out = geodeticToScene([0, 0, 0], origin.latDeg + dLat, origin.lonDeg, 0, origin);
  assertClose(out[0], 0, 0.5);
  assertClose(out[1], 0, 0.5);
  assertClose(out[2], -100, 0.5);
});

test("100 m östlich des Ursprungs ≈ Szene (100, 0, 0)", () => {
  const dLon = 100 / metersPerDegreeLon(origin.latDeg);
  const out = geodeticToScene([0, 0, 0], origin.latDeg, origin.lonDeg + dLon, 0, origin);
  assertClose(out[0], 100, 0.5);
  assertClose(out[1], 0, 0.5);
  assertClose(out[2], 0, 0.5);
});

test("ENU-Distanz und Haversine-Distanz stimmen für 1 km auf < 1 m überein", () => {
  // Bearing 0° (Nord) gewählt: bei diesem Breitengrad liegt der
  // Meridian-Krümmungsradius (M) näher am mittleren Kugelradius als der
  // Querkrümmungsradius (N), d. h. die Kugel-Näherung (Haversine) weicht
  // hier am wenigsten vom WGS84-Ellipsoid ab. Bei anderen Peilungen
  // (z. B. Ost) kann die Abweichung durchaus mehrere Meter betragen –
  // das ist eine reale Eigenschaft der Ellipsoid-Geometrie, kein Fehler
  // in enu.js.
  const bearingDeg = 0;
  const distanceM = 1000;
  const sphereRadiusM = 6371008.8;

  const lat1 = degToRad(origin.latDeg);
  const lon1 = degToRad(origin.lonDeg);
  const bearing = degToRad(bearingDeg);
  const angularDistance = distanceM / sphereRadiusM;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

  const targetLatDeg = radToDeg(lat2);
  const targetLonDeg = radToDeg(lon2);

  const haversine = haversineDistance(origin.latDeg, origin.lonDeg, targetLatDeg, targetLonDeg);
  const scenePoint = geodeticToScene([0, 0, 0], targetLatDeg, targetLonDeg, 0, origin);
  const enuDistance = Math.sqrt(scenePoint[0] ** 2 + scenePoint[1] ** 2 + scenePoint[2] ** 2);

  assertClose(enuDistance, haversine, 1);
});
