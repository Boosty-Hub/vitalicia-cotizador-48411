# Archive Report — harden-test-login-auth

**Change**: `harden-test-login-auth`  
**Project**: vitalicia-cotizador-48411  
**Artifact Store**: openspec  
**Archived Date**: 2026-06-09  
**Status**: COMPLETE (Reduced Scope)  

---

## Executive Summary

The `harden-test-login-auth` change was delivered at **reduced scope** (user decision). Two of six originally-scoped security findings were implemented and verified:

- **#3 (IMPLEMENTED)**: Fixed swallowed `has_role` RPC error in `handleDirectLogin` → now correctly distinguishes transient failures from permission denials.
- **#4 (IMPLEMENTED)**: Consolidated both login handlers (`handleSubmit` and `handleDirectLogin`) through a single `AdminAuthContext` entry point with shared `verifyAdminOrSignOut` policy.

Four findings were explicitly descoped:
- #1 (rate-limiting migration) — user: over-engineering for test login.
- #2 (secret off URL) — user: kept `?test=<secret>` URL mechanism for visual testing.
- #5 (timing-safe hash-compare) — descoped with #2.
- #6 (CORS allow-list) — descoped with #1/#2.

**Verification Status**: PASSED ✓  
**Test Framework**: None (project has no test runner; lint + build gates passed).  
**Files Changed**:
- `src/contexts/AdminAuthContext.tsx` — added `AuthOutcome` type, `verifyAdminOrSignOut` helper, `signInWithSession` method.
- `src/pages/admin/AdminLoginPage.tsx` — rewired both handlers to use context, added `try/finally` for `isLoading` safety, added redirect timeout.

---

## What Was Shipped (Implemented + Verified)

### Finding #3: has_role RPC error is distinct from "not admin"

**Spec Requirement**: admin-auth-flow / "has_role RPC error is distinct from not-admin"  
**Implementation**: Added `AuthOutcome` tagged union in `AdminAuthContext`:

```typescript
type AuthOutcome =
  | null                                          // success
  | { kind: 'transient'; message: string }        // transient error → retry
  | { kind: 'forbidden'; message: string }        // not admin → redirect
  | { kind: 'auth'; message: string };            // auth failure
```

**Behavior**: The `verifyAdminOrSignOut(userId)` helper now:
- Returns `{ kind: 'transient', ... }` on RPC error → user is signed out but message says "Intenta de nuevo."
- Returns `{ kind: 'forbidden', ... }` when `has_role` returns `false`.
- Returns `null` on success.

Both login handlers receive and surface this outcome, fixing the bug where `handleDirectLogin` would swallow the error and report "No tienes permisos" on a transient DB failure.

**Files**: `src/contexts/AdminAuthContext.tsx`

---

### Finding #4: Single audited entry point (consolidation)

**Spec Requirement**: admin-auth-flow / "Single audited entry point for all admin auth"  
**Implementation**: 

Added `signInWithSession({ access_token, refresh_token })` to `AdminAuthContext`. Both paths now route through the context:

- **Standard login** (`handleSubmit`): calls `signIn(email, password)` → `verifyAdminOrSignOut`.
- **Quick login** (`handleDirectLogin`): calls `signInWithSession(tokens)` → `verifyAdminOrSignOut`.

The `verifyAdminOrSignOut` helper is the **single home** of the sign-in → role-check → sign-out-on-failure policy (fixing the "three copies" maintainability issue).

**Additional improvements**:
- `isLoading` recovery: both handlers wrapped in `try/finally { setIsLoading(false) }`, preventing frozen UI.
- Redirect reliability: `signInWithSession` explicitly sets `user` and `isAdmin` state after `setSession`, ensuring the redirect effect fires even if `onAuthStateChange` does not re-emit `SIGNED_IN`.
- Redirect safety timeout: added a 5-second safety timeout in `handleDirectLogin` to reset state if redirect never fires, preventing permanent frozen UI.

**Files**:
- `src/contexts/AdminAuthContext.tsx` (added `signInWithSession`, `verifyAdminOrSignOut`, `AuthOutcome` type)
- `src/pages/admin/AdminLoginPage.tsx` (rewired both handlers, added `try/finally`, added timeout)

---

## What Was Deferred (Not Implemented)

### Finding #1: Rate-limiting / brute-force protection — **DESCOPED**

**Spec Requirement**: test-login-endpoint / "Rate-limit incoming attempts"  
**Design Decision**: Postgres fixed-window IP throttle + fail-closed behavior.  
**Status**: Not implemented.  
**Reason**: User decision — "throttle/migration is over-engineering for a test login. Keep the URL quick-login for visual testing."

**Note**: The primary brute-force control (strong, random, high-entropy `TEST_LOGIN_SECRET`) remains in place at the operational level. The throttle was a defense-in-depth layer that can be added in a future hardening pass if needed.

---

### Finding #2: Secret transport off URL — **DESCOPED**

**Spec Requirement**: test-login-endpoint / "Secret transport must not persist in URL"  
**Design Decision**: Replace `?test=<secret>` URL pattern with `?test=true` feature flag + password-input field.  
**Status**: Not implemented.  
**Reason**: User decision — URL secret mechanism kept for visual testing convenience.

**Note**: The `?test=<secret>` URL quick-login remains unchanged. This is a separate hardening task that includes updating the edge function to accept the secret in POST body only (currently reads from URL). Deferred to next phase.

---

### Finding #5: Timing-safe secret comparison — **DESCOPED**

**Spec Requirement**: test-login-endpoint / "Constant-time secret comparison without length leak"  
**Design Decision**: Replace early-return length check with SHA-256 hash-based comparison.  
**Status**: Not implemented.  
**Reason**: Paired with Finding #2 (secret transport). Edge function changes descoped together.

---

### Finding #6: CORS scope tightening — **DESCOPED**

**Spec Requirement**: test-login-endpoint / "CORS scoped to known origins"  
**Design Decision**: Replace `Access-Control-Allow-Origin: *` with env-driven allow-list.  
**Status**: Not implemented.  
**Reason**: Paired with Finding #1/#2 (edge function rewrite). Descoped together.

---

## Specs Synced to Main Specs

| Domain | Action | Details |
|--------|--------|---------|
| `admin-auth-flow` | Created | 4 requirements (all implemented in this change) |
| `test-login-endpoint` | Created | Marked deferred — documents the 3 requirements (#1, #5, #6) that were not implemented and will be addressed in future hardening pass |

Both specs are now at `openspec/specs/{domain}/spec.md` as the source of truth.

---

## Verification Report

**Build & Lint**: PASSED ✓
```
npm run lint   → pre-existing warnings only; none in modified files
npm run build  → ✓ zero TypeScript errors (17.16s)
```

**Manual Verification** (per T7 in tasks.md):
- Standard login path tested → works ✓
- Quick-login path (with `?test=<secret>` URL mechanism) tested → works ✓
- Error copy preserved → ✓
- isLoading recovery timeout verified → ✓

**Spec Compliance**:
- ✅ Requirement "Single audited entry point" → PASS (both handlers route through context)
- ✅ Requirement "has_role RPC error distinct" → PASS (tagged outcome distinguishes transient from forbidden)
- ✅ Requirement "Loading state resolves in all paths" → PASS (try/finally + timeout)
- ✅ Requirement "Session reliably triggers redirect" → PASS (explicit state setting in `signInWithSession`)
- ⏳ Requirement "Rate-limit attempts" → DEFERRED (not in scope)
- ⏳ Requirement "Secret transport off URL" → DEFERRED (not in scope)
- ⏳ Requirement "Constant-time compare" → DEFERRED (not in scope)
- ⏳ Requirement "CORS scoped" → DEFERRED (not in scope)

---

## Archive Contents

All change artifacts preserved in `openspec/changes/archive/2026-06-09-harden-test-login-auth/`:

- `proposal.md` — Full problem statement, scope, and approach
- `design.md` — 7 architectural decisions (Decision 4 overrides spec for transient-error handling)
- `specs/admin-auth-flow/spec.md` — Requirements for consolidated auth flow
- `specs/test-login-endpoint/spec.md` — Requirements for public endpoint (deferred items noted)
- `tasks.md` — Full task breakdown (T1–T7); T1/T2/T5/T6 descoped
- `apply-progress.md` — Apply execution log: scope, tasks completed, deviations noted

All artifacts merged into main specs:
- `openspec/specs/admin-auth-flow/spec.md` — Main source of truth (4 implemented requirements)
- `openspec/specs/test-login-endpoint/spec.md` — Main source of truth (3 deferred requirements documented)

---

## Deviations from Original Design

Per apply-progress report:

1. **`?test=<secret>` URL mechanism kept** (user requirement). Design called for a password-input field; the URL mechanism is retained for visual testing convenience. This is a tradeoff: the security hardening (#4 consolidation, #3 bug fix) is complete; the transport hardening (#2 URL→body) is deferred.

2. **T1/T2/T5/T6 descoped entirely**:
   - T1 (DB migration) — user: over-engineering
   - T2 (edge function rewrite) — paired with #1
   - T5 (config.toml) — confirm-only, no change
   - T6 (deployment checklist) — post-merge operational work

These four tasks account for ~160 lines of the original planned ~240-line change. The remaining scope (T3 + T4 + T7 verification) focused on the two most critical findings (#3 bug, #4 consolidation) and delivered them with full verification.

---

## Risks & Limitations

1. **Deferred edge-function hardening** — rate-limiting, timing-safe compare, CORS tightening remain outstanding. These are defense-in-depth; the primary control (strong secret via operational procedure) is still in place. Monitor for future exploitation attempts on the public endpoint; next release should include T1–T2.

2. **Secret still in URL** — `?test=<secret>` persists in browser history/logs. Acceptable for a visual-testing admin convenience, but a production risk if the secret is ever revealed. Operational discipline (strong, rotatable secret; least-privilege test account) is the primary mitigation. T2 (edge function rewrite) must happen before this moves to customer-facing environments.

3. **No automated tests** — verification leans on `eslint` + `tsc` (build) and manual exercise. Standard login regression is the main risk to watch. Code review should focus on behavioral parity of the standard login path.

4. **Design override noted** — Decision 4 (sign out on transient error) overrides the original spec (which said do NOT sign out on transient). The design rationale is sound (avoid half-authenticated session), but this is a material deviation. Future changes to auth error handling should reference design.md Decision 4.

---

## SDD Cycle Complete

The change has been fully planned (proposal), specced (admin-auth-flow + test-login-endpoint), designed (7 decisions), partially tasked (2/6 implementations), applied (T3 + T4), verified (PASS), and archived.

**Ready for next change**. The deferred edge-function items can be promoted to a new SDD cycle (e.g. `/sdd-new harden-test-login-auth-phase2`) if prioritized.

---

## Artifact Links

All artifacts preserved in openspec mode for team sharing and git history:

| Artifact | Path |
|----------|------|
| Proposal | `openspec/changes/archive/2026-06-09-harden-test-login-auth/proposal.md` |
| Design | `openspec/changes/archive/2026-06-09-harden-test-login-auth/design.md` |
| Specs (admin-auth-flow) | `openspec/specs/admin-auth-flow/spec.md` (main) |
| Specs (test-login-endpoint) | `openspec/specs/test-login-endpoint/spec.md` (main) |
| Tasks | `openspec/changes/archive/2026-06-09-harden-test-login-auth/tasks.md` |
| Apply Progress | `openspec/changes/archive/2026-06-09-harden-test-login-auth/apply-progress.md` |
| Archive Report | `openspec/changes/archive/2026-06-09-harden-test-login-auth/ARCHIVE.md` (this file) |

---

## Session Notes

- **Mode**: openspec (file-based, committable, shareable).
- **Engram**: Not connected; all artifacts in files.
- **Date Archived**: 2026-06-09 (ISO format).
- **Executor**: sdd-archive (haiku-4-5).
