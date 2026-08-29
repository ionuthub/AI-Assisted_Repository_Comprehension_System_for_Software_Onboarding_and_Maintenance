# Archived independent audit brief

This was the checklist used for an independent review of the artefact and study tooling. It is kept for provenance and is no longer an active instruction file.

The audit covered three repositories: the main artefact plus the frozen `clinic-triage` and `warehouse-dispatch` study repositories.

## Checks requested

1. **Retrieval and evidence**
   - TF-IDF behaviour and excerpt selection
   - 50-file ingestion limit and exclusions
   - evidence scores and headings
   - suggested questions
   - server proxy and secret handling

2. **Study repositories**
   - size and dependency matching
   - ingestion-rule consistency
   - planted architectural patterns
   - possible difficulty differences
   - contamination checks

3. **Reference answers**
   - sample answers against source
   - counts and absolute claims
   - citation-checking logic

4. **Gate tooling**
   - browser selectors
   - fail-closed behaviour
   - archive handling
   - marking-sheet collection
   - seeded-candidate generation
   - self-tests

5. **Reported figures**
   - arithmetic
   - marking consistency
   - model non-determinism
   - whether the stated standard matched the actual marking process

6. **Written claims**
   - AI disclosure
   - protocol wording
   - gate instructions
   - commit-message accuracy

The auditor was asked to report clean sections as clean, separate defects from style preferences, and rank findings by their effect on the study conclusions.
