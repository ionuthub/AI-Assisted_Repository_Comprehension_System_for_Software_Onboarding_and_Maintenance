#!/usr/bin/env python3
"""
Ground-truth worksheets for the accuracy gate.

The gate compares the tool's answers against answers the researcher wrote first, from reading
the code. Writing those directly into JSON is unpleasant enough that it invites shortcuts, and
a shortcut here is not a tidiness problem: the gate figure is only as good as the ground truth
it is measured against, and every downstream seeded probe is drawn from the items the tool got
wrong.

So: `generate` produces a markdown worksheet per repository, one block per question, with the
repository's file inventory and a structural reading order at the top. `collect` reads the
completed worksheets back and writes the answers into the gate files, leaving `toolAnswer` and
`correct` untouched for the later stages.

The worksheet deliberately contains no per-question hints, no candidate files, no starting
points. A pointer towards the answer would make the ground truth partly a record of where
something suggested looking, and the whole value of the gate is that the two readings are
independent.

Usage:
    python3 gate_worksheet.py generate ../study/accuracy-gate.warehouse-dispatch.json /path/to/repo
    python3 gate_worksheet.py collect   ../study/accuracy-gate.warehouse-dispatch.json worksheet.md
    python3 gate_worksheet.py --self-test
"""
import json
import re
import sys
from pathlib import Path

SOURCE_EXT = {".ts", ".tsx", ".js", ".jsx"}

# A reading order that holds for any React/TypeScript project, so it gives nothing away about
# these two in particular. Tests come late on purpose: they state intended behaviour plainly
# and will shortcut a reading that ought to be your own.
READING_ORDER = """\
1. `package.json` and `README.md`, what the project claims to be.
2. `src/main.tsx`, `src/App.tsx`, the entry point and how the application is composed.
3. `src/types/`, the vocabulary everything else is written in. Read this properly; it is the
   cheapest file to read and the most repaid.
4. `src/config/`, behaviour that is declared rather than coded.
5. `src/store/`, where state lives and what may change it.
6. The domain directories, the bulk of the logic.
7. `src/api/`, how the outside world is reached.
8. `src/pages/` and `src/components/`, the interface. Skim; little ground truth lives here.
9. `src/tests/`, read these last. They tell you what the author intended, which is exactly
   what you are trying to work out for yourself.
10. `src/data/`, seed data. Skim only; it is bulk, not behaviour.
"""

HEADER = """\
# Ground-truth worksheet, {repo}

Write your own answers here, from reading the code, **before the tool is asked anything**.
When this is complete, run:

    python3 analysis/gate_worksheet.py collect study/accuracy-gate.{repo}.json {slug}-worksheet.md

## How to answer

Name the file and line range that settles the question, then say in one or two sentences what
happens. Where more than one place is involved, list all of them, several questions have more
than one right location, and an answer that names only the first is the kind of partial
correctness the marking has to be able to distinguish.

If you cannot settle something from the code, write what is ambiguous in the Notes field rather
than guessing. An honest "ambiguous" is usable later; a guess that turns out wrong silently
corrupts the accuracy figure and every seeded probe drawn from it.

Do not open the tool until every block below is filled in.

## This repository

{stats}

{inventory}

## Reading order

{reading_order}

---

{blocks}"""

BLOCK = """\
## Q{id}, {pattern}

> {question}

**Answer**

<!-- your answer here -->

**Files and lines**

<!-- e.g. src/example.ts:12-40, one per line -->

**Notes**

<!-- anything ambiguous, any alternative reading, anything you had to decide -->

---
"""


def inventory(root: Path) -> tuple[str, str]:
    files = sorted(
        (p for p in (root / "src").rglob("*") if p.is_file() and p.suffix in SOURCE_EXT),
        key=lambda p: str(p),
    )
    rows, total, test_lines, data_lines = [], 0, 0, 0
    for p in files:
        n = sum(1 for _ in p.open(errors="ignore"))
        rel = p.relative_to(root)
        total += n
        if "tests" in rel.parts:
            test_lines += n
        elif "data" in rel.parts:
            data_lines += n
        rows.append(f"| `{rel}` | {n} |")

    logic = total - test_lines - data_lines
    stats = (
        f"{len(files)} source files, {total} lines. Of those, {data_lines} are seed data and "
        f"{test_lines} are tests, so the logic you actually need to hold in your head is about "
        f"**{logic} lines**."
    )
    table = "<details>\n<summary>File inventory ({n} files)</summary>\n\n| File | Lines |\n| --- | --- |\n{rows}\n\n</details>".format(
        n=len(files), rows="\n".join(rows)
    )
    return stats, table


def slugify(repo: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", repo.lower()).strip("-")


def generate(gate_path: Path, repo_root: Path) -> Path:
    gate = json.loads(gate_path.read_text())
    repo = gate.get("repository", gate_path.stem)
    stats, table = inventory(repo_root)
    blocks = "\n".join(
        BLOCK.format(id=i["id"], pattern=i["pattern"], question=i["question"])
        for i in gate["items"]
    )
    out = Path(f"{slugify(repo)}-worksheet.md")
    out.write_text(
        HEADER.format(
            repo=repo, slug=slugify(repo), stats=stats, inventory=table,
            reading_order=READING_ORDER, blocks=blocks,
        )
    )
    return out


# A block ends at the next "## Q" heading or the end of the document.
BLOCK_RE = re.compile(r"^## Q(\d+)\b.*?$(.*?)(?=^## Q\d+\b|\Z)", re.M | re.S)
FIELD_RE = {
    "answer": re.compile(r"^\*\*Answer\*\*\s*$(.*?)(?=^\*\*|\Z)", re.M | re.S),
    "files": re.compile(r"^\*\*Files and lines\*\*\s*$(.*?)(?=^\*\*|\Z)", re.M | re.S),
    "notes": re.compile(r"^\*\*Notes\*\*\s*$(.*?)(?=^\*\*|---\s*$|\Z)", re.M | re.S),
}


def _clean(text: str) -> str:
    """Strips the HTML placeholder comments and horizontal rules, leaving what was written."""
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    text = re.sub(r"^---\s*$", "", text, flags=re.M)
    return text.strip()


def parse(markdown: str) -> dict[int, dict[str, str]]:
    out: dict[int, dict[str, str]] = {}
    for m in BLOCK_RE.finditer(markdown):
        body = m.group(2)
        out[int(m.group(1))] = {
            name: _clean(fm.group(1)) if (fm := rx.search(body)) else ""
            for name, rx in FIELD_RE.items()
        }
    return out


def collect(gate_path: Path, worksheet_path: Path) -> bool:
    gate = json.loads(gate_path.read_text())
    answers = parse(worksheet_path.read_text())

    empty = []
    for item in gate["items"]:
        a = answers.get(item["id"])
        if not a or not a["answer"]:
            empty.append(item["id"])
            continue
        # Files and notes are kept alongside the prose rather than discarded: the file list is
        # what a second marker checks against, and the notes are where genuine ambiguity in the
        # repository is recorded. Both are wanted in the appendix.
        item["correctAnswer"] = a["answer"]
        item["correctAnswerFiles"] = [
            line.strip("-* ").strip() for line in a["files"].splitlines() if line.strip("-* ").strip()
        ]
        if a["notes"]:
            item["correctAnswerNotes"] = a["notes"]

    if empty:
        print(f"Not written yet: Q{', Q'.join(str(i) for i in empty)}. Nothing was saved.")
        return False

    gate_path.write_text(json.dumps(gate, indent=1, ensure_ascii=False) + "\n")
    print(f"Wrote {len(gate['items'])} ground-truth answers into {gate_path.name}.")
    print("toolAnswer and correct are untouched, those come after the tool is asked.")
    return True


def self_test() -> None:
    """Checks the parser against a filled block and a blank one, not against study data."""
    sample = """\
## Q1, orientation

> Where does execution start?

**Answer**

In `src/main.tsx`, which mounts `App`.

**Files and lines**

src/main.tsx:1-10
src/App.tsx:1-31

**Notes**

None.

---

## Q2, handler registry

> Which code decides?

**Answer**

<!-- your answer here -->

**Files and lines**

<!-- e.g. src/example.ts:12-40 -->

**Notes**

<!-- anything ambiguous -->

---
"""
    parsed = parse(sample)
    assert set(parsed) == {1, 2}, parsed
    assert parsed[1]["answer"] == "In `src/main.tsx`, which mounts `App`.", parsed[1]
    assert parsed[1]["files"].splitlines() == ["src/main.tsx:1-10", "src/App.tsx:1-31"], parsed[1]
    assert parsed[1]["notes"] == "None.", parsed[1]
    # A block containing only the placeholder comments must read as empty, or a worksheet that
    # was never filled in would be collected as though it had been.
    assert parsed[2]["answer"] == "", parsed[2]
    assert parsed[2]["files"] == "", parsed[2]
    print("self-test OK: filled blocks parse, untouched blocks read as empty")


if __name__ == "__main__":
    args = sys.argv[1:]
    if args == ["--self-test"]:
        self_test()
    elif len(args) == 3 and args[0] == "generate":
        print(f"Wrote {generate(Path(args[1]), Path(args[2]))}")
    elif len(args) == 3 and args[0] == "collect":
        sys.exit(0 if collect(Path(args[1]), Path(args[2])) else 1)
    else:
        print(__doc__)
