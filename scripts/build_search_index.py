from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


MAX_CELL_TEXT = 900
MAX_SEARCH_TEXT = 24000
REDACTIONS = [
    # Connection strings
    re.compile(r"mysql\+pymysql://[^@\s\"']+@[^/\s\"']+/[^\s\"']+", re.I),
    re.compile(r"mongodb(?:\+srv)?://[^\s\"'<>\[\]]+", re.I),
    # ICH school server domains
    re.compile(r"ich-db\.edu\.itcareerhub\.de", re.I),
    re.compile(r"ich-edit\.edu\.itcareerhub\.de", re.I),
    re.compile(r"mongo\.itcareerhub\.de", re.I),
    # Known real passwords / usernames
    re.compile(r"YOUR_PASSWORD", re.I),
    re.compile(r"ich1_password_\w+", re.I),
    re.compile(r"(['\"])YOUR_USERNAME(['\"])", re.I),
    # Generic credential assignments
    re.compile(r'password\s*=\s*["\'][^"\'<>{]{4,}["\']', re.I),
    re.compile(r"API_KEY\s*=\s*['\"][^'\"]+['\"]", re.I),
    re.compile(r"TELEGRAM_TOKEN\s*=\s*['\"][^'\"]+['\"]", re.I),
    re.compile(r"token\s*=\s*['\"][A-Za-z0-9_\-]{20,}['\"]", re.I),
    re.compile(r"secret\s*=\s*['\"][^'\"<>{]{8,}['\"]", re.I),
]


def posix_path(path: Path) -> str:
    return path.as_posix()


def allowed_notebook(path: Path) -> bool:
    path_text = posix_path(path)
    if not path_text.lower().endswith(".ipynb"):
        return False
    if ".ipynb_checkpoints" in path.parts:
        return False
    if "backup_before_restore" in path_text:
        return False
    parts = path.parts
    if "Python" in parts:
        python_index = parts.index("Python")
        if len(parts) > python_index + 1 and parts[python_index + 1] == "проект":
            return False
    if "Python" in parts and ".git" in parts:
        return False
    return True


def sanitize_text(text: str) -> str:
    sanitized = text
    for pattern in REDACTIONS:
        sanitized = pattern.sub("[DB_CONNECTION_REDACTED]", sanitized)
    return sanitized


def compact_text(text: str) -> str:
    text = sanitize_text(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def cell_source(cell: dict[str, Any]) -> str:
    source = cell.get("source") or []
    if isinstance(source, str):
        return source
    return "".join(str(part) for part in source)


def notebook_to_record(root: Path, path: Path) -> dict[str, Any]:
    relative = posix_path(path.relative_to(root))
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    name = path.name
    matches: list[dict[str, Any]] = []
    search_parts = [name, relative]

    for index, cell in enumerate(data.get("cells", []), 1):
        cell_type = cell.get("cell_type", "unknown")
        if cell_type not in {"code", "markdown"}:
            continue

        text = compact_text(cell_source(cell))
        if not text:
            continue

        snippet = sanitize_text(cell_source(cell)).strip()[:MAX_CELL_TEXT]
        matches.append(
            {
                "cell": index,
                "type": cell_type,
                "text": snippet,
            }
        )
        search_parts.append(text)

    search_text = compact_text(" ".join(search_parts))[:MAX_SEARCH_TEXT]
    return {
        "name": name,
        "path": relative,
        "course": "fundamental" if relative.startswith("Python/") else "analytics",
        "searchText": search_text,
        "matches": matches,
    }


def sql_to_record(root: Path, path: Path) -> dict[str, Any]:
    relative = posix_path(path.relative_to(root))
    raw = path.read_text(encoding="utf-8-sig", errors="replace")
    text = sanitize_text(raw)
    name = path.name

    # Split into chunks by blank lines or statement boundaries
    chunks = [c.strip() for c in re.split(r"\n{2,}|;\s*\n", text) if c.strip()]
    matches = [
        {"cell": i + 1, "type": "code", "text": chunk[:MAX_CELL_TEXT]}
        for i, chunk in enumerate(chunks[:30])
    ]

    search_text = compact_text(f"{name} {relative} {text}")[:MAX_SEARCH_TEXT]
    return {
        "name": name,
        "path": relative,
        "course": "sql",
        "searchText": search_text,
        "matches": matches,
    }


def build_index(root: Path) -> dict[str, Any]:
    notebooks = [
        notebook_to_record(root, path)
        for path in sorted(root.rglob("*.ipynb"))
        if allowed_notebook(path)
    ]

    sql_dir = root / "docs" / "sql"
    sql_files = []
    if sql_dir.exists():
        for path in sorted(sql_dir.iterdir()):
            if path.suffix.lower() in {".sql", ".js"} and path.is_file():
                sql_files.append(sql_to_record(root, path))

    return {
        "meta": {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "notebookCount": len(notebooks),
            "sqlCount": len(sql_files),
        },
        "notebooks": notebooks + sql_files,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Build static notebook search index.")
    parser.add_argument("--root", default=".", help="Repository root")
    parser.add_argument("--out", default="docs/search-index.json", help="Output JSON path")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    output = Path(args.out)
    if not output.is_absolute():
        output = root / output

    index = build_index(root)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {output} with {index['meta']['notebookCount']} notebooks")


if __name__ == "__main__":
    main()
