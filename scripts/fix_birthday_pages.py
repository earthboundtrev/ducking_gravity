import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

for name in ("birthday.html", "birthday-parties.html"):
    path = ROOT / name
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8")
    text = re.sub(r"    <style>.*?</style>\s*", "", text, count=1, flags=re.DOTALL)
    text = text.replace(
        "family=Inter:wght@300;400;500;600;700",
        "family=Inter:wght@400;500;600;700",
    )
    if 'href="css/pages.css"' not in text:
        text = text.replace("</head>", '    <link rel="stylesheet" href="css/pages.css">\n</head>', 1)
    path.write_text(text, encoding="utf-8")
    print(f"Fixed {name}")
