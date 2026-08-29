# Disclosure of AI assistance

This file is the authoritative repository-side record of generative-AI assistance used in the dissertation project. It is intended to agree with Appendix A of the dissertation. If the dissertation and this file differ, the discrepancy should be corrected rather than resolved by assuming Git authorship or commit metadata proves unaided work.

## Scope of this disclosure

The project involves two separate uses of AI that should not be confused:

1. **AI as the object of study.** The artefact calls Google Gemini to generate repository-grounded answers. Those model outputs are part of the system being evaluated.
2. **AI as assistance to the researcher.** Generative-AI tools were also used during development, debugging, testing, analysis, review, literature work and drafting. This file records that assistance.

The repository does not claim that the application, analysis tooling or documentation was produced without AI assistance.

## Tools and roles

| Tool | Role in the project |
| --- | --- |
| **Google Antigravity** | Substantial generation of the initial React/TypeScript artefact codebase |
| **Claude Code** | Implementation support, debugging, refactoring, test authoring, analysis scripts, code review support and patch application |
| **Claude** (chat) | Technical/design discussion, protocol and study-document drafting/revision, and review of study design |
| **CodeRabbit** | Automated pull-request/code review; findings were subsequently triaged and checked |
| **ChatGPT** (OpenAI) | Technical discussion/debugging, scope and research-question refinement, literature/source checking support, report organisation, editing and critical review |
| **Perplexity** | Candidate-literature discovery and related-work searching; sources used in the dissertation were checked against the original publications |
| **NotebookLM** | Organising and checking source material against the research problem |
| **Grammarly** | Language-level proofreading, grammar, punctuation, clarity and style suggestions |

Tool use does not transfer responsibility for the submitted work to those tools. The researcher remains responsible for what was accepted, rejected, reported and submitted.

## Artefact development

The initial codebase was substantially produced with Google Antigravity. Subsequent implementation, configuration, debugging, refactoring, testing and review were also AI-assisted, including work performed with Claude Code and technical discussion with Claude and ChatGPT.

The researcher defined the final project scope and requirements, made the design and research decisions, reviewed implemented changes and retained responsibility for the submitted artefact. Git authorship should therefore be read as repository responsibility, not as evidence that a commit or file was produced without AI assistance.

## Git-history normalisation

On 29 August 2026 the `main` branch history was re-authored uniformly to the researcher and AI-tool co-author/session trailers were removed. This was a metadata normalisation; it was not a declaration that development had been unaided.

The original pre-normalisation history is preserved under `archive/pre-reauthor`. The old-to-new commit mapping is retained in [`SHA-MAP-REAUTHOR.md`](SHA-MAP-REAUTHOR.md), so historical SHAs used in study records remain traceable.

Accordingly:

- current Git author/committer metadata is **not** an AI-disclosure mechanism;
- the preserved archive and SHA map provide provenance for the history rewrite; and
- this disclosure and the dissertation's AI Declaration are the authoritative records of AI involvement.

## Testing, analysis and research instruments

AI assistance was used to create and revise automated tests, analysis scripts and research-support tooling. This includes scripts under `analysis/` used for accuracy-gate capture/scoring, reproducibility checks and participant-session analysis.

Automated test results and recorded study measurements are treated as evidence produced by the relevant instruments, not as independent human verification merely because a script was run. Instrument limitations are documented in [`../docs/TESTING.md`](../docs/TESTING.md) and [`../docs/LIMITATIONS.md`](../docs/LIMITATIONS.md).

The accuracy-gate reference material was AI-assisted and subsequently subjected to tool-based checking against the study repositories. The reference standard is therefore described as **tool-verified**, not independently reconstructed line by line by the researcher. The researcher made the final binary gate-marking decisions and retains responsibility for those judgements.

The existing blind second marking is machine-produced and is not presented as an independent human replication.

## Participant study and data

The participant study was conducted with 12 participants. Participant-session exports are retained pseudonymised on University-managed storage and are not committed to this public repository.

AI tools were not used to fabricate participant responses, timings, questionnaire scores or other experimental measurements. AI assistance was used in checking, analysing, presenting and drafting material around the results. The researcher remains responsible for the methodological decisions, study conduct, interpretation, limitations and conclusions reported in the dissertation.

## Literature, sources and writing

AI tools assisted with refinement of the scope and research question, identification of candidate literature, organisation of source material, report structure, wording, editing and critical review.

Sources included in the dissertation were checked against the original publications before use. AI-generated bibliographic or factual suggestions were not intended to substitute for reading and verifying the underlying source.

The final submitted text, arguments and interpretations remain the researcher's responsibility. AI assistance should therefore be understood as disclosed support within the workflow, not as a claim that the tools independently validated the research.

## Researcher responsibility

The researcher retained final responsibility for:

- defining the final scope, requirements and research question;
- methodological and design decisions;
- deciding which generated or suggested changes to accept;
- conducting the participant study;
- the final research marking judgements;
- verifying sources used in the dissertation;
- interpreting the results and stating the limitations; and
- the final content submitted for assessment.

This responsibility statement does not imply unaided authorship. It identifies who is accountable for the decisions and submitted work while the AI assistance is disclosed above.
