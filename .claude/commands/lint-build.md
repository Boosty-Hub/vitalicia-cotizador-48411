---
description: Run the de-facto test suite — ESLint + production build (tsc). This project has no test framework.
allowed-tools: Bash
---

This project has **NO test framework** — `npm test` does not exist. Verification is ESLint plus a
TypeScript production build. Run both from the repo root, with node on PATH (this machine needs it):

1. `export PATH="/c/Program Files/nodejs:$PATH" && npm run lint`
2. `export PATH="/c/Program Files/nodejs:$PATH" && npm run build`

Then report, concisely:
- Lint: pass, or the specific errors/warnings (file:line).
- Build (tsc): pass, or the specific type errors (file:line).

If both pass, say so plainly. Do NOT auto-fix unrelated pre-existing lint noise — just report it,
unless I asked you to fix it.
