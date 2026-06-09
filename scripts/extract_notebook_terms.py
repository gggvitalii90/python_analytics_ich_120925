"""
Extract all identifiers from course notebooks, then check which have reference cards.
This gives real coverage: what the course actually teaches vs what cards exist.
"""
from __future__ import annotations
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
REFS = ROOT / "docs" / "references"

# Load all reference terms
all_terms: set[str] = set()
for f in sorted(REFS.glob("*.json")):
    data = json.loads(f.read_text(encoding="utf-8"))
    for c in data.get("references", []):
        for t in c.get("terms", []) + c.get("aliases", []):
            all_terms.add(t.lower().strip())

# Extract identifiers from notebooks
# Patterns: function calls, method calls, imports
PATTERNS = [
    re.compile(r"\bimport\s+([\w.]+)"),            # import X
    re.compile(r"\bfrom\s+([\w.]+)\s+import"),      # from X import
    re.compile(r"\b([\w]+)\s*\("),                  # function/method calls
    re.compile(r"\.([\w]+)\s*\("),                  # .method()
    re.compile(r"\b([\w]+)\s*="),                   # variable assignments (catches common ones)
]

IGNORE = {
    # Python keywords
    "if", "else", "elif", "for", "while", "return", "def", "class", "with",
    "try", "except", "finally", "import", "from", "as", "in", "not", "and",
    "or", "is", "True", "False", "None", "pass", "break", "continue", "raise",
    "yield", "lambda", "del", "assert", "global", "nonlocal",
    # Single letters
    "x", "y", "z", "i", "j", "k", "n", "f", "s", "t", "v", "a", "b", "c",
    # Library aliases
    "df", "ax", "fig", "plt", "pd", "np", "sns", "px", "go", "pl",
    # Common builtins
    "print", "len", "range", "list", "dict", "set", "str", "int", "float",
    "bool", "type", "isinstance", "super", "self", "cls", "open", "zip",
    "enumerate", "map", "filter", "sorted", "reversed", "sum", "min", "max",
    # Generic variable names students use
    "data", "result", "results", "value", "values", "row", "rows", "col",
    "cols", "name", "names", "label", "labels", "item", "items", "key",
    "keys", "index", "text", "line", "lines", "path", "file", "files",
    "model", "models", "output", "outputs", "input", "inputs", "params",
    "age", "city", "price", "score", "sales", "user", "users", "id",
    "numbers", "words", "book", "books", "work", "fruits", "total",
    "my_dict", "my_list", "temp", "tmp", "num", "count", "size",
    # Plot parameters (not searchable concepts)
    "color", "alpha", "marker", "linestyle", "linewidth", "edgecolor",
    "cmap", "palette", "hue", "width", "height", "figsize", "bins",
    "kind", "how", "axis", "inplace", "ascending", "encoding", "sep",
    # Other noise
    "display", "execute", "connect", "close", "cursor", "div",
    "start", "end", "interval", "alias", "include", "over",
    "when", "then", "lit",  # polars DSL keywords
    "run", "show", "fit", "get", "add", "set",
    "next", "iris", "prod", "ord",
    "tab", "box", "var",  # too ambiguous
}

found_terms: dict[str, int] = {}

nb_count = 0
for nb_path in sorted(ROOT.rglob("*.ipynb")):
    if ".ipynb_checkpoints" in nb_path.parts:
        continue
    try:
        data = json.loads(nb_path.read_text(encoding="utf-8-sig"))
    except Exception:
        continue
    nb_count += 1

    for cell in data.get("cells", []):
        if cell.get("cell_type") != "code":
            continue
        source = "".join(cell.get("source", []))
        for pat in PATTERNS:
            for m in pat.finditer(source):
                term = m.group(1).lower().strip()
                if len(term) >= 3 and term not in IGNORE:
                    found_terms[term] = found_terms.get(term, 0) + 1

# Sort by frequency
sorted_terms = sorted(found_terms.items(), key=lambda x: -x[1])

# Check coverage
covered = [t for t, _ in sorted_terms if t in all_terms]
missing = [t for t, cnt in sorted_terms if t not in all_terms and cnt >= 3]

print(f"Notebooks scanned: {nb_count}")
print(f"Unique identifiers found (>=1 use): {len(sorted_terms)}")
print(f"Identifiers used >=3 times: {sum(1 for _, c in sorted_terms if c >= 3)}")
print(f"Covered by reference cards: {len(covered)}")
print()
print(f"MISSING (used >=3 times, no card) - {len(missing)} items:")
for t in missing[:100]:
    cnt = found_terms[t]
    print(f"  {cnt:4d}x  {t}")
if len(missing) > 100:
    print(f"  ... and {len(missing)-100} more")
