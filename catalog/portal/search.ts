import { decodeEscaped } from "../../scan/help";

export type PortalSearchEntry = { t: string; k: string; h: string; x?: string };
export type SearchableSection = { html: string; index: PortalSearchEntry[] };

export const searchScript = (index: PortalSearchEntry[]) => `<script>
const decodeHash = ${decodeEscaped.toString()};
const INDEX = ${JSON.stringify(index).replace(/</g, "\\u003c")};
const cat = document.querySelector(".hw-catalog"), q = cat.querySelector(".hw-catalog-search"), results = document.getElementById("results");
const tiles = [...cat.querySelectorAll(".hw-catalog-tile")];
const h = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const words = () => q.value.toLowerCase().split(/\\s+/).filter(Boolean);
const show = () => {
  const raw = location.hash.slice(1);
  const decoded = decodeHash(raw) ?? raw; // a stray % in a hand-typed link
  const [page, anchor] = decoded.split("/");
  const view = document.querySelector('section[data-page="' + CSS.escape(page) + '"]') ? page : "";
  const searching = words().length > 0;
  cat.dataset.mode = searching ? "search" : view ? "view" : "overview";
  for (const s of document.querySelectorAll("section[data-page]")) s.hidden = s.dataset.page !== view;
  for (const i of document.querySelectorAll("section[data-page]:not([hidden]) image[data-href]")) i.setAttribute("href", i.dataset.href);
  for (const a of cat.querySelectorAll(".hw-catalog-rail .hw-catalog-names a")) if (!searching && view && [location.hash, "#" + view].includes(a.getAttribute("href"))) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  const el = !searching && (view ? anchor && document.getElementById(anchor) : page !== "overview" && page && document.getElementById(page));
  if (el) { el.scrollIntoView({ block: "start" }); if (view) { el.style.outline = "3px solid var(--color-purple)"; el.style.outlineOffset = "3px"; setTimeout(() => (el.style.outline = ""), 2000); } }
  else scrollTo(0, 0);
};
// Omit index entries whose destinations already appear among the matching tiles.
const search = () => {
  const w = words();
  const hit = (s) => w.every((x) => s.toLowerCase().includes(x));
  const shown = new Set(tiles.filter((t) => hit(t.dataset.search)).map((t) => t.getAttribute("href")));
  const hits = INDEX.filter((e) => !shown.has("#" + e.h) && hit(e.t + " " + e.k + " " + (e.x || ""))).slice(0, 60);
  results.innerHTML = hits.length ? '<h2 class="label">Tokens, colours, logos and files</h2>' + hits.map((e) => '<a href="#' + e.h + '"><span class="label">' + e.k + "</span>" + (e.k === "colour" ? '<i style="width:1rem;height:1rem;border-radius:0;border:1px solid var(--color-border);background:' + e.x.split(" ")[0] + '"></i>' : "") + "<strong>" + h(e.t) + "</strong><span class=meta>" + h((e.x || "").slice(0, 80)) + "</span></a>").join("") : shown.size ? "" : "<p>Nothing found.</p>";
  show();
};
q.addEventListener("input", search);
// A link followed from a search clears it; one to the page already open fires no hashchange, so
// the cleared search shows it.
cat.addEventListener("click", (e) => { if (!words().length || !e.target.closest('.hw-catalog-main a[href^="#"]')) return; q.value = ""; q.dispatchEvent(new Event("input", { bubbles: true })); });
addEventListener("hashchange", show);
// Keys as in Storybook: / or Cmd+K searches.
addEventListener("keydown", (e) => {
  const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName);
  if ((e.key === "/" && !typing) || (e.key === "k" && (e.metaKey || e.ctrlKey))) { e.preventDefault(); q.focus(); }
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-copy]");
  if (b) navigator.clipboard?.writeText(b.dataset.copy).then(() => { b.classList.add("copied"); setTimeout(() => b.classList.remove("copied"), 1200); });
});
show();
</script>`;
