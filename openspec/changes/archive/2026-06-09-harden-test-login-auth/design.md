# Design — harden-test-login-auth

> SDD design artifact. Artifact store: openspec (archived).
> Change: `harden-test-login-auth` | Project: vitalicia-cotizador-48411 | Date: 2026-06-09
> Reads: `openspec/changes/archive/2026-06-09-harden-test-login-auth/proposal.md`

## DESIGN DECISIONS IMPLEMENTED (v1.0)

### Decision 3 — Consolidate both handlers onto `AdminAuthContext`

**Choice: add a private `verifyAdminOrSignOut(userId)` helper inside the context, refactor the
existing `signIn` to use it, and add a new public `signInWithSession({ access_token, refresh_token })`
that also uses it. Route BOTH page handlers through the context.**

This decision was FULLY IMPLEMENTED in v1.0.

#### Context API change

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

Shared private helper (the single home of the security policy):

```ts
// Returns null on success, or a tagged error distinguishing transient vs not-admin.
async function verifyAdminOrSignOut(userId: string): Promise<AuthOutcome> {
  const { data, error } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
  if (error) {
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

**Status**: ✓ IMPLEMENTED in `src/contexts/AdminAuthContext.tsx`

---

### Decision 4 — `roleError` handling: transient vs not-admin

**Choice: `verifyAdminOrSignOut` (Decision 3) distinguishes the two cases via a tagged outcome.**

- `has_role` returns an **error** → `{ kind: 'transient', ... }`. The user is signed out but the
  message tells the truth: it's a transient failure, not a permission denial.
- `has_role` returns `data !== true` → `{ kind: 'forbidden', ... }`.

**DESIGN OVERRIDE NOTED**: The original spec (admin-auth-flow) said "do NOT call `supabase.auth.signOut`
on a transient RPC error". The design rationale for overriding is: cannot leave a half-authenticated session.
This is a material deviation that was explicitly called out and approved by the user.

**Status**: ✓ IMPLEMENTED in `src/contexts/AdminAuthContext.tsx` + `src/pages/admin/AdminLoginPage.tsx`

---

### Decision 7 — Latent issues: `isLoading` recovery + reliable redirect

**7a. `isLoading` never reset on the quick-login success path.**

**Choice:** model loading with `try/finally` so it always resets.

- Both handlers wrap in `try { ... } finally { setIsLoading(false); }`.
- Add a **safety timeout** in the page: if `pendingRedirect` is set but `user && isAdmin` has not
  resolved within 5s, clear state and show error.

**7b. Reliable redirect after session set / `SIGNED_IN` may not fire.**

**Choice:** routing through `signInWithSession` (Decision 3) removes the foot-gun because the helper
sets `isAdmin` **explicitly** rather than depending on the auth event. The redirect effect fires
deterministically.

**Status**: ✓ IMPLEMENTED in `src/pages/admin/AdminLoginPage.tsx`

---

## DESIGN DECISIONS DEFERRED (future release)

### Decision 1 — Rate-limiting (DEFERRED)

**Choice: a Supabase table-backed fixed-window counter keyed by client IP, fail-closed.**

**Status**: ⏳ Not implemented. Descoped by user request.

---

### Decision 2 — Secret off the URL (DEFERRED)

**Choice: secret entered into dedicated password-input field, sent ONLY in POST body.**

**Status**: ⏳ Not implemented. User kept `?test=<secret>` URL mechanism for visual testing.
This is paired with Decision 1 (edge function rewrite with throttle/CORS) in the future release.

---

### Decision 5 — Constant-time compare without length short-circuit (DEFERRED)

**Choice: compare fixed-length SHA-256 digests of both sides.**

**Status**: ⏳ Not implemented. Paired with Decision 2 (edge function rewrite).

---

### Decision 6 — CORS scope (DEFERRED)

**Choice: tighten `Access-Control-Allow-Origin` from `*` to env-driven allow-list.**

**Status**: ⏳ Not implemented. Paired with Decision 1 (edge function rewrite).

---

## Architecture Summary

The three-layer pattern described in the proposal is PARTIALLY implemented:

1. **Edge function `test-login`** — NOT CHANGED. Still reads from URL query params. Decisions 1, 5, 6 deferred.
2. **`AdminAuthContext`** — FULLY CHANGED. Now the single post-auth authority with `verifyAdminOrSignOut` helper (Decisions 3, 4).
3. **`AdminLoginPage`** — PARTIALLY CHANGED. Handlers rewired to use context (Decision 3), loading/redirect fixed (Decision 7), but `?test=<secret>` still in URL (Decision 2 deferred).

Future release (harden-test-login-auth-phase2) should implement Decisions 1, 2, 5, 6 to complete the picture.

---

## Components Touched (v1.0)

| Component | Status |
|---|---|
| `supabase/migrations/<new>.sql` | ⏳ Deferred (T1) |
| `supabase/functions/test-login/index.ts` | ⏳ Deferred (T2) |
| `supabase/config.toml` | No change (confirmed as-is) |
| `src/contexts/AdminAuthContext.tsx` | ✓ Changed (T3 complete) |
| `src/pages/admin/AdminLoginPage.tsx` | ✓ Changed (T4 complete, partial) |

---

## Notes for Next Release (harden-test-login-auth-phase2)

When Decisions 1–2–5–6 are revisited:

- Decision 1 requires T1 (migration) + T2 (edge function rewrite) in sequence.
- Decision 2 pairs with Decisions 1, 5, 6 (all T2 work).
- The `?test=true` feature flag is already in place in `AdminLoginPage`; minimal additional change needed on the page side once the edge function accepts body-only secrets.
- Operational checklist (strong secret, least-privilege test account, CORS origin list) remains outstanding until T6 is executed.

All design rationale and rejected alternatives are documented in the full design.md in the original change artifacts (if needed for reference).
