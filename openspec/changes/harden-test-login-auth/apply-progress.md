# Apply Progress — harden-test-login-auth

> Artifact store: openspec
> Date: 2026-06-09
> Executor: sdd-apply (sonnet-4-6)

## Scope applied

User reduced scope to findings #3 and #4 only:
- #3 — fix swallowed `has_role` RPC error in `handleDirectLogin`
- #4 — consolidate both login handlers through `AdminAuthContext`

Explicitly descoped: T1 (migration), T2 (edge fn rewrite), T5 (config.toml), T6 (deployment checklist),
and the URL→password-field part of T4 (keep `?test=<secret>` URL mechanism for visual testing).

## Tasks

| ID | Status | Notes |
|----|--------|-------|
| T1 | DESCOPED | user: throttle/migration is over-engineering for a test login |
| T2 | DESCOPED | user: keep URL quick-login for visual testing; no edge fn changes |
| T3 | [x] DONE | AdminAuthContext: AuthOutcome type + verifyAdminOrSignOut + signInWithSession |
| T4 | [x] DONE (partial) | Rewired both handlers; isLoading try/finally; redirect safety timeout. URL→password-field descoped. |
| T5 | DESCOPED | user: do not modify config.toml |
| T6 | DESCOPED | user: deployment-discipline items out of scope |
| T7 | pending | Manual verification — not run (no test runner; lint + build gate passed) |

## What was implemented

### T3 — `src/contexts/AdminAuthContext.tsx`

- Added `AuthOutcome` tagged union type (null | transient | forbidden | auth).
- Updated `AdminAuthContextType` interface: `signIn` now returns `Promise<{ error: AuthOutcome }>`;
  added `signInWithSession` signature.
- Added private `verifyAdminOrSignOut(userId)` helper:
  - Calls `has_role` RPC.
  - On RPC error → signs out, returns `{ kind: 'transient', message: 'Error verificando permisos. Intenta de nuevo.' }`.
  - On `data !== true` → signs out, returns `{ kind: 'forbidden', message: 'No tienes permisos de administrador.' }`.
  - On success → calls `setIsAdmin(true)`, returns `null`.
  - Design override note: spec says do NOT sign out on transient error; design.md Decision 4 explicitly overrides — signs out to avoid half-authenticated session.
- Refactored `signIn` to route through `verifyAdminOrSignOut` with `try/catch`.
- Added `signInWithSession({ access_token, refresh_token })`:
  - Calls `supabase.auth.setSession(tokens)`.
  - Explicitly sets `user` and `session` state (reliable redirect even if `SIGNED_IN` doesn't re-emit).
  - Then calls `verifyAdminOrSignOut`.
- Updated Provider value to include `signInWithSession`.
- `checkAdminRole` retained (still used by `onAuthStateChange` listener).

### T4 — `src/pages/admin/AdminLoginPage.tsx` (partial)

- Destructures `signIn, signInWithSession` from `useAdminAuth()`.
- `handleDirectLogin` rewired:
  - Still reads `testSecret` from URL query param `?test=<secret>` (UNCHANGED — user requirement).
  - After invoking `test-login` edge fn, calls `context.signInWithSession(tokens)` instead of inline `setSession` + `rpc`.
  - Checks `authOutcome.message` for errors instead of swallowing the RPC error.
  - `try/finally` ensures `setIsLoading(false)` always runs.
- `handleSubmit` rewired:
  - Calls `context.signIn(email, password)` instead of inline `signInWithPassword` + `rpc`.
  - Friendly copy mapping preserved for `auth` kind errors (invalid login credentials, failed to fetch, email not confirmed).
  - `try/finally` ensures `setIsLoading(false)` always runs.
- Added redirect safety timeout `useEffect`: if `pendingRedirect` is set but redirect never fires within 5s, clears state and shows error.
- `supabase` import retained for `functions.invoke` only.

## Gate results

```
npm run lint   → pre-existing warnings/errors only (none in modified files); 2 pre-existing warnings in AdminAuthContext.tsx (react-hooks/exhaustive-deps on isLoading, react-refresh/only-export-components)
npm run build  → ✓ built in 17.16s (zero TypeScript errors; pre-existing chunk-size warning)
```

## Deviations from design

1. `?test=<secret>` URL mechanism kept (user requirement). Design called for a password-type input field replacing URL secret. The `handleDirectLogin` now routes through context (`signInWithSession`) which fixes the core security/correctness issues (#3, #4) while preserving the URL-based quick-login UX.
2. T1/T2/T5/T6 descoped entirely.
