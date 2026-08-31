# Limitations

## Artefact

- **No repository file-count cap:** the current artefact does not stop at 50, 100 or another fixed number of eligible files. If GitHub truncates the initial recursive tree response, ingestion expands the affected subtrees until the file listing is complete. If GitHub cannot provide a complete tree, ingestion fails explicitly rather than accepting known-partial coverage.
- **Per-file size:** files larger than 5 MB are skipped.
- **GitHub API availability:** complete tree recovery can require additional GitHub API requests on very large repositories and therefore remains dependent on GitHub availability and API rate limits.
- **Retrieval remains partly lexical:** the current answer pipeline uses a wider TF-IDF candidate pool plus file-path, symbol and import-graph signals. It still does not use learned embeddings, so vocabulary mismatch can remain a failure mode.
- **Regex analysis:** structural analysis targets common JavaScript and TypeScript syntax, not every language or syntax form. Import-graph expansion is only as complete as this analysis.
- **Desktop scope:** the current artefact is designed for desktop and laptop browsers. Narrow-window stacking is a defensive layout behaviour, not a supported mobile or tablet experience.
- **Accessibility:** keyboard focus, contrast, reduced-motion handling and automated accessibility smoke tests are present, but no complete manual screen-reader or WCAG conformance audit was completed. Full WCAG 2.2 AA conformance is therefore not claimed.
- **Rate limiting:** the 15-requests-per-minute server limit works only when Upstash Redis is configured.
- **Type safety:** `strictNullChecks` is disabled, so some guarantees rely on tests rather than the compiler.
- **Dependency advisories:** the current clean install reports npm audit advisories. Production and development dependency exposure still needs to be triaged separately before making a stronger dependency-security claim.

## Evidence

The participant study and original accuracy gate used the frozen 50-file, three-evidence-file configuration. Those historical results are not replaced by later post-study engineering changes.

The reference answers were AI-assisted and checked with tools against the study repositories. They are described as **tool-verified**, not independently established by a separate human reference author. The researcher made the final binary gate verdicts.

The historical blind second marking was machine-produced and later reviewed by the researcher as a consistency check. It was not a separate human second marking and is not the source of the final reportable gate result.

`toolVersion` in a gate capture records the researcher's local checkout unless a deployment version is supplied separately. It should not be treated as proof of the deployed commit.

Participant session exports are stored pseudonymised on University-managed storage and are not published in this repository.

AI assistance supported implementation, testing, analysis, checking and writing. It is disclosed in [`../study/AI-DISCLOSURE.md`](../study/AI-DISCLOSURE.md) and should not be counted as separate independent human validation.
