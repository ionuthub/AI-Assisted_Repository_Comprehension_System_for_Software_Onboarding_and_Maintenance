#!/usr/bin/env python3
"""
Accuracy gate scorer.

The proposal commits to measuring the tool's own QA accuracy against a ground-truth
set BEFORE any participants, using the result as (a) an interpretation gate and
(b) the source of known-inaccurate cases to seed as over-trust probes.

Workflow (all steps performed by the researcher; this script only aggregates):
 1. Write questions + correct answers in a gate file (see study/accuracy-gate.template.json).
 2. Ask the tool each question on each repository; paste its answer into "toolAnswer".
 3. Mark each as correct true/false (second-marker spot check per the proposal).
 4. Run:  python3 accuracy_gate.py ../study/accuracy-gate.repoA.json [more files...]

Outputs per-repo and overall accuracy, and lists every incorrect item as a
candidate seeded task, ready to copy into the answer key's seededAnswerShown.
"""

import json
import sys
from pathlib import Path


def score(paths: list[str]):
    overall_total = overall_correct = 0
    seeded_candidates = []
    for p in paths:
        gate = json.loads(Path(p).read_text())
        items = gate["items"]
        unmarked = [i["id"] for i in items if i.get("correct") is None]
        if unmarked:
            print(f"[{gate.get('repository', p)}] UNMARKED items {unmarked} - mark before scoring.")
            continue
        total = len(items)
        correct = sum(1 for i in items if i["correct"])
        overall_total += total
        overall_correct += correct
        print(f"[{gate.get('repository', p)}] accuracy: {correct}/{total} ({100*correct/total:.0f}%)")
        for i in items:
            if not i["correct"]:
                seeded_candidates.append({
                    "repository": gate.get("repository", p),
                    "question": i["question"],
                    "correctAnswer": i["correctAnswer"],
                    "toolAnswer": i["toolAnswer"],
                })
    if overall_total:
        print(f"\nOverall gate accuracy: {overall_correct}/{overall_total} "
              f"({100*overall_correct/overall_total:.0f}%)")
        print("Report this figure in AE2 and use it when interpreting H2.")
    if seeded_candidates:
        print(f"\n{len(seeded_candidates)} candidate seeded (known-inaccurate) items:")
        for c in seeded_candidates:
            print(f"  - [{c['repository']}] {c['question']}\n"
                  f"      tool said: {c['toolAnswer'][:100]}")
        out = Path("seeded_candidates.json")
        out.write_text(json.dumps(seeded_candidates, indent=2))
        print(f"\nWritten to {out} - copy real entries into the study answer key's seededAnswerShown.")
    else:
        print("\nNo incorrect answers found. If the gate shows near-perfect accuracy, "
              "widen the question set before concluding the over-trust probe is infeasible.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
    else:
        score(sys.argv[1:])
