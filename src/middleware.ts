import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/api/") || path.startsWith("/admin") || path.startsWith("/_next/") || path.startsWith("/favicon") || path.startsWith("/images/")) {
    return NextResponse.next();
  }
  const dismissed = request.cookies.get("geo_redirect_dismissed");
  if (dismissed) return NextResponse.next();
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168") || ip.startsWith("10.") || ip.startsWith("172.")) {
    return NextResponse.next();
  }
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, { signal: AbortSignal.timeout(3000) });
    if (!geoRes.ok) return NextResponse.next();
    const geoData = await geoRes.json();
    const country = geoData.countryCode;
    if (!country) return NextResponse.next();
    const baseUrl = request.nextUrl.origin;
    const apiRes = await fetch(`${baseUrl}/api/geo-redirect?cc=${country}`, { signal: AbortSignal.timeout(3000) });
    if (!apiRes.ok) return NextResponse.next();
    const data = await apiRes.json();
    if (data.redirect) return NextResponse.redirect(data.redirect);
  } catch {
    return NextResponse.next();
  }
  return NextResponse.next();
}

