import { rejection } from "@hackersandwizards/scaffolding/rejection";
import { afterEach, describe, expect, test, vi } from "vitest";
import { connectCdp, parseCdpMessage } from "../applications/backgrounds/cdp";

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

class FakeSocket extends EventTarget {
  sent: string[] = [];

  send(message: string) {
    this.sent.push(message);
  }

  close() {
    this.dispatchEvent(new Event("close"));
  }

  // Deliver a wire message as the browser socket would.
  deliver(message: object) {
    this.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(message) }));
  }
}

// Keep connection opening under the test's control.
function socketFixture() {
  const socket = new FakeSocket();
  vi.stubGlobal("WebSocket", function () {
    return socket;
  });
  return { socket, connected: connectCdp("ws://127.0.0.1:9222/devtools/browser/fixture") };
}

describe("DevTools socket", () => {
  afterEach(() => vi.unstubAllGlobals());

  test("waits for the open event before returning a connection", async () => {
    const { socket, connected } = socketFixture();
    const opened = vi.fn();
    void connected.then(opened);
    await Promise.resolve();
    expect(opened).not.toHaveBeenCalled();
    socket.dispatchEvent(new Event("open"));
    await connected;
    expect(opened).toHaveBeenCalledOnce();
  });

  test("reports a socket error during connection", async () => {
    const { socket, connected } = socketFixture();
    socket.dispatchEvent(new Event("error"));
    expect(await rejection(connected)).toContain("Chrome's DevTools socket failed");
  });

  test("matches out-of-order replies to their command IDs", async () => {
    const { socket, connected } = socketFixture();
    socket.dispatchEvent(new Event("open"));
    const cdp = await connected;
    const first = cdp.send("Target.createTarget", { url: "about:blank" });
    const second = cdp.send("Page.enable", {}, "page-a");
    socket.deliver({ id: 9, result: {} });
    socket.deliver({ id: 2, result: { enabled: true } });
    socket.deliver({ id: 1, result: { targetId: "target-a" } });
    expect(socket.sent.map((wire) => JSON.parse(wire))).toEqual([
      { id: 1, method: "Target.createTarget", params: { url: "about:blank" } },
      { id: 2, method: "Page.enable", params: {}, sessionId: "page-a" },
    ]);
    expect(cdp.lastRequestId).toBe(2);
    expect(await Promise.all([first, second])).toEqual([
      { targetId: "target-a" },
      { enabled: true },
    ]);
  });

  test("rejects the matching command on a protocol error", async () => {
    const { socket, connected } = socketFixture();
    socket.dispatchEvent(new Event("open"));
    const cdp = await connected;
    const request = cdp.send("Page.enable", {}, "page-a");
    socket.deliver({ id: 1, error: { message: "invalid session" } });
    expect(await rejection(request)).toContain("invalid session");
  });

  test("delivers an event only to the requested page session", async () => {
    const { socket, connected } = socketFixture();
    socket.dispatchEvent(new Event("open"));
    const cdp = await connected;
    const observed = vi.fn();
    const ready = cdp.once("Page.loadEventFired", "page-a").then(observed);
    socket.deliver({ method: "Page.loadEventFired", sessionId: "page-b" });
    socket.deliver({ method: "Page.frameStoppedLoading", sessionId: "page-a" });
    await Promise.resolve();
    expect(observed).not.toHaveBeenCalled();
    socket.deliver({ method: "Page.loadEventFired", sessionId: "page-a" });
    await ready;
    expect(observed).toHaveBeenCalledOnce();
  });

  test("rejects outstanding commands when the socket closes", async () => {
    const { socket, connected } = socketFixture();
    socket.dispatchEvent(new Event("open"));
    const cdp = await connected;
    const command = cdp.send("Page.captureScreenshot", {}, "page-a");
    cdp.close();
    expect(await rejection(command)).toContain("Chrome's DevTools socket closed");
  });
});
