#!/usr/bin/env python3
"""
Analysis pipeline for the controlled evaluation.

Implements exactly what the AE1 proposal commits to:
  H1  time      : faster task completion with the tool     (Wilcoxon signed-rank, paired)
  H2  accuracy  : higher task accuracy with the tool       (Wilcoxon signed-rank on per-participant accuracy)
  H3  workload  : lower NASA-TLX with the tool             (Wilcoxon signed-rank, paired)
  H4  usability : SUS above the published average of 68    (one-sample Wilcoxon vs 68; Bangor et al. 2008)
Significance threshold p < 0.05; effect size = matched-pairs rank-biserial correlation.
Also reports: over-trust detection rate on seeded tasks, and the confidence-accuracy gap.

Input: a directory of session JSON files exported by the Evaluation page
(one file per participant per condition: session_P01_manual.json, session_P01_tool.json).

Usage:
  python3 analyze_sessions.py ./sessions_dir
  python3 analyze_sessions.py --self-test        # validates the statistics implementation

The pipeline is an instrument. It computes; it does not generate data.
"""

import json
import sys
from pathlib import Path
from collections import defaultdict

from scipy import stats


# ---------- statistics ----------

def wilcoxon_paired(a: list[float], b: list[float]):
    """Wilcoxon signed-rank test on paired samples, plus rank-biserial effect size.

    Rank-biserial for matched pairs (Kerby 2014): r = (W+ - W-) / (W+ + W-),
    computed over non-zero differences. Sign convention: positive r means b > a.
    """
    diffs = [y - x for x, y in zip(a, b) if y - x != 0]
    if len(diffs) < 1:
        return {"n_nonzero": 0, "p": None, "r_rank_biserial": None, "note": "no non-zero differences"}
    res = stats.wilcoxon(a, b, zero_method="wilcox", alternative="two-sided", method="auto")
    ranks = stats.rankdata([abs(d) for d in diffs])
    w_plus = sum(r for r, d in zip(ranks, diffs) if d > 0)
    w_minus = sum(r for r, d in zip(ranks, diffs) if d < 0)
    r_rb = (w_plus - w_minus) / (w_plus + w_minus)
    return {"n_nonzero": len(diffs), "statistic": float(res.statistic),
            "p": float(res.pvalue), "r_rank_biserial": round(r_rb, 3)}


def wilcoxon_one_sample(values: list[float], mu: float):
    """One-sample Wilcoxon signed-rank against a benchmark (H4: SUS vs 68)."""
    diffs = [v - mu for v in values if v != mu]
    if not diffs:
        return {"n_nonzero": 0, "p": None, "r_rank_biserial": None}
    res = stats.wilcoxon([v - mu for v in values], alternative="greater", method="auto")
    ranks = stats.rankdata([abs(d) for d in diffs])
    w_plus = sum(r for r, d in zip(ranks, diffs) if d > 0)
    w_minus = sum(r for r, d in zip(ranks, diffs) if d < 0)
    r_rb = (w_plus - w_minus) / (w_plus + w_minus)
    return {"n_nonzero": len(diffs), "statistic": float(res.statistic),
            "p": float(res.pvalue), "r_rank_biserial": round(r_rb, 3)}


# ---------- session ingestion ----------

def load_sessions(directory: Path):
    """participant -> condition -> session payload"""
    data: dict[str, dict[str, dict]] = defaultdict(dict)
    for f in sorted(directory.glob("*.json")):
        payload = json.loads(f.read_text())
        s = payload["session"]
        data[s["participantId"]][s["condition"]] = payload
    return data


def task_max_score(kind: str) -> int:
    """Points available: locating is binary, applied and retention are scored 0-2."""
    return 1 if kind == "locating" else 2


def task_score(task: dict):
    """The task's score out of task_max_score(kind), or None while it is unmarked.

    Mirrors taskScore in src/lib/evaluation/session.ts, and reads the `score` field the export
    now carries when it is present rather than re-deriving it.
    """
    if task.get("score") is not None:
        return task["score"]
    if task.get("kind") == "locating":
        correct = task.get("isCorrect")
        return None if correct is None else (1 if correct else 0)
    return task.get("points")


def per_participant_measures(payload: dict):
    s = payload["session"]
    tasks = s["tasks"]
    total_time = sum(t["elapsedSeconds"] for t in tasks)

    # Accuracy is points earned over points available, not the proportion of tasks marked
    # correct. Applied and retention tasks are scored 0-2 by the rubric, so counting them as
    # binary would discard every half-credit answer - the exact cases the rubric exists to
    # record - and would weight a locating point equally with a two-point applied task.
    scored = [t for t in tasks if task_score(t) is not None]
    earned = sum(task_score(t) for t in scored)
    available = sum(task_max_score(t["kind"]) for t in scored)
    accuracy = (earned / available) if available else None

    seeded = [t for t in tasks if t.get("seededInaccurate")]
    # errorDetected is tri-state: True (flagged), False (asked, not flagged), None (the
    # probe was never administered - it is only shown in the tool condition, and an
    # observer may skip it). Unadministered probes must not sit in the denominator, or the
    # detection rate is deflated by items no participant was ever asked about.
    administered = [t for t in seeded if t.get("errorDetected") is not None]
    detected = [t for t in administered if t["errorDetected"] is True]
    # Confidence is null until the observer records it, so a task with no rating is excluded
    # rather than counted at a default. "Correct" here means full marks for the task's kind: a
    # 1 of 2 is neither a correct nor an incorrect answer and belongs in neither group.
    rated = [t for t in scored if t.get("confidence") is not None]
    conf_correct = [t["confidence"] for t in rated if task_score(t) == task_max_score(t["kind"])]
    conf_incorrect = [t["confidence"] for t in rated if task_score(t) == 0]
    return {
        "total_time_s": total_time,
        "accuracy": accuracy,
        "points_earned": earned,
        "points_available": available,
        "unmarked_tasks": len(tasks) - len(scored),
        "unrated_confidence": len(scored) - len(rated),
        "sus": payload["scores"]["sus"],
        "tlx": payload["scores"]["tlxRaw"],
        "seeded_n": len(seeded),
        "seeded_administered": len(administered),
        "seeded_detected": len(detected),
        "mean_conf_correct": (sum(conf_correct) / len(conf_correct)) if conf_correct else None,
        "mean_conf_incorrect": (sum(conf_incorrect) / len(conf_incorrect)) if conf_incorrect else None,
    }


def analyze(directory: Path):
    sessions = load_sessions(directory)
    paired = {p: c for p, c in sessions.items() if "manual" in c and "tool" in c}
    incomplete = sorted(set(sessions) - set(paired))
    if incomplete:
        print(f"[warn] excluded (missing a condition): {incomplete}")
    if len(paired) < 2:
        print("Need at least 2 complete participant pairs for paired tests.")
        return

    m = {p: per_participant_measures(c["manual"]) for p, c in paired.items()}
    t = {p: per_participant_measures(c["tool"]) for p, c in paired.items()}
    order = sorted(paired)

    print(f"\nParticipants with both conditions: n = {len(order)}\n")

    # H1 time (lower is better with tool)
    h1 = wilcoxon_paired([m[p]["total_time_s"] for p in order], [t[p]["total_time_s"] for p in order])
    print("H1 task time   (manual vs tool):", h1)

    # H2 accuracy
    pairs = [(m[p]["accuracy"], t[p]["accuracy"]) for p in order
             if m[p]["accuracy"] is not None and t[p]["accuracy"] is not None]
    h2 = wilcoxon_paired([a for a, _ in pairs], [b for _, b in pairs]) if len(pairs) >= 2 else "insufficient scored tasks"
    print("H2 accuracy    (manual vs tool):", h2)

    # H3 workload (TLX). An instrument that was not completed exports a null score rather than
    # a figure derived from the answered subscales, so those participants are dropped from the
    # pair and the exclusion is printed rather than absorbed.
    tlx_pairs = [(m[p]["tlx"], t[p]["tlx"]) for p in order
                 if m[p]["tlx"] is not None and t[p]["tlx"] is not None]
    h3 = (wilcoxon_paired([a for a, _ in tlx_pairs], [b for _, b in tlx_pairs])
          if len(tlx_pairs) >= 2 else "insufficient complete TLX responses")
    print("H3 NASA-TLX    (manual vs tool):", h3)
    if len(tlx_pairs) < len(order):
        print(f"   excluded {len(order) - len(tlx_pairs)} participant(s) with an incomplete TLX")

    # H4 usability: tool-condition SUS vs benchmark 68
    sus_tool = [t[p]["sus"] for p in order if t[p]["sus"] is not None]
    if len(sus_tool) < 2:
        print("H4 SUS > 68    (tool condition):", "insufficient complete SUS responses")
    else:
        h4 = wilcoxon_one_sample(sus_tool, 68.0)
        print(f"H4 SUS > 68    (tool condition, mean={sum(sus_tool)/len(sus_tool):.1f}):", h4)
        if len(sus_tool) < len(order):
            print(f"   excluded {len(order) - len(sus_tool)} participant(s) with an incomplete SUS")

    # Over-trust: detection rate on seeded tasks (tool condition)
    seeded_total = sum(t[p]["seeded_n"] for p in order)
    seeded_administered = sum(t[p]["seeded_administered"] for p in order)
    seeded_detected = sum(t[p]["seeded_detected"] for p in order)
    if seeded_administered:
        print(f"\nOver-trust probe: {seeded_detected}/{seeded_administered} seeded errors detected "
              f"({100 * seeded_detected / seeded_administered:.0f}% detection rate)")
        skipped = seeded_total - seeded_administered
        if skipped:
            print(f"  [warn] {skipped} of {seeded_total} seeded task(s) had no recorded probe "
                  f"and are excluded from the rate. Report this figure in AE2.")
    elif seeded_total:
        print(f"\nOver-trust probe: {seeded_total} seeded task(s) present but none had a recorded "
              f"probe response - detection rate cannot be computed.")
    else:
        print("\nOver-trust probe: no seeded tasks found in tool sessions")

    # Confidence-accuracy gap (tool condition)
    cc = [t[p]["mean_conf_correct"] for p in order if t[p]["mean_conf_correct"] is not None]
    ci = [t[p]["mean_conf_incorrect"] for p in order if t[p]["mean_conf_incorrect"] is not None]
    if cc and ci:
        print(f"Confidence-accuracy gap (tool): mean confidence when correct {sum(cc)/len(cc):.2f} "
              f"vs when incorrect {sum(ci)/len(ci):.2f}")
    print("\nInterpretation threshold per proposal: p < 0.05; report rank-biserial r alongside every test.")
    print("Reminder: with n in the 12-20 range this analysis is exploratory (Wohlin et al., 2012).")


# ---------- self-test: validate the instrument, not the data ----------

def self_test():
    """Validates the statistics against hand-checkable cases. Not study data."""
    # Known case: strictly increasing differences -> all positive ranks -> r = +1
    a = [10, 12, 14, 16, 18, 20]
    b = [12, 15, 17, 20, 23, 26]
    r = wilcoxon_paired(a, b)
    assert r["r_rank_biserial"] == 1.0, r
    # Symmetric case -> r = 0
    a2 = [1, 2, 3, 4]
    b2 = [2, 1, 4, 3]
    r2 = wilcoxon_paired(a2, b2)
    assert abs(r2["r_rank_biserial"]) < 1e-9, r2
    # One-sample: all above benchmark -> r = +1, one-sided p small for n=8
    r3 = wilcoxon_one_sample([70, 72, 75, 80, 81, 85, 90, 74], 68.0)
    assert r3["r_rank_biserial"] == 1.0 and r3["p"] < 0.05, r3
    print("self-test OK: Wilcoxon + rank-biserial implementations validated")


if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "--self-test":
        self_test()
    elif len(sys.argv) == 2:
        analyze(Path(sys.argv[1]))
    else:
        print(__doc__)
