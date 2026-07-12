import { Router, type Request, type Response } from "express";
import { prisma } from "./db.js";
import { hashPassword, signToken, verifyPassword, requireAuth, type AuthedRequest } from "./auth.js";

export const accountRoutes = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

accountRoutes.post("/auth/signup", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: "Enter a valid email address" });
    return;
  }
  if (!password || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      res.status(409).json({ error: "An account with that email already exists" });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email: normalizedEmail, passwordHash, data: { create: { payload: {} } } },
    });

    const token = signToken(user.id);
    res.status(201).json({ token, email: user.email });
  } catch (err) {
    console.error("Signup failed:", err);
    res.status(500).json({ error: "Signup is unavailable right now" });
  }
});

accountRoutes.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ error: "Incorrect email or password" });
      return;
    }

    const token = signToken(user.id);
    res.json({ token, email: user.email });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ error: "Login is unavailable right now" });
  }
});

accountRoutes.get("/user/data", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const record = await prisma.userData.findUnique({ where: { userId: req.userId } });
    res.json({ payload: record?.payload ?? {} });
  } catch (err) {
    console.error("Fetching user data failed:", err);
    res.status(500).json({ error: "Could not load your synced data" });
  }
});

accountRoutes.put("/user/data", requireAuth, async (req: AuthedRequest, res: Response) => {
  const { payload } = req.body as { payload?: unknown };
  if (payload === undefined) {
    res.status(400).json({ error: "Missing payload" });
    return;
  }

  try {
    await prisma.userData.upsert({
      where: { userId: req.userId },
      create: { userId: req.userId!, payload: payload as object },
      update: { payload: payload as object },
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("Saving user data failed:", err);
    res.status(500).json({ error: "Could not save your synced data" });
  }
});
