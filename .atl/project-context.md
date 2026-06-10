# Project Context — vitalicia-cotizador-48411

> SDD init artifact. Engram topic_key: sdd-init/vitalicia-cotizador-48411
> Generated: 2026-06-10 | Artifact store: engram (Engram MCP unavailable — file-based fallback active)

## Stack

- **Frontend**: Vite 5 + React 18 + TypeScript (non-strict) + shadcn/ui + Tailwind CSS 3 + Radix UI
- **State**: TanStack Query v5 (server state), useReducer/QuotationContext (wizard), AdminAuthContext (auth)
- **Routing**: React Router v6 (flat routes table in src/App.tsx)
- **Backend**: Supabase (Postgres, Auth, Edge Functions/Deno, Storage)
- **Build**: Vite 5 + @vitejs/plugin-react-swc
- **Path alias**: @ → src | Dev port: 8080

## Commands

```sh
npm run dev        # Vite dev server, port 8080
npm run build      # production build
npm run build:dev  # dev build (keeps lovable-tagger)
npm run lint       # eslint
npm run preview    # serve production build
```

**PATH gotcha (this machine)**: node/npm not on system PATH.
Prefix: `export PATH="/c/Program Files/nodejs:$PATH"`

## Architecture

SPA, two surfaces:
- **Public**: quoters, activators, /factura/:id, /carnet/:id, /carga-bera, /carga-empire
- **Admin**: /admin/* gated by ProtectedAdminRoute + has_role RPC (role: admin)

Two vehicle brands: **BERA** (bd_bera) and **EMPIRE** (bd_empire) — own tables, upload pages, duplicate-check RPCs.
External insurer: **RMS** (api.rms40.com) via rms-create-policy Edge Function.
PDF generation: client-side via jspdf + html2canvas + html2pdf.js.

## Key Files

- src/App.tsx — route table (add routes above * catch-all)
- src/contexts/QuotationContext.tsx — health wizard state + per-step validation
- src/contexts/AdminAuthContext.tsx — admin auth, signs out if no admin role
- src/integrations/supabase/client.ts — AUTO-GENERATED, do not edit
- src/integrations/supabase/types.ts — DB types (auto-generated)
- src/lib/utils.ts — cn() | src/lib/priceUtils.ts | src/lib/formValidation.ts
- supabase/functions/ — Edge Functions (Deno)
- supabase/migrations/ — DB migrations

## TypeScript Conventions

- strict: false, noImplicitAny: false, strictNullChecks: false
- noUnusedLocals: false, noUnusedParameters: false
- ESLint: @typescript-eslint/no-unused-vars off
- shadcn/ui primitives in src/components/ui/ (generated — prefer composing over hand-rolling)

## Testing Capabilities

| Layer | Available | Tool |
|---|---|---|
| Unit | NO | — |
| Integration | NO | — |
| E2E | NO | — |
| Coverage | NO | — |
| Linter | YES | eslint (npm run lint) |
| Type checker | YES | tsc (via build) |
| Formatter | NO | — |

**strict_tdd: false** — No test runner. npm test does NOT exist.

## Supabase

Edge Functions: rms-create-policy, validate-document (public, verify_jwt=false);
admin-create-user, admin-delete-user, download-poliza-documents (verify_jwt=true);
generate-carnet-poliza, generate-factura-poliza.
JWT: supabase/config.toml | Secrets: Supabase env only, never repo.
Key tables: polizas_activas, bd_bera, bd_empire, precios_empire, board_cod_* (RMS catalogs), profiles, user_roles, admin_settings.
RPCs: has_role, get_user_role, check_bera_duplicates, check_empire_duplicates.

## OpenSpec Directory (existing)

openspec/ is present — past changes used openspec artifact store.
Archived changes: harden-test-login-auth, inventario-duplicados-popup, inventario-edit-livesearch.
Active openspec changes (unarchived): inventario-edit-livesearch (verify-report present), moto-edit-dialog spec in openspec/specs/.
Note: artifact store for new changes is engram; openspec/ is retained for historical reference.
