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

Everything below runs **inside a clone of this repository**, not inside either study repository.
The study repositories are only ever fetched by the tool over the network; nothing is installed
into them and nothing is written to them.

If you do not already have this repository locally:

    git clone https://github.com/ionuthub/AI-Assisted_Repository_Comprehension_System_for_Software_Onboarding_and_Maintenance.git
    cd AI-Assisted_Repository_Comprehension_System_for_Software_Onboarding_and_Maintenance

Then, once:

    npm install
    npx playwright install chromium

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
screenshot. It writes into `toolAnswer` and leaves `correct` alone.

It refuses to run until every answer in the ground-truth file is CONFIRMED. `--force`
overrides and records that it did.

## 3. Mark it — yours

In each gate file set `"correct": true` or `false` per item, comparing `toolAnswer` against
`correctAnswer`. Partial credit is not available: the proposal commits to a binary judgement,
so an answer that names the right file but misses two of the four places a thing happens is
incorrect. Have a second marker check a sample independently.

## 4. Score it — automatic

    npm run gate:score

Prints the accuracy figure for AE2 and writes `seeded_candidates.json` — the only legitimate
source of seeded items for the over-trust probes.

## If the figure comes out low

That is the gate doing its job, and these answers are demanding: several assert that a
declared behaviour never reaches the running application, which a tool retrieving three
excerpts cannot establish. Report the figure, say what the questions asked, and discuss it with
your supervisor before designing around it. Do not revise the ground truth to raise the number.
