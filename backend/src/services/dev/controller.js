const { and, desc, eq } = require("drizzle-orm");
const { db } = require("../../sb/db");
const {
  devArchitectureWorkspaces,
  prdDocuments,
} = require("../../model/schema");
const { chat, chatStream } = require("../prd/fastrouterClient");
const { loadDiscoveryBundleForProject } = require("../discovery/controller");
const {
  defaultIntake,
  deepMergeIntake,
  normalizeIntake,
} = require("./intakeDefaults");
const { TECH_DOC_SYSTEM, buildTechDocUserMessage } = require("./prompts");

function workspaceDto(row) {
  return {
    id: row.id,
    projectId: row.projectId,
    intake: normalizeIntake(row.intake),
    clarificationNotes: row.clarificationNotes || "",
    generatedDocument: row.generatedDocument || "",
    modelUsed: row.modelUsed,
    updatedAt: row.updatedAt,
  };
}

async function ensureWorkspace(projectId, userId) {
  const [existing] = await db
    .select()
    .from(devArchitectureWorkspaces)
    .where(eq(devArchitectureWorkspaces.projectId, projectId))
    .limit(1);
  if (existing) {
    return existing;
  }
  const [inserted] = await db
    .insert(devArchitectureWorkspaces)
    .values({
      projectId,
      userId,
      intake: defaultIntake(),
      clarificationNotes: "",
      generatedDocument: "",
    })
    .returning();
  return inserted;
}

async function getWorkspace(req, res) {
  try {
    const row = await ensureWorkspace(req.params.projectId, req.user.id);
    return res.json({ workspace: workspaceDto(row) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load dev workspace" });
  }
}

async function patchWorkspace(req, res) {
  try {
    const projectId = req.params.projectId;
    const row = await ensureWorkspace(projectId, req.user.id);
    const patch = { updatedAt: new Date() };

    if (req.body.intake != null && typeof req.body.intake === "object") {
      patch.intake = deepMergeIntake(normalizeIntake(row.intake), req.body.intake);
    }
    if (typeof req.body.clarificationNotes === "string") {
      patch.clarificationNotes = req.body.clarificationNotes.slice(0, 12000);
    }
    if (typeof req.body.generatedDocument === "string") {
      patch.generatedDocument = req.body.generatedDocument;
    }

    const hasUpdate =
      patch.intake != null ||
      typeof req.body.clarificationNotes === "string" ||
      typeof req.body.generatedDocument === "string";

    if (!hasUpdate) {
      return res.status(400).json({
        error:
          "Provide intake (object), clarificationNotes (string), and/or generatedDocument (string) to save",
      });
    }

    const [updated] = await db
      .update(devArchitectureWorkspaces)
      .set(patch)
      .where(
        and(
          eq(devArchitectureWorkspaces.id, row.id),
          eq(devArchitectureWorkspaces.userId, req.user.id)
        )
      )
      .returning();

    return res.json({ workspace: workspaceDto(updated) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save dev workspace" });
  }
}

async function loadLatestPrdExcerpt(projectId, userId) {
  const [row] = await db
    .select({
      title: prdDocuments.title,
      content: prdDocuments.content,
      formSnapshot: prdDocuments.formSnapshot,
    })
    .from(prdDocuments)
    .where(
      and(
        eq(prdDocuments.projectId, projectId),
        eq(prdDocuments.userId, userId)
      )
    )
    .orderBy(desc(prdDocuments.updatedAt))
    .limit(1);
  if (!row) {
    return null;
  }
  const snap =
    row.formSnapshot && typeof row.formSnapshot === "object"
      ? JSON.stringify(row.formSnapshot, null, 2).slice(0, 8000)
      : "";
  const body =
    typeof row.content === "string" ? row.content.slice(0, 12000) : "";
  const title = row.title || "Untitled";
  return `Title: ${title}\n\n### Form snapshot (truncated)\n${snap}\n\n### Document body (truncated)\n${body}`;
}

async function generateDocument(req, res) {
  try {
    const projectId = req.params.projectId;
    const row = await ensureWorkspace(projectId, req.user.id);

    let intake = normalizeIntake(row.intake);
    if (req.body.intake && typeof req.body.intake === "object") {
      intake = deepMergeIntake(intake, req.body.intake);
    }

    let clarificationNotes =
      typeof req.body.clarificationNotes === "string"
        ? req.body.clarificationNotes.trim().slice(0, 12000)
        : (row.clarificationNotes || "").trim();

    const useDiscovery =
      req.body.useDiscoveryWorkspace === true ||
      req.body.useDiscoveryWorkspace === undefined;
    const discoveryBundle = useDiscovery
      ? await loadDiscoveryBundleForProject(projectId, req.user.id)
      : null;

    const latestPrdExcerpt = await loadLatestPrdExcerpt(projectId, req.user.id);

    const userMessage = buildTechDocUserMessage({
      project: req.project,
      intake,
      clarificationNotes,
      discoveryBundle,
      latestPrdExcerpt,
    });

    const { text, model } = await chat(
      [
        { role: "system", content: TECH_DOC_SYSTEM },
        { role: "user", content: userMessage },
      ],
      { temperature: 0.25, maxTokens: 12000 }
    );

    const doc = typeof text === "string" ? text.trim() : "";

    const [updated] = await db
      .update(devArchitectureWorkspaces)
      .set({
        intake,
        clarificationNotes,
        generatedDocument: doc,
        modelUsed: model,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(devArchitectureWorkspaces.id, row.id),
          eq(devArchitectureWorkspaces.userId, req.user.id)
        )
      )
      .returning();

    return res.json({
      workspace: workspaceDto(updated),
      modelUsed: model,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message || "Technical document generation failed",
    });
  }
}

function sseWrite(res, obj) {
  res.write(`data: ${JSON.stringify(obj)}\n\n`);
}

async function generateDocumentStream(req, res) {
  const projectId = req.params.projectId;
  let row;
  let intake;
  let clarificationNotes;
  let userMessage;

  try {
    row = await ensureWorkspace(projectId, req.user.id);

    intake = normalizeIntake(row.intake);
    if (req.body.intake && typeof req.body.intake === "object") {
      intake = deepMergeIntake(intake, req.body.intake);
    }

    clarificationNotes =
      typeof req.body.clarificationNotes === "string"
        ? req.body.clarificationNotes.trim().slice(0, 12000)
        : (row.clarificationNotes || "").trim();

    const useDiscovery =
      req.body.useDiscoveryWorkspace === true ||
      req.body.useDiscoveryWorkspace === undefined;
    const discoveryBundle = useDiscovery
      ? await loadDiscoveryBundleForProject(projectId, req.user.id)
      : null;

    const latestPrdExcerpt = await loadLatestPrdExcerpt(projectId, req.user.id);

    userMessage = buildTechDocUserMessage({
      project: req.project,
      intake,
      clarificationNotes,
      discoveryBundle,
      latestPrdExcerpt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message || "Failed to prepare document stream",
    });
  }

  res.status(200);
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  const messages = [
    { role: "system", content: TECH_DOC_SYSTEM },
    { role: "user", content: userMessage },
  ];

  try {
    let full = "";
    for await (const piece of chatStream(messages, {
      temperature: 0.25,
      maxTokens: 16000,
    })) {
      full += piece;
      sseWrite(res, { type: "delta", text: piece });
    }

    const doc = full.trim();
    const model =
      process.env.FASTROUTER_MODEL ||
      process.env.MODEL ||
      "google/gemini-2.5-pro";

    await db
      .update(devArchitectureWorkspaces)
      .set({
        intake,
        clarificationNotes,
        generatedDocument: doc,
        modelUsed: model,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(devArchitectureWorkspaces.id, row.id),
          eq(devArchitectureWorkspaces.userId, req.user.id)
        )
      );

    sseWrite(res, { type: "done", model });
    res.end();
  } catch (err) {
    console.error(err);
    try {
      sseWrite(res, {
        type: "error",
        message: err.message || "Technical document stream failed",
      });
    } catch {
      /* connection may be closed */
    }
    try {
      res.end();
    } catch {
      /* ignore */
    }
  }
}

module.exports = {
  getWorkspace,
  patchWorkspace,
  generateDocument,
  generateDocumentStream,
};
