const { and, desc, eq } = require("drizzle-orm");
const { db } = require("../../sb/db");
const { projects } = require("../../model/schema");
const { PROJECT_TYPES } = require("./constants");

function toRow(body) {
  return {
    name: typeof body.name === "string" ? body.name.trim() : "",
    type: typeof body.type === "string" ? body.type.trim() : "",
    shortDescription:
      typeof body.shortDescription === "string"
        ? body.shortDescription.trim()
        : "",
    visionStatement:
      typeof body.visionStatement === "string"
        ? body.visionStatement.trim()
        : "",
    problemStatement:
      typeof body.problemStatement === "string"
        ? body.problemStatement.trim()
        : "",
    targetUsers:
      typeof body.targetUsers === "string" ? body.targetUsers.trim() : "",
    industryDomain:
      typeof body.industryDomain === "string"
        ? body.industryDomain.trim()
        : "",
  };
}

function mapProject(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    type: row.type,
    shortDescription: row.shortDescription,
    visionStatement: row.visionStatement,
    problemStatement: row.problemStatement,
    targetUsers: row.targetUsers,
    industryDomain: row.industryDomain,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function validatePayload(row, partial = false) {
  const checks = [
    ["name", row.name],
    ["type", row.type],
    ["shortDescription", row.shortDescription],
    ["visionStatement", row.visionStatement],
    ["problemStatement", row.problemStatement],
    ["targetUsers", row.targetUsers],
    ["industryDomain", row.industryDomain],
  ];
  for (const [key, val] of checks) {
    if (partial && val === "") continue;
    if (!partial && (!val || val === "")) {
      return { error: `Missing or empty field: ${key}` };
    }
  }
  if (row.type && !PROJECT_TYPES.includes(row.type)) {
    return {
      error: `Invalid type. Must be one of: ${PROJECT_TYPES.join(", ")}`,
    };
  }
  return null;
}

async function list(req, res) {
  try {
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, req.user.id))
      .orderBy(desc(projects.updatedAt));
    return res.json({ projects: rows.map(mapProject) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to list projects" });
  }
}

async function create(req, res) {
  try {
    const row = toRow(req.body);
    const err = validatePayload(row, false);
    if (err) return res.status(400).json(err);

    const [inserted] = await db
      .insert(projects)
      .values({
        userId: req.user.id,
        name: row.name,
        type: row.type,
        shortDescription: row.shortDescription,
        visionStatement: row.visionStatement,
        problemStatement: row.problemStatement,
        targetUsers: row.targetUsers,
        industryDomain: row.industryDomain,
      })
      .returning();

    return res.status(201).json({ project: mapProject(inserted) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create project" });
  }
}

async function getOne(req, res) {
  try {
    const id = req.params.id;
    const [row] = await db
      .select()
      .from(projects)
      .where(
        and(eq(projects.id, id), eq(projects.userId, req.user.id))
      )
      .limit(1);

    if (!row) {
      return res.status(404).json({ error: "Project not found" });
    }
    return res.json({ project: mapProject(row) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load project" });
  }
}

async function update(req, res) {
  try {
    const id = req.params.id;
    const existing = toRow({ ...req.body });
    const err = validatePayload(existing, true);
    if (err) return res.status(400).json(err);

    const patch = {};
    if (existing.name) patch.name = existing.name;
    if (existing.type) {
      if (!PROJECT_TYPES.includes(existing.type)) {
        return res.status(400).json({
          error: `Invalid type. Must be one of: ${PROJECT_TYPES.join(", ")}`,
        });
      }
      patch.type = existing.type;
    }
    if (existing.shortDescription) patch.shortDescription = existing.shortDescription;
    if (existing.visionStatement) patch.visionStatement = existing.visionStatement;
    if (existing.problemStatement)
      patch.problemStatement = existing.problemStatement;
    if (existing.targetUsers) patch.targetUsers = existing.targetUsers;
    if (existing.industryDomain) patch.industryDomain = existing.industryDomain;

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    patch.updatedAt = new Date();

    const [updated] = await db
      .update(projects)
      .set(patch)
      .where(
        and(eq(projects.id, id), eq(projects.userId, req.user.id))
      )
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Project not found" });
    }
    return res.json({ project: mapProject(updated) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update project" });
  }
}

async function remove(req, res) {
  try {
    const id = req.params.id;
    const [deleted] = await db
      .delete(projects)
      .where(
        and(eq(projects.id, id), eq(projects.userId, req.user.id))
      )
      .returning({ id: projects.id });

    if (!deleted) {
      return res.status(404).json({ error: "Project not found" });
    }
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete project" });
  }
}

module.exports = { list, create, getOne, update, remove };
