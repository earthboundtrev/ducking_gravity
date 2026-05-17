from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LINKS = """    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/site.css">
    <link rel="stylesheet" href="css/pages.css">"""

for path in ROOT.glob("*.html"):
    if path.name == "index.html":
        continue
    text = path.read_text(encoding="utf-8")
    if 'href="css/site.css"' in text:
        continue
    if 'href="css/pages.css"' not in text:
        continue
    text = text.replace('<link rel="stylesheet" href="css/pages.css">', LINKS, 1)
    path.write_text(text, encoding="utf-8")
    print("fixed", path.name)
