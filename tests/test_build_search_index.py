import json
from pathlib import Path

import pytest

from scripts.build_search_index import build_index, notebook_to_record, sanitize_text


def write_notebook(path: Path, cells: list[dict], *, bom: bool = False) -> None:
    payload = {
        "cells": cells,
        "metadata": {},
        "nbformat": 4,
        "nbformat_minor": 5,
    }
    encoding = "utf-8-sig" if bom else "utf-8"
    path.write_text(json.dumps(payload, ensure_ascii=False), encoding=encoding)


def test_notebook_to_record_reads_bom_and_indexes_code_and_markdown(tmp_path: Path) -> None:
    notebook = tmp_path / "notebooks" / "Python for DA_L1.ipynb"
    notebook.parent.mkdir()
    write_notebook(
        notebook,
        [
            {
                "cell_type": "markdown",
                "source": ["# Дубликаты\n", "Ищем повторяющиеся строки."],
            },
            {
                "cell_type": "code",
                "source": ["df.duplicated().sum()\n", "df.drop_duplicates()"],
            },
        ],
        bom=True,
    )

    record = notebook_to_record(tmp_path, notebook)

    assert record["path"] == "notebooks/Python for DA_L1.ipynb"
    assert "duplicated" in record["searchText"]
    assert "drop_duplicates" in record["searchText"]
    assert record["matches"][0]["cell"] == 1
    assert record["matches"][1]["cell"] == 2


def test_build_index_finds_allowed_notebooks_and_skips_checkpoints(tmp_path: Path) -> None:
    write_notebook(
        tmp_path / "lesson.ipynb",
        [{"cell_type": "code", "source": ["groupby merge pivot"]}],
    )
    checkpoint = tmp_path / ".ipynb_checkpoints" / "lesson-checkpoint.ipynb"
    checkpoint.parent.mkdir()
    write_notebook(checkpoint, [{"cell_type": "code", "source": ["hidden"]}])

    index = build_index(tmp_path)

    assert index["meta"]["notebookCount"] == 1
    assert index["notebooks"][0]["path"] == "lesson.ipynb"
    assert "groupby" in index["notebooks"][0]["searchText"]


def test_sanitize_text_removes_public_database_credentials() -> None:
    text = 'mysql+pymysql://ich1:password@YOUR_MYSQL_HOST/sakila password="password"'

    sanitized = sanitize_text(text)

    assert "YOUR_MYSQL_HOST" not in sanitized
    assert "ich1:password" not in sanitized
    assert 'password="password"' not in sanitized
    assert "[DB_CONNECTION_REDACTED]" in sanitized
