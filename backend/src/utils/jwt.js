const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

function signToken(payload) {
  if (!secret) throw new Error("JWT_SECRET is required");
  return jwt.sign(payload, secret, { expiresIn });
}

function verifyToken(token) {
  if (!secret) throw new Error("JWT_SECRET is required");
  return jwt.verify(token, secret);
}

module.exports = { signToken, verifyToken };
