// To run server:
// 1. Install bun https://bun.com/docs/installation
// 2. Get a maptiler API key https://api.maptiler.com
// 3. Add API key to .env.local
// 4. `bun --hot run sources/vector-tile-etag-proxy.ts`

// Needed for some reason?
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const server = Bun.serve({
  async fetch(request) {
    const { pathname } = new URL(request.url);
    const proxy = `https://api.maptiler.com/${pathname}?key=${process.env.MAPTILER_API_KEY}`;

    // Proxy json config
    if (pathname.endsWith(".json")) {
      const json = await fetch(proxy).then((response) => response.json());

      // Rewrite tiles endpoints from maptiler to the proxy
      (json as any)["tiles"][0] = (json as any)["tiles"][0].replace(
        "https://api.maptiler.com",
        `http://localhost:${server.port}`
      );

      return fixCORS(Response.json(json));
    }

    // Simulate a 304
    if (request.headers.has("if-none-match")) {
      return fixCORS(
        new Response(null, {
          headers: { ETag: request.headers.get("if-none-match") ?? undefined },
          status: 304,
        })
      );
    }

    // Otherwise proxy tiles requests
    const response = await fetch(proxy);

    // Forward headers and override cache control
    const headers = response.headers;
    headers.set("cache-control", "public, max-age=10");
    headers.set("etag", "12345");

    const buffer = await response.blob().then((blob) => blob.arrayBuffer());
    return fixCORS(new Response(Bun.gzipSync(buffer), { headers }));
  },
});

console.log("Server running on localhost:" + server.port);

function fixCORS(response: Response): Response {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  return response;
}
