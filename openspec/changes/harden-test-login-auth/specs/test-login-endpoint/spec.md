# test-login-endpoint Specification

## Purpose

Governs the public Supabase Edge Function `test-login` that validates a shared secret
and returns a short-lived admin session. Because it is unauthenticated and mints admin
tokens, it carries the highest security weight in the quick-login flow.

---

## Requirements

### Requirement: Rate-limit incoming attempts

The function MUST enforce a fail-closed per-IP (or per-secret-attempt) counter using a
shared, durable store. When the counter exceeds the configured threshold within the
rolling window, the function MUST return HTTP 429 and MUST NOT proceed to secret
comparison or session minting. If the shared store is unreachable, the function MUST
fail closed (return 429 or 503) rather than fall through to the secret check.

#### Scenario: Under the rate limit — attempt succeeds

- GIVEN the function is configured and the shared counter for the caller is at zero
- WHEN a POST arrives with the correct secret in the request body
- THEN the function returns HTTP 200 with `access_token` and `refresh_token`
- AND the attempt counter is incremented

#### Scenario: Over the rate limit — attempt is rejected

- GIVEN the caller has exceeded the configured attempt threshold within the rolling window
- WHEN any POST arrives (correct or incorrect secret)
- THEN the function returns HTTP 429 before performing secret comparison
- AND no session is minted

#### Scenario: Counter store unreachable — function fails closed

- GIVEN the shared counter store is down or times out
- WHEN a POST arrives with any secret
- THEN the function returns a non-200 status (429 or 503) without proceeding
- AND no session is minted

---

### Requirement: Secret transport must not persist in URL

The `test-login` function MUST only accept the gate secret as a value in the HTTP
request body (`Content-Type: application/json`). The function MUST NOT read the secret
from URL query parameters. The calling client MUST transmit the secret via POST body,
ensuring it does not appear in browser history, `Referer` headers, or proxy/CDN logs.

#### Scenario: Secret delivered via POST body — accepted

- GIVEN the feature is configured and the rate limit is not exceeded
- WHEN a POST arrives with `{ "secret": "<value>" }` in the JSON body
- THEN the function reads the secret from the body and proceeds with comparison

#### Scenario: Secret absent from body — rejected

- GIVEN a POST arrives with an empty body or a body that does not include `secret`
- WHEN the function processes the request
- THEN it returns HTTP 401 without minting a session

#### Scenario: Secret not read from URL — historical leak prevented

- GIVEN a GET or POST request that carries the secret only as `?secret=<value>` in the URL
- WHEN the function processes the request
- THEN it does NOT extract the secret from query parameters
- AND returns HTTP 401 (no body secret present)

---

### Requirement: Constant-time secret comparison without length leak

The function MUST compare the submitted secret to the expected secret in a way that
reveals neither the secret value nor its length through response timing. The comparison
MUST NOT return early based on string length before performing the constant-time loop.
Both inputs MUST be normalized to a fixed-length representation (e.g., hash both sides)
before comparison.

#### Scenario: Wrong-length secret — no early return

- GIVEN the expected secret is N characters long
- WHEN a secret of a different length is submitted
- THEN the comparison takes the same observable time as a full-length mismatch
- AND returns HTTP 401

#### Scenario: Correct secret — comparison succeeds in constant time

- GIVEN the submitted secret equals the expected secret in value
- WHEN the comparison runs
- THEN the function returns HTTP 200 with session tokens
- AND no timing difference distinguishes this from a full-length wrong-value attempt

---

### Requirement: CORS scoped to known origins

The function MUST NOT set `Access-Control-Allow-Origin: *`. The allowed origin MUST be
restricted to the deployed app origin(s) (production and any legitimate preview/staging
origins). If a wildcard is explicitly accepted, a written rationale MUST be present in
the function source as a comment, and it MUST be reviewed before production deployment.

#### Scenario: Request from the configured allowed origin

- GIVEN CORS is set to the production app origin
- WHEN a browser preflight (OPTIONS) or POST arrives from that origin
- THEN the function returns the correct `Access-Control-Allow-Origin` header matching the request origin

#### Scenario: Request from an unlisted origin — blocked by browser

- GIVEN CORS is scoped to specific origins and a request arrives from an unknown origin
- WHEN the browser enforces CORS
- THEN the browser blocks the response (the function itself may still process it, but no token is usable cross-origin)

---

### Requirement: Fail closed when env is not configured

The function MUST return HTTP 403 without attempting secret comparison or session minting
when `TEST_LOGIN_SECRET`, `TEST_LOGIN_EMAIL`, or `TEST_LOGIN_PASSWORD` are absent from
the function environment. This is existing behavior that MUST be preserved.

#### Scenario: Missing env vars — feature disabled

- GIVEN one or more of the three required env vars are unset
- WHEN any POST arrives
- THEN the function returns HTTP 403 with `{ "error": "Acceso rápido no disponible" }`
- AND no comparison or sign-in is attempted
