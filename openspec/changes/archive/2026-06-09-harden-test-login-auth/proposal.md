# Proposal — harden-test-login-auth

> SDD proposal artifact. Artifact store: openspec (archived).
> Change: `harden-test-login-auth` | Project: vitalicia-cotizador-48411 | Date: 2026-06-09

## Intent

### What problem
A secret-gated quick-admin-login was just shipped (commit `659385c`): the public edge
function `supabase/functions/test-login/index.ts` plus the `handleDirectLogin` path in
`src/pages/admin/AdminLoginPage.tsx`. It works, but a code review surfaced six concrete
findings spanning security, a correctness bug, and maintainability drift. None of them
are showstoppers individually, but together they leave a **token-minting public endpoint**
that is brute-forceable, leaks its secret through the URL, and a login handler that
misreports transient failures and duplicates auth logic that already lives in
`AdminAuthContext`.

### Why now
The feature is fresh and small — this is the cheapest moment to harden it, before more
code starts depending on the current shape and before the convenience endpoint becomes a
real attack surface in production. A public endpoint that exchanges a shared secret for an
**admin** session is exactly the kind of thing that should not sit unhardened.

### What success looks like (v1.0)
- A transient `has_role` RPC failure during quick-login is reported as a transient error and
  does NOT masquerade as "you are not an admin" + sign the user out. ✓ DELIVERED
- Both login handlers route through a single auth entry point (`AdminAuthContext`), so the
  role-check / sign-out-on-failure policy lives in exactly one place. ✓ DELIVERED
- The remaining items (rate-limiting, secret transport off URL, timing-safe compare, CORS) are
  explicitly deferred to v2.0. ⏳ DEFERRED

## Scope — v1.0 (Reduced, User Decision)

### Delivered (v1.0)
- **Finding #3** — Fix swallowed `has_role` error in `handleDirectLogin` (correctness bug).
- **Finding #4** — Consolidate both login handlers onto `AdminAuthContext` (maintainability/altitude).
- **Latent UI issues** — `isLoading` never reset (try/finally) + unreliable redirect (explicit state + timeout).

### Deferred to v2.0 (User Decision: "over-engineering for test login")
- **Finding #1** — Rate-limiting / brute-force protection on `test-login` (security).
- **Finding #2** — Secret transport off the URL query string (security).
- **Finding #5** — `safeEqual` length-based early return → timing/length leak (security, low).
- **Finding #6** — CORS `*` on a token-minting endpoint (security, low).

## Problem Detail per Finding

### Finding #3: Swallowed `has_role` error (DELIVERED)

`handleSubmit` checks `roleError` and reports "Error verificando permisos. Intenta de nuevo."
`handleDirectLogin` destructured only `{ data: hasAdminRole }` (line 60) and skipped the error —
so a transient RPC failure returned `undefined`, was treated as "not admin," showed
"No tienes permisos de administrador," and signed the user out.

**Solution**: Added `AuthOutcome` tagged union to distinguish transient (retry) from forbidden (no access)
errors. Both handlers now receive a typed error outcome and can report correctly.

### Finding #4: Duplicated inline login (DELIVERED)

Both `handleDirectLogin` and `handleSubmit` reimplemented the sign-in → `has_role` → sign-out-on-failure
dance inline, and `AdminAuthContext.signIn()` reimplemented it a third time. Three copies of the same
security-sensitive policy is drift waiting to happen.

**Solution**: Made `AdminAuthContext` the single entry point with a shared `verifyAdminOrSignOut` helper
that both login paths use. `signIn` (standard) and `signInWithSession` (quick) now converge on the same
role-verification policy.

### Latent issues (DELIVERED)

`handleDirectLogin` sets `isLoading(true)` but on success only sets `pendingRedirect(true)`, relying
on the redirect effect firing. If redirect never fires, the UI stays frozen. `setSession` may not emit
`SIGNED_IN` when a session is already present.

**Solution**: Wrapped both handlers in `try/finally { setIsLoading(false) }` and added a 5-second safety
timeout that resets state if redirect never fires. `signInWithSession` explicitly sets `user` and `isAdmin`
state to ensure redirect fires deterministically.

## Deferred Items — v2.0

### Finding #1: No rate-limiting (security, medium-high) — DEFERRED
Endpoint is public and validates a shared secret. Requires a shared, durable store (Supabase table
via T1 migration, then T2 edge function rewrite).

### Finding #2: Secret in URL query string (security, medium) — DEFERRED
`?test=<secret>` lands in browser history, Referer headers, and proxy logs. Requires replacing
with a password-input field (T2 edge function + T4 page update).

### Finding #5: `safeEqual` length early-return (security, low) — DEFERRED
If (a.length !== b.length) leaks secret length via timing. Paired with Finding #2 (T2).

### Finding #6: CORS `*` (security, low) — DEFERRED
`Access-Control-Allow-Origin: *` on a token-minting endpoint is broader than needed. Paired with Finding #1 (T2).

## Risks / Limitations (v1.0)

- **Deferred edge-function hardening** — rate-limiting, timing-safe compare, CORS remain outstanding.
  The primary control (strong secret via operational procedure) is in place; next release should include
  edge-function hardening.

- **Secret still in URL** — `?test=<secret>` persists in browser history. Acceptable for visual testing;
  production risk if secret is ever revealed. Operational discipline (strong secret, least-privilege account)
  is primary mitigation.

- **No automated tests** — verification leans on `eslint` + `tsc` (build) and manual exercise.
  Standard login regression is the main risk to watch.

- **Design override** — Decision 4 (sign out on transient error) overrides the original spec.
  The design rationale is sound (avoid half-authenticated session).
