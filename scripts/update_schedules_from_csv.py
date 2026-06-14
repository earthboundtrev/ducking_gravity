#!/usr/bin/env python3
"""Update class schedule tables from SmartAstro calendar CSV or XLSX export."""
import csv
import re
import shutil
import sys
import zipfile
from datetime import datetime
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from xml.etree import ElementTree as ET

PROJECT = Path(__file__).resolve().parent.parent
DEFAULT_EXPORT = Path(
    r"c:\Users\THOMP\Downloads\calendar-export-2026-06-08-to-2026-07-31.csv"
)
CUTOFF = datetime(2026, 6, 14).date()
END = datetime(2026, 7, 31).date()

SKIP_CLASSES = {"Studio Closed", "Kids and Family Expo"}

PRICE_BY_CLASS = {
    "Silks Foundations": "Members $25 or $100/month<br>Non-members $30",
    "Adult Aerials": "Members $25 or $100/month<br>Non-members $30",
    "Open Aerials": "Free for members<br>Non-members $10",
    "ACT! Session 1": "$115/month with ACT membership",
    "Lyra Foundations": "$30",
    "Junior Aerials": "Junior membership or $75/month",
    "Spin and Swing": "$60/month or $15/class<br>Non-members $20",
    "Mixed Apparatus Foundations": "Members $25 or $100/month<br>Non-members $30",
}

SIGNUP_LABEL = "Sign up for this class!"


def parse_time(t: str) -> str:
    t = str(t).strip()
    if not t:
        return ""
    parts = t.split(":")
    h, m = int(parts[0]), int(parts[1]) if len(parts) > 1 else 0
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


def is_full(row: dict) -> bool:
    val = row.get("Is Full")
    if val is None:
        return False
    return str(val).strip().lower() in ("yes", "true", "1")


def schedule_id_from_link(link: str) -> str:
    if not link:
        return ""
    q = parse_qs(urlparse(str(link)).query)
    return q.get("class", [""])[0]


def btn_cell(row: dict, use_full_red: bool = False) -> str:
    sid = schedule_id_from_link(row.get("Link", ""))
    if is_full(row):
        if use_full_red:
            return '<td><span class="info-btn full" data-mobile-label><span>Class Full</span></span></td>'
        return '<td><a href="#" class="info-btn disabled" data-mobile-label><span>Class Full</span></a></td>'
    return (
        f'<td><a href="https://smartastro.app/calendar?class={sid}" class="info-btn" '
        f'target="_blank" data-mobile-label><span>{SIGNUP_LABEL}</span></a></td>'
    )


def _xlsx_sheet_path(z: zipfile.ZipFile, sheet_name: str = "Calendar Data") -> str:
    NS_MAIN = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    NS_PKG = {"r": "http://schemas.openxmlformats.org/package/2006/relationships"}
    RID = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
    wb = ET.fromstring(z.read("xl/workbook.xml"))
    rid = None
    for sheet in wb.findall("m:sheets/m:sheet", NS_MAIN):
        if sheet.get("name") == sheet_name:
            rid = sheet.get(RID)
            break
    if not rid:
        raise ValueError(f"Sheet not found: {sheet_name}")
    rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
    target = None
    for rel in rels.findall("r:Relationship", NS_PKG):
        if rel.get("Id") == rid:
            target = rel.get("Target")
            break
    if not target:
        raise ValueError(f"No relationship for {rid}")
    return "xl/" + target.lstrip("/")


def _col_index(ref: str) -> int:
    n = 0
    for ch in ref:
        n = n * 26 + (ord(ch) - 64)
    return n - 1


def load_xlsx(path: Path) -> list[dict]:
    NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    with zipfile.ZipFile(path) as z:
        shared: list[str] = []
        if "xl/sharedStrings.xml" in z.namelist():
            sroot = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in sroot.findall("m:si", NS):
                shared.append("".join((n.text or "") for n in si.iter()))

        sheet_xml = _xlsx_sheet_path(z)
        sheet = ET.fromstring(z.read(sheet_xml))
        raw_rows: list[dict[int, str]] = []
        for row_el in sheet.findall("m:sheetData/m:row", NS):
            cells: dict[int, str] = {}
            for cell in row_el.findall("m:c", NS):
                m = re.match(r"([A-Z]+)", cell.get("r", ""))
                if not m:
                    continue
                v = cell.find("m:v", NS)
                if v is None or v.text is None:
                    continue
                val = v.text
                if cell.get("t") == "s":
                    val = shared[int(val)]
                cells[_col_index(m.group(1))] = val
            if cells:
                raw_rows.append(cells)

    if not raw_rows:
        return []
    headers = {i: raw_rows[0][i] for i in raw_rows[0]}
    out = []
    for cells in raw_rows[1:]:
        row = {headers[i]: cells.get(i, "") for i in headers}
        if not _keep_row(row):
            continue
        out.append(_normalize_row(row))
    return out


def stage_export(path: Path) -> Path:
    """Copy Downloads export locally so reads are reliable (OneDrive paths can hang)."""
    staged = PROJECT / "scripts" / "_calendar_export_staged.xlsx"
    if path.suffix.lower() in (".xlsx", ".xlsm"):
        shutil.copy2(path, staged)
        return staged
    return path


def load_csv(path: Path) -> list[dict]:
    out = []
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if not _keep_row(row):
                continue
            out.append(_normalize_row(row))
    return out


def _normalize_row(row: dict) -> dict:
    """Ensure string fields and consistent Is Full / Link."""
    normalized = {}
    for k, v in row.items():
        if v is None:
            normalized[k] = ""
        elif isinstance(v, datetime):
            normalized[k] = v.strftime("%Y-%m-%d")
        else:
            normalized[k] = str(v).strip() if isinstance(v, (int, float)) else str(v).strip()
    if normalized.get("Is Full", "").lower() in ("false", "no", "0"):
        normalized["Is Full"] = "No"
    elif normalized.get("Is Full", "").lower() in ("true", "yes", "1"):
        normalized["Is Full"] = "Yes"
    return normalized


def _keep_row(row: dict) -> bool:
    raw_date = (row.get("Date") or "").strip()
    if not raw_date or not re.match(r"^\d{4}-\d{2}-\d{2}$", raw_date):
        return False
    try:
        d = datetime.strptime(raw_date, "%Y-%m-%d").date()
    except ValueError:
        return False
    if d < CUTOFF or d > END:
        return False
    name = (row.get("Class Name") or "").strip()
    if name in SKIP_CLASSES:
        return False
    return True


def load_export(path: Path) -> list[dict]:
    if path.suffix.lower() in (".xlsx", ".xlsm"):
        return load_xlsx(path)
    return load_csv(path)


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


def build_act_rows(sessions: list, use_full_red: bool = True) -> str:
    lines = ['                <tr><th>Session</th><th>Dates</th><th>Time</th><th>Price</th><th>Sign up</th></tr>\n']
    price = PRICE_BY_CLASS["ACT! Session 1"]
    for row in sorted(sessions, key=sort_key):
        d = datetime.strptime(row["Date"], "%Y-%m-%d")
        date_s = fmt_date(d)
        time_s = fmt_time_range(row["Start Time"], row["End Time"])
        btn = btn_cell(row, use_full_red).replace("<td>", "", 1).replace("</td>", "", 1)
        lines.append(
            f'                <tr><td>Session 1</td><td>{date_s}</td><td>{time_s}</td><td>{price}</td><td>{btn}</td></tr>\n'
        )
    return "".join(lines)


def replace_table_after_title(html: str, title_marker: str, new_rows: str) -> str:
    idx = html.find(title_marker)
    if idx == -1:
        raise ValueError(f"Section not found: {title_marker}")
    table_start = html.find('<table class="camp-table">', idx)
    if table_start == -1:
        raise ValueError(f"Table not found after {title_marker}")
    table_end = html.find("</table>", table_start)
    return (
        html[:table_start]
        + '<table class="camp-table">\n'
        + new_rows
        + "            </table>"
        + html[table_end + len("</table>") :]
    )


def main():
    export_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_EXPORT
    if not export_path.exists():
        print(f"Export not found: {export_path}")
        sys.exit(1)

    load_path = stage_export(export_path) if export_path.suffix.lower() in (".xlsx", ".xlsm") else export_path
    print(f"Loading {export_path} (dates on or after {CUTOFF})")
    all_rows = load_export(load_path)
    by_class: dict[str, list] = {}
    for row in all_rows:
        by_class.setdefault(row["Class Name"], []).append(row)

    # (file, section marker, csv class name, use_full_red for Class Full styling)
    updates = [
        ("silks.html", "Silks Foundations", "Silks Foundations", True),
        ("silks.html", "Adult Aerials", "Adult Aerials", True),
        ("silks.html", "Open Aerials", "Open Aerials", True),
        ("lyra.html", "Lyra Foundations", "Lyra Foundations", False),
        ("juniors.html", "Junior Aerial Classes", "Junior Aerials", False),
        ("juniors.html", "Spin and Swing Classes", "Spin and Swing", False),
        ("juniors.html", "Open Aerials", "Open Aerials", False),
        ("mixed-apparatus.html", "Mixed Apparatus Foundations", "Mixed Apparatus Foundations", False),
    ]

    for fname, marker, csv_name, use_full_red in updates:
        path = PROJECT / fname
        html = path.read_text(encoding="utf-8")
        sessions = by_class.get(csv_name, [])
        new_rows = build_standard_rows(csv_name, sessions, use_full_red)
        html = replace_table_after_title(html, marker, new_rows)
        path.write_text(html, encoding="utf-8", newline="\n")
        print(f"Updated {fname} / {marker}: {len(sessions)} sessions")

    path = PROJECT / "silks.html"
    html = path.read_text(encoding="utf-8")
    act_rows = by_class.get("ACT! Session 1", [])
    new_rows = build_act_rows(act_rows, use_full_red=True)
    html = replace_table_after_title(html, "ACT! Classes", new_rows)
    path.write_text(html, encoding="utf-8", newline="\n")
    print(f"Updated silks.html ACT: {len(act_rows)} sessions")

    camp_skip = ("Soar", "Stay", "Directed", "Before", "After", "Parents", "Baskets")
    for name in sorted(by_class):
        if name not in PRICE_BY_CLASS and not name.startswith("ACT"):
            if any(x in name for x in camp_skip):
                continue
            print(f"Note: {name} has {len(by_class[name])} sessions (not mapped to a schedule page)")


if __name__ == "__main__":
    main()
