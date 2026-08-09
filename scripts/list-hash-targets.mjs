import fs from "fs";

const files = fs.readdirSync(".").filter((f) => f.endsWith(".html"));
const hrefs = new Map();

function add(map, key, src) {
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(src);
}

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  for (const m of html.matchAll(/href="(#[^"]+)"/g)) {
    if (m[1] === "#") continue;
    add(hrefs, `${file}${m[1]}`, "same-page-link");
  }
  for (const m of html.matchAll(/href="([^"#]+\.html)(#[^"]+)"/g)) {
    add(hrefs, `${m[1]}${m[2]}`, `from:${file}`);
  }
  for (const m of html.matchAll(/getElementById\('([^']+)'\)\.scrollIntoView/g)) {
    add(hrefs, `${file}#${m[1]}`, "scrollIntoView");
  }
}

const targets = [...hrefs.entries()]
  .map(([target, sources]) => ({ target, sources: [...sources] }))
  .sort((a, b) => a.target.localeCompare(b.target));

console.log(JSON.stringify({ count: targets.length, targets }, null, 2));
