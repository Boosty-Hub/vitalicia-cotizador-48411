# test-login-endpoint Specification

## Purpose

Governs the public Supabase Edge Function `test-login` that validates a shared secret
and returns a short-lived admin session. Because it is unauthenticated and mints admin
tokens, it carries the highest security weight in the quick-login flow.

---

## DEFERRED REQUIREMENTS (Not implemented in v1.0)

The following requirements were specified in the design but explicitly deferred during implementation
at reduced scope (user decision: "throttle/migration is over-engineering for a test login"):

### Requirement: Rate-limit incoming attempts (DEFERRED)

The function MUST enforce a fail-closed per-IP (or per-secret-attempt) counter using a
shared, durable store. When the counter exceeds the configured threshold within the
rolling window, the function MUST return HTTP 429 and MUST NOT proceed to secret
comparison or session minting. If the shared store is unreachable, the function MUST
fail closed (return 429 or 503) rather than fall through to the secret check.

**Status**: Not implemented. Defer to future hardening release.

---

### Requirement: Constant-time secret comparison without length leak (DEFERRED)

The function MUST compare the submitted secret to the expected secret in a way that
reveals neither the secret value nor its length through response timing. The comparison
MUST NOT return early based on string length before performing the constant-time loop.
Both inputs MUST be normalized to a fixed-length representation (e.g., hash both sides)
before comparison.

**Status**: Not implemented. Defer to future hardening release.

---

### Requirement: CORS scoped to known origins (DEFERRED)

The function MUST NOT set `Access-Control-Allow-Origin: *`. The allowed origin MUST be
restricted to the deployed app origin(s) (production and any legitimate preview/staging
origins). If a wildcard is explicitly accepted, a written rationale MUST be present in
the function source as a comment, and it MUST be reviewed before production deployment.

**Status**: Not implemented. Defer to future hardening release.

---

## IMPLEMENTED REQUIREMENTS

None of the test-login-endpoint security requirements were implemented in this reduced-scope
change. The function implementation was explicitly kept as-is.

---

## Rationale for Deferral

Per the apply-progress report, the user reduced scope to findings #3 (RPC error handling)
and #4 (consolidation onto AdminAuthContext). The edge-function hardening (T2) and database
migration (T1) were descoped as out-of-proportion to the test-login feature's role as an
admin convenience endpoint. The primary controls (strong secret, operational discipline)
remain in place; the throttle, hash-compare, and CORS tightening are safety-in-depth items
flagged for a future hardening pass.

---

## Fail-closed envelope (existing behavior, preserved)

The function continues to return HTTP 403 when any of `TEST_LOGIN_SECRET`, `TEST_LOGIN_EMAIL`,
or `TEST_LOGIN_PASSWORD` are absent from the function environment, preventing operation if
misconfigured.
