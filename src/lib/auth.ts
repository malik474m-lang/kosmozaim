import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const SESSION_COOKIE = "admin_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "default-secret-change-me-in-production";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: number): Promise<string> {
  const token = Buffer.from(`${userId}:${SESSION_SECRET}:${Date.now()}`).toString("base64");
  return token;
}

export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session) return false;
  try {
    const decoded = Buffer.from(session.value, "base64").toString();
    const parts = decoded.split(":");
    if (parts.length < 3) return false;
    const userId = parseInt(parts[0]);
    if (parts[1] !== SESSION_SECRET) return false;
    const user = await db.select().from(adminUsers).where(eq(adminUsers.id, userId)).limit(1);
    return user.length > 0;
  } catch {
    return false;
  }
}

export async function seedAdmin() {
  const existing = await db.select().from(adminUsers).limit(1);
  if (existing.length === 0) {
    const hash = await hashPassword("admin123");
    await db.insert(adminUsers).values({
      username: "admin",
      passwordHash: hash,
    });
  }
}
