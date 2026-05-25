import { and, eq } from "drizzle-orm";
import { db } from "@/lib/server/sb/db";
import { projects } from "@/lib/server/model/schema";

export async function getProjectForUser(userId, projectId) {
  if (!projectId) return null;
  const [row] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function requireProjectForUser(userId, projectId) {
  const project = await getProjectForUser(userId, projectId);
  if (!project) {
    return { error: { status: 404, body: { error: "Project not found" } } };
  }
  return { project };
}
