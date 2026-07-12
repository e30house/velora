import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

const TOKEN_EXPIRY = "30d";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return secret;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded === "object" && decoded && "userId" in decoded) {
      return { userId: String((decoded as { userId: unknown }).userId) };
    }
    return null;
  } catch {
    return null;
  }
}

export interface AuthedRequest extends Request {
  userId?: string;
}

// Accounts are optional in Velora, but any route behind this middleware
// requires a valid Bearer token — used only for the sync endpoints, never
// for the core AI/routing features which work with no account at all.
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Missing Authorization header" });
    return;
  }

  let decoded: { userId: string } | null;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Auth is not configured on the server" });
    return;
  }

  if (!decoded) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  req.userId = decoded.userId;
  next();
}
