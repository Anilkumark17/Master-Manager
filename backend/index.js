require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { authRouter } = require("./src/services/auth");
const { projectRouter } = require("./src/services/project");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "4mb" }));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/projects", projectRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on http://127.0.0.1:${PORT}`);
});

// Long AI requests: avoid closing idle-ish sockets while Express waits on FastRouter
server.keepAliveTimeout = 900000; // 15 min
server.headersTimeout = 910000;
if (typeof server.requestTimeout === "number") {
  server.requestTimeout = 0;
}
server.timeout = 0;
