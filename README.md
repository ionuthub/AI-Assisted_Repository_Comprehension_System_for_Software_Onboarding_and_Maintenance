# AI-Assisted Repository Comprehension System for Software Onboarding

Software artefact for the BSc Computer Science dissertation *Design and Evaluation of an AI-Assisted Repository Comprehension System for Software Onboarding*.

The system is a browser-based research artefact for understanding unfamiliar JavaScript and TypeScript repositories. It provides repository orientation, import-based structural analysis, natural-language code search using TF-IDF, grounded question answering, source inspection and an evidence-based verification layer.

**Scope.** The evaluated artefact focuses on initial comprehension of small- to medium-sized JavaScript and TypeScript repositories, particularly React applications. Long-term maintenance and implementation of code changes are outside the evaluated scope.

## Repository structure

| Directory | Purpose |
| --- | --- |
| `src/` | Browser artefact implementation |
| `api/` | Server-side Gemini proxy |
| `e2e/` | End-to-end tests |
| `analysis/` | Reproducible analysis and measurement scripts |
| `study/` | Retained study material and provenance |
| `docs/` | Authoritative technical documentation |
| `.github/` | CI and repository workflow templates |

## Essential documentation

| Document | Purpose |
| --- | --- |
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | FR1–FR12 and NFR1–NFR12 with implementation evidence |
| [`docs/TRACEABILITY_MATRIX.md`](docs/TRACEABILITY_MATRIX.md) | Requirement → code → test → dissertation evidence |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System pipeline, trust boundary, ingestion, retrieval and verification layer |
| [`docs/figure1_provenance.md`](docs/figure1_provenance.md) | Source-level provenance for the architecture figure and claims |
| [`docs/TESTING.md`](docs/TESTING.md) | Software verification, answer-reliability gate and participant evaluation |
| [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md) | Engineering and evidence limitations |
| [`study/PHASE3_PROTOCOL.md`](study/PHASE3_PROTOCOL.md) | Study procedure and frozen-build/deployment record |
| [`study/AI-DISCLOSURE.md`](study/AI-DISCLOSURE.md) | Authoritative AI-assistance and authorship disclosure |
| [`study/SHA-MAP-REAUTHOR.md`](study/SHA-MAP-REAUTHOR.md) | Old-to-new commit mapping after metadata normalisation |
| [`analysis/README.md`](analysis/README.md) | Reproduction instructions for analysis and measurement scripts |

Retrospective development notes, superseded documentation and audit/remediation working papers are retained under [`docs/archive/`](docs/archive/) and [`study/archive/`](study/archive/). They are preserved for provenance but are not the primary documentation for the submitted artefact.

## Evaluated version

The participant study evaluated a frozen build. Subsequent repository changes are documentation, presentation, reproducibility support or explicitly identified post-study maintenance unless otherwise stated. The study build and deployment identifiers are recorded in [`study/PHASE3_PROTOCOL.md`](study/PHASE3_PROTOCOL.md).

Documentation written after the study is retrospective and should not be read as a contemporaneous development log.

## Capabilities

- **Repository overview** — detects technologies and reports file and structural information.
- **Import analysis** — resolves JavaScript/TypeScript imports and ranks files by indexed dependants.
- **Natural-language code search using TF-IDF** — deterministic client-side lexical retrieval using smoothed IDF and cosine similarity.
- **Grounded question answering** — retrieves repository evidence before calling Gemini through a Vercel edge function.
- **Verification layer** — displays retrieved files, scores, line ranges and excerpts, and separately flags repository paths mentioned by an answer but absent from retrieved evidence.
- **Coverage reporting** — records how many files were indexed and why files were excluded.

## Technology

- React 18, TypeScript and Vite
- Tailwind CSS and shadcn/ui
- Regex-based JavaScript/TypeScript structural analysis
- Client-side TF-IDF retrieval
- Google Gemini through a Vercel edge function
- Vercel hosting

## Getting started

Prerequisites: Node.js 20 or 22, npm and a Google Gemini API key.

```bash
git clone https://github.com/ionuthub/AI-Assisted_Repository_Comprehension_System_for_Software_Onboarding_and_Maintenance.git
npm install
npm run dev
```

Quality gates:

```bash
npm run typecheck
npm run lint
npx vitest run
npx playwright test
npm run build
```

## Security

The model API key remains server-side. The generation endpoint applies origin validation, request validation and context limits. Rate limiting is active only when the configured Upstash Redis store is available; see [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md).

## Licence

MIT. See [`LICENSE.md`](LICENSE.md).

## Authorship, AI assistance and provenance

Generative-AI tools were used during software development, debugging, refactoring, testing, analysis, review, study-document preparation, literature discovery/checking and report editing. The exact tools and their roles are recorded in [`study/AI-DISCLOSURE.md`](study/AI-DISCLOSURE.md) and are intended to match the dissertation's AI Declaration.

AI-assisted work was reviewed rather than treated as independent evidence. The researcher retained responsibility for the final scope and requirements, methodological decisions, participant-study conduct, research marking decisions, interpretation of results, limitations and conclusions. Participant data and experimental measurements were not fabricated by AI tools.

On 29 August 2026 the `main` history was normalised so Git author and committer metadata identifies the researcher responsible for the repository. AI-tool co-author/session trailers were removed from the rewritten `main` history. Git authorship therefore records repository responsibility and must not be interpreted as evidence of unaided authorship.

The original pre-normalisation history remains under `archive/pre-reauthor`, and [`study/SHA-MAP-REAUTHOR.md`](study/SHA-MAP-REAUTHOR.md) preserves the old-to-new commit mapping so historical SHAs remain traceable. The disclosure record, rather than Git metadata, is authoritative for AI involvement.
