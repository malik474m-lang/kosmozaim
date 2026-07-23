import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { geoRedirects } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Внешний API для определения страны по IP
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

// GET - проверить нужен ли редирект для текущего пользователя
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

    const redirect = await db
      .select()
      .from(geoRedirects)
      .where(
        and(
          eq(geoRedirects.countryCode, countryCode),
          eq(geoRedirects.isActive, true)
        )
      )
      .limit(1);

    if (redirect.length > 0) {
      return NextResponse.json({
        redirect: redirect[0].redirectUrl,
        country: countryCode,
        countryName: redirect[0].countryName,
      });
    }

    return NextResponse.json({ redirect: null, country: countryCode });
  } catch (error) {
    console.error("Error checking geo redirect:", error);
    return NextResponse.json({ redirect: null, country: null });
  }
}
