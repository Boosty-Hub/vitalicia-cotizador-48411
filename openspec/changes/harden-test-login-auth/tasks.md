# Tasks — harden-test-login-auth

> SDD tasks artifact. Artifact store: openspec.
> Change: `harden-test-login-auth` | Project: vitalicia-cotizador-48411 | Date: 2026-06-09
> Reads: spec (test-login-endpoint + admin-auth-flow) + design.md

---

## Dependency order

```
T1 (migration)
    └─ T2 (edge function rewrite — needs the table to exist in prod before deploy)
T3 (AdminAuthContext — independent of T1/T2, can run in parallel)
    └─ T4 (AdminLoginPage — needs the new context API from T3)
T5 (config.toml confirmation — read-only check, parallel with everything)
T6 (deployment checklist — write-only doc task, parallel with everything)
T7 (verification — runs last, needs T1–T4 done)
```

Parallel groups:
- **Group A** (independent, run concurrently): T1, T3, T5, T6
- **Group B** (depends on Group A): T2 (after T1), T4 (after T3)
- **Group C** (depends on Group B): T7

---

## T1 — DB migration: `test_login_attempts` throttle table — **DESCOPED**

> **DESCOPED** — user: throttle/migration is over-engineering for a test login; keep URL quick-login for visual testing; no new infrastructure.

**Area:** Database / Supabase migration
**Sequential dependency:** none (Group A)
**Spec satisfied:** test-login-endpoint / "Rate-limit incoming attempts" — shared durable store requirement

### Steps

1. Create file `supabase/migrations/20260609HHMMSS_<uuid>.sql`
   (timestamp = current UTC at time of apply; generate a UUID v4 for the suffix).

2. Content:

   ```sql
   -- Migration: create rate-limit throttle table for test-login edge function.
   -- The app never queries this table. Only the edge function service-role client accesses it.
   -- RLS is enabled with NO policies → only service-role bypasses it. Invisible to anon/auth users.

   create table public.test_login_attempts (
     ip           text        not null,
     window_start timestamptz not null default date_trunc('minute', now()),
     attempts     integer     not null default 0,
     primary key (ip, window_start)
   );

   alter table public.test_login_attempts enable row level security;
   -- Intentionally no policies: service-role only (edge function).

   -- Optional partial index for the cleanup query (delete old windows).
   create index test_login_attempts_window_idx
     on public.test_login_attempts (window_start);

   -- Comment for future readers.
   comment on table public.test_login_attempts is
     'Per-IP fixed-window attempt counter for the test-login edge function. '
     'Service-role access only. Cleaned up opportunistically inside the function.';
   ```

3. Apply via Management API (NOT via `supabase db push` — use the HTTP endpoint per the supabase-vitalicia skill):

   ```sh
   curl -X POST "https://api.supabase.com/v1/projects/avlbdqqwldjteafmzwjb/database/query" \
     -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d @<path-to-payload.json>
   ```

   Payload JSON:
   ```json
   { "query": "<contents of the migration SQL above>" }
   ```

4. Verify via Management API that the table exists:
   ```json
   { "query": "select tablename, rowsecurity from pg_tables where tablename = 'test_login_attempts';" }
   ```
   Expected: one row, `rowsecurity = true`.

### Acceptance criteria
- `public.test_login_attempts` exists in Supabase with RLS enabled.
- No RLS policies are attached (only service-role can read/write).
- Index on `window_start` exists.
- `npm run lint` and `npm run build` pass (no TypeScript changes in this task).

---

## T2 — Edge function rewrite: `test-login/index.ts` — **DESCOPED**

> **DESCOPED** — user: keep URL quick-login for visual testing; no rate-limiting, no hash-compare, no CORS allow-list changes; edge function stays as-is.

**Area:** `supabase/functions/test-login/index.ts`
**Sequential dependency:** T1 must be applied (table exists) before this function is DEPLOYED. The code can be written in parallel; deployment is gated.
**Spec satisfied:** test-login-endpoint — all four requirements (rate-limit, body-only secret, constant-time compare, CORS allow-list, fail-closed on missing env)

### Steps

Rewrite `supabase/functions/test-login/index.ts` completely. The new implementation must:

1. **CORS allow-list** (Decision 6): Replace the hardcoded `"*"` with an env-driven reflect-if-allowed pattern.

   ```ts
   const allowed = (Deno.env.get("TEST_LOGIN_ALLOWED_ORIGINS") ?? "")
     .split(",").map((s) => s.trim()).filter(Boolean);
   const origin = req.headers.get("origin") ?? "";
   const allowOrigin = allowed.includes(origin) ? origin : "";
   const corsHeaders = {
     "Access-Control-Allow-Origin": allowOrigin || "null",
     "Vary": "Origin",
     "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
   };
   ```

   OPTIONS preflight must still return `200` with `corsHeaders`.

2. **Fail-closed on missing env** (existing behavior preserved): read `TEST_LOGIN_SECRET`,
   `TEST_LOGIN_EMAIL`, `TEST_LOGIN_PASSWORD` early; return `403` with
   `{ "error": "Acceso rápido no disponible" }` if any are missing.

3. **Secret from POST body only** (Decision 2): read `secret` from `await req.json()`, never
   from `req.url` or query params.

   ```ts
   const { secret }: { secret?: string } = await req.json().catch(() => ({}));
   if (!secret) {
     return new Response(JSON.stringify({ error: "Acceso denegado" }),
       { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
   }
   ```

4. **IP throttle — fail-closed** (Decision 1): use a service-role client to upsert-and-increment
   `test_login_attempts`. MUST run BEFORE the secret comparison.

   - Derive IP from `x-forwarded-for` (first comma-split value), then `cf-connecting-ip`,
     fallback to `"unknown"`.
   - Read `TEST_LOGIN_MAX_PER_MIN` env (default `10`).
   - Atomic upsert:

     ```sql
     insert into public.test_login_attempts (ip, window_start, attempts)
     values ($1, date_trunc('minute', now()), 1)
     on conflict (ip, window_start)
     do update set attempts = test_login_attempts.attempts + 1
     returning attempts
     ```

   - If the upsert errors → fail-closed: return `503` with
     `{ "error": "Servicio temporalmente no disponible" }`.
   - If returned `attempts > limit` → return `429` with `{ "error": "Demasiados intentos" }`.
   - Opportunistic cleanup (best-effort, no failure path): after the upsert succeeds,
     run `delete from public.test_login_attempts where window_start < now() - interval '1 hour'`
     with a `catch` that is swallowed (cleanup failure MUST NOT block the request).

5. **Constant-time hash comparison** (Decision 5): replace the existing `safeEqual` string
   function with SHA-256 digest comparison using `crypto.subtle`. Both sides hashed before
   comparison; the fixed 32-byte comparison loop has no early return on length.

   ```ts
   async function sha256(s: string): Promise<Uint8Array> {
     return new Uint8Array(
       await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))
     );
   }

   function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
     // Both are always 32 bytes (SHA-256) — no length branch needed.
     let mismatch = 0;
     for (let i = 0; i < a.length; i++) {
       mismatch |= a[i] ^ b[i];
     }
     return mismatch === 0;
   }

   const [digestA, digestB] = await Promise.all([sha256(secret), sha256(expectedSecret)]);
   if (!timingSafeEqualBytes(digestA, digestB)) {
     return new Response(JSON.stringify({ error: "Acceso denegado" }),
       { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
   }
   ```

6. **Session mint** (unchanged logic): use an anon client to call
   `signInWithPassword({ email: testEmail, password: testPassword })`. On error return `500`.
   On success return `200` with `{ access_token, refresh_token }`.

7. **Service-role client**: the throttle queries require a service-role client (anon client is
   blocked by RLS). Create it with `SUPABASE_SERVICE_ROLE_KEY` env var:

   ```ts
   const serviceClient = createClient(
     Deno.env.get("SUPABASE_URL")!,
     Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
     { auth: { autoRefreshToken: false, persistSession: false } }
   );
   ```

   `SUPABASE_SERVICE_ROLE_KEY` is already available as a built-in Supabase Edge Function secret
   (no manual secret set needed). The auth client for `signInWithPassword` continues using the
   anon key.

### Acceptance criteria
- `CORS: *` is GONE; the `Access-Control-Allow-Origin` header reflects a matched origin or `"null"`.
- `Vary: Origin` header is present.
- A request with a body-only secret works end-to-end (manual test).
- A request with correct secret but over the per-IP limit returns `429`.
- A request when the DB is unavailable returns non-200 (fail-closed).
- A request when any env var is missing returns `403`.
- `npm run build` passes (no TypeScript surface — but the Deno file must be syntactically valid;
  verify with a dry-run `deno check` if available locally).

---

## T3 — AdminAuthContext: `AuthOutcome` type + `verifyAdminOrSignOut` + `signInWithSession` — **[x] DONE**

**Area:** `src/contexts/AdminAuthContext.tsx`
**Sequential dependency:** none (Group A)
**Spec satisfied:** admin-auth-flow — "Single audited entry point", "has_role RPC error distinct from not-admin", "session-token login path", "reliable redirect"

### Steps

Edit `src/contexts/AdminAuthContext.tsx`:

1. **Add `AuthOutcome` tagged type** above the interface:

   ```ts
   type AuthOutcome =
     | null                                           // success
     | { kind: 'transient'; message: string }         // DB/RPC error — retry
     | { kind: 'forbidden'; message: string }         // not admin
     | { kind: 'auth'; message: string };             // Supabase auth error
   ```

2. **Update `AdminAuthContextType` interface**: change `signIn` return type and add
   `signInWithSession`:

   ```ts
   interface AdminAuthContextType {
     user: User | null;
     session: Session | null;
     isAdmin: boolean;
     isLoading: boolean;
     signIn: (email: string, password: string) => Promise<{ error: AuthOutcome }>;
     signInWithSession: (tokens: { access_token: string; refresh_token: string })
         => Promise<{ error: AuthOutcome }>;
     signOut: () => Promise<void>;
   }
   ```

3. **Add private `verifyAdminOrSignOut` helper** inside `AdminAuthProvider` (before the
   existing `signIn`). This replaces the existing `checkAdminRole` helper for the sign-in paths
   (the existing `checkAdminRole` is still used in the `onAuthStateChange` listener — keep it):

   ```ts
   const verifyAdminOrSignOut = async (userId: string): Promise<AuthOutcome> => {
     const { data, error } = await supabase.rpc('has_role', {
       _user_id: userId,
       _role: 'admin',
     });
     if (error) {
       console.error("verifyAdminOrSignOut — RPC error:", error);
       await supabase.auth.signOut();
       return { kind: 'transient', message: 'Error verificando permisos. Intenta de nuevo.' };
     }
     if (data !== true) {
       await supabase.auth.signOut();
       return { kind: 'forbidden', message: 'No tienes permisos de administrador.' };
     }
     setIsAdmin(true);
     return null;
   };
   ```

   IMPORTANT spec note: the admin-auth-flow spec says "MUST NOT call `supabase.auth.signOut`"
   on a TRANSIENT error (requirement "has_role RPC error is distinct from not admin" — scenario
   "Transient RPC error"). The design (Decision 4) does sign out on transient errors to avoid a
   half-authenticated session. The design OVERRIDES the spec here by explicit rationale. Implement
   the design's behavior (sign out on transient, different message copy) and add a TODO comment
   referencing the spec deviation:
   ```ts
   // NOTE: spec says do NOT sign out on transient RPC error; design overrides this to avoid
   // leaving a half-authenticated session. See design.md Decision 4.
   ```

4. **Refactor `signIn`** to use `verifyAdminOrSignOut`:

   ```ts
   const signIn = async (email: string, password: string): Promise<{ error: AuthOutcome }> => {
     try {
       const { data, error } = await supabase.auth.signInWithPassword({ email, password });
       if (error) {
         return { error: { kind: 'auth', message: error.message } };
       }
       if (!data.user) {
         return { error: { kind: 'transient', message: 'No se pudo obtener el usuario.' } };
       }
       const outcome = await verifyAdminOrSignOut(data.user.id);
       return { error: outcome };
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Error desconocido';
       return { error: { kind: 'transient', message } };
     }
   };
   ```

5. **Add `signInWithSession`**:

   ```ts
   const signInWithSession = async (
     tokens: { access_token: string; refresh_token: string }
   ): Promise<{ error: AuthOutcome }> => {
     try {
       const { data: sessionData, error: sessionError } = await supabase.auth.setSession(tokens);
       if (sessionError || !sessionData.user) {
         return {
           error: {
             kind: 'auth',
             message: sessionError?.message ?? 'No se pudo establecer la sesión.',
           },
         };
       }
       // Explicitly update user state so the redirect effect can fire even if
       // onAuthStateChange does not re-emit SIGNED_IN (spec: "reliable redirect").
       setUser(sessionData.user);
       setSession(sessionData.session);
       const outcome = await verifyAdminOrSignOut(sessionData.user.id);
       return { error: outcome };
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Error desconocido';
       return { error: { kind: 'transient', message } };
     }
   };
   ```

6. **Update the context Provider value** to include `signInWithSession`:

   ```tsx
   <AdminAuthContext.Provider value={{ user, session, isAdmin, isLoading, signIn, signInWithSession, signOut }}>
   ```

### Acceptance criteria
- `AuthOutcome` type is exported or at minimum inferred correctly at call sites.
- `signIn` returns the tagged outcome shape; existing error cases still produce the correct kind.
- `signInWithSession` exists and satisfies the three scenarios in the spec.
- `checkAdminRole` is retained (still used by `onAuthStateChange`).
- `npm run lint && npm run build` pass (zero TypeScript errors).

---

## T4 — AdminLoginPage: rewire both handlers + isLoading safety (URL→password-field DESCOPED) — **[x] DONE (partial)**

**Area:** `src/pages/admin/AdminLoginPage.tsx`
**Sequential dependency:** T3 must be done first (T4 consumes the new context API)
**Spec satisfied:** admin-auth-flow — "Single audited entry point", "loading state resolves in all paths", "gate secret not from URL", "session establishment reliably triggers redirect"

### Steps

Edit `src/pages/admin/AdminLoginPage.tsx`:

1. **Remove `supabase` import**: the page must no longer call `supabase` directly. Remove:
   ```ts
   import { supabase } from "@/integrations/supabase/client";
   ```
   (Spec: page MUST NOT call `supabase.auth.signInWithPassword`, `.rpc`, or `.signOut` directly.)

2. **Update the `useAdminAuth` destructure** to include `signInWithSession`:
   ```ts
   const { user, isAdmin, signIn, signInWithSession } = useAdminAuth();
   ```

3. **Replace URL-secret pattern** with a `?test=true` feature-flag + password input:

   Replace:
   ```ts
   const testSecret = searchParams.get("test");
   const testMode = !!testSecret;
   ```
   With:
   ```ts
   const testMode = searchParams.get("test") === "true";
   const [testSecret, setTestSecret] = useState("");
   ```

   Add a new `<Input>` rendered only when `testMode` is true, ABOVE the "Login Directo" button:
   ```tsx
   {testMode && (
     <div className="space-y-2">
       <Label htmlFor="test-secret">Clave de acceso rápido</Label>
       <Input
         id="test-secret"
         type="password"
         autoComplete="off"
         placeholder="••••••••••••"
         value={testSecret}
         onChange={(e) => setTestSecret(e.target.value)}
         disabled={isLoading}
       />
     </div>
   )}
   ```

4. **Rewrite `handleDirectLogin`** to use context + `try/finally` for `isLoading`:

   ```ts
   const handleDirectLogin = async () => {
     setError(null);
     setIsLoading(true);
     try {
       const { data: fnData, error: fnError } = await supabase.functions.invoke("test-login", {
         body: { secret: testSecret },
       });
       if (fnError || !fnData?.access_token || !fnData?.refresh_token) {
         setError("Acceso rápido no disponible o secreto inválido.");
         return;
       }
       const { error: authOutcome } = await signInWithSession({
         access_token: fnData.access_token,
         refresh_token: fnData.refresh_token,
       });
       if (authOutcome) {
         setError(authOutcome.message);
         return;
       }
       toast({ title: "Bienvenido", description: "Login de prueba exitoso" });
       setPendingRedirect(true);
     } catch (err) {
       setError("Error inesperado en login de prueba.");
     } finally {
       setIsLoading(false);
     }
   };
   ```

   Note: `supabase.functions.invoke` is the one remaining Supabase call on the page — it is the
   HTTP transport to the edge function, not an auth operation, so it is acceptable. The auth
   delegation is fully through the context.

   Re-add the `supabase` import ONLY for `functions.invoke`:
   ```ts
   import { supabase } from "@/integrations/supabase/client";
   ```
   (Keep it scoped to the invoke call only — do not restore any auth calls.)

5. **Rewrite `handleSubmit`** to route through context `signIn` + `try/finally`:

   ```ts
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setError(null);

     if (!email || !password) {
       setError("Por favor ingresa email y contraseña");
       return;
     }
     if (password.length < 6) {
       setError("La contraseña debe tener al menos 6 caracteres");
       return;
     }

     setIsLoading(true);
     try {
       const { error: authOutcome } = await signIn(email, password);
       if (authOutcome) {
         // Preserve existing friendly copy for known Supabase error messages.
         let errorMsg = authOutcome.message;
         if (authOutcome.kind === 'auth') {
           if (authOutcome.message.toLowerCase().includes("invalid login credentials")) {
             errorMsg = "Credenciales inválidas. Verifica tu correo y contraseña.";
           } else if (authOutcome.message.toLowerCase().includes("failed to fetch")) {
             errorMsg = "Error de conexión. Intenta limpiar la sesión con el botón de abajo.";
           } else if (authOutcome.message.toLowerCase().includes("email not confirmed")) {
             errorMsg = "Tu correo no está confirmado. Contacta al administrador.";
           }
         }
         setError(errorMsg);
         return;
       }
       toast({ title: "Bienvenido", description: "Has iniciado sesión correctamente" });
       setPendingRedirect(true);
     } catch (err) {
       console.error("Unexpected error:", err);
       setError("Error inesperado. Intenta limpiar la sesión.");
     } finally {
       setIsLoading(false);
     }
   };
   ```

6. **Add redirect safety timeout** (spec: "loading state resolves in all paths"):

   Add a `useEffect` that watches `pendingRedirect`:
   ```ts
   useEffect(() => {
     if (!pendingRedirect) return;
     const timeout = setTimeout(() => {
       setPendingRedirect(false);
       setIsLoading(false);
       setError("No se pudo completar el inicio de sesión. Intenta de nuevo.");
     }, 5000);
     return () => clearTimeout(timeout);
   }, [pendingRedirect]);
   ```

   This runs in parallel with the existing redirect effect and cancels itself if the redirect
   fires first (component unmounts on navigate → cleanup runs). If navigate never fires within
   5s, the timeout resets the state and shows an error.

7. **Preserve**: `handleClearSession`, the JSX structure, all existing labels and copy outside the
   two handlers. Only the logic internals of the two handlers change.

### Acceptance criteria
- `searchParams.get("test")` is only read as a boolean flag (`=== "true"`); its value is NEVER
  forwarded to the edge function.
- `testSecret` value comes from the `<Input type="password">` field, not the URL.
- `handleDirectLogin` uses `signInWithSession` from context; no direct `setSession` or `rpc` call.
- `handleSubmit` uses `signIn` from context; no direct `signInWithPassword` or `rpc` call.
- Both handlers have `try/finally { setIsLoading(false) }`.
- The redirect safety timeout exists.
- Friendly error copy for `invalid login credentials` / `failed to fetch` / `email not confirmed`
  is preserved.
- `npm run lint && npm run build` pass (zero TypeScript errors).

---

## T5 — Confirm `config.toml` entry for `test-login` — **DESCOPED**

> **DESCOPED** — user: do not modify supabase/config.toml.

**Area:** `supabase/config.toml` (read-only verification)
**Sequential dependency:** none (Group A, parallel with T1/T3/T6)
**Spec satisfied:** test-login-endpoint — fail-closed on missing env (function registration)

### Steps

1. Read `supabase/config.toml` and confirm the following block already exists:
   ```toml
   [functions.test-login]
   verify_jwt = false
   ```
2. Confirm no `[functions.test-login]` entry with `verify_jwt = true` exists.
3. CORS is implemented in code (Decision 6), NOT in config — no CORS entry needed.
4. If the block is present and correct → no file changes required. Mark this task done.
5. If missing → add it. (Current state: the block IS present as of last read — expect no change.)

### Acceptance criteria
- `supabase/config.toml` contains `[functions.test-login]` with `verify_jwt = false`.
- No structural change to the file is needed (confirm-only in the likely path).

---

## T6 — Deployment discipline checklist (non-code, post-merge) — **DESCOPED**

> **DESCOPED** — user: deployment-discipline items are out of scope for this apply run.

**Area:** Operational / Supabase Management API
**Sequential dependency:** none (Group A, parallel); MUST be executed only AFTER the PR is merged
**Spec satisfied:** test-login-endpoint — "Fail closed when env is not configured" (operational prerequisites)

> **These steps are NOT part of the code diff. Do NOT apply them now. Execute them after the PR is merged and reviewed.**

### Ordered steps (post-merge, via Supabase Management API)

1. **Generate a strong `TEST_LOGIN_SECRET`**: use a CSPRNG to generate >= 32 random bytes, encode
   as base64 or hex. Example (local shell):
   ```sh
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ```

2. **Set edge function secrets** via Management API:
   ```sh
   # Requires SUPABASE_ACCESS_TOKEN in env (from CLAUDE.md — never commit)
   curl -X POST "https://api.supabase.com/v1/projects/avlbdqqwldjteafmzwjb/functions/test-login/secrets" \
     -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "TEST_LOGIN_SECRET": "<generated-above>",
       "TEST_LOGIN_ALLOWED_ORIGINS": "https://<prod-domain>,https://<lovable-preview>,http://localhost:8080",
       "TEST_LOGIN_MAX_PER_MIN": "10"
     }'
   ```
   `TEST_LOGIN_EMAIL` and `TEST_LOGIN_PASSWORD` should already be set; confirm they point to
   a **dedicated least-privilege test account**, not a personal or super-admin account.

3. **Verify all three required env vars are set** (non-secret check):
   ```sh
   curl "https://api.supabase.com/v1/projects/avlbdqqwldjteafmzwjb/functions/test-login/secrets" \
     -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN"
   ```
   Confirm `TEST_LOGIN_SECRET`, `TEST_LOGIN_EMAIL`, `TEST_LOGIN_PASSWORD` are all present.

4. **Deploy the updated edge function**:
   ```sh
   # PATH prefix required on this machine:
   export PATH="/c/Program Files/nodejs:$PATH"
   npx supabase functions deploy test-login --project-ref avlbdqqwldjteafmzwjb
   ```
   Or via Management API upload if CLI is unavailable.

5. **Confirm `TEST_LOGIN_ALLOWED_ORIGINS`** includes every real call site:
   - Production app domain.
   - Lovable/preview origins (check the Lovable project settings for exact hostname).
   - `http://localhost:8080` for local dev.

6. **Secret rotation procedure** (document for team):
   - To rotate: generate new value, re-set `TEST_LOGIN_SECRET` via Management API, re-deploy.
   - No code change or git commit required — the secret is never in the repo.

7. **Confirm fail-closed** by temporarily withholding `TEST_LOGIN_SECRET` from the function env
   and verifying the function returns `403`. Then restore.

---

## T7 — Verification

**Area:** Manual QA + gate checks
**Sequential dependency:** T1, T2, T3, T4 all done (Group C)
**Spec satisfied:** both specs — all scenarios

### Steps

1. **Lint and build gate** (must pass before any manual testing):
   ```sh
   export PATH="/c/Program Files/nodejs:$PATH"
   npm run lint && npm run build
   ```
   Expected: zero errors, zero warnings that were not present before this change.

2. **Standard login path** (regression — must be verified before anything else):
   - Navigate to `/admin/login`.
   - Submit valid admin credentials → should redirect to `/admin`.
   - Submit invalid credentials → verify the friendly message for "invalid login credentials"
     appears ("Credenciales inválidas. Verifica tu correo y contraseña.").
   - Simulate a role-check failure scenario if possible (or confirm in code that the tagged
     outcome is correctly handled).

3. **Quick-login path** (the changed path):
   - Navigate to `/admin/login?test=true` (NOT `?test=<secret>`).
   - Verify: the secret input field appears; no auto-login occurs on page load.
   - Paste the correct `TEST_LOGIN_SECRET` into the field, click "Login Directo".
   - Verify: redirect to `/admin` succeeds; `isLoading` does not stay `true`.
   - Paste a wrong secret → verify `401` / error message shown.
   - Attempt more than `TEST_LOGIN_MAX_PER_MIN` times in a minute → verify `429` error
     message shown.

4. **URL cleanliness check**:
   - After quick-login, open browser history and confirm the secret does not appear in any URL.
   - Confirm `/admin/login?test=somesecretvalue` does NOT trigger any login action (the secret
     field should be empty; no auto-invoke of `handleDirectLogin`).

5. **CORS check** (manual, optional but recommended):
   - Inspect the `Access-Control-Allow-Origin` header on the test-login response in DevTools.
   - Confirm it matches the request `Origin` (not `*`).

6. **isLoading recovery**:
   - Simulate the timeout scenario: set `TEST_LOGIN_ALLOWED_ORIGINS` to an empty value so the
     browser's CORS blocks the response, or mock the context to return a deferred promise. Verify
     that within 5s, `isLoading` resets and an error message appears.
   - (Alternatively, confirm in code review that `try/finally` covers all exit paths.)

7. **config.toml confirmation** (T5 check):
   - Confirm `[functions.test-login]` with `verify_jwt = false` is present.

### Acceptance criteria
- `npm run lint && npm run build` pass.
- Both login paths work end-to-end (manual smoke test).
- Secret is never visible in any URL during quick-login flow.
- Error copy for standard login (invalid credentials, fetch error, unconfirmed email) is
  preserved exactly.
- `isLoading` never sticks permanently on any code path.

---

## Summary table

| ID | Task | Area | Parallelism | Spec | ~Lines changed |
|----|------|------|-------------|------|---------------|
| T1 | DB migration `test_login_attempts` | `supabase/migrations/*.sql` | Group A (parallel) | test-login-endpoint / rate-limit | ~20 new |
| T2 | Edge function rewrite `test-login` | `supabase/functions/test-login/index.ts` | Group B (after T1) | test-login-endpoint / all 4 req. | ~80 changed (full rewrite of 85-line file) |
| T3 | AdminAuthContext: `AuthOutcome` + `verifyAdminOrSignOut` + `signInWithSession` | `src/contexts/AdminAuthContext.tsx` | Group A (parallel) | admin-auth-flow / 4 of 6 req. | ~60 changed / added |
| T4 | AdminLoginPage: rewire both handlers, secret field, isLoading safety | `src/pages/admin/AdminLoginPage.tsx` | Group B (after T3) | admin-auth-flow / all 6 req. | ~80 changed |
| T5 | Confirm config.toml entry (no change expected) | `supabase/config.toml` | Group A (parallel) | test-login-endpoint / fail-closed | 0 (confirm-only) |
| T6 | Deployment discipline checklist | Ops / Management API | Group A, post-merge only | test-login-endpoint / fail-closed env | 0 code |
| T7 | Lint + build + manual verification | QA | Group C (after T1–T4) | both specs | 0 code |

---

## Review Workload Forecast

| Metric | Value |
|--------|-------|
| Estimated changed lines (code) | ~240 (T1: 20 + T2: 80 + T3: 60 + T4: 80 + T5: 0) |
| 400-line budget risk | LOW — well under 400 |
| Chained PRs recommended | No — all changes are tightly coupled (the context API change in T3 is consumed by T4; the edge function in T2 is consumed by the new page flow; splitting creates integration-broken intermediate states) |
| Decision needed before apply | No — proceed as single PR |
| Delivery strategy applied | `ask-on-risk` → risk is LOW, no split required |

All five code-touching tasks (T1–T4, T5) land in a single PR. T6 (ops/secrets) is explicitly
post-merge and produces zero diff. The two parallel groups (A and B) should be applied in order:
Group A tasks first, then Group B once their dependencies are done.
