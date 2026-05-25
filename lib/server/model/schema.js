import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  shortDescription: text("short_description").notNull(),
  visionStatement: text("vision_statement").notNull(),
  problemStatement: text("problem_statement").notNull(),
  targetUsers: text("target_users").notNull(),
  industryDomain: text("industry_domain").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

const prdDocuments = pgTable("prd_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  formSnapshot: jsonb("form_snapshot").notNull(),
  content: text("content").notNull().default(""),
  modelUsed: text("model_used"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Product discovery → prioritization → validation → PRD planning pipeline (one row per project).
 */
const productDiscoveryWorkspaces = pgTable(
  "product_discovery_workspaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .unique()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    brainstorm: jsonb("brainstorm").notNull().$defaultFn(() => ({})),
    prioritization: jsonb("prioritization").notNull().$defaultFn(() => ({})),
    validationPlan: jsonb("validation_plan").notNull().$defaultFn(() => ({})),
    validationResults: jsonb("validation_results").notNull().$defaultFn(() => ({})),
    prdPlanning: jsonb("prd_planning").notNull().$defaultFn(() => ({})),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

/**
 * Dev tab: architecture / tech-requirements intake + generated markdown doc (one row per project).
 */
const devArchitectureWorkspaces = pgTable("dev_architecture_workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .unique()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  intake: jsonb("intake").notNull().$defaultFn(() => ({})),
  clarificationNotes: text("clarification_notes").notNull().default(""),
  generatedDocument: text("generated_document").notNull().default(""),
  modelUsed: text("model_used"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** React Flow–compatible maps generated from the latest PRD (IA / journeys / handoff). */
const designerDeliverables = pgTable("designer_deliverables", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  title: text("title"),
  reactFlowJson: jsonb("react_flow_json").notNull(),
  modelUsed: text("model_used"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export {
  users,
  projects,
  prdDocuments,
  productDiscoveryWorkspaces,
  devArchitectureWorkspaces,
  designerDeliverables,
};
