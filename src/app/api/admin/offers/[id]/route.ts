import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { offers } from "@/db/schema";
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
      .update(offers)
      .set({
        title: body.title,
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
        isActive: body.isActive,
        sortOrder: parseInt(body.sortOrder) || 0,
        updatedAt: new Date(),
      })
      .where(eq(offers.id, parseInt(id)))
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
    await db.delete(offers).where(eq(offers.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
