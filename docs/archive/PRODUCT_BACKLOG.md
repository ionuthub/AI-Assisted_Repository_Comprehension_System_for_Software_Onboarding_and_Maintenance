# Retrospective product backlog

This backlog was reconstructed after the study to show what was kept, changed or removed.

| ID | User story | Priority | Requirement | Outcome |
| --- | --- | --- | --- | --- |
| US01 | Load a public repository without local setup | Must | FR1 | Done |
| US02 | See a repository overview | Must | FR3 | Done |
| US03 | See which indexed files are imported most | Must | FR4 | Done |
| US04 | Search code without knowing exact file names or identifiers | Must | FR5 | Done |
| US05 | Ask questions about the repository | Must | FR6 | Done |
| US06 | See evidence beside an answer | Must | FR7 | Done |
| US07 | See when an answer names a file that was not retrieved | Must | FR8 | Done |
| US08 | See how much of the repository was indexed | Must | FR9 | Done |
| US09 | Inspect a file and its structure | Should | FR10 | Done |
| US10 | Run a controlled study session | Must | FR11 | Done |
| US11 | Export session data | Must | FR12 | Done |
| US12 | Interactive dependency graph | Could | N/A | Reduced to ranked list |
| US13 | Maintenance workflow | Won't | N/A | Removed |
| US14 | Private repository support | Won't | N/A | Removed |
| US15 | Local folder or archive input | Won't | N/A | Removed |

## Scope decisions

The dependency graph was reduced to a ranked list because the study needed file importance, not a graph interaction.

Maintenance mode and a separate onboarding flow were removed because there was no objective study measure for them.

Private-repository authentication and local/archive ingestion were removed because the study used public GitHub repositories only. Keeping unused input paths would have added code and testing risk without adding evidence.
