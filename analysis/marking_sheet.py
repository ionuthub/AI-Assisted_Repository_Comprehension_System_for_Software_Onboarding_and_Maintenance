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
    python3 marking_sheet.py collect study/accuracy-gate.clinic-triage.json \\
                                     study/marking.clinic-triage.md
    python3 marking_sheet.py --self-test
"""
import json
import hashlib
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
BINDING_RE = re.compile(r"<!-- accuracy-gate-binding: ([0-9a-f]{64}) -->")


def gate_binding(gate: dict) -> str:
    """Binds a sheet to the captured repository, provenance, questions, and answers."""
    payload = {
        "repository": gate.get("repository"),
        "capturedRepository": gate.get("capturedRepository"),
        "capturedFrom": gate.get("capturedFrom"),
        "groundTruthProvenance": gate.get("groundTruthProvenance"),
        "items": [
            {
                "id": item.get("id"),
                "question": item.get("question"),
                "correctAnswer": item.get("correctAnswer"),
                "toolAnswer": item.get("toolAnswer"),
            }
            for item in gate.get("items", [])
        ],
    }
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(canonical.encode()).hexdigest()


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

<!-- accuracy-gate-binding: {binding} -->

{n} questions. For each one, decide whether the tool's answer says the same thing as the ground
truth, and write `correct` or `incorrect` on the verdict line.

The rubric is binary, as the proposal commits to. There is no partial credit: an answer that
names the right file but misses two of the four places something happens is **incorrect**. That
is deliberate — the questions were written to have complete answers, and a scheme that awarded
half marks would make the resulting figure impossible to interpret.

**What counts as the standard: the Answer, not the Notes.** Each question's Notes are shown
collapsed beneath it, because a marker needs to know what is in the repository, but an answer is
not incorrect merely for omitting something that appears only in a Note. The Notes record traps,
reachability findings and counter-examples; requiring a tool to reproduce all of them would set a
bar nothing could meet, and it was not the standard declared in advance.

This has to be stated because it was previously left implicit, and two markers then marked the
same items against different material — one seeing the Answer alone, one seeing the whole
ground-truth document. Some of what looked like disagreement was two people answering different
questions. Where an omission from a Note seems decisive, mark against the Answer and say so on
the "Why" line; that keeps the stricter reading available without hiding it inside the figure.

Mark against the ground truth, not against your impression of whether the answer sounds good. A
fluent answer that omits the decisive fact is the case this whole study exists to measure.

When every verdict is filled in:

    python3 analysis/marking_sheet.py collect {gate} {sheet}

---

"""

BLOCK = """\
## Q{id} — {pattern}

> {question}

### Ground truth — this is the standard

{truth}

**Files:** {truth_files}

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

{truth_notes}

</details>

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

    items = gate.get("items")
    if not isinstance(items, list) or not items:
        print(f"{gate_path.name} has no gate items.")
        raise SystemExit(1)

    ids = [item.get("id") for item in items]
    if len(ids) != len(set(ids)):
        print(f"{gate_path.name} has duplicate question IDs.")
        raise SystemExit(1)
    missing_answers = [item.get("id") for item in items if not str(item.get("toolAnswer") or "").strip()]
    missing_gate_truth = [
        item.get("id") for item in items if not str(item.get("correctAnswer") or "").strip()
    ]
    missing_truth = [qid for qid in ids if not str(truth.get(qid, {}).get("answer") or "").strip()]
    truth_mismatches = [
        item.get("id")
        for item in items
        if str(item.get("correctAnswer") or "").strip()
        != str(truth.get(item.get("id"), {}).get("answer") or "").strip()
    ]
    extra_truth = sorted(set(truth) - set(ids))
    if (
        missing_answers
        or missing_gate_truth
        or missing_truth
        or truth_mismatches
        or extra_truth
        or len(truth) != len(items)
    ):
        if missing_answers:
            print(f"No captured answer: Q{', Q'.join(map(str, missing_answers))}.")
        if missing_gate_truth:
            print(f"No correctAnswer in gate: Q{', Q'.join(map(str, missing_gate_truth))}.")
        if missing_truth:
            print(f"No ground-truth answer: Q{', Q'.join(map(str, missing_truth))}.")
        if truth_mismatches:
            print(
                "Gate correctAnswer differs from the supplied ground truth: "
                f"Q{', Q'.join(map(str, truth_mismatches))}."
            )
        if extra_truth:
            print(f"Ground truth has questions absent from the gate: Q{', Q'.join(map(str, extra_truth))}.")
        print("No marking sheet was written.")
        raise SystemExit(1)

    # Beside the gate it was built from, not in the current working directory. The sheet is only
    # meaningful next to that capture — it is bound to it by hash — and writing it wherever the
    # command happened to be run from put study material in the repository root, outside the
    # freeze boundary analysis/README.md defines.
    sheet = gate_path.parent / f"marking.{repo}.md"
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
                truth_notes=t.get("notes") or "_none_",
                heading=item.get("toolEvidenceHeading", "—"),
                retrieved=retrieved,
                unverified=("Unverified mentions: " + "; ".join(unver) + "\n") if unver else "",
                answer=(item.get("toolAnswer") or "(no answer captured)").strip(),
            )
        )

    sheet.write_text(
        HEADER.format(
            repo=repo,
            n=len(gate["items"]),
            gate=gate_path,
            sheet=sheet,
            binding=gate_binding(gate),
        ) + "".join(blocks)
    )
    return sheet


def collect(gate_path: Path, sheet_path: Path) -> bool:
    gate = json.loads(gate_path.read_text())
    markdown = sheet_path.read_text()
    bindings = BINDING_RE.findall(markdown)
    expected_binding = gate_binding(gate)
    if bindings != [expected_binding]:
        found = bindings[0] if len(bindings) == 1 else f"{len(bindings)} binding records"
        print(
            f"Sheet does not belong to this captured gate (expected {expected_binding}, found {found})."
        )
        print("Nothing was saved.")
        return False

    sheet_ids = [int(match.group(1)) for match in BLOCK_SPLIT_RE.finditer(markdown)]
    gate_ids = [item["id"] for item in gate["items"]]
    if len(sheet_ids) != len(set(sheet_ids)) or set(sheet_ids) != set(gate_ids):
        print(f"Sheet question IDs {sheet_ids} do not match gate question IDs {gate_ids}.")
        print("Nothing was saved.")
        return False

    verdicts = read_verdicts(markdown)

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

    gate = {
        "repository": "repo-a",
        "capturedRepository": "https://example.test/repo-a",
        "groundTruthProvenance": "confirmed",
        "items": [{
            "id": 1,
            "question": "Question?",
            "correctAnswer": "Ground truth",
            "toolAnswer": "Answer A",
        }],
    }
    original = gate_binding(gate)
    changed_answer = json.loads(json.dumps(gate))
    changed_answer["items"][0]["toolAnswer"] = "Answer B"
    assert gate_binding(changed_answer) != original
    changed_repo = json.loads(json.dumps(gate))
    changed_repo["repository"] = "repo-b"
    assert gate_binding(changed_repo) != original
    print("self-test OK: verdict blocks stay local and sheets bind to their exact captured gate")


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
