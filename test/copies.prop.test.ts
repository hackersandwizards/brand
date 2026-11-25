import { fc, test, unicodeString } from "@hackersandwizards/scaffolding/property";
import { expect } from "vitest";
import { lfsOid } from "../scan/assets";
import { tightenCopies, unlistedCopies } from "../scan/copies";

const V1 = "version https://git-lfs.github.com/spec/v1";
test.prop(
  [
    fc.uint8Array({ minLength: 32, maxLength: 32 }),
    fc.array(unicodeString, { maxLength: 2 }),
    fc.record({
      newline: fc.constantFrom("\n", "\r\n"),
      version: fc.constantFrom("version 2", V1),
    }),
  ],
  {
    examples: [
      [new Uint8Array(32), ["é", "長".repeat(600)], { newline: "\r\n", version: V1 }],
      [new Uint8Array(32), ["𐔊"], { newline: "\n", version: V1 }],
      [new Uint8Array(32), ["x".repeat(826)], { newline: "\n", version: V1 }],
      [new Uint8Array(32), ["x".repeat(827)], { newline: "\n", version: V1 }],
      [new Uint8Array(32), [], { newline: "\n", version: "version 2" }],
    ],
  },
)(
  "reads the object ID from a v1 Git LFS pointer after optional extension lines",
  (bytes, names, { newline, version }) => {
    const oid = Buffer.from(bytes).toString("hex");
    const extensionOid = Buffer.from(bytes.map((byte) => 255 - byte)).toString("hex");
    const extensions = names.map(
      (name, index) => `ext-${index}-${name.replace(/[\r\n]/g, "-")} sha256:${extensionOid}`,
    );
    const pointer = [version, ...extensions, `oid sha256:${oid}`, "size 7", ""].join(newline);
    const headerSize = Buffer.byteLength(pointer) - Buffer.byteLength("size 7" + newline);
    expect(lfsOid(Buffer.from(pointer))).toBe(
      version === V1 && headerSize <= 1024 ? oid : undefined,
    );
  },
);

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
    `brand-copies.json: ${file} is no copy; drop its entry (brand-copies --tighten)`,
  ]);
  expect(unlistedCopies(found, { allow, committed: {} })).toEqual([
    `brand-copies.json: ${file} added against HEAD; the list may only shrink, or during a pin change name a file committed as is`,
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
