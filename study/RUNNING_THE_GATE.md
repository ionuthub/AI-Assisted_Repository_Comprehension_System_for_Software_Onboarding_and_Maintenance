# Running the accuracy gate

Four steps. Only the first and third need you.

## 1. Confirm the ground truth  — yours

Open `study/ground-truth.clinic-triage.md` and `study/ground-truth.warehouse-dispatch.md`.
For each question: open the files it cites, read the answer, decide whether it describes what
the code does. Correct it if not, then change the status line to:

    **Status: CONFIRMED — <date>.**

One repository per sitting. Roughly an hour each.

Do not open the tool before this is finished for both files.

## 2. Capture the tool's answers — automatic

Install once:

    npm install -D playwright && npx playwright install chromium

Then, per repository:

    node analysis/capture_gate.mjs \
      --repo https://github.com/ionuthub/clinic-triage \
      --gate study/accuracy-gate.clinic-triage.json \
      --truth study/ground-truth.clinic-triage.md

    node analysis/capture_gate.mjs \
      --repo https://github.com/ionuthub/warehouse-dispatch \
      --gate study/accuracy-gate.warehouse-dispatch.json \
      --truth study/ground-truth.warehouse-dispatch.md

Add `--headed` to watch it. It ingests the repository, asks all twelve questions, and records
each answer with the files retrieved, their scores, any unverified mentions and a full-page
screenshot. It writes into `toolAnswer` and leaves `correct` alone.

It refuses to run until every answer in the ground-truth file is CONFIRMED. `--force`
overrides and records that it did.

## 3. Mark it — yours

In each gate file set `"correct": true` or `false` per item, comparing `toolAnswer` against
`correctAnswer`. Partial credit is not available: the proposal commits to a binary judgement,
so an answer that names the right file but misses two of the four places a thing happens is
incorrect. Have a second marker check a sample independently.

## 4. Score it — automatic

    python3 analysis/accuracy_gate.py study/accuracy-gate.*.json

Prints the accuracy figure for AE2 and writes `seeded_candidates.json` — the only legitimate
source of seeded items for the over-trust probes.

## If the figure comes out low

That is the gate doing its job, and these answers are demanding: several assert that a
declared behaviour never reaches the running application, which a tool retrieving three
excerpts cannot establish. Report the figure, say what the questions asked, and discuss it with
your supervisor before designing around it. Do not revise the ground truth to raise the number.
