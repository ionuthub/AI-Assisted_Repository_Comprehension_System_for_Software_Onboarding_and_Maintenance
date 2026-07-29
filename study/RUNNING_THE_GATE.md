# Running the accuracy gate

Four steps. Only the first and third need you.

## 1. Settle and freeze the ground truth

Open `study/ground-truth.clinic-triage.md` and `study/ground-truth.warehouse-dispatch.md`.
The current files are frozen and stamped VERIFIED BY TOOL. They were established through the
machine-assisted process disclosed in `study/AI-DISCLOSURE.md`; do not silently describe that as
researcher confirmation. For a future gate, the stronger route is to open the cited files, read
each answer, decide whether it describes what the code does, and stamp it:

    **Status: CONFIRMED — <date>.**

The capture accepts either CONFIRMED, or VERIFIED BY TOOL only when
`--accept-tool-verified` is explicitly supplied. It checks that the ground-truth question IDs
and text exactly match every gate item; a missing or empty status list fails.

Do not open the tool before this is finished for both files.

## 2. Capture the tool's answers — automatic

Everything below runs **inside a clone of this repository**, not inside either study repository.
The study repositories are only ever fetched by the tool over the network; nothing is installed
into them and nothing is written to them.

If you do not already have this repository locally:

    git clone https://github.com/ionuthub/AI-Assisted_Repository_Comprehension_System_for_Software_Onboarding_and_Maintenance.git
    cd AI-Assisted_Repository_Comprehension_System_for_Software_Onboarding_and_Maintenance

Then, once:

    npm install
    npx playwright install chromium

The capture drives the deployed site, not the local checkout. Before a run, confirm the Vercel
deployment contains the exact commit being evaluated and record that SHA; otherwise the gate
JSON describes different code from the repository beside it.

The gate JSON also records the generation parameters. The current ceiling is 4,096 output
tokens; the earlier 2,000-token ceiling produced `MAX_TOKENS` on ordinary gate questions and is
therefore not a valid complete-answer capture.

`playwright` is already in `devDependencies`, so `npm install` fetches the library.
`playwright install chromium` downloads the browser it drives, which is a separate step and a
few hundred megabytes.

Then one command per repository:

    npm run gate:clinic
    npm run gate:warehouse

Both carry `--accept-tool-verified`, which is required because the ground truth is machine
verified rather than researcher-confirmed, and which records that fact in the gate file. To
watch it work, append `-- --headed`.

Add `--headed` to watch it. It ingests the repository, asks all twelve questions, and records
each answer with the files retrieved, their scores, any unverified mentions and a full-page
screenshot. It writes into `toolAnswer` and resets `correct` to null because any verdict on an
archived answer cannot transfer to newly generated wording.

To test retrieval reproducibility, repeat each capture once on the same deployed commit and run:

    npm run gate:compare

The comparison selects the newest archived run with the same commit, model, retrieval, and
generation settings. It refuses to compare across an instrument change, because different
tokenization or corpus rules legitimately change TF-IDF scores.

It refuses to run until every answer is CONFIRMED, or VERIFIED BY TOOL when the package scripts'
explicit `--accept-tool-verified` flag is present. `--force` overrides and records that it did.
Do not use `--force` for the study run.

## 3. Populate the frozen answers and mark the capture

First collect the already-frozen answers into the gate JSON; this does not set a verdict:

    python3 analysis/gate_worksheet.py collect study/accuracy-gate.clinic-triage.json study/ground-truth.clinic-triage.md
    python3 analysis/gate_worksheet.py collect study/accuracy-gate.warehouse-dispatch.json study/ground-truth.warehouse-dispatch.md

Then build the two marking sheets:

    npm run gate:mark

Write `correct` or `incorrect` on every verdict line and collect each sheet with the command
printed in its header. The sheet is bound to the exact repository, provenance, questions, and
captured answers; collecting a sheet from a different or earlier run fails. Partial credit is
not available: an answer that names the right file but misses two of the four places a thing
happens is incorrect. Have a human second marker check the pre-declared sample independently.

If the tool is re-captured, old verdicts do not transfer: rebuild and re-mark the sheets.

## 4. Score it — automatic

    npm run gate:score

The scorer fails unless both repositories are present and every question has non-empty frozen
and tool answers plus an explicit boolean verdict. Only then does it print the accuracy figure
for AE2 and write `seeded_candidates.json` — the only legitimate source of seeded items for the
over-trust probes.

## If the figure comes out low

That is the gate doing its job, and these answers are demanding: several assert that a
declared behaviour never reaches the running application, which a tool retrieving three
excerpts cannot establish. Report the figure, say what the questions asked, and discuss it with
your supervisor before designing around it. Do not revise the ground truth to raise the number.
