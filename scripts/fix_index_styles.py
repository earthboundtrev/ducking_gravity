import re
from pathlib import Path

path = Path(__file__).resolve().parent.parent / "index.html"
text = path.read_text(encoding="utf-8")
text = re.sub(
    r"  <style>.*?</style>\s*",
    '  <link rel="stylesheet" href="css/site.css">\n  <link rel="stylesheet" href="css/popup.css">\n',
    text,
    count=1,
    flags=re.DOTALL,
)
text = text.replace(
    "family=Inter:wght@300;400;500;600;700",
    "family=Inter:wght@400;500;600;700",
)
path.write_text(text, encoding="utf-8")
print("Removed inline styles from index.html")
