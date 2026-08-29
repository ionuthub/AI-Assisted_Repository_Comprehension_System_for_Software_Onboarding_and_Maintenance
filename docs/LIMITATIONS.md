# Known limitations

Limitations of the artefact and of the evidence for it. Study limitations are in Chapter 7 of the
dissertation; this file covers the engineering and evidence boundaries.

**AI-assistance note.** Development, testing, analysis and documentation were AI-assisted. That
assistance is disclosed in [`../study/AI-DISCLOSURE.md`](../study/AI-DISCLOSURE.md). References to
researcher responsibility below identify who made and owns the final judgement; they are not claims
of unaided authorship.

## Artefact

**The fifty-file cap.** Ingestion stops at 50 files. On a larger repository the tool sees a subset,
and an answer about "the repository" is an answer about that subset. FR9 exists to make this
visible, but it does not remove it. Appendix F.4 measures the effect: at the configured cap, none
of three target files was indexed; at 100 files all three were indexed but only one reached the top
three retrieved.

**Retrieval is lexical.** TF-IDF ranks poorly when the query and the source use different
vocabulary. A question phrased in domain language may not retrieve the file that implements it.

**Structural analysis is regex-based and JS/TS only.** Ingestion accepts a wider set of file types,
but imports, exports and the dependency ranking are extracted by pattern matching over ES module
syntax. Other languages contribute nothing to the graph, and nothing warns that they did not.

**The dependency ranking counts only indexed files.** A file outside the cap can neither be ranked
nor contribute to another file's count.

**No formal accessibility audit.** ARIA state, semantic structure, labelled controls and
keyboard navigation are implemented, and the relevance score is exposed as a number rather than
only as a bar width. No WCAG audit was run, so NFR9 is partly met rather than evidenced.

**Rate limiting is conditional.** The endpoint applies its 15-per-minute limit only when Upstash
Redis credentials are configured. Without them there is no server-side limit and nothing reports
the absence.

**`strictNullChecks` is off.** Nullability annotations added to the evaluation model are
documentation, not enforcement. The guarantees they describe are held by tests.

## Evidence

**The reference answers are tool-verified, not independently human-established.** They were drafted
with AI assistance and checked through multiple adversarial passes with the full repositories
available; the researcher did not reconstruct each answer line by line. The researcher made the
final correctness verdicts and retains responsibility for those judgements. This is disclosed in
`study/AI-DISCLOSURE.md` and Appendix A, and is enforced by the capture harness, which requires an
explicit flag and records the weaker provenance.

**Second marking was machine-produced.** `study/second-marking.md` was blind to the first verdicts
but is not an independent human check. It must not be presented as human corroboration.

**`toolVersion` records the researcher's checkout.** The capture harness defaults it to local git
`HEAD`, not to the commit the deployed site was serving. It is evidence of a checkout, not of a
deployment, and Appendix G says so.

**Participant session exports are not in this repository.** They are retained, pseudonymised, on
University-managed storage, consistent with the ethics approval. Chapter 6 and Appendix I are
therefore not reproducible from this repository alone; `analysis/analyze_sessions.py` reproduces
them from the retained records.

**AI assistance is not an independent validation layer.** AI tools supported implementation,
review, analysis, checking and drafting, but the same assistance cannot be counted as independent
human replication. Participant measurements were not fabricated by AI tools; interpretation and
final reporting remain the researcher's responsibility.
