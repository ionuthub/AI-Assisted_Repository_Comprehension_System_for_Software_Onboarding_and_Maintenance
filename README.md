# AI-Assisted Repository Comprehension System for Software Onboarding

Software artefact for the BSc Computer Science dissertation *Design and Evaluation of an
AI-Assisted Repository Comprehension System for Software Onboarding*.

The Repository Comprehension System is a browser-based research artefact designed to assist users
in understanding unfamiliar JavaScript and TypeScript repositories. It provides repository
orientation, import-based structural analysis, natural-language code search using TF-IDF, grounded
question answering, source inspection, and a verification layer that exposes the evidence supplied
to the language model.

**Scope.** Initial comprehension of small- to medium-sized JavaScript and TypeScript repositories,
particularly React applications. Long-term software maintenance and implementation of code changes
are outside the evaluated scope.

A secondary limit applies within that scope: ingestion, search and question answering accept common
source and configuration file types, but import resolution parses JavaScript and TypeScript syntax
only, so the import-based rankings are empty for other languages. The wider file-type support exists
so the tool degrades gracefully rather than rejecting a repository outright.

## Repository map

| Directory | Purpose |
| --- | --- |
| `src/` | Browser artefact implementation |
| `api/` | Server-side Gemini proxy (Vercel edge function) |
| `e2e/` | End-to-end application tests |
| `analysis/` | Reproducible research and evaluation scripts |
| `study/` | Accuracy-gate material, answer keys and retained study artefacts |
| `docs/` | Requirements, architecture, process, testing and limitations |
| `.github/` | CI workflow, issue templates, pull request template |

Start at [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md).

| Document | |
| --- | --- |
| [`PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md) | Problem, research question, artefact, findings |
| [`REQUIREMENTS.md`](docs/REQUIREMENTS.md) | FR1–FR12 and NFR1–NFR12 with evidence |
| [`TRACEABILITY_MATRIX.md`](docs/TRACEABILITY_MATRIX.md) | Requirement → code → test → report section |
| [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Pipeline, trust boundary, and each component |
| [`AGILE_PROCESS.md`](docs/AGILE_PROCESS.md) | Four sprints, definition of done, retrospective |
| [`PRODUCT_BACKLOG.md`](docs/PRODUCT_BACKLOG.md) | User stories, priorities, and what was descoped |
| [`TESTING.md`](docs/TESTING.md) | Software verification, answer reliability, participant evaluation |
| [`LIMITATIONS.md`](docs/LIMITATIONS.md) | Known limits of the artefact and of the evidence |
| [`AI_DISCLOSURE.md`](docs/AI_DISCLOSURE.md) | AI use, and the two meanings of "verification" |
| [`decisions/`](docs/decisions/) | Architecture decision records |

## Evaluated version

The participant study evaluated a frozen build. Subsequent repository changes are limited to
documentation, presentation, reproducibility support and explicitly identified post-study
maintenance unless otherwise stated. The commits and study artefacts used for the dissertation are
recorded in [`study/PHASE3_PROTOCOL.md`](study/PHASE3_PROTOCOL.md), which names the deployed build
and the build the accuracy gate was captured against.

Documentation under `docs/` was written after the study, not during it. It describes the artefact
retrospectively and is dated accordingly; it is not a contemporaneous development record.

## Capabilities

- **Repository overview** — detects technologies and frameworks, and reports file, component and
  function counts.
- **Import analysis** — parses import and export relationships and ranks the files most depended on
  by other indexed files.
- **Natural-language code search using TF-IDF** — client-side term-frequency index with smoothed
  inverse document frequency and cosine similarity. It is lexical, not neural: no embedding model
  is involved.
- **Grounded question answering** — retrieval-augmented generation over the indexed repository,
  using the Google Gemini API. Only the question and the selected excerpts leave the browser.
- **Verification layer** — every answer is shown beside the evidence it was built from: the
  retrieved files in rank order, their relevance scores, the line ranges supplied, and the exact
  excerpt sent to the model. Paths the answer names that retrieval did not return are listed
  separately as unverified mentions. Citations are derived from the retrieval layer, never by
  parsing the model's output. The layer exposes evidence and unsupported references; **it does not
  establish that an answer is correct.** See
  [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#the-verification-layer).
- **Coverage reporting** — ingestion reports how many files were indexed against how many the
  repository offered, with a reason recorded for every exclusion.

## Technology

- **Frontend** — React 18, TypeScript, Vite
- **Styling** — Tailwind CSS, shadcn/ui
- **Structural analysis** — regular-expression import/export parser, tokeniser, folder-tree builder
- **Retrieval** — client-side TF-IDF index; top 3 files, 2,500 characters of excerpt each
- **Generation** — Google Gemini through a Vercel edge function. The model is set by the
  `GEMINI_MODEL` environment variable and defaults to `gemini-3.5-flash`; the value used for any
  reported result is recorded in the dissertation's methodology chapter.
- **Hosting** — Vercel

## Getting started

Prerequisites: Node.js 20 or 22, npm, and a Google Gemini API key for the question-answering
function.

```bash
git clone https://github.com/ionuthub/AI-Assisted_Repository_Comprehension_System_for_Software_Onboarding_and_Maintenance.git
npm install
npm run dev
```

Quality gates:

```bash
npm run typecheck     # tsc -b across the project references
npm run lint
npx vitest run        # unit tests
npx playwright test   # end-to-end tests
npm run build
```

## Security

No API secret is stored client-side. Model calls are proxied through a Vercel edge function that
reads the key from the server environment, enforces an origin allowlist, validates the request and
clamps the context. Rate limiting is applied only when Upstash Redis credentials are configured;
see [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md)
for the caveat.

## Licence

MIT. See [`LICENSE.md`](LICENSE.md).

## Provenance and AI disclosure

The initial codebase was substantially developed with an AI agentic coding tool (Google
Antigravity), then configured, debugged, tested and adapted by the author for this dissertation.
All AI assistance, including subsequent AI-assisted auditing and refactoring, is disclosed in
[`study/AI-DISCLOSURE.md`](study/AI-DISCLOSURE.md) and in the dissertation's AI Declaration. The
evaluation study design, the marking judgements and all research data are the author's own work.
