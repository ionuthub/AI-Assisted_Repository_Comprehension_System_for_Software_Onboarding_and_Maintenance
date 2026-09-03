# Limitations

## Artefact

- **Per-file size:** files larger than 5 MB are skipped.
- **GitHub API dependency:** repository ingestion depends on GitHub availability and rate limits.
- **Retrieval remains partly lexical:** the pipeline combines TF-IDF with file-path, symbol and import-graph signals, so vocabulary mismatch can still reduce retrieval quality.
- **Regex analysis:** structural analysis targets common JavaScript and TypeScript syntax and does not cover every language or syntax form.
- **Desktop scope:** the evaluated interface is intended for desktop and laptop browsers.
- **Accessibility:** automated accessibility checks are present, but full WCAG 2.2 AA conformance is not claimed.
- **Rate limiting:** the server-side request limit depends on Upstash Redis being configured.
- **Type safety:** `strictNullChecks` is disabled.
- **Dependency advisories:** npm audit advisories still require separate security triage.

## Evaluation

The accuracy result is based on two purpose-built JavaScript/TypeScript repositories and 24 predefined questions. It therefore does not establish the same accuracy for every repository, language or comprehension task.

The reference answers were AI-assisted and checked with tools against the complete study repositories. They are described as **tool-verified**, not as independently authored human ground truth. The researcher made the final binary verdicts.

The technical benchmark measures answer correctness, not developer productivity. The planned usability stage is intentionally small and descriptive, so it will support usability observations rather than causal claims that the tool makes developers faster or more accurate.

AI assistance used during development, checking and writing is disclosed in [`../study/AI-DISCLOSURE.md`](../study/AI-DISCLOSURE.md).
