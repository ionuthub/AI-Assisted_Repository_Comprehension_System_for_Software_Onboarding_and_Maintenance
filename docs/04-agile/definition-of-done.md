# Definition of done

The bar applied before a feature was considered complete. It is stricter than "it works", because
the artefact is a measuring instrument: a defect that survives into a session does not just
inconvenience a user, it contaminates a measurement that cannot be retaken.

A feature was done when:

1. the implementation was present in the frozen build;
2. TypeScript type checking passed across the whole project (`tsc -b`, not a single project);
3. linting passed;
4. relevant unit tests existed, and end-to-end coverage where the feature spans pages;
5. failure states were handled and surfaced rather than swallowed;
6. the feature could be exercised through the **deployed** artefact, not only locally;
7. its behaviour matched the relevant FR or NFR;
8. research-critical functionality produced auditable output — a recorded value, a provenance
   stamp, or an export;
9. no known defect remained that could invalidate a participant measurement.

## Two clauses that were added because something got through

**Clause 2 says `tsc -b`, not `tsc -p`.** A single-project typecheck passed while four type errors
sat in files outside that project's references. The whole-project build found them.

**Clause 6 says the deployed artefact.** A defect can pass every local gate and still be absent from
what a participant meets — and the reverse: for five weeks the CI workflow never ran at all,
because it targeted a Node version the test runner refused. Every local gate was green throughout.

## What this bar did not catch

Recorded honestly, because the defect log is a finding in its own right. Seven classes of defect
were found during development, and **no two were caught by the same method**: a project-wide
typecheck, human code review, a manual smoke test, asking why a module had no imports, a static
accessibility review, asking whether CI had ever actually reported, and a person switching
repositories and noticing the file on screen belonged to the other one.

The last is the important one. A file cache keyed by path alone served the previous repository's
contents under the new repository's filename — and the two study repositories are a matched pair
that deliberately share paths. In a study measuring whether participants detect incorrect output,
that manufactures the very failure being observed. No automated gate found it; a person switching
repositories did.
