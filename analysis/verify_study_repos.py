#!/usr/bin/env python3
"""
Verifies that two purpose-built study repositories are matched, and that the artefact will
index essentially all of both.

`repo_stats.py` reports the matching dimensions. This script applies the study's own
thresholds to them and adds two checks that report alone cannot make:

  1. Predicted ingestion coverage. The artefact caps the file list and skips vendored
     directories, so a repository that is fine on paper can still be two-thirds invisible to
     the tool. A locating task whose target file falls outside the indexed subset is not a
     test of comprehension; it is a coin toss. This mirrors the rules in src/lib/github.ts
     and src/lib/ingestionFilters.ts.

  2. Presence of the seven architectural patterns in both repositories. The two conditions
     are only comparable if a task in one has a structurally equivalent task in the other.

Usage:
    python3 verify_study_repos.py /path/to/repoA /path/to/repoB
    python3 verify_study_repos.py --self-test
"""
import json
import re
import sys
from pathlib import Path

# --- mirrors of the artefact's ingestion rules (src/lib/) ---
MAX_FILES_TO_ANALYZE = 50
MAX_FILE_SIZE = 5 * 1024 * 1024
IGNORED_DIRECTORIES = {
    "node_modules", "bower_components", "vendor", "dist", "build", "out", "coverage",
    "target", ".git", ".next", ".nuxt", ".svelte-kit", ".cache", ".turbo", ".venv",
    "__pycache__", "site-packages",
}
GENERATED_FILES = {
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb", "npm-shrinkwrap.json",
    "composer.lock", "Cargo.lock", "poetry.lock", "Gemfile.lock",
}
CODE_EXT = {
    ".js", ".ts", ".tsx", ".jsx", ".py", ".rs", ".rb", ".go", ".java", ".cs", ".php",
    ".swift", ".kt", ".m", ".c", ".cpp", ".h", ".hs", ".scala", ".sql", ".md", ".json",
    ".yml", ".yaml", ".html", ".css",
}

# --- study thresholds (see STUDY_REPOSITORY_PROMPTS.md) ---
FILES_MIN, FILES_MAX = 40, 46
FILE_COUNT_TOLERANCE = 3
# Absolute size band. Deliberately wide: "small-to-medium" is the proposal's requirement and
# anything a developer can hold in mind within a timed task satisfies it. The band is a
# sanity check, not a matching criterion, LOC_RATIO_MAX below is the one that governs
# comparability between the pair, and that threshold is not negotiable after the fact.
LOC_MIN, LOC_MAX = 2000, 3200
LOC_RATIO_MAX = 1.2
COVERAGE_MIN = 0.95

SOURCE_EXT = {".ts", ".tsx", ".js", ".jsx"}

# Formatting density is a confound: the same logic written without blank lines and with
# several statements per line reads as materially harder, independently of its structure.
# Normalise both repositories with identical formatter settings before measuring, or the
# line counts compare presentation rather than content.
TEST_RE = re.compile(r"\.(test|spec)\.[jt]sx?$")

# Pattern name -> regexes, any of which is evidence the pattern is present.
PATTERNS = {
    "handler registry": [r"registerHandler|registerRoute|registry\b"],
    "config-driven behaviour": [r"zoneRules|priorityRules|Rules\s*[:=]"],
    "cross-cutting concern": [r"reserveStock|checkEligibility|reservation|eligibility"],
    "interceptor/pipeline chain": [r"interceptor|pipeline|stage"],
    "misleading name": [r"validateShipment|checkAppointment"],
    "legacy path": [r"legacy|old[A-Z]\w+"],
    "event emitter": [r"\bbus\b|\bchannel\b|emit\(|subscribe\("],
}


def walk(root: Path):
    for p in root.rglob("*"):
        if not p.is_file():
            continue
        rel = p.relative_to(root)
        # Only directory segments are matched, never the filename: "dist" must not exclude
        # src/utils/distance.ts.
        if any(part in IGNORED_DIRECTORIES for part in rel.parts[:-1]):
            continue
        yield rel, p


def analyse(root: Path) -> dict:
    source_files, test_files, loc = [], [], 0
    analysable = []

    for rel, p in walk(root):
        if p.suffix in SOURCE_EXT:
            source_files.append(str(rel))
            if TEST_RE.search(p.name):
                test_files.append(str(rel))
            try:
                loc += sum(1 for _ in p.open(errors="ignore"))
            except OSError:
                pass
        if p.suffix in CODE_EXT and p.name not in GENERATED_FILES:
            try:
                if p.stat().st_size <= MAX_FILE_SIZE:
                    analysable.append(str(rel))
            except OSError:
                pass

    indexed = min(len(analysable), MAX_FILES_TO_ANALYZE)
    coverage = indexed / len(analysable) if analysable else 0.0

    corpus = ""
    for rel, p in walk(root):
        if p.suffix in SOURCE_EXT:
            try:
                corpus += p.read_text(errors="ignore")
            except OSError:
                pass
    corpus += " ".join(str(f) for f in source_files)

    found = {
        name: any(re.search(rx, corpus, re.IGNORECASE) for rx in rxs)
        for name, rxs in PATTERNS.items()
    }

    deps = 0
    pkg = root / "package.json"
    if pkg.exists():
        try:
            deps = len(json.loads(pkg.read_text()).get("dependencies", {}))
        except (OSError, json.JSONDecodeError):
            pass

    return {
        "repo": root.name,
        "source_files": len(source_files),
        "test_files": len(test_files),
        "loc": loc,
        "runtime_deps": deps,
        "analysable_files": len(analysable),
        "indexed_files": indexed,
        "predicted_coverage": round(coverage, 3),
        "patterns_found": found,
        "patterns_missing": [k for k, v in found.items() if not v],
    }


def check(label: str, ok: bool, detail: str) -> bool:
    print(f"  [{'PASS' if ok else 'FAIL'}] {label}: {detail}")
    return ok


def verify(a: dict, b: dict) -> bool:
    ok = True
    print("\nPer repository")
    for r in (a, b):
        print(f"\n{r['repo']}")
        ok &= check("file count in 40-46", FILES_MIN <= r["source_files"] <= FILES_MAX,
                    f"{r['source_files']} source files")
        ok &= check(f"lines of source in {LOC_MIN}-{LOC_MAX}", LOC_MIN <= r["loc"] <= LOC_MAX,
                    f"{r['loc']} lines")
        ok &= check("artefact indexes nearly all of it", r["predicted_coverage"] >= COVERAGE_MIN,
                    f"{r['indexed_files']}/{r['analysable_files']} files "
                    f"({r['predicted_coverage']:.0%}), the cap is {MAX_FILES_TO_ANALYZE}")
        ok &= check("all seven patterns present", not r["patterns_missing"],
                    "all present" if not r["patterns_missing"]
                    else f"missing: {', '.join(r['patterns_missing'])}")

    print("\nMatching between the pair")
    file_delta = abs(a["source_files"] - b["source_files"])
    ok &= check("file counts within 3", file_delta <= FILE_COUNT_TOLERANCE,
                f"difference of {file_delta}")
    ratio = max(a["loc"], b["loc"]) / max(1, min(a["loc"], b["loc"]))
    ok &= check("LOC ratio under 1.2x", ratio <= LOC_RATIO_MAX, f"{ratio:.2f}x")
    ok &= check("same runtime dependency count", a["runtime_deps"] == b["runtime_deps"],
                f"{a['runtime_deps']} vs {b['runtime_deps']}")
    ok &= check("same test file count", a["test_files"] == b["test_files"],
                f"{a['test_files']} vs {b['test_files']}")
    return bool(ok)


def self_test() -> None:
    """Validates the ingestion rules against hand-checkable cases, not study data."""
    import tempfile

    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        (root / "src").mkdir()
        (root / "node_modules" / "pkg").mkdir(parents=True)
        (root / "src" / "app.ts").write_text("export const a = 1;\n")
        (root / "src" / "distance.ts").write_text("export const d = 2;\n")
        (root / "node_modules" / "pkg" / "index.js").write_text("module.exports = 1;\n")

        r = analyse(root)
        assert r["source_files"] == 2, r
        # distance.ts must survive: the "dist" rule matches directory segments only.
        assert r["analysable_files"] == 2, r
        assert r["predicted_coverage"] == 1.0, r

    print("self-test OK: vendored exclusion, segment matching and coverage validated")


if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "--self-test":
        self_test()
    elif len(sys.argv) == 3:
        ra, rb = analyse(Path(sys.argv[1])), analyse(Path(sys.argv[2]))
        print(json.dumps([ra, rb], indent=2))
        passed = verify(ra, rb)
        print("\n" + ("All checks passed, the pair is usable as a matched stimulus."
                      if passed else
                      "Some checks failed. Regenerate the offending repository before "
                      "writing any tasks: the comparison depends on the match."))
        sys.exit(0 if passed else 1)
    else:
        print(__doc__)
