/**
 * Base URL for the Express API (server-only). Defaults to local dev if unset.
 */
export function getBackendBaseUrl() {
  // Prefer 127.0.0.1 on Windows: "localhost" can resolve to ::1 while the API
  // listens on IPv4 only, which leads to intermittent ECONNRESET from Next.
  const raw = process.env.BACKEND_URL || "http://127.0.0.1:5000";
  return String(raw).replace(/\/$/, "");
}
