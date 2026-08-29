## What changed

## Why

## Requirement

Maps to: <FR / NFR id from docs/REQUIREMENTS.md>, or "none — documentation".

## Does this touch the evaluated artefact?

- [ ] No — documentation, analysis or study material only
- [ ] Yes — `src/`, `api/`, `package.json`, the lockfile or the build config

If yes, say why. The participant study evaluated a frozen build; a change to the application source
moves the deployed commit away from the one recorded against the study, and
`study/answer-key.*.json` carries `artefactVersion` and `artefactSourceCommit` that then need
re-stamping.

## Checks

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npx vitest run`
- [ ] `npx playwright test`
- [ ] `npm run build`
