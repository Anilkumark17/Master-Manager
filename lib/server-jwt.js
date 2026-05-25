import jwt from "jsonwebtoken";

export function verifySessionToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret || !token) {
    return null;
  }
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}
