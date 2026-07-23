import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { geoRedirects } from "@/db/schema";
import { verifySession } from "@/lib/auth";
import { eq } from "drizzle-orm";

type RouteContext = { params: Promise<{ id: string }> };

// GET - получить один редирект
export async function GET(request: NextRequest, context: RouteContext) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const redirect = await db
    .select()
    .from(geoRedirects)
    .where(eq(geoRedirects.id, parseInt(id)))
    .limit(1);

  if (redirect.length === 0) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  return NextResponse.json(redirect[0]);
}

// PUT - обновить редирект
export async function PUT(request: NextRequest, context: RouteContext) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { countryCode, countryName, redirectUrl, isActive } = body;

    await db
      .update(geoRedirects)
      .set({
        countryCode: countryCode?.toUpperCase(),
        countryName,
        redirectUrl,
        isActive,
      })
      .where(eq(geoRedirects.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating geo redirect:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// DELETE - удалить редирект
export async function DELETE(request: NextRequest, context: RouteContext) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    await db.delete(geoRedirects).where(eq(geoRedirects.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting geo redirect:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
