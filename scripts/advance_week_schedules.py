#!/usr/bin/env python3
"""Advance homepage week carousel to 6/8-6/14 and remove past class rows."""
import re
from datetime import date
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
TODAY = date(2026, 6, 7)

MONTHS = {
    "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
    "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12,
}


def parse_camp_date(text: str) -> date | None:
    m = re.search(
        r"(?:Monday, )?(January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2}),? (\d{4})?",
        text,
    )
    if not m:
        return None
    month = MONTHS[m.group(1)]
    day = int(m.group(2))
    year = int(m.group(3)) if m.group(3) else 2026
    return date(year, month, day)


def parse_short_date(text: str) -> date | None:
    m = re.search(r"(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun )?(?:Jun|July) (\d{1,2})", text)
    if m:
        month = 7 if "July" in text else 6
        return date(2026, month, int(m.group(1)))
    m = re.search(r"^(June|July) (\d{1,2})$", text.strip())
    if m:
        month = MONTHS[m.group(1)]
        return date(2026, month, int(m.group(2)))
    return None


def is_past_row(row_html: str) -> bool:
    for pattern in (
        r"<td>([^<]*(?:June|July)[^<]*)</td>",
        r'popup-slot-time">([^<]+)</span>',
        r"Starts Mon ([^<]+)</span>",
    ):
        m = re.search(pattern, row_html)
        if m:
            d = parse_camp_date(m.group(1)) or parse_short_date(m.group(1))
            if d and d <= TODAY:
                return True
    return False


def remove_past_table_rows(html: str) -> str:
    def repl_table(match: re.Match) -> str:
        table = match.group(0)
        rows = re.findall(r"<tr>.*?</tr>", table, flags=re.DOTALL)
        if not rows:
            return table
        kept = [rows[0]]
        for row in rows[1:]:
            if "<th>" in row or not is_past_row(row):
                kept.append(row)
        new_table = re.sub(r"<tr>.*?</tr>", "", table, flags=re.DOTALL)
        insert = "\n".join(kept)
        return new_table.replace("<table", f"<table\n{insert}\n", 1) if kept else table

    # Simpler: process row by row globally for camp-table rows
    def row_repl(m: re.Match) -> str:
        row = m.group(0)
        if "<th>" in row:
            return row
        return "" if is_past_row(row) else row

    return re.sub(r"<tr>.*?</tr>", row_repl, html, flags=re.DOTALL)


def renumber_camp_weeks(html: str) -> str:
    def renumber_table(match: re.Match) -> str:
        table = match.group(0)
        if "Week</th>" not in table and "Week</th>" not in table:
            return table
        n = 0
        def week_repl(m: re.Match) -> str:
            nonlocal n
            n += 1
            return f"<td>{n}</td>"
        return re.sub(r"<td>\d+</td>\s*(?=<td>(?:Monday|June))", week_repl, table)

    return re.sub(r'<table class="camp-table">.*?</table>', renumber_table, html, flags=re.DOTALL)


def remove_jun1_popup_slots(html: str) -> str:
    block = re.compile(
        r'\s*<div class="popup-slot">\s*'
        r'<span class="popup-slot-time">Starts Mon Jun 1, 2026.*?</div>',
        re.DOTALL,
    )
    return block.sub("", html)


SLIDE2 = """                    <!-- Slide 2: All classes for the week of 6/8 -->
                    <div class="popup-carousel-slide" data-slide="1">
                        <div class="popup-image-carousel" data-popup-image-carousel>
                            <div class="popup-image-carousel-viewport">
                                <div class="popup-image-carousel-slide is-active">
                                    <img src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/birthday_party_ducking_gravity.jpg" alt="Birthday party aerial celebration at Ducking Gravity">
                                </div>
                                <div class="popup-image-carousel-slide">
                                    <img src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/yoga_ducking_gravity.jpg" alt="Yoga class at Ducking Gravity studio">
                                </div>
                                <div class="popup-image-carousel-slide">
                                    <img src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/lyra_image_popup.jpg" alt="Lyra aerial hoop class at Ducking Gravity">
                                </div>
                                <div class="popup-image-carousel-slide">
                                    <img src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/coaching_ducking_gravity.jpg" alt="Coach guiding a student on aerial silks at Ducking Gravity">
                                </div>
                            </div>
                            <div class="popup-image-carousel-dots" role="tablist" aria-label="Class images">
                                <button type="button" class="popup-image-carousel-dot is-active" role="tab" aria-selected="true" aria-label="Image 1 of 4"></button>
                                <button type="button" class="popup-image-carousel-dot" role="tab" aria-selected="false" aria-label="Image 2 of 4"></button>
                                <button type="button" class="popup-image-carousel-dot" role="tab" aria-selected="false" aria-label="Image 3 of 4"></button>
                                <button type="button" class="popup-image-carousel-dot" role="tab" aria-selected="false" aria-label="Image 4 of 4"></button>
                            </div>
                        </div>
                        <p class="popup-text"><strong>All classes this week</strong> &mdash; Mon Jun 8 through Sun Jun 14, 2026. Open a menu below to see times and sign up.</p>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Silks Foundations <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Mon Jun 8 &middot; 3:45&ndash;4:45pm</span>
                                    <span class="popup-slot-button full">Class Full</span>
                                </div>
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Tue Jun 9 &middot; 5:30&ndash;6:30pm</span>
                                    <a href="https://smartastro.app/calendar?class=1469" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Tue Jun 9 &middot; 6:45&ndash;7:45pm</span>
                                    <a href="https://smartastro.app/calendar?class=1473" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Thu Jun 11 &middot; 6:45&ndash;7:45pm</span>
                                    <a href="https://smartastro.app/calendar?class=1510" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Lyra Foundations <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Wed Jun 10 &middot; 6:00&ndash;7:00pm</span>
                                    <a href="https://smartastro.app/calendar?class=1491" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Adult Aerials <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Thu Jun 11 &middot; 8:00&ndash;9:00pm</span>
                                    <a href="https://smartastro.app/calendar?class=1515" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Open Aerials <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Wed Jun 10 &middot; 7:00&ndash;8:00pm</span>
                                    <a href="https://smartastro.app/calendar?class=1502" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Mixed Apparatus Foundations <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Tue Jun 9 &middot; 7:30&ndash;8:30am</span>
                                    <a href="https://smartastro.app/calendar?class=1456" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Junior Aerial Classes <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Mon Jun 8 &middot; 5:00&ndash;5:45pm</span>
                                    <a href="https://smartastro.app/calendar?class=1446" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Spin and Swing <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Wed Jun 10 &middot; 5:00&ndash;5:45pm</span>
                                    <a href="https://smartastro.app/calendar?class=1482" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                ACT! Classes <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Mon Jun 8 &middot; 5:45&ndash;7:15pm</span>
                                    <span class="popup-slot-button full">Class Full</span>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Yoga <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Sun Jun 14 &middot; 9:30&ndash;10:30am</span>
                                    <a href="https://smartastro.app/calendar?class=1429" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                            </div>
                        </div>
                    </div>"""

SLIDE3 = """                    <!-- Slide 3: All silks-related classes for the week of 6/8 -->
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
                        <p class="popup-text"><strong>Silks classes this week</strong> &mdash; Mon Jun 8 through Sun Jun 14, 2026. All classes below take place on the aerial silks. Open a menu to see times and sign up. <a href="silks.html" style="color: var(--hyperlink-color); font-weight: 600;">More about silks</a>.</p>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Silks Foundations <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Mon Jun 8 &middot; 3:45&ndash;4:45pm</span>
                                    <span class="popup-slot-button full">Class Full</span>
                                </div>
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Tue Jun 9 &middot; 5:30&ndash;6:30pm</span>
                                    <a href="https://smartastro.app/calendar?class=1469" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Tue Jun 9 &middot; 6:45&ndash;7:45pm</span>
                                    <a href="https://smartastro.app/calendar?class=1473" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Thu Jun 11 &middot; 6:45&ndash;7:45pm</span>
                                    <a href="https://smartastro.app/calendar?class=1510" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Adult Aerials <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Thu Jun 11 &middot; 8:00&ndash;9:00pm</span>
                                    <a href="https://smartastro.app/calendar?class=1515" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                Open Aerials <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Wed Jun 10 &middot; 7:00&ndash;8:00pm</span>
                                    <a href="https://smartastro.app/calendar?class=1502" target="_blank" class="popup-slot-button">Sign up!</a>
                                </div>
                            </div>
                        </div>
                        <div class="popup-dropdown-container">
                            <button class="popup-dropdown-toggle" type="button">
                                ACT! Classes <span class="popup-dropdown-arrow">▼</span>
                            </button>
                            <div class="popup-dropdown-content">
                                <div class="popup-slot">
                                    <span class="popup-slot-time">Mon Jun 8 &middot; 5:45&ndash;7:15pm</span>
                                    <span class="popup-slot-button full">Class Full</span>
                                </div>
                            </div>
                        </div>
                    </div>"""


def update_index(path: Path) -> None:
    html = path.read_text(encoding="utf-8")
    html = remove_jun1_popup_slots(html)
    html = re.sub(
        r"<!-- Slide 2: All classes for the week of 6/1 -->.*?<!-- Slide 3: All silks-related classes for the week of 6/1 -->",
        SLIDE2 + "\n" + "                    <!-- Slide 3: All silks-related classes for the week of 6/8 -->",
        html,
        count=1,
        flags=re.DOTALL,
    )
    html = re.sub(
        r"<!-- Slide 3: All silks-related classes for the week of 6/8 -->.*?<!-- Slide 4: Yoga classes",
        SLIDE3 + "\n                    <!-- Slide 4: Yoga classes",
        html,
        count=1,
        flags=re.DOTALL,
    )
    html = re.sub(
        r'\s*<div class="popup-slot">\s*'
        r'<span class="popup-slot-time">June 7 &middot; Members \$10 / Non-members \$15</span>.*?</div>',
        "",
        html,
        count=1,
        flags=re.DOTALL,
    )
    path.write_text(html, encoding="utf-8", newline="\n")
    print(f"Updated {path.name}")


def update_schedule_page(path: Path) -> None:
    html = path.read_text(encoding="utf-8")
    html = remove_past_table_rows(html)
    path.write_text(html, encoding="utf-8", newline="\n")
    print(f"Updated {path.name}")


def update_camp_page(path: Path) -> None:
    html = path.read_text(encoding="utf-8")
    html = remove_past_table_rows(html)
    html = renumber_camp_weeks(html)
    path.write_text(html, encoding="utf-8", newline="\n")
    print(f"Updated {path.name}")


def update_csv_script() -> None:
    path = PROJECT / "scripts" / "update_schedules_from_csv.py"
    text = path.read_text(encoding="utf-8")
    text = text.replace("CUTOFF = datetime(2026, 6, 1).date()", "CUTOFF = datetime(2026, 6, 8).date()")
    path.write_text(text, encoding="utf-8", newline="\n")
    print("Updated update_schedules_from_csv.py CUTOFF to June 8")


def main():
    update_index(PROJECT / "index.html")
    for name in ("silks.html", "yoga.html", "juniors.html", "mixed-apparatus.html", "lyra.html"):
        update_schedule_page(PROJECT / name)
    for name in ("events.html", "summercamps.html"):
        update_camp_page(PROJECT / name)
    update_csv_script()


if __name__ == "__main__":
    main()
