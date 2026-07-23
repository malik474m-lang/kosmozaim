import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { geoRedirects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const cc = request.nextUrl.searchParams.get("cc");
    if (!cc) return NextResponse.json({ redirect: null, country: null });
    const countryCode = cc.toUpperCase();
    const exactMatch = await db.select().from(geoRedirects).where(and(eq(geoRedirects.countryCode, countryCode), eq(geoRedirects.isActive, true))).limit(1);
    if (exactMatch.length > 0) {
      const match = exactMatch[0];
      if (match.redirectUrl && match.redirectUrl.trim() !== "") {
        return NextResponse.json({ redirect: match.redirectUrl, country: countryCode, countryName: match.countryName });
      }
      return NextResponse.json({ redirect: null, country: countryCode });
    }
    const wildcardMatch = await db.select().from(geoRedirects).where(and(eq(geoRedirects.countryCode, "*"), eq(geoRedirects.isActive, true))).limit(1);
    if (wildcardMatch.length > 0 && wildcardMatch[0].redirectUrl) {
      return NextResponse.json({ redirect: wildcardMatch[0].redirectUrl, country: countryCode, countryName: wildcardMatch[0].countryName || countryCode });
    }
    return NextResponse.json({ redirect: null, country: countryCode });
  } catch (error) {
    console.error("Error checking geo redirect:", error);
    return NextResponse.json({ redirect: null, country: null });
  }
}
