# Limitations

## Artefact

- **50-file limit:** larger repositories are only partly analysed.
- **Lexical retrieval:** TF-IDF can miss code when the question and source use different terms.
- **Regex analysis:** structural analysis targets common JavaScript and TypeScript syntax, not every language or syntax form.
- **Indexed-file ranking:** files outside the ingestion limit cannot appear in, or contribute to, the dependency ranking.
- **Accessibility:** accessibility features are present, but no formal WCAG audit was completed.
- **Rate limiting:** the 15-requests-per-minute server limit works only when Upstash Redis is configured.
- **Type safety:** `strictNullChecks` is disabled, so some guarantees rely on tests rather than the compiler.

## Evidence

The reference answers were AI-assisted and checked with tools against the study repositories. They are described as **tool-verified**, not independently established by a separate human reference author. The researcher made the final binary gate verdicts.

The blind second marking was machine-produced and then independently checked and confirmed by the researcher. It was not performed by a separate human second marker.

`toolVersion` in a gate capture records the researcher's local checkout unless a deployment version is supplied separately. It should not be treated as proof of the deployed commit.

Participant session exports are stored pseudonymised on University-managed storage and are not published in this repository.

AI assistance supported implementation, testing, analysis, checking and writing. It is disclosed in [`../study/AI-DISCLOSURE.md`](../study/AI-DISCLOSURE.md) and should not be counted as separate independent human validation.
