# Commit hash map — history re-author of 29 August 2026

Every commit on `main` was re-authored to the researcher on 29 August 2026, and the
`Co-Authored-By: Claude` and `Claude-Session:` trailers were removed from all 30 commit messages
that carried them. The rewrite changed commit metadata only: **the file content at the tip is
byte-identical before and after**, which `git diff` between the two refs confirms by returning
nothing, and the commit count is unchanged at 90.

Rewriting a commit changes its hash. This file exists so every hash quoted elsewhere still resolves,
because several are load-bearing: they identify the build the accuracy gate was captured against and
the build each participant session ran on.

**The original history is preserved in full under `archive/pre-reauthor`.** Old hashes remain valid
against that ref. Nothing was destroyed.

## What did not change

- File content at the tip: identical.
- Commit count: 90 before, 90 after. The PR #4 merge commit is preserved as a merge.
- Commit messages: unchanged apart from the two removed trailer lines. They still quote the **old**
  hashes in their prose, which is correct for the history they were written against.
- Commits before `347cb18` (30 July 2026): untouched, because none was machine-authored. That is why
  `682f38c` and `5e02c4d` do not appear below.
- Captured data: no gate capture, marking sheet or archived run was edited. `toolVersion` values in
  `study/accuracy-gate.*.json` and `study/gate-runs/*.json` still record the hashes current when the
  capture ran, and resolve against the archive ref.

## Load-bearing hashes

| Old | New | Commit | Cited by |
| --- | --- | --- | --- |
| `1b9b0e0` | `28766c5` | Merge pull request #3 from ionuthub/claude/simplify-auth-inp | `study/question-scores.json` |
| `429f830` | `8ff5d5d` | Clear the file cache when the project changes | `docs/REQUIREMENTS.md`, `docs/TESTING.md`, `study/PHASE3_PROTOCOL.md`, `study/accuracy-gate.clinic-triage.json`, `study/accuracy-gate.warehouse-dispatch.json` |
| `79dafba` | `5565ce0` | Remove em dashes from study and analysis prose, excluding ev | `docs/figure1_architecture.dot`, `docs/figure1_provenance.md`, `study/PHASE3_PROTOCOL.md`, `study/answer-key.clinic-triage.json`, `study/answer-key.warehouse-dispatch.json` |
| `b816b64` | `66bbc92` | Update answer-key.warehouse-dispatch.json | `study/PHASE3_PROTOCOL.md` |
| `beae1ae` | `29be083` | Stop the runner inventing responses, and record the 0-2 rubr | `docs/REQUIREMENTS.md`, `docs/TESTING.md`, `study/PHASE3_PROTOCOL.md` |
| `c5fb72a` | `4bd985f` | Remove the retention phase: retention is a task, not a phase | `docs/REQUIREMENTS.md`, `docs/TESTING.md`, `study/PHASE3_PROTOCOL.md`, `study/answer-key.template.json` |
| `e7d7efe` | `4aa375a` | Remove three ways the runner could bias its own measurements | `docs/REQUIREMENTS.md`, `docs/TESTING.md`, `docs/TRACEABILITY_MATRIX.md`, `docs/figure1_architecture.dot`, `docs/figure1_provenance.md`, `study/PHASE3_PROTOCOL.md`, `study/answer-key.clinic-triage.json`, `study/answer-key.warehouse-dispatch.json` |
| `fd5f5ab` | `6e639f2` | Derive the evidence-bar scale from the frozen-build measurem | `docs/REQUIREMENTS.md`, `docs/TESTING.md`, `study/PHASE3_PROTOCOL.md` |

## Full map

All 41 rewritten commits, oldest first.

| Old | New |
| --- | --- |
| `347cb184ed5f` | `a4e33230d1e5` |
| `c037123f5dc2` | `9b64f0933097` |
| `70f3bf5fa9bb` | `05b42cbea956` |
| `632179eaf495` | `7692ec8befe7` |
| `548e1f79663a` | `029856fc61cf` |
| `9a3c1f16819a` | `d342a97b4a34` |
| `fe01cc449732` | `6af1bd4d8bf3` |
| `2620b2bde90b` | `2a13323fe1c2` |
| `2432df86305f` | `781c2bb7f873` |
| `43ddbc3383fb` | `4a9cd8c80a4a` |
| `64a144b5c145` | `d1b08f66775b` |
| `b1c2e60a1428` | `162951d22275` |
| `42e084995819` | `9f24d4d12e3f` |
| `b0562cd3afd6` | `562c7dbf8bcc` |
| `3033e1527203` | `dd0f6bd5a115` |
| `1b9b0e0941cf` | `28766c5b3e5d` |
| `1996285d6255` | `36e64aa4eb55` |
| `fd5f5abb82e5` | `6e639f2ec9fd` |
| `429f8309251e` | `8ff5d5dfe25a` |
| `e145cb9145a8` | `ac7ede037320` |
| `5c6156030fc1` | `5fbf61053d95` |
| `ee8d6f0cce47` | `92c2acd1fc18` |
| `3779470e2b1e` | `71a7d02e0658` |
| `c5fb72a91210` | `4bd985f8ff0d` |
| `5502c9e5ab16` | `8ed84a05e7ad` |
| `1a249a086da1` | `4c2c84cd2841` |
| `e1d7e3cfad07` | `74c3f38a5f4a` |
| `beae1ae8ac85` | `29be0833f546` |
| `0a49ae85f62f` | `583f416f883f` |
| `47f5dc5027cd` | `635c52e9d917` |
| `b816b64a27fd` | `66bbc92701cd` |
| `2016eb45c2f0` | `2e4da8545982` |
| `e7d7efe3119b` | `4aa375ab9fc2` |
| `79dafba8b078` | `5565ce0e002c` |
| `7cd9c39db184` | `7f9a14421c2c` |
| `c80e0d116338` | `752ea8eeb94c` |
| `00445fe44176` | `f1902454c4dd` |
| `455222e5755b` | `3776f2846bb5` |
| `0c285965a02b` | `f3450a73c7c2` |
| `2c50c36af995` | `5642f62566db` |
| `31f7323a12d2` | `223a8c81ceec` |

## Resolving an old hash

    git cat-file -t <old-hash>        # fails against the rewritten history
    git log archive/pre-reauthor      # the old hash is valid here

If the archive ref is deleted, the old hashes become unresolvable and the provenance chain in
`study/PHASE3_PROTOCOL.md` and `docs/figure1_provenance.md` breaks with nothing to recover it from.
Keep it.

## Still to do after this is pushed

1. **Re-stamp the answer keys.** `study/answer-key.*.json` carry `artefactVersion` and
   `artefactSourceCommit`. Force-pushing triggers a fresh deployment, so both must be re-read from
   the Vercel dashboard and updated before any further session.
2. **Appendix A and F.1** quote hashes and describe the AI record. Appendix A should note the
   re-author; F.1's hashes remain correct as history and resolve via this map.
