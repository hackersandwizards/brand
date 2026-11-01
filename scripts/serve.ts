// `bun run dev`: serves this checkout on 127.0.0.1:4326 for http://brand.localhost, which Caddy
// proxies here as it proxies os.localhost to its dev server.
import { join, resolve, sep } from "node:path";

const root = resolve(import.meta.dir, "..");
const home = "/catalogue.html";

Bun.serve({
  hostname: "127.0.0.1",
  port: 4326,
  async fetch(request) {
    const path = decodeURIComponent(new URL(request.url).pathname);
    if (path === "/") return new Response(null, { status: 302, headers: { Location: home } });
    const file = join(root, path.endsWith("/") ? `${path}index.html` : path);
    const found = file.startsWith(root + sep) && (await Bun.file(file).exists());
    return found ? new Response(Bun.file(file)) : new Response("Not found", { status: 404 });
  },
});
console.log("Caddy: http://brand.localhost, direct: http://localhost:4326");
