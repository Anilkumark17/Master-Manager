import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/server/sb/db";
import { users } from "@/lib/server/model/schema";
import { verifyToken } from "@/lib/server/utils/jwt";

export async function getTokenFromRequest(request) {
  const header = request?.headers?.get?.("authorization");
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length);
  }
  return (await cookies()).get("mm_token")?.value ?? null;
}

export async function getServerUser() {
  const token = (await cookies()).get("mm_token")?.value ?? null;
  if (!token) return null;

  try {
    const decoded = verifyToken(token);
    const userId = decoded.sub;
    if (!userId) return null;

    const [row] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return row ?? null;
  } catch {
    return null;
  }
}

export async function getAuthUser(request) {
  const token = await getTokenFromRequest(request);
  if (!token) return null;

  try {
    const decoded = verifyToken(token);
    const userId = decoded.sub;
    if (!userId) return null;

    const [row] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return row ?? null;
  } catch {
    return null;
  }
}

export async function requireAuthUser(request) {
  const user = await getAuthUser(request);
  if (!user) {
    return { error: { status: 401, body: { error: "Unauthorized" } } };
  }
  return { user };
}
