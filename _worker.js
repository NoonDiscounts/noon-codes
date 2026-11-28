// Cloudflare Pages: يرجع Markdown عندما يطلب العميل Accept: text/markdown
// ===== MCP (Streamable HTTP، بدون حالة) على المسار /mcp =====
// This worker serves only static assets and /mcp. It has no /auth, /token
// or /register endpoints, no authorization server and no JWKS endpoint.
const STORE_IDS = ["noon-egypt", "noon-ksa-uae", "noon-gcc", "defacto", "namshi", "mumzworld"];
const TOOL = {
  name: "get-coupon-codes",
  description: "Get discount codes from codes.json, optionally filtered by store or search text. Each result has code, title, description, store and url only. No expiry date is published for these codes.",
  inputSchema: { type: "object", properties: {
    store: { type: "string", enum: STORE_IDS, description: "Store id" },
    query: { type: "string", description: "Optional search text" } } }
};
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version" };
const rpc = (id, result, error) => new Response(JSON.stringify({ jsonrpc: "2.0", id: id ?? null, ...(error ? { error } : { result }) }), { headers: { "Content-Type": "application/json", ...CORS } });

async function handleMcp(request, env, url) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST", ...CORS } });
  let m; try { m = await request.json(); } catch { return rpc(null, null, { code: -32700, message: "Parse error" }); }
  if (m.id === undefined) return new Response(null, { status: 202, headers: CORS }); // notifications
  switch (m.method) {
    case "initialize": return rpc(m.id, { protocolVersion: "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "tawfeer-hub-coupons", version: "1.0.0" } });
    case "ping": return rpc(m.id, {});
    case "tools/list": return rpc(m.id, { tools: [TOOL] });
    case "tools/call": {
      if (m.params?.name !== TOOL.name) return rpc(m.id, null, { code: -32602, message: "Unknown tool" });
      const { store, query = "" } = m.params.arguments || {};
      const all = await (await env.ASSETS.fetch(new URL("/codes.json", url))).json();
      const q = String(query).trim().toLowerCase();
      const out = all.filter(c => (!store || c.store === store) && (!q || [c.code, c.title, c.description, c.store].join(" ").toLowerCase().includes(q))).map(c => ({ code: c.code, title: c.title, description: c.description, store: c.store, url: c.url }));
      return rpc(m.id, { content: [{ type: "text", text: JSON.stringify(out) }] });
    }
    default: return rpc(m.id, null, { code: -32601, message: "Method not found" });
  }
}

const LINK = [
  '</sitemap.xml>; rel="sitemap"',
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</openapi.json>; rel="service-desc"; type="application/openapi+json"',
  '</index.md>; rel="service-doc"; type="text/markdown"',
  '</index.md>; rel="alternate"; type="text/markdown"',
  '</auth.md>; rel="service-doc"; type="text/markdown"'
].join(", ");

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/mcp") return handleMcp(request, env, url);
    const accept = request.headers.get("Accept") || "";
    const isRoot = url.pathname === "/" || url.pathname.endsWith("/index.html");
    if (isRoot && accept.includes("text/markdown")) {
      const md = await env.ASSETS.fetch(new URL("/index.md", url));
      const body = await md.text();
      return new Response(body, { headers: {
        "Content-Type": "text/markdown; charset=utf-8", "Vary": "Accept", "Link": LINK,
        "x-markdown-tokens": String(Math.ceil(body.length / 4)) } });
    }
    const res = await env.ASSETS.fetch(request);
    const out = new Response(res.body, res);
    out.headers.append("Vary", "Accept");
    if (isRoot) out.headers.set("Link", LINK);
    return out;
  }
};
