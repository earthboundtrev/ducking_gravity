"""Remove passed Parents' Night Out from popup and events page."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent

index = (ROOT / "index.html").read_text(encoding="utf-8")
index = index.replace("<motion.div", "<motion.div").replace("</motion.div>", "</motion.div>")
index = index.replace("<motion.div", "<motion").replace("</motion.div>", "</motion>")
# normalize accidental motion.* tags
index = index.replace("<motion", "<div").replace("</motion>", "</div>")

pno_slide = re.compile(
    r"\s*<!-- Slide 2: Parents.*?Night Out -->.*?"
    r"</div>\s*\n\s*<!-- Slide 3: Soar The Sky with Baskets and Pie -->",
    re.DOTALL,
)
index, n = pno_slide.subn(
    "\n                    <!-- Slide 2: Soar The Sky with Baskets and Pie -->",
    index,
    count=1,
)
if n != 1:
    raise SystemExit(f"index.html: expected 1 PNO slide removal, got {n}")

marker = '<div class="popup-carousel-container">'
start = index.find(marker)
end = index.find(
    '<button class="popup-carousel-arrow popup-carousel-arrow-right"',
    start,
)
chunk = index[start:end]
slide_num = 0

def renumber(_match):
    global slide_num
    value = f'data-slide="{slide_num}"'
    slide_num += 1
    return value

chunk = re.sub(r'data-slide="\d+"', renumber, chunk)
index = index[:start] + chunk + index[end:]

(ROOT / "index.html").write_text(index, encoding="utf-8")
print("index.html: removed PNO slide")

events = (ROOT / "events.html").read_text(encoding="utf-8")
events, n2 = re.subn(
    r'\s*<div class="camp-section" id="parents-night-out">.*?</div>\s*\n',
    "\n",
    events,
    count=1,
    flags=re.DOTALL,
)
if n2 != 1:
    raise SystemExit(f"events.html: expected 1 section removal, got {n2}")
(ROOT / "events.html").write_text(events, encoding="utf-8")
print("events.html: removed PNO section")
