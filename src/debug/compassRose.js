/**
 * Debug-Kompassrose: vier Szenen-Anchors (Nord/Ost/Süd/West) in fester
 * Distanz um den Szenen-Ursprung. Dient zum Kalibrieren/Prüfen von
 * Kompass, Neigung und Renderer unabhängig von echten GPS-Daten aus
 * places.json – der Ursprung ist die Kamera-Startposition (0,0,0), auch
 * bevor ein echter GPS-Fix vorliegt.
 */

/**
 * Erzeugt die vier Kompassrose-Anchors um den Szenen-Ursprung.
 * @param {number} [distanceM] Distanz vom Ursprung, in Metern. Standard
 *   100.
 * @returns {import("../scene/scene.js").SceneAnchor[]} Vier Anchors in
 *   Reihenfolge Nord, Ost, Süd, West.
 */
export function createCompassRoseAnchors(distanceM = 100) {
  return [
    { id: "compass-rose-n", name: "N", scenePosition: [0, 0, -distanceM] },
    { id: "compass-rose-e", name: "O", scenePosition: [distanceM, 0, 0] },
    { id: "compass-rose-s", name: "S", scenePosition: [0, 0, distanceM] },
    { id: "compass-rose-w", name: "W", scenePosition: [-distanceM, 0, 0] },
  ];
}
