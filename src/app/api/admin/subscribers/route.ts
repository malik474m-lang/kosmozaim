import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { verifySession } from "@/lib/auth";
import { desc } from "drizzle-orm";

export async function GET() {
  const valid = await verifySession();
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const all = await db
    .select()
    .from(subscribers)
    .orderBy(desc(subscribers.subscribedAt));

  return NextResponse.json(all);
}
