/**
 * ai.blackroad.io — BlackRoad AI Completions Worker
 * OpenAI-compatible completions endpoint backed by the BlackRoad Gateway.
 */

export interface Env {
  BLACKROAD_GATEWAY_URL: string;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const gateway = env.BLACKROAD_GATEWAY_URL || "http://127.0.0.1:8787";

    if (url.pathname === "/") {
      return Response.json({
        service: "BlackRoad AI",
        description: "OpenAI-compatible AI completions powered by BlackRoad OS",
        endpoints: ["/v1/chat/completions", "/v1/models", "/health"],
        docs: "https://docs.blackroad.io/api/gateway",
      }, { headers: CORS });
    }

    const body = request.method !== "GET" ? await request.text() : undefined;
    const resp = await fetch(`${gateway}${url.pathname}${url.search}`, {
      method: request.method,
      headers: { "Content-Type": "application/json" },
      body,
    });

    const isStream = body && JSON.parse(body || "{}").stream === true;
    if (isStream) {
      return new Response(resp.body, {
        headers: { ...CORS, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" }
      });
    }

    return new Response(await resp.text(), {
      status: resp.status,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  },
};
