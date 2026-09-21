import { test, assertClose, assertEqual } from "../runner.js";
import { createLowpassFilter } from "../../src/filters/lowpass.js";

test("lowpass: value() ist null vor dem ersten update()", () => {
  const filter = createLowpassFilter(0.5);
  assertEqual(filter.value(), null);
});

test("lowpass: erster update() übernimmt den Wert direkt (kein Sprung von 0)", () => {
  const filter = createLowpassFilter(0.1);
  assertClose(filter.update(100), 100, 1e-9);
});

test("lowpass: alpha=1 folgt dem Eingang sofort", () => {
  const filter = createLowpassFilter(1);
  filter.update(10);
  assertClose(filter.update(20), 20, 1e-9);
});

test("lowpass: kleines alpha glättet stark (bleibt nah am alten Wert)", () => {
  const filter = createLowpassFilter(0.1);
  filter.update(0);
  const next = filter.update(100);
  assertClose(next, 10, 1e-9); // 0 + 0.1*(100-0) = 10
});

test("lowpass: reset() setzt den Filter zurück", () => {
  const filter = createLowpassFilter(0.5);
  filter.update(50);
  filter.reset();
  assertEqual(filter.value(), null);
  assertClose(filter.update(7), 7, 1e-9);
});
