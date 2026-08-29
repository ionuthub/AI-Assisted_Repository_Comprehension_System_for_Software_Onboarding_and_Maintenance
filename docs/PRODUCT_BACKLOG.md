# Product backlog

Priorities use MoSCoW. "Outcome" is the state at the frozen build.

| ID | User story | Priority | Requirement | Outcome |
| --- | --- | --- | --- | --- |
| US01 | As a developer, I want to load a public repository, so that I can inspect it without local setup | Must | FR1 | Done |
| US02 | As a newcomer, I want a repository overview, so that I can orient myself before reading code | Must | FR3 | Done |
| US03 | As a newcomer, I want to know which files matter most, so that I know where to start | Must | FR4 | Done |
| US04 | As a developer, I want to search in natural language, so that I can find code without knowing its vocabulary | Must | FR5 | Done |
| US05 | As a developer, I want to ask questions about the repository, so that I can understand behaviour spanning files | Must | FR6 | Done |
| US06 | As a reader of an answer, I want to see the evidence behind it, so that I can check it | Must | FR7 | Done |
| US07 | As a reader, I want to be told when an answer names a file it was never shown, so that I do not trust an invented citation | Must | FR8 | Done |
| US08 | As a reader, I want to know how much of the repository was indexed, so that I can tell absence of evidence from absence of code | Must | FR9 | Done |
| US09 | As a developer, I want to inspect an individual file with its structure, so that I can answer locating questions | Should | FR10 | Done |
| US10 | As a researcher, I want to run a controlled session, so that measurement is part of the instrument rather than done by hand | Must (research) | FR11 | Done |
| US11 | As a researcher, I want session records exported, so that analysis happens outside the application and is auditable | Must (research) | FR12 | Done |
| US12 | As a developer, I want an interactive dependency graph | Could | — | **Descoped** to a ranked list (FR4) |
| US13 | As a developer, I want a maintenance workflow that helps me change code | Won't (this study) | — | **Removed** |
| US14 | As a developer, I want to analyse a private repository | Won't (this study) | — | **Removed** |
| US15 | As a developer, I want to analyse a local directory or uploaded archive | Won't (this study) | — | **Removed** |

## Why the last four were dropped

These entries matter more than the completed ones, because they are where scope was actively
controlled rather than allowed to drift.

**US12, interactive dependency graph → ranked list.** The comprehension value is in knowing which
files carry the most weight, and a ranked list delivers that without the interaction cost of a
graph view. FR4 was rewritten around the list.

**US13, maintenance workflow, and the separate onboarding path.** Both were removed rather than
deferred, because **no objective measure was defined for either**. A feature the study cannot score
adds risk without adding evidence. This is also why the dissertation title and scope exclude
long-term maintenance: the artefact does not implement it, so the study does not claim it.

**US14, private repositories.** Removing the authentication path meant removing a third-party
identity service the project needed for nothing else. The consequence is that the artefact stores
no user accounts and no personal data of any kind, which simplifies the data-protection position.

**US15, archive and local-directory ingestion.** The study uses public repositories exclusively, so
neither path was exercised by any measurement, and each was a second route through ingestion that
had to be tested, described and reasoned about.

The cost of all four is a narrower tool: it cannot read a private repository or code that is not on
GitHub. Reintroducing archive ingestion through the unified pipeline, and private repositories via a
user-supplied token, are set out in the dissertation's recommendations.
