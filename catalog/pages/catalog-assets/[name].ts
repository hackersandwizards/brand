// The files the portal loads beside it: its frames' documents, the elements stylesheet they link
// and the PNGs its inlined SVGs embed.
import type { APIRoute } from "astro";
import { portal } from "../../portal-run.ts";

export const prerender = true;

export const getStaticPaths = () =>
  Object.keys(portal().assets).map((name) => ({ params: { name } }));

const TYPES = new Map([
  ["css", "text/css; charset=utf-8"],
  ["html", "text/html; charset=utf-8"],
  ["png", "image/png"],
]);

export const GET: APIRoute = ({ params }) => {
  const assets = portal().assets;
  const { name } = params;
  const data = name === undefined ? undefined : assets[name];
  if (name === undefined || !data) return new Response("Not found", { status: 404 });
  const body = Buffer.from(data, "base64");
  const type = TYPES.get(name.slice(name.lastIndexOf(".") + 1));
  if (type === undefined) throw new Error(`Content type missing: ${name}`);
  return new Response(body, { headers: { "Content-Type": type } });
};
