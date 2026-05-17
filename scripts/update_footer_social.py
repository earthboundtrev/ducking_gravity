#!/usr/bin/env python3
"""Replace footer social icon markup with brand-colored SVGs from partials/footer-social-links.html."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PARTIAL = ROOT / "partials" / "footer-social-links.html"
SNIPPET = PARTIAL.read_text(encoding="utf-8").strip()

OLD_PATTERN = re.compile(
    r'<div class="social-links">\s*'
    r'<a href="https://www\.facebook\.com/profile\.php\?id=61557121516331"[^>]*>.*?</a>\s*'
    r'<a href="https://instagram\.com/duckinggravity"[^>]*>.*?</a>\s*'
    r'</div>',
    re.DOTALL | re.IGNORECASE,
)

# Also match broken index.html closing
OLD_PATTERN_LOOSE = re.compile(
    r'<div class="social-links">.*?</div>\s*(?:</a>\s*</motion.div>|</div>)',
    re.DOTALL | re.IGNORECASE,
)


def main() -> None:
    updated = 0
    for path in sorted(ROOT.glob("*.html")):
        text = path.read_text(encoding="utf-8")
        if "social-links" not in text:
            continue
        new_text, n = OLD_PATTERN.subn(SNIPPET, text, count=1)
        if n == 0:
            new_text, n = OLD_PATTERN_LOOSE.subn(SNIPPET, text, count=1)
        if n:
            path.write_text(new_text, encoding="utf-8")
            updated += 1
            print(f"Updated {path.name}")
        else:
            print(f"No match: {path.name}")
    print(f"Done. {updated} file(s) updated.")


if __name__ == "__main__":
    main()
