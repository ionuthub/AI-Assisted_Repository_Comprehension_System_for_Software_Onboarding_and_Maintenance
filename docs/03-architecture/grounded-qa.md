# Grounded question answering

`src/pages/Index.tsx` assembles the request; `api/explain-code.ts` proxies it.

## What is assembled, and where

For each question the client retrieves the top three files, takes a query-relevant region of at
most 2,500 characters from each, and appends one labelled block per file to `systemContext`. The
same objects populate the evidence panel, so the panel reports the text that was actually sent.

If retrieval returns nothing, an explicit instruction is appended telling the model to say so in
the first sentence and not to describe specific files, functions or behaviour. Without it, an
ungrounded answer was presented in an interface that implies grounding — which is the exact
condition the study's over-trust probes are designed to create deliberately, not by accident.

The prompt has two authors, which is worth knowing when reading it: a preamble written client-side
in `Index.tsx`, nested inside the system instruction built server-side by
`src/lib/promptBuilder.ts`. `promptBuilder.ts` is shared by the edge function and the Vite dev
proxy and deliberately has no imports, because the function is bundled without the `@/` alias.

## The edge function

`api/explain-code.ts`, `runtime: 'edge'`. In order:

1. **Origin allowlist**, exact match against `ALLOWED_ORIGINS`. A missing `Origin` is rejected with
   403 — browsers always send it on a POST, so a request without one is not from the application. An
   earlier version skipped the check when the header was absent, which left the endpoint and the key
   it holds reachable by any non-browser client.
2. **Rate limit**, 15 requests per minute per address — **only if** both Upstash Redis variables are
   configured. Otherwise no limit is applied and nothing says so.
3. **Request validation**: at most 25 messages, each with a valid role and at most 10,000
   characters.
4. **Context clamp** to 12,000 characters. Non-string input yields an empty context rather than a
   coerced one, so a malformed request produces an ungrounded answer that says so, rather than a
   grounded-looking one.
5. **Generation**: `gemini-3.5-flash` by default, overridable by `GEMINI_MODEL`; temperature 0.7,
   4,096 output tokens; 60-second timeout.

## The streaming protocol

Responses stream back as newline-delimited JSON events defined in `src/lib/generationProtocol.ts`,
shared by client and server. The terminal event carries Gemini's `finishReason` and
`usageMetadata`, so a token-limited or safety-stopped answer cannot look identical to a completed
one. A stream that ends with incomplete JSON, or without a successful finish reason, is surfaced as
an error rather than as an answer.

This is why the accuracy-gate harness can reject incomplete generations rather than scoring a
truncated answer as a wrong one.
