const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { checkRedirect } = require("./geo-check");

const dev = false;
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Auto-review cron
const CRON_SECRET = process.env.CRON_SECRET || "kosmozaim-cron-2024";
const REVIEW_INTERVAL = parseInt(process.env.REVIEW_INTERVAL_HOURS || "4") * 3600000;
const REVIEW_COUNT = process.env.REVIEW_COUNT || "2";

function startReviewCron() {
  setInterval(async () => {
    try {
      const url = "http://127.0.0.1:" + port + "/api/cron/reviews?secret=" + CRON_SECRET + "&count=" + REVIEW_COUNT;
      const r = await fetch(url);
      const d = await r.json();
      if (d.success) console.log("[CRON] Generated " + d.generated + " reviews");
      else console.log("[CRON] Error:", d.error);
    } catch (e) { console.error("[CRON] Failed:", e.message); }
  }, REVIEW_INTERVAL);
  console.log("> Review cron: every " + (REVIEW_INTERVAL/3600000) + "h, " + REVIEW_COUNT + " reviews");
}

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const redirectUrl = await checkRedirect(req);
      if (redirectUrl) {
        res.writeHead(302, { Location: redirectUrl });
        res.end();
        return;
      }
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  }).listen(port, () => {
    console.log("> Ready on http://" + hostname + ":" + port);
    startReviewCron();
  });
});
