#!/usr/bin/env python3
"""Add shared nav to subpages and fix missing page-hero sections."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HEADER = (ROOT / "partials" / "subpage-header.html").read_text(encoding="utf-8")
NAV_SCRIPT = '    <script src="js/subpage-nav.js"></script>\n'

OLD_HEADER_RE = re.compile(
    r"    <header class=\"page-header\">.*?</header>\s*",
    re.DOTALL,
)

# Also match headers missing back-link (previous nav-only version)

PAGES = [
    "silks.html",
    "lyra.html",
    "mixed-apparatus.html",
    "homeschool.html",
    "juniors.html",
    "yoga.html",
    "events.html",
    "summercamps.html",
    "memberships.html",
    "birthday.html",
    "birthday-parties.html",
    "404.html",
]


def fix_hero_blocks(text: str) -> str:
    """Move bare h1 (+ optional intro) into page-hero band."""
    after_header = text.split("</header>", 1)
    if len(after_header) > 1 and "page-hero" in after_header[1][:600]:
        return text

    pattern = re.compile(
        r'(</header>\s*)<div class="container">\s*<h1>([^<]+)</h1>\s*'
        r"((?:<p[^>]*>.*?</p>\s*)*)"
        r"</div>",
        re.DOTALL,
    )

    def repl(m):
        intro = m.group(3).strip()
        if intro:
            intro_lines = []
            for p in re.findall(r"<p[^>]*>.*?</p>", intro, re.DOTALL):
                if 'class="page-lead"' not in p:
                    p = re.sub(r"<p", '<p class="page-lead"', p, count=1)
                intro_lines.append("            " + p)
            intro_block = "\n".join(intro_lines) + "\n"
        else:
            intro_block = ""
        return (
            f'{m.group(1)}<div class="page-hero"><div class="container">\n'
            f"            <h1>{m.group(2)}</h1>\n"
            f"{intro_block}"
            f"        </div></div>\n"
        )

    return pattern.sub(repl, text, count=1)


def ensure_nav_script(text: str) -> str:
    if "subpage-nav.js" in text:
        return text
    return text.replace("</body>", NAV_SCRIPT + "</body>", 1)


def main():
    for name in PAGES:
        path = ROOT / name
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        text = OLD_HEADER_RE.sub(HEADER, text, count=1)
        text = fix_hero_blocks(text)
        text = ensure_nav_script(text)
        path.write_text(text, encoding="utf-8")
        print(f"Updated {name}")


if __name__ == "__main__":
    main()
