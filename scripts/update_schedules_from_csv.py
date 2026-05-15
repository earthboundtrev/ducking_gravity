#!/usr/bin/env python3
"""Update class schedule tables from SmartAstro calendar CSV export."""
import csv
import re
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse, parse_qs

PROJECT = Path(__file__).resolve().parent.parent
CSV_PATH = Path(r"c:\Users\THOMP\Downloads\calendar-export-2026-05-15-to-2026-06-30.csv")
CUTOFF = datetime(2026, 5, 15).date()
# Only drop past dates before today; keep future sessions beyond export end.
END = datetime(2099, 12, 31).date()

# Website section title substring -> CSV Class Name (or list for multi-match)
SECTION_MAP = {
    "Silks Foundations": "Silks Foundations",
    "Adult Aerials": "Adult Aerials",
    "Open Aerials": "Open Aerials",
    "Homeschool Class": "Homeschool Class",
    "ACT! Classes": None,  # special: Session 1 / Session 2
    "Lyra Foundations": "Lyra Foundations",
    "Yoga": "Yoga",
    "Junior Aerial Classes": "Junior Aerials",
    "Spin and Swing Classes": "Spin and Swing",
    "Mixed Apparatus Foundations": "Mixed Apparatus Foundations",
}

PRICE_BY_CLASS = {
    "Silks Foundations": "Members $25 or $100/month<br>Non-members $30",
    "Adult Aerials": "Members $25 or $100/month<br>Non-members $30",
    "Open Aerials": "Free for members<br>Non-members $10",
    "Homeschool Class": "Members $25 or $100/month<br>Non-members $30",
    "ACT! Session 1": "$115/month with ACT membership",
    "ACT! Session 2": "$115/month with ACT membership",
    "Lyra Foundations": "$30",
    "Yoga": "Members $10<br>Non-members $15",
    "Junior Aerials": "Junior membership or $75/month",
    "Spin and Swing": "$60/month or $15/class<br>Non-members $20",
    "Mixed Apparatus Foundations": "Members $25 or $100/month<br>Non-members $30",
}

SIGNUP_LABEL = "Sign up for this class!"


def parse_time(t: str) -> str:
    h, m = map(int, t.split(":"))
    suffix = "am" if h < 12 else "pm"
    h12 = h % 12 or 12
    return f"{h12}:{m:02d}{suffix}"


def fmt_time_range(start: str, end: str) -> str:
    return f"{parse_time(start)} - {parse_time(end)}"


def fmt_date(d: datetime) -> str:
    months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ]
    return f"{months[d.month - 1]} {d.day}"


def schedule_id_from_link(link: str) -> str:
    if not link:
        return ""
    q = parse_qs(urlparse(link).query)
    return q.get("class", [""])[0]


def btn_cell(row: dict, use_full_red: bool = False) -> str:
    is_full = (row.get("Is Full") or "").strip().lower() == "yes"
    sid = schedule_id_from_link(row.get("Link", ""))
    if is_full:
        if use_full_red:
            return '<td><span class="info-btn full" data-mobile-label><span>Class Full</span></span></td>'
        return '<td><a href="#" class="info-btn disabled" data-mobile-label><span>Class Full</span></a></td>'
    return (
        f'<td><a href="https://smartastro.app/calendar?class={sid}" class="info-btn" '
        f'target="_blank" data-mobile-label><span>{SIGNUP_LABEL}</span></a></td>'
    )


def load_csv():
    rows = []
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            raw_date = (row.get("Date") or "").strip()
            if not raw_date or not re.match(r"^\d{4}-\d{2}-\d{2}$", raw_date):
                continue
            try:
                d = datetime.strptime(raw_date, "%Y-%m-%d").date()
            except ValueError:
                continue
            if d < CUTOFF or d > END:
                continue
            name = (row.get("Class Name") or "").strip()
            if name in ("Studio Closed",):
                continue
            rows.append(row)
    return rows


def sort_key(row):
    d = datetime.strptime(row["Date"], "%Y-%m-%d")
    st = row.get("Start Time", "")
    return (d, st)


def build_standard_rows(class_name: str, sessions: list, use_full_red: bool = False) -> str:
    price = PRICE_BY_CLASS[class_name]
    lines = ['                <tr><th>Dates</th><th>Time</th><th>Price</th><th>Sign up</th></tr>\n']
    for row in sorted(sessions, key=sort_key):
        d = datetime.strptime(row["Date"], "%Y-%m-%d")
        date_s = fmt_date(d)
        time_s = fmt_time_range(row["Start Time"], row["End Time"])
        cell = btn_cell(row, use_full_red)
        lines.append(
            f"                <tr><td>{date_s}</td><td>{time_s}</td><td>{price}</td>{cell}</tr>\n"
        )
    return "".join(lines)


def build_act_rows(sessions: list) -> str:
    lines = ['                <tr><th>Session</th><th>Dates</th><th>Time</th><th>Price</th><th>Sign up</th></tr>\n']
    for row in sorted(sessions, key=sort_key):
        name = row["Class Name"]
        session = "Session 1" if "Session 1" in name else "Session 2"
        d = datetime.strptime(row["Date"], "%Y-%m-%d")
        date_s = fmt_date(d)
        time_s = fmt_time_range(row["Start Time"], row["End Time"])
        price = PRICE_BY_CLASS[name]
        btn = btn_cell(row).replace("<td>", "", 1).replace("</td>", "", 1)
        lines.append(
            f'                <tr><td>{session}</td><td>{date_s}</td><td>{time_s}</td><td>{price}</td><td>{btn}</td></tr>\n'
        )
    return "".join(lines)


def replace_table_after_title(html: str, title_marker: str, new_rows: str) -> str:
    """Find camp-title containing title_marker, then replace table content."""
    idx = html.find(title_marker)
    if idx == -1:
        raise ValueError(f"Section not found: {title_marker}")
    table_start = html.find('<table class="camp-table">', idx)
    if table_start == -1:
        raise ValueError(f"Table not found after {title_marker}")
    header_end = html.find("</tr>", table_start) + len("</tr>")
    # include newline after header
    if html[header_end:header_end + 1] == "\n":
        header_end += 1
    table_end = html.find("</table>", table_start)
    return html[:table_start] + "<table class=\"camp-table\">\n" + new_rows + "            </table>" + html[table_end + len("</table>"):]


def main():
    all_rows = load_csv()
    by_class = {}
    for row in all_rows:
        by_class.setdefault(row["Class Name"], []).append(row)

    updates = [
        ("silks.html", "Silks Foundations", "Silks Foundations", False),
        ("silks.html", "Adult Aerials", "Adult Aerials", False),
        ("silks.html", "Open Aerials", "Open Aerials", False),
        ("silks.html", "Homeschool Class", "Homeschool Class", False),
        ("lyra.html", "Lyra Foundations", "Lyra Foundations", False),
        ("yoga.html", "Yoga", "Yoga", False),
        ("juniors.html", "Junior Aerial Classes", "Junior Aerials", False),
        ("juniors.html", "Spin and Swing Classes", "Spin and Swing", False),
        ("juniors.html", "Open Aerials", "Open Aerials", False),
        ("mixed-apparatus.html", "Mixed Apparatus Foundations", "Mixed Apparatus Foundations", False),
        ("homeschool.html", "Homeschool Class", "Homeschool Class", False),
    ]

    for fname, marker, csv_name, _ in updates:
        path = PROJECT / fname
        html = path.read_text(encoding="utf-8")
        sessions = by_class.get(csv_name, [])
        new_rows = build_standard_rows(csv_name, sessions)
        html = replace_table_after_title(html, marker, new_rows)
        path.write_text(html, encoding="utf-8", newline="\n")
        print(f"Updated {fname} / {marker}: {len(sessions)} sessions")

    # silks.html ACT
    path = PROJECT / "silks.html"
    html = path.read_text(encoding="utf-8")
    act_rows = by_class.get("ACT! Session 1", []) + by_class.get("ACT! Session 2", [])
    new_rows = build_act_rows(act_rows)
    html = replace_table_after_title(html, "ACT! Classes", new_rows)
    path.write_text(html, encoding="utf-8", newline="\n")
    print(f"Updated silks.html ACT: {len(act_rows)} sessions")

    # silks.html also has homeschool/open in same file - already done

    # Report classes with no page
    for name in sorted(by_class):
        if name not in PRICE_BY_CLASS and not name.startswith("ACT"):
            if any(x in name for x in ["Soar", "Stay", "Directed", "Before", "After", "Parents"]):
                continue
            print(f"Note: {name} has {len(by_class[name])} sessions (may be camp/event only)")


if __name__ == "__main__":
    main()
