#!/usr/bin/env python3
"""Fail-closed scorer for the two-repository accuracy gate."""

import json
import sys
from pathlib import Path
from typing import Any

EXPECTED_REPOSITORIES = {"clinic-triage", "warehouse-dispatch"}


def load_and_validate(paths: list[str]) -> tuple[list[dict[str, Any]], list[str]]:
    errors: list[str] = []
    gates: list[dict[str, Any]] = []

    if len(paths) != len(EXPECTED_REPOSITORIES):
        errors.append(f"expected two gate files; received {len(paths)}")

    for raw_path in paths:
        path = Path(raw_path)
        try:
            gate = json.loads(path.read_text())
        except (OSError, json.JSONDecodeError) as exc:
            errors.append(f"{path}: cannot read valid JSON: {exc}")
            continue

        repository = gate.get("repository")
        if repository not in EXPECTED_REPOSITORIES:
            errors.append(f"{path}: unexpected or missing repository")

        items = gate.get("items")
        if not isinstance(items, list) or not items:
            errors.append(f"[{repository or path}] items must be a non-empty list")
            continue

        for position, item in enumerate(items, start=1):
            if not isinstance(item, dict):
                errors.append(f"[{repository}] item {position} is not an object")
                continue
            qid = item.get("id", position)
            for field in ("question", "correctAnswer", "toolAnswer"):
                value = item.get(field)
                if not isinstance(value, str) or not value.strip():
                    errors.append(f"[{repository}] Q{qid} has a blank {field}")
            if not isinstance(item.get("correct"), bool):
                errors.append(f"[{repository}] Q{qid} correct must be true or false")

        gates.append(gate)

    found = {gate.get("repository") for gate in gates}
    if found != EXPECTED_REPOSITORIES:
        errors.append(f"repository set must be {sorted(EXPECTED_REPOSITORIES)}")

    return gates, errors


def score(paths: list[str]) -> bool:
    gates, errors = load_and_validate(paths)
    if errors:
        print("Accuracy gate validation failed:")
        for error in errors:
            print(f"  - {error}")
        return False

    overall_correct = 0
    overall_total = 0
    for gate in gates:
        correct = sum(1 for item in gate["items"] if item["correct"])
        total = len(gate["items"])
        overall_correct += correct
        overall_total += total
        print(f"[{gate['repository']}] accuracy: {correct}/{total} ({100 * correct / total:.1f}%)")

    print(f"Overall gate accuracy: {overall_correct}/{overall_total} ({100 * overall_correct / overall_total:.1f}%)")
    return True


if __name__ == "__main__":
    if not sys.argv[1:]:
        print(__doc__)
        raise SystemExit(2)
    raise SystemExit(0 if score(sys.argv[1:]) else 1)
