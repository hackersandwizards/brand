// The portal's former address: catalogue.html, with its anchor, forwards to the portal at the root.
export const prerender = true;

export const GET = () =>
  new Response(
    `<!doctype html><meta charset="utf-8"><title>hackers&amp;wizards brand</title><meta http-equiv="refresh" content="0; url=./"><script>location.replace("./" + location.hash)</script><a href="./">hackers&amp;wizards brand</a>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
