import { chromium } from "playwright";

const TARGETS = [
  ["index.html", "#about"],
  ["index.html", "#services"],
  ["index.html", "#contact"],
  ["silks.html", "#class-info"],
  ["silks.html", "#foundations-section"],
  ["silks.html", "#adult-aerials-section"],
  ["silks.html", "#open-aerials-section"],
  ["silks.html", "#act-section"],
  ["juniors.html", "#class-info"],
  ["juniors.html", "#juniors-section"],
  ["juniors.html", "#spin-swing-section"],
  ["juniors.html", "#open-aerials-section"],
  ["memberships.html", "#fp1-aerial-silks"],
  ["memberships.html", "#fp2-act"],
  ["lyra.html", "#class-info"],
  ["lyra.html", "#foundations-section"],
  ["summercamps.html", "#camp-info"],
];

async function closePopup(page) {
  await page.evaluate(() => {
    const popup = document.getElementById("electAerialsPopup");
    if (popup) popup.style.display = "none";
  });
}

async function check(page, path, hash) {
  await page.goto(`http://localhost:4173/${path}`, { waitUntil: "domcontentloaded" });
  await closePopup(page);
  await page.evaluate((h) => {
    history.replaceState(null, "", location.pathname);
    location.hash = h;
  }, hash);
  const start = Date.now();
  let last = null;
  while (Date.now() - start < 4000) {
    last = await page.evaluate((sel) => {
      const header = document.querySelector(".site-header, .page-header");
      const section = document.querySelector(sel);
      const hr = header.getBoundingClientRect();
      const sr = section.getBoundingClientRect();
      return {
        headerHeight: Math.round(hr.height),
        gapBelowHeader: Math.round(sr.top - hr.bottom),
        compact: header.classList.contains("is-compact"),
      };
    }, hash);
    if (last.gapBelowHeader >= 8 && last.gapBelowHeader <= 80) return last;
    await page.waitForTimeout(150);
  }
  return last;
}

const browser = await chromium.launch({ headless: true });
const viewports = [
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const report = {};
const failures = [];

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  report[vp.name] = {};
  for (const [path, hash] of TARGETS) {
    const key = `${path}${hash}`;
    const result = await check(page, path, hash);
    report[vp.name][key] = result;
    if (!result || result.gapBelowHeader < 8 || result.gapBelowHeader > 80) {
      failures.push(`${vp.name} ${key} gap=${result?.gapBelowHeader}`);
    }
  }
  await page.close();
}

console.log(JSON.stringify(report, null, 2));
if (failures.length) {
  console.error("FAIL\n" + failures.join("\n"));
  process.exit(1);
}
console.log(`PASS: ${viewports.length} viewports x ${TARGETS.length} anchors`);
await browser.close();
