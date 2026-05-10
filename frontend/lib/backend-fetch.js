/**
 * Fetch to the Express API with long read timeouts.
 * Next.js uses Undici; its default body timeout (~300s) can cause ECONNRESET
 * while waiting for PRD planning / form-fill / designer generation.
 *
 * Default `Connection: close` avoids reusing a half-closed localhost socket
 * (common source of intermittent ECONNRESET on long AI routes).
 */
import { Agent, fetch as undiciFetch } from "undici";

const LONG_MS = 1_800_000; // 30 minutes

const longBackendAgent = new Agent({
  connectTimeout: 120_000,
  headersTimeout: LONG_MS,
  bodyTimeout: LONG_MS,
  /** Drop idle sockets quickly so the next long request does not reuse a bad one. */
  keepAliveTimeout: 2_000,
  keepAliveMaxTimeout: LONG_MS,
});

function mergeHeaders(init) {
  const raw = init?.headers;
  const out = raw != null ? new Headers(raw) : new Headers();
  if (!out.has("connection")) {
    out.set("connection", "close");
  }
  return out;
}

/**
 * @param {string} url
 * @param {import("undici").RequestInit} [init]
 */
export function fetchToBackend(url, init = {}) {
  return undiciFetch(url, {
    ...init,
    headers: mergeHeaders(init),
    dispatcher: longBackendAgent,
  });
}

function isTransientBackendNetworkError(err) {
  const code = err?.cause?.code || err?.code;
  const msg = `${err?.cause?.message || ""} ${err?.message || ""}`.toLowerCase();
  return (
    code === "ECONNRESET" ||
    code === "ECONNREFUSED" ||
    code === "ETIMEDOUT" ||
    /econnreset|econnrefused|socket hang up|und_err_socket/i.test(msg)
  );
}

/**
 * Same as fetchToBackend but retries once on transient localhost / socket drops
 * (common during long discovery / PRD AI calls from the Next dev server).
 *
 * @param {string} url
 * @param {import("undici").RequestInit} [init]
 * @param {{ extraAttempts?: number }} [opts]
 */
export async function fetchToBackendWithRetry(url, init = {}, opts = {}) {
  const extra = Math.max(0, Number(opts.extraAttempts) || 1);
  let lastErr;
  for (let attempt = 0; attempt <= extra; attempt++) {
    try {
      return await fetchToBackend(url, init);
    } catch (err) {
      lastErr = err;
      if (attempt < extra && isTransientBackendNetworkError(err)) {
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}
