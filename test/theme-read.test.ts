import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, test } from "vitest";

const script = readFileSync(new URL("../tokens/theme-read.js", import.meta.url), "utf8");

function readTheme(stored: string | null | Error, systemDark: boolean) {
  const attributes = new Map<string, string>();
  runInNewContext(script, {
    DOMException,
    localStorage: {
      getItem(key: string) {
        expect(key).toBe("theme");
        if (stored instanceof Error) throw stored;
        return stored;
      },
    },
    matchMedia(query: string) {
      expect(query).toBe("(prefers-color-scheme: dark)");
      return { matches: systemDark };
    },
    document: {
      documentElement: { setAttribute: attributes.set.bind(attributes) },
    },
  });
  return attributes.get("data-theme");
}

test.each([
  { stored: "dark", systemDark: false, expected: "dark" },
  { stored: "light", systemDark: true, expected: "light" },
  { stored: null, systemDark: true, expected: "dark" },
  { stored: null, systemDark: false, expected: "light" },
  { stored: "unknown", systemDark: true, expected: "dark" },
])("sets $expected with stored $stored and system dark=$systemDark", (fixture) => {
  expect(readTheme(fixture.stored, fixture.systemDark)).toBe(fixture.expected);
});

test("uses the system theme when storage throws a SecurityError", () => {
  expect(readTheme(new DOMException("Storage blocked", "SecurityError"), false)).toBe("light");
});

test("rethrows other storage errors", () => {
  const error = new Error("Storage read failed");
  expect(() => readTheme(error, true)).toThrow(error);
});
