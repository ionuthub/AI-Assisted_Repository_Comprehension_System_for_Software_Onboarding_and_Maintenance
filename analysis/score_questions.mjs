/**
 * score_questions.mjs — retrieval measurement against a known build.
 *
 * Regenerates every retrieval number the write-up reports: the per-question top-ranked
 * scores and retrieved files for the frozen suggested questions, the score distribution
 * over the accuracy-gate stems, and a pass/fail verdict on the four admissibility criteria
 * that selected the suggested questions in the first place.
 *
 * WHY THIS EXISTS
 *
 * The 27 and 28 July measurements were produced by tooling that was never committed. Two
 * ad-hoc computations of "the" gate distribution disagreed (p90 = 0.59 on 27 July, 0.57 on
 * 30 July), and the 0.60 evidence-bar constant was derived from the first of them. A figure
 * that cannot be regenerated from the repository cannot be defended, so this script is the
 * sole source for those numbers from now on. Its output embeds both the artefact commit it
 * measured and its own commit, so a number can always be traced to the two things that
 * produced it.
 *
 * HOW IT READS THE ARTEFACT
 *
 * It imports the committed ingestion and search modules and runs them — it does not
 * reimplement scoring. Retrieval is deterministic client-side computation over ingested
 * files with no model in the loop, so running the modules measures exactly what the
 * deployed build computes, without a deployment and without spending Gemini quota.
 *
 * This differs deliberately from capture_gate.mjs, which drives a real browser against the
 * deployed application. That is the right instrument there: the gate measures generated
 * answers, which exist only end-to-end. It is the wrong instrument here, where the quantity
 * is a cosine score computed before the model is called.
 *
 * The modules are loaded through Vite's SSR pipeline so that the "@/" path alias resolves
 * from the project's own vite.config.ts rather than from a second copy of that mapping
 * maintained here.
 *
 * FREEZE BOUNDARY
 *
 * This script reads the artefact and writes only under study/. It must never write to src/
 * or api/ — the freeze covers what a participant can experience, and measurement
 * instruments that read the artefact are not the artefact.
 *
 * USAGE
 *
 *   node analysis/score_questions.mjs
 *   node analysis/score_questions.mjs --out study/question-scores.json
 *   node analysis/score_questions.mjs --repo ionuthub/clinic-triage --repo ionuthub/other
 *   node analysis/score_questions.mjs --artefact-version <sha>   # label a build explicitly
 *
 * Exit status is 1 if any admissibility criterion fails, so freeze day gets a verdict.
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createServer } from "vite";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
};
const argAll = (name) =>
  argv.reduce((acc, value, i) => (value === `--${name}` && argv[i + 1] ? [...acc, argv[i + 1]] : acc), []);

const DEFAULT_REPOS = ["ionuthub/warehouse-dispatch", "ionuthub/clinic-triage"];
const REPOS = argAll("repo").length > 0 ? argAll("repo") : DEFAULT_REPOS;
const OUT = arg("out", "study/question-scores.json");

const gitShort = () => {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
};

const workingTreeDirty = () => {
  try {
    return execFileSync("git", ["status", "--porcelain"], { cwd: ROOT, encoding: "utf8" }).trim().length > 0;
  } catch {
    return false;
  }
};

/**
 * The commit of the artefact being measured, and the commit of this script. They are the
 * same value in the normal case — one repository, one HEAD — but are recorded separately
 * because the freeze pins the artefact while allowing measurement tooling to move.
 * --artefact-version overrides the former when measuring a build other than the checkout.
 */
const ARTEFACT_VERSION = arg("artefact-version", gitShort());
const SCRIPT_VERSION = gitShort();

// ---------------------------------------------------------------------------
// The questions under measurement
// ---------------------------------------------------------------------------

/**
 * Admissibility criteria, verbatim from study/suggested-questions-measurement.md.
 * Criterion 4 (names no task target) is asserted by SuggestedQuestions.test.ts against the
 * task-target vocabulary, so it is not re-checked here; criteria 1-3 are quantitative and
 * depend on the build, which is what this script exists to re-derive.
 */
const ADMISSIBILITY = {
  minResultsPerRepo: 3,
  minWeakerTopScore: 0.2,
  maxTopScoreRatio: 1.6,
};

const readSuggestedQuestions = () => {
  const source = readFileSync(resolve(ROOT, "src/components/SuggestedQuestions.tsx"), "utf8");
  const block = source.match(/export const SUGGESTED_QUESTIONS = \[([\s\S]*?)\]/);
  if (!block) throw new Error("Could not read SUGGESTED_QUESTIONS from SuggestedQuestions.tsx");
  return [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
};

const readGateStems = () => {
  const stems = [];
  for (const file of ["study/accuracy-gate.clinic-triage.json", "study/accuracy-gate.warehouse-dispatch.json"]) {
    const path = resolve(ROOT, file);
    if (!existsSync(path)) continue;
    const gate = JSON.parse(readFileSync(path, "utf8"));
    for (const item of gate.items ?? []) {
      if (item.question) stems.push({ repository: gate.repository, question: item.question });
    }
  }
  return stems;
};

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

/** Linear-interpolation percentile, the definition numpy calls "linear" (its default). */
const percentile = (sorted, p) => {
  if (sorted.length === 0) return null;
  if (sorted.length === 1) return sorted[0];
  const rank = (p / 100) * (sorted.length - 1);
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  if (low === high) return sorted[low];
  return sorted[low] + (rank - low) * (sorted[high] - sorted[low]);
};

const distribution = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    n: sorted.length,
    median: percentile(sorted, 50),
    p90: percentile(sorted, 90),
    max: sorted.length ? sorted[sorted.length - 1] : null,
    min: sorted.length ? sorted[0] : null,
    // Stated so a reader can reproduce the percentile rather than guess the convention.
    percentileMethod: "linear interpolation between closest ranks (numpy default)",
  };
};

const round = (n, dp = 3) => (n === null || n === undefined ? null : Number(n.toFixed(dp)));

// ---------------------------------------------------------------------------
// Measurement
// ---------------------------------------------------------------------------

const main = async () => {
  const server = await createServer({
    root: ROOT,
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
  });

  try {
    const { fetchRepositoryProject } = await server.ssrLoadModule("/src/lib/github.ts");
    const { buildSearchIndex, searchRepository } = await server.ssrLoadModule("/src/lib/semanticSearch.ts");

    const suggested = readSuggestedQuestions();
    const gateStems = readGateStems();

    console.error(`Measuring ${suggested.length} suggested question(s) and ${gateStems.length} gate stem(s)`);
    console.error(`across ${REPOS.length} repositor${REPOS.length === 1 ? "y" : "ies"}, artefact ${ARTEFACT_VERSION}.\n`);

    const repositories = [];

    for (const slug of REPOS) {
      console.error(`  ingesting ${slug} ...`);
      const project = await fetchRepositoryProject(`https://github.com/${slug}`);
      const index = buildSearchIndex(project.files);

      // The same call the application makes, at the same limit, so a score here is the
      // score a participant's search would produce.
      const measure = (question) => {
        const results = searchRepository(question, index, project.files, 10);
        return {
          question,
          resultCount: results.length,
          topScore: results.length ? round(results[0].score) : null,
          topFile: results.length ? results[0].path : null,
          results: results.slice(0, 5).map((r, i) => ({ rank: i + 1, path: r.path, score: round(r.score) })),
        };
      };

      repositories.push({
        repository: slug,
        indexedFiles: project.ingestion?.filesWithContent ?? project.files.length,
        totalRepositoryFiles: project.ingestion?.totalRepositoryFiles ?? null,
        suggested: suggested.map(measure),
        // A gate stem is written against one repository and is only meaningful there:
        // "where is the triage rule" asked of warehouse-dispatch measures nothing. Scoring
        // every stem against every repository halves the median by averaging in mismatches.
        // The reported distribution is over the 24 stems, each against its own repository.
        gateStems: gateStems
          .filter((stem) => slug.endsWith(`/${stem.repository}`))
          .map((stem) => measure(stem.question)),
      });
      console.error(`    ${repositories.at(-1).indexedFiles} files indexed`);
    }

    // Distribution over gate stems, pooled across repositories: the figure the 0.60
    // evidence-bar constant is derived from, and the reference the admissibility
    // criteria are stated against.
    const gateTopScores = repositories
      .flatMap((r) => r.gateStems)
      .map((s) => s.topScore)
      .filter((s) => s !== null);

    const gateDistribution = distribution(gateTopScores);

    // Admissibility, criteria 1-3, evaluated across exactly the repositories measured.
    const admissibility = suggested.map((question) => {
      const perRepo = repositories.map((r) => ({
        repository: r.repository,
        ...r.suggested.find((s) => s.question === question),
      }));
      const topScores = perRepo.map((p) => p.topScore ?? 0);
      const weakest = Math.min(...topScores);
      const strongest = Math.max(...topScores);
      const ratio = weakest > 0 ? strongest / weakest : Infinity;
      const topFiles = [...new Set(perRepo.map((p) => p.topFile))];

      const checks = {
        retrieves: {
          pass: perRepo.every((p) => p.resultCount >= ADMISSIBILITY.minResultsPerRepo),
          detail: `min results ${Math.min(...perRepo.map((p) => p.resultCount))} (need >= ${ADMISSIBILITY.minResultsPerRepo})`,
        },
        retrievesWell: {
          pass: weakest >= ADMISSIBILITY.minWeakerTopScore,
          detail: `weaker top score ${round(weakest)} (need >= ${ADMISSIBILITY.minWeakerTopScore})`,
        },
        retrievesSymmetrically: {
          pass: ratio <= ADMISSIBILITY.maxTopScoreRatio && topFiles.length === 1,
          detail:
            `ratio ${Number.isFinite(ratio) ? round(ratio, 2) : "infinite"} ` +
            `(need <= ${ADMISSIBILITY.maxTopScoreRatio}); top file ` +
            (topFiles.length === 1 ? `agrees (${topFiles[0]})` : `differs (${topFiles.join(" vs ")})`),
        },
      };

      return {
        question,
        perRepository: perRepo.map(({ repository, topScore, topFile, resultCount }) => ({
          repository,
          topScore,
          topFile,
          resultCount,
        })),
        checks,
        admissible: Object.values(checks).every((c) => c.pass),
      };
    });

    const report = {
      // Provenance travels with the data: the build measured, the instrument that measured
      // it, and when. A figure without these is not reportable.
      artefactVersion: ARTEFACT_VERSION,
      scriptVersion: SCRIPT_VERSION,
      capturedAt: new Date().toISOString(),
      workingTreeDirty: workingTreeDirty(),
      repositoriesMeasured: REPOS,
      admissibilityCriteria: ADMISSIBILITY,
      gateStemDistribution: {
        ...gateDistribution,
        median: round(gateDistribution.median),
        p90: round(gateDistribution.p90),
        max: round(gateDistribution.max),
        min: round(gateDistribution.min),
      },
      suggestedQuestionAdmissibility: admissibility,
      repositories,
      note:
        "Sole source for the retrieval figures in the write-up: the suggested-question " +
        "scores, the gate stem distribution, and the derivation of the evidence-bar " +
        "constant. Earlier figures (27-28 July) came from uncommitted tooling and are " +
        "superseded.",
    };

    mkdirSync(dirname(resolve(ROOT, OUT)), { recursive: true });
    writeFileSync(resolve(ROOT, OUT), JSON.stringify(report, null, 2) + "\n");

    // ---- Human-readable verdict -------------------------------------------------
    const d = report.gateStemDistribution;
    console.error(`\nGate stem top-score distribution (n=${d.n}):`);
    console.error(`  median ${d.median}   p90 ${d.p90}   max ${d.max}`);
    console.error(`\nSuggested-question admissibility:`);
    for (const a of admissibility) {
      console.error(`  ${a.admissible ? "PASS" : "FAIL"}  ${a.question}`);
      for (const [name, c] of Object.entries(a.checks)) {
        if (!c.pass) console.error(`          ${name}: ${c.detail}`);
      }
    }
    if (report.workingTreeDirty) {
      console.error(`\nWARNING: working tree is dirty — ${ARTEFACT_VERSION} does not fully describe what was measured.`);
    }
    console.error(`\nWritten to ${OUT}`);

    const failures = admissibility.filter((a) => !a.admissible);
    if (failures.length > 0) {
      console.error(`\n${failures.length} question(s) no longer meet the selection criteria.`);
      console.error(`The wordings are frozen by protocol; this is a finding to report, not a prompt to reselect.`);
      process.exitCode = 1;
    }
  } finally {
    await server.close();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
