# Design system and interface rationale

This document records the visual system and interaction logic used by the repository-comprehension artefact. It describes the interface that is implemented in the current source and the reasoning behind its main design choices.

## Design direction

The interface combines two familiar patterns.

The start experience was inspired by focused conversational AI interfaces such as Claude and ChatGPT. The aim was to give the user one obvious starting action: paste a repository URL and analyse it. The screen therefore avoids a dashboard, large illustrations and competing controls. The repository input is the main visual focus.

After analysis, the workspace takes more inspiration from developer tools such as VS Code and Antigravity. Repository identity, file navigation, code, search and contextual information are arranged like an editor rather than a chat application. This makes the transition from asking questions to checking source code feel natural for a developer.

The artefact does not copy those products. Their interaction patterns were used as references because they are already familiar to the intended audience.

## Design principles

1. **One main task at a time.** The start screen focuses on repository input. Search and answer results take the full workspace width instead of being squeezed between unrelated panels.
2. **Use developer-tool conventions.** File paths and code use a monospace font, the code view behaves like an editor, and the repository workspace uses explorer, content and insight areas.
3. **Evidence is more important than decoration.** Generated answers are paired with the files, scores, line ranges and excerpts supplied to the model.
4. **Show system limits.** Index coverage, excluded files, missing evidence and unverified file mentions are visible rather than hidden.
5. **Do not present AI output as proven correct.** The interface reports what was retrieved and asks the user to make the final judgement.
6. **Visual meaning must not depend on colour alone.** Important states also use text, icons, borders, underlines or patterns.

## Colour system

The application uses a dark developer-tool palette with a single green primary accent. The dark surfaces reduce visual competition with code, while the green accent identifies actions, selection and available evidence. Amber is reserved for caution and red for failure or missing evidence.

| Token | Hex | Main use |
| --- | --- | --- |
| Background | `#070a09` | Page background |
| Card | `#0d1311` | Panels and grouped content |
| Input / popover | `#121a17` | Inputs and raised controls |
| Raised surface | `#19231f` | Active tabs, chips and secondary surfaces |
| Foreground | `#e9edef` | Primary text |
| Secondary foreground | `#c8d0d4` | Supporting text |
| Muted foreground | `#a2acb1` | Labels and secondary information |
| Dim foreground | `#8a9398` | Low-priority metadata |
| Primary | `#6ee7a0` | Main action, active state and evidence |
| Primary highlight | `#9df2c2` | Hover state |
| Warning | `#e5b567` | Unverified mentions and caution |
| Destructive | `#ef8a7a` | Errors, no-evidence state and manual-condition warning |
| Border | `#24302b` | Normal separation |
| Strong border | `#313f39` | Stronger or dashed separation |
| Code background | `#0a0f0d` | Editor and evidence excerpts |

The interface deliberately avoids decorative shadows and glow effects. Most hierarchy comes from spacing, borders, typography and surface changes. The standard corner radius is 6px.

The tokens are implemented in `src/index.css` and mapped through `tailwind.config.ts`.

## Typography

Two typefaces are used.

**Inter** is used for interface text and prose because it remains clear at small screen sizes. **JetBrains Mono** is used for code, file paths, identifiers and technical values so repository information is visually distinct from explanatory text.

| Role | Size | Use |
| --- | ---: | --- |
| Metadata | 12px | Secondary counts, coverage and helper text |
| UI | 14px | Navigation, buttons, labels and list rows |
| Body | 16px | Explanations and generated answers |
| Section heading | 16px, semibold | Panel sections |
| Panel heading | 20px, semibold | Main workspace headings |
| Code / path | 15px | Evidence excerpts and repository paths |
| Dense editor code | 13-14px | Main code viewer where more lines need to remain visible |

The fonts are loaded in `index.html`. Body text is not intentionally set below 14px; 12px is reserved for metadata.

## Spacing and layout

The layout is dense enough to feel like a developer tool but keeps the main reading areas open.

- Global body padding is 8px on desktop and 4px on smaller screens.
- The shared header is 64px high and stays visible while navigating.
- Main containers use a maximum width of 1400px.
- The start and analysing screens use a centred `max-w-2xl` column.
- The repository workspace uses about 82% of the viewport height so navigation, code and results remain visible together.
- The overview is full width with a readable `max-w-5xl` content area.
- The code view uses an IDE-style three-panel layout: roughly 280px explorer, flexible code editor and roughly 320px file-insight panel.
- Search results use the main content width because the result list is the task.
- Answers use a two-column layout on wide screens, with the answer on the left and a 420px evidence panel on the right.
- The evaluation runner uses a narrower `max-w-3xl` column because it is a linear research instrument rather than an exploration workspace.

## Page and view logic

| View | Design logic |
| --- | --- |
| **Start** | One repository field and one primary action. This follows the low-distraction Claude/ChatGPT pattern and keeps the first decision obvious. Recent repositories and an example are secondary actions below the main form. |
| **Analysing** | Shows only the current ingestion stages and file progress. The user is not given other actions while the repository state is incomplete. |
| **Overview** | Answers the first onboarding questions before showing individual files: what the project is, where it starts, how large it is, what it uses and which files have the most incoming dependencies. Coverage is shown because the tool may only index part of the repository. |
| **Code** | Uses the VS Code/Antigravity style mental model. The explorer is on the left, source code is central and file-specific information is on the right. This keeps navigation, reading and local context visible together. |
| **Search results** | Uses a full-width result list ordered by relevance. Each result explains what matched and shows a nearby code excerpt so the user can judge whether opening the file is worthwhile. |
| **Answers** | The question and generated answer are the main reading task, with retrieved evidence beside them. Explorer and file-insight panels are hidden here so the answer is not compressed into a narrow centre column. |
| **Evaluation** | Uses a separate linear flow for setup, tasks, NASA-TLX, SUS and export. The current experimental condition remains visible so the observer does not lose track of the manual or tool condition. |

## Workspace navigation

The top-level header contains only **Analyse** and **Evaluation**. The active item uses both font weight and an underline, so state is not communicated by colour alone.

Inside a loaded repository, the workspace uses **Overview**, **Code** and **Answers**. Search results are entered from the search field rather than treated as a permanent tab. This keeps navigation based on user goals rather than every possible internal state.

Search and question inputs stay in the workspace top bar so they can be reached from any repository view.

## Inputs and actions

Primary actions use the green primary colour with dark text. Secondary actions use borders or underlined text rather than competing filled buttons.

The repository field is 48px high on the start screen to make the main action visually clear. Workspace inputs and buttons are generally 40px high to preserve the denser editor layout.

Repository paths are shown in JetBrains Mono. Clickable paths use either an underline or a clear hover change so they read as actions rather than plain metadata.

## Code view

The code viewer intentionally resembles an editor rather than a document viewer.

The selected file appears as an editor tab with a green top border. The full path appears separately when space allows. Code lines use a monospace font, line numbers and a dark code surface. Selecting a line adds a green left border and tinted background.

Line selection is keyboard accessible. Arrow keys move between lines, Enter selects a line and Space adds or removes a line from a multi-selection. This mirrors editor-style keyboard behaviour without placing every line in the normal tab order.

## Evidence and trust states

The evidence panel has stable visual states because answer verification is part of the research question.

| State | Visual treatment | Meaning |
| --- | --- | --- |
| Retrieving | Neutral card with loading indicator | Retrieval is still running |
| Evidence available | Green border, green icon and ranked file list | These files were supplied to the model |
| No evidence | Red 2px border, warning icon, text and hatched background | No matching repository evidence was retrieved |
| Unverified mention | Amber border and warning icon | The generated answer names a path that was not retrieved |

The green evidence state does **not** mean the answer is correct. Its heading states only how many files were retrieved. Relevance bars represent keyword similarity, not answer confidence or correctness.

Evidence excerpts show the exact line range and text supplied to the model. This makes the interface useful for verification rather than only for displaying generated prose.

## Repository limits as part of the interface

Coverage is treated as interface information, not hidden implementation detail. The overview, search results and answer evidence can state how many repository files were indexed.

This is important because the evaluated artefact has a 50-file index limit. A user should be able to distinguish between "the repository does not contain this" and "the indexed subset did not contain this".

## Accessibility and state communication

The design includes labelled controls, visible focus states, semantic navigation, ARIA state where appropriate and keyboard interaction in the code viewer. Important conditions use more than colour:

- active navigation uses an underline and stronger text;
- evidence uses text, icon and border;
- no-evidence uses text, icon, a thicker border and a patterned background;
- unverified mentions use warning text, icon and border;
- the manual study condition uses an explicit instruction as well as a red border.

No formal WCAG audit was completed, so accessibility is treated as partially evidenced rather than certified compliance.

## Motion

Motion is deliberately limited. Route changes use a short 0.3-second fade and vertical movement. Normal component transitions use approximately 150-200ms. Loading states may pulse, but the main workspace does not use decorative continuous animation.

## Implementation references

| Area | Main source |
| --- | --- |
| Colour tokens and global surfaces | `src/index.css` |
| Typography, spacing and Tailwind tokens | `tailwind.config.ts` |
| Font loading | `index.html` |
| Header and main navigation | `src/components/layout/Header.tsx` |
| Page transition and shared layout | `src/components/layout/Layout.tsx` |
| Start, analysing and repository workspace | `src/pages/Index.tsx` |
| Repository overview | `src/components/RepositoryOverview.tsx` |
| Code editor behaviour | `src/components/CodeViewer.tsx` |
| File context panel | `src/components/FileInsightsPanel.tsx` |
| Search result layout | `src/components/WorkspaceSearchView.tsx` |
| Answer and evidence layout | `src/components/WorkspaceQAView.tsx` |
| Evidence states | `src/components/EvidencePanel.tsx` |
| Research-session interface | `src/pages/Evaluation.tsx` |
| Base UI components | `src/components/ui/` using shadcn/ui patterns |
