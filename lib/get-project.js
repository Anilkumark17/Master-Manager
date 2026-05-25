import { cache } from "react";
import { desc, eq } from "drizzle-orm";
import { getServerUser } from "@/lib/server/auth-context";
import { getProjectForUser } from "@/lib/server/project-access";
import { db } from "@/lib/server/sb/db";
import { projects } from "@/lib/server/model/schema";

export const getProject = cache(async (id) => {
  try {
    const user = await getServerUser();
    if (!user) return undefined;
    return getProjectForUser(user.id, id);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[getProject]", err?.message);
    }
    return undefined;
  }
});

export const listProjects = cache(async () => {
  try {
    const user = await getServerUser();
    if (!user) return { ok: false, projects: [] };
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, user.id))
      .orderBy(desc(projects.updatedAt));
    return { ok: true, projects: rows };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[listProjects]", err?.message);
    }
    return { ok: false, projects: [] };
  }
});
