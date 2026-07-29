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
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync, readdirSync } from "node:fs";
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

// A previous capture is archived rather than overwritten. Two reasons. The model is not
// deterministic, so a second run answers the same question differently, and silently replacing
// the first run would destroy the only evidence of by how much — which is a reproducibility
// limitation worth reporting rather than losing. And a re-run prompted by a defect in this
// script needs the earlier data kept, or the claim that the defect changed nothing cannot be
// checked.
const ARCHIVE = "study/gate-runs";
if (gate.items.some((i) => i.toolAnswer)) {
  mkdirSync(ARCHIVE, { recursive: true });
  // Count archived captures, not archived files: each run leaves a .json *and* a screenshot
  // directory, so counting both made the second run number itself three.
  const previous = readdirSync(ARCHIVE).filter(
    (f) => f.startsWith(`${gate.repository}-run`) && f.endsWith(".json")
  );
  const n = previous.length + 1;
  writeFileSync(join(ARCHIVE, `${gate.repository}-run${n}.json`), JSON.stringify(gate, null, 1) + "\n");
  const stale = readdirSync(SHOTS).filter((f) => f.startsWith(`${gate.repository}-q`));
  if (stale.length) {
    const dir = join(ARCHIVE, `${gate.repository}-run${n}-screenshots`);
    mkdirSync(dir, { recursive: true });
    for (const f of stale) renameSync(join(SHOTS, f), join(dir, f));
  }
  console.log(`Archived the previous capture as ${gate.repository}-run${n}.`);
}

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
  // The heading sits inside a <header>, so the list is a sibling of that header and not of
  // the <h3>. A `h3 ~ ul` selector therefore never matches and silently reports zero unverified
  // mentions on every question — which is indistinguishable in the output from the panel not
  // having appeared. Anchor on the containing block instead.
  const unverified = await panel
    .locator('div:has(> header h3:text-matches("Unverified mentions")) ul li')
    .allInnerTexts()
    .catch(() => []);
  const coverage = (await panel.locator("> p").last().innerText().catch(() => "")).trim();
  return { heading, retrieved, unverified: unverified.map((u) => u.replace(/\s+/g, " ").trim()), coverage };
}

/**
 * Screenshots the whole answer, however tall it is.
 *
 * Two earlier attempts failed for the same reason. `fullPage` captures the document, and the
 * document is only ever one viewport tall because the answer scrolls inside its own container.
 * Growing the viewport to the element's bounding box does not help either: a box is what is
 * *visible*, so on a clipped element it reports the clipped height and the shot is the same
 * size as before. Both attempts produced a plausible-looking image that stopped mid-answer.
 *
 * So the clipping is removed rather than worked around. Every scrolling ancestor of the answer
 * has its overflow and height constraints lifted, the viewport is grown to the resulting
 * document height, and the styles are restored afterwards.
 *
 * The check at the end is the part that matters. It compares scroll height to client height on
 * the same elements after the override: if anything can still scroll, content is still hidden,
 * and the script says so rather than leaving it to be found by a spot-check later.
 */
async function captureFullAnswer(answerPanel, path) {
  const handle = await answerPanel.elementHandle();
  if (!handle) {
    await page.screenshot({ path, fullPage: true });
    return { complete: false, reason: "answer element not found" };
  }

  const before = await page.evaluate((el) => {
    const saved = [];
    for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
      const css = getComputedStyle(node);
      const scrolls = /auto|scroll|hidden/.test(css.overflowY) && node.scrollHeight > node.clientHeight + 1;
      const capped = css.maxHeight !== "none" || css.height !== "auto";
      if (!scrolls && !capped) continue;
      saved.push({ node, overflowY: node.style.overflowY, maxHeight: node.style.maxHeight, height: node.style.height });
      node.style.overflowY = "visible";
      node.style.maxHeight = "none";
      node.style.height = "auto";
    }
    window.__gateRestore = saved;
    return document.documentElement.scrollHeight;
  }, handle);

  const height = Math.min(12000, Math.max(900, Math.ceil(before) + 80));
  await page.setViewportSize({ width: 1440, height });
  await page.waitForTimeout(250);
  await page.screenshot({ path, fullPage: true });

  const leftover = await page.evaluate((el) => {
    let worst = null;
    for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
      const hidden = node.scrollHeight - node.clientHeight;
      if (hidden > 4 && (!worst || hidden > worst.hidden)) {
        worst = { hidden, tag: node.tagName.toLowerCase(), cls: (node.className || "").toString().slice(0, 40) };
      }
    }
    for (const s of window.__gateRestore || []) {
      s.node.style.overflowY = s.overflowY;
      s.node.style.maxHeight = s.maxHeight;
      s.node.style.height = s.height;
    }
    delete window.__gateRestore;
    return worst;
  }, handle);

  await handle.dispose();
  await page.setViewportSize({ width: 1440, height: 900 });

  return leftover
    ? { complete: false, reason: `${leftover.hidden}px still hidden in <${leftover.tag} class="${leftover.cls}">` }
    : { complete: true };
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
  const shotCheck = await captureFullAnswer(answerPanel, shot);
  if (!shotCheck.complete) {
    console.log(`\n  ! Q${id} screenshot may be truncated: ${shotCheck.reason}`);
  }

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
  item.toolCoverage = captured.coverage;
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
