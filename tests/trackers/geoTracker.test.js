import { test, assertClose, assertTrue } from "../runner.js";
import { createGeoTracker } from "../../src/trackers/geoTracker.js";
import { rotateVec3 } from "../../src/math/quat.js";

test("geoTracker: erste Position wird zum Ursprung (0,0,0)", () => {
  const tracker = createGeoTracker();
  assertTrue(!tracker.hasOrigin(), "sollte vor dem ersten Update keinen Ursprung haben");
  tracker.updateLocation({ latitudeDeg: 52.52, longitudeDeg: 13.405 });
  assertTrue(tracker.hasOrigin(), "sollte nach dem ersten Update einen Ursprung haben");
  const pose = tracker.getPose();
  assertClose(pose.position[0], 0, 1e-6);
  assertClose(pose.position[1], 0, 1e-6);
  assertClose(pose.position[2], 0, 1e-6);
});

test("geoTracker: zweite Position relativ zum Ursprung", () => {
  const tracker = createGeoTracker();
  tracker.updateLocation({ latitudeDeg: 0, longitudeDeg: 0 });
  // ~11.1m nördlich (0.0001° bei metersPerDegreeLat ≈ 111132m)
  tracker.updateLocation({ latitudeDeg: 0.0001, longitudeDeg: 0 });
  const pose = tracker.getPose();
  assertClose(pose.position[0], 0, 0.5);
  assertClose(pose.position[2], -11.1, 0.5);
});

test("geoTracker.updateHeading(0): Kamera blickt nach -z (Norden)", () => {
  const tracker = createGeoTracker();
  tracker.updateHeading(0);
  const forward = rotateVec3([0, 0, 0], [0, 0, -1], tracker.getPose().orientation);
  assertClose(forward[0], 0, 1e-6);
  assertClose(forward[2], -1, 1e-6);
});

test("geoTracker.updateHeading(90): Kamera blickt nach +x (Osten)", () => {
  const tracker = createGeoTracker();
  tracker.updateHeading(90);
  const forward = rotateVec3([0, 0, 0], [0, 0, -1], tracker.getPose().orientation);
  assertClose(forward[0], 1, 1e-6);
  assertClose(forward[2], 0, 1e-6);
});

test("geoTracker.updateHeading(180): Kamera blickt nach +z (Süden)", () => {
  const tracker = createGeoTracker();
  tracker.updateHeading(180);
  const forward = rotateVec3([0, 0, 0], [0, 0, -1], tracker.getPose().orientation);
  assertClose(forward[0], 0, 1e-6);
  assertClose(forward[2], 1, 1e-6);
});

test("geoTracker.updateTilt: Pitch nach oben hebt die Blickrichtung Richtung +y", () => {
  const tracker = createGeoTracker();
  tracker.updateHeading(0);
  tracker.updateTilt(30, 0);
  const forward = rotateVec3([0, 0, 0], [0, 0, -1], tracker.getPose().orientation);
  assertTrue(forward[1] > 0, "forward.y sollte positiv sein (nach oben geneigt)");
});

test("geoTracker.updateTilt: Pitch=0 nach Reset ergibt wieder die reine Heading-Blickrichtung", () => {
  const tracker = createGeoTracker();
  tracker.updateHeading(90);
  tracker.updateTilt(45, 10);
  tracker.updateTilt(0, 0);
  const forward = rotateVec3([0, 0, 0], [0, 0, -1], tracker.getPose().orientation);
  assertClose(forward[0], 1, 1e-6);
  assertClose(forward[1], 0, 1e-6);
  assertClose(forward[2], 0, 1e-6);
});

test("geoTracker: Heading und Tilt sind unabhängig voneinander kombinierbar", () => {
  const withTiltFirst = createGeoTracker();
  withTiltFirst.updateTilt(20, 5);
  withTiltFirst.updateHeading(90);

  const withHeadingFirst = createGeoTracker();
  withHeadingFirst.updateHeading(90);
  withHeadingFirst.updateTilt(20, 5);

  const a = rotateVec3([0, 0, 0], [0, 0, -1], withTiltFirst.getPose().orientation);
  const b = rotateVec3([0, 0, 0], [0, 0, -1], withHeadingFirst.getPose().orientation);
  assertClose(a[0], b[0], 1e-9);
  assertClose(a[1], b[1], 1e-9);
  assertClose(a[2], b[2], 1e-9);
});
