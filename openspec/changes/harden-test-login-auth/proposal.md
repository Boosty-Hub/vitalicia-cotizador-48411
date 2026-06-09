# Proposal — harden-test-login-auth

> SDD proposal artifact. Artifact store: openspec.
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

### What success looks like
- The public secret-validation endpoint resists trivial brute-force (some throttling exists
  and is a deliberate, documented decision — not absent by omission).
- The gate secret no longer travels in a way that gets persisted to browser history,
  intermediary logs, or `Referer` headers.
- A transient `has_role` RPC failure during quick-login is reported as a transient error and
  does NOT masquerade as "you are not an admin" + sign the user out.
- Both login handlers route through a single auth entry point (`AdminAuthContext`), so the
  role-check / sign-out-on-failure policy lives in exactly one place.
- The remaining low-severity items (timing-safe length handling, CORS scope) are either fixed
  or explicitly accepted with a written rationale.

## Scope

### In scope
- **All six review findings** (the user asked for "todos los puntos") plus the two latent
  UI-state issues, triaged into code changes vs. operational/deployment discipline:
  1. Rate-limiting / brute-force protection on `test-login` (security).
  2. Secret transport off the URL query string (security).
  3. Swallowed `has_role` error in `handleDirectLogin` (correctness bug).
  4. Consolidate both login handlers onto `AdminAuthContext` (maintainability/altitude).
  5. `safeEqual` length-based early return → timing/length leak (security, low).
  6. CORS `*` on a token-minting endpoint (security, low).
  - Latent: `isLoading` never reset on the success path of `handleDirectLogin` (frozen UI if
    redirect never resolves); `setSession` may not emit `SIGNED_IN` when a session already exists.
- Touch points: `supabase/functions/test-login/index.ts`, `supabase/config.toml` (if CORS /
  function config changes), `src/pages/admin/AdminLoginPage.tsx`,
  `src/contexts/AdminAuthContext.tsx` (extend `signIn` to support the token-session path).
- An operational checklist for the parts that are not code (secret strength/rotation, env
  configuration), so the deployment side is captured even though it is not a code diff.

### Out of scope
- Rewriting or redesigning the standard email/password admin login flow beyond what is needed
  to share one code path with quick-login.
- Removing the quick-login feature entirely. (If the team later decides the convenience is not
  worth the surface, that is a separate decision — this change hardens what exists.)
- Broader auth/RLS overhaul, MFA, session-management policy, or `ProtectedAdminRoute` changes.
- Introducing a test framework or test coverage (the project has none; `npm test` does not exist).
- Standing up new infrastructure purely for rate-limiting (e.g. a dedicated Redis) — the
  shared-store decision is flagged for the design phase, not pre-committed here.

## Problem detail per finding

1. **No rate-limiting (security, medium-high).** The endpoint is public (`verify_jwt = false`)
   and validates a shared secret. With no throttling, an attacker can grind the secret offline-
   speed against the live endpoint. Honest constraint: a Deno edge function is **stateless per
   invocation**, so real rate-limiting needs a shared counter store (Supabase table, KV/Upstash,
   etc.). The *decision* of which store is a design-phase question; the *requirement* (must
   throttle, must fail closed) belongs here.

2. **Secret in URL query string (security, medium).** `?test=<secret>` lands in browser history,
   `Referer` headers on any outbound navigation, and proxy/CDN access logs. This is largely a
   **transport** problem on the client side, and it pairs with an **operational** truth: the
   secret must be strong and rotatable so that a leak is recoverable. Code change (move the secret
   off the query string) + deployment discipline (strong, rotatable secret) together.

3. **Swallowed `has_role` error (correctness bug, real).** `handleSubmit` checks `roleError` and
   reports "Error verificando permisos. Intenta de nuevo." `handleDirectLogin` destructures only
   `{ data: hasAdminRole }` (line 60) and skips the error — so a transient RPC failure returns
   `undefined`, is treated as "not admin," shows "No tienes permisos de administrador," and signs
   the user out. Wrong diagnosis for a transient failure. This is the clearest must-fix.

4. **Duplicated inline login (altitude/maintainability).** Both `handleDirectLogin` and
   `handleSubmit` reimplement the sign-in → `has_role` → sign-out-on-failure dance inline, and
   `AdminAuthContext.signIn()` reimplements it a *third* time (it only accepts email/password).
   Three copies of the same security-sensitive policy is drift waiting to happen. The fix is to
   make `AdminAuthContext` the single entry point — which means `signIn` must grow a path that
   accepts an already-minted session (access/refresh tokens), not just email/password.

5. **`safeEqual` length early-return (security, low).** `if (a.length !== b.length) return false`
   leaks the secret length via timing before the constant-time loop runs. Low impact (a strong
   random secret's length is not very useful to an attacker), but trivial to make uniform. Fix or
   accept-with-rationale.

6. **CORS `*` (security, low).** `Access-Control-Allow-Origin: *` on an endpoint that mints admin
   tokens is broader than needed. Note: CORS is a browser-enforced policy and does NOT stop a
   direct (non-browser) attacker, so this is defense-in-depth, not a primary control. Tighten to
   the known app origin(s) or explicitly accept the wildcard with rationale.

**Latent UI issues.** `handleDirectLogin` sets `isLoading(true)` but never resets it on the
success path — it relies on the redirect effect firing. If `user`/`isAdmin` never resolve, the UI
stays frozen with no error. Separately, `setSession` may not emit `SIGNED_IN` when a session is
already present, so the context's `onAuthStateChange` listener may not refresh `isAdmin` — another
reason to route through the context rather than poke `setSession` directly.

## Recommended approach (high level — design phase will detail)

This is a **hardening + consolidation** change, deliberately proportionate. The spine is: collapse
all login onto one audited path, fix the real bug, and harden the public endpoint.

- **Single auth entry point.** Extend `AdminAuthContext.signIn` so the role-check and
  sign-out-on-failure policy lives once. Give it (or a sibling method) a way to accept a
  pre-minted session from `test-login` so quick-login and standard login share the same
  post-auth verification — and so a transient `has_role` error is surfaced as transient
  everywhere (fixes #3 and #4 together, and removes the `setSession`/`SIGNED_IN` and frozen-
  `isLoading` foot-guns because the page stops orchestrating auth by hand).

- **Move the secret off the URL.** Stop reading the secret from `?test=` into history/Referer.
  The exact replacement transport (e.g. a one-time paste/prompt, `POST`-only field, short-lived
  flow) is a design-phase decision; the requirement is "not persisted in URL/history/logs."
  Pair with the operational rule that the secret is long, random, and rotatable.

- **Throttle the public endpoint.** Add fail-closed rate-limiting to `test-login`. The
  shared-store mechanism (Supabase table vs. external KV vs. lightweight IP/secret-attempt
  counter) is a tradeoff to resolve in design; this change only commits to *having* throttling
  that fails closed.

- **Make `safeEqual` length-uniform** (compare against a fixed-length derived value, e.g. hash
  both sides) so no length signal leaks — or document acceptance if the team decides the random
  secret makes it moot.

- **Scope CORS** to the known origin(s) for the token-minting endpoint, or record an explicit
  accept-the-wildcard rationale.

- **Operational checklist (not code):** strong/rotatable `TEST_LOGIN_SECRET`, dedicated
  least-privilege test account in `TEST_LOGIN_EMAIL`/`TEST_LOGIN_PASSWORD`, and confirmation the
  feature stays fail-closed when env is unset (already true — keep it).

### Honest code-vs-discipline split
- **Pure code:** #3 (bug), #4 (consolidation), #5 (`safeEqual`), #6 (CORS), both latent UI items.
- **Code + a real design decision:** #1 (rate-limiting needs a shared-store choice), #2 (new
  secret transport on the client).
- **Mostly operational/deployment discipline:** the secret-strength/rotation half of #2 and the
  least-privilege test account — captured here as a checklist, verified at deploy, not a diff.

## Risks / open questions
- **Rate-limiting store is unresolved.** Stateless edge functions have no built-in shared
  counter; design must pick a store and accept its latency/cost/complexity. A naive in-memory
  counter would be ineffective across edge instances — must be flagged so it is not chosen by
  accident.
- **Secret transport replacement** must not just relocate the leak (e.g. a hash in the URL is
  still in the URL). Design must define a transport that is genuinely not persisted.
- **Behavioral parity risk** when consolidating onto `AdminAuthContext.signIn`: the standard and
  quick paths currently have slightly different error copy and flow; consolidation must preserve
  the working standard login while fixing the quick path.
- **No automated tests** exist in this project, so verification leans on `eslint` + `tsc` (build)
  and manual exercise of both login paths. Regressions in the standard login are the main thing to
  watch.
- **CORS tightening** could break the function if invoked from an unexpected origin (preview
  deploys, Lovable environments); the allowed origin list must cover real call sites.
