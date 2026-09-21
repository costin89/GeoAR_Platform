import { test, assertClose, assertTrue } from "../runner.js";
import * as mat4 from "../../src/math/mat4.js";
import * as quat from "../../src/math/quat.js";

function isIdentity(m, epsilon) {
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      const expected = col === row ? 1 : 0;
      if (Math.abs(m[col * 4 + row] - expected) > epsilon) return false;
    }
  }
  return true;
}

test("mat4.multiply mit Identität verändert nichts", () => {
  const id = mat4.create();
  const m = mat4.fromTranslation(mat4.create(), [1, 2, 3]);
  const out = mat4.multiply(mat4.create(), m, id);
  for (let i = 0; i < 16; i++) assertClose(out[i], m[i], 1e-9);
});

test("mat4: M × invert(M) = Identität (Translation)", () => {
  const m = mat4.fromTranslation(mat4.create(), [5, -2, 3]);
  const inv = mat4.invert(mat4.create(), m);
  const product = mat4.multiply(mat4.create(), m, inv);
  assertTrue(isIdentity(product, 1e-6), "Produkt ist nicht die Identität");
});

test("mat4: M × invert(M) = Identität (Rotation+Translation)", () => {
  const q = quat.fromAxisAngle(quat.create(), [0, 1, 0], 0.9);
  const m = mat4.fromRotationTranslation(mat4.create(), q, [1, 2, -4]);
  const inv = mat4.invert(mat4.create(), m);
  const product = mat4.multiply(mat4.create(), m, inv);
  assertTrue(isIdentity(product, 1e-5), "Produkt ist nicht die Identität");
});

test("mat4.transpose ist selbstinvers", () => {
  const m = mat4.fromRotationTranslation(
    mat4.create(),
    quat.fromAxisAngle(quat.create(), [1, 0, 0], 0.4),
    [1, 1, 1]
  );
  const t = mat4.transpose(mat4.create(), m);
  const back = mat4.transpose(mat4.create(), t);
  for (let i = 0; i < 16; i++) assertClose(back[i], m[i], 1e-9);
});

test("mat4.lookAt: Kamera bei (0,0,5) auf Ursprung -> Ursprung liegt bei z=-5 im Kamera-Raum", () => {
  const view = mat4.lookAt(mat4.create(), [0, 0, 5], [0, 0, 0], [0, 1, 0]);
  const origin = [0, 0, 0];
  const x = view[0] * origin[0] + view[4] * origin[1] + view[8] * origin[2] + view[12];
  const y = view[1] * origin[0] + view[5] * origin[1] + view[9] * origin[2] + view[13];
  const z = view[2] * origin[0] + view[6] * origin[1] + view[10] * origin[2] + view[14];
  assertClose(x, 0, 1e-6);
  assertClose(y, 0, 1e-6);
  assertClose(z, -5, 1e-6);
});
