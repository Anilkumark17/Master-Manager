const { and, eq } = require("drizzle-orm");
const { db } = require("../../sb/db");
const { projects } = require("../../model/schema");

async function requireProjectAccess(req, res, next) {
  try {
    const projectId = req.params.projectId;
    if (!projectId) {
      return res.status(400).json({ error: "Missing project id" });
    }
    const [row] = await db
      .select()
      .from(projects)
      .where(
        and(eq(projects.id, projectId), eq(projects.userId, req.user.id))
      )
      .limit(1);

    if (!row) {
      return res.status(404).json({ error: "Project not found" });
    }
    req.project = row;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireProjectAccess };
