# Commit hash map: history normalisation on 29 August 2026

On 29 August 2026, `main` was re-authored to the researcher and AI co-author/session trailers were removed. The rewrite changed Git metadata only. The file content at the tip was unchanged and the commit count remained 90.

The original history is preserved in `archive/pre-reauthor`. Old study hashes must remain in historical captures because they identify the versions recorded at the time.

## Important historical hashes

| Old | New | Purpose |
| --- | --- | --- |
| `1b9b0e0` | `28766c5` | Merge of PR 3; cited by question-score data |
| `429f830` | `8ff5d5d` | Accuracy-gate checkout |
| `79dafba` | `5565ce0` | Participant deployment identifier |
| `b816b64` | `66bbc92` | Earlier answer-key version |
| `beae1ae` | `29be083` | Earlier study-runner version |
| `c5fb72a` | `4bd985f` | Retention-phase removal |
| `e7d7efe` | `4aa375a` | Frozen application source |
| `fd5f5ab` | `6e639f2` | Earlier evidence-bar measurement |

## Full map

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

To inspect an old hash:

```bash
git log archive/pre-reauthor
```

Do not delete `archive/pre-reauthor`. It is the preserved source for the historical hashes used in the study records.
