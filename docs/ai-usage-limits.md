# AI chat usage limits and spending controls

Tracked in [GitHub issue #14](https://github.com/Nrezhang/Resume_portfolio/issues/14).

## Current implementation

The bottom-left profile photo opens Settings, with Light, Dark, and System appearance choices, an owner-only admin entry point, and read-only session usage. The public admin link does not grant access: the existing Google sign-in and server-side allowlist still protect publishing.

Chat currently calls the local demo provider. It makes no paid model requests. Settings shows messages sent in the current tab session, zero AI tokens, and “Not enabled” for the session limit. A separate `sessionStorage` counter (`henry-portfolio-demo-messages-v1`) survives reloads and New chat, even when old conversations fall out of the recent list. Browser storage is editable and this is only a demo counter, not a billing or abuse-control mechanism.

The authenticated Portfolio studio has an AI usage section showing the future message, token, and daily spending controls as “Not configured.” No visitor can configure these limits. No budget has been chosen or enforced yet, and no spending protection should be inferred from this UI.

## Required before connecting a paid AI provider

1. Create a server-issued, signed anonymous session with an explicit expiry/reset window. Store its usage in a server-side record, for example DynamoDB. A new conversation must reuse the session and budget rather than reset it. Define how separate tabs share that session.
2. Add authenticated owner settings for maximum messages per session, total input-plus-output tokens per session, maximum output tokens per response, request rate/concurrency, and a global daily spending cap. Choose budget values before launch; never accept limits from a visitor request. Keep the AI disabled until valid limits exist.
3. Enforce limits before every provider request. Count user messages across all conversations in the session. Count the full model input, including system/persona instructions, retrieved RAG context, conversation history, tool calls, and any follow-up generations—not just the latest user message.
4. Atomically reserve message, token, and cost budget for each request using conditional writes/transactions. Reserve a conservative input estimate plus the maximum allowed output, then reconcile against actual provider usage. Simultaneous requests, multiple tabs, retries, and streams must not exceed a budget. Give requests idempotency keys; configure retries so a replay does not produce a second paid generation.
5. Record actual input, output, cached-input, and any other billable token categories reported by the selected provider. Calculate cost using versioned model pricing configured on the server. Do not present a local character-based estimate as billed token usage or actual dollars.
6. Reconcile reservations on completion, cancellation, provider errors, disconnects, and timeouts. A dropped browser connection must not erase costs for work already done. Handle stale reservations conservatively; fail closed when usage storage or the spending check is unavailable.
7. Return authoritative usage, remaining message/token allowance, and reset time to the frontend. Show a clear quota-exhausted state before submitting another message; retain drafts and allow browsing portfolio sections. The server must still reject requests if client controls are bypassed.
8. Add rate limits and abuse controls across sessions. Clearing cookies or creating fresh anonymous sessions must not bypass all protections. Include privacy-conscious IP/network throttling and a global spending circuit breaker; session limits alone do not guarantee a spending cap.
9. Provide an authenticated owner dashboard for aggregate usage and estimated spend, budget changes, provider/model attribution, and errors. Keep credentials server-side. Retain minimal usage metadata with documented TTLs; do not log full visitor messages merely to measure spend.

## Acceptance checks

- New chat, reloads, additional tabs, and concurrent requests cannot reset or overspend the server-managed allowance.
- Token exhaustion or a daily cost cap prevents further provider calls, including retries and tool-call loops.
- Exact provider usage is reconciled and the UI clearly distinguishes estimates from billed usage.
- Usage-store failures deny new paid requests; partial streams and abandoned requests remain accounted for.
- Unauthorized visitors cannot read private spending analytics or modify budget settings.
- Boundary, concurrency, retry/idempotency, expiry, provider-error, and disconnected-stream tests pass before the live provider is enabled.

## UI and integration points

- `client/src/components/chat/SessionUsage.js`: visitor usage summary (currently demo only).
- `client/src/components/chat/ChatContext.js`: demo session counter and response orchestration.
- `client/src/services/chatProvider.js`: replace the local demo provider with a request to the budget-enforcing backend endpoint, not a direct browser-to-provider call.
- `client/src/components/editor/VisualPortfolioEditor.js`: authenticated AI usage section for future owner controls.
- Existing API authentication and DynamoDB infrastructure can be reused, but usage records should be separate from the public portfolio content document.
