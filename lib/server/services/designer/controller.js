import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/server/sb/db";
import { designerDeliverables, prdDocuments } from "@/lib/server/model/schema";
import { chat } from "@/lib/server/services/prd/openrouterClient";
import {
  getDesignerSystemPrompt,
  buildDesignerUserMessage,
  KIND_LABELS,
} from "@/lib/server/services/designer/designerPrompts";

const ALLOWED_KINDS = new Set(["ia", "journeys", "handoff"]);

function parseReactFlowJson(text) {
  let s = String(text || "").trim();
  const fence = /^```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?```$/im.exec(s);
  if (fence) {
    s = fence[1].trim();
  }
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last > first) {
    s = s.slice(first, last + 1);
  }
  const obj = JSON.parse(s);
  if (!Array.isArray(obj.nodes) || !Array.isArray(obj.edges)) {
    throw new Error("Response must include nodes and edges arrays");
  }
  return { nodes: obj.nodes, edges: obj.edges };
}

async function loadLatestPrdBlock(projectId) {
  const [row] = await db
    .select()
    .from(prdDocuments)
    .where(eq(prdDocuments.projectId, projectId))
    .orderBy(desc(prdDocuments.updatedAt))
    .limit(1);
  if (!row) {
    return null;
  }
  return JSON.stringify(
    {
      prdTitle: row.title,
      content: row.content,
      formSnapshot: row.formSnapshot,
    },
    null,
    2
  );
}

async function list(req, res) {
  try {
    const projectId = req.params.projectId;
    const kind =
      typeof req.query.kind === "string" ? req.query.kind.trim() : null;

    const conditions = [
      eq(designerDeliverables.projectId, projectId),
      eq(designerDeliverables.userId, req.user.id),
    ];
    if (kind && ALLOWED_KINDS.has(kind)) {
      conditions.push(eq(designerDeliverables.kind, kind));
    }

    const rows = await db
      .select()
      .from(designerDeliverables)
      .where(and(...conditions))
      .orderBy(desc(designerDeliverables.updatedAt));
    return res.json({
      deliverables: rows.map((r) => ({
        id: r.id,
        kind: r.kind,
        title: r.title,
        reactFlow: r.reactFlowJson,
        modelUsed: r.modelUsed,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to list designer deliverables" });
  }
}

async function generate(req, res) {
  try {
    const kind =
      typeof req.body.kind === "string" ? req.body.kind.trim() : "";
    if (!ALLOWED_KINDS.has(kind)) {
      return res.status(400).json({
        error: "kind must be one of: ia, journeys, handoff",
      });
    }

    const projectId = req.params.projectId;
    const prdBlock = await loadLatestPrdBlock(projectId);
    if (!prdBlock) {
      return res.status(400).json({
        error:
          "No saved PRD found for this project. Save a PRD snapshot first—the designer uses the latest PRD as source of truth.",
      });
    }

    const system = getDesignerSystemPrompt(kind);
    const userMessage = buildDesignerUserMessage(
      req.project,
      prdBlock,
      kind
    );

    let text;
    let model;
    try {
      ({ text, model } = await chat(
        [
          { role: "system", content: system },
          { role: "user", content: userMessage },
        ],
        { temperature: 0.35, maxTokens: 8000, jsonObject: true }
      ));
    } catch {
      ({ text, model } = await chat(
        [
          { role: "system", content: system },
          { role: "user", content: userMessage },
        ],
        { temperature: 0.35, maxTokens: 8000 }
      ));
    }

    const reactFlow = parseReactFlowJson(text);
    return res.json({ reactFlow, modelUsed: model, kind });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message || "Designer generation failed",
    });
  }
}

async function create(req, res) {
  try {
    const projectId = req.params.projectId;
    const kind =
      typeof req.body.kind === "string" ? req.body.kind.trim() : "";
    if (!ALLOWED_KINDS.has(kind)) {
      return res.status(400).json({ error: "Invalid kind" });
    }
    const reactFlow = req.body.reactFlow;
    if (!reactFlow || typeof reactFlow !== "object") {
      return res.status(400).json({ error: "reactFlow object required" });
    }
    if (!Array.isArray(reactFlow.nodes) || !Array.isArray(reactFlow.edges)) {
      return res.status(400).json({ error: "reactFlow must have nodes and edges" });
    }

    const title =
      typeof req.body.title === "string" && req.body.title.trim()
        ? req.body.title.trim()
        : `${KIND_LABELS[kind]} — ${new Date().toISOString().slice(0, 10)}`;

    const modelUsed =
      typeof req.body.modelUsed === "string"
        ? req.body.modelUsed.trim()
        : null;

    const [inserted] = await db
      .insert(designerDeliverables)
      .values({
        projectId,
        userId: req.user.id,
        kind,
        title,
        reactFlowJson: reactFlow,
        modelUsed,
      })
      .returning();

    return res.status(201).json({
      deliverable: {
        id: inserted.id,
        kind: inserted.kind,
        title: inserted.title,
        reactFlow: inserted.reactFlowJson,
        modelUsed: inserted.modelUsed,
        createdAt: inserted.createdAt,
        updatedAt: inserted.updatedAt,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save deliverable" });
  }
}

async function getOne(req, res) {
  try {
    const projectId = req.params.projectId;
    const deliverableId = req.params.deliverableId;
    const [row] = await db
      .select()
      .from(designerDeliverables)
      .where(
        and(
          eq(designerDeliverables.id, deliverableId),
          eq(designerDeliverables.projectId, projectId),
          eq(designerDeliverables.userId, req.user.id)
        )
      )
      .limit(1);

    if (!row) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.json({
      deliverable: {
        id: row.id,
        kind: row.kind,
        title: row.title,
        reactFlow: row.reactFlowJson,
        modelUsed: row.modelUsed,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load deliverable" });
  }
}

async function patch(req, res) {
  try {
    const projectId = req.params.projectId;
    const deliverableId = req.params.deliverableId;
    const patch = { updatedAt: new Date() };

    if (typeof req.body.title === "string") {
      patch.title = req.body.title.trim() || null;
    }
    if (req.body.reactFlow && typeof req.body.reactFlow === "object") {
      patch.reactFlowJson = req.body.reactFlow;
    }

    if (Object.keys(patch).length <= 1) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const [updated] = await db
      .update(designerDeliverables)
      .set(patch)
      .where(
        and(
          eq(designerDeliverables.id, deliverableId),
          eq(designerDeliverables.projectId, projectId),
          eq(designerDeliverables.userId, req.user.id)
        )
      )
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.json({
      deliverable: {
        id: updated.id,
        title: updated.title,
        reactFlow: updated.reactFlowJson,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update deliverable" });
  }
}

export { list, generate, create, getOne, patch };
