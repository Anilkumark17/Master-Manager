require("dotenv").config({ path: ".env.local" });

/** @type { import("drizzle-kit").Config } */
module.exports = {
  schema: "./lib/server/model/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
