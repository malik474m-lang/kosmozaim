import { NextResponse } from "next/server";
import { db } from "@/db";
import { offers, clickStats } from "@/db/schema";
import { verifySession } from "@/lib/auth";
import { eq, sql, desc } from "drizzle-orm";

export async function GET() {
  const valid = await verifySession();
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const stats = await db.select({ offerId: clickStats.offerId, offerTitle: offers.title, clickCount: sql<number>`cast(count(${clickStats.id}) as unsigned)`, lastClick: sql<string>`max(${clickStats.clickedAt})` }).from(clickStats).innerJoin(offers, eq(clickStats.offerId, offers.id)).groupBy(clickStats.offerId, offers.title).orderBy(desc(sql`count(${clickStats.id})`));
    const todayClicks = await db.select({ count: sql<number>`cast(count(*) as unsigned)` }).from(clickStats).where(sql`DATE(${clickStats.clickedAt}) = CURDATE()`);
    const weekClicks = await db.select({ count: sql<number>`cast(count(*) as unsigned)` }).from(clickStats).where(sql`${clickStats.clickedAt} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);
    const totalClicks = await db.select({ count: sql<number>`cast(count(*) as unsigned)` }).from(clickStats);
    return NextResponse.json({ byOffer: stats, today: todayClicks[0]?.count || 0, week: weekClicks[0]?.count || 0, total: totalClicks[0]?.count || 0 });
  } catch (e) { console.error("Stats error:", e); return NextResponse.json({ error: "Ошибка загрузки" }, { status: 500 }); }
}
