import { NextRequest, NextResponse } from "next/server";

// Маппинг диапазонов IP на регионы (упрощённый вариант)
// В продакшене лучше использовать внешний сервис или базу GeoIP
const GEOLOCATION_SERVICES = [
  "http://ip-api.com/json/{ip}?fields=city,regionName,country&lang=ru",
];

export async function GET(request: NextRequest) {
  try {
    // Получаем IP пользователя
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || 
               request.headers.get("x-real-ip") || 
               "127.0.0.1";

    // Для localhost возвращаем Москву
    if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168") || ip.startsWith("10.")) {
      return NextResponse.json({
        city: "Москва",
        region: "Московская область",
        country: "Россия",
        detected: false,
      });
    }

    // Пробуем определить геолокацию через внешний API
    const url = GEOLOCATION_SERVICES[0].replace("{ip}", ip);
    const geoResponse = await fetch(url, { 
      signal: AbortSignal.timeout(3000),
    });

    if (geoResponse.ok) {
      const data = await geoResponse.json();
      return NextResponse.json({
        city: data.city || "Москва",
        region: data.regionName || "Московская область",
        country: data.country || "Россия",
        detected: true,
      });
    }

    // Fallback
    return NextResponse.json({
      city: "Москва",
      region: "Московская область", 
      country: "Россия",
      detected: false,
    });
  } catch {
    return NextResponse.json({
      city: "Москва",
      region: "Московская область",
      country: "Россия",
      detected: false,
    });
  }
}
