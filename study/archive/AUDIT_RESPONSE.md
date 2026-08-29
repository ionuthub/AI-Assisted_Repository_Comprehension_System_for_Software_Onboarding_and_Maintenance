# Archived response to the independent audit

This file records the main findings from the audit before later remediation.

## Main findings

### False `.tsx` warnings

The unverified-path regex matched `.ts` before `.tsx`, so correct `.tsx` paths were truncated and falsely flagged. The regex was fixed and a regression test was added.

### Truncated generated answers

Two warehouse answers ended before normal completion. The generation protocol was later changed to carry completion information so incomplete output could be treated as an error.

### Gate data and marking

At the time of the audit, final verdicts were not stored in the gate JSON files even though a 6/24 figure existed in prose. The workflow was changed so marking sheets are collected into the gate data before scoring.

### Other accepted findings

The audit also found issues in excerpt selection, stopwords, unreadable-file handling, coverage wording, gate interlocks, archive numbering and marking-sheet binding.

It also corrected several written claims, including details about citation checking and the provenance of second marking.

## Effect on the research

The important architectural finding remained: retrieving three lexical excerpts is weak for exhaustive, negative and cross-file reachability questions.

Later study records and current documentation should be used for final figures. This archived response is kept only to show how the audit changed the implementation and reporting.
