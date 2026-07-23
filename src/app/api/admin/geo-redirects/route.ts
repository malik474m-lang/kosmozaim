import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { geoRedirects } from "@/db/schema";
import { verifySession } from "@/lib/auth";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET - список всех гео-редиректов
export async function GET() {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redirects = await db
    .select()
    .from(geoRedirects)
    .orderBy(desc(geoRedirects.createdAt));

  return NextResponse.json(redirects);
}

// POST - создание нового гео-редиректа
export async function POST(request: NextRequest) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { countryCode, countryName, redirectUrl, isActive } = body;

    if (!countryCode || !redirectUrl) {
      return NextResponse.json(
        { error: "countryCode и redirectUrl обязательны" },
        { status: 400 }
      );
    }

    const result = await db.insert(geoRedirects).values({
      countryCode: countryCode.toUpperCase(),
      countryName: countryName || "",
      redirectUrl,
      isActive: isActive ?? true,
    });

    return NextResponse.json({ success: true, id: result });
  } catch (error) {
    console.error("Error creating geo redirect:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
