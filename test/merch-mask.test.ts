import { expect, test } from "vitest";
import { dilate, erode, trace } from "../applications/merch/mask";

test("grows a marked pixel to its four one-pixel neighbours", () => {
  const data = Uint8Array.from([0, 0, 0, 0, 1, 0, 0, 0, 0]);
  expect(dilate({ data, width: 3, height: 3 }, 1)).toEqual({
    width: 3,
    height: 3,
    data: Uint8Array.from([0, 1, 0, 1, 1, 1, 0, 1, 0]),
  });
});

test("shrinks a cross back to its single surrounded pixel", () => {
  const data = Uint8Array.from([0, 1, 0, 1, 1, 1, 0, 1, 0]);
  expect(erode({ data, width: 3, height: 3 }, 1)).toEqual({
    width: 3,
    height: 3,
    data: Uint8Array.from([0, 0, 0, 0, 1, 0, 0, 0, 0]),
  });
});

test("follows the outer pixel corners of a rectangular cut", () => {
  const width = 5;
  const height = 5;
  const data = Uint8Array.from("0000001110011100111000000", Number);
  expect(trace({ data, width, height })).toEqual([
    [1, 1],
    [4, 1],
    [4, 4],
    [1, 4],
    [1, 2],
  ]);
});
