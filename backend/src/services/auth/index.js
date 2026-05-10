const authRouter = require("./routes");
const { requireAuth } = require("./middleware");

module.exports = { authRouter, requireAuth };
