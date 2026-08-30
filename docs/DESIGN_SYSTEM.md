# Design system and interface rationale

This document records the visual system and interaction logic used by the repository-comprehension artefact. It describes the current implementation, the design decisions behind it, and the accessibility rules that should remain stable as the interface changes.

## Design direction

The interface combines two familiar interaction patterns.

The start experience was inspired by focused conversational AI interfaces such as Claude and ChatGPT. The aim is to give the user one obvious starting action: provide a public GitHub repository URL and analyse it. The screen therefore avoids a dashboard, decorative imagery and competing controls.

After analysis, the workspace takes more inspiration from developer tools such as VS Code and Antigravity. Repository identity, file navigation, code, search and contextual information are arranged like an editor rather than a chat application. This supports the intended behaviour: generated answers should lead the user back to source evidence, not replace inspection of the code.

These products are references for familiar interaction patterns rather than visual templates.

## User journey

```text
Public GitHub URL
       |
       v
Analyse repository
       |
       v
Repository overview
   |       |       |
   v       v       v
 Code    Search   Answers
   |                 |
   v                 v
Selected file     Retrieved evidence
   |                 |
   +--> Ask about    +--> Open evidence in Code
        this file
```

The intended journey is sequential:

1. The user enters a public GitHub repository URL.
2. The artefact resolves repository metadata, reads the file tree, fetches eligible file contents and builds the search index.
3. The analysed repository becomes the active context.
4. **Overview** supports orientation, **Code** supports inspection, **Search** locates repository content and **Answers** handles repository-wide AI questions.
5. In Code, **Ask about this file** anchors the question to the selected path. The underlying retrieval pipeline may also retrieve related indexed files, so the interface states this explicitly rather than implying that the model sees only one file.
6. Retrieved evidence is shown beside generated answers so users can inspect what was actually supplied to the model.
7. **Codemap**, **Analyse** and **New repository** all mean the same thing: clear the active repository context and return to an empty Analyse screen.

## Design principles

1. **Repository context comes first.** AI interaction appears only after a repository has been analysed.
2. **One main task at a time.** Search and Answers take the main workspace instead of being squeezed between unrelated panels.
3. **Use developer-tool conventions.** File paths and code use a monospace face; Code uses explorer, editor and insight regions.
4. **Make scope visible.** Repository-wide questions live in Answers; file-anchored questions live beside the selected file.
5. **Evidence is more important than decoration.** Answers are paired with retrieved files, line ranges and excerpts.
6. **Show limits.** Index coverage, excluded files, missing evidence and unverified file mentions remain visible.
7. **Do not present AI output as proven correct.** The UI reports what was retrieved and leaves correctness to the user.
8. **Do not rely on colour alone.** State also uses text, icons, borders, underlines or patterns.
9. **Keyboard focus must always be visible.** Native and custom interactive elements share a visible focus treatment.
10. **Motion must be optional.** Reduced-motion preferences disable decorative transitions and smooth scrolling.

## Colour system

The application uses a dark developer-tool palette with a single green primary accent. Dark surfaces reduce visual competition with code. Green is used for primary actions and positive evidence states; amber is reserved for caution and red for failure or missing evidence.

| Token | Hex | Main use |
| --- | --- | --- |
| Background | `#070a09` | Page background |
| Card | `#0d1311` | Panels and grouped content |
| Input / popover | `#121a17` | Inputs and raised controls |
| Raised surface | `#19231f` | Active tabs, chips and secondary surfaces |
| Foreground | `#e9edef` | Primary text |
| Secondary foreground | `#c8d0d4` | Supporting text |
| Muted foreground | `#a2acb1` | Labels and secondary information |
| Dim foreground | `#8a9398` | Low-priority but still readable metadata |
| Primary | `#6ee7a0` | Primary action, active state and evidence |
| Primary highlight | `#9df2c2` | Hover state |
| Warning | `#e5b567` | Unverified mentions and caution |
| Destructive | `#ef8a7a` | Errors and no-evidence states |
| Border | `#24302b` | Decorative/layout separation |
| Strong border | `#313f39` | Stronger non-control separation |
| Control border | `#64736c` | Input and interactive-control boundaries |
| Code background | `#0a0f0d` | Editor and evidence excerpts |

Decorative separators are intentionally subtle. Interactive control boundaries use the stronger `control-border` token instead of relying on the normal panel border.

### Contrast targets

Contrast was calculated from the implemented tokens using the WCAG relative-luminance formula. Approximate ratios against the main dark background are:

| Pair | Approx. ratio | Target |
| --- | ---: | --- |
| Foreground / background | 17.1:1 | >= 4.5:1 |
| Muted foreground / background | 8.5:1 | >= 4.5:1 |
| Dim foreground / background | 6.4:1 | >= 4.5:1 |
| Primary / background | 13:1 | >= 4.5:1 for text |
| Warning / background | 10.6:1 | >= 4.5:1 |
| Destructive / background | 8.2:1 | >= 4.5:1 |
| Control border / input surface | about 3.6:1 | >= 3:1 |

Meaningful text should not use opacity modifiers that reduce it below these targets. Opacity is acceptable for decorative graphics and disabled states, but not as the normal presentation of required text.

## Typography hierarchy

Inter is used for interface text and prose. JetBrains Mono is reserved for code, file paths, identifiers and technical values.

| Role | Size / line height | Use |
| --- | --- | --- |
| Page title | 32 / 40px, bold | Primary start-page title |
| View title | 24 / 32px, semibold | Overview, Search, Answers and major workspace states |
| Panel title | 20 / 28px, semibold | Main task heading inside a view |
| Section heading | 18 / 26px, semibold | Groups within panels |
| Body | 16 / 26px | Explanations and generated prose |
| UI | 14 / 21px | Navigation, buttons, labels and rows |
| Metadata | 12 / 18px | Counts, coverage and secondary helper text |
| Repository path | 15px monospace | Paths and identifiers |
| Evidence/code | 15px monospace | Readable excerpts |
| Dense editor code | 13-14px monospace | Main code viewer only |

The 12px metadata step is the smallest supported interface text. File sizes and secondary editor paths use this step rather than 9-10px text or reduced opacity.

Semantic heading order follows the same hierarchy. A view title is the page/view `h1`; subordinate task and section headings use `h2`/`h3` as appropriate.

## Component states

| State | Visual treatment |
| --- | --- |
| Default control | Readable foreground, visible control boundary where required |
| Hover | Surface or border change while retaining text contrast |
| Keyboard focus | 2px green focus outline/ring with offset |
| Active/current | Surface change plus weight/underline/ARIA state; never colour alone |
| Disabled | Reduced opacity and no pointer interaction; label remains understandable |
| Error | Red plus explicit text/icon; not red alone |
| Warning | Amber plus warning text/icon/border |

The shared `Button` and `Input` components implement the standard states. A global focus-visible rule also covers raw links, buttons, disclosure summaries and tree items.

## Page and view logic

| View | Design logic |
| --- | --- |
| **Start** | One repository field and one primary action. Recent repositories and the example are secondary. |
| **Analysing** | Shows ingestion stages only. Completed, active and pending steps use different icons as well as colour. |
| **Overview** | Answers onboarding questions first: what the project is, entry point, scale, technologies and highly depended-on files. Coverage is explicit. |
| **Code** | Explorer, source and file insight areas follow an IDE mental model. The right panel contains the file-anchored AI action. |
| **Search results** | Full-width ranked result list with matched terms and nearby code. Search is a toolbar utility rather than a permanent tab. |
| **Answers** | Repository-wide AI workspace. The answer and retrieved evidence are the primary reading task. |
| **Evaluation** | Separate research instrumentation. It remains reachable from the header but is labelled as research evaluation so it is not confused with the normal product journey. |

## Responsive behaviour

Desktop Code view uses three columns: explorer, editor and file insights. On smaller screens these regions stack vertically instead of compressing the editor between fixed-width sidebars. Search and Answers remain single-task full-width views.

The start and analysing screens stay in a centred readable column. Overview reduces padding on smaller screens while preserving the same content hierarchy.

## Evidence and trust states

The evidence panel distinguishes:

- **Retrieving:** neutral loading state.
- **Evidence available:** green icon/border plus explicit retrieved-file count.
- **No evidence:** red 2px border, warning icon, text and patterned background.
- **Unverified mention:** amber warning state for paths named by the answer but not retrieved.

Green evidence styling means only that files were retrieved and supplied to the model. It does not certify correctness. Relevance bars represent lexical similarity, not confidence.

## Accessibility rules

The interface is designed against WCAG 2.2 AA criteria, but it is not described as formally WCAG-certified because no complete manual screen-reader audit has been performed.

Implemented safeguards include:

- semantic headings and navigation landmarks;
- labelled form controls;
- visible keyboard focus on links, buttons, inputs, summaries and tree items;
- keyboard line selection in the code viewer;
- `aria-current`, `aria-expanded`, `aria-selected` and progress semantics where appropriate;
- non-colour state cues;
- >= 4.5:1 target for ordinary text;
- >= 3:1 target for interactive control boundaries and non-text UI where required;
- reduced-motion handling through CSS and Framer Motion;
- no required text below 12px;
- no normal-state meaningful text hidden behind low-opacity styling.

Playwright accessibility smoke tests in `e2e/accessibility.spec.ts` guard the start-page heading/label structure, keyboard-visible focus, core text/control contrast and reduced-motion behaviour. These are regression checks, not a substitute for a complete manual accessibility audit.

## Motion

Normal transitions are short and functional. Route changes use a small fade/vertical movement. When `prefers-reduced-motion: reduce` is active, smooth scrolling and decorative animation/transition durations are effectively removed, and route motion is disabled.

## Implementation references

| Area | Main source |
| --- | --- |
| Colour tokens, focus and reduced motion | `src/index.css` |
| Typography, spacing and Tailwind tokens | `tailwind.config.ts` |
| Font loading | `index.html` |
| Header and main navigation | `src/components/layout/Header.tsx` |
| Page transition and reduced motion | `src/components/layout/Layout.tsx` |
| Start, analysing and repository workspace | `src/pages/Index.tsx` |
| Repository overview | `src/components/RepositoryOverview.tsx` |
| Code editor behaviour | `src/components/CodeViewer.tsx` |
| Repository explorer | `src/components/FolderTree.tsx` |
| File context and file-anchored questions | `src/components/FileInsightsPanel.tsx` |
| Search result layout | `src/components/WorkspaceSearchView.tsx` |
| Repository Q&A layout | `src/components/WorkspaceQAView.tsx` |
| Evidence states | `src/components/EvidencePanel.tsx` |
| Coverage limits | `src/components/CoveragePanel.tsx` |
| Accessibility regression checks | `e2e/accessibility.spec.ts` |
| Research-session interface | `src/pages/Evaluation.tsx` |
