#!/usr/bin/env python3
"""
Compares two captures of the same gate, question by question.

The tool wraps a language model, so asking the same question twice does not guarantee the same
answer. How much it varies is not a detail — it bounds how reproducible the accuracy figure is,
and a reader of the dissertation is entitled to know whether a different run would have produced
a different number.

Retrieval is the part that should not vary at all: TF-IDF over a fixed index is deterministic,
so the same question must return the same three files with the same scores. If that changes
between runs, something is wrong with ingestion rather than with the model, and it matters more
than any wording difference.

Usage:
    python3 compare_runs.py study/gate-runs/clinic-triage-run1.json \\
                            study/accuracy-gate.clinic-triage.json
    python3 compare_runs.py --self-test
"""
import json
import sys
from difflib import SequenceMatcher
from pathlib import Path


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a or "", b or "").ratio()


def evidence_key(item: dict) -> list[tuple]:
    return [(e.get("rank"), e.get("path"), e.get("score")) for e in item.get("toolEvidence") or []]


def compare(a_path: Path, b_path: Path) -> bool:
    a, b = json.loads(a_path.read_text()), json.loads(b_path.read_text())
    a_items = {i["id"]: i for i in a["items"]}
    b_items = {i["id"]: i for i in b["items"]}

    print(f"{a_path.name}  ->  {b_path.name}\n")
    print(" Q   answer   retrieval   note")
    retrieval_drift, ratios = [], []

    for qid in sorted(set(a_items) | set(b_items)):
        ia, ib = a_items.get(qid, {}), b_items.get(qid, {})
        ratio = similarity(ia.get("toolAnswer", ""), ib.get("toolAnswer", ""))
        ratios.append(ratio)
        same_evidence = evidence_key(ia) == evidence_key(ib)
        if not same_evidence:
            retrieval_drift.append(qid)

        notes = []
        if not same_evidence:
            notes.append("RETRIEVAL CHANGED")
        # A capture defect fixed between runs shows up as a field gaining content.
        for field in ("toolUnverifiedMentions", "toolCoverage"):
            before, after = ia.get(field), ib.get(field)
            if not before and after:
                notes.append(f"{field} now captured")
        print(
            f"{qid:3d}   {ratio:5.0%}    {'same' if same_evidence else 'DIFFERENT':9}   "
            f"{'; '.join(notes)}"
        )

    mean = sum(ratios) / len(ratios) if ratios else 0
    print(f"\nMean answer similarity: {mean:.0%}")
    print(
        "Retrieval identical on every question."
        if not retrieval_drift
        else f"Retrieval differed on Q{', Q'.join(str(q) for q in retrieval_drift)} — investigate "
        "before using either run, because retrieval over a fixed index should be deterministic."
    )
    if mean < 1.0:
        print(
            "\nAnswer wording differs between runs. Report the run of record and note that the\n"
            "generation step is not deterministic; the marking applies to the recorded answers."
        )
    return not retrieval_drift


def self_test() -> None:
    import tempfile

    def gate(answer, path, score):
        return {
            "repository": "t",
            "items": [
                {"id": 1, "toolAnswer": answer,
                 "toolEvidence": [{"rank": 1, "path": path, "score": score}]}
            ],
        }

    with tempfile.TemporaryDirectory() as tmp:
        d = Path(tmp)
        (d / "a.json").write_text(json.dumps(gate("the slot is booked here", "src/a.ts", 0.5)))
        (d / "b.json").write_text(json.dumps(gate("the slot is booked here", "src/a.ts", 0.5)))
        assert compare(d / "a.json", d / "b.json") is True

        (d / "c.json").write_text(json.dumps(gate("the slot is booked here", "src/b.ts", 0.5)))
        # Same answer, different file retrieved: must fail, because that cannot be the model.
        assert compare(d / "a.json", d / "c.json") is False

    assert similarity("abc", "abc") == 1.0
    assert similarity("", "") == 1.0
    print("\nself-test OK: identical runs pass, retrieval drift fails")


if __name__ == "__main__":
    args = sys.argv[1:]
    if args == ["--self-test"]:
        self_test()
    elif len(args) == 2:
        sys.exit(0 if compare(Path(args[0]), Path(args[1])) else 1)
    else:
        print(__doc__)
