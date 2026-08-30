# AI-Assisted Repository Comprehension System for Software Onboarding

BSc Computer Science dissertation artefact for *Design and Evaluation of an AI-Assisted Repository Comprehension System for Software Onboarding*.

The tool helps users understand unfamiliar JavaScript and TypeScript repositories. It accepts a public GitHub URL and provides a repository overview, import analysis, TF-IDF code search, grounded question answering, file inspection and an evidence panel.

## Scope

The evaluated scope is initial repository comprehension. Long-term maintenance and code changes are outside the study.

## Main folders

| Folder | Purpose |
| --- | --- |
| `src/` | Browser application |
| `api/` | Server-side Gemini proxy |
| `e2e/` | End-to-end tests |
| `analysis/` | Analysis and measurement scripts |
| `study/` | Study records and provenance |
| `docs/` | Technical documentation |

## Documentation

| File | Purpose |
| --- | --- |
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | Functional and non-functional requirements |
| [`docs/TRACEABILITY_MATRIX.md`](docs/TRACEABILITY_MATRIX.md) | Requirements mapped to code, tests and report sections |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design and data flow |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Interface design system and page rationale |
| [`docs/TESTING.md`](docs/TESTING.md) | Software checks, answer-reliability gate and participant study |
| [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md) | Main technical and evidence limits |
| [`study/PHASE3_PROTOCOL.md`](study/PHASE3_PROTOCOL.md) | Study procedure and frozen build |
| [`study/AI-DISCLOSURE.md`](study/AI-DISCLOSURE.md) | AI-use disclosure |
| [`study/SHA-MAP-REAUTHOR.md`](study/SHA-MAP-REAUTHOR.md) | Old and new commit hashes after metadata normalisation |
| [`analysis/README.md`](analysis/README.md) | How to reproduce the analysis |

Older planning and audit notes are kept in `docs/archive/` and `study/archive/`.

## Main features

- Repository overview and technology detection
- Import-based file ranking
- Client-side TF-IDF search
- Grounded answers using the top three retrieved files
- Evidence display with file, score, line range and excerpt
- Separate warning for file paths named in an answer but not retrieved
- Repository coverage reporting

## Technology

React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TF-IDF retrieval, Google Gemini and Vercel.

## Run locally

Requires Node.js 20 or 22, npm and a Gemini API key.

```bash
git clone https://github.com/ionuthub/AI-Assisted_Repository_Comprehension_System_for_Software_Onboarding_and_Maintenance.git
npm install
npm run dev
```

Checks:

```bash
npm run typecheck
npm run lint
npx vitest run
npx playwright test
npm run build
```

## Security

The Gemini API key stays server-side. The API checks allowed origins, request size and context size. Rate limiting works only when Upstash Redis is configured.

## AI use and provenance

AI tools were used during development, testing, analysis, review and writing support. The details are in [`study/AI-DISCLOSURE.md`](study/AI-DISCLOSURE.md).

The researcher remains responsible for the final scope, study conduct, marking decisions, interpretation and submitted work. This does not mean the project was produced without AI assistance.

On 29 August 2026, Git author and committer metadata on `main` was normalised to the researcher. The original history is kept in `archive/pre-reauthor`, with the old-to-new hash map in [`study/SHA-MAP-REAUTHOR.md`](study/SHA-MAP-REAUTHOR.md).

## Licence

MIT. See [`LICENSE.md`](LICENSE.md).
