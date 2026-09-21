import { test, assertClose } from "../runner.js";
import * as quat from "../../src/math/quat.js";
import * as vec3 from "../../src/math/vec3.js";

test("quat.create ist die Identität", () => {
  const q = quat.create();
  assertClose(q[0], 0, 1e-9);
  assertClose(q[1], 0, 1e-9);
  assertClose(q[2], 0, 1e-9);
  assertClose(q[3], 1, 1e-9);
});

test("quat.fromAxisAngle: 90° um Y rotiert (0,0,1) nach (1,0,0)", () => {
  const q = quat.fromAxisAngle(quat.create(), [0, 1, 0], Math.PI / 2);
  const v = vec3.set(vec3.create(), 0, 0, 1);
  const out = quat.rotateVec3(vec3.create(), v, q);
  assertClose(out[0], 1, 1e-6);
  assertClose(out[1], 0, 1e-6);
  assertClose(out[2], 0, 1e-6);
});

test("quat.multiply mit Identität verändert nichts", () => {
  const id = quat.create();
  const q = quat.fromAxisAngle(quat.create(), [1, 0, 0], 0.7);
  const out = quat.multiply(quat.create(), q, id);
  assertClose(out[0], q[0], 1e-9);
  assertClose(out[3], q[3], 1e-9);
});

test("quat.conjugate/invert eines Einheits-Quaternions sind gleich", () => {
  const q = quat.normalize(quat.create(), quat.fromAxisAngle(quat.create(), [0, 0, 1], 1.1));
  const conj = quat.conjugate(quat.create(), q);
  const inv = quat.invert(quat.create(), q);
  assertClose(conj[0], inv[0], 1e-6);
  assertClose(conj[3], inv[3], 1e-6);
});

test("quat.slerp(a, b, 0) = a, slerp(a, b, 1) = b", () => {
  const a = quat.create();
  const b = quat.fromAxisAngle(quat.create(), [0, 1, 0], Math.PI / 2);
  const at0 = quat.slerp(quat.create(), a, b, 0);
  const at1 = quat.slerp(quat.create(), a, b, 1);
  assertClose(at0[3], a[3], 1e-6);
  assertClose(at1[1], b[1], 1e-6);
  assertClose(at1[3], b[3], 1e-6);
});

test("quat.fromEulerYXZ: reiner Pitch (X) rotiert Vorwärts (0,0,-1) Richtung +y", () => {
  const q = quat.fromEulerYXZ(quat.create(), 0, Math.PI / 2, 0);
  const forward = quat.rotateVec3(vec3.create(), [0, 0, -1], q);
  assertClose(forward[0], 0, 1e-6);
  assertClose(forward[1], 1, 1e-6);
  assertClose(forward[2], 0, 1e-6);
});

test("quat.fromEulerYXZ: reiner Roll (Z) rotiert Oben (0,1,0) Richtung -x", () => {
  const q = quat.fromEulerYXZ(quat.create(), 0, 0, Math.PI / 2);
  const up = quat.rotateVec3(vec3.create(), [0, 1, 0], q);
  assertClose(up[0], -1, 1e-6);
  assertClose(up[1], 0, 1e-6);
  assertClose(up[2], 0, 1e-6);
});

test("quat.fromEulerYXZ: reiner Yaw (Y) verhält sich wie fromAxisAngle um Y", () => {
  const a = quat.fromEulerYXZ(quat.create(), Math.PI / 2, 0, 0);
  const b = quat.fromAxisAngle(quat.create(), [0, 1, 0], Math.PI / 2);
  assertClose(a[0], b[0], 1e-9);
  assertClose(a[1], b[1], 1e-9);
  assertClose(a[2], b[2], 1e-9);
  assertClose(a[3], b[3], 1e-9);
});
