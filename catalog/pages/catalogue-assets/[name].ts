// The files the portal loads beside it: the elements stylesheet its sample frames link and the PNGs
// its inlined SVGs embed.
import type { APIRoute } from "astro";
import { portal } from "../../portal-run.ts";

export const prerender = true;

export const getStaticPaths = () =>
  Object.keys(portal().assets).map((name) => ({ params: { name } }));

export const GET: APIRoute = ({ params }) => {
  const data = portal().assets[params.name!];
  if (!data) return new Response("Not found", { status: 404 });
  const type = params.name!.endsWith(".css") ? "text/css; charset=utf-8" : "image/png";
  return new Response(Buffer.from(data, "base64"), { headers: { "Content-Type": type } });
};
