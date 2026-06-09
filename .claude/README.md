# .claude/ — project workspace config for Vitalicia cotizador

Project-specific Claude Code configuration so the team can develop this app consistently.
Everything here is committed and shared.

    .claude/
    ├── settings.json     # registers the hooks (this is what makes hooks fire)
    ├── agents/           # custom subagents (specialized roles)
    ├── commands/         # slash commands (/lint-build, /new-route, ...)
    ├── hooks/            # event scripts (DB connection check, generated-file guard)
    └── skills/           # auto-loaded knowledge packs (Supabase, two-factories, RMS)

## How each folder works

| Folder | File type | Activation |
|--------|-----------|------------|
| agents/ | *.md (frontmatter + system prompt) | Invoked on demand as subagents |
| commands/ | *.md (prompt body) | Typed as /name |
| skills/ | <name>/SKILL.md | Auto-loaded when the description matches the task |
| hooks/ | executable scripts | ONLY when registered in settings.json |

> A `.md` in hooks/ does nothing. Hooks are scripts wired up in settings.json. See hooks/README.md.

## Agents

- **supabase-specialist** — migrations, Edge Functions, RLS, RPCs; knows the live schema and the
  Management-API-only rule.
- **inventory-pricing** — BERA/EMPIRE inventory + Empire pricing; enforces two-factory parity.
- **code-reviewer** — project-aware review (lint+build gate, secrets, parity, Spanish copy).

## Commands

| Command | Purpose |
|---------|---------|
| /lint-build | Run the de-facto test suite (ESLint + tsc build). |
| /new-route | Add a route to src/App.tsx following conventions. |
| /new-edge-function | Scaffold a Supabase Edge Function + config.toml entry. |
| /db-migration | Create a correctly-named migration with RLS (apply via Management API). |
| /check-twofactory | Audit BERA/EMPIRE parity. |

## Skills (auto-loaded by relevance)

- **supabase-vitalicia** — Supabase conventions + live schema inventory.
- **two-factories** — the BERA/EMPIRE mirror pattern and its column traps.
- **rms-policy-flow** — the core RMS policy-activation business flow.

## Project facts every contributor should know

- **No test framework.** Verification = `npm run lint` + `npm run build` (tsc). Use /lint-build.
- **node/npm not on PATH (this machine).** Prefix shells with
  `export PATH="/c/Program Files/nodejs:$PATH"`.
- **Do not edit** src/integrations/supabase/client.ts or types.ts — generated (a hook blocks it).
- **Two factories:** BERA and EMPIRE are mirror flows with DIFFERENT columns. Touch one, touch the
  other. See the two-factories skill.
- **Supabase admin comms go through the Management API** (token in the root CLAUDE.md), never from
  browser-shipped code.
- **UI copy is in Spanish.** Identifiers/comments stay in English.

> Note: `.claude/settings.json` sets `worktree.bgIsolation: none` for this repo so background
> Claude sessions write directly to the working copy (this scaffold was created that way). Remove
> that key if you want background sessions isolated in worktrees instead.
