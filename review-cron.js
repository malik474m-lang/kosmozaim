const SECRET = process.env.CRON_SECRET || "kosmozaim-cron-2024";
const COUNT = process.env.REVIEW_COUNT || "2";
async function run() {
  console.log("[" + new Date().toISOString() + "] Generating " + COUNT + " reviews...");
  try {
    const r = await fetch(SITE + "/api/cron/reviews?secret=" + SECRET + "&count=" + COUNT);
    const d = await r.json();
    if (d.success) {
      console.log("[OK] " + d.generated + " reviews:");
      d.results.forEach(function(v) { console.log("  " + v.name + " -> " + v.offer + " (" + v.rating + "/5)"); });
    } else console.log("[ERROR]", d.error);
  } catch(e) { console.error("[ERROR]", e.message); }
}
run();
