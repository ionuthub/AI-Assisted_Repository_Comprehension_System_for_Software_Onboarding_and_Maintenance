#!/usr/bin/env python3
"""
Mechanically checks every file:line citation in a ground-truth worksheet.

The prose in a ground-truth answer needs a human reader: whether a sentence accurately
describes what code does is a judgement, and the whole point of the gate is that the judgement
is the researcher's. The citations are different. Whether `banding.ts:15-29` actually spans the
function it claims to is a fact about the file, and checking it by eye across 24 questions and
roughly 120 references is exactly the sort of task a person does badly and a script does
perfectly.

Every defect found in the draft answers so far has been a citation defect, ranges that stopped
one line before the closing brace, and one range that ran two unrelated exports together. All
of them are caught here.

Three checks per reference:

  1. The file exists and the lines are inside it.
  2. If the range starts on a declaration, the range ends where that declaration ends. Brace,
     bracket and parenthesis depth is counted from the first line; the construct closes when
     depth returns to zero. A range ending early is the off-by-one; a range ending late usually
     means two declarations have been merged into one citation.
  3. A range that starts mid-construct is reported for review rather than failed, since citing
     an interesting interior region is sometimes what you want.

Usage:
    python3 check_citations.py <worksheet.md> <repo-root>
    python3 check_citations.py --self-test
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from gate_worksheet import parse  # noqa: E402  (same directory, shared parser)

CITATION_RE = re.compile(r"^([\w./-]+\.\w+)\s*:\s*(\d+)(?:\s*-\s*(\d+))?\s*$")
# A line that opens a named declaration. The second alternative covers object members,
# `acceptReferral: (id, override) => {` and `emit<K>(event, payload): void {`, which is how
# most of a Zustand store and every class method is written, and which the answers cite
# constantly.
#
# The second alternative excludes control-flow keywords: `if (`, `for (` and `switch (` all
# look like a member declaration to a pattern matching "word, then bracket", and a citation
# beginning on a conditional was being measured against the enclosing function.
DECLARATION_RE = re.compile(
    r"^\s*(?:export\s+)?(?:default\s+)?"
    r"(?:async\s+)?(?:function|const|let|var|class|interface|type|enum)\s+\w+"
    r"|^\s*(?!(?:if|for|while|switch|catch|return|throw|await|do|else)\b)"
    r"\w+\s*(?::\s*(?:async\s*)?(?:<[^>]*>\s*)?\(|\()"
)
OPENERS, CLOSERS = "{[(", "}])"


def strip_noise(line: str) -> str:
    """Removes string literals, template literals and line comments before counting depth."""
    line = re.sub(r"//.*$", "", line)
    line = re.sub(r'"(?:[^"\\]|\\.)*"', '""', line)
    line = re.sub(r"'(?:[^'\\]|\\.)*'", "''", line)
    line = re.sub(r"`(?:[^`\\]|\\.)*`", "``", line)
    return line


def construct_end(lines: list[str], start: int) -> int | None:
    """
    Last line of the declaration beginning at `start` (1-indexed), or None if the first line
    opens nothing, a one-line `export const x = 1;` is complete in itself.
    """
    depth = 0
    opened = False
    for n in range(start - 1, len(lines)):
        for ch in strip_noise(lines[n]):
            if ch in OPENERS:
                depth += 1
                opened = True
            elif ch in CLOSERS:
                depth -= 1
        if opened and depth <= 0:
            # Brackets are balanced, but a concise arrow body continues past them:
            #   export const redactStage: ApiStage = async (request, next) =>
            #     await next({ ...request, body: redactBody(request.body) });
            # The parameter list closes on the first line while the declaration does not, so
            # keep going until a line actually terminates the statement.
            if strip_noise(lines[n]).rstrip().endswith((";", "}", ",")):
                return n + 1
            continue
        # A declaration that opens nothing on its own first line is complete on that line,
        # `export type ReferralType = "routine" | "urgent";` is the whole thing. Without this,
        # the scan ran on into the *next* declaration and reported the citation as too short.
        if n == start - 1 and not opened:
            return None
    return None if not opened else len(lines)


def check_reference(ref: str, root: Path) -> tuple[str, str]:
    """Returns (status, message) where status is PASS, FAIL or NOTE."""
    m = CITATION_RE.match(ref.strip())
    if not m:
        return "FAIL", f"{ref!r} is not a file:line or file:start-end reference"

    rel, start_s, end_s = m.group(1), m.group(2), m.group(3)
    path = root / rel
    if not path.is_file():
        return "FAIL", f"{rel} does not exist"

    lines = path.read_text(errors="ignore").splitlines()
    start = int(start_s)
    end = int(end_s) if end_s else start

    if start < 1 or end > len(lines):
        return "FAIL", f"{rel} has {len(lines)} lines; cited {start}-{end}"
    if end < start:
        return "FAIL", f"{rel}:{start}-{end} ends before it starts"

    first = lines[start - 1]
    if not DECLARATION_RE.match(first):
        return "NOTE", f"{rel}:{start} starts mid-construct, {first.strip()[:60]!r}"

    actual_end = construct_end(lines, start)
    if actual_end is None or actual_end == end:
        return "PASS", f"{rel}:{start}-{end}"
    if end < actual_end:
        return "FAIL", (
            f"{rel}:{start}-{end} stops short, the declaration on line {start} "
            f"closes on line {actual_end}"
        )

    # The range runs past its first declaration. That is only a defect if it also stops
    # part-way through a later one. Citing a whole file, or a group of related exports, is
    # legitimate and common, `registry.ts:8-18` covering the handler map and both functions
    # that use it says something a single declaration cannot. So walk forward through the
    # declarations the range contains and accept it if the last one closes exactly on `end`.
    spanned, cursor = 1, actual_end + 1
    while cursor <= end:
        if not DECLARATION_RE.match(lines[cursor - 1]):
            cursor += 1
            continue
        cursor_end = construct_end(lines, cursor)
        if cursor_end is None:
            cursor += 1
            continue
        spanned += 1
        if cursor_end == end:
            return "PASS", f"{rel}:{start}-{end} (spans {spanned} declarations)"
        if cursor_end > end:
            return "FAIL", (
                f"{rel}:{start}-{end} ends inside the declaration beginning on line "
                f"{cursor}, which closes on line {cursor_end}"
            )
        cursor = cursor_end + 1

    return "FAIL", (
        f"{rel}:{start}-{end} ends on line {end}, which does not close any declaration "
        f"the range contains"
    )


def run(worksheet: Path, root: Path) -> bool:
    blocks = parse(worksheet.read_text())
    failures = 0
    for qid in sorted(blocks):
        refs = [r.strip("-* ").strip() for r in blocks[qid]["files"].splitlines()]
        refs = [r for r in refs if r]
        if not refs:
            continue
        print(f"\nQ{qid}")
        for ref in refs:
            status, message = check_reference(ref, root)
            print(f"  [{status}] {message}")
            failures += status == "FAIL"

    print(f"\n{failures} citation problem{'' if failures == 1 else 's'}.")
    if failures:
        print("Prose is not checked here, only whether each reference points where it claims.")
    return failures == 0


def self_test() -> None:
    """Validates the depth counter against cases that have actually occurred."""
    import tempfile

    src = """\
export interface Thing {
  a: number;
}

export function calculate(x: number): number {
  const y = {
    z: 1,
  };
  return x + y.z;
}

export const rules = [
  { id: "a" },
  { id: "b" },
];

export const thresholds = [
  { minimum: 9 },
];
"""
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        (root / "f.ts").write_text(src)

        # The exact defect found in the draft answers: a range one line short of the brace.
        status, msg = check_reference("f.ts:5-9", root)
        assert status == "FAIL" and "closes on line 10" in msg, msg
        assert check_reference("f.ts:5-10", root)[0] == "PASS"

        # A range spanning several whole declarations is legitimate: citing a group of
        # related exports says something no single one does.
        status, msg = check_reference("f.ts:12-19", root)
        assert status == "PASS" and "spans 2" in msg, msg
        assert check_reference("f.ts:12-15", root)[0] == "PASS"
        assert check_reference("f.ts:17-19", root)[0] == "PASS"
        # But a range that stops part-way through a later declaration is still a defect.
        status, msg = check_reference("f.ts:12-18", root)
        assert status == "FAIL" and "ends inside" in msg, msg

        # Braces inside strings must not be counted, or every range containing a template
        # literal would be misjudged.
        (root / "g.ts").write_text('export const s = {\n  t: "a { b",\n};\n')
        assert check_reference("g.ts:1-3", root)[0] == "PASS"

        assert check_reference("missing.ts:1-2", root)[0] == "FAIL"
        assert check_reference("f.ts:1-999", root)[0] == "FAIL"
        # A single interior line is legitimate evidence and must not fail.
        assert check_reference("f.ts:9", root)[0] == "NOTE"

    print("self-test OK: short ranges, overrunning ranges, strings and bad paths all handled")


if __name__ == "__main__":
    args = sys.argv[1:]
    if args == ["--self-test"]:
        self_test()
    elif len(args) == 2:
        sys.exit(0 if run(Path(args[0]), Path(args[1])) else 1)
    else:
        print(__doc__)
