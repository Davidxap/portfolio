// Captures one real screenshot of every arcade minigame (the game screen only), the source of the arcade thumbnails.
// Usage: serve out/ on a port, then: PORT=4866 node scripts/capture/games.mjs <out-dir>
// Needs CHROME_SHELL (chrome-headless-shell) and PUPPETEER (puppeteer-core ESM entry) env vars.
const { default: puppeteer } = await import(process.env.PUPPETEER);
const out = process.argv[2];
const base = `http://localhost:${process.env.PORT ?? 4866}`;
// A few inputs per game so each capture shows the minigame mid-action, not an empty start screen.
// Every game opens with its "How to play" panel; it is dismissed first (the .ht-ok button, "Got it").
const scripts = {
  tcg: [["key", "Enter"], ["wait", 1900]],
  ikai: [["click", ".ikai-intro"], ["wait", 900], ["click", ".ikai-intro"], ["wait", 1600], ["key", "ArrowRight"], ["wait", 900]],
  book: [["key", "ArrowDown"], ["wait", 400]],
  eventloop: [["key", "ArrowRight"], ["key", "ArrowRight"], ["key", "ArrowRight"], ["key", "ArrowRight"], ["wait", 1200]],
  zen: [["key", "ArrowRight"], ["wait", 900]],
  forecast: [["wait", 800]],
  films: [["key", "ArrowDown"], ["wait", 600]],
};
const b = await puppeteer.launch({ executablePath: process.env.CHROME_SHELL, args: ["--no-sandbox"] });
for (const [id, steps] of Object.entries(scripts)) {
  const p = await b.newPage();
  // Tall enough that the whole monitor screen sits inside the viewport (a 900px viewport cuts its top edge).
  await p.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 1 });
  await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
  await p.goto(`${base}/arcade/${id}/`, { waitUntil: "networkidle0" });
  // The site chrome (desktop bar, top bar, keycap dock, phone tab bar) floats around the game screen; hide it so the capture shows only the minigame.
  await p.addStyleTag({ content: ".bar, .topbar, .dock, .tabbar { visibility: hidden !important; }" });
  await p.waitForSelector(".cs-screen .dm", { timeout: 15000 });
  await p.evaluate(() => document.querySelector(".cs-screen")?.scrollIntoView({ block: "center" }));
  await new Promise((r) => setTimeout(r, 1200));
  const gotIt = await p.$(".ht-ok");
  if (gotIt) { await gotIt.click(); await new Promise((r) => setTimeout(r, 500)); }
  for (const [kind, v] of steps) {
    if (kind === "wait") await new Promise((r) => setTimeout(r, v));
    else if (kind === "click") { const t = await p.$(v); if (t) await t.click(); }
    else { await p.keyboard.press(v); await new Promise((r) => setTimeout(r, 250)); }
  }
  const el = await p.$(".cs-screen");
  await el.screenshot({ path: `${out}/${id}.png` });
  console.log("captured", id);
  await p.close();
}
await b.close();
