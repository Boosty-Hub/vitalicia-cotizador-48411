#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Supabase DB connection check (Vitalicia cotizador)
// ---------------------------------------------------------------------------
// Runs on SessionStart (registered in .claude/settings.json) and can be run
// by hand. Performs a REAL query against the project's Postgres DB through the
// Supabase REST API (PostgREST), verifying the full path:
//   network -> Supabase gateway -> PostgREST -> Postgres -> RLS.
//
// Fail-open: never blocks the session. Worst case it prints "FAILED" and exits.
//
// Manual run (this machine needs node on PATH first):
//   export PATH="/c/Program Files/nodejs:$PATH"
//   node .claude/hooks/db-connection-check.mjs
//
// Requires Node 18+ (global fetch). Override target via env if needed:
//   SUPABASE_URL, SUPABASE_ANON_KEY
// ---------------------------------------------------------------------------

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://avlbdqqwldjteafmzwjb.supabase.co";

// Public anon key — already committed in src/integrations/supabase/client.ts.
// Browser-safe key, NOT the service role or the Management API token.
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2bGJkcXF3bGRqdGVhZm16d2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjA0MDgsImV4cCI6MjA3NTkzNjQwOH0.-ihQH7W23x8MdXbvnLScFer2C0YSVEzCoqVKUjC-5hQ";

// board_cod_color has a public SELECT policy (RLS: USING (true)) — a cheap,
// real query that proves the DB answers without exposing sensitive data.
const PROBE = "/rest/v1/board_cod_color?select=id&limit=1";
const TIMEOUT_MS = 8000;

async function main() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const started = Date.now();

  try {
    const res = await fetch(SUPABASE_URL + PROBE, {
      method: "GET",
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    const body = await res.text().catch(() => ""); // drain so the socket releases
    const ms = Date.now() - started;

    if (res.ok) {
      console.log(
        `[supabase] DB connection OK — ${SUPABASE_URL} (${res.status}, ${ms}ms)`
      );
    } else {
      console.log(
        `[supabase] DB reachable but query failed — ${res.status} ${res.statusText} (${ms}ms) ${body.slice(0, 160)}`
      );
    }
  } catch (err) {
    const ms = Date.now() - started;
    const reason =
      err && err.name === "AbortError"
        ? `timeout after ${TIMEOUT_MS}ms`
        : (err && err.message) || String(err);
    console.log(
      `[supabase] DB connection FAILED — ${SUPABASE_URL} (${ms}ms): ${reason}`
    );
  } finally {
    clearTimeout(timer);
  }

  // Natural exit (no process.exit) to avoid a libuv assertion on Windows.
  process.exitCode = 0;
}

main();
