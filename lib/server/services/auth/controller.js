import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/server/sb/db";
import { users } from "@/lib/server/model/schema";
import { signToken } from "@/lib/server/utils/jwt";

const SALT_ROUNDS = 10;

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.createdAt,
  };
}

async function register(req, res) {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email =
      typeof req.body.email === "string" ? req.body.email.trim() : "";
    const password =
      typeof req.body.password === "string" ? req.body.password : "";

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    const normalized = email.toLowerCase();
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalized))
      .limit(1);
    if (existing) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const [user] = await db
      .insert(users)
      .values({ name, email: normalized, passwordHash })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      });

    const token = signToken({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    return res.status(201).json({ user: publicUser(user), token });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email is already registered" });
    }
    console.error(err);
    return res.status(500).json({ error: "Registration failed" });
  }
}

async function login(req, res) {
  try {
    const email =
      typeof req.body.email === "string" ? req.body.email.trim() : "";
    const password =
      typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalized = email.toLowerCase();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalized))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const safe = publicUser(user);
    const token = signToken({
      sub: safe.id,
      email: safe.email,
      name: safe.name,
    });

    return res.json({ user: safe, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Login failed" });
  }
}

function me(req, res) {
  return res.json({ user: req.user });
}

export { register, login, me };
