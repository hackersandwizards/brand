// `bun run dev`: serves this checkout on 127.0.0.1:4326 for http://brand.localhost, which Caddy
// proxies here as it proxies os.localhost to its dev server. The catalogue is written afresh by
// scripts/catalogue.ts on every request for it (about 0.2 s), so a reload shows the working tree.
import { join, resolve, sep } from "node:path";

const root = resolve(import.meta.dir, "..");
const home = "/catalogue.html";

Bun.serve({
  hostname: "127.0.0.1",
  port: 4326,
  async fetch(request) {
    const path = decodeURIComponent(new URL(request.url).pathname);
    if (path === "/") return new Response(null, { status: 302, headers: { Location: home } });
    if (path === home) {
      const build = Bun.spawnSync(["bun", "scripts/catalogue.ts"], { cwd: root, stdout: "ignore" });
      if (build.exitCode) return new Response(build.stderr.toString(), { status: 500 });
    }
    const file = join(root, path.endsWith("/") ? `${path}index.html` : path);
    const found = file.startsWith(root + sep) && (await Bun.file(file).exists());
    return found ? new Response(Bun.file(file)) : new Response("Not found", { status: 404 });
  },
});
console.log("Caddy: http://brand.localhost, direct: http://localhost:4326");
