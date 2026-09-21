/**
 * Einstiegspunkt: verdrahtet Plattformerkennung, Secure-Context-Prüfung,
 * die Rechte-Anfrage und – sobald Rechte vorliegen – die fortlaufenden
 * Sensoren mit dem Debug-Overlay.
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
import { startCompassWatch } from "./sensors/compass.js";
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

const startButton = document.getElementById("start-button");
const statusList = document.getElementById("status-list");
const errorBox = document.getElementById("error-box");
const cameraPreview = document.getElementById("camera-preview");
const debugOverlayEl = document.getElementById("debug-overlay");

const platformInfo = getPlatformInfo();
renderPermissionStatus(statusList, createInitialPermissionState(), platformInfo);

const overlay = createDebugOverlay(debugOverlayEl);

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
            lastAbsoluteCompassHeadingDeg = sample.headingDeg;
            updateFieldTestOverlay();
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
