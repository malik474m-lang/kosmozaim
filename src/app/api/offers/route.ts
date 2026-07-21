import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { offers } from "@/db/schema";
import { eq, and, gte, lte, or, asc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const amount = searchParams.get("amount");
  const term = searchParams.get("term");
  const borrower = searchParams.get("borrower");
  const city = searchParams.get("city");

  const conditions = [eq(offers.isActive, true)];

  if (category) {
    conditions.push(eq(offers.category, category as "microloans" | "credits" | "credit_cards" | "debit_cards"));
  }

  if (amount) {
    const amountNum = parseInt(amount);
    if (!isNaN(amountNum)) {
      conditions.push(lte(offers.amountMin, amountNum));
      conditions.push(gte(offers.amountMax, amountNum));
    }
  }

  if (term) {
    const termNum = parseInt(term);
    if (!isNaN(termNum)) {
      conditions.push(lte(offers.termMinDays, termNum));
      conditions.push(gte(offers.termMaxDays, termNum));
    }
  }

  if (borrower) {
    conditions.push(
      or(
        eq(offers.borrowerCategory, borrower as "employed" | "unemployed" | "pensioner" | "student" | "self_employed" | "any"),
        eq(offers.borrowerCategory, "any")
      )!
    );
  }

  // Фильтрация по городу/региону
  if (city) {
    // Показываем предложения где regions пустой (для всех) ИЛИ содержит город
    conditions.push(
      or(
        eq(offers.regions, ""),
        sql`${offers.regions} IS NULL`,
        sql`${offers.regions} ILIKE ${"%" + city + "%"}`
      )!
    );
  }

  const results = await db
    .select()
    .from(offers)
    .where(and(...conditions))
    .orderBy(asc(offers.sortOrder));

  return NextResponse.json(results);
}
