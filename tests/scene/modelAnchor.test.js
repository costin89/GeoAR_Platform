import { test, assertEqual, assertTrue } from "../runner.js";
import { createModelAnchor } from "../../src/scene/modelAnchor.js";

test("createModelAnchor: trägt id/name/scenePosition/model wie übergeben", () => {
  const model = { meshes: [], materials: [] };
  const anchor = createModelAnchor("cube-1", "Würfel", [1, 0, -5], model);
  assertEqual(anchor.id, "cube-1");
  assertEqual(anchor.name, "Würfel");
  assertEqual(anchor.scenePosition[0], 1);
  assertEqual(anchor.scenePosition[2], -5);
  assertTrue(anchor.model === model, "model sollte dieselbe Referenz sein");
});
