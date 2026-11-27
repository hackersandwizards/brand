import { describe, expect, it } from "vitest";
import { specFaults, terminalLineFaults } from "../applications/linkedin-visuals/terminal";

describe("LinkedIn terminal specs", () => {
  const spec = { title: "gh pr list", note: "note", lines: ["a", "b", "c", "d"], highlight: 1 };

  it.each([
    {
      name: "36 visible characters with tags",
      lines: [`<t>${"a".repeat(36)}</t>`, "b", "c", "d"],
      faults: [],
    },
    { name: "six lines", lines: ["a", "b", "c", "d", "e", "f"], faults: [] },
    {
      name: "three lines",
      lines: ["a", "b", "c"],
      faults: ["lines is no list of four to six texts"],
    },
    {
      name: "seven lines",
      lines: ["a", "b", "c", "d", "e", "f", "g"],
      faults: ["lines is no list of four to six texts"],
    },
    {
      name: "a number among lines",
      lines: [1, "b", "c", "d"],
      faults: ["lines is no list of four to six texts"],
    },
    {
      name: "text in place of a list",
      lines: "abcd",
      faults: ["lines is no list of four to six texts"],
    },
    {
      name: "two lines longer than 36 characters",
      lines: ["a".repeat(37), "b", `<c>${"c".repeat(37)}</c>`, "d"],
      faults: ["line 0 is over 36 characters", "line 2 is over 36 characters"],
    },
  ])("reports the line faults for $name", ({ lines, faults }) => {
    expect(terminalLineFaults(lines)).toEqual(faults);
  });

  it.each([-1, 4, 1.5])("rejects the highlight index %s", (highlight) => {
    expect(specFaults({ ...spec, highlight })).toEqual(["highlight is no index of a line"]);
  });

  it.each([
    { highlight: 1, faults: ["lines is no list of four to six texts"] },
    {
      highlight: 4,
      faults: ["lines is no list of four to six texts", "highlight is no index of a line"],
    },
  ])("checks highlight $highlight against a malformed list's length", ({ highlight, faults }) => {
    const input = JSON.parse('{"title":"T","note":"N","lines":"abcd"}') as typeof spec;
    expect(specFaults({ ...input, highlight })).toEqual(faults);
  });

  it("lists every missing field in display order", () => {
    expect(specFaults({})).toEqual([
      "title is no text",
      "note is no text",
      "lines is no list of four to six texts",
      "highlight is no index of a line",
    ]);
  });
});
