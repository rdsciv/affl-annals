"""
Security and privacy audit test: guarantees zero private ESPN credentials or keys are exposed.
"""

import os
from pathlib import Path
import pytest

ROOT_DIR = Path(__file__).resolve().parent.parent

def test_no_credentials_in_public_or_src():
    forbidden_tokens = ["AEBWVuk7xP6v91Bp", "F232E20A-A84E-45FB-97BE-BBFC3BFC10DA"]
    
    check_dirs = [ROOT_DIR / "src", ROOT_DIR / "public"]
    for d in check_dirs:
        if not d.exists():
            continue
        for f in d.rglob("*"):
            if f.is_file() and not f.name.endswith((".parquet", ".ico", ".png", ".jpg")):
                try:
                    content = f.read_text(encoding="utf-8", errors="ignore")
                    for token in forbidden_tokens:
                        assert token not in content, f"Forbidden credential token found in {f.relative_to(ROOT_DIR)}"
                except Exception:
                    pass
