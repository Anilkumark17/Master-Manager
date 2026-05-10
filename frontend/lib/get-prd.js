import { cache } from "react";

import { getBackendBaseUrl } from "@/lib/backend-url";
import { getAuthHeaders } from "@/lib/server-api";

export const getPrdVersion = cache(async (projectId, prdId) => {
  const backend = getBackendBaseUrl();
  try {
    const res = await fetch(`${backend}/projects/${projectId}/prds/${prdId}`, {
      headers: await getAuthHeaders(),
      cache: "no-store",
    });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      return undefined;
    }
    const data = await res.json().catch(() => ({}));
    return data.prd ?? null;
  } catch {
    return undefined;
  }
});
