# Archive Index — harden-test-login-auth

**Date Archived**: 2026-06-09  
**Status**: COMPLETE (Reduced Scope v1.0)  
**Project**: vitalicia-cotizador-48411  
**Artifact Store**: openspec  

---

## Artifact Map

### Main Artifacts (SDD cycle)

| File | Purpose |
|------|---------|
| `proposal.md` | Problem statement, scope, approach (v1.0 reduced scope) |
| `design.md` | Architectural decisions (3 implemented, 4 deferred) |
| `tasks.md` | Task breakdown: T1–T7 (T1/T2/T5/T6 descoped; T3/T4/T7 done) |
| `apply-progress.md` | Apply execution log: what was done, deviations from plan |

### Archive Report (this release)

| File | Purpose |
|------|---------|
| `ARCHIVE.md` | Final archive report with traceability, spec merge summary, risks |
| `INDEX.md` | This file — navigation guide |

### Merged into Main Specs

| File | Purpose |
|------|---------|
| `openspec/specs/admin-auth-flow/spec.md` | Main spec: 4 implemented requirements (findings #3, #4, latent issues) |
| `openspec/specs/test-login-endpoint/spec.md` | Main spec: 3 deferred requirements documented (findings #1, #5, #6) |

---

## What Shipped (v1.0)

- ✅ **Finding #3 (DELIVERED)**: Swallowed `has_role` RPC error fixed via tagged `AuthOutcome` type
- ✅ **Finding #4 (DELIVERED)**: Both login handlers consolidated onto `AdminAuthContext` via `verifyAdminOrSignOut` helper
- ✅ **Latent UI issues (DELIVERED)**: `isLoading` now resets via `try/finally`; redirect now reliable via explicit state setting + timeout

### Files Changed

| File | Status |
|------|--------|
| `src/contexts/AdminAuthContext.tsx` | ✓ Changed (added types, helper, new method) |
| `src/pages/admin/AdminLoginPage.tsx` | ✓ Changed (rewired both handlers, added timeout) |

### Build Gates

- `npm run lint` → PASSED (zero errors in modified files)
- `npm run build` → PASSED (zero TypeScript errors, 17.16s)

---

## What Was Deferred (v2.0)

- ⏳ **Finding #1 (DEFERRED)**: Rate-limiting / brute-force protection (T1 migration + T2 edge fn)
- ⏳ **Finding #2 (DEFERRED)**: Secret off URL query string (T2 edge fn + T4 page changes)
- ⏳ **Finding #5 (DEFERRED)**: Timing-safe secret comparison (T2 edge fn)
- ⏳ **Finding #6 (DEFERRED)**: CORS scope tightening (T2 edge fn)

**Reason**: User decision — "over-engineering for test login; keep the convenience URL mechanism for visual testing."

---

## Reading Order

1. **Quick summary**: Read `ARCHIVE.md` ("Executive Summary" section)
2. **What was built**: Read `design.md` (decisions 3, 4, 7 only)
3. **How it was built**: Read `apply-progress.md` (T3 + T4 sections)
4. **Full context** (optional): Read `proposal.md` for the original problem space
5. **For next release**: Read `tasks.md` (T1/T2/T5/T6 sections) to pick up deferred work

---

## Key Decisions

### Decision 4 (Design Override)

The spec said "do NOT sign out on transient RPC error."  
The design says "DO sign out to avoid half-authenticated session."  
We implemented the design decision.

This is a safety trade-off: on a transient DB error, users are signed out (with a clear "Retry" message)
rather than left in an ambiguous half-authenticated state. If RPC fails, the user can retry.

---

## For Future v2.0 Release

To complete the hardening, implement:

1. **T1** — Create `test_login_attempts` table (Postgres fixed-window IP throttle)
2. **T2** — Rewrite `test-login` edge function to:
   - Accept secret in POST body only (no URL query params)
   - Use hash-based constant-time comparison
   - Enforce IP-based rate-limiting via T1 table
   - Tighten CORS to allow-list via env var
3. **T6** — Set operational env vars (strong secret, least-privilege test account, CORS origins)

The client-side work (v1.0 in `src/`) is ready for both URL-based (`?test=<secret>`)
and body-based secret transports. When T2 moves to body-only, update the `handleDirectLogin`
secret input field from URL query param to a dedicated form field.

---

## Archive Location

All files preserved in:
```
openspec/changes/archive/2026-06-09-harden-test-login-auth/
```

The change folder `openspec/changes/harden-test-login-auth/` has been moved here to keep the
active changes directory clean.

---

## Questions?

- **Why only findings #3 and #4?** User decision to reduce scope to findings that don't require
  new infrastructure (database, edge function rewrite). The other findings are deferred to v2.0.

- **Why is `?test=<secret>` still in the URL?** User chose to keep the URL mechanism for visual
  testing convenience. The security hardening (moving to POST body) is part of the v2.0 scope.

- **What's the risk?** The public endpoint still leaks its secret to browser history and logs.
  The primary mitigation is operational (strong, rotatable secret). The secondary mitigations
  (throttle, hash-compare, CORS) are planned for v2.0.

- **Why sign out on transient error?** To avoid a half-authenticated session (confused state).
  The design rationale overrides the original spec. See `design.md` Decision 4.
