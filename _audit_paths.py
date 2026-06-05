import json, re
from pathlib import Path

root = Path('.')
path_re = re.compile(r"['\"]([^'\"\n]+\.(?:csv|xlsx|xls|json|pkl|parquet|txt|png|jpg|jpeg|webp))['\"]", re.IGNORECASE)

scan_targets = list(root.rglob('*.ipynb')) + list(root.rglob('*.py'))
issues = []
checked = 0

for fp in scan_targets:
    try:
        text_lines = []
        if fp.suffix.lower() == '.ipynb':
            nb = json.loads(fp.read_text(encoding='utf-8'))
            for cell in nb.get('cells', []):
                if cell.get('cell_type') != 'code':
                    continue
                src = cell.get('source', [])
                if isinstance(src, list):
                    text_lines.extend(src)
                elif isinstance(src, str):
                    text_lines.append(src)
        else:
            text_lines = fp.read_text(encoding='utf-8', errors='ignore').splitlines(True)

        for idx, line in enumerate(text_lines, 1):
            if line.lstrip().startswith('#'):
                continue
            for m in path_re.finditer(line):
                raw = m.group(1).strip()
                # ignore URLs and absolute paths
                if re.match(r'^(https?:|[A-Za-z]:[/\\]|/)', raw):
                    continue
                # focus on likely local file paths
                if not any(token in raw for token in ('data/', '../data/', 'Images/', '../Images/', '.csv', '.xlsx', '.pkl', '.json', '.png', '.jpg', '.jpeg', '.webp', '.parquet')):
                    continue

                cand = (fp.parent / raw).resolve()
                checked += 1
                if not cand.exists():
                    issues.append((str(fp).replace('\\','/'), idx, raw))
    except Exception:
        continue

print(f'checked_paths={checked}')
print(f'missing_paths={len(issues)}')
for f, ln, p in issues[:200]:
    print(f'{f}:{ln} -> {p}')
