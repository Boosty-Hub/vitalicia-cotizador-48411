---
name: rms-policy-flow
description: The RMS policy-activation flow — the core business path of the Vitalicia app. Load when working on Activar*Poliza*Page, the rms-create-policy edge function, polizas_activas, or the public /factura and /carnet document pages.
---

# RMS policy activation (core business flow)

Activating a policy is THE central flow. An `Activar*Poliza*Page` collects data and invokes the
`rms-create-policy` Edge Function, which calls the external **RMS** insurer API and persists the
result in `polizas_activas`. Public document pages then render the policy.

## The path

1. **Activation page** (`src/pages/Activar*Poliza*Page.tsx`) — collects vehicle + insured data,
   uploads supporting documents (their URLs land in `polizas_activas.*_url` columns).
2. **Edge function `rms-create-policy`** (public, `verify_jwt = false`, in
   `supabase/functions/rms-create-policy/index.ts`):
   - Reads `{ polizaId, formData, tipoFormulario }` from the request body.
   - Calls the RMS API at `api.rms40.com` with **Basic auth + `X-API-KEY`**, using secrets
     `RMS_API_KEY`, `RMS_API_USER`, `RMS_API_PASSWORD` from `Deno.env.get(...)`.
   - Uses a service-role Supabase client to write the result back.
3. **Persistence** — `polizas_activas` stores the RMS request fields (`c_*`, `n_*`, `f_*`, `s_*`,
   `cd_*`), the response in `api_recibos`/`api_coberturas` (jsonb) plus `api_status` / `api_message`,
   and the document URLs.
4. **Public documents** — `/factura/:polizaId` (`FacturaPublicaPage`) and `/carnet/:polizaId`
   (`CarnetPublicoPage`) render policy docs. PDFs are generated **client-side** with
   `jspdf` + `html2canvas` + `html2pdf.js`. (Per project memory: carnet/factura PDF generation is a
   manual admin-button action — carnet uses native print, factura uses html2canvas.)

## When working here

- Validate `api_status` / `api_message` after the RMS call; surface failures to the user in Spanish.
- Never expose `RMS_API_*` or the service-role key to the browser — they live only in function env.
- The standalone quoters in `src/components/quoters/` use MOCK data. The REAL path is the
  `Cotizar*Page` + `Activar*Poliza*Page` pages backed by Supabase/RMS. Don't confuse them.
- The `board_cod_*` tables hold the RMS catalog codes (marca, modelo, estado, color, sexo, ...) used
  to fill the `c_cd_*` request fields.
