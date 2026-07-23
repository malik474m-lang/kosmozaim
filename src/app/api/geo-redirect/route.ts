import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { geoRedirects } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getCountryByIP(ip: string): Promise<string | null> {
  if (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.")
  ) {
    return null;
  }

  try {
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=countryCode`,
      { signal: AbortSignal.timeout(3000) }
    );

    if (response.ok) {
      const data = await response.json();
      return data.countryCode || null;
    }
  } catch (error) {
    console.error("Error fetching geo data:", error);
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip =
      forwarded?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const countryCode = await getCountryByIP(ip);

    if (!countryCode) {
      return NextResponse.json({ redirect: null, country: null });
    }

    // 1. Точное совпадение по стране
    const exactMatch = await db
      .select()
      .from(geoRedirects)
      .where(
        and(
          eq(geoRedirects.countryCode, countryCode),
          eq(geoRedirects.isActive, true)
        )
      )
      .limit(1);

    if (exactMatch.length > 0) {
      const match = exactMatch[0];
      if (match.redirectUrl && match.redirectUrl.trim() !== "") {
        return NextResponse.json({
          redirect: match.redirectUrl,
          country: countryCode,
          countryName: match.countryName,
        });
      }
      // Пустой URL = исключение, не редиректим
      return NextResponse.json({ redirect: null, country: countryCode });
    }

    // 2. Wildcard * = все остальные страны
    const wildcardMatch = await db
      .select()
      .from(geoRedirects)
      .where(
        and(
          eq(geoRedirects.countryCode, "*"),
          eq(geoRedirects.isActive, true)
        )
      )
      .limit(1);

    if (wildcardMatch.length > 0 && wildcardMatch[0].redirectUrl) {
      return NextResponse.json({
        redirect: wildcardMatch[0].redirectUrl,
        country: countryCode,
        countryName: wildcardMatch[0].countryName || countryCode,
      });
    }

    return NextResponse.json({ redirect: null, country: countryCode });
  } catch (error) {
    console.error("Error checking geo redirect:", error);
    return NextResponse.json({ redirect: null, country: null });
  }
}
