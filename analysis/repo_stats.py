#!/usr/bin/env python3
"""
Repository matching statistics, per the proposal's requirement for two matched
small-to-medium JavaScript/TypeScript repositories (React/Next, public, permissive licence).

Usage: python3 repo_stats.py /path/to/repoA /path/to/repoB ...
Reports the matching dimensions so the choice of pair is evidence-based and citable.
"""
import json, sys
from pathlib import Path
from collections import Counter

EXCLUDE = {"node_modules", ".git", "dist", "build", ".next", "coverage"}
SRC_EXT = {".ts": "TypeScript", ".tsx": "TypeScript", ".js": "JavaScript",
           ".jsx": "JavaScript", ".css": "CSS", ".scss": "CSS", ".json": "JSON",
           ".md": "Markdown", ".html": "HTML", ".sql": "SQL"}

def stats(root: Path):
    files, loc, langs = 0, 0, Counter()
    for p in root.rglob("*"):
        if any(part in EXCLUDE for part in p.parts): continue
        if p.is_file() and p.suffix in SRC_EXT:
            files += 1
            langs[SRC_EXT[p.suffix]] += 1
            try: loc += sum(1 for _ in p.open(errors="ignore"))
            except OSError: pass
    pkg = root / "package.json"
    deps, framework, licence = 0, "unknown", "check LICENSE file"
    if pkg.exists():
        d = json.loads(pkg.read_text())
        alldeps = {**d.get("dependencies", {}), **d.get("devDependencies", {})}
        deps = len(d.get("dependencies", {}))
        framework = "Next.js" if "next" in alldeps else ("React" if "react" in alldeps else "other")
        licence = d.get("license", licence)
    return {"repo": root.name, "source_files": files, "loc": loc, "runtime_deps": deps,
            "framework": framework, "licence": licence,
            "top_languages": dict(langs.most_common(4))}

if __name__ == "__main__":
    if len(sys.argv) < 2: print(__doc__); sys.exit(0)
    rows = [stats(Path(a)) for a in sys.argv[1:]]
    for r in rows: print(json.dumps(r, indent=2))
    if len(rows) == 2:
        a, b = rows
        ratio = max(a["loc"], b["loc"]) / max(1, min(a["loc"], b["loc"]))
        print(f"\nLOC ratio {ratio:.2f}x - aim for under ~1.5x for a defensible match; "
              f"same framework: {a['framework'] == b['framework']}")
