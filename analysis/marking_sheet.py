#!/usr/bin/env python3
"""
Builds a marking sheet from a captured gate, and reads the verdicts back.

Marking is the one step of the gate that cannot be delegated: it is a judgement about whether
the tool's answer says the same thing as the ground truth. What can be removed is the clerical
work around it — scrolling between a JSON file and a markdown file, losing your place, and
marking question 9 while looking at question 8's evidence.

`build` puts each pair side by side in one document with a blank verdict line. `collect` reads
the completed sheet back into the gate file's `correct` field.

Usage:
    python3 marking_sheet.py build   study/accuracy-gate.clinic-triage.json \\
                                     study/ground-truth.clinic-triage.md
    python3 marking_sheet.py collect study/accuracy-gate.clinic-triage.json marking.clinic-triage.md
    python3 marking_sheet.py --self-test
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from gate_worksheet import parse  # noqa: E402

# Blocks are split first, then searched, rather than matching question and verdict in one
# expression. A single non-greedy pattern spanning the document reads *past* an unmarked
# question to the next verdict it can find, so an untouched Q2 silently inherits Q3's mark. The
# self-test below covers that case, which is how it was caught.
BLOCK_SPLIT_RE = re.compile(r"^## Q(\d+)\b", re.M)
VERDICT_RE = re.compile(r"^\*\*Verdict:\*\*[ \t]*(\w+)", re.M)


def read_verdicts(markdown: str) -> dict[int, str]:
    """Maps question id to the verdict written in that question's own block."""
    marks = list(BLOCK_SPLIT_RE.finditer(markdown))
    out: dict[int, str] = {}
    for i, m in enumerate(marks):
        end = marks[i + 1].start() if i + 1 < len(marks) else len(markdown)
        found = VERDICT_RE.search(markdown, m.end(), end)
        if found:
            out[int(m.group(1))] = found.group(1).lower()
    return out

HEADER = """\
# Marking sheet — {repo}

{n} questions. For each one, decide whether the tool's answer says the same thing as the ground
truth, and write `correct` or `incorrect` on the verdict line.

The rubric is binary, as the proposal commits to. There is no partial credit: an answer that
names the right file but misses two of the four places something happens is **incorrect**. That
is deliberate — the questions were written to have complete answers, and a scheme that awarded
half marks would make the resulting figure impossible to interpret.

Mark against the ground truth, not against your impression of whether the answer sounds good. A
fluent answer that omits the decisive fact is the case this whole study exists to measure.

When every verdict is filled in:

    python3 analysis/marking_sheet.py collect {gate} {sheet}

---

"""

BLOCK = """\
## Q{id} — {pattern}

> {question}

### Ground truth

{truth}

**Files:** {truth_files}

### What the tool answered

Evidence panel: {heading}
Retrieved: {retrieved}
{unverified}
```
{answer}
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

"""


def build(gate_path: Path, truth_path: Path) -> Path:
    gate = json.loads(gate_path.read_text())
    truth = parse(truth_path.read_text())
    repo = gate.get("repository", gate_path.stem)

    if not any(i.get("toolAnswer") for i in gate["items"]):
        print(f"{gate_path.name} has no captured answers yet. Run the capture first.")
        raise SystemExit(1)

    sheet = Path(f"marking.{repo}.md")
    blocks = []
    for item in gate["items"]:
        t = truth.get(item["id"], {})
        ev = item.get("toolEvidence") or []
        retrieved = (
            ", ".join(f"{e.get('path')} ({e.get('score')})" for e in ev) if ev else "nothing"
        )
        unver = item.get("toolUnverifiedMentions") or []
        blocks.append(
            BLOCK.format(
                id=item["id"],
                pattern=item.get("pattern", ""),
                question=item["question"],
                truth=t.get("answer", "(ground truth not found for this question)"),
                truth_files=", ".join(t.get("files", "").split()) or "—",
                heading=item.get("toolEvidenceHeading", "—"),
                retrieved=retrieved,
                unverified=("Unverified mentions: " + "; ".join(unver) + "\n") if unver else "",
                answer=(item.get("toolAnswer") or "(no answer captured)").strip(),
            )
        )

    sheet.write_text(
        HEADER.format(repo=repo, n=len(gate["items"]), gate=gate_path, sheet=sheet) + "".join(blocks)
    )
    return sheet


def collect(gate_path: Path, sheet_path: Path) -> bool:
    gate = json.loads(gate_path.read_text())
    verdicts = read_verdicts(sheet_path.read_text())

    missing, bad = [], []
    for item in gate["items"]:
        v = verdicts.get(item["id"])
        if v is None:
            missing.append(item["id"])
        elif v not in ("correct", "incorrect"):
            bad.append((item["id"], v))

    if missing or bad:
        if missing:
            print(f"Not marked yet: Q{', Q'.join(str(i) for i in missing)}.")
        for qid, v in bad:
            print(f"Q{qid}: {v!r} is neither 'correct' nor 'incorrect'.")
        print("Nothing was saved.")
        return False

    for item in gate["items"]:
        item["correct"] = verdicts[item["id"]] == "correct"

    gate_path.write_text(json.dumps(gate, indent=1, ensure_ascii=False) + "\n")
    n = sum(1 for i in gate["items"] if i["correct"])
    print(f"Marked {len(gate['items'])} items in {gate_path.name}: {n} correct.")
    print("Run analysis/accuracy_gate.py to score, or npm run gate:score for both repositories.")
    return True


def self_test() -> None:
    """Checks that an unmarked sheet is refused rather than silently scored as all-incorrect."""
    sample = """\
## Q1 — orientation

**Verdict:** correct

## Q2 — handler registry

**Verdict:** <!-- correct | incorrect -->

## Q3 — legacy path

**Verdict:** incorrect
"""
    got = read_verdicts(sample)
    # Q2 is untouched: the placeholder is an HTML comment, so no word follows the marker on its
    # line. It must be absent, not inherited from Q3 and not silently false.
    assert got == {1: "correct", 3: "incorrect"}, got
    assert 2 not in got, got
    print("self-test OK: filled verdicts parse, an unmarked question stays unmarked")


if __name__ == "__main__":
    args = sys.argv[1:]
    if args == ["--self-test"]:
        self_test()
    elif len(args) == 3 and args[0] == "build":
        print(f"Wrote {build(Path(args[1]), Path(args[2]))}")
    elif len(args) == 3 and args[0] == "collect":
        sys.exit(0 if collect(Path(args[1]), Path(args[2])) else 1)
    else:
        print(__doc__)
