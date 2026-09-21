/**
 * Einstiegspunkt: verdrahtet Plattformerkennung, Secure-Context-Prüfung,
 * die Rechte-Anfrage, die fortlaufenden Sensoren mit dem Debug-Overlay,
 * den Geo-Tracker/Scene/2D-Renderer (Phase 4) sowie die Sensorfusion
 * für Kompass-Glättung und Pitch/Roll aus Gyro+Accelerometer (Phase 5).
 */

import { getPlatformInfo } from "./platform/detect.js";
import { getSecureContextError } from "./platform/secureContext.js";
import {
  createInitialPermissionState,
  requestAllPermissions,
} from "./permissions/permissionManager.js";
import { renderPermissionStatus } from "./permissions/permissionUI.js";
import { attachCameraStream, stopCamera } from "./sensors/camera.js";
import { startGeolocationWatch } from "./sensors/geolocation.js";
import { startCompassWatch, correctHeadingForScreenRotation } from "./sensors/compass.js";
import { startGyroscopeWatch } from "./sensors/gyroscope.js";
import { startAccelerometerWatch } from "./sensors/accelerometer.js";
import { startScreenOrientationWatch } from "./sensors/screenOrientation.js";
import { startBrowserOrientationWatch } from "./sensors/browserOrientation.js";
import { watchSensorHealth } from "./sensors/sensorHealth.js";
import { createDebugOverlay } from "./debug/overlay.js";
import { haversineDistance } from "./math/geo/haversine.js";
import { initialBearing } from "./math/geo/bearing.js";
import { shortestAngleDiffDeg } from "./math/angle.js";
import { FIELD_TEST_TARGET } from "./core/config.js";
import { createGeoTracker } from "./trackers/geoTracker.js";
import { createScene, setSceneAnchors } from "./scene/scene.js";
import { createGeoAnchors } from "./scene/geoAnchor.js";
import { createRenderer2D } from "./render/canvas2d/renderer2d.js";
import { startLoop } from "./core/loop.js";
import { createAngleLowpassFilter } from "./filters/angleLowpass.js";
import { createComplementaryFilter } from "./filters/complementary.js";

const startButton = document.getElementById("start-button");
const statusList = document.getElementById("status-list");
const errorBox = document.getElementById("error-box");
const cameraPreview = document.getElementById("camera-preview");
const debugOverlayEl = document.getElementById("debug-overlay");
const arCanvas = document.getElementById("ar-canvas");

const platformInfo = getPlatformInfo();
renderPermissionStatus(statusList, createInitialPermissionState(), platformInfo);

const overlay = createDebugOverlay(debugOverlayEl);

// Phase 4: Tracker liefert die Pose, Scene hält Pose + Anchors, der
// 2D-Renderer kennt nur die Scene (Datenfluss: Tracker → Scene →
// Renderer). Läuft unabhängig von den Rechten schon los – das Canvas
// bleibt leer, bis Standort + places.json vorliegen.
const geoTracker = createGeoTracker();
const scene = createScene(geoTracker.getPose());
const renderer2d = createRenderer2D(arCanvas);
let places = [];
let sceneAnchorsReady = false;

function resizeArCanvas() {
  arCanvas.width = window.innerWidth;
  arCanvas.height = window.innerHeight;
}
resizeArCanvas();
window.addEventListener("resize", resizeArCanvas);

function tryInitSceneAnchors() {
  if (sceneAnchorsReady || !geoTracker.hasOrigin() || places.length === 0) return;
  setSceneAnchors(scene, createGeoAnchors(places, geoTracker.getOrigin()));
  sceneAnchorsReady = true;
  overlay.setRow("scene", "Szene", `${scene.anchors.length} Anchor(s) aus places.json geladen`);
}

fetch("./data/places.json")
  .then((response) => response.json())
  .then((data) => {
    places = data;
    overlay.setRow("scene", "Szene", `${places.length} Places geladen, wartet auf Standort`);
    tryInitSceneAnchors();
  })
  .catch((error) => overlay.setRow("scene", "Szene", `Fehler beim Laden von places.json: ${error.message}`));

startLoop(() => {
  renderer2d.render(scene);
});

const secureContextError = getSecureContextError();
if (secureContextError) {
  errorBox.textContent = secureContextError;
  errorBox.hidden = false;
  startButton.disabled = true;
}

let activeStops = [];
let activeCameraStream = null;

function stopAllSensors() {
  for (const stop of activeStops) stop();
  activeStops = [];
  if (activeCameraStream) {
    stopCamera(activeCameraStream);
    activeCameraStream = null;
  }
  cameraPreview.hidden = true;
}

function formatAngle(value) {
  return value === null ? "–" : `${value.toFixed(1)}°`;
}

function startSensorsForState(state, resources) {
  // Wird bei Sensor-Timeout (siehe sensorHealth.js) lokal auf
  // "unavailable" heruntergestuft und erneut gerendert, ohne den
  // ursprünglichen Permission-Zustand `state` zu verändern.
  const effectiveState = { ...state };

  // Feldtest: Distanz/Peilung zur Test-Koordinate aus config.js, plus
  // Abweichung zwischen eigenem Kompass und errechneter Peilung. Nur
  // aktualisiert, sobald sowohl Standort als auch ein NUTZBARER
  // (absoluter) Kompass-Wert vorliegen.
  let lastLocationSample = null;
  let lastAbsoluteCompassHeadingDeg = null;
  let lastScreenAngleDeg = 0;
  const headingFilter = createAngleLowpassFilter(0.2);
  const tiltFilter = createComplementaryFilter();
  let lastGyroSample = null;
  let lastAccelSample = null;

  // Phase 5: Gyro + Accelerometer zu Pitch/Roll fusionieren, sobald
  // beide für denselben devicemotion-Tick vorliegen (Gyro/Accel hören
  // unabhängig auf dasselbe Browser-Ereignis, siehe sensors/gyroscope.js
  // + accelerometer.js). Achsen-Zuordnung siehe filters/complementary.js:
  // Gyro-BETA (lokale X-Achse) = Pitch-Rate, Gyro-ALPHA (lokale Z-Achse)
  // = Roll-Rate – NICHT gamma, trotz der Namensähnlichkeit zu "roll".
  function runTiltFusion() {
    if (!lastGyroSample || !lastAccelSample) return;
    // Ohne Gravitationsanteil taugt die Beschleunigung nicht als
    // Neigungsreferenz (accelToTilt braucht den Schwerkraftvektor).
    if (!lastAccelSample.includesGravity) return;
    const dtSeconds = (lastGyroSample.intervalMs || 16) / 1000;
    const { pitchDeg, rollDeg } = tiltFilter.update(
      lastGyroSample.betaDegPerSec,
      lastGyroSample.alphaDegPerSec,
      lastAccelSample.xMetersPerSecSq,
      lastAccelSample.yMetersPerSecSq,
      lastAccelSample.zMetersPerSecSq,
      dtSeconds
    );
    geoTracker.updateTilt(pitchDeg, rollDeg);
    overlay.setRow(
      "tilt",
      "Neigung (gefiltert)",
      `Pitch ${pitchDeg.toFixed(1)}° Roll ${rollDeg.toFixed(1)}°`
    );
  }

  function updateFieldTestOverlay() {
    if (!lastLocationSample) return;

    const distanceM = haversineDistance(
      lastLocationSample.latitudeDeg,
      lastLocationSample.longitudeDeg,
      FIELD_TEST_TARGET.latDeg,
      FIELD_TEST_TARGET.lonDeg
    );
    const bearingDeg = initialBearing(
      lastLocationSample.latitudeDeg,
      lastLocationSample.longitudeDeg,
      FIELD_TEST_TARGET.latDeg,
      FIELD_TEST_TARGET.lonDeg
    );
    overlay.setRow("fieldTestDistance", "Feldtest-Distanz", `${distanceM.toFixed(1)} m`);
    overlay.setRow("fieldTestBearing", "Feldtest-Peilung", `${bearingDeg.toFixed(1)}°`);

    if (lastAbsoluteCompassHeadingDeg === null) {
      overlay.setRow("fieldTestDeviation", "Feldtest-Abweichung", "wartet auf nutzbaren Kompass");
      return;
    }
    const deviationDeg = shortestAngleDiffDeg(lastAbsoluteCompassHeadingDeg, bearingDeg);
    overlay.setRow("fieldTestDeviation", "Feldtest-Abweichung", `${deviationDeg.toFixed(1)}°`);
  }

  if (state.camera === "granted" && resources.cameraStream) {
    activeCameraStream = resources.cameraStream;
    cameraPreview.hidden = false;
    attachCameraStream(cameraPreview, activeCameraStream).catch((error) =>
      overlay.setRow("camera", "Kamera", `Fehler: ${error.message}`)
    );
  }

  if (state.location === "granted") {
    activeStops.push(
      startGeolocationWatch(
        (sample) => {
          const accuracy = Math.round(sample.accuracyMeters);
          overlay.setRow(
            "location",
            "Standort",
            `${sample.latitudeDeg.toFixed(6)}, ${sample.longitudeDeg.toFixed(6)} (±${accuracy} m)`
          );
          lastLocationSample = sample;
          updateFieldTestOverlay();
          geoTracker.updateLocation(sample);
          tryInitSceneAnchors();
        },
        (error) => overlay.setRow("location", "Standort", `Fehler: ${error.message}`),
        resources.initialPosition
      )
    );
  } else {
    overlay.setRow("location", "Standort", "nicht verfügbar/abgelehnt");
    overlay.setRow("fieldTestDistance", "Feldtest-Distanz", "nicht verfügbar/abgelehnt");
    overlay.setRow("fieldTestBearing", "Feldtest-Peilung", "nicht verfügbar/abgelehnt");
    overlay.setRow("fieldTestDeviation", "Feldtest-Abweichung", "nicht verfügbar/abgelehnt");
  }

  if (state.orientation === "granted") {
    activeStops.push(
      watchSensorHealth(
        startCompassWatch,
        (sample) => {
          const usabilityNote = sample.absolute ? "" : " – relativ (unbrauchbar für Geo-AR)";
          overlay.setRow(
            "compass",
            "Kompass",
            `${sample.headingDeg.toFixed(1)}° (${sample.source})${usabilityNote}`
          );
          if (sample.absolute) {
            const correctedDeg = correctHeadingForScreenRotation(sample, lastScreenAngleDeg);
            const smoothedDeg = headingFilter.update(correctedDeg);
            overlay.setRow(
              "compassCorrected",
              "Kompass (korrigiert+geglättet)",
              `${smoothedDeg.toFixed(1)}°`
            );
            lastAbsoluteCompassHeadingDeg = smoothedDeg;
            updateFieldTestOverlay();
            geoTracker.updateHeading(smoothedDeg);
          }
        },
        (health) => {
          if (health !== "unavailable") return;
          effectiveState.orientation = "unavailable";
          overlay.setRow("compass", "Kompass", "nicht verfügbar (keine Sensor-Events)");
          renderPermissionStatus(statusList, effectiveState, platformInfo);
        }
      )
    );
  } else {
    overlay.setRow("compass", "Kompass", "nicht verfügbar/abgelehnt");
  }

  if (state.motion === "granted") {
    let gyroHealth = "pending";
    let accelHealth = "pending";

    // devicemotion feuert für Gyro und Accelerometer gemeinsam: erst wenn
    // BEIDE Timeout melden, ist das Gerät wirklich ohne Bewegungssensoren
    // (nicht nur eine einzelne Achse nicht unterstützt).
    function downgradeMotionIfBothDead() {
      if (gyroHealth !== "unavailable" || accelHealth !== "unavailable") return;
      effectiveState.motion = "unavailable";
      renderPermissionStatus(statusList, effectiveState, platformInfo);
    }

    activeStops.push(
      watchSensorHealth(
        startGyroscopeWatch,
        (sample) => {
          overlay.setRow(
            "gyro",
            "Gyro",
            `α ${sample.alphaDegPerSec.toFixed(1)} β ${sample.betaDegPerSec.toFixed(1)} γ ${sample.gammaDegPerSec.toFixed(1)} °/s`
          );
          lastGyroSample = sample;
          runTiltFusion();
        },
        (health) => {
          gyroHealth = health;
          if (health !== "unavailable") return;
          overlay.setRow("gyro", "Gyro", "nicht verfügbar (keine Sensor-Events)");
          downgradeMotionIfBothDead();
        }
      )
    );
    activeStops.push(
      watchSensorHealth(
        startAccelerometerWatch,
        (sample) => {
          const gravityNote = sample.includesGravity ? " (inkl. Gravitation)" : " (ohne Gravitation)";
          overlay.setRow(
            "accel",
            "Beschleunigung",
            `x ${sample.xMetersPerSecSq.toFixed(2)} y ${sample.yMetersPerSecSq.toFixed(2)} z ${sample.zMetersPerSecSq.toFixed(2)} m/s²${gravityNote}`
          );
          lastAccelSample = sample;
          runTiltFusion();
        },
        (health) => {
          accelHealth = health;
          if (health !== "unavailable") return;
          overlay.setRow("accel", "Beschleunigung", "nicht verfügbar (keine Sensor-Events)");
          downgradeMotionIfBothDead();
        }
      )
    );
  } else {
    overlay.setRow("gyro", "Gyro", "nicht verfügbar/abgelehnt");
    overlay.setRow("accel", "Beschleunigung", "nicht verfügbar/abgelehnt");
  }

  activeStops.push(
    startScreenOrientationWatch((angleDeg) => {
      lastScreenAngleDeg = angleDeg;
      overlay.setRow("screenOrientation", "Bildschirm-Rotation", `${angleDeg}°`);
    })
  );

  activeStops.push(
    startBrowserOrientationWatch((sample) => {
      const absoluteNote = sample.absolute ? " (absolut)" : "";
      overlay.setRow(
        "browserOrientation",
        "Browser-Orientierung (Referenz)",
        `α ${formatAngle(sample.alphaDeg)} β ${formatAngle(sample.betaDeg)} γ ${formatAngle(sample.gammaDeg)}${absoluteNote}`
      );
    })
  );
}

startButton.addEventListener("click", () => {
  startButton.disabled = true;
  // Vor der neuen Anfrage stoppen, damit z. B. der alte Kamera-Stream
  // nicht parallel zum neu angeforderten Stream weiterläuft.
  stopAllSensors();

  requestAllPermissions((snapshot) => {
    renderPermissionStatus(statusList, snapshot, platformInfo);
  })
    .then(({ permissions, resources }) => startSensorsForState(permissions, resources))
    .finally(() => {
      startButton.disabled = false;
      startButton.textContent = "Rechte erneut anfragen";
    });
});
