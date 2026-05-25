const STORAGE_VERSION = 1;

/** @param {string} projectId */
function storageKey(projectId) {
  return `mm-dev-draft:${projectId}`;
}

/**
 * @param {string} projectId
 * @returns {{ intake: object, clarificationNotes: string, generatedDocument: string, useDiscoveryWorkspace: boolean, savedAt: number } | null}
 */
export function loadDevSessionDraft(projectId) {
  if (typeof window === "undefined" || !projectId) {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(storageKey(projectId));
    if (!raw) {
      return null;
    }
    const o = JSON.parse(raw);
    if (o?.v !== STORAGE_VERSION || typeof o !== "object") {
      return null;
    }
    return {
      intake: o.intake && typeof o.intake === "object" ? o.intake : {},
      clarificationNotes:
        typeof o.clarificationNotes === "string" ? o.clarificationNotes : "",
      generatedDocument:
        typeof o.generatedDocument === "string" ? o.generatedDocument : "",
      useDiscoveryWorkspace: o.useDiscoveryWorkspace !== false,
      savedAt: typeof o.savedAt === "number" ? o.savedAt : 0,
    };
  } catch {
    return null;
  }
}

/**
 * @param {string} projectId
 * @param {{ intake: object, clarificationNotes: string, generatedDocument: string, useDiscoveryWorkspace: boolean }} draft
 */
export function saveDevSessionDraft(projectId, draft) {
  if (typeof window === "undefined" || !projectId) {
    return;
  }
  try {
    const payload = {
      v: STORAGE_VERSION,
      intake: draft.intake,
      clarificationNotes: draft.clarificationNotes,
      generatedDocument: draft.generatedDocument,
      useDiscoveryWorkspace: draft.useDiscoveryWorkspace !== false,
      savedAt: Date.now(),
    };
    sessionStorage.setItem(storageKey(projectId), JSON.stringify(payload));
  } catch {
    /* quota or private mode */
  }
}
