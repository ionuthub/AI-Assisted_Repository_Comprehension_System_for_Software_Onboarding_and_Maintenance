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
    python3 compare_runs.py --latest study/accuracy-gate.clinic-triage.json
    python3 compare_runs.py --self-test
"""
import json
import re
import sys
from difflib import SequenceMatcher
from pathlib import Path


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a or "", b or "").ratio()


def evidence_key(item: dict) -> list[tuple]:
    return [(e.get("rank"), e.get("path"), e.get("score")) for e in item.get("toolEvidence") or []]


PATH_RE = re.compile(r"\bsrc/[\w./-]+\.\w+")


def paths_named(item: dict) -> set:
    """
    Source files the answer names.

    Textual similarity is a poor measure of whether two answers say the same thing: the same
    claim rephrased scores low, and two different claims in the same house style score high.
    For a question of the form "where does X happen", the set of files named is much closer to
    the actual content of the answer, and it is what marking turns on.
    """
    return set(PATH_RE.findall(item.get("toolAnswer") or ""))


def capture_signature(gate: dict) -> dict:
    """Configuration that must be fixed before retrieval is expected to be identical."""
    return {
        "repository": gate.get("repository"),
        "capturedRepository": gate.get("capturedRepository"),
        "toolVersion": gate.get("toolVersion"),
        "model": gate.get("model"),
        "retrieval": gate.get("retrieval"),
        "generation": gate.get("generation"),
    }


def latest_comparable(current_path: Path) -> Path | None:
    current = json.loads(current_path.read_text())
    repository = current.get("repository")
    archive = current_path.parent / "gate-runs"
    pattern = re.compile(rf"^{re.escape(str(repository))}-run(\d+)\.json$")
    candidates = []
    for path in archive.glob(f"{repository}-run*.json"):
        match = pattern.match(path.name)
        if match:
            candidates.append((int(match.group(1)), path))

    for _, path in sorted(candidates, reverse=True):
        archived = json.loads(path.read_text())
        if capture_signature(archived) != capture_signature(current):
            continue
        if not all(str(item.get("toolAnswer") or "").strip() for item in archived.get("items", [])):
            continue
        return path
    return None


def compare(a_path: Path, b_path: Path) -> bool:
    a, b = json.loads(a_path.read_text()), json.loads(b_path.read_text())
    if capture_signature(a) != capture_signature(b):
        print(f"{a_path.name}  ->  {b_path.name}\n")
        print("CAPTURE CONFIGURATION CHANGED; retrieval determinism cannot be tested across these runs.")
        print(f"before: {json.dumps(capture_signature(a), sort_keys=True)}")
        print(f"after:  {json.dumps(capture_signature(b), sort_keys=True)}")
        return False
    a_items = {i["id"]: i for i in a["items"]}
    b_items = {i["id"]: i for i in b["items"]}

    print(f"{a_path.name}  ->  {b_path.name}\n")
    print(" Q   wording   files named   retrieval   note")
    retrieval_drift, ratios, overlaps = [], [], []

    for qid in sorted(set(a_items) | set(b_items)):
        ia, ib = a_items.get(qid, {}), b_items.get(qid, {})
        ratio = similarity(ia.get("toolAnswer", ""), ib.get("toolAnswer", ""))
        ratios.append(ratio)
        pa, pb = paths_named(ia), paths_named(ib)
        overlap = len(pa & pb) / len(pa | pb) if (pa | pb) else 1.0
        overlaps.append(overlap)
        same_evidence = evidence_key(ia) == evidence_key(ib)
        if not same_evidence:
            retrieval_drift.append(qid)

        notes = []
        if not same_evidence:
            notes.append("RETRIEVAL CHANGED")
        # State only the observable difference. A field can become non-empty because answer
        # wording changed, so calling it "now captured" would wrongly diagnose a selector fix.
        for field in ("toolUnverifiedMentions", "toolCoverage"):
            before, after = ia.get(field), ib.get(field)
            if not before and after:
                notes.append(f"{field} now non-empty")
        print(
            f"{qid:3d}   {ratio:5.0%}     {overlap:5.0%}       "
            f"{'same' if same_evidence else 'DIFFERENT':9}   {'; '.join(notes)}"
        )

    mean = sum(ratios) / len(ratios) if ratios else 0
    mean_paths = sum(overlaps) / len(overlaps) if overlaps else 0
    print(f"\nMean wording similarity: {mean:.0%}")
    print(f"Mean overlap in files named: {mean_paths:.0%}  <- the substantive measure")
    print(
        "Retrieval identical on every question."
        if not retrieval_drift
        else f"Retrieval differed on Q{', Q'.join(str(q) for q in retrieval_drift)} — investigate "
        "before using either run, because retrieval over a fixed index should be deterministic."
    )
    if mean < 1.0:
        print(
            "\nAnswer wording differs between runs. Report the run of record and note that the\n"
            "generation step is not deterministic; the marking applies to the recorded answers.\n"
            "Wording similarity is the weaker signal — two runs can say the same thing in very\n"
            "different words. Overlap in the files named is the one to quote when arguing that a\n"
            "single run's marking would have held."
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
        same = gate("the slot is booked here", "src/a.ts", 0.5)
        same.update({"toolVersion": "abc", "model": "model", "retrieval": {"topK": 3}})
        (d / "a.json").write_text(json.dumps(same))
        (d / "b.json").write_text(json.dumps(same))
        assert compare(d / "a.json", d / "b.json") is True

        drift = gate("the slot is booked here", "src/b.ts", 0.5)
        drift.update({"toolVersion": "abc", "model": "model", "retrieval": {"topK": 3}})
        (d / "c.json").write_text(json.dumps(drift))
        # Same answer, different file retrieved: must fail, because that cannot be the model.
        assert compare(d / "a.json", d / "c.json") is False

        changed = json.loads(json.dumps(same))
        changed["toolVersion"] = "def"
        (d / "changed.json").write_text(json.dumps(changed))
        assert compare(d / "a.json", d / "changed.json") is False

    assert similarity("abc", "abc") == 1.0
    assert similarity("", "") == 1.0
    print("\nself-test OK: identical runs pass, retrieval drift fails")


if __name__ == "__main__":
    args = sys.argv[1:]
    if args == ["--self-test"]:
        self_test()
    elif len(args) == 2 and args[0] == "--latest":
        current = Path(args[1])
        previous = latest_comparable(current)
        if previous is None:
            print(f"No archived capture matches the configuration in {current}.")
            sys.exit(1)
        sys.exit(0 if compare(previous, current) else 1)
    elif len(args) == 2:
        sys.exit(0 if compare(Path(args[0]), Path(args[1])) else 1)
    else:
        print(__doc__)
