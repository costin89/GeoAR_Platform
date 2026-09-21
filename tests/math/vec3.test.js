import { test, assertClose } from "../runner.js";
import * as vec3 from "../../src/math/vec3.js";

test("vec3.add/subtract sind zueinander invers", () => {
  const a = vec3.set(vec3.create(), 1, 2, 3);
  const b = vec3.set(vec3.create(), 4, -1, 2);
  const sum = vec3.add(vec3.create(), a, b);
  const back = vec3.subtract(vec3.create(), sum, b);
  assertClose(back[0], a[0], 1e-9);
  assertClose(back[1], a[1], 1e-9);
  assertClose(back[2], a[2], 1e-9);
});

test("vec3.dot: orthogonale Einheitsvektoren ergeben 0", () => {
  const x = vec3.set(vec3.create(), 1, 0, 0);
  const y = vec3.set(vec3.create(), 0, 1, 0);
  assertClose(vec3.dot(x, y), 0, 1e-9);
});

test("vec3.cross: x × y = z", () => {
  const x = vec3.set(vec3.create(), 1, 0, 0);
  const y = vec3.set(vec3.create(), 0, 1, 0);
  const out = vec3.cross(vec3.create(), x, y);
  assertClose(out[0], 0, 1e-9);
  assertClose(out[1], 0, 1e-9);
  assertClose(out[2], 1, 1e-9);
});

test("vec3.length/normalize", () => {
  const a = vec3.set(vec3.create(), 3, 4, 0);
  assertClose(vec3.length(a), 5, 1e-9);
  const n = vec3.normalize(vec3.create(), a);
  assertClose(vec3.length(n), 1, 1e-9);
});

test("vec3.distance zwischen einem Punkt und sich selbst ist 0", () => {
  const a = vec3.set(vec3.create(), 5, -3, 2);
  assertClose(vec3.distance(a, a), 0, 1e-9);
});

test("vec3.lerp(a, b, 0) = a, lerp(a, b, 1) = b", () => {
  const a = vec3.set(vec3.create(), 0, 0, 0);
  const b = vec3.set(vec3.create(), 10, 20, 30);
  const at0 = vec3.lerp(vec3.create(), a, b, 0);
  const at1 = vec3.lerp(vec3.create(), a, b, 1);
  assertClose(at0[0], 0, 1e-9);
  assertClose(at1[0], 10, 1e-9);
  assertClose(at1[2], 30, 1e-9);
});
