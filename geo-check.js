const mysql = require("mysql2/promise");

let pool = null;
function getPool() {
  if (!pool) pool = mysql.createPool(process.env.DATABASE_URL);
  return pool;
}

async function getCountry(ip) {
  try {
    const r = await fetch("http://ip-api.com/json/" + ip + "?fields=countryCode", { signal: AbortSignal.timeout(3000) });
    if (r.ok) { const d = await r.json(); return d.countryCode || null; }
  } catch {}
  return null;
}

async function checkRedirect(req) {
  try {
    const url = req.url || "/";
    if (url.startsWith("/api/") || url.startsWith("/admin") || url.startsWith("/_next/") || url.includes(".")) return null;

    const fwd = req.headers["x-forwarded-for"];
    const ip = (fwd ? fwd.split(",")[0].trim() : null) || req.headers["x-real-ip"] || req.socket.remoteAddress || "127.0.0.1";
    if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168") || ip.startsWith("10.")) return null;

    const country = await getCountry(ip);
    if (!country) return null;

    const db = getPool();
    const [exact] = await db.query("SELECT redirect_url, country_name FROM geo_redirects WHERE country_code = ? AND is_active = 1 LIMIT 1", [country]);
    if (exact.length > 0) {
      if (exact[0].redirect_url && exact[0].redirect_url.trim()) return exact[0].redirect_url;
      return null;
    }

    const [wild] = await db.query("SELECT redirect_url FROM geo_redirects WHERE country_code = \"*\" AND is_active = 1 LIMIT 1");
    if (wild.length > 0 && wild[0].redirect_url) return wild[0].redirect_url;

    return null;
  } catch (e) {
    console.error("geo-check error:", e.message);
    return null;
  }
}

module.exports = { checkRedirect };
