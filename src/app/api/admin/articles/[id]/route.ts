import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const valid = await verifySession();
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db
      .update(articles)
      .set({
        title: body.title,
        excerpt: body.excerpt || "",
        content: body.content,
        metaTitle: body.metaTitle || "",
        metaDescription: body.metaDescription || "",
        coverImage: body.coverImage || "",
        isPublished: body.isPublished,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const valid = await verifySession();
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await db.delete(articles).where(eq(articles.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
