import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { getSessionFromRequest } from "./lib/server/auth";
import { getPublicRuntimeConfig } from "./lib/server/env";
import {
  applySecurityHeaders,
  buildCorsPreflight,
  maybeInjectRuntimeConfig,
  redirectResponse,
} from "./lib/server/http";
import { handleCustomRequest } from "./lib/server/api";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;
const startedAt = Date.now();

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

function getUptimeSeconds() {
  return Math.floor((Date.now() - startedAt) / 1000);
}

async function protectAdminPages(request: Request, env: unknown) {
  const pathname = new URL(request.url).pathname;
  if (!pathname.startsWith("/admin")) {
    return null;
  }

  const session = await getSessionFromRequest(request, env as Record<string, unknown>);
  if (!session) {
    return redirectResponse(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  if (session.role !== "admin") {
    return redirectResponse("/dashboard?denied=admin");
  }

  return null;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      if (request.method === "OPTIONS") {
        return buildCorsPreflight(request, env as Record<string, unknown>);
      }

      const customResponse = await handleCustomRequest(
        request,
        env as Record<string, unknown>,
        getUptimeSeconds(),
      );
      if (customResponse) {
        return applySecurityHeaders(customResponse, request, env as Record<string, unknown>);
      }

      const adminProtection = await protectAdminPages(request, env);
      if (adminProtection) {
        return applySecurityHeaders(adminProtection, request, env as Record<string, unknown>);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalizedResponse = await normalizeCatastrophicSsrResponse(response);
      const responseWithConfig = await maybeInjectRuntimeConfig(
        normalizedResponse,
        getPublicRuntimeConfig(env as Record<string, unknown>),
      );
      return applySecurityHeaders(responseWithConfig, request, env as Record<string, unknown>);
    } catch (error) {
      console.error(error);
      return applySecurityHeaders(brandedErrorResponse(), request, env as Record<string, unknown>);
    }
  },
};
