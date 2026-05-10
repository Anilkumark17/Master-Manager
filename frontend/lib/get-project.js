import { cache } from "react";
import { getBackendBaseUrl } from "@/lib/backend-url";
import { getAuthHeaders } from "@/lib/server-api";

export const getProject = cache(async (id) => {
  const backend = getBackendBaseUrl();
  try {
    const res = await fetch(`${backend}/projects/${id}`, {
      headers: {
        Connection: "keep-alive",
        ...(await getAuthHeaders()),
      },
      cache: "no-store",
    });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      return undefined;
    }
    const data = await res.json().catch(() => ({}));
    return data.project ?? null;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[getProject] fetch failed:",
        err?.cause?.code || err?.cause?.message || err?.message
      );
    }
    return undefined;
  }
});
