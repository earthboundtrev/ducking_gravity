const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const PROJECT_ROOT = path.resolve(__dirname, "..");

function htmlFilesWithSocialLinks() {
  const roots = [
    ...fs.readdirSync(PROJECT_ROOT).filter((name) => name.endsWith(".html")),
    path.join("partials", "footer-social-links.html"),
  ];
  return roots
    .map((name) => {
      const filePath = path.isAbsolute(name) ? name : path.join(PROJECT_ROOT, name);
      const html = fs.readFileSync(filePath, "utf8");
      return { name, html };
    })
    .filter(({ html }) => html.includes('class="social-links"'));
}

test("every footer social row includes TikTok @duckinggravity (#28)", () => {
  const files = htmlFilesWithSocialLinks();
  assert.ok(files.length >= 11, "expected social-links on public pages plus the footer partial");

  for (const { name, html } of files) {
    assert.match(html, /class="social-links"/, `${name} is missing the social-links row`);
    assert.match(
      html,
      /href="https:\/\/www\.tiktok\.com\/@duckinggravity"/,
      `${name} is missing the TikTok profile link`,
    );
    assert.match(html, /aria-label="TikTok"/, `${name} is missing the TikTok aria-label`);
    assert.match(html, /instagram\.com\/duckinggravity/, `${name} dropped the Instagram footer link`);
    assert.match(html, /facebook\.com/, `${name} dropped the Facebook footer link`);
    assert.doesNotMatch(
      html,
      /href="https:\/\/(?:www\.)?tiktok\.com\/duckinggravity"/,
      `${name} uses a TikTok URL without @, which is not a profile link`,
    );
  }
});
