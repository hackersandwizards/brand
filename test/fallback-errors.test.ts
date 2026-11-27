import { rejection } from "@hackersandwizards/scaffolding/rejection";
import type { IncomingMessage, ServerResponse } from "node:http";
import { runInNewContext } from "node:vm";
import { ConnectionClosedError, type CDPSession, type Page, type Protocol } from "puppeteer-core";
import { afterEach, assert, expect, test, vi } from "vitest";
import { serveFile } from "../catalog/files";
import { searchScript } from "../catalog/portal/search";
import { copyButton } from "../elements/copy";
import { FilterSource, sourceAddress } from "../elements/list-filter-source";
import { attachCsp, refusals } from "../scan/browser-csp";
import { copyOf } from "../scan/copies";
import { scanRetiredPaths } from "../scan/retired";
import { siteFile, pathOf } from "../scan/site";
import { waitForTitles } from "./wait-for-titles";

const failure = new TypeError("dependency failed");
const denied = Object.assign(new Error("permission denied"), { code: "EACCES" });

const filesystem = vi.hoisted(() => ({ stat: vi.fn() }));
vi.mock("node:fs", async (importOriginal) => {
  const fs = await importOriginal<typeof import("node:fs")>();
  return {
    ...fs,
    statSync: (...args: Parameters<typeof fs.statSync>) => {
      filesystem.stat(...args);
      return fs.statSync(...args);
    },
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  filesystem.stat.mockReset();
});

test("asset middleware propagates a decoder failure", () => {
  vi.spyOn(globalThis, "decodeURIComponent").mockImplementationOnce(() => {
    throw failure;
  });
  expect(() =>
    serveFile({ url: "/untouched" } as IncomingMessage, {} as ServerResponse, vi.fn()),
  ).toThrow(failure);
});

test("a glob path propagates a decoder failure", () => {
  vi.spyOn(globalThis, "decodeURIComponent").mockImplementationOnce(() => {
    throw failure;
  });
  expect(() => pathOf("/untouched")).toThrow(failure);
});

test("a static request propagates a decoder failure", () => {
  vi.spyOn(globalThis, "decodeURIComponent").mockImplementationOnce(() => {
    throw failure;
  });
  expect(() => siteFile("/root", "/untouched")).toThrow(failure);
});

test("a static request propagates a stat permission failure", () => {
  filesystem.stat.mockImplementationOnce(() => {
    throw denied;
  });
  expect(() => siteFile("/root", "/untouched")).toThrow(denied);
});

function denyDescendant(file: string) {
  if (file.endsWith("/verbal.json")) throw denied;
}

test("a retired-line scan propagates a stat permission failure for a descendant", () => {
  filesystem.stat.mockImplementation(denyDescendant);
  expect(() => scanRetiredPaths([`${import.meta.dirname}/../verbal`])).toThrow(denied);
});

const fromBuffer = Buffer.from;
function rejectFixtureBase64(...args: Parameters<typeof Buffer.from>) {
  if (args[0] === "YXNzZXQ=") throw failure;
  return Reflect.apply(fromBuffer, Buffer, args);
}

test("a logo scan propagates a base64 decoder failure", () => {
  vi.spyOn(Buffer, "from").mockImplementation(rejectFixtureBase64);
  expect(() =>
    copyOf(
      "sample.svg",
      () => '<image href="data:image/svg+xml;base64,YXNzZXQ="/>',
      () => undefined,
    ),
  ).toThrow(failure);
});

test("source URL resolution propagates a constructor failure", () => {
  vi.stubGlobal(
    "URL",
    class extends URL {
      constructor(url: string | URL, base?: string | URL) {
        super(url, base);
        throw failure;
      }
    },
  );
  expect(() => sourceAddress("./row", "https://example.test/")).toThrow(failure);
});

test("legacy source URL resolution propagates an unexpected error", () => {
  const unexpected = new Error("URL implementation failed");
  class LegacyUrl extends URL {
    constructor(url: string | URL, base?: string | URL) {
      super(url, base);
      throw unexpected;
    }
  }
  Object.defineProperty(LegacyUrl, "canParse", { value: undefined });
  vi.stubGlobal("URL", LegacyUrl);
  expect(() => sourceAddress("./row", "https://example.test/")).toThrow(unexpected);
});

test("loading source rows propagates an installation failure", async () => {
  vi.stubGlobal("fetch", () => Promise.resolve(new Response("")));
  vi.stubGlobal(
    "DOMParser",
    class {
      parseFromString() {
        return { querySelector: () => ({ childNodes: [] }) };
      }
    },
  );
  const source = new FilterSource("https://example.test/");
  const load = source.load(
    () => {
      throw failure;
    },
    vi.fn(),
    vi.fn(),
  );
  expect(await rejection(Promise.resolve(load))).toBe(String(failure));
});

test("reading CSP refusals propagates a frame evaluation failure", async () => {
  const frame = { evaluate: () => Promise.reject(failure) };
  const page = { evaluate: () => Promise.resolve(), frames: () => [frame] };
  expect(await rejection(refusals(page as unknown as Page, "https://example.test/"))).toBe(
    String(failure),
  );
});

async function pausedResponse(send: CDPSession["send"]) {
  const callbacks: ((event: Protocol.Fetch.RequestPausedEvent) => unknown)[] = [];
  const cdp = {
    on: (_event: string, callback: (event: Protocol.Fetch.RequestPausedEvent) => unknown) =>
      callbacks.push(callback),
    send,
  };
  const page = { createCDPSession: () => Promise.resolve(cdp as unknown as CDPSession) };
  await attachCsp(page as unknown as Page, "https://example.test", "default-src 'none'");
  const [answer] = callbacks;
  if (!answer) throw new Error("Fetch.requestPaused callback missing");
  const event = {
    requestId: "request",
    request: { url: "https://example.test/" },
  } as Protocol.Fetch.RequestPausedEvent;
  const result = Promise.withResolvers<void>();
  vi.stubGlobal("reportError", result.reject);
  answer(event);
  setImmediate(result.resolve);
  return result.promise;
}

const closed = new ConnectionClosedError("Target closed");
const rejectionByMethod = (failures: Record<string, Error>) =>
  vi.fn((method: string) => {
    const error = failures[method];
    return error === undefined ? Promise.resolve() : Promise.reject(error);
  });

test("answering a paused CSP request propagates a response body failure", async () => {
  const send = rejectionByMethod({ "Fetch.getResponseBody": failure });
  expect(await rejection(pausedResponse(send as CDPSession["send"]))).toBe(String(failure));
});

test("answering a paused CSP request propagates an unexpected cleanup failure", async () => {
  const send = rejectionByMethod({
    "Fetch.getResponseBody": closed,
    "Fetch.failRequest": failure,
  });
  expect(await rejection(pausedResponse(send as CDPSession["send"]))).toBe(String(failure));
});

test("waiting for catalog titles propagates an unexpected browser failure", async () => {
  expect(await rejection(waitForTitles(Promise.reject(failure)))).toBe(String(failure));
});

test("the portal hash handler propagates a decoder failure", () => {
  const source = searchScript([]).replace(/^<script>|<\/script>$/g, "");
  const input = { value: "", addEventListener: vi.fn() };
  const catalog = {
    dataset: {},
    querySelector: () => input,
    querySelectorAll: () => [],
    addEventListener: vi.fn(),
  };
  const document = {
    querySelector: () => catalog,
    querySelectorAll: () => [],
    getElementById: vi.fn(),
    addEventListener: vi.fn(),
  };
  const decode = () => {
    throw failure;
  };
  expect(() => {
    runInNewContext(source, {
      document,
      location: { hash: "#untouched" },
      addEventListener: vi.fn(),
      decodeURIComponent: decode,
      CSS: { escape: String },
      scrollTo: vi.fn(),
    });
  }).toThrow(failure);
});

test("the copy button reports an unexpected Clipboard API failure", async () => {
  const outcome = Promise.withResolvers<string>();
  const body = { append: vi.fn() };
  const status = { isConnected: true, parentElement: body, append: vi.fn() };
  const textarea = { style: {}, select: vi.fn(), setSelectionRange: vi.fn(), remove: vi.fn() };
  const document = {
    body,
    querySelector: vi.fn().mockReturnValueOnce(status).mockReturnValue(null),
    createElement: () => textarea,
    addEventListener: vi.fn(),
    execCommand: () => false,
    documentElement: { lang: "en" },
    activeElement: null,
  };
  vi.stubGlobal("document", document);
  vi.stubGlobal("navigator", { clipboard: { writeText: () => Promise.reject(failure) } });
  vi.stubGlobal("reportError", (error: unknown) => outcome.resolve(String(error)));
  const listeners: (() => void)[] = [];
  const button = {
    childNodes: [],
    dataset: { hwCopy: "" },
    addEventListener: (_event: string, listener: () => void) => listeners.push(listener),
    dispatchEvent: (event: Event) => outcome.resolve(event.type),
  };
  copyButton(button as unknown as HTMLElement);
  const [click] = listeners;
  assert(click, "Copy click handler missing");
  click();
  expect(await outcome.promise).toBe(String(failure));
});
