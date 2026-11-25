import { expect, test } from "vitest";
import { parseCdpMessage } from "../applications/backgrounds/cdp";

test.each([
  {
    wire: { id: 1, result: { targetId: "target" } },
    parsed: { kind: "result", id: 1, result: { targetId: "target" } },
  },
  {
    wire: { id: 2, error: { message: "no target" } },
    parsed: { kind: "error", id: 2, error: "no target" },
  },
  {
    wire: { id: 3, error: { code: -1 } },
    parsed: { kind: "error", id: 3, error: "Invalid Chrome DevTools error" },
  },
  {
    wire: { id: 4, result: [] },
    parsed: { kind: "error", id: 4, error: "Invalid Chrome DevTools result" },
  },
  { wire: { id: 5 }, parsed: { kind: "error", id: 5, error: "Invalid Chrome DevTools result" } },
  {
    wire: { method: "Page.loadEventFired", sessionId: "page" },
    parsed: { kind: "event", method: "Page.loadEventFired", sessionId: "page" },
  },
  {
    wire: { method: "Target.targetCreated" },
    parsed: { kind: "event", method: "Target.targetCreated", sessionId: undefined },
  },
  { wire: { method: "Page.loadEventFired", sessionId: 12 }, parsed: undefined },
  { wire: null, parsed: undefined },
])("decodes the DevTools message $wire", ({ wire, parsed }) => {
  expect(parseCdpMessage(JSON.stringify(wire))).toEqual(parsed);
});
