/**
 * Asks the deployed tool every accuracy-gate question and records what it said.
 *
 * This is step 2 of the gate. Step 1 is writing the ground truth, step 3 is marking. Only
 * step 2 involves no judgement — it is transcription, and transcription done by hand across
 * 24 questions is an hour of clicking during which answers get truncated, evidence panels go
 * unrecorded, and the file the tool actually cited is remembered rather than captured.
 *
 * The script drives the real deployed interface rather than calling the retrieval code
 * directly, because what the gate measures is the tool as a participant will use it: same
 * ingestion, same file cap, same prompt, same model.
 *
 * It refuses to run until every answer in the corresponding ground-truth file is settled.
 * That is not bureaucracy. Reading the tool's answer before your own is settled makes the
 * comparison meaningless, and the interlock exists because the temptation to look first is
 * strongest exactly when the work is nearly done.
 *
 * "Settled" means CONFIRMED — the researcher read the code — or, with
 * --accept-tool-verified, VERIFIED BY TOOL. The second is weaker and legitimate, provided it
 * is chosen rather than defaulted into: the flag records the provenance in the gate file so it
 * reaches the write-up instead of being reconstructed by a marker.
 *
 * Usage:
 *   node analysis/capture_gate.mjs --repo https://github.com/ionuthub/clinic-triage \
 *                                 --gate study/accuracy-gate.clinic-triage.json \
 *                                 --truth study/ground-truth.clinic-triage.md
 *
 *   --url <app>   deployed application (default https://repo-comprehension-system.vercel.app/)
 *   --headed      watch it run
 *   --accept-tool-verified  treat VERIFIED BY TOOL as settled, and record that it was
 *   --force       skip the interlock entirely (records why in the output)
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const flag = (name) => argv.includes(`--${name}`);

const APP = arg("url", "https://repo-comprehension-system.vercel.app/");
const REPO = arg("repo");
const GATE = arg("gate");
const TRUTH = arg("truth");
const SHOTS = "study/gate-screenshots";

if (!REPO || !GATE) {
  console.error("Need --repo and --gate. See the comment at the top of this file.");
  process.exit(2);
}

// --- interlock -------------------------------------------------------------------------

// Two things are being guarded here, and only one of them is negotiable.
//
// The non-negotiable one is ordering: every answer must be settled before the tool is asked
// anything. Reading the tool's answer first turns the ground truth into a judgement about
// whether the tool looks right, and the accuracy figure stops meaning anything.
//
// The negotiable one is who settled it. CONFIRMED means the researcher read the code.
// VERIFIED BY TOOL means machine review with caller counts and re-counted quantifiers, which
// is weaker but not nothing. Running on tool-verified ground truth is a defensible choice
// provided it is a choice — declared in advance, recorded in the output, and disclosed in the
// write-up rather than discovered by a marker. That is what --accept-tool-verified does.
if (TRUTH && !flag("force")) {
  const statuses = [...readFileSync(TRUTH, "utf8").matchAll(/^\*\*Status:\s*([A-Z][A-Z -]*[A-Z])/gm)]
    .map((m) => m[1].trim());
  const settled = statuses.filter(
    (s) => s === "CONFIRMED" || (flag("accept-tool-verified") && s === "VERIFIED BY TOOL")
  ).length;
  const unsettled = statuses.length - settled;

  if (unsettled > 0) {
    const stamps = [...new Set(statuses)].sort().join(", ");
    console.error(
      `\n${unsettled} of ${statuses.length} answers in ${TRUTH} are not settled.\n` +
        `Statuses present: ${stamps}\n\n` +
        (flag("accept-tool-verified")
          ? "Running with --accept-tool-verified, so VERIFIED BY TOOL counts as settled. The\n" +
            "answers above are neither that nor CONFIRMED — they are still mid-correction, and\n" +
            "a gate run against them measures nothing.\n"
          : "The gate compares the tool's answers against ground truth settled beforehand.\n\n" +
            "If the researcher has read and signed off each answer, mark them CONFIRMED.\n" +
            "If the ground truth rests on machine review instead, that is a defensible choice\n" +
            "but it must be an explicit one: pass --accept-tool-verified, which records the\n" +
            "provenance in the gate file so it reaches the write-up.\n")
    );
    process.exit(1);
  }
}

// --- capture ---------------------------------------------------------------------------

const gate = JSON.parse(readFileSync(GATE, "utf8"));
const questions = gate.items.map((item) => ({ id: item.id, question: item.question }));
mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch({ headless: !flag("headed") });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(60_000);

console.log(`Opening ${APP}`);
await page.goto(APP, { waitUntil: "domcontentloaded" });

console.log(`Ingesting ${REPO} — this takes a minute or two`);
await page.fill("#github-url", REPO);
await page.getByRole("button", { name: "Analyse repository" }).click();
// Ingestion fetches up to fifty files, so the workspace can be slow to appear.
await page.locator('nav[aria-label="Workspace views"]').waitFor({ timeout: 300_000 });
console.log("Indexed.\n");

/** Reads the evidence panel once it has stopped loading. */
async function readEvidence() {
  const panel = page.locator('section[aria-label="Evidence"]');
  await panel.waitFor();
  // The panel carries aria-busy while retrieval is in flight; the heading changes when done.
  await page
    .locator('section[aria-label="Evidence"][aria-busy="true"]')
    .waitFor({ state: "detached", timeout: 120_000 })
    .catch(() => {});

  const heading = (await panel.locator("h3").first().innerText().catch(() => "")).trim();
  const rows = await panel.locator("ol > li summary").all();
  const retrieved = [];
  for (const row of rows) {
    const text = (await row.innerText()).replace(/\s+/g, " ").trim();
    // "1 src/path/file.ts 0.27" — rank, path, then the score as rendered.
    const m = text.match(/^(\d+)\s+(\S+)\s+([\d.]+)$/);
    retrieved.push(m ? { rank: +m[1], path: m[2], score: +m[3] } : { raw: text });
  }
  const unverified = await panel
    .locator('h3:has-text("Unverified mentions") ~ ul li')
    .allInnerTexts()
    .catch(() => []);
  const coverage = (await panel.locator("> p").last().innerText().catch(() => "")).trim();
  return { heading, retrieved, unverified: unverified.map((u) => u.replace(/\s+/g, " ").trim()), coverage };
}

const results = [];
for (const { id, question } of questions) {
  process.stdout.write(`Q${id} … `);
  await page.fill("#workspace-ask", question);
  await page.press("#workspace-ask", "Enter");

  const answerPanel = page.locator('p:text-is("Your question") + h1 + div:not([aria-busy])').first();
  await answerPanel.waitFor({ timeout: 180_000 });
  const evidence = await readEvidence();

  // Take the answer body only, not the panel chrome, so the recorded text is what a reader saw.
  const answer = (await answerPanel.innerText()).trim();
  const shot = join(SHOTS, `${gate.repository}-q${String(id).padStart(2, "0")}.png`);
  await page.screenshot({ path: shot, fullPage: true });

  results.push({ id, question, answer, ...evidence, screenshot: shot });
  console.log(`${evidence.retrieved.length} files, ${answer.length} chars`);

  // Return to a clean state so the next question is not answered against a stale panel.
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
}

await browser.close();

// --- write back ------------------------------------------------------------------------

for (const item of gate.items) {
  const captured = results.find((r) => r.id === item.id);
  if (!captured) continue;
  item.toolAnswer = captured.answer;
  item.toolEvidence = captured.retrieved;
  item.toolEvidenceHeading = captured.heading;
  item.toolUnverifiedMentions = captured.unverified;
  item.toolScreenshot = captured.screenshot;
  // `correct` is deliberately untouched. Marking is the researcher's, and a script that
  // pre-filled it would be scoring the tool against itself.
}
gate.capturedFrom = APP;
gate.capturedRepository = REPO;
// Provenance travels with the data. A figure whose ground truth was machine-verified is
// reportable; one whose provenance has to be reconstructed afterwards is not.
gate.groundTruthProvenance = flag("force")
  ? "Run with --force: ground truth was not settled at capture time."
  : flag("accept-tool-verified")
    ? "Ground truth verified by machine review (caller counts, re-counted quantifiers, " +
      "mechanically validated citations) rather than read line by line by the researcher. " +
      "Disclose in the methodology; see study/AI-DISCLOSURE.md."
    : "Ground truth confirmed by the researcher before capture.";

writeFileSync(GATE, JSON.stringify(gate, null, 1) + "\n");
console.log(`\nWrote ${results.length} answers into ${GATE}.`);
console.log(`Screenshots in ${SHOTS}/.`);
console.log("`correct` is still null on every item — that is yours to fill in.");
