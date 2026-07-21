import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { offers, clickStats } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const offerId = parseInt(id);

    if (isNaN(offerId)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const offer = await db
      .select()
      .from(offers)
      .where(eq(offers.id, offerId))
      .limit(1);

    if (offer.length === 0 || !offer[0].affiliateUrl) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Track the click
    await db.insert(clickStats).values({
      offerId,
      userAgent: request.headers.get("user-agent") || "",
      referer: request.headers.get("referer") || "",
    });

    // Return an intermediate HTML page that:
    // 1. Tells search engines not to index or follow
    // 2. Does a JS redirect (invisible to crawlers)
    // 3. Shows a nofollow meta-refresh as fallback
    const targetUrl = offer[0].affiliateUrl;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="robots" content="noindex, nofollow">
  <meta http-equiv="refresh" content="0;url=${escapeHtml(targetUrl)}">
  <title>Переход на сайт партнёра</title>
  <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc;color:#64748b;}</style>
</head>
<body>
  <p>Переход на сайт партнёра...</p>
  <script>window.location.replace(${JSON.stringify(targetUrl)});</script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
