require("dotenv").config({ path: ".env" });

/** @type { import("drizzle-kit").Config } */
module.exports = {
  schema: "./src/model/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
