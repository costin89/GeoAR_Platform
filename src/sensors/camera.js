/**
 * Verwaltet den Lebenszyklus eines bereits laufenden Kamera-Streams
 * (Anhängen an ein `<video>`-Element, Stoppen). Die eigentliche
 * Beschaffung des Streams (`getUserMedia`) übernimmt
 * src/permissions/cameraPermission.js – der dort erteilte Stream wird
 * hier weiterverwendet, damit die Kamera nicht zweimal angefragt wird.
 */

/**
 * Hängt einen Kamera-Stream an ein Video-Element und startet die
 * Wiedergabe.
 * @param {HTMLVideoElement} videoElement Zielelement für die Vorschau.
 * @param {MediaStream} stream Laufender Kamera-Stream.
 * @returns {Promise<void>} Löst auf, sobald die Wiedergabe läuft.
 */
export function attachCameraStream(videoElement, stream) {
  videoElement.srcObject = stream;
  return videoElement.play();
}

/**
 * Stoppt alle Tracks eines Kamera-Streams und gibt die Kamera frei.
 * @param {MediaStream} stream Zu stoppender Stream.
 * @returns {void}
 */
export function stopCamera(stream) {
  for (const track of stream.getTracks()) track.stop();
}
