import { it as vitestIt, test as vitestTest } from "vitest";

// A test's own limit, stretched as the gate stretches the default one under load (scaffolding's
// docs/gate.md): import test or it from here wherever a test sets its limit.
export const stretch = Number(process.env.SCAFFOLDING_TEST_TIMEOUT_MS || 5000) / 5000;
const scaled = (ms: unknown) => (typeof ms === "number" ? ms * stretch : ms);
const stretched = <T extends typeof vitestTest>(t: T): T =>
  new Proxy(t, {
    apply: (target, self, [name, fn, ms]: unknown[]) => {
      Reflect.apply(target, self, [name, fn, scaled(ms)]);
    },
    get: (target, key, receiver) =>
      key === "each"
        ? (...table: unknown[]) =>
            (name: string, fn: unknown, ms?: unknown) =>
              (target.each as (...t: unknown[]) => (...a: unknown[]) => void)(...table)(
                name,
                fn,
                scaled(ms),
              )
        : Reflect.get(target, key, receiver),
  });

export const test = stretched(vitestTest);
export const it = stretched(vitestIt);
