import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const offerId = searchParams.get("offerId");

  if (!offerId) {
    return NextResponse.json({ error: "offerId required" }, { status: 400 });
  }

  const result = await db
    .select()
    .from(reviews)
    .where(
      and(
        eq(reviews.offerId, parseInt(offerId)),
        eq(reviews.isApproved, true)
      )
    )
    .orderBy(desc(reviews.createdAt));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  try {
    const { offerId, authorName, rating, comment } = await request.json();

    if (!offerId || !authorName || !comment) {
      return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Рейтинг от 1 до 5" }, { status: 400 });
    }

    const newReview = await db
      .insert(reviews)
      .values({
        offerId: parseInt(offerId),
        authorName: authorName.trim().slice(0, 100),
        rating: Math.min(5, Math.max(1, parseInt(rating))),
        comment: comment.trim().slice(0, 2000),
        isApproved: false, // Requires moderation
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Отзыв отправлен на модерацию",
      review: newReview[0],
    });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
