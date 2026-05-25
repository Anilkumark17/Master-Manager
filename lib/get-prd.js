import { cache } from "react";
import { and, eq } from "drizzle-orm";
import { getServerUser } from "@/lib/server/auth-context";
import { db } from "@/lib/server/sb/db";
import { prdDocuments } from "@/lib/server/model/schema";

export const getPrdVersion = cache(async (projectId, prdId) => {
  try {
    const user = await getServerUser();
    if (!user) return undefined;

    const [row] = await db
      .select()
      .from(prdDocuments)
      .where(
        and(
          eq(prdDocuments.id, prdId),
          eq(prdDocuments.projectId, projectId),
          eq(prdDocuments.userId, user.id)
        )
      )
      .limit(1);

    if (!row) return null;

    return {
      id: row.id,
      projectId: row.projectId,
      title: row.title,
      content: row.content,
      formSnapshot: row.formSnapshot,
      modelUsed: row.modelUsed,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  } catch {
    return undefined;
  }
});
