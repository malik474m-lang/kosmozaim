const { createServer } = require("http");
const { parse } = require("url");
const { exec } = require("child_process");
const next = require("next");
const { checkRedirect } = require("./geo-check");

const dev = false;
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const REVIEW_INTERVAL_HOURS = parseInt(process.env.REVIEW_INTERVAL_HOURS || "4", 10);
const REVIEW_COUNT = parseInt(process.env.REVIEW_COUNT || "2", 10);
const REVIEW_INTERVAL_MS = REVIEW_INTERVAL_HOURS * 60 * 60 * 1000;

function runReviewCron() {
  const envLoader = "export $(cat .env | grep -v '^#' | xargs)";
  const command = `${envLoader} && node review-cron.js ${REVIEW_COUNT}`;

  exec(command, { cwd: process.cwd(), shell: "/bin/bash" }, (error, stdout, stderr) => {
    const ts = new Date().toISOString();

    if (stdout) {
      console.log(`[REVIEW-CRON ${ts}] ${stdout.trim()}`);
    }

    if (stderr) {
      console.error(`[REVIEW-CRON ${ts} STDERR] ${stderr.trim()}`);
    }

    if (error) {
      console.error(`[REVIEW-CRON ${ts} ERROR] ${error.message}`);
      return;
    }

    console.log(
      `[REVIEW-CRON ${ts}] completed: ${REVIEW_COUNT} review(s), every ${REVIEW_INTERVAL_HOURS}h`
    );
  });
}

function startReviewCron() {
  console.log(
    `> Review auto-generation enabled: every ${REVIEW_INTERVAL_HOURS}h, ${REVIEW_COUNT} review(s)`
  );

  setTimeout(() => {
    runReviewCron();
  }, 30000);

  setInterval(() => {
    runReviewCron();
  }, REVIEW_INTERVAL_MS);
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
    console.log(`> Ready on http://${hostname}:${port}`);
    startReviewCron();
  });
});
