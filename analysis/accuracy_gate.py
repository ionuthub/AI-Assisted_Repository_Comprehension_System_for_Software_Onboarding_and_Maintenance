#!/usr/bin/env python3
"""Fail-closed scorer for the two-repository accuracy gate.

Every gate item must carry a non-empty question, frozen correct answer, captured tool answer,
and an explicit boolean verdict. Both study repositories must be present. Validation happens
before any score or seeded candidate is emitted, so a partial run cannot look like a clean one.
"""

import json
import sys
from pathlib import Path
from typing import Any


EXPECTED_REPOSITORIES = {"clinic-triage", "warehouse-dispatch"}
OUTPUT = Path("seeded_candidates.json")


def load_and_validate(paths: list[str]) -> tuple[list[dict[str, Any]], list[str]]:
    errors: list[str] = []
    gates: list[dict[str, Any]] = []

    if len(paths) != len(EXPECTED_REPOSITORIES):
        errors.append(
            f"expected {len(EXPECTED_REPOSITORIES)} gate files "
            f"({', '.join(sorted(EXPECTED_REPOSITORIES))}); received {len(paths)}"
        )

    for raw_path in paths:
        path = Path(raw_path)
        try:
            gate = json.loads(path.read_text())
        except (OSError, json.JSONDecodeError) as exc:
            errors.append(f"{path}: cannot read valid JSON: {exc}")
            continue

        repository = gate.get("repository")
        label = repository or str(path)
        if not isinstance(repository, str) or not repository.strip():
            errors.append(f"{path}: repository is blank")

        items = gate.get("items")
        if not isinstance(items, list) or not items:
            errors.append(f"[{label}] items must be a non-empty list")
            continue

        seen_ids: set[Any] = set()
        for position, item in enumerate(items, start=1):
            if not isinstance(item, dict):
                errors.append(f"[{label}] item {position} is not an object")
                continue
            qid = item.get("id", f"position {position}")
            if qid in seen_ids:
                errors.append(f"[{label}] duplicate item id {qid}")
            seen_ids.add(qid)

            for field in ("question", "correctAnswer", "toolAnswer"):
                value = item.get(field)
                if not isinstance(value, str) or not value.strip():
                    errors.append(f"[{label}] Q{qid} has a blank {field}")
            if not isinstance(item.get("correct"), bool):
                errors.append(f"[{label}] Q{qid} correct must be true or false")

        gates.append(gate)

    repositories = [gate.get("repository") for gate in gates if isinstance(gate.get("repository"), str)]
    if len(repositories) != len(set(repositories)):
        errors.append("repository names must be unique")
    found = set(repositories)
    if found != EXPECTED_REPOSITORIES:
        errors.append(
            "repository set is incomplete or unexpected: "
            f"expected {sorted(EXPECTED_REPOSITORIES)}, found {sorted(found)}"
        )

    return gates, errors


def score(paths: list[str], output: Path = OUTPUT) -> bool:
    gates, errors = load_and_validate(paths)
    if errors:
        if output.exists():
            output.unlink()
            print(f"Removed stale {output}; the current gate did not validate.")
        print("Accuracy gate validation failed:")
        for error in errors:
            print(f"  - {error}")
        print("Nothing was scored and no seeded candidates were written.")
        return False

    overall_total = 0
    overall_correct = 0
    seeded_candidates = []

    for gate in gates:
        items = gate["items"]
        correct = sum(1 for item in items if item["correct"])
        total = len(items)
        overall_total += total
        overall_correct += correct
        print(f"[{gate['repository']}] accuracy: {correct}/{total} ({100 * correct / total:.0f}%)")

        for item in items:
            if not item["correct"]:
                seeded_candidates.append(
                    {
                        "repository": gate["repository"],
                        "question": item["question"],
                        "correctAnswer": item["correctAnswer"],
                        "toolAnswer": item["toolAnswer"],
                    }
                )

    print(
        f"\nOverall gate accuracy: {overall_correct}/{overall_total} "
        f"({100 * overall_correct / overall_total:.0f}%)"
    )
    print("Report this figure in AE2 and use it when interpreting H2.")

    if seeded_candidates:
        print(f"\n{len(seeded_candidates)} candidate seeded (known-inaccurate) items:")
        for candidate in seeded_candidates:
            print(
                f"  - [{candidate['repository']}] {candidate['question']}\n"
                f"      tool said: {candidate['toolAnswer'][:100]}"
            )
        output.write_text(json.dumps(seeded_candidates, indent=2) + "\n")
        print(f"\nWritten to {output} - copy real entries into the study answer key's seededAnswerShown.")
    else:
        if output.exists():
            output.unlink()
        print("\nNo incorrect answers found. No seeded-candidate file was written.")

    return True


def self_test() -> None:
    complete = {
        "items": [
            {
                "id": 1,
                "question": "Question?",
                "correctAnswer": "Truth",
                "toolAnswer": "Answer",
                "correct": False,
            }
        ]
    }
    clinic = {"repository": "clinic-triage", **complete}
    warehouse = {"repository": "warehouse-dispatch", **complete}

    import tempfile

    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        paths = []
        for name, gate in (("clinic.json", clinic), ("warehouse.json", warehouse)):
            path = root / name
            path.write_text(json.dumps(gate))
            paths.append(str(path))

        _, errors = load_and_validate(paths)
        assert errors == [], errors

        broken = dict(warehouse)
        broken["items"] = [{**complete["items"][0], "correct": None}]
        (root / "warehouse.json").write_text(json.dumps(broken))
        _, errors = load_and_validate(paths)
        assert any("true or false" in error for error in errors), errors

        _, errors = load_and_validate(paths[:1])
        assert any("expected 2 gate files" in error for error in errors), errors

    print("self-test OK: complete pairs pass; unmarked and partial repository sets fail")


if __name__ == "__main__":
    if sys.argv[1:] == ["--self-test"]:
        self_test()
    elif not sys.argv[1:]:
        print(__doc__)
        raise SystemExit(2)
    else:
        raise SystemExit(0 if score(sys.argv[1:]) else 1)
