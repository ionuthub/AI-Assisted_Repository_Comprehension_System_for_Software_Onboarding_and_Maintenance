#!/usr/bin/env python3
"""
Repository matching statistics, per the proposal's requirement for two matched
small-to-medium JavaScript/TypeScript repositories (React/Next, public, permissive licence).

Usage: python3 repo_stats.py /path/to/repoA /path/to/repoB ...
Reports the matching dimensions so the choice of pair is evidence-based and citable.
"""
from collections import Counter
import json
from pathlib import Path
import sys
import tempfile

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


def self_test() -> None:
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory) / "fixture"
        (root / "src").mkdir(parents=True)
        (root / "node_modules" / "vendored").mkdir(parents=True)
        (root / "src" / "app.tsx").write_text("line one\nline two\n")
        (root / "node_modules" / "vendored" / "index.js").write_text("ignored\n")
        (root / "package.json").write_text(json.dumps({
            "license": "MIT",
            "dependencies": {"react": "1", "zod": "1"},
        }))

        result = stats(root)
        assert result["source_files"] == 2, result  # app.tsx plus package.json
        assert result["loc"] == 3, result
        assert result["runtime_deps"] == 2, result
        assert result["framework"] == "React", result
        assert result["licence"] == "MIT", result
    print("self-test OK: source counts exclude vendored files and package metadata is reported")

if __name__ == "__main__":
    if sys.argv[1:] == ["--self-test"]:
        self_test()
        sys.exit(0)
    if len(sys.argv) < 2: print(__doc__); sys.exit(2)
    rows = [stats(Path(a)) for a in sys.argv[1:]]
    for r in rows: print(json.dumps(r, indent=2))
    if len(rows) == 2:
        a, b = rows
        ratio = max(a["loc"], b["loc"]) / max(1, min(a["loc"], b["loc"]))
        print(f"\nLOC ratio {ratio:.2f}x - aim for under ~1.5x for a defensible match; "
              f"same framework: {a['framework'] == b['framework']}")
