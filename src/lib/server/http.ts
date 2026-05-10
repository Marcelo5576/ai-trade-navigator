import { getServerRuntimeConfig, type ServerEnvSource } from "./env";

export function jsonResponse(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers,
  });
}

export function redirectResponse(location: string, status = 302) {
  return new Response(null, {
    status,
    headers: {
      location,
    },
  });
}

export function applySecurityHeaders(response: Response, request: Request, env: ServerEnvSource) {
  const headers = new Headers(response.headers);
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  applyCorsHeaders(headers, request, env);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function buildCorsPreflight(request: Request, env: ServerEnvSource) {
  const headers = new Headers();
  applyCorsHeaders(headers, request, env);
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(null, { status: 204, headers });
}

function applyCorsHeaders(headers: Headers, request: Request, env: ServerEnvSource) {
  const { corsOrigins } = getServerRuntimeConfig(env);
  const origin = request.headers.get("origin");
  if (!origin) return;

  const allowAll = corsOrigins.includes("*");
  const originAllowed = allowAll || corsOrigins.includes(origin);
  if (!originAllowed) return;

  headers.set("Access-Control-Allow-Origin", allowAll ? "*" : origin);
  headers.set("Vary", "Origin");
}

export function parseCookies(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const idx = item.indexOf("=");
        if (idx === -1) return [item, ""];
        return [item.slice(0, idx), decodeURIComponent(item.slice(idx + 1))];
      }),
  );
}

export async function maybeInjectRuntimeConfig(response: Response, runtimeConfig: unknown) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  const html = await response.text();
  const script = `<script>window.__AITN_CONFIG__=${JSON.stringify(runtimeConfig)};</script>`;
  const patchedHtml = html.includes("</head>")
    ? html.replace("</head>", `${script}</head>`)
    : `${script}${html}`;

  const headers = new Headers(response.headers);
  return new Response(patchedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
