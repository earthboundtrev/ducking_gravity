import { chromium } from "playwright";

/**
 * Verify class-page section jump links clear the sticky header across viewports.
 * Tests both hash navigation and clicking .section-jump-links buttons.
 */

const HASH_TARGETS = [
  ["silks.html", "#foundations-section"],
  ["silks.html", "#adult-aerials-section"],
  ["silks.html", "#open-aerials-section"],
  ["silks.html", "#act-section"],
  ["silks.html", "#class-info"],
  ["juniors.html", "#juniors-section"],
  ["juniors.html", "#spin-swing-section"],
  ["juniors.html", "#open-aerials-section"],
  ["juniors.html", "#class-info"],
  ["lyra.html", "#foundations-section"],
  ["lyra.html", "#class-info"],
];

const CLICK_PAGES = ["silks.html", "juniors.html", "lyra.html"];

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 900 },
];

const BASE = "http://localhost:4173";

function maxGapFor(hash) {
  // Near-top tables can leave a larger gap after header shrink.
  return /foundations-section|juniors-section/.test(hash) ? 80 : 56;
}

async function measureGap(page, sel) {
  return page.evaluate((selector) => {
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
      gapBelowHeader: Math.round(sr.top - hr.bottom),
      scrollY: Math.round(window.scrollY),
    };
  }, sel);
}

async function waitForGap(page, sel, { minGap = 8, maxGap = 56, timeoutMs = 4000 } = {}) {
  const start = Date.now();
  let last = null;
  while (Date.now() - start < timeoutMs) {
    last = await measureGap(page, sel);
    if (!last.error && last.gapBelowHeader >= minGap && last.gapBelowHeader <= maxGap) {
      return last;
    }
    await page.waitForTimeout(150);
  }
  return last;
}

async function checkHash(page, path, hash) {
  await page.goto(`${BASE}/${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(120);
  await page.evaluate((h) => {
    history.replaceState(null, "", location.pathname);
    location.hash = h;
  }, hash);
  return waitForGap(page, hash, { maxGap: maxGapFor(hash) });
}

async function checkClicks(page, path) {
  await page.goto(`${BASE}/${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(120);

  // Start from the Info section so the jump links are in use like a real user.
  await page.evaluate(() => {
    document.getElementById("class-info")?.scrollIntoView({ behavior: "auto", block: "start" });
  });
  await page.waitForTimeout(200);

  const hrefs = await page.$$eval(".section-jump-links a.info-btn[href^='#']", (as) =>
    as.map((a) => a.getAttribute("href")),
  );

  const results = {};
  for (const href of hrefs) {
    await page.evaluate(() => {
      document.getElementById("class-info")?.scrollIntoView({ behavior: "auto", block: "start" });
    });
    await page.waitForTimeout(120);
    await page.click(`.section-jump-links a.info-btn[href="${href}"]`);
    results[href] = await waitForGap(page, href, { maxGap: maxGapFor(href) });
  }

  // Back to Top should land near scrollY 0 (smooth scroll needs time on tall pages).
  const topBtn = await page.$(".section-jump-links a.back-to-top-btn");
  if (topBtn) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(120);
    await topBtn.click();
    const start = Date.now();
    let scrollY = Number.POSITIVE_INFINITY;
    while (Date.now() - start < 5000) {
      scrollY = await page.evaluate(() => Math.round(window.scrollY));
      if (scrollY <= 8) break;
      await page.waitForTimeout(100);
    }
    results["back-to-top"] = { scrollY };
  }

  return results;
}

const browser = await chromium.launch({ headless: true });
const report = {};
const failures = [];

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
  });
  report[vp.name] = { hash: {}, click: {} };

  for (const [path, hash] of HASH_TARGETS) {
    const key = `${path}${hash}`;
    const result = await checkHash(page, path, hash);
    report[vp.name].hash[key] = result;
    if (result?.error) {
      failures.push(`${vp.name} hash ${key}: ${result.error}`);
    } else if (
      result.gapBelowHeader < 8 ||
      result.gapBelowHeader > maxGapFor(hash)
    ) {
      failures.push(
        `${vp.name} hash ${key}: gap=${result.gapBelowHeader} (want 8-${maxGapFor(hash)})`,
      );
    }
  }

  for (const path of CLICK_PAGES) {
    const clickResults = await checkClicks(page, path);
    report[vp.name].click[path] = clickResults;
    for (const [href, result] of Object.entries(clickResults)) {
      if (href === "back-to-top") {
        if (result.scrollY > 8) {
          failures.push(`${vp.name} click ${path} back-to-top: scrollY=${result.scrollY}`);
        }
        continue;
      }
      if (result?.error) {
        failures.push(`${vp.name} click ${path}${href}: ${result.error}`);
      } else if (
        result.gapBelowHeader < 8 ||
        result.gapBelowHeader > maxGapFor(href)
      ) {
        failures.push(
          `${vp.name} click ${path}${href}: gap=${result.gapBelowHeader} (want 8-${maxGapFor(href)})`,
        );
      }
    }
  }

  await page.close();
}

console.log(JSON.stringify(report, null, 2));
if (failures.length) {
  console.error("FAIL\n" + failures.join("\n"));
  process.exitCode = 1;
} else {
  const hashCount = VIEWPORTS.length * HASH_TARGETS.length;
  console.log(
    `PASS: ${VIEWPORTS.length} viewports × ${HASH_TARGETS.length} hash anchors + click jumps on ${CLICK_PAGES.join(", ")}`,
  );
  console.log(`(${hashCount} hash checks + click/back-to-top checks all cleared sticky header)`);
}

await browser.close();
