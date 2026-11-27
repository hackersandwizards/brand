import {
  ConnectionClosedError,
  ProtocolError,
  type CDPSession,
  type Frame,
  type Page,
  type Protocol,
} from "puppeteer-core";
import { isRecord } from "./help";
import { pathOf } from "./site";

/** The "csp" of brand-elements.json: one policy for every page, or a policy per glob over a page's
 *  decoded path. */
export type Csp = string | Record<string, string>;

function readCsp(csp: unknown): Csp {
  const valid = (p: unknown): p is string =>
    typeof p === "string" && !!p.trim() && !/[\r\n]/.test(p);
  if (valid(csp)) return csp;
  const entries = isRecord(csp) ? Object.entries(csp) : [];
  if (!entries.length || !entries.every((entry): entry is [string, string] => valid(entry[1])))
    throw new Error(
      `brand-elements.json "csp": one line of policy or { "<glob>": "<policy>" }, not ${JSON.stringify(csp)}`,
    );
  return Object.fromEntries(entries);
}

/** The first listed glob matching a document's path decides its policy. */
export function policies(csp: unknown) {
  const parsed = readCsp(csp);
  if (typeof parsed === "string") return () => parsed;
  const globs = Object.entries(parsed).map(([glob, p]) => [new Bun.Glob(glob), p] as const);
  return (url: string) => globs.find(([glob]) => glob.match(pathOf(url)))?.[1];
}

/** Installs the host's policy header and records same-origin documents with no matching policy. */
export async function attachCsp(page: Page, origin: string, csp: Csp) {
  const policy = policies(csp);
  const unmatched: string[] = [];
  const cdp = await page.createCDPSession();
  const policyFor = (url: string) => {
    const value = policy(url);
    if (!value && new URL(url).origin === origin) unmatched.push(pathOf(url));
    return value;
  };
  // Fetch.continueResponse drops added headers on http; fulfilling with the body keeps them.
  cdp.on("Fetch.requestPaused", (e) => {
    void answerPaused(cdp, e, policyFor).catch(reportError);
  });
  await cdp.send("Fetch.enable", {
    patterns: [{ resourceType: "Document", requestStage: "Response" }],
  });
  return unmatched;
}

/** The target closed or the browser discarded the interception during navigation. */
function requestEnded(error: unknown) {
  return (
    error instanceof ProtocolError &&
    (error instanceof ConnectionClosedError ||
      error.name === "TargetCloseError" ||
      /^Invalid InterceptionId\.?$/.test(error.originalMessage))
  );
}

async function failPaused(cdp: CDPSession, requestId: string) {
  if (cdp.detached) return;
  try {
    await cdp.send("Fetch.failRequest", { requestId, errorReason: "Failed" });
  } catch (error) {
    if (!requestEnded(error)) throw error;
  }
}

async function releasePaused(cdp: CDPSession, requestId: string, error: unknown) {
  try {
    await failPaused(cdp, requestId);
  } catch (cleanupError) {
    if (requestEnded(error)) throw cleanupError;
    throw new AggregateError(
      [error, cleanupError],
      "Could not answer or release a paused CSP request",
      { cause: cleanupError },
    );
  }
  if (!requestEnded(error)) throw error;
}

/** Continues an untouched document response or fulfills it with the host's policy and body. */
async function answerPaused(
  cdp: CDPSession,
  e: Protocol.Fetch.RequestPausedEvent,
  policyFor: (url: string) => string | undefined,
) {
  const status = e.responseStatusCode ?? 200;
  try {
    if (e.responseErrorReason || (status >= 300 && status < 400))
      return await cdp.send("Fetch.continueRequest", { requestId: e.requestId });
    const value = policyFor(e.request.url);
    if (!value) return await cdp.send("Fetch.continueRequest", { requestId: e.requestId });
    const { body, base64Encoded } = await cdp.send("Fetch.getResponseBody", {
      requestId: e.requestId,
    });
    await cdp.send("Fetch.fulfillRequest", {
      requestId: e.requestId,
      responseCode: status,
      // The body arrives decoded, so its former encoding and length no longer hold.
      responseHeaders: [
        ...(e.responseHeaders ?? []).filter((h) => !/^content-(encoding|length)$/i.test(h.name)),
        { name: "Content-Security-Policy", value },
      ],
      body: base64Encoded ? body : Buffer.from(body).toString("base64"),
    });
  } catch (error) {
    // Failed loudly: a document left paused would time out without its cause. Where the page
    // closed meanwhile, this fails too.
    await releasePaused(cdp, e.requestId, error);
  }
}

export type Refusal = { page: string; element: string; source: string; directive: string };

type Recorded = { uri: string; directive: string; target: EventTarget | null };

/** Runs before the page's own scripts: keeps every refusal of the page's policies. */
export function recordRefusals() {
  const list: Recorded[] = [];
  Object.defineProperty(window, "__hwRefused", { value: list });
  document.addEventListener(
    "securitypolicyviolation",
    (e) => list.push({ uri: e.blockedURI, directive: e.effectiveDirective, target: e.target }),
    true,
  );
}

/** Each refusal `open` recorded, with the element it hit: the event's target where it is one,
 *  else, for a stylesheet's image, which the browser reports on the document, every element or
 *  pseudo-element whose computed style draws a url() from the refused source. */
function readRefusals() {
  const recorded = (window as unknown as { __hwRefused?: Recorded[] }).__hwRefused ?? [];
  // Deduplicate document-level refusals by URI and directive before searching computed styles.
  const list = [
    ...new Map(
      recorded.map((r) => [r.target instanceof Element ? r : `${r.uri} ${r.directive}`, r]),
    ).values(),
  ];
  if (!list.length) return [];
  const name = (el: Element, pseudo = "") => {
    const cls = [...el.classList].find((c) => c.startsWith("hw-")) ?? el.classList[0];
    return `${el.tagName.toLowerCase()}${cls ? "." + cls : ""}${pseudo}`;
  };
  const PROPS = [
    "background-image",
    "mask-image",
    "list-style-image",
    "border-image-source",
    "content",
    "cursor",
  ];
  const PSEUDOS = ["", "::before", "::after", "::marker"];
  const all = [...document.querySelectorAll("body *")];
  return list.flatMap(({ uri, directive, target }) => {
    if (target instanceof Element) return [{ element: name(target), source: uri, directive }];
    const want = `url("${/^[a-z-]+$/.test(uri) ? uri + ":" : uri}`;
    const hits = all.flatMap((el) =>
      PSEUDOS.filter((p) => {
        const g = getComputedStyle(el, p || null);
        return PROPS.some((k) => g.getPropertyValue(k).includes(want));
      }).map((p) => name(el, p)),
    );
    return (hits.length ? hits : ["the page"]).map((element) => ({
      element,
      source: uri,
      directive,
    }));
  });
}

export const refusalLine = (r: Refusal) =>
  `${r.page} ${r.element}: the page's Content-Security-Policy refuses ${r.source} (${r.directive}); allow it in the policy the host sends (and in brand-elements.json "csp"), or draw the element without it`;

async function frameRefusals(frame: Frame) {
  if (frame.detached) return [];
  try {
    return await frame.evaluate(readRefusals);
  } catch (error) {
    if (requestEnded(error)) return [];
    if (
      error instanceof Error &&
      /^(?:Execution context was destroyed(?:, most likely because of a navigation\.)?|Attempted to use detached Frame '[^']+'\.)$/.test(
        error.message,
      )
    )
      return [];
    throw error;
  }
}

/** The refusals on `page` and in its frames, each once, two frames after its last change so the
 *  images its styles now draw have been requested. A frame lost to navigation or detachment is skipped. */
export const refusals = async (page: Page, url: string): Promise<Refusal[]> => {
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  );
  const found = await Promise.all(page.frames().map(frameRefusals));
  return [...new Map(found.flat().map((r) => [JSON.stringify(r), { page: url, ...r }])).values()];
};

export const listedCsp = (value: unknown) => (value === undefined ? undefined : readCsp(value));
