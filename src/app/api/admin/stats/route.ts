import { NextResponse } from "next/server";
import { db } from "@/db";
import { offers, clickStats } from "@/db/schema";
import { verifySession } from "@/lib/auth";
import { eq, sql, desc } from "drizzle-orm";

export async function GET() {
  const valid = await verifySession();
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get click counts per offer
  const stats = await db
    .select({
      offerId: clickStats.offerId,
      offerTitle: offers.title,
      clickCount: sql<number>`count(${clickStats.id})::int`,
      lastClick: sql<Date>`max(${clickStats.clickedAt})`,
    })
    .from(clickStats)
    .innerJoin(offers, eq(clickStats.offerId, offers.id))
    .groupBy(clickStats.offerId, offers.title)
    .orderBy(desc(sql`count(${clickStats.id})`));

  // Get total clicks today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayClicks = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clickStats)
    .where(sql`${clickStats.clickedAt} >= ${today}`);

  // Get total clicks this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weekClicks = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clickStats)
    .where(sql`${clickStats.clickedAt} >= ${weekAgo}`);

  // Get total clicks all time
  const totalClicks = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clickStats);

  return NextResponse.json({
    byOffer: stats,
    today: todayClicks[0]?.count || 0,
    week: weekClicks[0]?.count || 0,
    total: totalClicks[0]?.count || 0,
  });
}
