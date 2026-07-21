import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, offers } from "@/db/schema";
import { verifySession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const valid = await verifySession();
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const all = await db
    .select({
      id: reviews.id,
      offerId: reviews.offerId,
      offerTitle: offers.title,
      authorName: reviews.authorName,
      rating: reviews.rating,
      comment: reviews.comment,
      isApproved: reviews.isApproved,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .leftJoin(offers, eq(reviews.offerId, offers.id))
    .orderBy(desc(reviews.createdAt));

  return NextResponse.json(all);
}
