# admin-auth-flow Specification

## Purpose

Governs the client-side authentication flow for admin login: `AdminAuthContext` (the
single auth entry point) and `AdminLoginPage` (the only consumer). Covers the standard
email/password path and the quick-login (token-session) path, the `has_role` error
semantics, and UI loading-state lifecycle.

---

## Requirements

### Requirement: Single audited entry point for all admin auth

`AdminAuthContext` MUST be the only place where the role-check (`has_role` RPC) and the
sign-out-on-failure policy are executed. `AdminLoginPage` MUST NOT call
`supabase.auth.signInWithPassword`, `supabase.rpc('has_role', ...)`, or
`supabase.auth.signOut` directly. Both login paths (email/password and quick-login) MUST
go through `AdminAuthContext`.

#### Scenario: Standard login delegates to context

- GIVEN a user submits email and password on the login form
- WHEN `handleSubmit` runs
- THEN it calls the context's `signIn` method (or equivalent named method)
- AND does NOT call `supabase.auth.signInWithPassword` inline in the page component

#### Scenario: Quick login delegates to context

- GIVEN the page detects a gate secret (not from the URL query string)
- WHEN `handleDirectLogin` runs
- THEN it calls the context's `signInWithSession` method (or equivalent)
- AND does NOT call `supabase.auth.setSession` or `supabase.rpc('has_role', ...)` inline

---

### Requirement: has_role RPC error is distinct from "not admin"

When the `has_role` RPC call fails (network error, RPC error, exception), the context
MUST treat this as a transient error. It MUST NOT sign the user out and MUST NOT report
the outcome as "no admin role". The caller (page or context consumer) MUST receive a
distinguishable error signal that allows it to display a retry-appropriate message.

#### Scenario: Transient RPC error — reported as transient, no sign-out

- GIVEN a user's credentials are valid and the session is established
- WHEN the `has_role` RPC returns an error object (not false, but an error)
- THEN the context returns an error indicating a transient failure
- AND does NOT call `supabase.auth.signOut`
- AND `isAdmin` remains `false` (unchanged)

#### Scenario: has_role returns false — not admin, sign out

- GIVEN a user signs in with valid credentials
- WHEN `has_role` returns `false` (no error)
- THEN the context calls `supabase.auth.signOut`
- AND returns an error indicating insufficient permissions

#### Scenario: has_role returns true — login succeeds

- GIVEN a user signs in with valid credentials
- WHEN `has_role` returns `true`
- THEN the context sets `isAdmin` to `true`
- AND returns `{ error: null }`

---

### Requirement: AdminAuthContext exposes a session-token login path

`AdminAuthContext` MUST expose a method (e.g., `signInWithSession`) that accepts an
`access_token` and `refresh_token`, establishes the session via `setSession`, and then
runs the same `has_role` check and sign-out-on-failure policy as the password path. This
method MUST be the sole mechanism by which `AdminLoginPage` consumes tokens returned by
the `test-login` edge function.

#### Scenario: Valid tokens with admin role — session established

- GIVEN the `test-login` function returns valid `access_token` and `refresh_token`
- WHEN `AdminLoginPage` calls `signInWithSession` with those tokens
- THEN the context calls `setSession`, verifies the admin role, and sets `isAdmin = true`
- AND returns `{ error: null }` to the page

#### Scenario: Valid tokens but no admin role — session terminated

- GIVEN tokens belong to a user without the admin role
- WHEN `signInWithSession` runs
- THEN `has_role` returns false, the context calls `signOut`, and returns a permissions error

#### Scenario: setSession fails — error returned

- GIVEN the tokens are malformed or expired
- WHEN `signInWithSession` calls `setSession`
- THEN it returns an error without proceeding to the role check

---

### Requirement: Loading state resolves in all code paths

`AdminLoginPage` MUST reset `isLoading` to `false` in every code path, including the
success path of `handleDirectLogin`. The UI MUST NOT remain in a permanently-loading
state when the auth context redirect effect does not fire (e.g., `user` or `isAdmin`
never resolve). The page MUST include a timeout or explicit reset so that `isLoading`
returns to `false` within a bounded time even without a successful redirect.

#### Scenario: Quick login succeeds but redirect fires — loading resets

- GIVEN `handleDirectLogin` calls `signInWithSession` and it succeeds
- WHEN the redirect effect fires (user and isAdmin are truthy)
- THEN `isLoading` is `false` before or as part of navigation (not stuck as `true`)

#### Scenario: Quick login succeeds but redirect never fires — loading resets via timeout

- GIVEN `signInWithSession` returns no error
- WHEN the `pendingRedirect` effect does not resolve within a bounded period (user/isAdmin unset)
- THEN `isLoading` is reset to `false`
- AND an error message is shown to the user

#### Scenario: Quick login fails — loading resets immediately

- GIVEN `signInWithSession` returns an error
- WHEN `handleDirectLogin` handles the error
- THEN `setIsLoading(false)` is called before the function returns

---

### Requirement: Gate secret is not sourced from URL query string

`AdminLoginPage` MUST NOT read the gate secret from `searchParams.get("test")` or any
other URL query parameter. The secret MUST be obtained through a mechanism that does not
persist in browser history, the page `Referer` header, or proxy logs (e.g., a prompted
input, a short-lived in-memory token passed through state). The URL `/admin/login` MUST
NOT accept `?test=` as a functional parameter.

#### Scenario: URL contains ?test= — secret ignored

- GIVEN a user navigates to `/admin/login?test=somesecret`
- WHEN the page loads
- THEN the `?test=` parameter is NOT used to trigger or populate quick-login
- AND no automatic login attempt is made

#### Scenario: Quick login secret entered via non-URL mechanism — login proceeds

- GIVEN the quick-login input mechanism is available (e.g., a prompted field)
- WHEN the user supplies the correct secret
- THEN `handleDirectLogin` is invoked with the secret value from that mechanism
- AND the URL remains clean (no secret in the address bar)

---

### Requirement: Session establishment reliably triggers admin redirect

After `signInWithSession` succeeds, the context MUST ensure that `user` and `isAdmin`
are set in a way that causes the redirect effect to fire. Relying solely on
`onAuthStateChange` emitting `SIGNED_IN` is insufficient when a session is already
present. The context MUST explicitly set state after `setSession` + role-check succeed
so that `pendingRedirect` consumers observe the updated values.

#### Scenario: setSession does not re-emit SIGNED_IN — redirect still fires

- GIVEN a session is already present and `setSession` is called with new tokens
- WHEN `onAuthStateChange` does NOT emit `SIGNED_IN`
- THEN the context's `signInWithSession` method still updates `user` and `isAdmin` directly
- AND the redirect effect in `AdminLoginPage` fires

#### Scenario: Fresh session established — redirect fires normally

- GIVEN no prior session exists
- WHEN `setSession` succeeds and `has_role` returns true
- THEN `user` and `isAdmin` are set, and the pending-redirect effect navigates to `/admin`
