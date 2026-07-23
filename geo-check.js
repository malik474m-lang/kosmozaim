const mysql = require("mysql2/promise");

let pool = null;
const cache = new Map();
const CACHE_TTL = 600000;

function getPool() {
  if (!pool) pool = mysql.createPool(process.env.DATABASE_URL);
  return pool;
}

async function getCountry(ip) {
  const cached = cache.get("ip:" + ip);
  if (cached && Date.now() - cached.t < CACHE_TTL) return cached.v;
  try {
    const r = await fetch("http://ip-api.com/json/" + ip + "?fields=countryCode", { signal: AbortSignal.timeout(2000) });
    if (r.ok) { const d = await r.json(); const cc = d.countryCode || null; cache.set("ip:" + ip, { v: cc, t: Date.now() }); return cc; }
  } catch {}
  return null;
}

let rulesCache = null;
let rulesCacheTime = 0;

async function getRules() {
  if (rulesCache && Date.now() - rulesCacheTime < 60000) return rulesCache;
  const db = getPool();
  const [rows] = await db.query("SELECT country_code, redirect_url FROM geo_redirects WHERE is_active = 1");
  rulesCache = rows;
  rulesCacheTime = Date.now();
  return rows;
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

    const rules = await getRules();
    const exact = rules.find(r => r.country_code === country);
    if (exact) {
      if (exact.redirect_url && exact.redirect_url.trim()) return exact.redirect_url;
      return null;
    }
    const wild = rules.find(r => r.country_code === "*");
    if (wild && wild.redirect_url) return wild.redirect_url;
    return null;
  } catch (e) {
    console.error("geo-check error:", e.message);
    return null;
  }
}

module.exports = { checkRedirect };
