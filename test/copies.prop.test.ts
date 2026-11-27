import { fc, test, unicodeString } from "@hackersandwizards/scaffolding/property";
import { expect } from "vitest";
import { lfsOid } from "../scan/assets";
import { tightenCopies, unlistedCopies } from "../scan/copies";

const V1 = "version https://git-lfs.github.com/spec/v1";
const objectIdBytes = fc.uint8Array({ minLength: 32, maxLength: 32 });
const extensionNames = fc.array(unicodeString, { maxLength: 2 });
const lineEnding = fc.constantFrom("\n", "\r\n");

/** Builds the object ID and extension lines shared by both pointer versions. */
const lfsPointerEntries = (bytes: Uint8Array, names: string[]) => {
  const oid = Buffer.from(bytes).toString("hex");
  const extensionOid = Buffer.from(bytes.map((byte) => 255 - byte)).toString("hex");
  const extensions = names.map(
    (name, index) => `ext-${index}-${name.replace(/[\r\n]/g, "-")} sha256:${extensionOid}`,
  );
  return { oid, entries: [...extensions, `oid sha256:${oid}`, ""] };
};

test.prop([objectIdBytes, extensionNames, lineEnding], {
  examples: [
    [new Uint8Array(32), ["é", "長".repeat(600)], "\r\n"],
    [new Uint8Array(32), ["𐔊"], "\n"],
    [new Uint8Array(32), ["x".repeat(826)], "\n"],
    [new Uint8Array(32), ["x".repeat(827)], "\n"],
  ],
})(
  "reads the exact object ID from a v1 Git LFS pointer only within the 1024-byte header",
  (bytes, names, newline) => {
    const { oid, entries } = lfsPointerEntries(bytes, names);
    const header = [V1, ...entries].join(newline);
    const headerSize = Buffer.byteLength(header);
    const actual = lfsOid(Buffer.from(`${header}size 7${newline}`));
    expect({ readsObjectId: actual === oid, rejectsPointer: actual === undefined }).toEqual({
      readsObjectId: headerSize <= 1024,
      rejectsPointer: headerSize > 1024,
    });
  },
);

test.prop([objectIdBytes, extensionNames, lineEnding], {
  examples: [[new Uint8Array(32), [], "\n"]],
})("rejects a Git LFS pointer with a version 2 header", (bytes, names, newline) => {
  const { entries } = lfsPointerEntries(bytes, names);
  const header = ["version 2", ...entries].join(newline);
  expect(lfsOid(Buffer.from(`${header}size 7${newline}`))).toBeUndefined();
});

const pathKey = fc.oneof(fc.constantFrom("__proto__", "constructor", "toString"), unicodeString);
test.prop([pathKey], {
  examples: [["__proto__"], ["constructor"], ["toString"], [""], ["資料/" + "é".repeat(1024)]],
})("only own allowlist, finding and committed keys count for a copied path", (file) => {
  const found = Object.fromEntries([[file, "byte copy"]]);
  const allow = Object.fromEntries([[file, "reason"]]);
  expect(unlistedCopies(found, { allow: {}, committed: undefined })).toEqual([
    `${file}: byte copy; import it from the package`,
  ]);
  expect(unlistedCopies({}, { allow, committed: allow })).toEqual([
    `brand-copies.json: ${file} has an unused copy allowance that could hide a new copy. Run bun run brand-copies --tighten to drop the entry.`,
  ]);
  expect(unlistedCopies(found, { allow, committed: {} })).toEqual([
    `brand-copies.json: ${file} adds a copy exception beyond what HEAD and the pin-change rule permit. Use the package file and remove this entry.`,
  ]);
  expect(unlistedCopies(found, { allow, committed: allow })).toEqual([]);
});

test.prop([pathKey, unicodeString, fc.boolean()], {
  examples: [
    ["__proto__", "", true],
    ["constructor", "reason", false],
    ["toString", "é", true],
    ["", "長".repeat(1024), false],
  ],
})(
  "tightens to current own paths, admitting only eligible new paths with an empty reason",
  (file, reason, eligible) => {
    const fresh = file + "/new";
    const stale = file + "/stale";
    const found = Object.fromEntries([
      [file, "byte copy"],
      [fresh, "logo copy"],
    ]);
    const allow = Object.fromEntries([
      [file, reason],
      [stale, reason],
    ]);
    expect(tightenCopies(found, allow, (path) => eligible && path === fresh)).toEqual(
      Object.fromEntries(
        eligible
          ? [
              [file, reason],
              [fresh, ""],
            ]
          : [[file, reason]],
      ),
    );
    expect(Object.entries(tightenCopies({ [file]: "copy" }, {}, () => false))).toEqual([]);
  },
);
