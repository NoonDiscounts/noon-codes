// Cloudflare Pages: يرجع Markdown عندما يطلب العميل Accept: text/markdown
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const accept = request.headers.get("Accept") || "";
    const isRoot = url.pathname === "/" || url.pathname.endsWith("/index.html");
    if (isRoot && accept.includes("text/markdown")) {
      const md = await env.ASSETS.fetch(new URL("/index.md", url));
      const body = await md.text();
      return new Response(body, { headers: {
        "Content-Type": "text/markdown; charset=utf-8", "Vary": "Accept",
        "x-markdown-tokens": String(Math.ceil(body.length / 4)) } });
    }
    const res = await env.ASSETS.fetch(request);
    const out = new Response(res.body, res);
    out.headers.append("Vary", "Accept");
    return out;
  }
};
