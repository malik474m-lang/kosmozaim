import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession, seedAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await seedAdmin();

    const { username, password } = await request.json();
    const user = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "Неверные данные" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user[0].passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Неверные данные" }, { status: 401 });
    }

    const token = await createSession(user[0].id);
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
