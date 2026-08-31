# Limitations

## Artefact

- **50-file limit:** larger repositories are only partly analysed.
- **Lexical retrieval:** TF-IDF can miss code when the question and source use different terms.
- **Regex analysis:** structural analysis targets common JavaScript and TypeScript syntax, not every language or syntax form.
- **Indexed-file ranking:** files outside the ingestion limit cannot appear in, or contribute to, the dependency ranking.
- **Desktop scope:** the current artefact is designed for desktop and laptop browsers. Narrow-window stacking is a defensive layout behaviour, not a supported mobile or tablet experience.
- **Accessibility:** keyboard focus, contrast, reduced-motion handling and automated accessibility smoke tests are present, but no complete manual screen-reader or WCAG conformance audit was completed. Full WCAG 2.2 AA conformance is therefore not claimed.
- **Rate limiting:** the 15-requests-per-minute server limit works only when Upstash Redis is configured.
- **Type safety:** `strictNullChecks` is disabled, so some guarantees rely on tests rather than the compiler.
- **Dependency advisories:** the current clean install reports npm audit advisories. Production and development dependency exposure still needs to be triaged separately before making a stronger dependency-security claim.

## Evidence

The reference answers were AI-assisted and checked with tools against the study repositories. They are described as **tool-verified**, not independently established by a separate human reference author. The researcher made the final binary gate verdicts.

The historical blind second marking was machine-produced and later reviewed by the researcher as a consistency check. It was not a separate human second marking and is not the source of the final reportable gate result.

`toolVersion` in a gate capture records the researcher's local checkout unless a deployment version is supplied separately. It should not be treated as proof of the deployed commit.

Participant session exports are stored pseudonymised on University-managed storage and are not published in this repository.

AI assistance supported implementation, testing, analysis, checking and writing. It is disclosed in [`../study/AI-DISCLOSURE.md`](../study/AI-DISCLOSURE.md) and should not be counted as separate independent human validation.
