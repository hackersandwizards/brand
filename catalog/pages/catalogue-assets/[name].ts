// The files the portal loads beside it: its frames' documents, the elements stylesheet they link
// and the PNGs its inlined SVGs embed.
import type { APIRoute } from "astro";
import { portal } from "../../portal-run.ts";

export const prerender = true;

export const getStaticPaths = () =>
  Object.keys(portal().assets).map((name) => ({ params: { name } }));

const TYPES: Record<string, string> = {
  css: "text/css; charset=utf-8",
  html: "text/html; charset=utf-8",
  png: "image/png",
};

export const GET: APIRoute = ({ params }) => {
  const data = portal().assets[params.name!];
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(data, "base64"), {
    headers: { "Content-Type": TYPES[params.name!.split(".").pop()!]! },
  });
};
