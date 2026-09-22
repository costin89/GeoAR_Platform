import { test, assertClose } from "../../runner.js";
import { perspective } from "../../../src/math/projection/perspective.js";
import { degToRad } from "../../../src/math/angle.js";

test("perspective: m[11] = -1 (rechtshändige Perspektiv-Konvention)", () => {
  const m = perspective(new Float32Array(16), degToRad(60), 1, 0.1, 100);
  assertClose(m[11], -1, 1e-9);
});

test("perspective: NDC-Tiefe an Near-Ebene = -1, an Far-Ebene = 1", () => {
  const near = 1;
  const far = 10;
  const m = perspective(new Float32Array(16), degToRad(60), 1, near, far);

  const clipZAtNear = m[10] * -near + m[14];
  const clipWAtNear = -(-near);
  assertClose(clipZAtNear / clipWAtNear, -1, 1e-6);

  const clipZAtFar = m[10] * -far + m[14];
  const clipWAtFar = -(-far);
  assertClose(clipZAtFar / clipWAtFar, 1, 1e-6);
});
