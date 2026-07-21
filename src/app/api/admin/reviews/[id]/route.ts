import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, offers } from "@/db/schema";
import { eq, and, avg, count } from "drizzle-orm";
import { verifySession } from "@/lib/auth";

async function recalcRating(offerId: number) {
  const stats = await db
    .select({
      avgRating: avg(reviews.rating),
      total: count(),
    })
    .from(reviews)
    .where(and(eq(reviews.offerId, offerId), eq(reviews.isApproved, true)));

  const r = stats[0];
  await db
    .update(offers)
    .set({
      rating: r.avgRating ? String(r.avgRating) : "0",
      reviewCount: Number(r.total) || 0,
    })
    .where(eq(offers.id, offerId));
}

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
    const { isApproved } = await request.json();

    const updated = await db
      .update(reviews)
      .set({ isApproved })
      .where(eq(reviews.id, parseInt(id)))
      .returning();

    // Пересчёт рейтинга оффера
    if (updated[0]) {
      await recalcRating(updated[0].offerId);
    }

    return NextResponse.json(updated[0]);
  } catch {
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
    // Получаем offerId перед удалением
    const review = await db.select().from(reviews).where(eq(reviews.id, parseInt(id))).limit(1);
    await db.delete(reviews).where(eq(reviews.id, parseInt(id)));
    // Пересчитываем рейтинг
    if (review[0]) {
      await recalcRating(review[0].offerId);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
