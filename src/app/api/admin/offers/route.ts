import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { offers } from "@/db/schema";
import { verifySession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { desc } from "drizzle-orm";

export async function GET() {
  const valid = await verifySession();
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const all = await db.select().from(offers).orderBy(desc(offers.createdAt));
  return NextResponse.json(all);
}

export async function POST(request: NextRequest) {
  const valid = await verifySession();
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const slug = slugify(body.title || "offer") + "-" + Date.now();
    await db.insert(offers).values({ title: body.title, slug, category: body.category, amountMin: parseInt(body.amountMin) || 1000, amountMax: parseInt(body.amountMax) || 100000, termMinDays: parseInt(body.termMinDays) || 1, termMaxDays: parseInt(body.termMaxDays) || 365, psk: body.psk || "0", rate: body.rate || "0", freeTermDays: parseInt(body.freeTermDays) || 0, logoUrl: body.logoUrl || "", affiliateUrl: body.affiliateUrl, borrowerCategory: body.borrowerCategory || "any", description: body.description || "", seoKeywords: body.seoKeywords || "", regions: body.regions || "", isActive: body.isActive !== false, sortOrder: parseInt(body.sortOrder) || 0 });
    const inserted = await db.select().from(offers).orderBy(desc(offers.id)).limit(1);
    return NextResponse.json(inserted[0]);
  } catch (e) { console.error(e); return NextResponse.json({ error: "Ошибка" }, { status: 500 }); }
}
