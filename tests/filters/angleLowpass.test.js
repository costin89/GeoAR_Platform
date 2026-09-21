import { test, assertClose } from "../runner.js";
import { createAngleLowpassFilter } from "../../src/filters/angleLowpass.js";

test("angleLowpass: erster update() übernimmt den Wert direkt", () => {
  const filter = createAngleLowpassFilter(0.1);
  assertClose(filter.update(350), 350, 1e-9);
});

test("angleLowpass: mittelt über die 0°/360°-Grenze hinweg, nicht über 180°", () => {
  const filter = createAngleLowpassFilter(0.5);
  filter.update(359);
  // Kürzester Weg von 359° zu 1° ist +2° (über 0°), nicht -358°.
  const next = filter.update(1);
  assertClose(next, 0, 1e-6); // 359 + 0.5*2 = 360 ≡ 0
});

test("angleLowpass: naive lineare Mittelung würde 180° liefern - unser Filter nicht", () => {
  const filter = createAngleLowpassFilter(0.5);
  filter.update(350);
  const next = filter.update(10);
  // Kürzester Weg 350->10 ist +20 (über 0°): 350 + 0.5*20 = 360 ≡ 0.
  assertClose(next, 0, 1e-6);
});

test("angleLowpass: reset() setzt den Filter zurück", () => {
  const filter = createAngleLowpassFilter(0.5);
  filter.update(90);
  filter.reset();
  assertClose(filter.update(45), 45, 1e-9);
});
