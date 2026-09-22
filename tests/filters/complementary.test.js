import { test, assertClose } from "../runner.js";
import { accelToTilt, createComplementaryFilter } from "../../src/filters/complementary.js";

const G = 9.8;
const rad = (deg) => (deg * Math.PI) / 180;

/**
 * Baut einen Beschleunigungsvektor, der von accelToTilt exakt zu
 * `pitchDeg` (bei roll=0) zurückgerechnet wird (Umkehrung der in
 * accelToTilt verwendeten Formel).
 */
function accelForPitch(pitchDeg) {
  const r = rad(pitchDeg);
  return { x: 0, y: G * Math.cos(r), z: -G * Math.sin(r) };
}

test("accelToTilt: aufrechte AR-Haltung (0,g,0) ergibt pitch=0, roll=0", () => {
  const { pitchDeg, rollDeg } = accelToTilt(0, G, 0);
  assertClose(pitchDeg, 0, 1e-6);
  assertClose(rollDeg, 0, 1e-6);
});

test("accelToTilt: 30° Pitch (Kamera schaut nach oben)", () => {
  const { pitchDeg, rollDeg } = accelToTilt(0, G * Math.cos(rad(30)), -G * Math.sin(rad(30)));
  assertClose(pitchDeg, 30, 1e-4);
  assertClose(rollDeg, 0, 1e-4);
});

test("accelToTilt: 30° Roll", () => {
  const { pitchDeg, rollDeg } = accelToTilt(G * Math.sin(rad(30)), G * Math.cos(rad(30)), 0);
  assertClose(rollDeg, 30, 1e-4);
  assertClose(pitchDeg, 0, 1e-4);
});

test("createComplementaryFilter: erster update() übernimmt den Accelerometer-Wert direkt", () => {
  const filter = createComplementaryFilter();
  const { pitchDeg } = filter.update(0, 0, 0, G, 0, 1 / 60);
  assertClose(pitchDeg, 0, 1e-6);
});

test("createComplementaryFilter: konvergiert bei konstanter Neigung gegen den Accelerometer-Wert", () => {
  const filter = createComplementaryFilter({ gyroWeight: 0.9, accelLowpassAlpha: 1 });
  filter.reset(0, 0);
  const accelX = 0;
  const accelY = G * Math.cos(rad(20));
  const accelZ = -G * Math.sin(rad(20));
  let last = 0;
  for (let i = 0; i < 300; i++) {
    last = filter.update(0, 0, accelX, accelY, accelZ, 1 / 60).pitchDeg;
  }
  assertClose(last, 20, 0.5);
});

test("createComplementaryFilter: reagiert sofort auf Gyro-Rate (kein Nachlaufen wie bei reinem Tiefpass)", () => {
  const filter = createComplementaryFilter({ gyroWeight: 0.98 });
  filter.update(0, 0, 0, G, 0, 1 / 60); // init bei pitch=0 (Accel-Wert)
  const { pitchDeg } = filter.update(60, 0, 0, G, 0, 1 / 60); // 60°/s * 1/60s = 1°
  assertClose(pitchDeg, 0.98, 0.05); // ~gyroWeight*1° + (1-gyroWeight)*0°
});

test("createComplementaryFilter: Mischung von 179° (Gyro) und -179° (Accel) ergibt ≈±180°, nicht 0° (Fix 3)", () => {
  // Gleichgewichtete Mischung (0.5), damit der Wrap-around-Fehler einer
  // naiven linearen Mittelung deutlich sichtbar wird: eine falsche
  // Implementierung würde 0.5*179 + 0.5*(-179) = 0° liefern, obwohl
  // beide Werte nur 2° auseinanderliegen (über die ±180°-Grenze hinweg).
  const filter = createComplementaryFilter({ gyroWeight: 0.5, accelLowpassAlpha: 1 });
  filter.reset(179, 0); // interner Gyro-Zustand startet bei 179°
  const accel = accelForPitch(-179); // Accelerometer misst -179°

  const { pitchDeg } = filter.update(0, 0, accel.x, accel.y, accel.z, 1 / 60);

  assertClose(Math.abs(pitchDeg), 180, 0.5);
});
