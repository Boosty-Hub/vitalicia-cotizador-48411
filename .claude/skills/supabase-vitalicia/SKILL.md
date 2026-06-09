---
name: supabase-vitalicia
description: Supabase conventions and live schema for the Vitalicia cotizador. Load when working with the database, migrations, RLS, RPCs, Edge Functions, or any Supabase access. Covers the Management-API-only rule, project ref, table/RPC inventory, and the do-not-edit generated files.
---

# Supabase — Vitalicia cotizador

Backend: Supabase (Postgres, Auth, Deno Edge Functions, Storage). Project ref: `avlbdqqwldjteafmzwjb`.

## Non-negotiables

- **Do NOT edit** `src/integrations/supabase/client.ts` or `src/integrations/supabase/types.ts` —
  both are auto-generated (a PreToolUse hook blocks edits). Regenerate `types.ts` after schema changes.
- **All admin/CLI/server Supabase comms go through the Management API**, never browser code. The
  `SUPABASE_ACCESS_TOKEN` (broad-scope PAT) is in the root `CLAUDE.md`; treat it as a secret and
  never write it into a committed file.
- Frontend reads the **public anon key** (committed in `client.ts`) — that is expected and safe.
- Function **secrets** (`RMS_API_*`, service-role key) are read via `Deno.env.get(...)` from Supabase
  env, never the repo.

## Run SQL via Management API

    curl -X POST "https://api.supabase.com/v1/projects/avlbdqqwldjteafmzwjb/database/query" \
      -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"query":"select 1;"}'

Tip: put the query in a JSON payload file for anything with quotes.

## Live schema (verified)

Tables: admin_document_downloads, admin_settings, bd_bera, bd_empire, board_cod_ciudad, board_cod_color,
board_cod_edo_civil, board_cod_estado, board_cod_marca, board_cod_modelo, board_cod_municipio,
board_cod_pais, board_cod_sexo, board_cod_tipo_veh, board_cod_tlf, board_cod_version_api,
board_cod_version_moto, cod_act_economica, codigo_nacionalidad, polizas_activas, precios_empire,
profiles, user_roles.

- `polizas_activas` — issued policies; ~150 cols: `*_monday` mirror fields, RMS request fields
  (`c_*`, `n_*`, `f_*`, `s_*`, `cd_*`), document `*_url` fields, `api_recibos`/`api_coberturas` (jsonb),
  `api_status`, `api_message`.
- `bd_bera` / `bd_empire` — vehicle inventory (DIFFERENT columns; see the two-factories skill).
- `precios_empire` — Empire pricing; WARNING: has both `precio_venta` and `precio venta` (space).
- `board_cod_*` — RMS catalog/lookup codes (marca, modelo, estado, ciudad, color, sexo, etc.).
- `user_roles` (`role` is enum `app_role`), `profiles`, `admin_settings` (key/value).

RPCs: `has_role(_user_id uuid, _role app_role) -> boolean` (admin gate), `get_user_role(_user_id uuid)`,
`check_bera_duplicates(placas text[])`, `check_empire_duplicates(placas text[])`. Triggers:
`handle_new_user`, `update_updated_at_column`.

## Migrations

`supabase/migrations/YYYYMMDDHHMMSS_<uuid>.sql`. RLS is always included for new tables. See the
`/db-migration` command for the exact template and apply flow.

## Edge Functions

`supabase/functions/<name>/index.ts` (Deno). Register in `supabase/config.toml` with `verify_jwt`.
Public (false): rms-create-policy, validate-document. Auth (true): admin-create-user,
admin-delete-user, download-poliza-documents, send-poliza-docs. CORS is inlined per function (no
`_shared/`). Public funcs use one service-role client; auth funcs use anon-to-verify + service-role.
See the `/new-edge-function` command for scaffolding.
