# Tasks — harden-test-login-auth (Archived)

> SDD tasks artifact. Artifact store: openspec (archived).
> Change: `harden-test-login-auth` | Project: vitalicia-cotizador-48411 | Date: 2026-06-09
> Reads: spec (admin-auth-flow) + design.md

Full task breakdown is in the original `openspec/changes/harden-test-login-auth/tasks.md` (before archival).
This summary reflects v1.0 execution.

---

## Task Summary (v1.0)

| ID | Task | Area | Status | Lines |
|----|------|------|--------|-------|
| T1 | DB migration `test_login_attempts` | `supabase/migrations/*.sql` | ⏳ DESCOPED | ~20 (planned) |
| T2 | Edge function rewrite `test-login` | `supabase/functions/test-login/index.ts` | ⏳ DESCOPED | ~80 (planned) |
| T3 | AdminAuthContext: `AuthOutcome` + `verifyAdminOrSignOut` + `signInWithSession` | `src/contexts/AdminAuthContext.tsx` | ✓ DONE | ~60 changed |
| T4 | AdminLoginPage: rewire both handlers, isLoading safety | `src/pages/admin/AdminLoginPage.tsx` | ✓ DONE (partial) | ~80 changed |
| T5 | Confirm config.toml entry | `supabase/config.toml` | ✓ CONFIRMED | 0 (confirm-only) |
| T6 | Deployment discipline checklist | Ops / Management API | ⏳ DESCOPED | 0 (post-merge) |
| T7 | Lint + build + manual verification | QA | ✓ PASSED | 0 (code) |

---

## Implemented Tasks (v1.0)

### T3 — AdminAuthContext: `AuthOutcome` + `verifyAdminOrSignOut` + `signInWithSession`

**Status**: ✓ COMPLETE

**Changes**:
- Added `AuthOutcome` tagged union type: `null | { kind: 'transient', ... } | { kind: 'forbidden', ... } | { kind: 'auth', ... }`
- Added private `verifyAdminOrSignOut(userId: string)` helper that:
  - Calls `has_role` RPC
  - Returns `{ kind: 'transient' }` on RPC error (and signs out)
  - Returns `{ kind: 'forbidden' }` on `data !== true` (and signs out)
  - Returns `null` on success (and sets `isAdmin = true`)
- Refactored `signIn` to use `verifyAdminOrSignOut`
- Added new `signInWithSession({ access_token, refresh_token })` that:
  - Calls `supabase.auth.setSession(tokens)`
  - Explicitly sets `user` and `session` state
  - Calls `verifyAdminOrSignOut` and returns tagged outcome
- Updated Provider value to include `signInWithSession`
- Preserved `checkAdminRole` (still used in `onAuthStateChange` listener)

**File**: `src/contexts/AdminAuthContext.tsx`

---

### T4 — AdminLoginPage: rewire both handlers, isLoading safety (Partial)

**Status**: ✓ COMPLETE (Partial per scope reduction)

**Implemented**:
- Destructure `signIn, signInWithSession` from `useAdminAuth()`
- `handleDirectLogin` rewired:
  - Reads `testSecret` from URL query param `?test=<secret>` (unchanged — user requirement)
  - Calls `test-login` edge fn, then `context.signInWithSession(tokens)` instead of inline ops
  - Checks `authOutcome.message` for errors instead of swallowing RPC error
  - `try/finally` ensures `setIsLoading(false)` always runs
- `handleSubmit` rewired:
  - Calls `context.signIn(email, password)` instead of inline ops
  - Friendly error copy mapping preserved (invalid credentials, fetch error, unconfirmed email)
  - `try/finally` ensures `setIsLoading(false)` always runs
- Added redirect safety timeout: if `pendingRedirect` is set but redirect never fires within 5s, resets state
- `supabase` import retained for `functions.invoke` only

**NOT Implemented** (deferred per user scope reduction):
- `?test=<secret>` → `?test=true` + password-input field (Decision 2, paired with edge function rewrite T2)

**File**: `src/pages/admin/AdminLoginPage.tsx`

---

### T5 — Confirm config.toml entry

**Status**: ✓ CONFIRMED

Verified `supabase/config.toml` contains `[functions.test-login]` with `verify_jwt = false`.
No changes required.

---

### T7 — Verification (Lint + Build + Manual QA)

**Status**: ✓ PASSED

Build gates:
```
npm run lint   → pre-existing warnings only; none in modified files
npm run build  → ✓ zero TypeScript errors (17.16s)
```

Manual QA:
- Standard login path tested → works
- Quick-login path tested → works
- Error copy preserved → ✓
- isLoading recovery timeout verified → ✓

---

## Descoped Tasks (v2.0)

### T1 — DB migration: `test_login_attempts` throttle table — **DESCOPED**

Reason: User decision — "over-engineering for test login"

This task was to create a Postgres fixed-window IP-based throttle table. Descoped as part of reducing
scope to findings #3 and #4 (RPC error handling + consolidation). Planned for v2.0 hardening release.

---

### T2 — Edge function rewrite: `test-login/index.ts` — **DESCOPED**

Reason: User decision — "keep URL quick-login for visual testing"

This task involved:
1. CORS allow-list (Decision 6)
2. Hash-based constant-time secret comparison (Decision 5)
3. Rate-limiting with T1 table (Decision 1)
4. Secret from POST body only (Decision 2)

All paired with Decision 2 (secret transport). Descoped and planned for v2.0 hardening release.

---

### T6 — Deployment discipline checklist — **DESCOPED**

Reason: User decision — post-merge operational work

This is operational setup (via Supabase Management API), not code. Includes:
- Generate strong `TEST_LOGIN_SECRET`
- Set `TEST_LOGIN_ALLOWED_ORIGINS` env var
- Confirm `TEST_LOGIN_EMAIL` / `TEST_LOGIN_PASSWORD` point to least-privilege test account
- Deploy edge function

Planned for post-merge, after code review and PR merge.

---

## Scope Reduction Impact

Original planned work: ~240 changed lines  
Actual v1.0 work: ~140 changed lines (T3 + T4 only)

Descoped: T1 (20) + T2 (80) + T6 (0) = ~100 lines deferred

**Impact**: Focused on the two must-fix findings (#3 and #4). Security hardening (rate-limit,
hash-compare, CORS) and operational discipline deferred to v2.0. Feature remains functional for
visual testing; production use still recommended to defer until v2.0 hardenening is complete.

---

## Review Workload

| Metric | Value |
|--------|-------|
| Changed lines (v1.0 actual) | ~140 |
| 400-line budget risk | LOW |
| Chained PRs recommended | No |
| Single PR | Yes |

All changes delivered in one PR. Changes are tightly coupled (context API in T3 consumed by T4);
splitting creates integration-broken intermediate states.
