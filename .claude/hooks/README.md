# Hooks

A hook is a **script that runs on a Claude Code event** — NOT a markdown file. A `.md` here would
do nothing. Hooks only fire when **registered in `.claude/settings.json`**, which they already are.

## Registered hooks

| Event | Script | What it does |
|-------|--------|--------------|
| SessionStart | db-connection-check.mjs | Runs a real query against the Supabase DB via the REST API and prints OK / FAILED. Read-only, fail-open. |
| PreToolUse (Edit/Write) | protect-generated-files.mjs | Blocks hand-edits to the auto-generated client.ts / types.ts. |

Both are **fail-open**: if anything goes wrong they let the session/edit proceed. Both are verified
working on this machine.

## Git hooks (a different beast — NOT Claude Code hooks)

This folder also holds a **git hook**, run by git itself (not Claude), wired via `core.hooksPath`:

| Hook | Script | What it does |
|------|--------|--------------|
| git post-commit | post-commit | On every commit, appends `- <date> \`<hash>\` — <subject>` to an `## Avances` section at the bottom of `CLAUDE.md`. |

**Activate once per clone** (it's local config, not versioned):

    git config core.hooksPath .claude/hooks

Notes / caveats:
- **Deterministic**: it logs the commit SUBJECT LINE. The "avance" is only as good as your commit message. It does NOT summarize work intelligently.
- **Leaves CLAUDE.md modified (unstaged)** right after a commit; that entry rides along in your next commit.
- Skips merge commits to avoid noise.
- Setting `core.hooksPath` makes git use THIS folder for all git hooks (it stops reading `.git/hooks`). Only the sample hooks lived there, so nothing active is lost.
- It appends to `CLAUDE.md` (the instructions file) by explicit choice. If the log bloats it, move the target to `CHANGELOG.md`.

## This machine needs node on PATH

Hooks launch via `node ...`. On this machine node/npm are not on the system PATH, so hooks won't
fire until node is reachable. Fix per shell:

    export PATH="/c/Program Files/nodejs:$PATH"

If node isn't found, the hooks just no-op (DB check skipped, guard allows the edit). They never
break your session.

## Run the DB connection test manually

    export PATH="/c/Program Files/nodejs:$PATH"
    node .claude/hooks/db-connection-check.mjs

Expected on success:

    [supabase] DB connection OK — https://avlbdqqwldjteafmzwjb.supabase.co (200, 180ms)

It uses the public anon key (already committed in src/integrations/supabase/client.ts) and queries
board_cod_color, a table with a public-read RLS policy. It never touches the service-role key or the
Management API token.

## Disable a hook

Remove its block from `.claude/settings.json`. Changes take effect on the next session.
