"""Remove passed Parents' Night Out from popup and events page."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent

index = (ROOT / "index.html").read_text(encoding="utf-8")

pno_slide = re.compile(
    r"\s*<!-- Slide 1: Parents Night Out \(manual promo\) -->.*?"
    r"(?=                    <!-- Slide \d+:)",
    re.DOTALL,
)
index, n = pno_slide.subn("\n", index, count=1)
if n != 1:
    raise SystemExit(f"index.html: expected 1 PNO slide removal, got {n}")

index = index.replace(
    "<!-- Slide 2: Aerial Photography (manual promo) -->",
    "<!-- Slide 1: Aerial Photography (manual promo) -->",
    1,
)
index = index.replace(
    '<div class="popup-carousel-slide" data-slide="1">',
    '<div class="popup-carousel-slide active" data-slide="0">',
    1,
)
index = index.replace(
    "<!-- Slide 3: All classes for the week of 6/29 -->",
    "<!-- Slide 2: All classes for the week of 6/29 -->",
    1,
)
index = index.replace(
    '<div class="popup-carousel-slide" data-slide="2" data-smartastro-popup-destination="homepage-all-classes-week">',
    '<div class="popup-carousel-slide" data-slide="1" data-smartastro-popup-destination="homepage-all-classes-week">',
    1,
)

(ROOT / "index.html").write_text(index, encoding="utf-8")
print("index.html: removed PNO slide")

events = (ROOT / "events.html").read_text(encoding="utf-8")
events, n2 = re.subn(
    r'        <div class="camp-section" id="parents-night-out">.*?(?=\s*<div class="camp-section")',
    "",
    events,
    count=1,
    flags=re.DOTALL,
)
if n2 != 1:
    raise SystemExit(f"events.html: expected 1 section removal, got {n2}")
(ROOT / "events.html").write_text(events, encoding="utf-8")
print("events.html: removed PNO section")
