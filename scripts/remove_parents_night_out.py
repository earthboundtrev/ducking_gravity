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
    "<!-- Slide 2: All classes for the week of 6/29 -->",
    "<!-- Slide 1: All classes for the week of 6/29 -->",
    1,
)
index = index.replace(
    '<div class="popup-carousel-slide" data-slide="1" data-smartastro-popup-destination="homepage-all-classes-week">',
    '<div class="popup-carousel-slide active" data-slide="0" data-smartastro-popup-destination="homepage-all-classes-week">',
    1,
)

(ROOT / "index.html").write_text(index, encoding="utf-8")
print("index.html: removed PNO slide")

EMPTY_CAMPS = """        <div class="camp-section">
            <div class="camp-title">Camps &amp; Special Events</div>
            <p style="color: var(--text-dark); font-size: 1.08rem; text-align: center; max-width: 720px; margin: 0 auto;">There are no camps or special events scheduled right now. When new camps, workshops, and events are added, you&rsquo;ll find the dates, details, and registration links right here. In the meantime, explore our ongoing classes below!</p>
        </div>
"""

events = (ROOT / "events.html").read_text(encoding="utf-8")
events, n2 = re.subn(
    r'        <div class="camp-section" id="parents-night-out">.*?(?=\s*<div class="camp-section">)',
    EMPTY_CAMPS,
    events,
    count=1,
    flags=re.DOTALL,
)
if n2 != 1:
    raise SystemExit(f"events.html: expected 1 section removal, got {n2}")
(ROOT / "events.html").write_text(events, encoding="utf-8")
print("events.html: removed PNO section")
