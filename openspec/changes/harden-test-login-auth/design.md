# Design — harden-test-login-auth

> SDD design artifact. Artifact store: openspec.
> Change: `harden-test-login-auth` | Project: vitalicia-cotizador-48411 | Date: 2026-06-09
> Reads: `openspec/changes/harden-test-login-auth/proposal.md`

## Guiding principle

This is **hardening + consolidation of an existing test-login**, not building an auth
platform. Every decision below is deliberately proportionate: the simplest defensible option
that closes the finding without standing up new infrastructure or rewriting the working
standard login. Where "proportionate" means *accept-with-rationale*, that is stated explicitly
and flagged as a decision, not an omission.

## Architecture approach

**Pattern: single audited auth entry point (consolidation), thin public throttle-and-mint
edge function, secret transported only in POST body.**

Three layers, each with one responsibility:

1. **Edge function `test-login`** (public, `verify_jwt = false`) — the only component that knows
   the gate secret and the test credentials. Responsibilities: throttle, constant-time secret
   compare, mint a session, return tokens. It does NOT do role checks (that is the client/context
   policy, kept in one place).
2. **`AdminAuthContext`** — the single post-auth authority. Owns the `sign-in → has_role →
   sign-out-on-failure` policy for BOTH password login and token-session login. After this change
   it exposes two entry points that share one private role-verification helper.
3. **`AdminLoginPage`** — pure UI. Collects input, calls the context, renders state. It stops
   orchestrating auth by hand (no direct `setSession`, no direct `has_role`, no direct `signOut`).

Data flow (quick-login, after change):

```
admin pastes secret into password-style field
        │  (state only, never in URL)
        ▼
handleDirectLogin → supabase.functions.invoke("test-login", { body:{ secret } })   // POST body
        │
        ▼
test-login: throttle check → safeEqual(hash(secret), hash(expected)) → signInWithPassword(env creds)
        │  returns { access_token, refresh_token }   OR  429 / 401 / 403 / 500
        ▼
handleDirectLogin → authContext.signInWithSession({ access_token, refresh_token })
        │
        ▼
AdminAuthContext.signInWithSession → setSession → verifyAdminOrSignOut(userId)   // shared helper
        │  returns { error: null } | { error: <transient> } | { error: <not-admin> }
        ▼
handleDirectLogin maps the result to UI; redirect driven by context state (user && isAdmin)
```

Standard login flows through the SAME `verifyAdminOrSignOut` helper via `signIn`, so the two paths
converge after authentication.

---

## Decision 1 — Rate-limiting (security, medium-high)

**Choice: a Supabase table-backed fixed-window counter keyed by client IP, enforced inside
`test-login`, fail-closed. Plus mandatory high-entropy secret as the primary control.**

A new migration adds:

```sql
create table public.test_login_attempts (
  ip        text        not null,
  window_start timestamptz not null default date_trunc('minute', now()),
  attempts  integer     not null default 0,
  primary key (ip, window_start)
);
alter table public.test_login_attempts enable row level security;
-- No policies → no anon/authenticated access. Only the service-role client
-- (used inside the edge function) bypasses RLS. The table is invisible to the app.
```

Enforcement in the function (service-role client, before the secret compare):

1. Derive `ip` from `x-forwarded-for` (first hop) / `cf-connecting-ip`, falling back to a constant
   bucket `"unknown"` when no header is present (so a header-stripping attacker still shares one
   throttled bucket — fail-closed, not fail-open).
2. Atomic upsert-and-increment for the current minute window:
   `insert ... on conflict (ip, window_start) do update set attempts = test_login_attempts.attempts + 1 returning attempts`.
3. If `attempts > LIMIT` (default **10/min**, env-overridable via `TEST_LOGIN_MAX_PER_MIN`) →
   return `429` with a generic body, BEFORE comparing the secret.
4. Best-effort cleanup: opportunistically `delete ... where window_start < now() - interval '1 hour'`
   on a fraction of calls (cheap, keeps the table from growing unbounded). No cron needed.

Why fixed-window (not sliding/token-bucket): one round-trip, trivially correct, no extra infra.
A test-login does not need precise fairness — it needs "you cannot grind thousands/sec."

**Honest tradeoff:** this adds one DB round-trip (~5–30 ms) before each attempt and one tiny table.
That latency is irrelevant for an interactive admin login. The counter is shared across all edge
instances precisely because it lives in Postgres — which is the whole point.

**Rejected alternatives:**
- *In-memory counter* — REJECTED and explicitly flagged as a trap. Deno edge functions are
  stateless and horizontally scaled; an in-memory map resets per cold start and is not shared
  across instances, so it provides near-zero protection. Choosing it would be a silent
  false-sense-of-security. (The proposal called this out; we honor it.)
- *External KV (Upstash/Redis)* — REJECTED for this scope. Lower per-call latency, but it stands up
  new infrastructure, a new secret, and a new failure mode for a convenience endpoint. Out of scope
  per the proposal ("no dedicated Redis").
- *Accept-with-mitigation only (no throttle, just a strong secret)* — REJECTED as the sole control,
  but ADOPTED as the **primary** control layered under the throttle. A 256-bit random secret is not
  brute-forceable regardless of rate; the throttle is defense-in-depth and turns a misconfigured
  weak secret from "instant" into "infeasible," and it caps abuse/log-noise. Belt and suspenders, both cheap.

**The strong-secret half is deployment discipline** (see Operational checklist), not code. The code
requirement here is: *the throttle exists and fails closed.*

---

## Decision 2 — Secret off the URL (security, medium)

**Choice: the secret is entered into a dedicated password-type input on the login page and sent
ONLY in the POST body of `test-login`. The `?test=true` query param (boolean flag, no secret) is
retained solely to REVEAL the quick-login field.**

Concretely:
- `testMode = searchParams.get("test") === "true"` — a non-sensitive feature flag. No secret value
  ever rides the URL.
- When `testMode` is on, render an extra `<Input type="password" autoComplete="off">` plus the
  "Login Directo" button. The admin pastes the secret there; it lives in React state only.
- `handleDirectLogin` sends `{ secret }` in the `invoke` body (already a POST). The secret never
  touches `window.location`, history, `Referer`, or any GET.

This genuinely keeps the secret out of:
- **Browser history / bookmarks** — it was never in the URL.
- **`Referer` headers** — outbound navigations carry only `?test=true`.
- **Proxy/CDN/edge access logs** — request bodies of POSTs are not logged as URLs; the secret is in
  the body, not the path/query.

**Rejected alternatives:**
- *Move a hash of the secret into the URL* — REJECTED. The proposal nailed it: a hash in the URL is
  still in the URL (still logged, still in history, still replayable against the endpoint). Relocating
  the leak is not fixing it.
- *Custom request header instead of body* — REJECTED as no better than the body and slightly more
  fragile with `supabase.functions.invoke` (which already POSTs JSON cleanly); headers can also be
  logged by some proxies. Body is the clean, conventional transport.
- *One-time link / short-lived signed flow* — REJECTED as over-engineering for a test-login. It adds
  issuance/expiry machinery for a convenience feature. The paste-into-field model is simpler and
  achieves the "not persisted" requirement.
- *Keep reading `?test=<secret>`* — REJECTED; this is the exact finding being fixed.

UX note: pasting on every quick-login is the deliberate cost of not persisting the secret. Acceptable
for an admin-only convenience path.

---

## Decision 3 — Consolidate both handlers onto `AdminAuthContext` (maintainability)

**Choice: add a private `verifyAdminOrSignOut(userId)` helper inside the context, refactor the
existing `signIn` to use it, and add a new public `signInWithSession({ access_token, refresh_token })`
that also uses it. Route BOTH page handlers through the context.**

### Context API change

```ts
interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthOutcome }>;
  signInWithSession: (tokens: { access_token: string; refresh_token: string })
      => Promise<{ error: AuthOutcome }>;          // NEW
  signOut: () => Promise<void>;
}
```

Shared private helper (the single home of the security policy — fixes the "third copy" drift):

```ts
// Returns null on success, or a tagged error distinguishing transient vs not-admin.
async function verifyAdminOrSignOut(userId: string): Promise<AuthOutcome> {
  const { data, error } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
  if (error) {                                   // Decision 4: transient, do NOT mislabel
    await supabase.auth.signOut();
    return { kind: 'transient', message: 'Error verificando permisos. Intenta de nuevo.' };
  }
  if (data !== true) {
    await supabase.auth.signOut();
    return { kind: 'forbidden', message: 'No tienes permisos de administrador.' };
  }
  setIsAdmin(true);
  return null;
}
```

`signIn` (standard) becomes: `signInWithPassword` → on auth error return it → else
`verifyAdminOrSignOut(data.user.id)`.

`signInWithSession` (quick) becomes: `supabase.auth.setSession(tokens)` → on session error return it →
else `verifyAdminOrSignOut(sessionData.user.id)`.

Both return the SAME outcome shape, so the page renders errors uniformly.

### Page change

- `handleSubmit` (standard) stops calling `supabase.auth.signInWithPassword` / `has_role` /
  `signOut` directly. It calls `const { error } = await signIn(email, password)` from the context and
  maps `error` to UI. **Behavioral-parity guard:** the friendly-message mapping for
  `invalid login credentials` / `failed to fetch` / `email not confirmed` is preserved — it moves
  into the page's error-mapping (the page still owns *copy*; the context owns *policy*). The context
  returns the raw auth error so the page can map it.
- `handleDirectLogin` (quick) stops calling `setSession` / `has_role` / `signOut` directly. It calls
  `invoke("test-login")` then `const { error } = await signInWithSession(tokens)` and maps `error`.

**Why this shape:** `has_role` + sign-out-on-failure is the security-sensitive invariant — it now
lives in exactly one function (`verifyAdminOrSignOut`). The page keeps only presentation concerns
(input, copy, redirect). This collapses three copies to one and fixes #3 by construction (the helper
inspects `error`).

**Rejected alternatives:**
- *Overload `signIn` with a union arg (`string|tokens`)* — REJECTED. A separate `signInWithSession`
  reads clearer, avoids fragile runtime type-sniffing, and keeps each call site obvious.
- *Move `has_role` into the edge function and have it return "isAdmin"* — REJECTED. The role policy
  must also gate the standard password path (no edge function involved), so the single home must be
  the client context, not the function. Keeping the function role-agnostic also keeps it minimal.
- *Leave `handleSubmit` inline and only fix `handleDirectLogin`* — REJECTED. That preserves the
  duplication the proposal explicitly scoped in (finding #4). Both must converge.

**Parity risk handled:** standard-login copy and redirect behavior are preserved verbatim; only the
*plumbing* moves into the context. The redirect mechanism (Decision 7) is unchanged for both paths.

---

## Decision 4 — `roleError` handling: transient vs not-admin (correctness bug, the must-fix)

**Choice: `verifyAdminOrSignOut` (Decision 3) distinguishes the two cases via a tagged outcome.**

- `has_role` returns an **error** → `{ kind: 'transient', message: 'Error verificando permisos.
  Intenta de nuevo.' }`. The user is signed out (cannot leave a half-authenticated session) but the
  message tells the truth: it's a transient failure, not a permission denial.
- `has_role` returns `data !== true` → `{ kind: 'forbidden', message: 'No tienes permisos de
  administrador.' }`.

This fixes the exact bug in `handleDirectLogin` (which destructured only `{ data: hasAdminRole }`,
dropped the error, and mislabeled a transient RPC failure as "not admin"). Because BOTH paths now go
through the one helper, the quick path inherits the correct behavior that the standard path already
had — and the standard path keeps it.

**Rejected alternative:** *return a boolean and let the page guess* — REJECTED; that is exactly how the
bug arose. A tagged outcome makes the distinction unrepresentable-to-lose.

---

## Decision 5 — Constant-time compare without length short-circuit (security, low)

**Choice: compare fixed-length SHA-256 digests of both sides, so the loop length is constant
regardless of input length.**

```ts
async function sha256(s: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
}
// usage:
const [a, b] = await Promise.all([sha256(secret), sha256(expectedSecret)]);
const equal = timingSafeEqualBytes(a, b);   // both always 32 bytes → no length branch
```

`timingSafeEqualBytes` XOR-accumulates over the fixed 32-byte arrays with no early return. Because
both operands are always exactly 32 bytes, the `if (a.length !== b.length) return false` length leak
disappears entirely — the comparison reveals nothing about the real secret's length, and the digest
of a wrong guess is uncorrelated with the digest of the real secret.

Using Web Crypto (`crypto.subtle`) is available in Deno Deploy and avoids pulling a dependency.

**Rejected alternatives:**
- *Keep the length-equality short-circuit* — REJECTED; it's the finding. Trivial to remove.
- *Pad/truncate raw strings to a fixed length then compare* — REJECTED; padding logic is error-prone
  and can itself leak via the padding boundary. Hashing both sides is the clean uniform-length move.
- *Accept-with-rationale (random secret makes length moot)* — CONSIDERED and REJECTED in favor of
  fixing, because the fix is ~5 lines and removes the question entirely. (Had it been costly, accepting
  would have been defensible.)

---

## Decision 6 — CORS scope (security, low)

**Choice: tighten `Access-Control-Allow-Origin` from `*` to an explicit allow-list, reflecting the
request `Origin` when it matches, else returning no CORS-allow (browser blocks it).**

Allow-list, sourced from env so it is configurable per environment without a redeploy of code:
- Production app origin (the deployed Vitalicia domain).
- Lovable/preview origins and `http://localhost:8080` for dev — provided via
  `TEST_LOGIN_ALLOWED_ORIGINS` (comma-separated).

```ts
const allowed = (Deno.env.get("TEST_LOGIN_ALLOWED_ORIGINS") ?? "").split(",").map(s=>s.trim()).filter(Boolean);
const origin = req.headers.get("origin") ?? "";
const allowOrigin = allowed.includes(origin) ? origin : "";   // "" → no cross-origin grant
const corsHeaders = {
  "Access-Control-Allow-Origin": allowOrigin || "null",
  "Vary": "Origin",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

**Honest framing (kept from the proposal):** CORS is browser-enforced and does NOT stop a direct
(curl/non-browser) attacker — the throttle (Decision 1) and the secret are the real controls. CORS
tightening is defense-in-depth: it stops a malicious *web page* in a user's browser from invoking
this endpoint cross-origin. So it's worth the small change, but we do not over-invest.

**Operational guard (flagged):** the allow-list MUST include every real call site (prod domain,
preview/Lovable, localhost). If `TEST_LOGIN_ALLOWED_ORIGINS` is misconfigured, browser quick-login
breaks (a direct curl still works, which is fine for diagnosis). This is the proposal's stated CORS
risk; mitigated by env-driven config + documenting the required values in the checklist.

**Rejected alternative:** *keep `*`* — accept-with-rationale was an option per the proposal, but since
the function now mints admin tokens, tightening is cheap and the right default. Rejected in favor of
the allow-list.

---

## Decision 7 — Latent issues: `isLoading` recovery + reliable redirect

**7a. `isLoading` never reset on the quick-login success path.**

Current bug: `handleDirectLogin` sets `isLoading(true)` and on success only sets
`pendingRedirect(true)`, relying on the redirect effect firing. If `user`/`isAdmin` never resolve, the
button stays frozen with no error.

**Choice:** model loading with `try/finally` so it always resets, and decouple the *redirect-pending*
state from the *button-busy* state.

- `handleDirectLogin` and `handleSubmit` both wrap their body in `try { ... } finally { setIsLoading(false); }`.
- On success they set `pendingRedirect(true)`; the redirect effect navigates when `user && isAdmin`.
- Add a **safety timeout** in the page: if `pendingRedirect` is set but `user && isAdmin` has not
  resolved within ~5s, clear `pendingRedirect`, set a transient error
  ("No se pudo completar el inicio de sesión. Intenta de nuevo."), so the UI never sits frozen.
  (Mirrors the context's existing 5s init-loading timeout pattern — consistent with the codebase.)

**7b. Reliable redirect after session set / `SIGNED_IN` may not fire.**

Current risk: when calling `setSession` directly with an already-present session, `onAuthStateChange`
may not emit `SIGNED_IN`, so the context's listener may not refresh `isAdmin`.

**Choice:** routing through `signInWithSession` (Decision 3) removes the foot-gun because the helper
sets `isAdmin` **explicitly** (`setIsAdmin(true)` on success) rather than depending on the auth event
to propagate. The redirect effect (`pendingRedirect && user && isAdmin`) then fires deterministically:
`setSession` updates `user` via the listener, and `signInWithSession` updates `isAdmin` synchronously
within the call. The page no longer races the event bus.

**Rejected alternatives:**
- *Navigate immediately inside the handler after `setSession`* — REJECTED; it can outrun the
  context's `user`/`isAdmin` and land on `/admin` before `ProtectedAdminRoute` sees the session,
  causing a bounce. The effect-driven redirect gated on resolved state is safer.
- *Force a `window.location` reload to pick up the session* — REJECTED; heavy-handed, loses SPA
  state, and the explicit `setIsAdmin(true)` makes it unnecessary.

---

## Components touched (no implementation here — tasks phase will sequence)

| Component | Change |
|---|---|
| `supabase/migrations/<new>.sql` | NEW: `test_login_attempts` table + RLS-enabled, no policies (service-role only). |
| `supabase/functions/test-login/index.ts` | Add throttle (Decision 1), hash-based constant-time compare (Decision 5), origin allow-list CORS (Decision 6). Secret still read from POST body (unchanged transport on the server side). |
| `supabase/config.toml` | No structural change needed — `test-login` stays `verify_jwt = false`. (CORS is in code, not config.) |
| `src/contexts/AdminAuthContext.tsx` | Add `verifyAdminOrSignOut` private helper; refactor `signIn` to use it; add `signInWithSession`; tagged `AuthOutcome` shape. |
| `src/pages/admin/AdminLoginPage.tsx` | `?test=true` reveals a password-type secret field (Decision 2); `handleSubmit` routes through `signIn`; `handleDirectLogin` routes through `signInWithSession`; `try/finally` for `isLoading`; redirect safety timeout (Decision 7). |

`src/integrations/supabase/client.ts` and `types.ts` are auto-generated — NOT edited. The new table
does not need a generated-types regen for this feature because the app never queries it (only the
edge function does, via raw service-role calls); regen is optional and a deploy-time nicety.

---

## ADR summary (decision · rationale · rejected)

| # | Decision | Why | Rejected |
|---|---|---|---|
| 1 | Postgres fixed-window IP throttle, fail-closed, + strong secret primary | Shared across stateless edge instances; one cheap round-trip; no new infra | In-memory (ineffective), Redis (over-infra), no-throttle (insufficient alone) |
| 2 | Secret in POST body; `?test=true` only reveals the field | Genuinely off history/Referer/logs; simplest | Hash-in-URL (still leaks), custom header (no better), one-time-link (over-engineered) |
| 3 | `verifyAdminOrSignOut` helper + `signInWithSession`; both handlers route through context | Security policy in ONE place; fixes drift | Overloaded `signIn` (fragile), role-in-function (breaks standard path), fix-only-quick (keeps dup) |
| 4 | Tagged outcome: transient vs forbidden | Makes the bug unrepresentable | Boolean return (the original bug) |
| 5 | Compare SHA-256 digests (fixed 32 bytes) | Removes length branch entirely; ~5 LOC | Keep short-circuit (the finding), pad raw (error-prone), accept (fix is cheaper) |
| 6 | Origin allow-list via env, reflect-if-allowed | Defense-in-depth vs malicious web pages; configurable | Keep `*` (too broad for token-minting) |
| 7 | `try/finally` loading + explicit `setIsAdmin(true)` + redirect safety timeout | Deterministic redirect, never frozen UI | Imperative navigate (race), reload (heavy) |

---

## Operational checklist (deployment discipline — NOT code, verified at deploy)

These are set/verified via the **Supabase Management API** (per the supabase-vitalicia skill rule —
never from browser code, never committed). They are out of the code diff but in scope as discipline:

- [ ] `TEST_LOGIN_SECRET` is **long, random, high-entropy** (>= 256 bits, e.g. 32+ random bytes
      base64/hex) and **rotatable**. This is the PRIMARY brute-force control; the throttle is backup.
- [ ] `TEST_LOGIN_EMAIL` / `TEST_LOGIN_PASSWORD` point to a **dedicated least-privilege test admin
      account**, not a personal/super admin.
- [ ] `TEST_LOGIN_ALLOWED_ORIGINS` lists every real call site: prod domain, Lovable/preview origins,
      `http://localhost:8080`. Misconfig breaks browser quick-login (curl still works for diagnosis).
- [ ] `TEST_LOGIN_MAX_PER_MIN` optional override (default 10) confirmed sane for the team.
- [ ] Confirm the function stays **fail-closed** when any of secret/email/password is unset (already
      true in current code — keep the early `403`).
- [ ] Secret rotation procedure documented: rotate `TEST_LOGIN_SECRET` via Management API; no code
      change or redeploy of the bundle required (secret was never in the bundle or URL).

---

## Risks / assumptions carried into tasks + verify

- **No automated tests** in this project — verification leans on `eslint` + `tsc` (build) and **manual
  exercise of BOTH login paths** (standard email/password AND quick-login). The standard login is the
  regression to watch hardest, since `handleSubmit` is being rewired through the context.
- **Behavioral parity of standard login**: the friendly error-copy mapping (`invalid login
  credentials`, `failed to fetch`, `email not confirmed`) MUST survive the move into the context-driven
  flow. Tasks must call this out as an explicit verification step.
- **CORS allow-list completeness**: an incomplete `TEST_LOGIN_ALLOWED_ORIGINS` silently breaks browser
  quick-login in some environment. Mitigated by env config + checklist, but a real deploy-time gotcha.
- **Throttle table assumption**: assumes the edge function uses a service-role client to read/write
  `test_login_attempts` (RLS denies anon). If the function lacks the service-role key in env, the
  throttle insert fails — design choice is **fail-closed** (a throttle write failure should block, not
  silently allow). Tasks must specify the failure handling explicitly.
- **IP attribution**: `x-forwarded-for` can be spoofed/absent; the `"unknown"` fallback bucket means a
  header-stripping attacker is throttled as a single shared bucket. Accepted — the secret is the real
  gate; the throttle is defense-in-depth.
- **`crypto.subtle` availability** in the Deno Deploy runtime is assumed (standard Web Crypto). Tasks
  should confirm during build/deploy.
- **Generated types**: not regenerated for the new table since the app never queries it; if a future
  change makes the app touch it, regen via Management API per the skill.
