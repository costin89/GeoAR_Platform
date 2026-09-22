/**
 * Zentrale, projektweite Konfigurationswerte. Feste Zahlenwerte statt
 * über mehrere Dateien verstreuter Magic Numbers.
 */

/** Vertikaler Kamera-Sichtwinkel (Field of View), in Grad. */
export const CAMERA_FOV_Y_DEG = 63;

/** Abstand der Near-Clipping-Ebene der Kamera, in Metern. */
export const CAMERA_NEAR_M = 0.1;

/** Abstand der Far-Clipping-Ebene der Kamera, in Metern. */
export const CAMERA_FAR_M = 2000;

/**
 * Maximale Darstellungsdistanz für Geo-Anchors, in Metern. Anker, die
 * weiter entfernt sind (z. B. ein Ziel in 446 km Entfernung), werden für
 * die Darstellung entlang der Richtung Kamera→Anker auf diese Distanz
 * herangezogen (siehe src/scene/renderDistance.js) – die Richtung bleibt
 * exakt erhalten, nur die Tiefe wird gestaucht. Muss deutlich unter
 * CAMERA_FAR_M bleiben, damit die geclampte Position sicher innerhalb
 * des Kamera-Frustums liegt.
 */
export const ANCHOR_MAX_RENDER_DISTANCE_M = 1000;

/** Angenommene Höhe der Kamera über dem Boden, in Metern (Augenhöhe). */
export const CAMERA_HEIGHT_M = 1.6;

/**
 * Timeout für den Sensor-Lebenszeichen-Check (src/sensors/sensorHealth.js),
 * in Millisekunden.
 */
export const SENSOR_HEALTH_TIMEOUT_MS = 2000;

/**
 * Test-Koordinate für den Feldtest (Phase 3 Debug-Overlay, später
 * Phase 4 places.json): ein markantes, von Weitem sichtbares Ziel, gegen
 * das Distanz und Peilung geprüft werden. WICHTIG: vor dem Feldtest auf
 * einen Punkt anpassen, der vom Teststandort aus tatsächlich sichtbar
 * ist (Koordinate aus einer Kartenanwendung kopieren). Standardwert ist
 * das Brandenburger Tor, Berlin – nur als Platzhalter.
 */
export const FIELD_TEST_TARGET = {
  latDeg: 52.516275,
  lonDeg: 13.377704,
  heightM: 0,
};
