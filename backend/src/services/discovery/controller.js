const { and, eq } = require("drizzle-orm");
const { db } = require("../../sb/db");
const { productDiscoveryWorkspaces } = require("../../model/schema");
const { chat } = require("../prd/fastrouterClient");
const { parseModelFormJson } = require("../prd/prdTemplate");
const {
  BRAINSTORM_SYSTEM,
  PRIORITIZE_SYSTEM,
  VALIDATION_PLAN_SYSTEM,
  VALIDATION_ANALYZE_SYSTEM,
  PRD_PLANNING_SYSTEM,
  buildBrainstormUser,
  buildPrioritizeUser,
  buildValidationPlanUser,
  buildValidationAnalyzeUser,
  buildPrdPlanningUser,
} = require("./prompts");

const SECTION_KEYS = new Set([
  "brainstorm",
  "prioritization",
  "validationPlan",
  "validationResults",
  "prdPlanning",
]);

async function ensureWorkspace(projectId, userId) {
  const [existing] = await db
    .select()
    .from(productDiscoveryWorkspaces)
    .where(eq(productDiscoveryWorkspaces.projectId, projectId))
    .limit(1);
  if (existing) {
    return existing;
  }
  const [inserted] = await db
    .insert(productDiscoveryWorkspaces)
    .values({
      projectId,
      userId,
      brainstorm: {},
      prioritization: {},
      validationPlan: {},
      validationResults: {},
      prdPlanning: {},
    })
    .returning();
  return inserted;
}

function workspaceDto(row) {
  return {
    id: row.id,
    projectId: row.projectId,
    brainstorm: row.brainstorm || {},
    prioritization: row.prioritization || {},
    validationPlan: row.validationPlan || {},
    validationResults: row.validationResults || {},
    prdPlanning: row.prdPlanning || {},
    updatedAt: row.updatedAt,
  };
}

async function getWorkspace(req, res) {
  try {
    const row = await ensureWorkspace(req.params.projectId, req.user.id);
    return res.json({ workspace: workspaceDto(row) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load discovery workspace" });
  }
}

async function patchWorkspace(req, res) {
  try {
    const projectId = req.params.projectId;
    const row = await ensureWorkspace(projectId, req.user.id);
    const patch = { updatedAt: new Date() };

    for (const key of SECTION_KEYS) {
      if (req.body[key] != null && typeof req.body[key] === "object") {
        if (key === "validationResults") {
          patch[key] = {
            ...(row.validationResults || {}),
            ...req.body.validationResults,
          };
        } else {
          patch[key] = req.body[key];
        }
      }
    }

    if (Object.keys(patch).length <= 1) {
      return res.status(400).json({ error: "Provide at least one section object to save" });
    }

    const [updated] = await db
      .update(productDiscoveryWorkspaces)
      .set(patch)
      .where(
        and(
          eq(productDiscoveryWorkspaces.id, row.id),
          eq(productDiscoveryWorkspaces.userId, req.user.id)
        )
      )
      .returning();

    return res.json({ workspace: workspaceDto(updated) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save discovery workspace" });
  }
}

async function brainstorm(req, res) {
  try {
    const rawInput =
      typeof req.body.rawInput === "string" ? req.body.rawInput.trim() : "";
    if (!rawInput) {
      return res.status(400).json({ error: "rawInput is required" });
    }
    const row = await ensureWorkspace(req.params.projectId, req.user.id);
    const userMsg = buildBrainstormUser(req.project, rawInput);
    const { text, model } = await chat(
      [
        { role: "system", content: BRAINSTORM_SYSTEM },
        { role: "user", content: userMsg },
      ],
      { temperature: 0.35, maxTokens: 12000, jsonObject: true }
    );
    const parsed = parseModelFormJson(text);
    const brainstormPayload = {
      rawInput: rawInput.slice(0, 48000),
      structuredFeatures: Array.isArray(parsed.structuredFeatures)
        ? parsed.structuredFeatures
        : [],
      themes: Array.isArray(parsed.themes) ? parsed.themes : [],
      recurringPainPoints: Array.isArray(parsed.recurringPainPoints)
        ? parsed.recurringPainPoints
        : [],
      workflows: Array.isArray(parsed.workflows) ? parsed.workflows : [],
      notes: typeof parsed.notes === "string" ? parsed.notes : "",
      lastModelUsed: model,
      lastGeneratedAt: new Date().toISOString(),
    };

    const [updated] = await db
      .update(productDiscoveryWorkspaces)
      .set({ brainstorm: brainstormPayload, updatedAt: new Date() })
      .where(eq(productDiscoveryWorkspaces.id, row.id))
      .returning();

    return res.json({ workspace: workspaceDto(updated), modelUsed: model });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message || "Brainstorm generation failed",
    });
  }
}

async function prioritize(req, res) {
  try {
    const row = await ensureWorkspace(req.params.projectId, req.user.id);
    const structured =
      row.brainstorm?.structuredFeatures ||
      (Array.isArray(req.body.structuredFeatures)
        ? req.body.structuredFeatures
        : null);
    if (!Array.isArray(structured) || structured.length === 0) {
      return res.status(400).json({
        error: "Run brainstorm first or pass structuredFeatures in the body",
      });
    }
    const founderNotes =
      typeof req.body.founderNotes === "string" ? req.body.founderNotes : "";
    const userMsg = buildPrioritizeUser(req.project, structured, founderNotes);
    const { text, model } = await chat(
      [
        { role: "system", content: PRIORITIZE_SYSTEM },
        { role: "user", content: userMsg },
      ],
      { temperature: 0.35, maxTokens: 16000, jsonObject: true }
    );
    const parsed = parseModelFormJson(text);
    const prioritizationPayload = {
      features: Array.isArray(parsed.features) ? parsed.features : [],
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      selectedForValidationIds: Array.isArray(req.body.selectedForValidationIds)
        ? req.body.selectedForValidationIds
        : Array.isArray(row.prioritization?.selectedForValidationIds)
          ? row.prioritization.selectedForValidationIds
          : [],
      lastModelUsed: model,
      lastGeneratedAt: new Date().toISOString(),
    };

    const [updated] = await db
      .update(productDiscoveryWorkspaces)
      .set({ prioritization: prioritizationPayload, updatedAt: new Date() })
      .where(eq(productDiscoveryWorkspaces.id, row.id))
      .returning();

    return res.json({ workspace: workspaceDto(updated), modelUsed: model });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message || "Prioritization failed",
    });
  }
}

function featuresForValidationPlan(row, body) {
  const feats = row.prioritization?.features;
  if (!Array.isArray(feats) || feats.length === 0) {
    return null;
  }
  const bodyIds = Array.isArray(body.featureIds)
    ? body.featureIds.map(String).filter(Boolean)
    : [];
  const savedIds = Array.isArray(row.prioritization?.selectedForValidationIds)
    ? row.prioritization.selectedForValidationIds.map(String).filter(Boolean)
    : [];
  const idList = bodyIds.length ? bodyIds : savedIds;
  if (idList.length === 0) {
    return null;
  }
  const idSet = new Set(idList);
  const subset = feats.filter((f) => f && idSet.has(String(f.id)));
  return subset.length ? subset : null;
}

async function validationPlan(req, res) {
  try {
    const row = await ensureWorkspace(req.params.projectId, req.user.id);
    const subset = featuresForValidationPlan(row, req.body);
    if (!subset || subset.length === 0) {
      return res.status(400).json({
        error:
          "Select at least one feature on the Prioritize tab (checkboxes). Optionally pass featureIds in the body — ids must match prioritized features.",
      });
    }
    const userMsg = buildValidationPlanUser(req.project, subset);
    const { text, model } = await chat(
      [
        { role: "system", content: VALIDATION_PLAN_SYSTEM },
        { role: "user", content: userMsg },
      ],
      { temperature: 0.35, maxTokens: 16000, jsonObject: true }
    );
    const parsed = parseModelFormJson(text);
    const validationPlanPayload = {
      plansByFeatureId:
        parsed.plansByFeatureId && typeof parsed.plansByFeatureId === "object"
          ? parsed.plansByFeatureId
          : {},
      overallNotes:
        typeof parsed.overallNotes === "string" ? parsed.overallNotes : "",
      sourceFeatureIds: subset.map((f) => f.id).filter(Boolean),
      lastModelUsed: model,
      lastGeneratedAt: new Date().toISOString(),
    };

    const [updated] = await db
      .update(productDiscoveryWorkspaces)
      .set({ validationPlan: validationPlanPayload, updatedAt: new Date() })
      .where(eq(productDiscoveryWorkspaces.id, row.id))
      .returning();

    return res.json({ workspace: workspaceDto(updated), modelUsed: model });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message || "Validation planning failed",
    });
  }
}

function normalizePerFeatureNotes(body) {
  const raw = body.perFeatureNotes;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw;
  }
  if (Array.isArray(raw)) {
    const o = {};
    for (const item of raw) {
      if (!item || typeof item !== "object") {
        continue;
      }
      const id = item.featureId != null ? String(item.featureId) : "";
      if (!id) {
        continue;
      }
      o[id] = typeof item.notes === "string" ? item.notes : "";
    }
    return o;
  }
  return {};
}

function planFeatureIds(validationPlan) {
  const src = validationPlan?.sourceFeatureIds;
  if (Array.isArray(src) && src.length) {
    return src.map(String).filter(Boolean);
  }
  const plans = validationPlan?.plansByFeatureId;
  if (plans && typeof plans === "object") {
    return Object.keys(plans).filter(Boolean);
  }
  return [];
}

async function validationAnalyze(req, res) {
  try {
    const row = await ensureWorkspace(req.params.projectId, req.user.id);
    const plan = row.validationPlan || {};
    const ids = planFeatureIds(plan);
    if (!ids.length) {
      return res.status(400).json({
        error:
          "Generate a validation plan first (TAB 3 — Validation planning), then record how you ran it here.",
      });
    }

    const perFeatureNotes = normalizePerFeatureNotes(req.body);
    const missing = ids.filter((id) => !String(perFeatureNotes[id] || "").trim());
    if (missing.length) {
      return res.status(400).json({
        error: `Describe how you validated for every planned feature. Missing or empty for: ${missing.join(", ")}`,
      });
    }

    const founderNotes =
      typeof req.body.founderNotes === "string"
        ? req.body.founderNotes.trim().slice(0, 16000)
        : "";

    const userMsg = buildValidationAnalyzeUser(
      req.project,
      plan,
      row.prioritization,
      founderNotes,
      perFeatureNotes
    );
    const { text, model } = await chat(
      [
        { role: "system", content: VALIDATION_ANALYZE_SYSTEM },
        { role: "user", content: userMsg },
      ],
      { temperature: 0.35, maxTokens: 14000, jsonObject: true }
    );
    const parsed = parseModelFormJson(text);
    const analyzed =
      parsed.analyzed && typeof parsed.analyzed === "object"
        ? parsed.analyzed
        : {};
    const executionReview =
      parsed.executionReview && typeof parsed.executionReview === "object"
        ? parsed.executionReview
        : {};

    const executionNotesByFeatureId = {};
    for (const id of ids) {
      executionNotesByFeatureId[id] = String(perFeatureNotes[id] || "").trim().slice(0, 12000);
    }

    const prev = row.validationResults && typeof row.validationResults === "object"
      ? row.validationResults
      : {};
    const validationResultsPayload = {
      ...prev,
      executionNotesByFeatureId,
      planSnapshot: plan,
      planSnapshotAt: new Date().toISOString(),
      founderInput: founderNotes,
      analyzed,
      executionReview,
      lastModelUsed: model,
      lastGeneratedAt: new Date().toISOString(),
    };

    const [updated] = await db
      .update(productDiscoveryWorkspaces)
      .set({
        validationResults: validationResultsPayload,
        updatedAt: new Date(),
      })
      .where(eq(productDiscoveryWorkspaces.id, row.id))
      .returning();

    return res.json({ workspace: workspaceDto(updated), modelUsed: model });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message || "Validation analysis failed",
    });
  }
}

async function prdPlanning(req, res) {
  try {
    const row = await ensureWorkspace(req.params.projectId, req.user.id);
    const planningBrief =
      typeof req.body.planningBrief === "string" ? req.body.planningBrief : "";
    const userMsg = buildPrdPlanningUser(
      req.project,
      row.brainstorm,
      row.prioritization,
      row.validationPlan,
      row.validationResults,
      planningBrief
    );
    const { text, model } = await chat(
      [
        { role: "system", content: PRD_PLANNING_SYSTEM },
        { role: "user", content: userMsg },
      ],
      { temperature: 0.35, maxTokens: 14000, jsonObject: true }
    );
    const parsed = parseModelFormJson(text);
    const prdPlanningPayload = {
      ...parsed,
      lastModelUsed: model,
      lastGeneratedAt: new Date().toISOString(),
    };

    const [updated] = await db
      .update(productDiscoveryWorkspaces)
      .set({ prdPlanning: prdPlanningPayload, updatedAt: new Date() })
      .where(eq(productDiscoveryWorkspaces.id, row.id))
      .returning();

    return res.json({ workspace: workspaceDto(updated), modelUsed: model });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message || "PRD planning generation failed",
    });
  }
}

/** Compact bundle for PRD template generation (server-side). */
async function loadDiscoveryBundleForProject(projectId, userId) {
  const [row] = await db
    .select()
    .from(productDiscoveryWorkspaces)
    .where(eq(productDiscoveryWorkspaces.projectId, projectId))
    .limit(1);
  if (!row || row.userId !== userId) {
    return null;
  }
  const hasSignal = [
    row.brainstorm?.structuredFeatures?.length,
    row.prioritization?.features?.length,
    Object.keys(row.validationPlan?.plansByFeatureId || {}).length,
    row.validationResults?.analyzed,
    row.prdPlanning && Object.keys(row.prdPlanning).length > 2,
  ].some(Boolean);
  if (!hasSignal) {
    return null;
  }
  return {
    brainstorm: row.brainstorm,
    prioritization: row.prioritization,
    validationPlan: row.validationPlan,
    validationResults: row.validationResults,
    prdPlanning: row.prdPlanning,
  };
}

module.exports = {
  getWorkspace,
  patchWorkspace,
  brainstorm,
  prioritize,
  validationPlan,
  validationAnalyze,
  prdPlanning,
  loadDiscoveryBundleForProject,
};
