/**
 * Asks the deployed tool every accuracy-gate question and records what it said.
 *
 * This is step 2 of the gate. Step 1 is writing the ground truth, step 3 is marking. Only
 * step 2 involves no judgement, it is transcription, and transcription done by hand across
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
 * "Settled" means CONFIRMED, the researcher read the code, or, with
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
import { execFileSync } from "node:child_process";

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const flag = (name) => argv.includes(`--${name}`);

function parseTruthQuestions(markdown) {
  const headers = [...markdown.matchAll(/^## Q(\d+)\b/gm)];
  const questions = new Map();
  for (let index = 0; index < headers.length; index += 1) {
    const match = headers[index];
    const block = markdown.slice(match.index, headers[index + 1]?.index ?? markdown.length);
    // The em dash is required: the ground-truth files write "VERIFIED BY TOOL — <date>" and
    // are deliberately excluded from prose sweeps, being string-matched against the gate.
    // The comma alternative is accepted so a future re-written ground truth also parses.
    const status = block.match(/^\*\*Status:\s*([A-Z][A-Z -]*[A-Z])(?:\s*[—,]|\.\*\*|\*\*)/m)?.[1]?.trim();
    const question = block.match(/^>\s*(.+?)\s*$/m)?.[1]?.trim();
    const id = Number(match[1]);
    if (questions.has(id)) throw new Error(`Duplicate ground-truth question Q${id}`);
    questions.set(id, { id, status, question });
  }
  return questions;
}

function nextArchiveRun(entries, repository) {
  const escaped = repository.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^${escaped}-run(\\d+)\\.json$`);
  const numbers = entries
    .map((entry) => entry.match(pattern)?.[1])
    .filter(Boolean)
    .map(Number);
  return (numbers.length ? Math.max(...numbers) : 0) + 1;
}

function selfTest() {
  const truth = parseTruthQuestions(`
## Q1, first
**Status: VERIFIED BY TOOL, today.**
> First question?
## Q2, second
**Status: CONFIRMED, today.**
> Second question?
`);
  if (truth.size !== 2 || truth.get(1)?.question !== "First question?") {
    throw new Error("ground-truth block parsing failed");
  }
  if (nextArchiveRun(["repo-run1.json", "repo-run3.json"], "repo") !== 4) {
    throw new Error("archive numbering is not max-suffix plus one");
  }
  console.log("self-test OK: truth blocks bind by ID and archive gaps cannot overwrite a run");
}

if (flag("self-test")) {
  selfTest();
  process.exit(0);
}

const APP = arg("url", "https://repo-comprehension-system.vercel.app/");
const REPO = arg("repo");
const GATE = arg("gate");
const TRUTH = arg("truth");
const SHOTS = "study/gate-screenshots";
const TOOL_VERSION = arg(
  "tool-version",
  execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim()
);

if (!REPO || !GATE) {
  console.error("Need --repo and --gate. See the comment at the top of this file.");
  process.exit(2);
}

const gate = JSON.parse(readFileSync(GATE, "utf8"));
if (!Array.isArray(gate.items) || gate.items.length === 0) {
  console.error(`${GATE} has no gate items.`);
  process.exit(1);
}
const gateIds = gate.items.map((item) => item.id);
if (new Set(gateIds).size !== gateIds.length) {
  console.error(`${GATE} has duplicate question IDs.`);
  process.exit(1);
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
// provided it is a choice, declared in advance, recorded in the output, and disclosed in the
// write-up rather than discovered by a marker. That is what --accept-tool-verified does.
if (!flag("force")) {
  if (!TRUTH) {
    console.error("Need --truth unless --force is supplied. Nothing was captured.");
    process.exit(1);
  }

  const truth = parseTruthQuestions(readFileSync(TRUTH, "utf8"));
  const truthIds = [...truth.keys()];
  const mismatches = [];
  if (truth.size !== gate.items.length) {
    mismatches.push(`ground truth has ${truth.size} questions; gate has ${gate.items.length}`);
  }
  for (const item of gate.items) {
    const settled = truth.get(item.id);
    if (!settled) {
      mismatches.push(`Q${item.id} is absent from the ground truth`);
    } else if (settled.question !== item.question) {
      mismatches.push(`Q${item.id} question text differs between gate and ground truth`);
    }
  }
  for (const id of truthIds) {
    if (!gateIds.includes(id)) mismatches.push(`ground truth Q${id} is absent from the gate`);
  }

  const statuses = [...truth.values()].map((item) => item.status).filter(Boolean);
  if (statuses.length !== truth.size) mismatches.push("one or more ground-truth blocks has no status");
  const settledCount = statuses.filter(
    (status) =>
      status === "CONFIRMED" ||
      (flag("accept-tool-verified") && status === "VERIFIED BY TOOL")
  ).length;
  const unsettled = truth.size - settledCount;

  if (mismatches.length > 0 || unsettled > 0) {
    const stamps = [...new Set(statuses)].sort().join(", ");
    console.error(
      (mismatches.length ? `\n${mismatches.join("\n")}\n` : "") +
        `\n${unsettled} of ${truth.size} answers in ${TRUTH} are not settled.\n` +
        `Statuses present: ${stamps}\n\n` +
        (flag("accept-tool-verified")
          ? "Running with --accept-tool-verified, so VERIFIED BY TOOL counts as settled. The\n" +
            "answers above are neither that nor CONFIRMED, they are still mid-correction, and\n" +
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

const questions = gate.items.map((item) => ({ id: item.id, question: item.question }));
mkdirSync(SHOTS, { recursive: true });

// A previous capture is archived rather than overwritten. Two reasons. The model is not
// deterministic, so a second run answers the same question differently, and silently replacing
// the first run would destroy the only evidence of by how much, which is a reproducibility
// limitation worth reporting rather than losing. And a re-run prompted by a defect in this
// script needs the earlier data kept, or the claim that the defect changed nothing cannot be
// checked.
const ARCHIVE = "study/gate-runs";
if (gate.items.some((i) => i.toolAnswer)) {
  mkdirSync(ARCHIVE, { recursive: true });
  // Use the largest suffix plus one. Counting files overwrote run3 when run2 was absent.
  const entries = readdirSync(ARCHIVE);
  const n = nextArchiveRun(entries, gate.repository);
  const archiveGate = join(ARCHIVE, `${gate.repository}-run${n}.json`);
  const archiveShots = join(ARCHIVE, `${gate.repository}-run${n}-screenshots`);
  if (existsSync(archiveGate) || existsSync(archiveShots)) {
    throw new Error(`Refusing to overwrite existing archive run ${n} for ${gate.repository}`);
  }
  writeFileSync(archiveGate, JSON.stringify(gate, null, 1) + "\n");
  const stale = readdirSync(SHOTS).filter((f) => f.startsWith(`${gate.repository}-q`));
  if (stale.length) {
    mkdirSync(archiveShots);
    for (const f of stale) renameSync(join(SHOTS, f), join(archiveShots, f));
  }
  console.log(`Archived the previous capture as ${gate.repository}-run${n}.`);
}

const browser = await chromium.launch({ headless: !flag("headed") });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(60_000);

console.log(`Opening ${APP}`);
await page.goto(APP, { waitUntil: "domcontentloaded" });

console.log(`Ingesting ${REPO}, this takes a minute or two`);
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
    .waitFor({ state: "detached", timeout: 120_000 });

  const heading = (await panel.locator("h3").first().innerText().catch(() => "")).trim();
  if (!heading) throw new Error("Evidence panel appeared without a heading");
  const rows = await panel.locator("ol > li summary").all();
  const retrieved = [];
  for (const row of rows) {
    const text = (await row.innerText()).replace(/\s+/g, " ").trim();
    // "1 src/path/file.ts 0.27", rank, path, then the score as rendered.
    const m = text.match(/^(\d+)\s+(\S+)\s+([\d.]+)$/);
    retrieved.push(m ? { rank: +m[1], path: m[2], score: +m[3] } : { raw: text });
  }
  // The heading sits inside a <header>, so the list is a sibling of that header and not of
  // the <h3>. A `h3 ~ ul` selector therefore never matches and silently reports zero unverified
  // mentions on every question, which is indistinguishable in the output from the panel not
  // having appeared. Anchor on the containing block instead.
  const unverified = await panel
    .locator('div:has(> header h3:text-matches("Unverified mentions")) ul li')
    .allInnerTexts();
  const coverage = (await panel.locator("> p").last().innerText().catch(() => "")).trim();
  const expectedRetrieved = Number(heading.match(/Evidence · (\d+) files? retrieved/)?.[1] ?? 0);
  if (expectedRetrieved !== retrieved.length) {
    throw new Error(
      `Evidence heading reports ${expectedRetrieved} files but ${retrieved.length} rows were captured`
    );
  }
  if (!coverage) throw new Error("Evidence panel appeared without a coverage statement");
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
 * So the clipping is removed rather than worked around. Every clipped descendant and scrolling
 * ancestor of the answer has its overflow and height constraints lifted, and the styles are
 * restored afterwards. Checking ancestors alone misses content clipped inside a child.
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

  await page.evaluate((el) => {
    const saved = [];
    const descendants = Array.from(el.querySelectorAll("*")).reverse();
    const ancestors = [];
    for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
      ancestors.push(node);
    }
    const candidates = [...new Set([...descendants, ...ancestors])];
    for (const node of candidates) {
      const css = getComputedStyle(node);
      const hidden = node.scrollHeight > node.clientHeight + 1;
      const clips = /auto|scroll|hidden|clip/.test(css.overflowY);
      const capped = css.maxHeight !== "none" || css.height !== "auto";
      if (!hidden || (!clips && !capped)) continue;
      saved.push({
        node,
        overflowY: node.style.overflowY,
        maxHeight: node.style.maxHeight,
        minHeight: node.style.minHeight,
        height: node.style.height,
        flex: node.style.flex,
      });
      node.style.overflowY = "visible";
      node.style.maxHeight = "none";
      node.style.height = "auto";
      node.style.minHeight = "unset";
      const parentCss = node.parentElement ? getComputedStyle(node.parentElement) : null;
      if (parentCss?.display.includes("flex") && parentCss.flexDirection === "column") {
        node.style.flex = "none";
      }
    }

    // Flex items can retain their old allocated height even after overflow is visible. Expand
    // each box to its actual scroll height, deepest first; repeat because expanding a child can
    // increase an ancestor's scroll height on the next layout pass.
    for (let pass = 0; pass < 4; pass += 1) {
      for (const node of candidates) {
        if (node.scrollHeight <= node.clientHeight + 1) continue;
        const border = node.offsetHeight - node.clientHeight;
        const expanded = node.scrollHeight + Math.max(border, 0);
        node.style.height = `${expanded}px`;
        node.style.minHeight = `${expanded}px`;
      }
    }
    window.__gateRestore = saved;
    return saved.length;
  }, handle);

  await page.waitForTimeout(250);
  await page.screenshot({ path, fullPage: true });

  const leftover = await page.evaluate((el) => {
    let worst = null;
    const descendants = Array.from(el.querySelectorAll("*")).reverse();
    const ancestors = [];
    for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
      ancestors.push(node);
    }
    for (const node of new Set([...descendants, ...ancestors])) {
      const hidden = node.scrollHeight - node.clientHeight;
      if (hidden > 4 && (!worst || hidden > worst.hidden)) {
        worst = { hidden, tag: node.tagName.toLowerCase(), cls: (node.className || "").toString().slice(0, 40) };
      }
    }
    for (const s of window.__gateRestore || []) {
      s.node.style.overflowY = s.overflowY;
      s.node.style.maxHeight = s.maxHeight;
      s.node.style.minHeight = s.minHeight;
      s.node.style.height = s.height;
      s.node.style.flex = s.flex;
    }
    delete window.__gateRestore;
    return worst;
  }, handle);

  await handle.dispose();

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
  const generationStatus = await answerPanel.getAttribute("data-generation-status");
  const finishReason = await answerPanel.getAttribute("data-finish-reason");
  const promptTokenCount = await answerPanel.getAttribute("data-prompt-token-count");
  const outputTokenCount = await answerPanel.getAttribute("data-output-token-count");
  const totalTokenCount = await answerPanel.getAttribute("data-total-token-count");
  if (generationStatus !== "complete" || finishReason !== "STOP") {
    const visible = (await answerPanel.innerText()).replace(/\s+/g, " ").trim().slice(0, 240);
    throw new Error(
      `Q${id} generation incomplete: status=${generationStatus ?? "missing"}, ` +
        `finishReason=${finishReason ?? "missing"}, answer=${JSON.stringify(visible)}`
    );
  }
  const evidence = await readEvidence();

  // Take the answer body only, not the panel chrome, so the recorded text is what a reader saw.
  const answer = (await answerPanel.innerText()).trim();
  if (!answer) throw new Error(`Q${id} completed with a blank answer`);
  const shot = join(SHOTS, `${gate.repository}-q${String(id).padStart(2, "0")}.png`);
  const shotCheck = await captureFullAnswer(answerPanel, shot);
  if (!shotCheck.complete) {
    const message = `Q${id} screenshot may be truncated: ${shotCheck.reason}`;
    console.error(`\n  ! ${message}`);
    throw new Error(message);
  }

  results.push({
    id,
    question,
    answer,
    ...evidence,
    screenshot: shot,
    screenshotComplete: true,
    generation: {
      status: generationStatus,
      finishReason,
      usageMetadata: {
        promptTokenCount: promptTokenCount === null ? null : Number(promptTokenCount),
        candidatesTokenCount: outputTokenCount === null ? null : Number(outputTokenCount),
        totalTokenCount: totalTokenCount === null ? null : Number(totalTokenCount),
      },
    },
  });
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
  item.toolScreenshotComplete = captured.screenshotComplete;
  item.toolGeneration = captured.generation;
  // A fresh answer invalidates any verdict on the previous one. That previous verdict remains
  // in the archived run; the new capture is deliberately unmarked for the researcher.
  item.correct = null;
}
gate.capturedFrom = APP;
gate.capturedRepository = REPO;
gate.toolVersion = TOOL_VERSION;
gate.capturedAt = new Date().toISOString();
// Provenance travels with the data. A figure whose ground truth was machine-verified is
// reportable; one whose provenance has to be reconstructed afterwards is not.
gate.groundTruthProvenance = flag("force")
  ? "Run with --force: ground truth was not settled at capture time."
  : flag("accept-tool-verified")
    ? "Ground truth verified by machine review (caller counts, re-counted quantifiers, and a " +
      "citation checker that reported zero failures; NOTE results were not structurally " +
      "validated) rather than read line by line by the researcher. " +
      "Disclose in the methodology; see study/AI-DISCLOSURE.md."
    : "Ground truth confirmed by the researcher before capture.";

writeFileSync(GATE, JSON.stringify(gate, null, 1) + "\n");
console.log(`\nWrote ${results.length} answers into ${GATE}.`);
console.log(`Screenshots in ${SHOTS}/.`);
console.log("`correct` is null on every item, the fresh answers must be marked by the researcher.");
