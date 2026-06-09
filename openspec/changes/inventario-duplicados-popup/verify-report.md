# Verification Report: inventario-duplicados-popup

verdict: PASS_WITH_WARNINGS
mode: openspec
updated: "2026-06-09"

---

## Completeness

| Task | State | Evidence |
|---|---|---|
| T-01 DuplicateWarningDialog | Complete | File exists, read-only, no Supabase import, no destructive actions |
| T-02 BERA page wiring | Complete | State + mount effect + config + dialog render present |
| T-03 EMPIRE page wiring | Complete | Mirror with EMPIRE schema, independent key |
| T-04 Verification gate | Complete | lint + build run; results below |

## Build / Lint Evidence

- `npm run build`: exit 0, 3534 modules transformed, no TS errors (chunk-size warning is pre-existing).
- `npm run lint`: 182 errors / 35 warnings repo-wide, all pre-existing.
  - DuplicateWarningDialog.tsx: ZERO findings.
  - AdminInventarioBeraPage.tsx: only pre-existing (L78 any, L123 any, L258 fetchData dep on the EXISTING effect).
  - AdminInventarioEmpirePage.tsx: only pre-existing (L72/L112/L864 any, L247 fetchData dep on the EXISTING effect).
  - New mount effects (BERA L238, EMPIRE L227) have deps [] and add NO new exhaustive-deps warning.

## Spec Compliance

| Requirement | Status |
|---|---|
| Popup on mount iff duplicates exist (`.eq('es_duplicado', true)`, not `.neq(false)`) | PASS |
| Read-only list, max 50, "hay N más" overflow legend, count:'exact' + limit(50) | PASS |
| Per-brand column sets, no drift (BERA anio_modelo/serial_chasis; EMPIRE anio/serial_carroceria/version) | PASS |
| "Ver duplicados" sets filterDuplicados="duplicados" + resets page + closes | PASS |
| "Entendido" dismisses without state change | PASS |
| Session suppression per-page key (dup-warning-bera / dup-warning-empire), read before query | PASS |
| Variant-driven, no hardcoded columns inside shared component | PARTIAL — see WARNING-1 |
| Spanish UI copy throughout | PASS |
| No upload-flow RPC calls (check_*_duplicates) | PASS |
| Build and lint pass with no new errors | PASS |

## Two-Factory Parity

- BERA: bd_bera, anio_modelo, serial_chasis, dup-warning-bera. Confirmed.
- EMPIRE: bd_empire, anio, serial_carroceria, version, dup-warning-empire. NO BERA columns leaked. Confirmed.
- Mount effect select lists match each table's real schema. No drift.

## Issues

### WARNING-1 — Shared dialog leaks a BERA column literal for the year header
`src/components/admin/DuplicateWarningDialog.tsx:74`
```
<TableHead>{columns.yearKey === "anio_modelo" ? "Año modelo" : "Año"}</TableHead>
```
The shared component compares against the brand-specific string `"anio_modelo"` to pick
the year header label. Spec "Component is variant-driven with no hardcoded columns" requires
the shared file to be column-agnostic; verify-check #1 requires ZERO occurrences of brand
column names. This works correctly today (label renders right for both brands) but is the
exact drift vector the design tried to eliminate: if EMPIRE's yearKey ever changed, or a
third brand reused "Año modelo", the label would silently break.

Root cause: design's `DuplicateColumnsConfig` defined `serialLabel` but NO `yearLabel`,
so the implementer hardcoded the year-label branch. Functionally correct, architecturally
a contract gap.

Recommended fix (non-blocking): add `yearLabel: string` to `DuplicateColumnsConfig`
(BERA "Año modelo", EMPIRE "Año") and render `{columns.yearLabel}`. Removes the last brand
literal from the shared file.

## Design Coherence

| Decision | Honored |
|---|---|
| Config object, no variant switch in dialog | Mostly — one residual literal (WARNING-1) |
| Direct .eq('es_duplicado',true) query | Yes |
| count:'exact' + limit(50) | Yes |
| Mount-only effect, NOT folded into fetchData | Yes — separate effect, deps [] |
| sessionStorage per-page key, read before query | Yes |
| Open only if count > 0 | Yes (`if (!count) return`) |

Note: the `variant` prop is declared and passed but unused inside the dialog (label is driven
by yearKey instead). Harmless; fixing WARNING-1 could let `variant` drive the label instead.

## Verdict

PASS WITH WARNINGS — All spec requirements are functionally satisfied; build and lint clean
with no new errors. One non-blocking architectural WARNING: a residual brand-column literal
in the shared dialog. No CRITICAL issues. Safe to archive; WARNING-1 may be addressed as a
follow-up.
