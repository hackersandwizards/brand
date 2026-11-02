// The brand portal at the site's root, beside the files it links (files.ts).
import { portal } from "../portal-run.ts";

export const prerender = true;

export const GET = () =>
  new Response(portal(true).html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
