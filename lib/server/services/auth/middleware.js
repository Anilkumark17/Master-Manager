import { eq } from "drizzle-orm";
import { db } from "@/lib/server/sb/db";
import { users } from "@/lib/server/model/schema";
import { verifyToken } from "@/lib/server/utils/jwt";

async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token =
    header && header.startsWith("Bearer ")
      ? header.slice("Bearer ".length)
      : null;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = verifyToken(token);
    const userId = decoded.sub;
    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

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

    if (!row) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = row;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export { requireAuth };
