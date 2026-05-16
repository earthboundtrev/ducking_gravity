from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIV = "d" + "i" + "v"
MOT = "m" + "o" + "t" + "i" + "o" + "n"

def fix_tags(text: str) -> str:
    text = text.replace("</" + MOT + ">", "</" + DIV + ">")
    text = text.replace("<" + MOT + " class=", "<" + DIV + " class=")
    return text

# --- summercamps.html ---
sc = ROOT / "summercamps.html"
t = fix_tags(sc.read_text(encoding="utf-8"))
stay_july = (
    "                <tr><td>7</td><td>Monday, July 6, 2026</td><td>9:00 AM &ndash; 3:00 PM</td><td>$375</td>"
    '<td><a href="https://smartastro.app/calendar?class=1292" class="info-btn" target="_blank" '
    'data-mobile-label><span>Sign up for this camp!</span></a></td></tr>\n'
    "                <tr><td>8</td><td>Monday, July 13, 2026</td><td>9:00 AM &ndash; 3:00 PM</td><td>$375</td>"
    '<td><span class="info-btn full" data-mobile-label><span>Class Full</span></span></td></tr>\n'
)
needle = (
    "                <tr><td>6</td><td>Monday, June 29, 2026</td><td>9:00 AM &ndash; 3:00 PM</td><td>$375</td>"
    '<td><span class="info-btn full" data-mobile-label><span>Class Full</span></span></td></tr>\n'
    "            </table>"
)
if "July 6, 2026</td><td>9:00 AM &ndash; 3:00 PM</td><td>$375" not in t and needle in t:
    t = t.replace(needle, needle.replace("\n            </table>", "\n" + stay_july + "            </table>", 1), 1)
sc.write_text(t, encoding="utf-8")
print("summercamps.html OK")

# --- events.html ---
ev_path = ROOT / "events.html"
ev = ev_path.read_text(encoding="utf-8")
if "Monday, July 6, 2026" not in ev:
    ev = ev.replace(
        """                <tr>
                    <td>6</td>
                    <td>Monday, June 29, 2026</td>
                    <td>9:00 AM &ndash; 12:00 PM</td>
                    <td>$180</td>
                    <td><span class="info-btn full" data-mobile-label><span>Class Full</span></span></td>
                </tr>
            </table>""",
        """                <tr>
                    <td>6</td>
                    <td>Monday, June 29, 2026</td>
                    <td>9:00 AM &ndash; 12:00 PM</td>
                    <td>$180</td>
                    <td><span class="info-btn full" data-mobile-label><span>Class Full</span></span></td>
                </tr>
                <tr>
                    <td>7</td>
                    <td>Monday, July 6, 2026</td>
                    <td>9:00 AM &ndash; 12:00 PM</td>
                    <td>$180</td>
                    <td><a href="https://smartastro.app/calendar?class=1331" class="info-btn" target="_blank" data-mobile-label><span>Sign up</span></a></td>
                </tr>
                <tr>
                    <td>8</td>
                    <td>Monday, July 13, 2026</td>
                    <td>9:00 AM &ndash; 12:00 PM</td>
                    <td>$180</td>
                    <td><span class="info-btn full" data-mobile-label><span>Class Full</span></span></td>
                </tr>
            </table>""",
        1,
    )
    ev = ev.replace(
        """                <tr>
                    <td>6</td>
                    <td>Monday, June 29, 2026</td>
                    <td>12:00 PM &ndash; 3:00 PM</td>
                    <td>$225</td>
                    <td><span class="info-btn full" data-mobile-label><span>Class Full</span></span></td>
                </tr>
            </table>""",
        """                <tr>
                    <td>6</td>
                    <td>Monday, June 29, 2026</td>
                    <td>12:00 PM &ndash; 3:00 PM</td>
                    <td>$225</td>
                    <td><span class="info-btn full" data-mobile-label><span>Class Full</span></span></td>
                </tr>
                <tr>
                    <td>7</td>
                    <td>Monday, July 6, 2026</td>
                    <td>12:00 PM &ndash; 3:00 PM</td>
                    <td>$225</td>
                    <td><a href="https://smartastro.app/calendar?class=1372" class="info-btn" target="_blank" data-mobile-label><span>Sign up</span></a></td>
                </tr>
                <tr>
                    <td>8</td>
                    <td>Monday, July 13, 2026</td>
                    <td>12:00 PM &ndash; 3:00 PM</td>
                    <td>$225</td>
                    <td><span class="info-btn full" data-mobile-label><span>Class Full</span></span></td>
                </tr>
            </table>""",
        1,
    )
    ev = ev.replace(
        """                <tr>
                    <td>6</td>
                    <td>Monday, June 29, 2026</td>
                    <td>9:00 AM &ndash; 3:00 PM</td>
                    <td>$375</td>
                    <td><span class="info-btn full" data-mobile-label><span>Class Full</span></span></td>
                </tr>
            </table>""",
        """                <tr>
                    <td>6</td>
                    <td>Monday, June 29, 2026</td>
                    <td>9:00 AM &ndash; 3:00 PM</td>
                    <td>$375</td>
                    <td><span class="info-btn full" data-mobile-label><span>Class Full</span></span></td>
                </tr>
                <tr>
                    <td>7</td>
                    <td>Monday, July 6, 2026</td>
                    <td>9:00 AM &ndash; 3:00 PM</td>
                    <td>$375</td>
                    <td><a href="https://smartastro.app/calendar?class=1292" class="info-btn" target="_blank" data-mobile-label><span>Sign up</span></a></td>
                </tr>
                <tr>
                    <td>8</td>
                    <td>Monday, July 13, 2026</td>
                    <td>9:00 AM &ndash; 3:00 PM</td>
                    <td>$375</td>
                    <td><span class="info-btn full" data-mobile-label><span>Class Full</span></span></td>
                </tr>
            </table>""",
        1,
    )
ev_path.write_text(ev, encoding="utf-8")
print("events.html OK")

# --- index.html ---
ix_path = ROOT / "index.html"
ix = fix_tags(ix_path.read_text(encoding="utf-8"))


def pop(time_s, price, btn):
    return (
        '                                <div class="popup-slot">\n'
        f'                                    <span class="popup-slot-time">{time_s} &middot; {price}</span>\n'
        f"                                    {btn}\n"
        "                                </div>\n"
    )


if "Starts Mon Jul 6, 2026" not in ix:
    ix = ix.replace(
        '                                <motion class="popup-slot">\n'
        '                                    <span class="popup-slot-time">Starts Mon Jun 29, 2026 &middot; $180</span>\n'
        '                                    <span class="popup-slot-button full">Class Full</span>\n'
        '                                </div>\n'
        '                            </div>\n'
        '                        </div>\n'
        '                        <div class="popup-dropdown-container">\n'
        '                            <button class="popup-dropdown-toggle" type="button">\n'
        '                                Directed Aerial Exploration!'.replace(
            "<motion", "<" + DIV
        ),
        '                                <div class="popup-slot">\n'
        '                                    <span class="popup-slot-time">Starts Mon Jun 29, 2026 &middot; $180</span>\n'
        '                                    <span class="popup-slot-button full">Class Full</span>\n'
        '                                </div>\n'
        + pop(
            "Starts Mon Jul 6, 2026",
            "$180",
            '<a href="https://smartastro.app/calendar?class=1331" target="_blank" class="popup-slot-button">Sign up!</a>',
        )
        + pop(
            "Starts Mon Jul 13, 2026",
            "$180",
            '<span class="popup-slot-button full">Class Full</span>',
        )
        + '                            </div>\n'
        '                        </div>\n'
        '                        <div class="popup-dropdown-container">\n'
        '                            <button class="popup-dropdown-toggle" type="button">\n'
        '                                Directed Aerial Exploration!',
        1,
    )
    # fallback without motion typo in search string
    ix = ix.replace(
        '                                <motion class="popup-slot">\n'
        '                                    <span class="popup-slot-time">Starts Mon Jun 29, 2026 &middot; $180</span>\n'
        '                                    <span class="popup-slot-button full">Class Full</span>\n'
        '                                </div>\n'
        '                            </div>\n'
        '                        </div>\n'
        '                        <div class="popup-dropdown-container">\n'
        '                            <button class="popup-dropdown-toggle" type="button">\n'
        '                                Directed Aerial Exploration!'.replace("<motion", "<" + DIV),
        "",
        0,
    )

if "Starts Mon Jul 6, 2026" not in ix:
    ix = ix.replace(
        '                                <div class="popup-slot">\n'
        '                                    <span class="popup-slot-time">Starts Mon Jun 29, 2026 &middot; $180</span>\n'
        '                                    <span class="popup-slot-button full">Class Full</span>\n'
        '                                </motion>\n'
        '                            </div>\n'
        '                        </div>\n'
        '                        <div class="popup-dropdown-container">\n'
        '                            <button class="popup-dropdown-toggle" type="button">\n'
        '                                Directed Aerial Exploration!'.replace(
            "</" + MOT + ">", "</" + DIV + ">"
        ),
        '                                <div class="popup-slot">\n'
        '                                    <span class="popup-slot-time">Starts Mon Jun 29, 2026 &middot; $180</span>\n'
        '                                    <span class="popup-slot-button full">Class Full</span>\n'
        '                                </div>\n'
        + pop(
            "Starts Mon Jul 6, 2026",
            "$180",
            '<a href="https://smartastro.app/calendar?class=1331" target="_blank" class="popup-slot-button">Sign up!</a>',
        )
        + pop(
            "Starts Mon Jul 13, 2026",
            "$180",
            '<span class="popup-slot-button full">Class Full</span>',
        )
        + "                            </div>\n"
        "                        </div>\n"
        '                        <motion class="popup-dropdown-container">\n'
        '                            <button class="popup-dropdown-toggle" type="button">\n'
        '                                Directed Aerial Exploration!'.replace(
            "<" + MOT + " class=", "<" + DIV + " class="
        ),
        1,
    )

if "Starts Mon Jul 6, 2026" not in ix:
    ix = ix.replace(
        '                                <div class="popup-slot">\n'
        '                                    <span class="popup-slot-time">Starts Mon Jun 29, 2026 &middot; $225</span>\n'
        '                                    <span class="popup-slot-button full">Class Full</span>\n'
        '                                </div>\n'
        '                            </div>\n'
        '                        </div>\n'
        '                        <div class="popup-dropdown-container">\n'
        '                            <button class="popup-dropdown-toggle" type="button">\n'
        '                                Stay All Day!',
        '                                <div class="popup-slot">\n'
        '                                    <span class="popup-slot-time">Starts Mon Jun 29, 2026 &middot; $225</span>\n'
        '                                    <span class="popup-slot-button full">Class Full</span>\n'
        '                                </div>\n'
        + pop(
            "Starts Mon Jul 6, 2026",
            "$225",
            '<a href="https://smartastro.app/calendar?class=1372" target="_blank" class="popup-slot-button">Sign up!</a>',
        )
        + pop(
            "Starts Mon Jul 13, 2026",
            "$225",
            '<span class="popup-slot-button full">Class Full</span>',
        )
        + "                            </div>\n"
        "                        </div>\n"
        '                        <div class="popup-dropdown-container">\n'
        '                            <button class="popup-dropdown-toggle" type="button">\n'
        '                                Stay All Day!',
        1,
    )

if "Starts Mon Jul 6, 2026 &middot; $375" not in ix:
    ix = ix.replace(
        '                                <div class="popup-slot">\n'
        '                                    <span class="popup-slot-time">Starts Mon Jun 29, 2026 &middot; $375</span>\n'
        '                                    <span class="popup-slot-button full">Class Full</span>\n'
        '                                </div>\n'
        '                            </div>\n'
        '                        </div>\n'
        '                        <div class="popup-dropdown-container">\n'
        '                            <button class="popup-dropdown-toggle" type="button">\n'
        '                                Before care',
        '                                <div class="popup-slot">\n'
        '                                    <span class="popup-slot-time">Starts Mon Jun 29, 2026 &middot; $375</span>\n'
        '                                    <span class="popup-slot-button full">Class Full</span>\n'
        '                                </div>\n'
        + pop(
            "Starts Mon Jul 6, 2026",
            "$375",
            '<a href="https://smartastro.app/calendar?class=1292" target="_blank" class="popup-slot-button">Sign up!</a>',
        )
        + pop(
            "Starts Mon Jul 13, 2026",
            "$375",
            '<span class="popup-slot-button full">Class Full</span>',
        )
        + "                            </div>\n"
        "                        </div>\n"
        '                        <div class="popup-dropdown-container">\n'
        '                            <button class="popup-dropdown-toggle" type="button">\n'
        '                                Before care',
        1,
    )

ix_path.write_text(fix_tags(ix), encoding="utf-8")
print("index.html OK")

# Update schedule script: do not cap at June 30 when replacing in future
sched = ROOT / "scripts" / "update_schedules_from_csv.py"
if sched.exists():
    st = sched.read_text(encoding="utf-8")
    st = st.replace(
        "END = datetime(2026, 6, 30).date()",
        "# Only drop past dates before today; keep future sessions beyond export end.\n"
        "END = datetime(2099, 12, 31).date()",
    )
    sched.write_text(st, encoding="utf-8")
    print("update_schedules_from_csv.py: removed June 30 upper cap")
