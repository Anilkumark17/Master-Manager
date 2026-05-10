const { and, desc, eq } = require("drizzle-orm");
const { db } = require("../../sb/db");
const { prdDocuments } = require("../../model/schema");
const { chat } = require("./fastrouterClient");
const {
  getFormFillSystemPrompt,
  buildUserMessageFormFill,
  parseModelFormJson,
} = require("./prdTemplate");
const {
  STRATEGIC_ROLLOUT_SYSTEM,
  buildStrategicRolloutUserMessage,
} = require("./strategicRolloutPrompt");
const { loadDiscoveryBundleForProject } = require("../discovery/controller");

/** Coerce model output so every leaf is a string for Drizzle / UI. */
function normalizeFormLeaves(obj) {
  if (obj == null || typeof obj !== "object" || Array.isArray(obj)) {
    return {};
  }
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v != null && typeof v === "object" && !Array.isArray(v)) {
      out[k] = normalizeFormLeaves(v);
    } else if (v == null) {
      out[k] = "";
    } else if (typeof v === "string") {
      out[k] = v;
    } else if (Array.isArray(v)) {
      out[k] = v.map((x) => String(x)).join("\n");
    } else {
      out[k] = String(v);
    }
  }
  return out;
}

async function list(req, res) {
  try {
    const projectId = req.params.projectId;
    const rows = await db
      .select({
        id: prdDocuments.id,
        title: prdDocuments.title,
        createdAt: prdDocuments.createdAt,
        updatedAt: prdDocuments.updatedAt,
        modelUsed: prdDocuments.modelUsed,
      })
      .from(prdDocuments)
      .where(eq(prdDocuments.projectId, projectId))
      .orderBy(desc(prdDocuments.updatedAt));

    return res.json({ prds: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to list PRDs" });
  }
}

async function getOne(req, res) {
  try {
    const projectId = req.params.projectId;
    const prdId = req.params.prdId;
    const [row] = await db
      .select()
      .from(prdDocuments)
      .where(
        and(
          eq(prdDocuments.id, prdId),
          eq(prdDocuments.projectId, projectId),
          eq(prdDocuments.userId, req.user.id)
        )
      )
      .limit(1);

    if (!row) {
      return res.status(404).json({ error: "PRD not found" });
    }

    return res.json({
      prd: {
        id: row.id,
        projectId: row.projectId,
        title: row.title,
        content: row.content,
        formSnapshot: row.formSnapshot,
        modelUsed: row.modelUsed,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load PRD" });
  }
}

async function create(req, res) {
  try {
    const projectId = req.params.projectId;
    const content =
      typeof req.body.content === "string" ? req.body.content : "";
    const title =
      typeof req.body.title === "string" ? req.body.title.trim() : null;
    const formSnapshot =
      req.body.formSnapshot && typeof req.body.formSnapshot === "object"
        ? req.body.formSnapshot
        : {};

    const modelUsed =
      process.env.FASTROUTER_MODEL ||
      process.env.MODEL ||
      "google/gemini-2.5-pro";

    const [inserted] = await db
      .insert(prdDocuments)
      .values({
        projectId,
        userId: req.user.id,
        title: title || `PRD — ${new Date().toISOString().slice(0, 10)}`,
        formSnapshot,
        content,
        modelUsed,
      })
      .returning();

    return res.status(201).json({
      prd: {
        id: inserted.id,
        title: inserted.title,
        content: inserted.content,
        formSnapshot: inserted.formSnapshot,
        modelUsed: inserted.modelUsed,
        createdAt: inserted.createdAt,
        updatedAt: inserted.updatedAt,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save PRD" });
  }
}

async function patch(req, res) {
  try {
    const projectId = req.params.projectId;
    const prdId = req.params.prdId;
    const patch = { updatedAt: new Date() };

    if (typeof req.body.content === "string") {
      patch.content = req.body.content;
    }
    if (typeof req.body.title === "string") {
      patch.title = req.body.title.trim() || null;
    }
    if (req.body.formSnapshot && typeof req.body.formSnapshot === "object") {
      patch.formSnapshot = req.body.formSnapshot;
    }

    const hasFieldUpdate =
      typeof req.body.content === "string" ||
      typeof req.body.title === "string" ||
      (req.body.formSnapshot && typeof req.body.formSnapshot === "object");

    if (!hasFieldUpdate) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const [updated] = await db
      .update(prdDocuments)
      .set(patch)
      .where(
        and(
          eq(prdDocuments.id, prdId),
          eq(prdDocuments.projectId, projectId),
          eq(prdDocuments.userId, req.user.id)
        )
      )
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "PRD not found" });
    }

    return res.json({
      prd: {
        id: updated.id,
        title: updated.title,
        content: updated.content,
        formSnapshot: updated.formSnapshot,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update PRD" });
  }
}

async function generate(req, res) {
  try {
    const formSnapshot =
      req.body.formSnapshot && typeof req.body.formSnapshot === "object"
        ? req.body.formSnapshot
        : {};
    const fieldDescriptors = Array.isArray(req.body.fieldDescriptors)
      ? req.body.fieldDescriptors
      : [];
    const stageBrief =
      typeof req.body.stageBrief === "string"
        ? req.body.stageBrief.trim().slice(0, 12000)
        : "";

    let discoveryBundle = null;
    if (req.body.useDiscoveryWorkspace === true) {
      discoveryBundle = await loadDiscoveryBundleForProject(
        req.params.projectId,
        req.user.id
      );
    }

    const userMessage = buildUserMessageFormFill(
      req.project,
      formSnapshot,
      fieldDescriptors,
      stageBrief,
      discoveryBundle
    );
    const { text, model } = await chat(
      [
        {
          role: "system",
          content: getFormFillSystemPrompt(
            req.project,
            stageBrief,
            discoveryBundle
          ),
        },
        { role: "user", content: userMessage },
      ],
      { temperature: 0.3, maxTokens: 16000 }
    );

    const filled = normalizeFormLeaves(parseModelFormJson(text));
    return res.json({ formSnapshot: filled, modelUsed: model });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message || "Generation failed",
    });
  }
}

async function strategicRollout(req, res) {
  try {
    const feature =
      typeof req.body.feature === "string" ? req.body.feature.trim() : "";
    if (!feature) {
      return res
        .status(400)
        .json({ error: "Describe one feature to analyze in the request body." });
    }
    const optionalNotes =
      typeof req.body.optionalNotes === "string"
        ? req.body.optionalNotes.trim().slice(0, 8000)
        : "";
    const stageBrief =
      typeof req.body.stageBrief === "string"
        ? req.body.stageBrief.trim().slice(0, 12000)
        : "";

    const userMessage = buildStrategicRolloutUserMessage(
      req.project,
      feature,
      optionalNotes,
      stageBrief
    );
    const { text, model } = await chat(
      [
        { role: "system", content: STRATEGIC_ROLLOUT_SYSTEM },
        { role: "user", content: userMessage },
      ],
      { temperature: 0.35, maxTokens: 8000 }
    );

    return res.json({ analysis: text, modelUsed: model });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message || "Strategic rollout analysis failed",
    });
  }
}

module.exports = { list, getOne, create, patch, generate, strategicRollout };
