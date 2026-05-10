/**
 * Long FastRouter / LLM calls: disable socket timeouts so the connection is
 * not reset while waiting for upstream (no bytes written yet).
 */
function longRunningAi(req, res, next) {
  try {
    req.setTimeout(0);
    res.setTimeout(0);
    if (req.socket) {
      req.socket.setTimeout(0);
    }
  } catch {
    /* ignore */
  }
  next();
}

module.exports = { longRunningAi };
