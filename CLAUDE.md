# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Web app for **Vitalicia**, a Venezuelan insurance broker. Customers quote and activate
insurance policies (auto/RCV, health, travel, home, life, business); staff manage policies,
vehicle inventory, pricing and users through an admin area. Bootstrapped with Lovable.

Stack: Vite + React 18 + TypeScript + shadcn/ui + Tailwind on the front end; **Supabase**
(Postgres, Auth, Edge Functions, Storage) as the backend. UI copy is in Spanish.

## Commands

```sh
npm run dev        # Vite dev server on port 8080 (auto-bumps to 8081+ if taken)
npm run build      # production build
npm run build:dev  # build with development mode (keeps lovable-tagger)
npm run lint       # eslint
npm run preview    # serve the production build
```

There is **no test framework** configured — do not assume `npm test` exists.

### Local environment gotcha (this machine)

`node`/`npm` are not on the system PATH here. Prefix shell sessions with:
`export PATH="/c/Program Files/nodejs:$PATH"`. Without it, `npm install` fails because
esbuild's postinstall spawns `node` via cmd.exe and can't find it.

## Architecture

Single-page app, routed in `src/App.tsx` (one flat `<Routes>` table — add new routes there,
above the `*` catch-all). Two surfaces:

- **Public**: marketing pages (`/salud`, `/auto`, …), quote flows (`Cotizar*Page`), policy
  activation (`Activar*Poliza*Page`), and public document pages `/factura/:polizaId` and
  `/carnet/:polizaId`. The bulk-upload pages `/carga-bera` and `/carga-empire` are also public.
- **Admin** (`/admin/*`): gated by `ProtectedAdminRoute`, rendered inside `AdminLayout`.
  Manages policies, inventory, pricing, users, settings.

Path alias: `@` → `src` (configured in both `vite.config.ts` and tsconfig).

### State management

- **`QuotationContext`** (`src/contexts/QuotationContext.tsx`) — `useReducer` store for the
  multi-step health-insurance wizard (personal info, family members, plan, coverages, health
  declarations, documents, `currentStep`). Per-step validation (`isStepValid`, `getStepErrors`)
  lives in the context, not the components. Step UIs are in `src/components/quoters/steps/`.
- **`AdminAuthContext`** (`src/contexts/AdminAuthContext.tsx`) — wraps Supabase auth. Admin
  access is decided by the `has_role` RPC (role `admin`), not by being logged in. `signIn`
  signs the user back out if they lack the admin role.
- **TanStack Query** (`QueryClient` in `App.tsx`) for server/async state.

### Supabase

> **IMPORTANT — Supabase communication.** Always go through the Supabase **API / Management API**
> for any interaction with Supabase (migrations, project management, admin scripts, CLI), using
> this access token:
>
> ```
> SUPABASE_ACCESS_TOKEN=sbp_16ed33e839a606a5ec4729a5214a35e48cb9505e
> ```
>
> Use it for CLI/server-side/admin operations only — never reference it from browser-shipped
> app code. (This is a broad-scope Personal Access Token; rotate it from the Supabase dashboard
> if it is ever exposed.)

- Client: `src/integrations/supabase/client.ts` — **auto-generated, do not edit**; the URL and
  anon key are committed here. DB types: `src/integrations/supabase/types.ts` (also generated).
  Import as `import { supabase } from "@/integrations/supabase/client"`.
- **Edge Functions** (`supabase/functions/`, Deno): `rms-create-policy` and `validate-document`
  (public, `verify_jwt = false`), `admin-create-user` / `admin-delete-user` /
  `download-poliza-documents` (`verify_jwt = true`), `generate-carnet-poliza`,
  `generate-factura-poliza`. JWT settings live in `supabase/config.toml`. Function secrets
  (e.g. `RMS_API_KEY`, `RMS_API_USER`, `RMS_API_PASSWORD`) come from Supabase env, never the repo.
- **Migrations**: `supabase/migrations/`. Notable tables: `polizas_activas` (issued policies),
  `bd_bera` / `bd_empire` (vehicle inventory, see "two factories" below), `precios_empire`
  (pricing), `board_cod_*` (RMS catalog/lookup codes — marca, modelo, estado, ciudad, etc.),
  `profiles`, `user_roles`, `admin_settings`. RPCs: `has_role`, `get_user_role`,
  `check_bera_duplicates`, `check_empire_duplicates`.

### External insurer API (RMS)

Policy activation is the core business flow: an `Activar*Poliza*Page` collects data and invokes
the `rms-create-policy` edge function, which calls the external **RMS** insurer API
(`api.rms40.com`) with Basic auth + `X-API-KEY`, then persists the result in `polizas_activas`.
The public `/factura/:id` and `/carnet/:id` pages then render policy documents, generating PDFs
client-side (`jspdf`, `html2pdf.js`, `html2canvas`).

### Two vehicle factories: BERA and EMPIRE

Auto inventory and pricing are split across two brands, **Bera** and **Empire**, each with its
own table (`bd_bera` / `bd_empire`), bulk-upload page (`/carga-bera`, `/carga-empire`, plus admin
inventory pages), and duplicate-check RPC. XLSX uploads are parsed with the `xlsx` package. When
touching inventory/pricing, expect to handle both variants.

> Note: the standalone quoter components in `src/components/quoters/` (e.g. `VehicleQuoter`) use
> **mock** quote data. The real, Supabase/RMS-backed flows are the `Cotizar*Page` and
> `Activar*Poliza*Page` pages — don't mistake the mock quoters for the production path.

## Conventions

- TypeScript is **non-strict** (`strict: false`, `noImplicitAny: false`, unused locals/params
  allowed); eslint has `@typescript-eslint/no-unused-vars` off. Match the surrounding loose style.
- shadcn/ui primitives live in `src/components/ui/` (generated; config in `components.json`).
  Prefer composing these over hand-rolling components.
- Shared helpers: `src/lib/` (`utils.ts` `cn()`, `priceUtils.ts`, `formValidation.ts`),
  `src/utils/` (`versionApi.ts`, `refreshPolizaConfig.ts`).

## Avances (auto-generado por el git hook post-commit)

- 2026-06-09 `659385c` — feat(admin): login rápido seguro vía Edge Function test-login
