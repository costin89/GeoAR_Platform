/**
 * WGS84-Ellipsoid-Konstanten und abgeleitete Werte für Geo-Berechnungen.
 */

/** Große Halbachse (Äquatorradius) des WGS84-Ellipsoids, in Metern. */
export const WGS84_A = 6378137.0;

/** Abplattung des WGS84-Ellipsoids. */
export const WGS84_F = 1 / 298.257223563;

/** Kleine Halbachse (Polradius) des WGS84-Ellipsoids, in Metern. */
export const WGS84_B = WGS84_A * (1 - WGS84_F);

/** Erste numerische Exzentrizität zum Quadrat des WGS84-Ellipsoids. */
export const WGS84_E2 = WGS84_F * (2 - WGS84_F);

/**
 * Mittlerer Erdradius (IUGG), in Metern. Für die kugelbasierte
 * Haversine-Distanz – nicht für ellipsoid-exakte ENU-Umrechnungen
 * (die nutzen WGS84_A/WGS84_E2 direkt).
 */
export const EARTH_MEAN_RADIUS_M = 6371008.8;
