import { afterAll, beforeAll, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { getViteConfig } from "astro/config";
import { createServer, type ViteDevServer } from "vite";
import { ROOT } from "../scripts/git";

// Every document component renders standalone, through Astro's compiler, from this repository
// alone: an import of an app's internals fails here. Placeholder props, no figure or term of ours.
const dir = join(ROOT, "document/components");
const components = readdirSync(dir)
  .filter((f) => f.endsWith(".astro"))
  .map((f) => f.replace(/\.astro$/, ""));

const P = "[PLACEHOLDER]";
const row = { date: "01.01.", day: "Mo", time: "09:00 – 10:00", hours: "1,00", activity: P };
const proposal = {
  lang: "de",
  title: P,
  number: P,
  date: P,
  validUntil: P,
  clientShort: P,
  eyebrow: P,
  heading: P,
  subtitle: P,
  salutation: P,
  greeting: [P],
  client: { company: P, lines: [P] },
  contact: P,
  price: { rows: [{ item: P, basis: P, rate: P, amount: P }], subtotal: P, vat: P, gross: P },
  scopeHeadline: P,
  services: [{ name: P, items: [P] }],
  community: { price: P },
  sequence: { headline: P, steps: [{ when: P, name: P }] },
  outcome: { result: P, measures: P },
  terms: [{ title: P, paragraphs: [P] }],
  signOff: P,
  personName: P,
};
const props: Record<string, Record<string, unknown>> = {
  DocCallout: { title: P },
  DocCard: { title: P },
  DocCertificate: {
    lang: "en",
    title: P,
    attendeeName: P,
    trainingTitle: P,
    date: P,
    topics: [P],
    signers: [{ name: P, title: P, image: "" }],
  },
  DocClosing: { text: P, signOff: P, name: P },
  DocConfirmation: { label: P, text: P, line: P },
  DocHeader: { kind: P, legal: true },
  DocLead: {},
  DocLeistungsnachweis: {
    periodLabel: P,
    clientShort: P,
    created: P,
    client: P,
    employee: P,
    period: P,
    rows: [row],
    total: P,
  },
  DocMarkdown: { kind: P, html: `<p>${P}</p>` },
  DocPriceTable: {
    columns: [{ label: P }, { label: P, num: true }],
    rows: [{ item: P, cells: [P] }],
  },
  DocProposal: proposal,
  DocProse: { html: `<p>${P}</p>` },
  DocRateCard: {
    personName: P,
    date: P,
    validUntil: P,
    year: P,
    opener: P,
    recipientFirstName: P,
    greeting: P,
    client: { company: P, shortName: P, recipientName: P, street: P, zip: P, city: P },
    rates: [{ item: P, detail: P, unit: P, rate: P }],
    terms: [P],
    scope: [P],
    closing: P,
    signOff: P,
  },
  DocRecipient: { label: P, company: P, lines: [P] },
  DocSectionHead: { title: P },
  DocSteps: { steps: [{ when: P, name: P }] },
  DocTitle: { title: P },
  DocTotalRow: { label: P, span: 1, figures: [P] },
};

let server: ViteDevServer;
beforeAll(async () => {
  const config = await getViteConfig(
    {
      root: ROOT,
      cacheDir: join(ROOT, "node_modules/.vite-test"),
      appType: "custom",
      logLevel: "error",
      server: { middlewareMode: true, hmr: false, watch: null },
      optimizeDeps: { noDiscovery: true, include: [] },
    },
    { root: ROOT, configFile: false, logLevel: "silent", devToolbar: { enabled: false } },
  )({ command: "serve", mode: "development" });
  server = await createServer({ ...config, configFile: false });
});
afterAll(() => server?.close());

test("every component has placeholder props here", () => {
  expect(components.sort()).toEqual(Object.keys(props).sort());
});

test.each(components)(
  "%s renders standalone",
  async (name) => {
    const { experimental_AstroContainer } = await server.ssrLoadModule("astro/container");
    const component = (await server.ssrLoadModule(`/document/components/${name}.astro`)).default;
    const container = await experimental_AstroContainer.create();
    const html: string = await container.renderToString(component, {
      props: props[name],
      slots: { default: `<p>${P}</p>`, aside: `<p>${P}</p>` },
    });
    expect(html).toContain(P);
    if (["DocHeader", "DocProposal", "DocRateCard", "DocMarkdown"].includes(name))
      expect(html).toMatch(/data:image\/png;base64,iVBOR[\s\S]*data:image\/svg\+xml;base64,/);
  },
  30_000,
);
