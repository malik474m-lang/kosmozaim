import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { offers } from "@/db/schema";
import { verifySession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { desc } from "drizzle-orm";

export async function GET() {
  const valid = await verifySession();
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const all = await db.select().from(offers).orderBy(desc(offers.createdAt));
  return NextResponse.json(all);
}

export async function POST(request: NextRequest) {
  const valid = await verifySession();
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const slug = slugify(body.title || "offer");

    const newOffer = await db
      .insert(offers)
      .values({
        title: body.title,
        slug: slug + "-" + Date.now(),
        category: body.category,
        amountMin: parseInt(body.amountMin) || 1000,
        amountMax: parseInt(body.amountMax) || 100000,
        termMinDays: parseInt(body.termMinDays) || 1,
        termMaxDays: parseInt(body.termMaxDays) || 365,
        psk: body.psk || "0",
        rate: body.rate || "0",
        freeTermDays: parseInt(body.freeTermDays) || 0,
        logoUrl: body.logoUrl || "",
        affiliateUrl: body.affiliateUrl,
        borrowerCategory: body.borrowerCategory || "any",
        description: body.description || "",
        seoKeywords: body.seoKeywords || "",
        regions: body.regions || "",
        isActive: body.isActive !== false,
        sortOrder: parseInt(body.sortOrder) || 0,
      })
      .returning();

    return NextResponse.json(newOffer[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ошибка создания" }, { status: 500 });
  }
}
