import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/server/sb/db";
import {
  devArchitectureWorkspaces,
  prdDocuments,
} from "@/lib/server/model/schema";
import { chatStream, getModel } from "@/lib/server/services/prd/openrouterClient";
import { loadDiscoveryBundleForProject } from "@/lib/server/services/discovery/controller";
import {
  defaultIntake,
  deepMergeIntake,
  normalizeIntake,
} from "@/lib/server/services/dev/intakeDefaults";
import {
  TECH_DOC_SYSTEM,
  buildTechDocUserMessage,
} from "@/lib/server/services/dev/prompts";

async function ensureWorkspace(projectId, userId) {
  const [existing] = await db
    .select()
    .from(devArchitectureWorkspaces)
    .where(eq(devArchitectureWorkspaces.projectId, projectId))
    .limit(1);
  if (existing) return existing;
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
  if (!row) return null;
  const snap =
    row.formSnapshot && typeof row.formSnapshot === "object"
      ? JSON.stringify(row.formSnapshot, null, 2).slice(0, 8000)
      : "";
  const body =
    typeof row.content === "string" ? row.content.slice(0, 12000) : "";
  const title = row.title || "Untitled";
  return `Title: ${title}\n\n### Form snapshot (truncated)\n${snap}\n\n### Document body (truncated)\n${body}`;
}

export async function streamDevDocument({ project, user, body }) {
  const projectId = project.id;
  const row = await ensureWorkspace(projectId, user.id);

  let intake = normalizeIntake(row.intake);
  if (body.intake && typeof body.intake === "object") {
    intake = deepMergeIntake(intake, body.intake);
  }

  const clarificationNotes =
    typeof body.clarificationNotes === "string"
      ? body.clarificationNotes.trim().slice(0, 12000)
      : (row.clarificationNotes || "").trim();

  const useDiscovery =
    body.useDiscoveryWorkspace === true ||
    body.useDiscoveryWorkspace === undefined;
  const discoveryBundle = useDiscovery
    ? await loadDiscoveryBundleForProject(projectId, user.id)
    : null;

  const latestPrdExcerpt = await loadLatestPrdExcerpt(projectId, user.id);

  const userMessage = buildTechDocUserMessage({
    project,
    intake,
    clarificationNotes,
    discoveryBundle,
    latestPrdExcerpt,
  });

  const messages = [
    { role: "system", content: TECH_DOC_SYSTEM },
    { role: "user", content: userMessage },
  ];

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const sse = (obj) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(obj)}\n\n`)
        );
      };

      try {
        let full = "";
        for await (const piece of chatStream(messages, {
          temperature: 0.25,
          maxTokens: 16000,
        })) {
          full += piece;
          sse({ type: "delta", text: piece });
        }

        const doc = full.trim();
        const model = getModel();

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
              eq(devArchitectureWorkspaces.userId, user.id)
            )
          );

        sse({ type: "done", model });
        controller.close();
      } catch (err) {
        console.error(err);
        sse({
          type: "error",
          message: err.message || "Technical document stream failed",
        });
        controller.close();
      }
    },
  });
}
