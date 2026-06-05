from pathlib import Path
from PyPDF2 import PdfReader
import json

paths = [
    Path(r"c:\Users\Vitaliy\OneDrive\It_career_hub\Python\проект\DA_PythonFund_ProjectOrg (1).pdf"),
    Path(r"c:\Users\Vitaliy\OneDrive\It_career_hub\Python\проект\DA_Python Fund_Project (5).pdf")
]

out = {}
for p in paths:
    key = p.name
    if not p.exists():
        out[key] = {"error": "file not found", "path": str(p)}
        continue
    try:
        reader = PdfReader(str(p))
        pages_text = []
        for page in reader.pages:
            text = page.extract_text() or ""
            pages_text.append(text)
        full = "\n".join(pages_text)
        # basic stats
        words = len(full.split())
        chars = len(full)
        header = [ln.strip() for ln in full.splitlines() if ln.strip()][:8]
        excerpt = full[:3000]
        # write markdown file
        md_path = p.with_suffix('.md')
        md_path.write_text(full, encoding='utf-8')
        out[key] = {
            "path": str(p),
            "md": str(md_path),
            "chars": chars,
            "words": words,
            "header": header,
            "excerpt": excerpt[:1000]
        }
    except Exception as e:
        out[key] = {"error": str(e)}

summary_path = Path(__file__).with_name('pdf_summary.json')
summary_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(out, ensure_ascii=False))
