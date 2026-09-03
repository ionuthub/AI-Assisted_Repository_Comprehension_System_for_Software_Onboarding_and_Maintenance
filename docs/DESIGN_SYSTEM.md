# Design system

The interface is designed as a focused repository-analysis workspace rather than a general chat application.

## User journey

1. Enter a public GitHub repository URL.
2. Analyse the repository and build the index.
3. Use **Overview** for orientation, **Code** for inspection, **Search** for retrieval and **Answers** for repository-wide questions.
4. Inspect the evidence shown with generated answers.

## Design principles

1. Repository context comes before AI interaction.
2. Keep one main task visible at a time.
3. Use familiar developer-tool patterns for files, paths and code.
4. Make repository scope and evidence visible.
5. Do not present generated answers as automatically correct.
6. Do not rely on colour alone for state.
7. Keep keyboard focus visible.
8. Respect reduced-motion preferences.

## Visual system

The application uses a dark developer-tool palette with green as the primary accent, amber for caution and red for errors or missing evidence. Inter is used for interface text and JetBrains Mono for code, paths and identifiers.

Ordinary text targets WCAG AA contrast. Interactive controls use visible boundaries and keyboard focus states. Meaningful states combine text, icons, borders or other cues with colour.

## Main views

| View | Purpose |
| --- | --- |
| Start | Repository URL and primary analyse action |
| Analysing | Ingestion progress |
| Overview | Technologies, scale, entry point and important files |
| Code | File explorer, source viewer and file insights |
| Search | Ranked repository search results |
| Answers | Repository-wide questions and retrieved evidence |

## Supported viewport

The evaluated interface targets desktop and laptop browsers. Narrow layouts may stack defensively, but mobile and tablet usability are not claimed.

## Evidence states

The evidence panel distinguishes retrieving, evidence available, no evidence and unverified file mentions. A positive evidence state means that supporting files were retrieved and supplied to the model; it does not certify that the generated answer is correct.

## Accessibility

Implemented safeguards include semantic headings, labelled form controls, visible keyboard focus, ARIA state where appropriate, non-colour state cues, reduced-motion handling and automated accessibility smoke tests. Full WCAG 2.2 AA certification is not claimed.

## Main implementation files

- `src/pages/Index.tsx`
- `src/components/RepositoryOverview.tsx`
- `src/components/CodeViewer.tsx`
- `src/components/FolderTree.tsx`
- `src/components/WorkspaceSearchView.tsx`
- `src/components/WorkspaceQAView.tsx`
- `src/components/EvidencePanel.tsx`
- `src/components/CoveragePanel.tsx`
