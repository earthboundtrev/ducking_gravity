#!/usr/bin/env python3
"""Advance homepage week carousel and remove past class rows from schedule pages."""
import re
from datetime import date
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
TODAY = date(2026, 6, 26)

MONTHS = {
    "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
    "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12,
}


def parse_short_date(text: str) -> date | None:
    m = re.search(r"(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun )?(?:Jun|July|Jul) (\d{1,2})", text)
    if m:
        month = 7 if ("July" in text or "Jul " in text) else 6
        return date(2026, month, int(m.group(1)))
    m = re.search(r"^(June|July) (\d{1,2})$", text.strip())
    if m:
        return date(2026, MONTHS[m.group(1)], int(m.group(2)))
    return None


def is_past_row(row_html: str) -> bool:
    if "<th>" in row_html:
        return False
    for pattern in (
        r"<td>([^<]*(?:June|July)[^<]*)</td>",
        r'popup-slot-time">([^<]+)</span>',
    ):
        m = re.search(pattern, row_html)
        if m:
            d = parse_short_date(m.group(1))
            if d and d <= TODAY:
                return True
    return False


def remove_past_table_rows(html: str) -> str:
    def row_repl(m: re.Match) -> str:
        return "" if is_past_row(m.group(0)) else m.group(0)

    return re.sub(r"<tr>.*?</tr>", row_repl, html, flags=re.DOTALL)


SLIDE2 = """                    <!-- Slide 2: All classes for the week of 6/29 -->
                    <div class="popup-carousel-slide" data-slide="1">
                        <div class="popup-image-carousel" data-popup-image-carousel>
                            <div class="popup-image-carousel-viewport">
                                <div class="popup-image-carousel-slide is-active">
                                    <img src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/birthday_party_ducking_gravity.jpg" alt="Birthday party aerial celebration at Ducking Gravity">
                                </div>
                                <div class="popup-image-carousel-slide">
                                    <img src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/lyra_image_popup.jpg" alt="Lyra aerial hoop class at Ducking Gravity">
                                </div>
                                <div class="popup-image-carousel-slide">
                                    <img src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/coaching_ducking_gravity.jpg" alt="Coach guiding a student on aerial silks at Ducking Gravity">
                                </div>
                            </div>
                            <div class="popup-image-carousel-dots" role="tablist" aria-label="Class images">
                                <button type="button" class="popup-image-carousel-dot is-active" role="tab" aria-selected="true" aria-label="Image 1 of 3"></button>
                                <button type="button" class="popup-image-carousel-dot" role="tab" aria-selected="false" aria-label="Image 2 of 3"></button>
                                <button type="button" class="popup-image-carousel-dot" role="tab" aria-selected="false" aria-label="Image 3 of 3"></button>
                            </div>
                        </div>
                        <p class="popup-text"><strong>All classes this week</strong> &mdash; Mon Jun 29 through Fri Jul 3, 2026. Open a menu below to see times and sign up.</p>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Silks Foundations <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Mon Jun 29 &middot; 3:45&ndash;4:45pm</span>
                                    <span class="popup-slot-button full">Class Full</span>
                                </div>
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Tue Jun 30 &middot; 6:45&ndash;7:45pm</span>
                                    <a href="https://smartastro.app/calendar?class=1478" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Thu Jul 2 &middot; 6:45&ndash;7:45pm</span>
                                    <span class="popup-slot-button full">Class Full</span>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Adult Aerials <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Thu Jul 2 &middot; 8:00&ndash;9:00pm</span>
                                    <a href="https://smartastro.app/calendar?class=1518" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Open Aerials <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Wed Jul 1 &middot; 7:00&ndash;8:00pm</span>
                                    <a href="https://smartastro.app/calendar?class=1503" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Mixed Apparatus Foundations <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Tue Jun 30 &middot; 7:30&ndash;8:30am</span>
                                    <a href="https://smartastro.app/calendar?class=1459" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Tue Jun 30 &middot; 9:30&ndash;10:30am</span>
                                    <a href="https://smartastro.app/calendar?class=1526" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Junior Aerial Classes <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Mon Jun 29 &middot; 5:00&ndash;5:45pm</span>
                                    <span class="popup-slot-button full">Class Full</span>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Spin and Swing <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Wed Jul 1 &middot; 5:00&ndash;5:45pm</span>
                                    <a href="https://smartastro.app/calendar?class=1487" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                ACT! Classes <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Mon Jun 29 &middot; 5:45&ndash;7:15pm</span>
                                    <span class="popup-slot-button full">Class Full</span>
                                </div>
                            </div>
                        </div>
                    </div>"""

SLIDE3 = """                    <!-- Slide 3: All silks-related classes for the week of 6/29 -->
                    <div class="popup-carousel-slide" data-slide="2">
                        <div class="popup-image-carousel" data-popup-image-carousel>
                            <div class="popup-image-carousel-viewport">
                                <div class="popup-image-carousel-slide is-active">
                                    <img src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/birthday_party_ducking_gravity.jpg" alt="Birthday party aerial silks celebration at Ducking Gravity">
                                </div>
                                <div class="popup-image-carousel-slide">
                                    <img src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/coaching_ducking_gravity.jpg" alt="Coach guiding a student on aerial silks at Ducking Gravity">
                                </div>
                            </div>
                            <div class="popup-image-carousel-dots" role="tablist" aria-label="Silks images">
                                <button type="button" class="popup-image-carousel-dot is-active" role="tab" aria-selected="true" aria-label="Image 1 of 2"></button>
                                <button type="button" class="popup-image-carousel-dot" role="tab" aria-selected="false" aria-label="Image 2 of 2"></button>
                            </div>
                        </div>
                        <p class="popup-text"><strong>Silks classes this week</strong> &mdash; Mon Jun 29 through Fri Jul 3, 2026. All classes below take place on the aerial silks. Open a menu to see times and sign up. <a href="silks.html" style="color: var(--hyperlink-color); font-weight: 600;">More about silks</a>.</p>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Silks Foundations <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Mon Jun 29 &middot; 3:45&ndash;4:45pm</span>
                                    <span class="popup-slot-button full">Class Full</span>
                                </div>
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Tue Jun 30 &middot; 6:45&ndash;7:45pm</span>
                                    <a href="https://smartastro.app/calendar?class=1478" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Thu Jul 2 &middot; 6:45&ndash;7:45pm</span>
                                    <span class="popup-slot-button full">Class Full</span>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Adult Aerials <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Thu Jul 2 &middot; 8:00&ndash;9:00pm</span>
                                    <a href="https://smartastro.app/calendar?class=1518" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Open Aerials <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Wed Jul 1 &middot; 7:00&ndash;8:00pm</span>
                                    <a href="https://smartastro.app/calendar?class=1503" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                ACT! Classes <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Mon Jun 29 &middot; 5:45&ndash;7:15pm</span>
                                    <span class="popup-slot-button full">Class Full</span>
                                </div>
                            </div>
                        </div>
                    </div>"""


def remove_past_lyra_popup_slots(html: str) -> str:
    block = re.compile(
        r'\s*<div class="popup-slot">\s*'
        r'<span class="popup-slot-time">June (?:[1-9]|1[0-9]|2[0-6]) &middot; Members.*?</div>',
        re.DOTALL,
    )
    return block.sub("", html)


def mark_july2_silks_full(html: str) -> str:
    old = (
        '<tr><td>July 2</td><td>6:45pm - 7:45pm</td><td>Members $25 or $100/month<br>Non-members $30</td>'
        '<td><a href="https://smartastro.app/calendar?class=1508" class="info-btn" target="_blank" data-mobile-label>'
        '<span>Sign up for this class!</span></a></td></tr>'
    )
    new = (
        '<tr><td>July 2</td><td>6:45pm - 7:45pm</td><td>Members $25 or $100/month<br>Non-members $30</td>'
        '<td><span class="info-btn full" data-mobile-label><span>Class Full</span></span></td></tr>'
    )
    return html.replace(old, new)


def update_index(path: Path) -> None:
    html = path.read_text(encoding="utf-8")
    html = re.sub(
        r"<!-- Slide 2: All classes for the week of 6/\d+ -->.*?<!-- Slide 3: All silks-related classes for the week of 6/\d+ -->",
        SLIDE2 + "\n" + "                    <!-- Slide 3: All silks-related classes for the week of 6/29 -->",
        html,
        count=1,
        flags=re.DOTALL,
    )
    html = re.sub(
        r"<!-- Slide 3: All silks-related classes for the week of 6/\d+ -->.*?<!-- Slide 4: Lyra -->",
        SLIDE3 + "\n                    <!-- Slide 4: Lyra -->",
        html,
        count=1,
        flags=re.DOTALL,
    )
    html = remove_past_lyra_popup_slots(html)
    path.write_text(html, encoding="utf-8", newline="\n")
    print(f"Updated {path.name}")


def update_schedule_page(path: Path) -> None:
    html = path.read_text(encoding="utf-8")
    html = remove_past_table_rows(html)
    if path.name == "silks.html":
        html = mark_july2_silks_full(html)
    path.write_text(html, encoding="utf-8", newline="\n")
    print(f"Updated {path.name}")


def update_csv_script() -> None:
    path = PROJECT / "scripts" / "update_schedules_from_csv.py"
    text = path.read_text(encoding="utf-8")
    text = re.sub(
        r"CUTOFF = datetime\(2026, 6, \d+\)\.date\(\)",
        "CUTOFF = datetime(2026, 6, 27).date()",
        text,
    )
    path.write_text(text, encoding="utf-8", newline="\n")
    print("Updated update_schedules_from_csv.py CUTOFF to June 27")


def main():
    update_index(PROJECT / "index.html")
    for name in ("silks.html", "juniors.html", "mixed-apparatus.html", "lyra.html"):
        update_schedule_page(PROJECT / name)
    update_csv_script()


if __name__ == "__main__":
    main()
