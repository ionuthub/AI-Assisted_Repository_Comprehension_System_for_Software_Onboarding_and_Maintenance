# AI disclosure

**The full disclosure lives at [`../study/AI-DISCLOSURE.md`](../study/AI-DISCLOSURE.md).**

It is kept under `study/` rather than moved here for one reason: Appendix F.1 of the dissertation
cites that exact path as the repository-side record. Moving the file would break a citation in a
submitted document, and a pointer costs nothing.

## What it covers

Every AI tool used to **build and analyse** the artefact, and what each was used for: Google
Antigravity, Claude Code, Claude, CodeRabbit, ChatGPT, Perplexity, NotebookLM and Grammarly. It
agrees with Appendix A of the dissertation, which is the authoritative declaration.

## The distinction that matters most

The artefact **contains** a language model — `api/explain-code.ts` calls Gemini, and measuring the
quality of those answers is the subject of the research. That is the object of study, not
assistance to the author, and it is not what the disclosure is about.

## Two meanings of "verification"

Also worth reading before assessing the repository, because the same word covers two different
things:

**The artefact's verification layer** is an interface feature. It shows retrieved files, relevance
scores, line ranges and the excerpt sent to the model, and flags paths an answer names that
retrieval did not return. It **does not establish that an answer is correct** — it provides
evidence to support human verification and flags one class of unsupported repository reference. See
[`ARCHITECTURE.md`](ARCHITECTURE.md#the-verification-layer).

**Accuracy-gate verification** is research evaluation. Automated tooling supported reference
checking and evidence validation; the **final binary correctness decisions were the researcher's**.
The reference standard is tool-verified rather than independently human-established, and both the
disclosure and the capture harness say so. See [`TESTING.md`](TESTING.md) section B.
