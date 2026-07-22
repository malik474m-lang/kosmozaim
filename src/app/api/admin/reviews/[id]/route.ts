import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, offers } from "@/db/schema";
import { eq, and, avg, count } from "drizzle-orm";
import { verifySession } from "@/lib/auth";

async function recalcRating(offerId: number) {
  const stats = await db.select({ avgRating: avg(reviews.rating), total: count() }).from(reviews).where(and(eq(reviews.offerId, offerId), eq(reviews.isApproved, true)));
  const r = stats[0];
  await db.update(offers).set({ rating: r.avgRating ? String(r.avgRating) : "0", reviewCount: Number(r.total) || 0 }).where(eq(offers.id, offerId));
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const valid = await verifySession();
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const { isApproved } = await request.json();
    const existing = await db.select().from(reviews).where(eq(reviews.id, parseInt(id))).limit(1);
    if (!existing[0]) return NextResponse.json({ error: "Не найден" }, { status: 404 });
    await db.update(reviews).set({ isApproved }).where(eq(reviews.id, parseInt(id)));
    const updated = await db.select().from(reviews).where(eq(reviews.id, parseInt(id))).limit(1);
    await recalcRating(existing[0].offerId);
    return NextResponse.json(updated[0]);
  } catch (e) { console.error(e); return NextResponse.json({ error: "Ошибка" }, { status: 500 }); }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const valid = await verifySession();
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const review = await db.select().from(reviews).where(eq(reviews.id, parseInt(id))).limit(1);
    if (!review[0]) return NextResponse.json({ error: "Не найден" }, { status: 404 });
    await db.delete(reviews).where(eq(reviews.id, parseInt(id)));
    await recalcRating(review[0].offerId);
    return NextResponse.json({ success: true });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Ошибка" }, { status: 500 }); }
}
