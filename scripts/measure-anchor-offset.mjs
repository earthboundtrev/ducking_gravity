import { chromium } from "playwright";

const TARGETS = [
  "index.html#about",
  "index.html#services",
  "index.html#contact",
  "juniors.html#class-info",
  "juniors.html#juniors-section",
  "juniors.html#open-aerials-section",
  "lyra.html#class-info",
  "lyra.html#foundations-section",
  "silks.html#class-info",
  "silks.html#open-aerials-section",
  "silks.html#foundations-section",
  "silks.html#act-section",
  "mixed-apparatus.html#class-info",
  "summercamps.html#camp-info",
  "summercamps.html#jr-camp-section",
  "summercamps.html#directed-section",
  "summercamps.html#stay-all-day-section",
  "memberships.html#fp1-aerial-silks",
  "memberships.html#fp2-act",
  "memberships.html#lyra-membership",
  "memberships.html#junior-membership",
  "memberships.html#spin-and-swing-membership",
];

async function closePopup(page) {
  await page.evaluate(() => {
    const popup = document.getElementById("electAerialsPopup");
    if (popup) popup.style.display = "none";
  });
}

async function waitForAnchorSettle(page, sel, { minGap = 8, maxGap = 56, timeoutMs = 4000 } = {}) {
  const start = Date.now();
  let last = null;
  while (Date.now() - start < timeoutMs) {
    last = await page.evaluate((selector) => {
      const header = document.querySelector(".site-header, .page-header");
      const section = document.querySelector(selector);
      if (!header || !section) {
        return { error: !header ? "missing-header" : "missing-target", sel: selector };
      }
      const hr = header.getBoundingClientRect();
      const sr = section.getBoundingClientRect();
      return {
        sel: selector,
        headerHeight: Math.round(hr.height),
        compact: header.classList.contains("is-compact"),
        sectionTop: Math.round(sr.top),
        gapBelowHeader: Math.round(sr.top - hr.bottom),
        scrollY: Math.round(window.scrollY),
      };
    }, sel);

    if (!last.error && last.gapBelowHeader >= minGap && last.gapBelowHeader <= maxGap) {
      return last;
    }
    await page.waitForTimeout(150);
  }
  return last;
}

async function measureTarget(page, pagePath, hash) {
  await page.goto(`http://localhost:4173/${pagePath}`, { waitUntil: "domcontentloaded" });
  await closePopup(page);
  await page.waitForTimeout(150);
  await page.evaluate((h) => {
    // Force hashchange even if navigating to the same fragment twice in tests.
    history.replaceState(null, "", location.pathname);
    location.hash = h;
  }, hash);
  // Near-top sections can land with a slightly larger visual gap after header shrink.
  const maxGap = /foundations-section|juniors-section|jr-camp-section|fp1-aerial-silks/.test(hash)
    ? 80
    : 56;
  return waitForAnchorSettle(page, hash, { maxGap });
}

async function measureTop(page) {
  await page.goto("http://localhost:4173/memberships.html", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    document.querySelector('a[href="#top"]').click();
  });
  await page.waitForTimeout(1100);
  return page.evaluate(() => ({
    sel: "#top",
    scrollY: Math.round(window.scrollY),
    compact: document.querySelector(".page-header")?.classList.contains("is-compact"),
  }));
}

async function measureNavClick(page) {
  await page.goto("http://localhost:4173/index.html", { waitUntil: "domcontentloaded" });
  await closePopup(page);
  await page.evaluate(() => document.querySelector('.site-nav a[href="#services"]').click());
  return waitForAnchorSettle(page, "#services");
}

async function measureInfoButton(page) {
  await page.goto("http://localhost:4173/silks.html", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.querySelector('button.info-btn[onclick*="class-info"]').click());
  return waitForAnchorSettle(page, "#class-info");
}

async function measureCrossPage(page) {
  await page.goto("http://localhost:4173/silks.html", { waitUntil: "domcontentloaded" });
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    page.evaluate(() => {
      document.querySelector('a[href="index.html#services"]').click();
    }),
  ]);
  await closePopup(page);
  await page.waitForTimeout(200);
  // Correct again after popup close / layout settle.
  await page.evaluate(() => {
    location.hash = "#services";
  });
  const settled = await waitForAnchorSettle(page, "#services");
  return {
    ...settled,
    sel: "cross-page-index#services",
    path: await page.evaluate(() => location.pathname + location.hash),
  };
}

const browser = await chromium.launch({ headless: true });
const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });

const results = {};
for (const target of TARGETS) {
  const [pagePath, hash] = target.split("#");
  results[target] = await measureTarget(desktop, pagePath, `#${hash}`);
}

results["memberships.html#top"] = await measureTop(desktop);
results["nav-click#services"] = await measureNavClick(desktop);
results["info-button#class-info"] = await measureInfoButton(desktop);
results["cross-page#services"] = await measureCrossPage(desktop);
results["mobile#services"] = await measureTarget(mobile, "index.html", "#services");
results["mobile#fp1"] = await measureTarget(mobile, "memberships.html", "#fp1-aerial-silks");

console.log(JSON.stringify(results, null, 2));

const failures = [];
for (const [key, m] of Object.entries(results)) {
  if (m.error) {
    failures.push(`${key}:${m.error}`);
    continue;
  }
  if (key.endsWith("#top")) {
    if (m.scrollY > 8) failures.push(`${key}:scrollY=${m.scrollY}`);
    continue;
  }
  const maxGap = /foundations-section|juniors-section|jr-camp-section|fp1-aerial-silks/.test(key)
    ? 80
    : 56;
  if (m.gapBelowHeader < 8 || m.gapBelowHeader > maxGap) {
    failures.push(`${key}:gap=${m.gapBelowHeader}`);
  }
}

if (failures.length) {
  console.error("FAIL count=" + failures.length);
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`PASS: ${Object.keys(results).length} anchor checks cleared sticky header`);
await browser.close();
